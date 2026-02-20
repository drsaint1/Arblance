import mongoose, { Schema, Document } from 'mongoose';

export enum RatingType {
  BUYER = 'Buyer',
  SELLER = 'Seller',
}

export interface IRating extends Document {
  jobId: number;
  rater: string;
  ratee: string;
  raterType: RatingType;
  rating: number;
  review: string;
  createdAt: Date;
  transactionHash?: string;
}

const RatingSchema: Schema = new Schema(
  {
    jobId: {
      type: Number,
      required: true,
      index: true,
    },
    rater: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    ratee: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    raterType: {
      type: String,
      enum: Object.values(RatingType),
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    transactionHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

RatingSchema.index({ jobId: 1, rater: 1 }, { unique: true });

RatingSchema.index({ ratee: 1, createdAt: -1 });

export default mongoose.model<IRating>('Rating', RatingSchema);
