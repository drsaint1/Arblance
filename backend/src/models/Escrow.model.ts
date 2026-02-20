import mongoose, { Schema, Document } from "mongoose";

export interface IMilestone {
  description: string;
  amount: string;
  released: boolean;
  releasedAt?: Date;
}

export interface IEscrow extends Document {
  contractId: string;
  creator: string;
  recipient: string;
  totalAmount: string;
  releasedAmount: string;
  milestones: IMilestone[];
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  transactionHash?: string;
}

const MilestoneSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  released: {
    type: Boolean,
    default: false,
  },
  releasedAt: {
    type: Date,
  },
});

const EscrowSchema = new Schema(
  {
    contractId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    creator: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    releasedAmount: {
      type: String,
      default: "0",
    },
    milestones: [MilestoneSchema],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    transactionHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
EscrowSchema.index({ creator: 1, status: 1 });
EscrowSchema.index({ recipient: 1, status: 1 });

export const Escrow = mongoose.model<IEscrow>("Escrow", EscrowSchema);
