import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AISuggestions } from "@/components/AISuggestions";
import { SkillCategory, SkillCategoryNames, BadgeTier, BadgeTierNames } from "@/types";
import { parseEther, formatEther, parseUnits, Contract } from "ethers";
import { getSupportedPaymentTokens, type TokenInfo } from "@/config/tokens";
import { CONTRACTS } from "@/lib/contracts";
import {
  Briefcase, DollarSign, Calendar, Award, FileText,
  CheckCircle, ArrowRight, ArrowLeft, Sparkles, Lock,
  AlertCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// Minimal ERC20 ABI for approve function
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

const steps = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Requirements", icon: Award },
  { id: 3, title: "Budget & Timeline", icon: DollarSign },
  { id: 4, title: "Review", icon: CheckCircle },
];

export default function PostJobPage() {
  const router = useRouter();
  const { marketplaceContract, account, signer } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [posting, setPosting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    paymentToken: "0x0000000000000000000000000000000000000000", // Default to ETH
    requiredSkill: SkillCategory.WebDevelopment,
    minimumTier: BadgeTier.BRONZE,
    deadline: "",
  });
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    // Load available payment tokens
    if (account) {
      const tokens = getSupportedPaymentTokens(421614); // Arbitrum Sepolia chainId
      setAvailableTokens(tokens);
    }
  }, [account]);

  // Check if token approval is needed when payment token or budget changes
  useEffect(() => {
    const checkApproval = async () => {
      if (!account || !signer || !formData.budget || parseFloat(formData.budget) <= 0) {
        setIsApproved(false);
        return;
      }

      const isETH = formData.paymentToken === "0x0000000000000000000000000000000000000000";

      if (isETH) {
        // ETH doesn't need approval
        setIsApproved(true);
        return;
      }

      try {
        const token = availableTokens.find(t => t.address === formData.paymentToken);
        if (!token) {
          setIsApproved(false);
          return;
        }

        const tokenContract = new Contract(formData.paymentToken, ERC20_ABI, signer);
        const budgetTokens = parseUnits(formData.budget, token.decimals);
        const allowance = await tokenContract.allowance(account, CONTRACTS.MARKETPLACE);

        setIsApproved(allowance >= budgetTokens);
      } catch (error) {
        console.error("Error checking approval:", error);
        setIsApproved(false);
      }
    };

    checkApproval();
  }, [account, signer, formData.paymentToken, formData.budget, availableTokens]);

  const handleApprove = async () => {
    if (!signer || !account) return;

    try {
      setApproving(true);

      const token = availableTokens.find(t => t.address === formData.paymentToken);
      if (!token) throw new Error("Token not found");

      const tokenContract = new Contract(formData.paymentToken, ERC20_ABI, signer);
      const budgetTokens = parseUnits(formData.budget, token.decimals);

      const tx = await tokenContract.approve(CONTRACTS.MARKETPLACE, budgetTokens);
      await tx.wait();

      setIsApproved(true);
    } catch (error: any) {
      console.error("Error approving token:", error);
      toast.error(error.message || "Failed to approve token");
    } finally {
      setApproving(false);
    }
  };

  const handleSubmit = async () => {
    if (!marketplaceContract) return;

    const isETH = formData.paymentToken === "0x0000000000000000000000000000000000000000";

    // Check approval for ERC20 tokens
    if (!isETH && !isApproved) {
      toast.error("Please approve token spending first");
      return;
    }

    try {
      setPosting(true);

      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

      let tx;
      if (isETH) {
        // ETH payment
        const budgetWei = parseEther(formData.budget);
        tx = await marketplaceContract.postJob(
          formData.title,
          formData.description,
          budgetWei,
          formData.requiredSkill,
          formData.minimumTier,
          deadlineTimestamp,
          { value: budgetWei }
        );
      } else {
        // ERC20 token payment
        const token = availableTokens.find(t => t.address === formData.paymentToken);
        if (!token) throw new Error("Token not found");

        const budgetTokens = parseUnits(formData.budget, token.decimals);

        tx = await marketplaceContract.postJobWithToken(
          formData.title,
          formData.description,
          budgetTokens,
          formData.paymentToken,
          formData.requiredSkill,
          formData.minimumTier,
          deadlineTimestamp
        );
      }

      await tx.wait();

      // Show success animation then redirect
      setTimeout(() => {
        router.push("/jobs");
      }, 2000);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast.error(error.message || "Failed to post job");
      setPosting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.requiredSkill !== undefined;
      case 3:
        return formData.budget && parseFloat(formData.budget) > 0 && formData.deadline;
      default:
        return true;
    }
  };

  const canProceed = isStepValid(currentStep);

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-xl text-gray-600">Please connect your wallet to post a job</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Post a New Job
        </h1>
        <p className="text-gray-600">Find the perfect freelancer for your project in 4 easy steps</p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center max-w-3xl mx-auto"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <motion.div
                whileHover={{ scale: isCompleted || isActive ? 1.05 : 1 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "rgb(34, 197, 94)"
                      : isActive
                      ? "rgb(37, 99, 235)"
                      : "rgb(229, 231, 235)",
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted
                      ? "text-white"
                      : isActive
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </motion.div>
                <span
                  className={`text-sm font-medium ${
                    isCompleted || isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-green-500"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title *</label>
                      <Input
                        required
                        placeholder="e.g., Build a React Dashboard"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1 mb-3">Make it clear and specific</p>

                      <AISuggestions
                        type="title"
                        onSelect={(suggestion) => setFormData({ ...formData, title: suggestion })}
                        context={{ keywords: formData.title }}
                        currentValue={formData.title}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Project Description *</label>
                      <Textarea
                        required
                        placeholder="Describe your project in detail. What needs to be done? What are the deliverables?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={8}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1 mb-3">
                        {formData.description.length} characters
                      </p>

                      <AISuggestions
                        type="description"
                        onSelect={(suggestion) => setFormData({ ...formData, description: suggestion })}
                        context={{ title: formData.title }}
                        currentValue={formData.description}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Requirements */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-4">Required Skill Badge *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(SkillCategoryNames).map(([key, value]) => (
                          <motion.div
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  requiredSkill: parseInt(key) as SkillCategory,
                                })
                              }
                              className={`w-full p-4 rounded-lg border-2 transition-all ${
                                formData.requiredSkill === parseInt(key)
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <Award
                                className={`h-6 w-6 mx-auto mb-2 ${
                                  formData.requiredSkill === parseInt(key)
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <span className="text-sm font-medium">{value}</span>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Only freelancers with this skill badge can apply
                      </p>
                    </div>

                    {/* Minimum Tier Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-4">
                        Minimum Badge Tier Required *
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          (Higher tiers = more experienced freelancers)
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(BadgeTierNames).map(([key, value]) => {
                          const tierKey = parseInt(key) as BadgeTier;
                          const tierColors = {
                            [BadgeTier.BRONZE]: "border-amber-700 bg-amber-50 text-amber-900",
                            [BadgeTier.SILVER]: "border-gray-400 bg-gray-50 text-gray-700",
                            [BadgeTier.GOLD]: "border-yellow-400 bg-yellow-50 text-yellow-900",
                            [BadgeTier.PLATINUM]: "border-cyan-400 bg-cyan-50 text-cyan-900",
                            [BadgeTier.DIAMOND]: "border-blue-400 bg-blue-50 text-blue-900",
                            [BadgeTier.LEGEND]: "border-purple-500 bg-purple-50 text-purple-900",
                          };

                          return (
                            <motion.div
                              key={key}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    minimumTier: tierKey,
                                  })
                                }
                                className={`w-full p-3 rounded-lg border-2 transition-all font-medium ${
                                  formData.minimumTier === tierKey
                                    ? tierColors[tierKey]
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                }`}
                              >
                                {value}
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        <AlertCircle className="inline h-3 w-3 mr-1" />
                        Higher tiers may reduce applications but ensure quality
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Budget & Timeline */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Payment Token Selector */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Payment Currency *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableTokens.map((token) => (
                          <motion.div
                            key={token.address}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  paymentToken: token.address,
                                })
                              }
                              className={`w-full p-4 rounded-lg border-2 transition-all ${
                                formData.paymentToken === token.address
                                  ? "border-blue-600 bg-blue-50 text-blue-600"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="text-lg font-bold">{token.symbol}</div>
                              <div className="text-xs text-gray-500">{token.name}</div>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Stablecoins eliminate crypto volatility for both parties
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Budget ({availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          required
                          placeholder="100"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="pl-10 text-lg"
                        />
                      </div>
                      {formData.budget && (
                        <p className="text-xs text-gray-500 mt-1">
                          Platform fee (2.5%): {(parseFloat(formData.budget) * 0.025).toFixed(4)} {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Deadline *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="datetime-local"
                          required
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="pl-10"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <div className="flex gap-2">
                        <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900 mb-1">Escrow Protection</h4>
                          <p className="text-sm text-amber-800">
                            Your funds will be securely held in a smart contract escrow until the job is completed.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Review Your Job Posting</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Title:</span>
                          <p className="text-gray-800 mt-1">{formData.title}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Description:</span>
                          <p className="text-gray-800 mt-1 line-clamp-3">{formData.description}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Required Skill:</span>
                          <p className="text-gray-800 mt-1">{SkillCategoryNames[formData.requiredSkill]}</p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Minimum Tier:</span>
                          <p className="text-gray-800 mt-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900">
                              {BadgeTierNames[formData.minimumTier]} Badge or Higher
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Payment Currency:</span>
                          <p className="text-gray-800 mt-1">
                            {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Budget:</span>
                          <p className="text-gray-800 mt-1">
                            {formData.budget} {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-600 font-medium">Deadline:</span>
                          <p className="text-gray-800 mt-1">
                            {new Date(formData.deadline).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Token Approval for ERC20 */}
                    {formData.paymentToken !== "0x0000000000000000000000000000000000000000" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border rounded-lg p-4 ${
                          isApproved
                            ? "bg-green-50 border-green-200"
                            : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isApproved ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${
                              isApproved ? "text-green-900" : "text-amber-900"
                            }`}>
                              {isApproved ? "Token Approved ✓" : "Token Approval Required"}
                            </h4>
                            <p className={`text-sm mb-3 ${
                              isApproved ? "text-green-800" : "text-amber-800"
                            }`}>
                              {isApproved
                                ? `You've approved ${availableTokens.find(t => t.address === formData.paymentToken)?.symbol} spending. You can now post the job.`
                                : `You need to approve the marketplace to spend your ${availableTokens.find(t => t.address === formData.paymentToken)?.symbol} tokens.`
                              }
                            </p>
                            {!isApproved && (
                              <Button
                                type="button"
                                onClick={handleApprove}
                                disabled={approving}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                {approving ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Approve {availableTokens.find(t => t.address === formData.paymentToken)?.symbol}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Funds will be locked in smart contract escrow</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Qualified freelancers can start applying</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>You choose the best applicant</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>Payment released upon completion</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < 4 ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={posting || (!isApproved && formData.paymentToken !== "0x0000000000000000000000000000000000000000")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {posting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Post Job & Lock Funds
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24 space-y-4">
            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Write a clear, detailed description to attract quality applicants</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Choose the right skill badge to filter qualified freelancers</p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">Set a realistic deadline and fair budget for best results</p>
                </div>
              </CardContent>
            </Card>

            {formData.budget && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Job Budget:</span>
                      <span className="font-semibold">
                        {formData.budget} {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee (2.5%):</span>
                      <span className="font-semibold">
                        {(parseFloat(formData.budget) * 0.025).toFixed(4)} {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Total Cost:</span>
                      <span className="font-bold text-blue-600">
                        {formData.budget} {availableTokens.find(t => t.address === formData.paymentToken)?.symbol || 'ETH'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pt-2">
                      Fee is deducted from freelancer payment upon completion
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
