import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Users, Briefcase, TrendingUp, Activity, Database } from "lucide-react";
import { formatAddress, formatEther, formatDate } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import { UserManagementTab } from "@/components/UserManagementTab";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Admin wallet addresses from environment variable (comma-separated)
const ADMIN_ADDRESSES = (process.env.NEXT_PUBLIC_ADMIN_ADDRESSES || "")
  .split(",")
  .map((addr) => addr.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  const { account } = useWeb3();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolution, setResolution] = useState("");
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activityStats, setActivityStats] = useState<any>(null);

  // Check if user is admin
  const isAdmin = account && ADMIN_ADDRESSES.includes(account.toLowerCase());

  useEffect(() => {
    if (isAdmin) {
      loadDisputes();
      loadStats();
      loadActivityStats();
    }
  }, [isAdmin]);

  const loadDisputes = async () => {
    try {
      const response = await axios.get(`${API_URL}/disputes`);
      setDisputes(response.data.disputes);
    } catch (error) {
      console.error("Error loading disputes:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/disputes/stats/all`);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadActivityStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/activities/stats/all`);
      setActivityStats(response.data.stats);
    } catch (error) {
      console.error("Error loading activity stats:", error);
    }
  };

  const handleUpdateStatus = async (disputeId: number, status: string) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/disputes/${disputeId}/status`, { status });
      await loadDisputes();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !winner || !resolution) {
      toast.error("Please select winner and provide resolution");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_URL}/disputes/${selectedDispute.disputeId}/resolve`, {
        winner,
        resolution,
        resolvedBy: account,
      });
      setSelectedDispute(null);
      setResolution("");
      setWinner("");
      await loadDisputes();
      await loadStats();
      toast.success("Dispute resolved successfully!");
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">Please connect your wallet to access admin panel</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <p className="text-xl text-gray-600">Access Denied - Admin Only</p>
        <p className="text-sm text-gray-500 mt-2">Your wallet address is not authorized to access this page</p>
      </div>
    );
  }

  const openDisputes = disputes.filter((d) => d.status === "Open" || d.status === "Under Review");
  const resolvedDisputes = disputes.filter((d) => d.status === "Resolved");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage disputes and monitor platform activity</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats?.open || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats?.underReview || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Statistics */}
      {activityStats && (
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Jobs Posted</div>
                  <div className="text-2xl font-bold text-blue-600">{activityStats.jobsPosted}</div>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                  <div className="text-2xl font-bold text-green-600">{activityStats.jobsCompleted}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Skills Earned</div>
                  <div className="text-2xl font-bold text-yellow-600">{activityStats.skillsEarned}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Users Joined</div>
                  <div className="text-2xl font-bold text-purple-600">{activityStats.usersJoined}</div>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Last 24h</div>
                  <div className="text-2xl font-bold text-cyan-600">{activityStats.last24Hours}</div>
                </div>
                <Activity className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Management Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="disputes">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="disputes">
                <Shield className="h-4 w-4 mr-2" />
                Dispute Management
              </TabsTrigger>
              <TabsTrigger value="users">
                <Database className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
            </TabsList>

            {/* Disputes Tab */}
            <TabsContent value="disputes">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Dispute Management</h3>
                  <p className="text-gray-600">Review and resolve disputes</p>
                </div>

                <Tabs defaultValue="open">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="open">
                      Open Disputes ({openDisputes.length})
                    </TabsTrigger>
                    <TabsTrigger value="resolved">
                      Resolved ({resolvedDisputes.length})
                    </TabsTrigger>
                  </TabsList>

            <TabsContent value="open" className="space-y-4 mt-4">
              {openDisputes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No open disputes - all clear!</p>
                </div>
              ) : (
                openDisputes.map((dispute) => (
                  <Card key={dispute.disputeId} className="border-2 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">Dispute #{dispute.disputeId}</h3>
                            <Badge
                              variant={dispute.status === "Open" ? "default" : "secondary"}
                            >
                              {dispute.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Job ID: {dispute.jobId} • Amount: {formatEther(dispute.amount)} ETH
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {formatDate(new Date(dispute.createdAt).getTime() / 1000)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {dispute.status === "Open" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(dispute.disputeId, "Under Review")}
                              disabled={loading}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSelectedDispute(dispute)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Client</h4>
                          <p className="text-sm text-gray-600 mb-2">{formatAddress(dispute.client)}</p>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Evidence:</p>
                            <p className="text-sm text-gray-700">
                              {dispute.clientEvidence || "No evidence submitted"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm mb-2">Freelancer</h4>
                          <p className="text-sm text-gray-600 mb-2">{formatAddress(dispute.freelancer)}</p>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-green-900 mb-1">Evidence:</p>
                            <p className="text-sm text-gray-700">
                              {dispute.freelancerEvidence || "No evidence submitted"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4 mt-4">
              {resolvedDisputes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No resolved disputes yet</p>
                </div>
              ) : (
                resolvedDisputes.map((dispute) => (
                  <Card key={dispute.disputeId} className="border-2 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">Dispute #{dispute.disputeId}</h3>
                            <Badge variant="secondary">Resolved</Badge>
                            <Badge
                              variant={
                                dispute.winner === "Client"
                                  ? "default"
                                  : dispute.winner === "Freelancer"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              Winner: {dispute.winner}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Job ID: {dispute.jobId} • Amount: {formatEther(dispute.amount)} ETH
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Resolved: {formatDate(new Date(dispute.resolvedAt).getTime() / 1000)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 mb-2">Resolution:</p>
                        <p className="text-sm text-gray-700">{dispute.resolution}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">User Management</h3>
                  <p className="text-gray-600">View and manage all platform users</p>
                </div>

                <UserManagementTab />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Resolve Dispute #{selectedDispute.disputeId}</CardTitle>
              <CardDescription>Select winner and provide detailed resolution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Winner</label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={winner === "Client" ? "default" : "outline"}
                    onClick={() => setWinner("Client")}
                    className="w-full"
                  >
                    Client
                  </Button>
                  <Button
                    variant={winner === "Freelancer" ? "default" : "outline"}
                    onClick={() => setWinner("Freelancer")}
                    className="w-full"
                  >
                    Freelancer
                  </Button>
                  <Button
                    variant={winner === "Split" ? "default" : "outline"}
                    onClick={() => setWinner("Split")}
                    className="w-full"
                  >
                    Split (50/50)
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resolution Details</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Provide detailed explanation of your decision..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleResolveDispute}
                  disabled={loading || !winner || !resolution}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve Dispute
                </Button>
                <Button
                  onClick={() => {
                    setSelectedDispute(null);
                    setResolution("");
                    setWinner("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
