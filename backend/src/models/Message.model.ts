import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  jobId: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

const MessageSchema: Schema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient querying
MessageSchema.index({ jobId: 1, timestamp: 1 });
MessageSchema.index({ sender: 1, recipient: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
