import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Star, User, MessageSquare, TrendingUp } from "lucide-react";
import axios from "axios";
import { formatAddress } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Rating {
  _id: string;
  jobId: number;
  rater: string;
  ratee: string;
  raterType: "Buyer" | "Seller";
  rating: number;
  review: string;
  createdAt: string;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  buyerRatings: number;
  sellerRatings: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface UserRatingsDisplayProps {
  walletAddress: string;
  showStats?: boolean;
  maxReviews?: number;
}

export const UserRatingsDisplay: React.FC<UserRatingsDisplayProps> = ({
  walletAddress,
  showStats = true,
  maxReviews = 5,
}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [walletAddress]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const [ratingsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/ratings/user/${walletAddress}`),
        axios.get(`${API_URL}/ratings/stats/${walletAddress}`),
      ]);

      if (ratingsRes.data.success) {
        setRatings(ratingsRes.data.ratings || []);
      }

      if (statsRes.data.success && statsRes.data.stats) {
        const s = statsRes.data.stats;
        setStats({
          averageRating: s.averageRating ?? 0,
          totalRatings: s.totalRatings ?? 0,
          buyerRatings: s.buyerRatings ?? 0,
          sellerRatings: s.sellerRatings ?? 0,
          distribution: {
            5: s.distribution?.[5] ?? 0,
            4: s.distribution?.[4] ?? 0,
            3: s.distribution?.[3] ?? 0,
            2: s.distribution?.[2] ?? 0,
            1: s.distribution?.[1] ?? 0,
          },
        });
      }
    } catch (error) {
      console.error("Error loading ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStatsBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="bg-blue-600 h-2 rounded-full"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">Loading ratings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">No ratings yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      {showStats && stats && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rating Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.totalRatings} total rating{stats.totalRatings !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {stats.buyerRatings} as Buyer
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  {stats.sellerRatings} as Seller
                </Badge>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{star} ★</span>
                  {renderStatsBar(stats.distribution[star as keyof typeof stats.distribution], stats.totalRatings)}
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stats.distribution[star as keyof typeof stats.distribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.slice(0, maxReviews).map((rating, index) => (
              <motion.div
                key={rating._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {formatAddress(rating.rater)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rated as {rating.raterType} • Job #{rating.jobId}
                      </p>
                    </div>
                  </div>
                  {renderStars(rating.rating)}
                </div>
                {rating.review && (
                  <p className="text-sm text-gray-700 ml-12 italic">
                    "{rating.review}"
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-12 mt-1">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
