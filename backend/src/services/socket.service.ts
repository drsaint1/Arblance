import { Server, Socket } from 'socket.io';
import Message from '../models/Message.model';
import Notification, { NotificationType } from '../models/Notification.model';

interface MessageData {
  jobId: string;
  sender: string;
  recipient: string;
  content: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join a job-specific room
    socket.on('join_job', (jobId: string) => {
      socket.join(`job_${jobId}`);
      console.log(`User joined job room: job_${jobId}`);
    });

    // Leave a job-specific room
    socket.on('leave_job', (jobId: string) => {
      socket.leave(`job_${jobId}`);
      console.log(`User left job room: job_${jobId}`);
    });

    // Join user's personal notification room
    socket.on('join_notifications', (walletAddress: string) => {
      socket.join(`notifications_${walletAddress.toLowerCase()}`);
      console.log(`User joined notification room: ${walletAddress}`);
    });

    // Handle new chat message
    socket.on('send_message', async (data: MessageData) => {
      try {
        const message = await Message.create({
          jobId: data.jobId,
          sender: data.sender.toLowerCase(),
          recipient: data.recipient.toLowerCase(),
          content: data.content,
        });

        // Emit to job room
        io.to(`job_${data.jobId}`).emit('new_message', message);

        // Create notification for recipient
        const notification = await Notification.create({
          recipient: data.recipient.toLowerCase(),
          type: NotificationType.NEW_MESSAGE,
          title: 'New Message',
          message: `You have a new message in job #${data.jobId}`,
          jobId: data.jobId,
          relatedAddress: data.sender.toLowerCase(),
        });

        // Send notification to recipient
        io.to(`notifications_${data.recipient.toLowerCase()}`).emit('new_notification', notification);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { jobId: string; walletAddress: string }) => {
      socket.to(`job_${data.jobId}`).emit('user_typing', data.walletAddress);
    });

    socket.on('stop_typing', (data: { jobId: string; walletAddress: string }) => {
      socket.to(`job_${data.jobId}`).emit('user_stop_typing', data.walletAddress);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to send notifications (can be called from other parts of the app)
export const sendNotification = async (
  io: Server,
  recipient: string,
  type: NotificationType,
  title: string,
  message: string,
  jobId?: string,
  relatedAddress?: string
) => {
  try {
    const notification = await Notification.create({
      recipient: recipient.toLowerCase(),
      type,
      title,
      message,
      jobId,
      relatedAddress: relatedAddress?.toLowerCase(),
    });

    io.to(`notifications_${recipient.toLowerCase()}`).emit('new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
