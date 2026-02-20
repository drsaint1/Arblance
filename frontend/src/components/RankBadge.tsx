import React from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Award, Medal, Star, Sparkles } from "lucide-react";

export enum RankTier {
  BRONZE = "Bronze",
  SILVER = "Silver",
  GOLD = "Gold",
  PLATINUM = "Platinum",
  DIAMOND = "Diamond",
  LEGEND = "Legend",
}

interface RankBadgeProps {
  rankTier: RankTier;
  rankPoints: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  showPoints?: boolean;
  className?: string;
}

const rankConfig = {
  [RankTier.BRONZE]: {
    color: "from-amber-700 to-amber-900",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-900",
    icon: Medal,
    minPoints: 0,
    maxPoints: 99,
    glowColor: "shadow-amber-200",
  },
  [RankTier.SILVER]: {
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    textColor: "text-gray-700",
    icon: Award,
    minPoints: 100,
    maxPoints: 499,
    glowColor: "shadow-gray-300",
  },
  [RankTier.GOLD]: {
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    textColor: "text-yellow-900",
    icon: Star,
    minPoints: 500,
    maxPoints: 1999,
    glowColor: "shadow-yellow-200",
  },
  [RankTier.PLATINUM]: {
    color: "from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    textColor: "text-cyan-900",
    icon: Trophy,
    minPoints: 2000,
    maxPoints: 4999,
    glowColor: "shadow-cyan-200",
  },
  [RankTier.DIAMOND]: {
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
    icon: Sparkles,
    minPoints: 5000,
    maxPoints: 9999,
    glowColor: "shadow-blue-300",
  },
  [RankTier.LEGEND]: {
    color: "from-blue-500 via-blue-400 to-cyan-400",
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    borderColor: "border-blue-400",
    textColor: "text-blue-900",
    icon: Crown,
    minPoints: 10000,
    maxPoints: Infinity,
    glowColor: "shadow-blue-400",
  },
};

const sizeConfig = {
  sm: {
    badge: "h-8 px-3 gap-1.5",
    icon: "h-4 w-4",
    text: "text-xs",
    points: "text-[10px]",
  },
  md: {
    badge: "h-10 px-4 gap-2",
    icon: "h-5 w-5",
    text: "text-sm",
    points: "text-xs",
  },
  lg: {
    badge: "h-14 px-6 gap-3",
    icon: "h-7 w-7",
    text: "text-lg",
    points: "text-sm",
  },
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  rankTier,
  rankPoints,
  size = "md",
  showProgress = false,
  showPoints = true,
  className = "",
}) => {
  const config = rankConfig[rankTier];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  const calculateProgress = () => {
    if (rankTier === RankTier.LEGEND) return 100;
    const pointsInCurrentTier = rankPoints - config.minPoints;
    const tierRange = config.maxPoints - config.minPoints + 1;
    return (pointsInCurrentTier / tierRange) * 100;
  };

  const getNextRankInfo = () => {
    if (rankTier === RankTier.LEGEND) return null;
    const pointsToNext = config.maxPoints + 1 - rankPoints;
    const nextRank = Object.values(RankTier).find(
      (tier) => rankConfig[tier].minPoints === config.maxPoints + 1
    );
    return { pointsToNext, nextRank };
  };

  const progress = calculateProgress();
  const nextRankInfo = getNextRankInfo();

  return (
    <div className={`inline-block ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`
          relative flex items-center justify-center
          ${sizeStyles.badge}
          ${config.bgColor}
          ${config.borderColor}
          border-2 rounded-full
          shadow-lg ${config.glowColor}
          transition-all duration-300
        `}
      >
        {/* Animated background shine */}
        {rankTier === RankTier.LEGEND && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Icon with rotation animation for Legend */}
        <motion.div
          animate={
            rankTier === RankTier.LEGEND
              ? { rotate: [0, 10, -10, 0] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Icon
            className={`${sizeStyles.icon} ${config.textColor}`}
            strokeWidth={2.5}
          />
        </motion.div>

        {/* Rank text */}
        <span
          className={`
          font-bold ${sizeStyles.text} ${config.textColor}
          ${rankTier === RankTier.LEGEND ? "font-extrabold" : ""}
        `}
        >
          {rankTier}
        </span>

        {/* Points display */}
        {showPoints && (
          <span
            className={`
            ${sizeStyles.points} ${config.textColor} opacity-70 font-semibold
          `}
          >
            {rankPoints.toLocaleString()}
          </span>
        )}
      </motion.div>

      {/* Progress bar and next rank info */}
      {showProgress && nextRankInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 space-y-1"
        >
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${config.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Next rank text */}
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold">{nextRankInfo.pointsToNext}</span>{" "}
            points to{" "}
            <span className="font-semibold">{nextRankInfo.nextRank}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Variant: Simple icon-only badge
export const RankIcon: React.FC<{ rankTier: RankTier; size?: number }> = ({
  rankTier,
  size = 20,
}) => {
  const config = rankConfig[rankTier];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full ${config.bgColor} ${config.borderColor} border p-1`}
    >
      <Icon className={config.textColor} size={size} strokeWidth={2.5} />
    </div>
  );
};

// Variant: Large rank card for profile page
export const RankCard: React.FC<{
  rankTier: RankTier;
  rankPoints: number;
  username?: string;
  displayName?: string;
}> = ({ rankTier, rankPoints, username, displayName }) => {
  const config = rankConfig[rankTier];
  const Icon = config.icon;
  const progress = (() => {
    if (rankTier === RankTier.LEGEND) return 100;
    const pointsInCurrentTier = rankPoints - config.minPoints;
    const tierRange = config.maxPoints - config.minPoints + 1;
    return (pointsInCurrentTier / tierRange) * 100;
  })();

  const nextRankInfo = (() => {
    if (rankTier === RankTier.LEGEND) return null;
    const pointsToNext = config.maxPoints + 1 - rankPoints;
    const nextRank = Object.values(RankTier).find(
      (tier) => rankConfig[tier].minPoints === config.maxPoints + 1
    );
    return { pointsToNext, nextRank };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden
        ${config.bgColor}
        ${config.borderColor}
        border-2 rounded-2xl p-6
        shadow-xl ${config.glowColor}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-black to-transparent" />
      </div>

      {/* Legend shine effect */}
      {rankTier === RankTier.LEGEND && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative z-10">
        {/* Header with icon and rank */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`
                p-3 rounded-xl
                bg-gradient-to-br ${config.color}
                shadow-lg
              `}
              animate={
                rankTier === RankTier.LEGEND
                  ? { rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3
                className={`text-2xl font-bold ${config.textColor}`}
              >
                {rankTier}
              </h3>
              {username && (
                <p className="text-sm text-gray-600">@{username}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Rank Points</p>
            <p className={`text-3xl font-bold ${config.textColor}`}>
              {rankPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress to next rank */}
        {nextRankInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-semibold ${config.textColor}`}>
                Progress to {nextRankInfo.nextRank}
              </span>
              <span className="text-gray-600">
                {nextRankInfo.pointsToNext} points needed
              </span>
            </div>
            <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${config.color} shadow-inner`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Legend rank message */}
        {rankTier === RankTier.LEGEND && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className={`text-sm font-semibold ${config.textColor}`}>
              🎉 Maximum rank achieved! You are a Legend! 🎉
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RankBadge;
