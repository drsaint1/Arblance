// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title JobBadges
 * @dev NFT badges representing completed jobs for both freelancers and clients
 */
contract JobBadges is ERC721, ERC721URIStorage {
    uint256 private _tokenIdCounter;

    enum UserRole {
        Freelancer,
        Client
    }

    struct JobBadge {
        uint256 jobId;
        address recipient;
        UserRole role;
        uint256 amount;
        uint256 timestamp;
        uint8 rating;
        string review;
    }

    // Mapping from token ID to job badge details
    mapping(uint256 => JobBadge) public jobBadges;

    // Mapping from user address to their job badges
    mapping(address => uint256[]) public userJobBadges;

    // Mapping to track reputation scores
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public totalEarnings;

    // Events
    event JobBadgeMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 jobId,
        UserRole role,
        uint256 amount,
        uint8 rating
    );

    constructor() ERC721("FreelanceJobBadge", "FJB") {}

    /**
     * @dev Mint a new job completion badge
     * @param recipient Address to receive the badge
     * @param jobId ID of the completed job
     * @param role Role of the recipient (Freelancer or Client)
     * @param amount Payment amount for the job
     * @param rating Rating (1-5)
     * @param review Written review
     * @param tokenURI Metadata URI for the badge
     */
    function mintJobBadge(
        address recipient,
        uint256 jobId,
        UserRole role,
        uint256 amount,
        uint8 rating,
        string memory review,
        string memory tokenURI
    ) public returns (uint256) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        uint256 newTokenId = ++_tokenIdCounter;

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        jobBadges[newTokenId] = JobBadge({
            jobId: jobId,
            recipient: recipient,
            role: role,
            amount: amount,
            timestamp: block.timestamp,
            rating: rating,
            review: review
        });

        userJobBadges[recipient].push(newTokenId);
        completedJobs[recipient]++;

        if (role == UserRole.Freelancer) {
            totalEarnings[recipient] += amount;
        }

        // Update reputation score (weighted average)
        reputationScores[recipient] =
            (reputationScores[recipient] * (completedJobs[recipient] - 1) + rating * 20) /
            completedJobs[recipient];

        emit JobBadgeMinted(recipient, newTokenId, jobId, role, amount, rating);

        return newTokenId;
    }

    /**
     * @dev Get all job badges for a user
     * @param user Address of the user
     */
    function getUserJobBadges(address user) public view returns (uint256[] memory) {
        return userJobBadges[user];
    }

    /**
     * @dev Get job badge details
     * @param tokenId Token ID of the job badge
     */
    function getJobBadgeDetails(uint256 tokenId)
        public
        view
        returns (
            uint256 jobId,
            address recipient,
            UserRole role,
            uint256 amount,
            uint256 timestamp,
            uint8 rating,
            string memory review
        )
    {
        JobBadge memory badge = jobBadges[tokenId];
        return (
            badge.jobId,
            badge.recipient,
            badge.role,
            badge.amount,
            badge.timestamp,
            badge.rating,
            badge.review
        );
    }

    /**
     * @dev Get user statistics
     * @param user Address of the user
     */
    function getUserStats(address user)
        public
        view
        returns (
            uint256 jobs,
            uint256 earnings,
            uint256 reputation
        )
    {
        return (
            completedJobs[user],
            totalEarnings[user],
            reputationScores[user]
        );
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
            revert("Job badges are soulbound and cannot be transferred");
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
