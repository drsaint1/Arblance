import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
  Shield,
  Users,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { ethers } from "ethers";
import { formatAddress } from "@/lib/utils";
import { SUPPORTED_TOKENS, getTokenAddress } from "@/config/tokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ERC20_ABI } from "@/contracts/erc20Abi";
import { escrowApi } from "@/services/api.service";
import toast from "react-hot-toast";

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

interface Milestone {
  id: string;
  description: string;
  amount: string;
  released: boolean;
}

interface EscrowContract {
  id: string;
  creator: string;
  recipient: string;
  totalAmount: string;
  releasedAmount: string;
  milestones: Milestone[];
  status: "active" | "completed" | "cancelled";
  createdAt: number;
  token: string;
}

export default function PaymentsPage() {
  const { account, provider, signer } = useWeb3();
  const { balances, loading: balancesLoading, loadBalances, hasBalance, approveToken, network } = useTokenBalances();
  const [activeTab, setActiveTab] = useState("multi-payment");

  // Token selection
  const [selectedToken, setSelectedToken] = useState("ETH");

  // Multi-payment state
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", address: "", amount: "" },
  ]);
  const [sending, setSending] = useState(false);

  // Escrow state
  const [escrowRecipient, setEscrowRecipient] = useState("");
  const [escrowToken, setEscrowToken] = useState("ETH");
  const [escrowMilestones, setEscrowMilestones] = useState<Milestone[]>([
    { id: "1", description: "", amount: "", released: false },
  ]);
  const [creatingEscrow, setCreatingEscrow] = useState(false);
  const [escrowContracts, setEscrowContracts] = useState<EscrowContract[]>([]);

  useEffect(() => {
    if (account) {
      loadEscrowContracts();
    }
  }, [account]);

  const loadEscrowContracts = async () => {
    if (!account) return;
    try {
      const response = await escrowApi.getUserEscrows(account);
      if (response.escrows) {
        setEscrowContracts(response.escrows);
      }
    } catch (error) {
      console.error("Error loading escrow contracts:", error);
    }
  };

  // Multi-payment functions
  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now().toString(), address: "", amount: "" },
    ]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: "address" | "amount", value: string) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const calculateTotalAmount = () => {
    return recipients
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
      .toFixed(selectedToken === "ETH" ? 4 : 2);
  };

  const sendMultiPayment = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    for (const recipient of recipients) {
      if (!ethers.isAddress(recipient.address)) {
        toast.error(`Invalid address: ${recipient.address}`);
        return;
      }
      if (!recipient.amount || parseFloat(recipient.amount) <= 0) {
        toast.error("All amounts must be greater than 0");
        return;
      }
    }

    // Check balance
    const totalAmount = calculateTotalAmount();
    if (!hasBalance(selectedToken, totalAmount)) {
      toast.error(`Insufficient ${selectedToken} balance`);
      return;
    }

    try {
      setSending(true);

      if (selectedToken === "ETH") {
        // Send ETH
        for (const recipient of recipients) {
          const tx = await signer.sendTransaction({
            to: recipient.address,
            value: ethers.parseEther(recipient.amount),
          });
          await tx.wait();
        }
      } else {
        // Send ERC20 tokens
        const tokenAddress = getTokenAddress(selectedToken, network);
        if (!tokenAddress) {
          toast.error("Token not supported on this network");
          return;
        }

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const token = SUPPORTED_TOKENS[selectedToken];

        for (const recipient of recipients) {
          const amount = ethers.parseUnits(recipient.amount, token.decimals);
          const tx = await tokenContract.transfer(recipient.address, amount);
          await tx.wait();
        }
      }

      toast.success("All payments sent successfully!");
      setRecipients([{ id: "1", address: "", amount: "" }]);
      loadBalances();
    } catch (error: any) {
      console.error("Payment failed:", error);
      toast.error(error.message || "Payment failed");
    } finally {
      setSending(false);
    }
  };

  // Escrow functions
  const addMilestone = () => {
    setEscrowMilestones([
      ...escrowMilestones,
      { id: Date.now().toString(), description: "", amount: "", released: false },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (escrowMilestones.length > 1) {
      setEscrowMilestones(escrowMilestones.filter((m) => m.id !== id));
    }
  };

  const updateMilestone = (
    id: string,
    field: "description" | "amount",
    value: string
  ) => {
    setEscrowMilestones(
      escrowMilestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const calculateEscrowTotal = () => {
    return escrowMilestones
      .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0)
      .toFixed(escrowToken === "ETH" ? 4 : 2);
  };

  const createEscrowContract = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!ethers.isAddress(escrowRecipient)) {
      toast.error("Invalid recipient address");
      return;
    }

    for (const milestone of escrowMilestones) {
      if (!milestone.description || !milestone.amount || parseFloat(milestone.amount) <= 0) {
        toast.error("All milestones must have description and amount");
        return;
      }
    }

    const totalAmount = calculateEscrowTotal();
    if (!hasBalance(escrowToken, totalAmount)) {
      toast.error(`Insufficient ${escrowToken} balance`);
      return;
    }

    try {
      setCreatingEscrow(true);

      let transactionHash = "";

      if (escrowToken === "ETH") {
        const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS;
        if (!escrowAddress) {
          toast.error("Escrow contract address not configured");
          return;
        }
        const tx = await signer.sendTransaction({
          to: escrowAddress,
          value: ethers.parseEther(totalAmount),
        });
        const receipt = await tx.wait();
        transactionHash = receipt.hash;
      } else {
        const tokenAddress = getTokenAddress(escrowToken, network);
        if (!tokenAddress) {
          toast.error("Token not supported on this network");
          return;
        }

        const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_PAYMENT_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS;
        if (!escrowAddress) {
          toast.error("Escrow contract address not configured");
          return;
        }

        const approved = await approveToken(escrowToken, escrowAddress, totalAmount);
        if (!approved) {
          toast.error("Token approval failed");
          return;
        }

        const token = SUPPORTED_TOKENS[escrowToken];
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const amount = ethers.parseUnits(totalAmount, token.decimals);
        const tx = await tokenContract.transfer(escrowAddress, amount);
        const receipt = await tx.wait();
        transactionHash = receipt.hash;
      }

      // Save escrow record to backend
      const contractId = Date.now().toString();
      await escrowApi.createEscrowRecord({
        contractId,
        creator: account,
        recipient: escrowRecipient,
        totalAmount,
        milestones: escrowMilestones.map((m) => ({
          description: m.description,
          amount: m.amount,
          released: false,
        })),
        transactionHash,
      });

      toast.success("Escrow contract created successfully!");
      setEscrowRecipient("");
      setEscrowMilestones([{ id: "1", description: "", amount: "", released: false }]);
      loadBalances();
      loadEscrowContracts();
    } catch (error: any) {
      console.error("Escrow creation failed:", error);
      toast.error(error.message || "Failed to create escrow contract");
    } finally {
      setCreatingEscrow(false);
    }
  };

  const releaseMilestone = async (contractId: string, milestoneId: string) => {
    if (!signer || !account) return;

    const contract = escrowContracts.find((c) => c.id === contractId);
    if (!contract) return;

    if (contract.creator.toLowerCase() !== account.toLowerCase()) {
      toast.error("Only the contract creator can release funds");
      return;
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.released) return;

    try {
      if (contract.token === "ETH") {
        const tx = await signer.sendTransaction({
          to: contract.recipient,
          value: ethers.parseEther(milestone.amount),
        });
        await tx.wait();
      } else {
        const tokenAddress = getTokenAddress(contract.token, network);
        if (!tokenAddress) return;

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const token = SUPPORTED_TOKENS[contract.token];
        const amount = ethers.parseUnits(milestone.amount, token.decimals);

        const tx = await tokenContract.transfer(contract.recipient, amount);
        await tx.wait();
      }

      // Find milestone index and update backend
      const milestoneIndex = contract.milestones.findIndex((m) => m.id === milestoneId);
      const newReleasedAmount = (
        parseFloat(contract.releasedAmount) + parseFloat(milestone.amount)
      ).toFixed(contract.token === "ETH" ? 4 : 2);

      await escrowApi.releaseMilestone(contract.id, milestoneIndex, newReleasedAmount);

      toast.success("Milestone payment released!");
      loadBalances();
      loadEscrowContracts();
    } catch (error: any) {
      console.error("Release failed:", error);
      toast.error(error.message || "Failed to release milestone payment");
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <CreditCard className="h-16 w-16 mx-auto text-blue-500" />
          <p className="text-xl text-gray-600">
            Please connect your wallet to access payment features
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Payments & Escrow
        </h1>
        <p className="text-gray-600">
          Send payments in ETH, USDT, or USDC to multiple wallets or create secure escrow contracts
        </p>
      </motion.div>

      {/* Token Balances */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Balances
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadBalances}
              disabled={balancesLoading}
            >
              <RefreshCw className={`h-4 w-4 ${balancesLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(balances).map(([symbol, balance]) => (
              <div
                key={symbol}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{balance.icon}</span>
                  <span className="font-semibold text-gray-700">{symbol}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {balance.balanceFormatted}
                </div>
                <div className="text-xs text-gray-500">{balance.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="multi-payment" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Multi Payment
          </TabsTrigger>
          <TabsTrigger value="escrow" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Escrow
          </TabsTrigger>
        </TabsList>

        {/* Multi-Payment Tab */}
        <TabsContent value="multi-payment" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Send to Multiple Wallets
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Send ETH, USDT, or USDC to multiple addresses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Token Selection */}
                <div className="space-y-2">
                  <Label>Payment Token</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(SUPPORTED_TOKENS).map((token) => (
                      <Button
                        key={token}
                        variant={selectedToken === token ? "default" : "outline"}
                        className={selectedToken === token ? "bg-blue-600" : ""}
                        onClick={() => setSelectedToken(token)}
                      >
                        <span className="mr-2 text-xl">{SUPPORTED_TOKENS[token].icon}</span>
                        {token}
                      </Button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {recipients.map((recipient, index) => (
                    <motion.div
                      key={recipient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 p-4 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold text-gray-700">
                          Recipient #{index + 1}
                        </Label>
                        {recipients.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Wallet Address</Label>
                        <Input
                          placeholder="0x..."
                          value={recipient.address}
                          onChange={(e) =>
                            updateRecipient(recipient.id, "address", e.target.value)
                          }
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Amount ({selectedToken})</Label>
                        <Input
                          type="number"
                          step={selectedToken === "ETH" ? "0.0001" : "0.01"}
                          placeholder="0.0"
                          value={recipient.amount}
                          onChange={(e) =>
                            updateRecipient(recipient.id, "amount", e.target.value)
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  onClick={addRecipient}
                  variant="outline"
                  className="w-full border-dashed border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold mb-4">
                    <span>Total Amount:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{SUPPORTED_TOKENS[selectedToken].icon}</span>
                      <span className="text-blue-600">{calculateTotalAmount()} {selectedToken}</span>
                    </div>
                  </div>

                  <Button
                    onClick={sendMultiPayment}
                    disabled={sending || recipients.some(r => !r.address || !r.amount)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg py-6"
                    size="lg"
                  >
                    {sending ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send {selectedToken} to {recipients.length} Recipient{recipients.length > 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Escrow Tab - continuing in next message due to length */}
        <TabsContent value="escrow" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Create Escrow Contract
                </CardTitle>
                <CardDescription className="text-green-100">
                  Create a milestone-based escrow contract with ETH, USDT, or USDC
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Token Selection for Escrow */}
                <div className="space-y-2">
                  <Label>Escrow Token</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(SUPPORTED_TOKENS).map((token) => (
                      <Button
                        key={token}
                        variant={escrowToken === token ? "default" : "outline"}
                        className={escrowToken === token ? "bg-green-600" : ""}
                        onClick={() => setEscrowToken(token)}
                      >
                        <span className="mr-2 text-xl">{SUPPORTED_TOKENS[token].icon}</span>
                        {token}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recipient Wallet Address</Label>
                  <Input
                    placeholder="0x..."
                    value={escrowRecipient}
                    onChange={(e) => setEscrowRecipient(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Milestones</Label>

                  <AnimatePresence>
                    {escrowMilestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 p-4 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold text-gray-700">
                            Milestone #{index + 1}
                          </Label>
                          {escrowMilestones.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(milestone.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Description</Label>
                          <Input
                            placeholder="E.g., Initial design mockups"
                            value={milestone.description}
                            onChange={(e) =>
                              updateMilestone(milestone.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Amount ({escrowToken})</Label>
                          <Input
                            type="number"
                            step={escrowToken === "ETH" ? "0.0001" : "0.01"}
                            placeholder="0.0"
                            value={milestone.amount}
                            onChange={(e) =>
                              updateMilestone(milestone.id, "amount", e.target.value)
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    onClick={addMilestone}
                    variant="outline"
                    className="w-full border-dashed border-2 border-green-300 hover:border-green-500 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold mb-4">
                    <span>Total Escrow Amount:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{SUPPORTED_TOKENS[escrowToken].icon}</span>
                      <span className="text-green-600">{calculateEscrowTotal()} {escrowToken}</span>
                    </div>
                  </div>

                  <Button
                    onClick={createEscrowContract}
                    disabled={
                      creatingEscrow ||
                      !escrowRecipient ||
                      escrowMilestones.some(m => !m.description || !m.amount)
                    }
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-lg py-6"
                    size="lg"
                  >
                    {creatingEscrow ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Creating Contract...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Create Escrow with {escrowToken}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Existing Escrow Contracts */}
          {escrowContracts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">Your Escrow Contracts</h2>
              <div className="space-y-4">
                {escrowContracts.map((contract, idx) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`border-2 ${
                      contract.status === "completed"
                        ? "border-green-300 bg-green-50"
                        : contract.status === "cancelled"
                        ? "border-red-300 bg-red-50"
                        : "border-blue-300"
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Escrow Contract ({contract.token})
                            </CardTitle>
                            <CardDescription className="mt-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">From:</span>
                                  <code className="text-xs">{formatAddress(contract.creator)}</code>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">To:</span>
                                  <code className="text-xs">{formatAddress(contract.recipient)}</code>
                                </div>
                              </div>
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              contract.status === "completed"
                                ? "default"
                                : contract.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              contract.status === "completed"
                                ? "bg-green-600"
                                : contract.status === "active"
                                ? "bg-blue-600"
                                : ""
                            }
                          >
                            {contract.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                          <span className="font-semibold">Total Amount:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{SUPPORTED_TOKENS[contract.token].icon}</span>
                            <span className="text-lg font-bold text-blue-600">
                              {contract.totalAmount} {contract.token}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                          <span className="font-semibold">Released:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{SUPPORTED_TOKENS[contract.token].icon}</span>
                            <span className="text-lg font-bold text-green-600">
                              {contract.releasedAmount} {contract.token}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-700">Milestones:</h4>
                          {contract.milestones.map((milestone, mIdx) => (
                            <div
                              key={milestone.id}
                              className={`p-3 rounded-lg border-2 ${
                                milestone.released
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      Milestone {mIdx + 1}
                                    </span>
                                    {milestone.released ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {milestone.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <span className="text-lg">{SUPPORTED_TOKENS[contract.token].icon}</span>
                                  <span className="font-bold text-blue-600">
                                    {milestone.amount}
                                  </span>
                                </div>
                              </div>
                              {!milestone.released &&
                                contract.status === "active" &&
                                contract.creator.toLowerCase() === account.toLowerCase() && (
                                  <Button
                                    onClick={() => releaseMilestone(contract.id, milestone.id)}
                                    size="sm"
                                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                                  >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Release Payment
                                  </Button>
                                )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
