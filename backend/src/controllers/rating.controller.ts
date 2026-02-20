import { Request, Response } from 'express';
import Rating, { RatingType } from '../models/Rating.model';
import User from '../models/User.model';

export const ratingController = {
  async submitRating(req: Request, res: Response) {
    try {
      const { jobId, rater, ratee, raterType, rating, review, transactionHash } = req.body;

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }

      const existingRating = await Rating.findOne({ jobId, rater: rater.toLowerCase() });
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this job',
        });
      }

      const newRating = new Rating({
        jobId,
        rater: rater.toLowerCase(),
        ratee: ratee.toLowerCase(),
        raterType,
        rating,
        review,
        transactionHash,
      });

      await newRating.save();

      await updateUserRatings(ratee.toLowerCase(), raterType);

      res.status(201).json({
        success: true,
        rating: newRating,
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUserRatings(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const { type } = req.query;

      const query: any = { ratee: walletAddress.toLowerCase() };
      if (type) {
        query.raterType = type === 'buyer' ? RatingType.BUYER : RatingType.SELLER;
      }

      const ratings = await Rating.find(query).sort({ createdAt: -1 });

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      res.json({
        success: true,
        ratings,
        averageRating: averageRating.toFixed(2),
        totalRatings: ratings.length,
      });
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getRatingStats(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;

      const buyerRatings = await Rating.find({
        ratee: walletAddress.toLowerCase(),
        raterType: RatingType.BUYER,
      });

      const sellerRatings = await Rating.find({
        ratee: walletAddress.toLowerCase(),
        raterType: RatingType.SELLER,
      });

      const buyerAverage =
        buyerRatings.length > 0
          ? buyerRatings.reduce((sum, r) => sum + r.rating, 0) / buyerRatings.length
          : 0;

      const sellerAverage =
        sellerRatings.length > 0
          ? sellerRatings.reduce((sum, r) => sum + r.rating, 0) / sellerRatings.length
          : 0;

      const buyerDistribution = calculateDistribution(buyerRatings);
      const sellerDistribution = calculateDistribution(sellerRatings);

      res.json({
        success: true,
        stats: {
          buyer: {
            average: buyerAverage.toFixed(2),
            total: buyerRatings.length,
            distribution: buyerDistribution,
          },
          seller: {
            average: sellerAverage.toFixed(2),
            total: sellerRatings.length,
            distribution: sellerDistribution,
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching rating stats:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getJobRating(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { rater } = req.query;

      const query: any = { jobId: parseInt(jobId) };
      if (rater) {
        query.rater = (rater as string).toLowerCase();
      }

      const rating = await Rating.findOne(query);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found',
        });
      }

      res.json({
        success: true,
        rating,
      });
    } catch (error: any) {
      console.error('Error fetching job rating:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAllRatings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const ratings = await Rating.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Rating.countDocuments();

      res.json({
        success: true,
        ratings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('Error fetching all ratings:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

async function updateUserRatings(walletAddress: string, raterType: RatingType) {
  try {
    const user = await User.findOne({ walletAddress });
    if (!user) return;

    const buyerRatings = await Rating.find({
      ratee: walletAddress,
      raterType: RatingType.BUYER,
    });

    const sellerRatings = await Rating.find({
      ratee: walletAddress,
      raterType: RatingType.SELLER,
    });

    const buyerAverage =
      buyerRatings.length > 0
        ? buyerRatings.reduce((sum, r) => sum + r.rating, 0) / buyerRatings.length
        : 0;

    const sellerAverage =
      sellerRatings.length > 0
        ? sellerRatings.reduce((sum, r) => sum + r.rating, 0) / sellerRatings.length
        : 0;

    user.stats.buyerRating = buyerAverage;
    user.stats.sellerRating = sellerAverage;
    user.stats.totalReviews = buyerRatings.length + sellerRatings.length;

    user.updateRankPoints();

    await user.save();
  } catch (error) {
    console.error('Error updating user ratings:', error);
  }
}

function calculateDistribution(ratings: any[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });
  return distribution;
}
