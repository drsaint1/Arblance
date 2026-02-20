export const JobBadgesABI = [
  "function mintJobBadge(address recipient, uint256 jobId, uint8 role, uint256 amount, uint8 rating, string review, string tokenURI) returns (uint256)",
  "function getUserJobBadges(address user) view returns (uint256[])",
  "function getJobBadgeDetails(uint256 tokenId) view returns (uint256 jobId, address recipient, uint8 role, uint256 amount, uint256 timestamp, uint8 rating, string review)",
  "function getUserStats(address user) view returns (uint256 jobs, uint256 earnings, uint256 reputation)",
  "function balanceOf(address owner) view returns (uint256)",
  "event JobBadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 jobId, uint8 role, uint256 amount, uint8 rating)",
] as const;
