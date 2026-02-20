import { Request, Response } from 'express';
import Notification from '../models/Notification.model';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { limit = 20, unreadOnly = false } = req.query;

    const query: any = { recipient: walletAddress.toLowerCase() };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    await Notification.updateMany(
      { recipient: walletAddress.toLowerCase(), read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const count = await Notification.countDocuments({
      recipient: walletAddress.toLowerCase(),
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
