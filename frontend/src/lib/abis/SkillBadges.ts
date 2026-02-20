export const SkillBadgesABI = [
  "function mintSkillBadge(address recipient, string skillName, uint8 category, uint256 score, string tokenURI) returns (uint256)",
  "function getUserSkills(address user) view returns (uint256[])",
  "function getSkillDetails(uint256 tokenId) view returns (string name, uint8 category, uint256 timestamp, uint256 score)",
  "function userHasSkill(address user, uint8 category) view returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event SkillBadgeMinted(address indexed recipient, uint256 indexed tokenId, string skillName, uint8 category, uint256 score)",
] as const;
