// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkillBadges
 * @dev NFT badges representing verified skills for freelancers
 */
contract SkillBadges is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Skill categories
    enum SkillCategory {
        UIUXDesign,
        WebDevelopment,
        MobileDevelopment,
        BlockchainDevelopment,
        DataScience,
        DevOps,
        RustDevelopment,
        SolidityDevelopment,
        GraphicDesign,
        ContentWriting,
        VideoEditing,
        DigitalMarketing,
        ProjectManagement,
        Other
    }

    // Badge tier levels
    enum BadgeTier {
        BRONZE,    // 0-2 jobs
        SILVER,    // 3-9 jobs, 4.5+ rating
        GOLD,      // 10-24 jobs, 4.7+ rating, $2k+ earned
        PLATINUM,  // 25-49 jobs, 4.8+ rating, $10k+ earned
        DIAMOND,   // 50-99 jobs, 4.9+ rating, $50k+ earned
        LEGEND     // 100+ jobs, 4.9+ rating, $200k+ earned
    }

    struct Skill {
        string name;
        SkillCategory category;
        uint256 timestamp;
        uint256 score;
        BadgeTier tier;
        uint256 jobsInSkill;
        uint256 totalEarningsInSkill;
        uint256 totalRatingPoints; // Sum of all ratings for average calculation
        uint256 lastUpdated;
    }

    // Mapping from token ID to skill details
    mapping(uint256 => Skill) public skills;

    // Mapping from user address to their skill badges
    mapping(address => uint256[]) public userSkills;

    // Mapping to track if user has specific skill
    mapping(address => mapping(SkillCategory => bool)) public hasSkill;

    // Mapping from user + category to token ID for quick lookups
    mapping(address => mapping(SkillCategory => uint256)) public userSkillTokenId;

    // Events
    event SkillBadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        string skillName,
        SkillCategory category,
        uint256 score
    );

    event SkillBadgeUpgraded(
        address indexed user,
        uint256 indexed tokenId,
        SkillCategory category,
        BadgeTier oldTier,
        BadgeTier newTier,
        uint256 jobsCompleted
    );

    event SkillJobRecorded(
        address indexed user,
        SkillCategory category,
        uint256 jobsInSkill,
        uint256 earnings,
        uint8 rating
    );

    constructor() ERC721("FreelanceSkillBadge", "FSB") Ownable(msg.sender) {}

    /**
     * @dev Mint a new skill badge
     * @param recipient Address to receive the badge
     * @param skillName Name of the skill
     * @param category Skill category
     * @param score Test score (0-100)
     * @param tokenURI Metadata URI for the badge
     */
    function mintSkillBadge(
        address recipient,
        string memory skillName,
        SkillCategory category,
        uint256 score,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(score <= 100, "Score must be between 0 and 100");
        require(!hasSkill[recipient][category], "User already has this skill badge");

        uint256 newTokenId = ++_tokenIdCounter;

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        skills[newTokenId] = Skill({
            name: skillName,
            category: category,
            timestamp: block.timestamp,
            score: score,
            tier: BadgeTier.BRONZE,
            jobsInSkill: 0,
            totalEarningsInSkill: 0,
            totalRatingPoints: 0,
            lastUpdated: block.timestamp
        });

        userSkills[recipient].push(newTokenId);
        hasSkill[recipient][category] = true;
        userSkillTokenId[recipient][category] = newTokenId;

        emit SkillBadgeMinted(recipient, newTokenId, skillName, category, score);

        return newTokenId;
    }

    /**
     * @dev Get all skill badges for a user
     * @param user Address of the user
     */
    function getUserSkills(address user) public view returns (uint256[] memory) {
        return userSkills[user];
    }

    /**
     * @dev Record a job completion for a skill
     * @param user Address of the user
     * @param category Skill category used in the job
     * @param earnings Amount earned in this job
     * @param rating Rating received (1-5)
     */
    function recordJobInSkill(
        address user,
        SkillCategory category,
        uint256 earnings,
        uint8 rating
    ) public onlyOwner {
        require(hasSkill[user][category], "User doesn't have this skill badge");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        uint256 tokenId = userSkillTokenId[user][category];
        Skill storage skill = skills[tokenId];

        skill.jobsInSkill++;
        skill.totalEarningsInSkill += earnings;
        skill.totalRatingPoints += rating;
        skill.lastUpdated = block.timestamp;

        emit SkillJobRecorded(user, category, skill.jobsInSkill, earnings, rating);

        // Check for tier upgrade
        _checkAndUpgradeTier(user, tokenId);
    }

    /**
     * @dev Internal function to check and upgrade badge tier
     * @param user Address of the user
     * @param tokenId Token ID of the skill badge
     */
    function _checkAndUpgradeTier(address user, uint256 tokenId) internal {
        Skill storage skill = skills[tokenId];
        BadgeTier oldTier = skill.tier;
        BadgeTier newTier = _calculateTier(
            skill.jobsInSkill,
            skill.totalEarningsInSkill,
            skill.totalRatingPoints
        );

        if (newTier > oldTier) {
            skill.tier = newTier;
            emit SkillBadgeUpgraded(
                user,
                tokenId,
                skill.category,
                oldTier,
                newTier,
                skill.jobsInSkill
            );
        }
    }

    /**
     * @dev Calculate appropriate tier based on stats
     * @param jobsCompleted Number of jobs completed
     * @param totalEarnings Total earnings in this skill
     * @param totalRatingPoints Sum of all ratings
     */
    function _calculateTier(
        uint256 jobsCompleted,
        uint256 totalEarnings,
        uint256 totalRatingPoints
    ) internal pure returns (BadgeTier) {
        if (jobsCompleted == 0) return BadgeTier.BRONZE;

        // Calculate average rating (out of 5)
        uint256 avgRating = (totalRatingPoints * 100) / jobsCompleted; // Rating * 100 for precision

        // LEGEND: 100+ jobs, 4.9+ rating (490/100), $200k+ earned
        if (jobsCompleted >= 100 && avgRating >= 490 && totalEarnings >= 200000 ether) {
            return BadgeTier.LEGEND;
        }

        // DIAMOND: 50+ jobs, 4.9+ rating, $50k+ earned
        if (jobsCompleted >= 50 && avgRating >= 490 && totalEarnings >= 50000 ether) {
            return BadgeTier.DIAMOND;
        }

        // PLATINUM: 25+ jobs, 4.8+ rating, $10k+ earned
        if (jobsCompleted >= 25 && avgRating >= 480 && totalEarnings >= 10000 ether) {
            return BadgeTier.PLATINUM;
        }

        // GOLD: 10+ jobs, 4.7+ rating, $2k+ earned
        if (jobsCompleted >= 10 && avgRating >= 470 && totalEarnings >= 2000 ether) {
            return BadgeTier.GOLD;
        }

        // SILVER: 3+ jobs, 4.5+ rating
        if (jobsCompleted >= 3 && avgRating >= 450) {
            return BadgeTier.SILVER;
        }

        // BRONZE: Default tier
        return BadgeTier.BRONZE;
    }

    /**
     * @dev Get skill details by token ID
     * @param tokenId Token ID of the skill badge
     */
    function getSkillDetails(uint256 tokenId)
        public
        view
        returns (
            string memory name,
            SkillCategory category,
            uint256 timestamp,
            uint256 score,
            BadgeTier tier,
            uint256 jobsInSkill,
            uint256 totalEarningsInSkill,
            uint256 avgRating
        )
    {
        Skill memory skill = skills[tokenId];
        uint256 avgRatingCalc = skill.jobsInSkill > 0
            ? (skill.totalRatingPoints * 100) / skill.jobsInSkill
            : 0;
        return (
            skill.name,
            skill.category,
            skill.timestamp,
            skill.score,
            skill.tier,
            skill.jobsInSkill,
            skill.totalEarningsInSkill,
            avgRatingCalc
        );
    }

    /**
     * @dev Get user's skill badge token ID for a category
     * @param user Address of the user
     * @param category Skill category
     */
    function getUserSkillTokenId(address user, SkillCategory category)
        public
        view
        returns (uint256)
    {
        return userSkillTokenId[user][category];
    }

    /**
     * @dev Get skill tier for a user's skill
     * @param user Address of the user
     * @param category Skill category
     */
    function getUserSkillTier(address user, SkillCategory category)
        public
        view
        returns (BadgeTier)
    {
        if (!hasSkill[user][category]) {
            revert("User doesn't have this skill");
        }
        uint256 tokenId = userSkillTokenId[user][category];
        return skills[tokenId].tier;
    }

    /**
     * @dev Check if user has a specific skill
     * @param user Address of the user
     * @param category Skill category to check
     */
    function userHasSkill(address user, SkillCategory category)
        public
        view
        returns (bool)
    {
        return hasSkill[user][category];
    }

    /**
     * @dev Override to prevent token transfers (soulbound)
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Skill badges are soulbound and cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
