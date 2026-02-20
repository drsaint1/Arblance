import mongoose, { Schema, Document } from 'mongoose';

export enum ActivityType {
  JOB_POSTED = 'Job Posted',
  JOB_COMPLETED = 'Job Completed',
  SKILL_EARNED = 'Skill Earned',
  USER_JOINED = 'User Joined',
  DISPUTE_RESOLVED = 'Dispute Resolved',
}

export interface IActivity extends Document {
  type: ActivityType;
  userAddress?: string;
  username?: string;
  displayName?: string;
  jobId?: number;
  jobTitle?: string;
  amount?: string;
  skillName?: string;
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
      index: true,
    },
    userAddress: {
      type: String,
      lowercase: true,
    },
    username: {
      type: String,
    },
    displayName: {
      type: String,
    },
    jobId: {
      type: Number,
    },
    jobTitle: {
      type: String,
    },
    amount: {
      type: String,
    },
    skillName: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Index for recent activities query
ActivitySchema.index({ timestamp: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
