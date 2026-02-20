import mongoose, { Schema, Document } from 'mongoose';

export enum RankTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  LEGEND = 'Legend',
}

export interface IUserStats {
  totalJobsCompleted: number;
  totalJobsPosted: number;
  totalVolumeUSD: number;
  skillBadgesCount: number;
  sellerRating: number;
  buyerRating: number;
  totalReviews: number;
}

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  githubUsername?: string;
  twitterUsername?: string;
  websiteUrl?: string;
  avatarUrl?: string;

  rankTier: RankTier;
  rankPoints: number;

  stats: IUserStats;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    twitterUsername: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },

    rankTier: {
      type: String,
      enum: Object.values(RankTier),
      default: RankTier.BRONZE,
    },
    rankPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    stats: {
      totalJobsCompleted: {
        type: Number,
        default: 0,
      },
      totalJobsPosted: {
        type: Number,
        default: 0,
      },
      totalVolumeUSD: {
        type: Number,
        default: 0,
      },
      skillBadgesCount: {
        type: Number,
        default: 0,
      },
      sellerRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      buyerRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.calculateRank = function() {
  const points = this.rankPoints;

  if (points >= 10000) return RankTier.LEGEND;
  if (points >= 5000) return RankTier.DIAMOND;
  if (points >= 2000) return RankTier.PLATINUM;
  if (points >= 500) return RankTier.GOLD;
  if (points >= 100) return RankTier.SILVER;
  return RankTier.BRONZE;
};

UserSchema.methods.updateRankPoints = function() {
  const badgePoints = this.stats.skillBadgesCount * 50;
  const volumePoints = Math.floor(this.stats.totalVolumeUSD / 100) * 10;
  const jobPoints = this.stats.totalJobsCompleted * 20;
  const ratingPoints = Math.floor(this.stats.sellerRating * 10);

  this.rankPoints = badgePoints + volumePoints + jobPoints + ratingPoints;
  this.rankTier = this.calculateRank();

  return this.rankPoints;
};

export default mongoose.model<IUser>('User', UserSchema);
