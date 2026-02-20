import express from 'express';
import { getMessages, markMessagesAsRead, getUnreadCount } from '../controllers/chat.controller';

const router = express.Router();

router.get('/job/:jobId', getMessages);
router.post('/job/:jobId/mark-read', markMessagesAsRead);
router.get('/unread/:walletAddress', getUnreadCount);

export default router;
