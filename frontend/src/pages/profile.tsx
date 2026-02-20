import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SkillCategoryNames, JobStatusNames } from "@/types";
import { formatAddress, formatEther, formatDate } from "@/lib/utils";
import { badgeTierToRankTier, calculateRankPoints, formatRating } from "@/lib/badgeUtils";
import { User, Award, Briefcase, Search, Copy, CheckCircle, Edit, Github, Twitter, Globe, Mail, Save, X, Star, TrendingUp } from "lucide-react";
import { userApi } from "@/services/api.service";
import toast from "react-hot-toast";
import { RankBadge, RankCard, RankTier } from "@/components/RankBadge";
import { UserRatingsDisplay } from "@/components/UserRatingsDisplay";

export default function ProfilePage() {
  const { account, skillBadgesContract, jobBadgesContract, marketplaceContract } = useWeb3();
  const [searchAddress, setSearchAddress] = useState("");
  const [viewingAddress, setViewingAddress] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userJobs, setUserJobs] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ jobs: 0n, earnings: 0n, reputation: 0n });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    displayName: "",
    email: "",
    bio: "",
    githubUsername: "",
    twitterUsername: "",
    websiteUrl: "",
  });

  useEffect(() => {
    if (account) {
      loadProfile(account);
    }
  }, [account, skillBadgesContract, jobBadgesContract]);

  const loadProfile = async (address: string) => {
    if (!skillBadgesContract || !jobBadgesContract) return;

    try {
      setLoading(true);
      setViewingAddress(address);

      // Load user profile from backend
      try {
        const profile = await userApi.getUserProfile(address);
        setUserProfile(profile);
        setEditForm({
          username: profile.username || "",
          displayName: profile.displayName || "",
          email: profile.email || "",
          bio: profile.bio || "",
          githubUsername: profile.githubUsername || "",
          twitterUsername: profile.twitterUsername || "",
          websiteUrl: profile.websiteUrl || "",
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User profile doesn't exist yet, create it
          await userApi.createUser(address);
          setUserProfile(null);
        }
      }

      // Check if contracts are deployed before calling
      const provider = skillBadgesContract.runner?.provider;
      let contractsDeployed = true;
      if (provider) {
        const skillCode = await provider.getCode(await skillBadgesContract.getAddress());
        const jobCode = await provider.getCode(await jobBadgesContract.getAddress());
        if (skillCode === "0x" || skillCode === "0x0" || jobCode === "0x" || jobCode === "0x0") {
          console.warn("Badge contracts not deployed on current network");
          contractsDeployed = false;
        }
      }

      if (contractsDeployed) {
        // Load skills
        const skillIds = await skillBadgesContract.getUserSkills(address);
        const skills = await Promise.all(
          skillIds.map(async (id: bigint) => {
            const details = await skillBadgesContract.getSkillDetails(id);
            return {
              id,
              name: details[0],
              category: details[1],
              timestamp: details[2],
              score: details[3],
              tier: details[4],
              jobsInSkill: details[5],
              totalEarningsInSkill: details[6],
              avgRating: details[7],
            };
          })
        );
        setUserSkills(skills);

        // Load job badges and stats
        const stats = await jobBadgesContract.getUserStats(address);
        setUserStats({
          jobs: stats[0],
          earnings: stats[1],
          reputation: stats[2],
        });

        const jobBadgeIds = await jobBadgesContract.getUserJobBadges(address);
        const jobs = await Promise.all(
          jobBadgeIds.map(async (id: bigint) => {
            const details = await jobBadgesContract.getJobBadgeDetails(id);
            return {
              id,
              jobId: details[0],
              recipient: details[1],
              role: details[2],
              amount: details[3],
              timestamp: details[4],
              rating: details[5],
              review: details[6],
            };
          })
        );
        setUserJobs(jobs);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchAddress && searchAddress.startsWith("0x") && searchAddress.length === 42) {
      loadProfile(searchAddress);
    } else {
      toast.error("Please enter a valid Ethereum address");
    }
  };

  const copyAddress = () => {
    if (viewingAddress) {
      navigator.clipboard.writeText(viewingAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userProfile) {
      setEditForm({
        username: userProfile.username || "",
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        githubUsername: userProfile.githubUsername || "",
        twitterUsername: userProfile.twitterUsername || "",
        websiteUrl: userProfile.websiteUrl || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!viewingAddress) return;

    try {
      const updatedProfile = await userApi.updateUserProfile(viewingAddress, editForm);
      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to view profiles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">View user badges and reputation</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search User by Wallet Address</CardTitle>
          <CardDescription>
            Enter an Ethereum address to view their skills and reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      ) : viewingAddress ? (
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {userProfile?.displayName ? (
                        <h2 className="text-2xl font-bold">{userProfile.displayName}</h2>
                      ) : (
                        <h2 className="text-2xl font-bold">{formatAddress(viewingAddress)}</h2>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {userProfile?.username && (
                      <p className="text-gray-600">@{userProfile.username}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {viewingAddress.toLowerCase() === account.toLowerCase() && (
                        <Badge variant="secondary">Your Profile</Badge>
                      )}
                      {userProfile && (
                        <RankBadge
                          rankTier={userProfile.rankTier as RankTier || RankTier.BRONZE}
                          rankPoints={userProfile.rankPoints || 0}
                          size="sm"
                          showPoints={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {viewingAddress.toLowerCase() === account.toLowerCase() && !isEditing && (
                  <Button onClick={handleEditProfile} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase() })}
                      placeholder="johndoe_123"
                      disabled={!!userProfile?.username}
                    />
                    {userProfile?.username && (
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed once set</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">GitHub Username</label>
                    <Input
                      value={editForm.githubUsername}
                      onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Twitter Username</label>
                    <Input
                      value={editForm.twitterUsername}
                      onChange={(e) => setEditForm({ ...editForm, twitterUsername: e.target.value })}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website URL</label>
                    <Input
                      value={editForm.websiteUrl}
                      onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {userProfile && (userProfile.bio || userProfile.email || userProfile.githubUsername || userProfile.twitterUsername || userProfile.websiteUrl) && (
                    <div className="space-y-4 border-b pb-4">
                      {userProfile.bio && (
                        <p className="text-gray-700">{userProfile.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {userProfile.email && (
                          <a href={`mailto:${userProfile.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                            <Mail className="h-4 w-4" />
                            {userProfile.email}
                          </a>
                        )}
                        {userProfile.githubUsername && (
                          <a
                            href={`https://github.com/${userProfile.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Github className="h-4 w-4" />
                            {userProfile.githubUsername}
                          </a>
                        )}
                        {userProfile.twitterUsername && (
                          <a
                            href={`https://twitter.com/${userProfile.twitterUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Twitter className="h-4 w-4" />
                            {userProfile.twitterUsername}
                          </a>
                        )}
                        {userProfile.websiteUrl && (
                          <a
                            href={userProfile.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rank Card */}
                  {userProfile && (
                    <div className="border-b pb-4">
                      <RankCard
                        rankTier={userProfile.rankTier as RankTier || RankTier.BRONZE}
                        rankPoints={userProfile.rankPoints || 0}
                        username={userProfile.username}
                        displayName={userProfile.displayName}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{Number(userStats.jobs)}</div>
                      <div className="text-sm text-gray-600">Completed Jobs</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatEther(userStats.earnings)} ETH
                      </div>
                      <div className="text-sm text-gray-600">Total Earnings</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-500">{Number(userStats.reputation)}</div>
                      <div className="text-sm text-gray-600">Reputation Score</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skill Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                Skill Badges ({userSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userSkills.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No skill badges earned yet</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {userSkills.map((skill) => (
                    <div
                      key={skill.id.toString()}
                      className="border-2 rounded-lg p-5 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-lg mb-1">
                            {SkillCategoryNames[skill.category as keyof typeof SkillCategoryNames]}
                          </div>
                          <RankBadge
                            rankTier={badgeTierToRankTier(skill.tier)}
                            rankPoints={calculateRankPoints(skill.jobsInSkill)}
                            size="sm"
                            showPoints={false}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            Jobs Completed:
                          </span>
                          <span className="font-semibold">{Number(skill.jobsInSkill)}</span>
                        </div>

                        {Number(skill.jobsInSkill) > 0 && (
                          <>
                            <div className="flex items-center justify-between text-gray-700">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                Avg Rating:
                              </span>
                              <span className="font-semibold">{formatRating(skill.avgRating)} / 5.0</span>
                            </div>

                            <div className="flex items-center justify-between text-gray-700">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Earned:
                              </span>
                              <span className="font-semibold">{formatEther(skill.totalEarningsInSkill)}</span>
                            </div>
                          </>
                        )}

                        <div className="pt-2 border-t text-xs text-gray-500">
                          Quiz Score: {Number(skill.score)}% • Earned {formatDate(Number(skill.timestamp))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                Job History ({userJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs completed yet</p>
              ) : (
                <div className="space-y-4">
                  {userJobs.map((job) => (
                    <div
                      key={job.id.toString()}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant={job.role === 0 ? "default" : "secondary"}>
                            {job.role === 0 ? "Freelancer" : "Client"}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            Job ID: {job.jobId.toString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {formatEther(job.amount)} ETH
                          </div>
                          <div className="text-sm text-yellow-600">
                            Rating: {"⭐".repeat(job.rating)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{job.review}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(Number(job.timestamp))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Ratings */}
          <UserRatingsDisplay
            walletAddress={viewingAddress}
            showStats={true}
            maxReviews={10}
          />
        </div>
      ) : null}
    </div>
  );
}
