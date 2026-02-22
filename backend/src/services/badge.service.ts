import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY || '';
const SKILL_BADGES_ADDRESS = process.env.SKILL_BADGES_ADDRESS || '';

const SkillBadgesABI = [
  "function mintSkillBadge(address recipient, string skillName, uint8 category, uint256 score, string tokenURI) returns (uint256)",
  "function userHasSkill(address user, uint8 category) view returns (bool)",
];

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

function getContract() {
  if (!contract) {
    if (!OWNER_PRIVATE_KEY || !SKILL_BADGES_ADDRESS) {
      throw new Error('Badge minting not configured: missing OWNER_PRIVATE_KEY or SKILL_BADGES_ADDRESS');
    }
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    contract = new ethers.Contract(SKILL_BADGES_ADDRESS, SkillBadgesABI, wallet);
  }
  return contract;
}

export const badgeService = {
  async mintSkillBadge(
    recipientAddress: string,
    skillName: string,
    category: number,
    score: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const checksumAddress = ethers.getAddress(recipientAddress);
      const skillBadges = getContract();

      // Check if user already has this skill badge
      const alreadyHas = await skillBadges.userHasSkill(checksumAddress, category);
      if (alreadyHas) {
        return { success: false, error: 'User already has this skill badge' };
      }

      // Mint the badge (owner calls the contract)
      const tx = await skillBadges.mintSkillBadge(
        checksumAddress,
        skillName,
        category,
        score,
        '' // tokenURI - can be set later
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error('Error minting badge:', error);
      return { success: false, error: error.message || 'Failed to mint badge' };
    }
  },

  async checkHasSkill(userAddress: string, category: number): Promise<boolean> {
    try {
      const checksumAddress = ethers.getAddress(userAddress);
      const skillBadges = getContract();
      return await skillBadges.userHasSkill(checksumAddress, category);
    } catch {
      return false;
    }
  },
};
