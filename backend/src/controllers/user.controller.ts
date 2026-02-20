import { Request, Response } from 'express';
import User from '../models/User.model';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { email, bio, githubUsername, twitterUsername, websiteUrl, avatarUrl, username, displayName } = req.body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (githubUsername !== undefined) updateData.githubUsername = githubUsername;
    if (twitterUsername !== undefined) updateData.twitterUsername = twitterUsername;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(user);
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3 || username.length > 20) {
      return res.json({ available: false, reason: 'Username must be 3-20 characters' });
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.json({ available: false, reason: 'Only lowercase letters, numbers, and underscores allowed' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    res.json({ available: !existing });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (existingUser) {
      return res.json(existingUser);
    }

    const user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const rankFilter = req.query.rank as string;

    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (rankFilter) {
      query.rankTier = rankFilter;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();

    const usersByRank = await User.aggregate([
      {
        $group: {
          _id: '$rankTier',
          count: { $sum: 1 },
        },
      },
    ]);

    const avgRatings = await User.aggregate([
      {
        $group: {
          _id: null,
          avgBuyerRating: { $avg: '$stats.buyerRating' },
          avgSellerRating: { $avg: '$stats.sellerRating' },
        },
      },
    ]);

    const totalJobsCompleted = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$stats.totalJobsCompleted' },
        },
      },
    ]);

    const totalVolume = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$stats.totalVolumeUSD' },
        },
      },
    ]);

    const usersWithEmail = await User.countDocuments({ email: { $exists: true, $ne: '' } });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersByRank,
        avgBuyerRating: avgRatings[0]?.avgBuyerRating || 0,
        avgSellerRating: avgRatings[0]?.avgSellerRating || 0,
        totalJobsCompleted: totalJobsCompleted[0]?.total || 0,
        totalVolume: totalVolume[0]?.total || 0,
        usersWithEmail,
        newUsersLast30Days: newUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
};
