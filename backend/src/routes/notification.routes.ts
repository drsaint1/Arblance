import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notification.controller';

const router = express.Router();

router.get('/:walletAddress', getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.post('/:walletAddress/mark-all-read', markAllAsRead);
router.get('/:walletAddress/unread-count', getUnreadCount);

export default router;
