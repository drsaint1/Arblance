// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SkillBadges.sol";
import "./JobBadges.sol";

/**
 * @title FreelanceMarketplace
 * @dev Main contract for decentralized freelance marketplace with escrow
 */
contract FreelanceMarketplace is ReentrancyGuard {
    uint256 private _jobIdCounter;

    SkillBadges public skillBadges;
    JobBadges public jobBadges;

    enum JobStatus {
        Open,
        InProgress,
        UnderReview,
        Completed,
        Disputed,
        Cancelled
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        string title;
        string description;
        uint256 budget;
        uint256 escrowAmount;
        address paymentToken; // address(0) for ETH, otherwise ERC20 token address
        SkillBadges.SkillCategory requiredSkill;
        SkillBadges.BadgeTier minimumTier; // Minimum tier required to apply
        JobStatus status;
        uint256 createdAt;
        uint256 deadline;
        uint256 deliverableSubmittedAt; // Timestamp when deliverable was submitted
        string deliverableHash; // IPFS hash of deliverables
        address referredBy; // Address that referred this job
    }

    struct Application {
        address freelancer;
        string proposal;
        uint256 timestamp;
        bool accepted;
    }

    // Mapping from job ID to job details
    mapping(uint256 => Job) public jobs;

    // Mapping from job ID to applications
    mapping(uint256 => Application[]) public jobApplications;

    // Mapping to track applied jobs per freelancer
    mapping(address => uint256[]) public freelancerApplications;

    // Mapping to track posted jobs per client
    mapping(address => uint256[]) public clientJobs;

    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFee = 250;
    address public platformWallet;

    // Anti-ghosting: Auto-release period (7 days)
    uint256 public constant AUTO_RELEASE_PERIOD = 7 days;
    uint256 public constant GHOSTING_PENALTY = 300; // 3% in basis points

    // Referral system
    uint256 public constant REFERRAL_REWARD = 100; // 1% in basis points
    uint256 public constant MAX_REFERRAL_JOBS = 5; // Reward for first 5 jobs

    mapping(address => address) public userReferrers; // user => referrer
    mapping(address => uint256) public referralJobCount; // referrer => jobs completed by their referrals
    mapping(address => uint256) public referralEarnings; // referrer => total earnings from referrals

    // Supported stablecoins (can be expanded)
    mapping(address => bool) public supportedTokens;

    // Events
    event JobPosted(
        uint256 indexed jobId,
        address indexed client,
        string title,
        uint256 budget,
        SkillBadges.SkillCategory requiredSkill
    );

    event ApplicationSubmitted(
        uint256 indexed jobId,
        address indexed freelancer,
        string proposal
    );

    event ApplicationAccepted(
        uint256 indexed jobId,
        address indexed freelancer
    );

    event JobStarted(uint256 indexed jobId, address indexed freelancer);

    event DeliverableSubmitted(
        uint256 indexed jobId,
        string deliverableHash
    );

    event JobCompleted(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    event JobDisputed(uint256 indexed jobId);

    event DisputeResolved(
        uint256 indexed jobId,
        bool inFavorOfFreelancer
    );

    event JobCancelled(uint256 indexed jobId);

    event AutoReleaseClaimed(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount,
        uint256 penalty
    );

    event ReferralRewardPaid(
        address indexed referrer,
        address indexed referee,
        uint256 indexed jobId,
        uint256 amount
    );

    event TokenAdded(address indexed token, string symbol);
    event TokenRemoved(address indexed token);

    modifier onlyClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "Only client can call this");
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        require(
            jobs[jobId].freelancer == msg.sender,
            "Only assigned freelancer can call this"
        );
        _;
    }

    constructor(address _skillBadges, address _jobBadges) {
        skillBadges = SkillBadges(_skillBadges);
        jobBadges = JobBadges(_jobBadges);
        platformWallet = msg.sender;

        // ETH is always supported (represented by address(0))
        supportedTokens[address(0)] = true;
    }

    /**
     * @dev Add a supported stablecoin
     * @param token Token contract address
     */
    function addSupportedToken(address token) public {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token, "TOKEN");
    }

    /**
     * @dev Remove a supported stablecoin
     * @param token Token contract address
     */
    function removeSupportedToken(address token) public {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(token != address(0), "Cannot remove ETH");
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    /**
     * @dev Set referrer for a user (can only be set once)
     * @param referrer Address of the referrer
     */
    function setReferrer(address referrer) public {
        require(userReferrers[msg.sender] == address(0), "Referrer already set");
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        userReferrers[msg.sender] = referrer;
    }

    /**
     * @dev Post a new job with ETH
     * @param title Job title
     * @param description Job description
     * @param budget Job budget in wei
     * @param requiredSkill Required skill category
     * @param minimumTier Minimum badge tier required (0=BRONZE, 1=SILVER, etc.)
     * @param deadline Job deadline timestamp
     */
    function postJob(
        string memory title,
        string memory description,
        uint256 budget,
        SkillBadges.SkillCategory requiredSkill,
        SkillBadges.BadgeTier minimumTier,
        uint256 deadline
    ) public payable returns (uint256) {
        require(msg.value == budget, "Must send exact budget amount");
        require(budget > 0, "Budget must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");

        return _createJob(
            title,
            description,
            budget,
            address(0), // ETH payment
            requiredSkill,
            minimumTier,
            deadline
        );
    }

    /**
     * @dev Post a new job with stablecoin payment
     * @param title Job title
     * @param description Job description
     * @param budget Job budget in token amount
     * @param paymentToken ERC20 token address (USDC, USDT, DAI, etc.)
     * @param requiredSkill Required skill category
     * @param minimumTier Minimum badge tier required
     * @param deadline Job deadline timestamp
     */
    function postJobWithToken(
        string memory title,
        string memory description,
        uint256 budget,
        address paymentToken,
        SkillBadges.SkillCategory requiredSkill,
        SkillBadges.BadgeTier minimumTier,
        uint256 deadline
    ) public returns (uint256) {
        require(supportedTokens[paymentToken], "Token not supported");
        require(paymentToken != address(0), "Use postJob for ETH");
        require(budget > 0, "Budget must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");

        // Transfer tokens to escrow
        IERC20(paymentToken).transferFrom(msg.sender, address(this), budget);

        return _createJob(
            title,
            description,
            budget,
            paymentToken,
            requiredSkill,
            minimumTier,
            deadline
        );
    }

    /**
     * @dev Internal function to create a job
     */
    function _createJob(
        string memory title,
        string memory description,
        uint256 budget,
        address paymentToken,
        SkillBadges.SkillCategory requiredSkill,
        SkillBadges.BadgeTier minimumTier,
        uint256 deadline
    ) internal returns (uint256) {
        uint256 newJobId = ++_jobIdCounter;

        jobs[newJobId] = Job({
            id: newJobId,
            client: msg.sender,
            freelancer: address(0),
            title: title,
            description: description,
            budget: budget,
            escrowAmount: budget,
            paymentToken: paymentToken,
            requiredSkill: requiredSkill,
            minimumTier: minimumTier,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            deadline: deadline,
            deliverableSubmittedAt: 0,
            deliverableHash: "",
            referredBy: userReferrers[msg.sender] // Track if client was referred
        });

        clientJobs[msg.sender].push(newJobId);

        emit JobPosted(newJobId, msg.sender, title, budget, requiredSkill);

        return newJobId;
    }

    /**
     * @dev Apply for a job with tier requirement check
     * @param jobId ID of the job
     * @param proposal Freelancer's proposal
     */
    function applyForJob(uint256 jobId, string memory proposal) public {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Job is not open");
        require(
            skillBadges.userHasSkill(msg.sender, job.requiredSkill),
            "You don't have the required skill badge"
        );

        // Check if user meets minimum tier requirement
        SkillBadges.BadgeTier userTier = skillBadges.getUserSkillTier(
            msg.sender,
            job.requiredSkill
        );
        require(
            userTier >= job.minimumTier,
            "Your skill badge tier is below the minimum required"
        );

        // Check if already applied
        Application[] storage applications = jobApplications[jobId];
        for (uint256 i = 0; i < applications.length; i++) {
            require(
                applications[i].freelancer != msg.sender,
                "Already applied to this job"
            );
        }

        applications.push(
            Application({
                freelancer: msg.sender,
                proposal: proposal,
                timestamp: block.timestamp,
                accepted: false
            })
        );

        freelancerApplications[msg.sender].push(jobId);

        emit ApplicationSubmitted(jobId, msg.sender, proposal);
    }

    /**
     * @dev Accept an application
     * @param jobId ID of the job
     * @param applicationIndex Index of the application to accept
     */
    function acceptApplication(uint256 jobId, uint256 applicationIndex)
        public
        onlyClient(jobId)
    {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Job is not open");

        Application[] storage applications = jobApplications[jobId];
        require(
            applicationIndex < applications.length,
            "Invalid application index"
        );

        Application storage application = applications[applicationIndex];
        application.accepted = true;

        job.freelancer = application.freelancer;
        job.status = JobStatus.InProgress;

        emit ApplicationAccepted(jobId, application.freelancer);
        emit JobStarted(jobId, application.freelancer);
    }

    /**
     * @dev Submit deliverables
     * @param jobId ID of the job
     * @param deliverableHash IPFS hash of deliverables
     */
    function submitDeliverable(uint256 jobId, string memory deliverableHash)
        public
        onlyFreelancer(jobId)
    {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.InProgress,
            "Job is not in progress"
        );

        job.deliverableHash = deliverableHash;
        job.deliverableSubmittedAt = block.timestamp; // Track submission time for anti-ghosting
        job.status = JobStatus.UnderReview;

        emit DeliverableSubmitted(jobId, deliverableHash);
    }

    /**
     * @dev Approve deliverable and complete job (supports both ETH and tokens)
     * @param jobId ID of the job
     * @param rating Rating for the freelancer (1-5)
     * @param review Written review
     */
    function approveDeliverable(
        uint256 jobId,
        uint8 rating,
        string memory review
    ) public onlyClient(jobId) nonReentrant {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.UnderReview,
            "Job is not under review"
        );
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        job.status = JobStatus.Completed;

        // Calculate fees and payments
        uint256 platformFeeAmount = (job.escrowAmount * platformFee) / 10000;
        uint256 freelancerPayment = job.escrowAmount - platformFeeAmount;

        // Calculate and pay referral reward if applicable
        uint256 referralAmount = _payReferralReward(job, freelancerPayment);
        freelancerPayment -= referralAmount;

        // Transfer funds (ETH or ERC20)
        if (job.paymentToken == address(0)) {
            // ETH payment
            (bool successPlatform, ) = platformWallet.call{value: platformFeeAmount}("");
            require(successPlatform, "Platform fee transfer failed");

            (bool successFreelancer, ) = job.freelancer.call{value: freelancerPayment}("");
            require(successFreelancer, "Freelancer payment failed");
        } else {
            // ERC20 token payment
            IERC20 token = IERC20(job.paymentToken);
            require(token.transfer(platformWallet, platformFeeAmount), "Platform fee transfer failed");
            require(token.transfer(job.freelancer, freelancerPayment), "Freelancer payment failed");
        }

        // Mint job completion badges
        jobBadges.mintJobBadge(
            job.freelancer,
            jobId,
            JobBadges.UserRole.Freelancer,
            freelancerPayment,
            rating,
            review,
            ""
        );

        jobBadges.mintJobBadge(
            job.client,
            jobId,
            JobBadges.UserRole.Client,
            job.budget,
            5, // Default rating for client
            "Job completed successfully",
            ""
        );

        // Record job completion in skill badge to enable tier upgrades
        skillBadges.recordJobInSkill(
            job.freelancer,
            job.requiredSkill,
            freelancerPayment,
            rating
        );

        emit JobCompleted(jobId, job.freelancer, freelancerPayment);
    }

    /**
     * @dev Internal function to pay referral rewards
     * @param job The job being completed
     * @param freelancerPayment Amount freelancer is receiving
     * @return Amount paid to referrer
     */
    function _payReferralReward(Job storage job, uint256 freelancerPayment)
        internal
        returns (uint256)
    {
        address referrer = userReferrers[job.freelancer];
        if (referrer == address(0)) {
            return 0; // No referrer
        }

        // Check if this is within first 5 jobs for this referrer
        uint256 referrerJobCount = referralJobCount[referrer];
        if (referrerJobCount >= MAX_REFERRAL_JOBS) {
            return 0; // Already paid for 5 jobs
        }

        // Calculate referral reward (1%)
        uint256 rewardAmount = (freelancerPayment * REFERRAL_REWARD) / 10000;

        // Transfer reward
        if (job.paymentToken == address(0)) {
            (bool success, ) = referrer.call{value: rewardAmount}("");
            require(success, "Referral reward transfer failed");
        } else {
            IERC20 token = IERC20(job.paymentToken);
            require(token.transfer(referrer, rewardAmount), "Referral reward transfer failed");
        }

        // Update referral tracking
        referralJobCount[referrer]++;
        referralEarnings[referrer] += rewardAmount;

        emit ReferralRewardPaid(referrer, job.freelancer, job.id, rewardAmount);

        return rewardAmount;
    }

    /**
     * @dev Anti-ghosting: Freelancer can claim payment after 7 days if client doesn't respond
     * @param jobId ID of the job
     */
    function claimAfterTimeout(uint256 jobId) public onlyFreelancer(jobId) nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.UnderReview, "Job is not under review");
        require(job.deliverableSubmittedAt > 0, "Deliverable not submitted");
        require(
            block.timestamp >= job.deliverableSubmittedAt + AUTO_RELEASE_PERIOD,
            "Timeout period not reached"
        );

        job.status = JobStatus.Completed;

        // Calculate penalty (3% goes to freelancer, rest to freelancer)
        uint256 ghostingPenaltyAmount = (job.escrowAmount * GHOSTING_PENALTY) / 10000;
        uint256 platformFeeAmount = (job.escrowAmount * platformFee) / 10000;
        uint256 freelancerPayment = job.escrowAmount - platformFeeAmount + ghostingPenaltyAmount;

        // Client lost their right to the ghosting penalty by not responding

        // Calculate and pay referral reward if applicable
        uint256 referralAmount = _payReferralReward(job, freelancerPayment);
        freelancerPayment -= referralAmount;

        // Transfer funds
        if (job.paymentToken == address(0)) {
            // ETH payment
            (bool successPlatform, ) = platformWallet.call{value: platformFeeAmount - ghostingPenaltyAmount}("");
            require(successPlatform, "Platform fee transfer failed");

            (bool successFreelancer, ) = job.freelancer.call{value: freelancerPayment}("");
            require(successFreelancer, "Freelancer payment failed");
        } else {
            // ERC20 token payment
            IERC20 token = IERC20(job.paymentToken);
            require(token.transfer(platformWallet, platformFeeAmount - ghostingPenaltyAmount), "Platform fee failed");
            require(token.transfer(job.freelancer, freelancerPayment), "Freelancer payment failed");
        }

        // Mint job completion badges (lower rating due to ghosting)
        jobBadges.mintJobBadge(
            job.freelancer,
            jobId,
            JobBadges.UserRole.Freelancer,
            freelancerPayment,
            5, // Full rating since freelancer delivered
            "Auto-released after timeout",
            ""
        );

        jobBadges.mintJobBadge(
            job.client,
            jobId,
            JobBadges.UserRole.Client,
            job.budget,
            2, // Low rating for ghosting
            "Client did not respond within 7 days",
            ""
        );

        // Record job completion in skill badge
        skillBadges.recordJobInSkill(
            job.freelancer,
            job.requiredSkill,
            freelancerPayment,
            5
        );

        emit AutoReleaseClaimed(jobId, job.freelancer, freelancerPayment, ghostingPenaltyAmount);
        emit JobCompleted(jobId, job.freelancer, freelancerPayment);
    }

    /**
     * @dev Check if auto-release is available for a job
     * @param jobId ID of the job
     * @return bool Whether freelancer can claim auto-release
     */
    function canClaimAutoRelease(uint256 jobId) public view returns (bool) {
        Job storage job = jobs[jobId];
        return (
            job.status == JobStatus.UnderReview &&
            job.deliverableSubmittedAt > 0 &&
            block.timestamp >= job.deliverableSubmittedAt + AUTO_RELEASE_PERIOD
        );
    }

    /**
     * @dev Get time remaining until auto-release is available
     * @param jobId ID of the job
     * @return uint256 Seconds until auto-release (0 if already available)
     */
    function timeUntilAutoRelease(uint256 jobId) public view returns (uint256) {
        Job storage job = jobs[jobId];
        if (job.deliverableSubmittedAt == 0) {
            return 0;
        }

        uint256 releaseTime = job.deliverableSubmittedAt + AUTO_RELEASE_PERIOD;
        if (block.timestamp >= releaseTime) {
            return 0;
        }

        return releaseTime - block.timestamp;
    }

    /**
     * @dev Raise a dispute
     * @param jobId ID of the job
     */
    function raiseDispute(uint256 jobId) public {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Only client or freelancer can raise dispute"
        );
        require(
            job.status == JobStatus.UnderReview ||
                job.status == JobStatus.InProgress,
            "Invalid job status for dispute"
        );

        job.status = JobStatus.Disputed;

        emit JobDisputed(jobId);
    }

    /**
     * @dev Resolve a dispute (only platform wallet)
     * @param jobId ID of the job
     * @param inFavorOfFreelancer Whether to resolve in favor of freelancer
     * @param freelancerPercentage Percentage to give to freelancer (0-100)
     */
    function resolveDispute(
        uint256 jobId,
        bool inFavorOfFreelancer,
        uint256 freelancerPercentage
    ) public nonReentrant {
        require(
            msg.sender == platformWallet,
            "Only platform can resolve disputes"
        );
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Job is not disputed");
        require(
            freelancerPercentage <= 100,
            "Percentage must be between 0 and 100"
        );

        job.status = JobStatus.Completed;

        uint256 freelancerAmount = (job.escrowAmount * freelancerPercentage) /
            100;
        uint256 clientRefund = job.escrowAmount - freelancerAmount;

        if (freelancerAmount > 0) {
            (bool success, ) = job.freelancer.call{value: freelancerAmount}("");
            require(success, "Freelancer payment failed");
        }

        if (clientRefund > 0) {
            (bool success, ) = job.client.call{value: clientRefund}("");
            require(success, "Client refund failed");
        }

        emit DisputeResolved(jobId, inFavorOfFreelancer);
    }

    /**
     * @dev Cancel a job (only if not started)
     * @param jobId ID of the job
     */
    function cancelJob(uint256 jobId) public onlyClient(jobId) nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "Can only cancel open jobs");

        job.status = JobStatus.Cancelled;

        // Refund client
        (bool success, ) = job.client.call{value: job.escrowAmount}("");
        require(success, "Refund failed");

        emit JobCancelled(jobId);
    }

    /**
     * @dev Get job applications
     * @param jobId ID of the job
     */
    function getJobApplications(uint256 jobId)
        public
        view
        returns (Application[] memory)
    {
        return jobApplications[jobId];
    }

    /**
     * @dev Get all jobs
     */
    function getAllJobs() public view returns (Job[] memory) {
        Job[] memory allJobs = new Job[](_jobIdCounter);
        for (uint256 i = 1; i <= _jobIdCounter; i++) {
            allJobs[i - 1] = jobs[i];
        }
        return allJobs;
    }

    /**
     * @dev Get open jobs
     */
    function getOpenJobs() public view returns (Job[] memory) {
        uint256 openCount = 0;
        for (uint256 i = 1; i <= _jobIdCounter; i++) {
            if (jobs[i].status == JobStatus.Open) {
                openCount++;
            }
        }

        Job[] memory openJobs = new Job[](openCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _jobIdCounter; i++) {
            if (jobs[i].status == JobStatus.Open) {
                openJobs[index] = jobs[i];
                index++;
            }
        }
        return openJobs;
    }

    /**
     * @dev Get client jobs
     * @param client Address of the client
     */
    function getClientJobs(address client)
        public
        view
        returns (uint256[] memory)
    {
        return clientJobs[client];
    }

    /**
     * @dev Get freelancer applications
     * @param freelancer Address of the freelancer
     */
    function getFreelancerApplications(address freelancer)
        public
        view
        returns (uint256[] memory)
    {
        return freelancerApplications[freelancer];
    }

    /**
     * @dev Update platform fee
     * @param newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) public {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Update platform wallet
     * @param newWallet New platform wallet address
     */
    function updatePlatformWallet(address newWallet) public {
        require(msg.sender == platformWallet, "Only platform wallet");
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }
}
