import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { RankBadge, RankTier } from "./RankBadge";
import { Search, Mail, Star, Briefcase, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface User {
  _id: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  email?: string;
  rankTier: string;
  rankPoints: number;
  stats: {
    totalJobsCompleted: number;
    totalJobsPosted: number;
    totalVolumeUSD: number;
    skillBadgesCount: number;
    buyerRating: number;
    sellerRating: number;
    totalReviews: number;
  };
  createdAt: string;
}

export const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [page, rankFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/admin/all`, {
        params: {
          page,
          limit: 20,
          search,
          rank: rankFilter,
        },
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by username, email, or wallet address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <select
          value={rankFilter}
          onChange={(e) => {
            setRankFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Ranks</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
          <option value="Diamond">Diamond</option>
          <option value="Legend">Legend</option>
        </select>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* User Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.username
                          ? user.username.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {user.displayName || user.username || "Anonymous User"}
                        </div>
                        {user.username && (
                          <div className="text-sm text-gray-600">@{user.username}</div>
                        )}
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {formatAddress(user.walletAddress)}
                        </div>
                      </div>
                    </div>

                    {user.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Jobs Completed</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {user.stats.totalJobsCompleted}
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Jobs Posted</div>
                      <div className="text-2xl font-bold text-green-600">
                        {user.stats.totalJobsPosted}
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Skill Badges</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {user.stats.skillBadgesCount}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Total Volume</div>
                      <div className="text-lg font-bold text-purple-600">
                        ${user.stats.totalVolumeUSD.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Rank & Ratings */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Rank</div>
                      <RankBadge
                        rankTier={user.rankTier as RankTier}
                        rankPoints={user.rankPoints}
                        size="md"
                        showPoints={true}
                      />
                    </div>

                    <div>
                      <div className="text-xs text-gray-600 mb-2">Ratings</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                          <span className="text-sm">As Buyer</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">
                              {user.stats.buyerRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                          <span className="text-sm">As Seller</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">
                              {user.stats.sellerRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                          {user.stats.totalReviews} total reviews
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            Page {page} of {pagination.pages} ({pagination.total} total users)
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
