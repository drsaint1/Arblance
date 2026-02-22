import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChatBox from "@/components/ChatBox";
import { RatingModal } from "@/components/RatingModal";
import { SkillCategoryNames, JobStatusNames } from "@/types";
import { formatEther, formatDate, formatTokenAmount, getTokenSymbol } from "@/lib/utils";
import {
  Briefcase,
  Clock,
  DollarSign,
  Award,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Star,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { account, marketplaceContract, skillBadgesContract } = useWeb3();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasRequiredSkill, setHasRequiredSkill] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [checkingRating, setCheckingRating] = useState(false);

  useEffect(() => {
    if (id && marketplaceContract) {
      loadJob();
    }
  }, [id, marketplaceContract]);

  useEffect(() => {
    if (account && job && skillBadgesContract) {
      checkUserSkills();
    }
  }, [account, job, skillBadgesContract]);

  useEffect(() => {
    if (account && job && job.status === 2) {
      checkIfRated();
    }
  }, [account, job]);

  const loadJob = async () => {
    if (!marketplaceContract || !id) return;

    try {
      setLoading(true);
      const jobData = await marketplaceContract.jobs(id);

      setJob({
        id: jobData.id,
        client: jobData.client,
        freelancer: jobData.freelancer,
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        paymentToken: jobData.paymentToken,
        requiredSkill: jobData.requiredSkill,
        minimumTier: jobData.minimumTier,
        status: jobData.status,
        deadline: jobData.deadline,
        createdAt: jobData.createdAt,
      });
    } catch (error) {
      console.error("Error loading job:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserSkills = async () => {
    if (!skillBadgesContract || !account || !job) return;

    try {
      const skillIds = await skillBadgesContract.getUserSkills(account);
      const hasSkill = skillIds.some(async (id: bigint) => {
        const details = await skillBadgesContract.getSkillDetails(id);
        return Number(details[1]) === Number(job.requiredSkill);
      });
      setHasRequiredSkill(hasSkill);
    } catch (error) {
      console.error("Error checking skills:", error);
    }
  };

  const checkIfRated = async () => {
    if (!account || !id) return;

    try {
      setCheckingRating(true);
      const response = await axios.get(`${API_URL}/ratings/job/${id}`);

      if (response.data.success && response.data.ratings) {
        const userRating = response.data.ratings.find(
          (rating: any) => rating.rater.toLowerCase() === account.toLowerCase()
        );
        setHasRated(!!userRating);
      }
    } catch (error) {
      console.error("Error checking rating:", error);
    } finally {
      setCheckingRating(false);
    }
  };

  const handleApply = async () => {
    if (!marketplaceContract || !id) return;

    try {
      const tx = await marketplaceContract.applyForJob(id);
      await tx.wait();
      toast.success("Application submitted successfully!");
      loadJob();
    } catch (error: any) {
      console.error("Error applying:", error);
      toast.error(error.message || "Failed to apply for job");
    }
  };

  const handleAcceptFreelancer = async () => {
    if (!marketplaceContract || !id) return;

    try {
      const tx = await marketplaceContract.acceptFreelancer(id, job.freelancer);
      await tx.wait();
      toast.success("Freelancer accepted!");
      loadJob();
    } catch (error: any) {
      console.error("Error accepting freelancer:", error);
      toast.error(error.message || "Failed to accept freelancer");
    }
  };

  const handleCompleteJob = async () => {
    if (!marketplaceContract || !id) return;

    try {
      const tx = await marketplaceContract.completeJob(id);
      await tx.wait();
      toast.success("Job marked as complete!");
      await loadJob();
      checkIfRated();
    } catch (error: any) {
      console.error("Error completing job:", error);
      toast.error(error.message || "Failed to complete job");
    }
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    checkIfRated();
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to view job details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="h-12 w-12 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Job not found</p>
      </div>
    );
  }

  const isClient = job.client.toLowerCase() === account.toLowerCase();
  const isFreelancer = job.freelancer.toLowerCase() === account.toLowerCase();
  const canChat = isClient || isFreelancer;

  const statusIcon: Record<number, React.ReactNode> = {
    0: <Clock className="h-5 w-5" />, // Open
    1: <Briefcase className="h-5 w-5" />, // InProgress
    2: <CheckCircle className="h-5 w-5" />, // Completed
    3: <XCircle className="h-5 w-5" />, // Cancelled
    4: <AlertCircle className="h-5 w-5" />, // Disputed
  };

  const statusColor: Record<number, string> = {
    0: "bg-blue-500",
    1: "bg-yellow-500",
    2: "bg-green-500",
    3: "bg-red-500",
    4: "bg-orange-500",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor[job.status as number]}>
                      {statusIcon[job.status as number]}
                      <span className="ml-1">{JobStatusNames[job.status as keyof typeof JobStatusNames]}</span>
                    </Badge>
                    <Badge variant="outline">
                      <Award className="h-3 w-3 mr-1" />
                      {SkillCategoryNames[job.requiredSkill as keyof typeof SkillCategoryNames]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-bold text-lg">{formatTokenAmount(job.budget, job.paymentToken)} {getTokenSymbol(job.paymentToken)}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold">{formatDate(Number(job.deadline))}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Briefcase className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Posted</p>
                    <p className="font-semibold">{formatDate(Number(job.createdAt))}</p>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Client:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{job.client}</code>
                </div>
                {job.freelancer !== "0x0000000000000000000000000000000000000000" && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Freelancer:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{job.freelancer}</code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === 0 && !isClient && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleApply}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!hasRequiredSkill}
                  >
                    {hasRequiredSkill ? "Apply for Job" : "Missing Required Skill"}
                  </Button>
                </motion.div>
              )}

              {job.status === 0 && isClient && job.freelancer !== "0x0000000000000000000000000000000000000000" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleAcceptFreelancer} className="w-full bg-green-600 hover:bg-green-700">
                    Accept Freelancer
                  </Button>
                </motion.div>
              )}

              {job.status === 1 && isFreelancer && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleCompleteJob} className="w-full bg-green-600 hover:bg-green-700">
                    Mark as Complete
                  </Button>
                </motion.div>
              )}

              {job.status === 2 && (isClient || isFreelancer) && !hasRated && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                    disabled={checkingRating}
                  >
                    <Star className="h-4 w-4 mr-2 fill-white" />
                    Rate {isClient ? "Freelancer" : "Client"}
                  </Button>
                </motion.div>
              )}

              {job.status === 2 && (isClient || isFreelancer) && hasRated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Rating Submitted</span>
                  </div>
                </motion.div>
              )}

              {canChat && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showChat ? "Hide Chat" : "Open Chat"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {!hasRequiredSkill && !isClient && job.status === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-yellow-500 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Skill Required</p>
                      <p className="text-sm text-yellow-700">
                        You need the {SkillCategoryNames[job.requiredSkill as keyof typeof SkillCategoryNames]} badge to apply for this job.
                        Visit the Skills page to earn it!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Chat Section */}
      {canChat && showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChatBox
            jobId={id as string}
            currentUser={account}
            otherUser={isClient ? job.freelancer : job.client}
            otherUserName={isClient ? "Freelancer" : "Client"}
          />
        </motion.div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={handleRatingSubmitted}
        jobId={id as string}
        rater={account}
        ratee={isClient ? job.freelancer : job.client}
        raterType={isClient ? "Buyer" : "Seller"}
        rateeName={isClient ? "Freelancer" : "Client"}
      />
    </div>
  );
}
