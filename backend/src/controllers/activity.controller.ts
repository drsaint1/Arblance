import { Request, Response } from 'express';
import Activity, { ActivityType } from '../models/Activity.model';
import User from '../models/User.model';

export const activityController = {
  async logActivity(req: Request, res: Response) {
    try {
      const { type, userAddress, jobId, jobTitle, amount, skillName } = req.body;

      let username, displayName;

      if (userAddress) {
        const user = await User.findOne({ walletAddress: userAddress.toLowerCase() });
        if (user) {
          username = user.username;
          displayName = user.displayName;
        }
      }

      const activity = new Activity({
        type,
        userAddress: userAddress?.toLowerCase(),
        username,
        displayName,
        jobId,
        jobTitle,
        amount,
        skillName,
      });

      await activity.save();

      res.status(201).json({
        success: true,
        activity,
      });
    } catch (error: any) {
      console.error('Error logging activity:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getRecentActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await Activity.find()
        .sort({ timestamp: -1 })
        .limit(limit);

      res.json({
        success: true,
        activities,
      });
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getActivitiesByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await Activity.find({ type })
        .sort({ timestamp: -1 })
        .limit(limit);

      res.json({
        success: true,
        activities,
      });
    } catch (error: any) {
      console.error('Error fetching activities by type:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getUserActivities(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await Activity.find({
        userAddress: walletAddress.toLowerCase(),
      })
        .sort({ timestamp: -1 })
        .limit(limit);

      res.json({
        success: true,
        activities,
      });
    } catch (error: any) {
      console.error('Error fetching user activities:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getActivityStats(req: Request, res: Response) {
    try {
      const totalActivities = await Activity.countDocuments();
      const jobsPosted = await Activity.countDocuments({
        type: ActivityType.JOB_POSTED,
      });
      const jobsCompleted = await Activity.countDocuments({
        type: ActivityType.JOB_COMPLETED,
      });
      const skillsEarned = await Activity.countDocuments({
        type: ActivityType.SKILL_EARNED,
      });
      const usersJoined = await Activity.countDocuments({
        type: ActivityType.USER_JOINED,
      });

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentActivities = await Activity.countDocuments({
        timestamp: { $gte: oneDayAgo },
      });

      res.json({
        success: true,
        stats: {
          total: totalActivities,
          jobsPosted,
          jobsCompleted,
          skillsEarned,
          usersJoined,
          last24Hours: recentActivities,
        },
      });
    } catch (error: any) {
      console.error('Error fetching activity stats:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
