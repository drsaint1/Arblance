import express from 'express';
import { activityController } from '../controllers/activity.controller';

const router = express.Router();

// Log new activity
router.post('/', activityController.logActivity);

// Get recent activities (for homepage feed)
router.get('/recent', activityController.getRecentActivities);

// Get activities by type
router.get('/type/:type', activityController.getActivitiesByType);

// Get user activities
router.get('/user/:walletAddress', activityController.getUserActivities);

// Get activity statistics
router.get('/stats/all', activityController.getActivityStats);

export default router;
