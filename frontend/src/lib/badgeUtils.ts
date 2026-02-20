import { BadgeTier } from "@/types";
import { RankTier } from "@/components/RankBadge";

/**
 * Convert contract BadgeTier to RankTier component enum
 */
export function badgeTierToRankTier(tier: BadgeTier): RankTier {
  switch (tier) {
    case BadgeTier.BRONZE:
      return RankTier.BRONZE;
    case BadgeTier.SILVER:
      return RankTier.SILVER;
    case BadgeTier.GOLD:
      return RankTier.GOLD;
    case BadgeTier.PLATINUM:
      return RankTier.PLATINUM;
    case BadgeTier.DIAMOND:
      return RankTier.DIAMOND;
    case BadgeTier.LEGEND:
      return RankTier.LEGEND;
    default:
      return RankTier.BRONZE;
  }
}

/**
 * Calculate rank points based on jobs completed
 * This maps to the point system used in RankBadge component
 */
export function calculateRankPoints(jobsCompleted: bigint): number {
  const jobs = Number(jobsCompleted);

  // Bronze: 0-2 jobs = 0-99 points
  if (jobs <= 2) return jobs * 33;

  // Silver: 3-9 jobs = 100-499 points
  if (jobs <= 9) return 100 + (jobs - 3) * 57;

  // Gold: 10-24 jobs = 500-1999 points
  if (jobs <= 24) return 500 + (jobs - 10) * 100;

  // Platinum: 25-49 jobs = 2000-4999 points
  if (jobs <= 49) return 2000 + (jobs - 25) * 120;

  // Diamond: 50-99 jobs = 5000-9999 points
  if (jobs <= 99) return 5000 + (jobs - 50) * 100;

  // Legend: 100+ jobs = 10000+ points
  return 10000 + (jobs - 100) * 50;
}

/**
 * Get tier requirements for display
 */
export function getTierRequirements(tier: BadgeTier): string {
  switch (tier) {
    case BadgeTier.BRONZE:
      return "Pass skill test";
    case BadgeTier.SILVER:
      return "3+ jobs, 4.5+ rating";
    case BadgeTier.GOLD:
      return "10+ jobs, 4.7+ rating, $2k+ earned";
    case BadgeTier.PLATINUM:
      return "25+ jobs, 4.8+ rating, $10k+ earned";
    case BadgeTier.DIAMOND:
      return "50+ jobs, 4.9+ rating, $50k+ earned";
    case BadgeTier.LEGEND:
      return "100+ jobs, 4.9+ rating, $200k+ earned";
    default:
      return "";
  }
}

/**
 * Format rating from contract (rating * 100) to display format
 */
export function formatRating(ratingTimes100: bigint): string {
  if (ratingTimes100 === 0n) return "No ratings yet";
  const rating = Number(ratingTimes100) / 100;
  return rating.toFixed(1);
}
