import { Request, Response } from "express";
import { Escrow } from "../models/Escrow.model";

/**
 * Create a new escrow contract record
 */
export const createEscrowRecord = async (req: Request, res: Response) => {
  try {
    const { contractId, creator, recipient, totalAmount, milestones, transactionHash } = req.body;

    if (!contractId || !creator || !recipient || !totalAmount || !milestones) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingContract = await Escrow.findOne({ contractId });
    if (existingContract) {
      return res.status(409).json({ error: "Contract ID already exists" });
    }

    const escrow = new Escrow({
      contractId,
      creator: creator.toLowerCase(),
      recipient: recipient.toLowerCase(),
      totalAmount,
      releasedAmount: "0",
      milestones,
      status: "active",
      transactionHash,
    });

    await escrow.save();

    res.status(201).json(escrow);
  } catch (error) {
    console.error("Error creating escrow record:", error);
    res.status(500).json({ error: "Failed to create escrow record" });
  }
};

/**
 * Get all escrow contracts for a user (as creator or recipient)
 */
export const getUserEscrows = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }

    const address = walletAddress.toLowerCase();

    // Find contracts where user is either creator or recipient
    const escrows = await Escrow.find({
      $or: [{ creator: address }, { recipient: address }],
    }).sort({ createdAt: -1 });

    res.json(escrows);
  } catch (error) {
    console.error("Error fetching user escrows:", error);
    res.status(500).json({ error: "Failed to fetch escrow contracts" });
  }
};

/**
 * Get a specific escrow contract by ID
 */
export const getEscrowById = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const escrow = await Escrow.findOne({ contractId });

    if (!escrow) {
      return res.status(404).json({ error: "Escrow contract not found" });
    }

    res.json(escrow);
  } catch (error) {
    console.error("Error fetching escrow:", error);
    res.status(500).json({ error: "Failed to fetch escrow contract" });
  }
};

/**
 * Update milestone status
 */
export const releaseMilestone = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { milestoneIndex, releasedAmount } = req.body;

    if (milestoneIndex === undefined || !releasedAmount) {
      return res.status(400).json({ error: "Missing milestone index or amount" });
    }

    const escrow = await Escrow.findOne({ contractId });

    if (!escrow) {
      return res.status(404).json({ error: "Escrow contract not found" });
    }

    if (milestoneIndex >= escrow.milestones.length) {
      return res.status(400).json({ error: "Invalid milestone index" });
    }

    const milestone = escrow.milestones[milestoneIndex];
    if (milestone.released) {
      return res.status(400).json({ error: "Milestone already released" });
    }

    milestone.released = true;
    milestone.releasedAt = new Date();

    escrow.releasedAmount = releasedAmount;

    const allReleased = escrow.milestones.every((m) => m.released);
    if (allReleased) {
      escrow.status = "completed";
    }

    await escrow.save();

    res.json(escrow);
  } catch (error) {
    console.error("Error releasing milestone:", error);
    res.status(500).json({ error: "Failed to release milestone" });
  }
};

/**
 * Cancel escrow contract
 */
export const cancelEscrow = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;

    const escrow = await Escrow.findOne({ contractId });

    if (!escrow) {
      return res.status(404).json({ error: "Escrow contract not found" });
    }

    if (escrow.status !== "active") {
      return res.status(400).json({ error: "Contract is not active" });
    }

    escrow.status = "cancelled";
    await escrow.save();

    res.json(escrow);
  } catch (error) {
    console.error("Error cancelling escrow:", error);
    res.status(500).json({ error: "Failed to cancel escrow contract" });
  }
};

/**
 * Get escrow statistics for a user
 */
export const getEscrowStats = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }

    const address = walletAddress.toLowerCase();

    const [asCreator, asRecipient] = await Promise.all([
      Escrow.find({ creator: address }),
      Escrow.find({ recipient: address }),
    ]);

    const stats = {
      totalAsCreator: asCreator.length,
      totalAsRecipient: asRecipient.length,
      activeAsCreator: asCreator.filter((e) => e.status === "active").length,
      activeAsRecipient: asRecipient.filter((e) => e.status === "active").length,
      completedAsCreator: asCreator.filter((e) => e.status === "completed").length,
      completedAsRecipient: asRecipient.filter((e) => e.status === "completed").length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching escrow stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};
