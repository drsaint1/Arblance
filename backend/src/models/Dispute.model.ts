import mongoose, { Schema, Document } from 'mongoose';

export enum DisputeStatus {
  OPEN = 'Open',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled',
}

export enum DisputeWinner {
  NONE = 'None',
  CLIENT = 'Client',
  FREELANCER = 'Freelancer',
  SPLIT = 'Split',
}

export interface IDispute extends Document {
  disputeId: number;
  jobId: number;
  client: string;
  freelancer: string;
  amount: string;
  clientEvidence: string;
  freelancerEvidence: string;
  status: DisputeStatus;
  winner: DisputeWinner;
  resolution: string;
  resolvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
  transactionHash?: string;
}

const DisputeSchema: Schema = new Schema(
  {
    disputeId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: Number,
      required: true,
      index: true,
    },
    client: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    freelancer: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    clientEvidence: {
      type: String,
      default: '',
    },
    freelancerEvidence: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
      index: true,
    },
    winner: {
      type: String,
      enum: Object.values(DisputeWinner),
      default: DisputeWinner.NONE,
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: String,
      lowercase: true,
    },
    resolvedAt: {
      type: Date,
    },
    transactionHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

DisputeSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IDispute>('Dispute', DisputeSchema);
