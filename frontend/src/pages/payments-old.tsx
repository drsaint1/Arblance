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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shield,
  Users,
} from "lucide-react";
import { ethers } from "ethers";
import { formatAddress } from "@/lib/utils";
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
}

export default function PaymentsPage() {
  const { account, provider, signer } = useWeb3();
  const [activeTab, setActiveTab] = useState("multi-payment");

  // Multi-payment state
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", address: "", amount: "" },
  ]);
  const [sending, setSending] = useState(false);

  // Escrow state
  const [escrowRecipient, setEscrowRecipient] = useState("");
  const [escrowMilestones, setEscrowMilestones] = useState<Milestone[]>([
    { id: "1", description: "", amount: "", released: false },
  ]);
  const [creatingEscrow, setCreatingEscrow] = useState(false);
  const [escrowContracts, setEscrowContracts] = useState<EscrowContract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Load escrow contracts when account changes
  useEffect(() => {
    if (account) {
      loadEscrowContracts();
    }
  }, [account]);

  const loadEscrowContracts = () => {
    // In production, this would fetch from backend/smart contract
    // For now, load from localStorage
    const stored = localStorage.getItem(`escrow_${account}`);
    if (stored) {
      setEscrowContracts(JSON.parse(stored));
    }
  };

  const saveEscrowContracts = (contracts: EscrowContract[]) => {
    if (account) {
      localStorage.setItem(`escrow_${account}`, JSON.stringify(contracts));
      setEscrowContracts(contracts);
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
      .toFixed(4);
  };

  const sendMultiPayment = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validate all recipients
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

    try {
      setSending(true);

      // Send payments sequentially
      for (const recipient of recipients) {
        const tx = await signer.sendTransaction({
          to: recipient.address,
          value: ethers.parseEther(recipient.amount),
        });
        await tx.wait();
      }

      toast.success("All payments sent successfully!");
      setRecipients([{ id: "1", address: "", amount: "" }]);
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
      .toFixed(4);
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

    // Validate milestones
    for (const milestone of escrowMilestones) {
      if (!milestone.description || !milestone.amount || parseFloat(milestone.amount) <= 0) {
        toast.error("All milestones must have description and amount");
        return;
      }
    }

    try {
      setCreatingEscrow(true);

      const totalAmount = calculateEscrowTotal();

      // Send funds to escrow (in production, this would be a smart contract)
      // For demo, we'll just track it in state
      const newContract: EscrowContract = {
        id: Date.now().toString(),
        creator: account,
        recipient: escrowRecipient,
        totalAmount,
        releasedAmount: "0",
        milestones: escrowMilestones.map((m) => ({ ...m })),
        status: "active",
        createdAt: Date.now(),
      };

      // In production, send ETH to smart contract here
      const tx = await signer.sendTransaction({
        to: account, // In production, this would be the escrow contract address
        value: ethers.parseEther(totalAmount),
      });
      await tx.wait();

      // Save contract
      const updatedContracts = [...escrowContracts, newContract];
      saveEscrowContracts(updatedContracts);

      // Also save for recipient to see
      const recipientContracts = JSON.parse(
        localStorage.getItem(`escrow_${escrowRecipient}`) || "[]"
      );
      recipientContracts.push(newContract);
      localStorage.setItem(
        `escrow_${escrowRecipient}`,
        JSON.stringify(recipientContracts)
      );

      toast.success("Escrow contract created successfully!");
      setEscrowRecipient("");
      setEscrowMilestones([{ id: "1", description: "", amount: "", released: false }]);
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

    // Only creator can release funds
    if (contract.creator.toLowerCase() !== account.toLowerCase()) {
      toast.error("Only the contract creator can release funds");
      return;
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.released) return;

    try {
      // In production, call smart contract to release funds
      const tx = await signer.sendTransaction({
        to: contract.recipient,
        value: ethers.parseEther(milestone.amount),
      });
      await tx.wait();

      // Update contract state
      const updatedContracts = escrowContracts.map((c) => {
        if (c.id === contractId) {
          const updatedMilestones = c.milestones.map((m) =>
            m.id === milestoneId ? { ...m, released: true } : m
          );
          const releasedAmount = (
            parseFloat(c.releasedAmount) + parseFloat(milestone.amount)
          ).toFixed(4);
          const allReleased = updatedMilestones.every((m) => m.released);
          return {
            ...c,
            milestones: updatedMilestones,
            releasedAmount,
            status: allReleased ? ("completed" as const) : c.status,
          };
        }
        return c;
      });

      saveEscrowContracts(updatedContracts);

      // Update for recipient too
      const recipientContracts = JSON.parse(
        localStorage.getItem(`escrow_${contract.recipient}`) || "[]"
      );
      const updatedRecipientContracts = recipientContracts.map((c: EscrowContract) =>
        c.id === contractId
          ? updatedContracts.find((uc) => uc.id === contractId)
          : c
      );
      localStorage.setItem(
        `escrow_${contract.recipient}`,
        JSON.stringify(updatedRecipientContracts)
      );

      toast.success("Milestone payment released!");
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
          Send payments to multiple wallets or create secure escrow contracts
        </p>
      </motion.div>

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
                  Send ETH to multiple addresses in one transaction batch
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                        <Label className="text-sm">Amount (ETH)</Label>
                        <Input
                          type="number"
                          step="0.0001"
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
                    <span className="text-blue-600">{calculateTotalAmount()} ETH</span>
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
                        Send to {recipients.length} Recipient{recipients.length > 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Escrow Tab */}
        <TabsContent value="escrow" className="space-y-6">
          {/* Create Escrow */}
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
                  Create a milestone-based escrow contract with another user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                          <Label className="text-sm">Amount (ETH)</Label>
                          <Input
                            type="number"
                            step="0.0001"
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
                    <span className="text-green-600">{calculateEscrowTotal()} ETH</span>
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
                        Create Escrow Contract
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
                              Escrow Contract
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
                          <span className="text-lg font-bold text-blue-600">
                            {contract.totalAmount} ETH
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                          <span className="font-semibold">Released:</span>
                          <span className="text-lg font-bold text-green-600">
                            {contract.releasedAmount} ETH
                          </span>
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
                                <span className="font-bold text-blue-600 ml-2">
                                  {milestone.amount} ETH
                                </span>
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
