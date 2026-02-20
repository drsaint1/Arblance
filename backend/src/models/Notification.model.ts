import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  JOB_APPLICATION = 'job_application',
  JOB_ACCEPTED = 'job_accepted',
  JOB_COMPLETED = 'job_completed',
  JOB_DISPUTED = 'job_disputed',
  NEW_MESSAGE = 'new_message',
  PAYMENT_RECEIVED = 'payment_received',
}

export interface INotification extends Document {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  relatedAddress?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    jobId: {
      type: String,
    },
    relatedAddress: {
      type: String,
      lowercase: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of unread notifications
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
