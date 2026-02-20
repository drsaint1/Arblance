import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ESCROW_ABI } from "@/contracts/escrowAbi";
import { useWeb3 } from "@/contexts/Web3Context";
import { escrowApi } from "@/services/api.service";

// You'll need to update this with the actual deployed contract address
const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "";

export interface Milestone {
  description: string;
  amount: string;
  released: boolean;
}

export interface EscrowContractData {
  id: string;
  creator: string;
  recipient: string;
  totalAmount: string;
  releasedAmount: string;
  milestones: Milestone[];
  status: "active" | "completed" | "cancelled";
  createdAt: number;
}

export const useEscrowContract = () => {
  const { signer, account, provider } = useWeb3();
  const [escrowContract, setEscrowContract] = useState<ethers.Contract | null>(null);
  const [userContracts, setUserContracts] = useState<EscrowContractData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (signer && ESCROW_CONTRACT_ADDRESS) {
      const contract = new ethers.Contract(
        ESCROW_CONTRACT_ADDRESS,
        ESCROW_ABI,
        signer
      );
      setEscrowContract(contract);
    }
  }, [signer]);

  const createEscrow = async (
    recipient: string,
    descriptions: string[],
    amounts: string[]
  ) => {
    if (!escrowContract || !account) {
      throw new Error("Contract not initialized or wallet not connected");
    }

    setLoading(true);
    try {
      // Calculate total amount
      const amountsInWei = amounts.map((amount) => ethers.parseEther(amount));
      const totalAmount = amountsInWei.reduce(
        (sum, amount) => sum + amount,
        BigInt(0)
      );

      // Create contract on blockchain
      const tx = await escrowContract.createContract(
        recipient,
        descriptions,
        amountsInWei,
        { value: totalAmount }
      );

      const receipt = await tx.wait();

      // Extract contract ID from event
      const event = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === "ContractCreated"
      );

      let contractId = "0";
      if (event) {
        contractId = event.args[0].toString();
      }

      // Save to backend
      const milestones = descriptions.map((desc, idx) => ({
        description: desc,
        amount: amounts[idx],
        released: false,
      }));

      await escrowApi.createEscrowRecord({
        contractId,
        creator: account,
        recipient,
        totalAmount: ethers.formatEther(totalAmount),
        milestones,
        transactionHash: receipt.hash,
      });

      await loadUserContracts();
      return contractId;
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const releaseMilestone = async (contractId: string, milestoneIndex: number) => {
    if (!escrowContract || !account) {
      throw new Error("Contract not initialized or wallet not connected");
    }

    setLoading(true);
    try {
      // Release on blockchain
      const tx = await escrowContract.releaseMilestone(
        contractId,
        milestoneIndex
      );
      await tx.wait();

      // Get updated contract info
      const contractData = await escrowContract.getContract(contractId);
      const releasedAmount = ethers.formatEther(contractData[3]); // releasedAmount

      // Update backend
      await escrowApi.releaseMilestone(contractId, milestoneIndex, releasedAmount);

      await loadUserContracts();
    } catch (error) {
      console.error("Error releasing milestone:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelContract = async (contractId: string) => {
    if (!escrowContract || !account) {
      throw new Error("Contract not initialized or wallet not connected");
    }

    setLoading(true);
    try {
      const tx = await escrowContract.cancelContract(contractId);
      await tx.wait();

      // Update backend
      await escrowApi.cancelEscrow(contractId);

      await loadUserContracts();
    } catch (error) {
      console.error("Error cancelling contract:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadUserContracts = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const contracts = await escrowApi.getUserEscrows(account);
      setUserContracts(contracts);
    } catch (error) {
      console.error("Error loading user contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContractDetails = async (contractId: string) => {
    if (!escrowContract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [
        creator,
        recipient,
        totalAmount,
        releasedAmount,
        cancelled,
        completed,
        createdAt,
        milestoneCount,
      ] = await escrowContract.getContract(contractId);

      const [descriptions, amounts, released] = await escrowContract.getAllMilestones(
        contractId
      );

      const milestones: Milestone[] = descriptions.map((desc: string, idx: number) => ({
        description: desc,
        amount: ethers.formatEther(amounts[idx]),
        released: released[idx],
      }));

      return {
        id: contractId,
        creator,
        recipient,
        totalAmount: ethers.formatEther(totalAmount),
        releasedAmount: ethers.formatEther(releasedAmount),
        milestones,
        status: cancelled ? "cancelled" : completed ? "completed" : "active",
        createdAt: Number(createdAt),
      } as EscrowContractData;
    } catch (error) {
      console.error("Error getting contract details:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (account) {
      loadUserContracts();
    }
  }, [account]);

  return {
    escrowContract,
    userContracts,
    loading,
    createEscrow,
    releaseMilestone,
    cancelContract,
    getContractDetails,
    loadUserContracts,
  };
};
