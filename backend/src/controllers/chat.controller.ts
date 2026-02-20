import { Request, Response } from 'express';
import Message from '../models/Message.model';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { limit = 50, before } = req.query;

    const query: any = { jobId };

    if (before) {
      query.timestamp = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { walletAddress } = req.body;

    await Message.updateMany(
      { jobId, recipient: walletAddress.toLowerCase(), read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const count = await Message.countDocuments({
      recipient: walletAddress.toLowerCase(),
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
