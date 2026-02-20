// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DisputeResolution
 * @dev Handles dispute resolution for freelance jobs with admin arbitration
 */
contract DisputeResolution is ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum DisputeStatus {
        Open,
        UnderReview,
        Resolved,
        Cancelled
    }

    enum DisputeWinner {
        None,
        Client,
        Freelancer,
        Split
    }

    struct Dispute {
        uint256 disputeId;
        uint256 jobId;
        address client;
        address freelancer;
        uint256 amount;
        string clientEvidence;
        string freelancerEvidence;
        DisputeStatus status;
        DisputeWinner winner;
        string resolution;
        address resolvedBy;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    uint256 private disputeCounter;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobToDispute;
    mapping(address => uint256[]) public userDisputes;

    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed jobId,
        address indexed client,
        address freelancer,
        uint256 amount
    );

    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address indexed submitter,
        string evidence
    );

    event DisputeStatusUpdated(
        uint256 indexed disputeId,
        DisputeStatus status
    );

    event DisputeResolved(
        uint256 indexed disputeId,
        DisputeWinner winner,
        string resolution,
        address indexed resolvedBy
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createDispute(
        uint256 _jobId,
        address _client,
        address _freelancer,
        uint256 _amount,
        string memory _evidence
    ) external payable nonReentrant returns (uint256) {
        require(
            msg.sender == _client || msg.sender == _freelancer,
            "Only job parties can create dispute"
        );
        require(jobToDispute[_jobId] == 0, "Dispute already exists for this job");
        require(msg.value == _amount, "Must lock disputed amount");

        disputeCounter++;
        uint256 disputeId = disputeCounter;

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            jobId: _jobId,
            client: _client,
            freelancer: _freelancer,
            amount: _amount,
            clientEvidence: msg.sender == _client ? _evidence : "",
            freelancerEvidence: msg.sender == _freelancer ? _evidence : "",
            status: DisputeStatus.Open,
            winner: DisputeWinner.None,
            resolution: "",
            resolvedBy: address(0),
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        jobToDispute[_jobId] = disputeId;
        userDisputes[_client].push(disputeId);
        userDisputes[_freelancer].push(disputeId);

        emit DisputeCreated(disputeId, _jobId, _client, _freelancer, _amount);
        emit EvidenceSubmitted(disputeId, msg.sender, _evidence);

        return disputeId;
    }

    function submitEvidence(uint256 _disputeId, string memory _evidence)
        external
    {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(
            dispute.status == DisputeStatus.Open ||
                dispute.status == DisputeStatus.UnderReview,
            "Dispute is not open"
        );
        require(
            msg.sender == dispute.client || msg.sender == dispute.freelancer,
            "Not authorized"
        );

        if (msg.sender == dispute.client) {
            dispute.clientEvidence = _evidence;
        } else {
            dispute.freelancerEvidence = _evidence;
        }

        emit EvidenceSubmitted(_disputeId, msg.sender, _evidence);
    }

    function updateDisputeStatus(uint256 _disputeId, DisputeStatus _status)
        external
        onlyRole(ADMIN_ROLE)
    {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.status != DisputeStatus.Resolved, "Dispute already resolved");

        dispute.status = _status;
        emit DisputeStatusUpdated(_disputeId, _status);
    }

    function resolveDispute(
        uint256 _disputeId,
        DisputeWinner _winner,
        string memory _resolution
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.status != DisputeStatus.Resolved, "Already resolved");
        require(_winner != DisputeWinner.None, "Must specify winner");

        dispute.status = DisputeStatus.Resolved;
        dispute.winner = _winner;
        dispute.resolution = _resolution;
        dispute.resolvedBy = msg.sender;
        dispute.resolvedAt = block.timestamp;

        if (_winner == DisputeWinner.Client) {
            payable(dispute.client).transfer(dispute.amount);
        } else if (_winner == DisputeWinner.Freelancer) {
            payable(dispute.freelancer).transfer(dispute.amount);
        } else if (_winner == DisputeWinner.Split) {
            uint256 half = dispute.amount / 2;
            payable(dispute.client).transfer(half);
            payable(dispute.freelancer).transfer(dispute.amount - half);
        }

        emit DisputeResolved(_disputeId, _winner, _resolution, msg.sender);
    }

    function getDispute(uint256 _disputeId)
        external
        view
        returns (Dispute memory)
    {
        return disputes[_disputeId];
    }

    function getUserDisputes(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userDisputes[_user];
    }

    function getAllOpenDisputes()
        external
        view
        onlyRole(ADMIN_ROLE)
        returns (Dispute[] memory)
    {
        uint256 openCount = 0;

        for (uint256 i = 1; i <= disputeCounter; i++) {
            if (
                disputes[i].status == DisputeStatus.Open ||
                disputes[i].status == DisputeStatus.UnderReview
            ) {
                openCount++;
            }
        }

        Dispute[] memory openDisputes = new Dispute[](openCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= disputeCounter; i++) {
            if (
                disputes[i].status == DisputeStatus.Open ||
                disputes[i].status == DisputeStatus.UnderReview
            ) {
                openDisputes[index] = disputes[i];
                index++;
            }
        }

        return openDisputes;
    }

    function addAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, _admin);
    }

    function removeAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, _admin);
    }

    function getTotalDisputes() external view returns (uint256) {
        return disputeCounter;
    }
}
