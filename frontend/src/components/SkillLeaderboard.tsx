import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillCategory, SkillCategoryNames, BadgeTier } from "@/types";
import { badgeTierToRankTier, calculateRankPoints, formatRating } from "@/lib/badgeUtils";
import { RankBadge } from "@/components/RankBadge";
import { Trophy, TrendingUp, Star, Briefcase } from "lucide-react";
import { formatEther, formatAddress } from "@/lib/utils";

interface LeaderboardEntry {
  address: string;
  skillName: string;
  category: SkillCategory;
  tier: BadgeTier;
  jobsInSkill: bigint;
  totalEarningsInSkill: bigint;
  avgRating: bigint;
}

interface SkillLeaderboardProps {
  skillCategory?: SkillCategory;
  title?: string;
  limit?: number;
}

export function SkillLeaderboard({
  skillCategory,
  title = "Top Freelancers",
  limit = 10
}: SkillLeaderboardProps) {
  const { skillBadgesContract } = useWeb3();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [skillBadgesContract, skillCategory]);

  const loadLeaderboard = async () => {
    if (!skillBadgesContract) return;

    try {
      setLoading(true);

      // In a real implementation, you'd have a backend service that indexes all badges
      // For demo purposes, this is a simplified version
      // You could emit events when badges are minted and build an index

      // Placeholder: In production, call your indexing service API
      const entries: LeaderboardEntry[] = [];

      // This is a demonstration - in production you'd fetch from indexed data
      // For now, we'll just show empty state with instructions

      setLeaderboard(entries);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-900" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>
              {skillCategory !== undefined
                ? `${SkillCategoryNames[skillCategory]} Specialists`
                : "Across All Skills"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-pulse">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Leaderboard will populate as freelancers complete jobs
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Complete jobs to climb the ranks and earn your spot!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, limit).map((entry, index) => {
              const rank = index + 1;
              const medalColors = {
                1: "from-yellow-400 to-yellow-600",
                2: "from-gray-300 to-gray-500",
                3: "from-amber-600 to-amber-800",
              };

              return (
                <motion.div
                  key={entry.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    rank <= 3
                      ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    {rank <= 3 ? (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${medalColors[rank as 1 | 2 | 3]} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">{rank}</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">
                        {rank}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">
                        {formatAddress(entry.address)}
                      </span>
                      <RankBadge
                        rankTier={badgeTierToRankTier(entry.tier)}
                        rankPoints={calculateRankPoints(entry.jobsInSkill)}
                        size="sm"
                        showPoints={false}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {Number(entry.jobsInSkill)} jobs
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {formatRating(entry.avgRating)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        {formatEther(entry.totalEarningsInSkill)}
                      </span>
                    </div>
                  </div>

                  {/* Trophy for top 3 */}
                  {rank <= 3 && (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Trophy className={`h-6 w-6 text-yellow-600`} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 font-medium mb-2">
            How to rank up:
          </p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✨ Complete more jobs in your skill category</li>
            <li>⭐ Maintain high ratings (4.5+)</li>
            <li>💰 Earn more from completed projects</li>
            <li>🏆 Reach higher badge tiers for better visibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SkillLeaderboard;
