import express from "express";
import {
  createEscrowRecord,
  getUserEscrows,
  getEscrowById,
  releaseMilestone,
  cancelEscrow,
  getEscrowStats,
} from "../controllers/escrow.controller";

const router = express.Router();

// Create escrow contract record
router.post("/", createEscrowRecord);

// Get all escrow contracts for a user
router.get("/user/:walletAddress", getUserEscrows);

// Get escrow statistics for a user
router.get("/stats/:walletAddress", getEscrowStats);

// Get specific escrow contract
router.get("/:contractId", getEscrowById);

// Release milestone
router.post("/:contractId/release", releaseMilestone);

// Cancel escrow contract
router.post("/:contractId/cancel", cancelEscrow);

export default router;
