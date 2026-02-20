import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

interface Message {
  _id: string;
  jobId: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  jobId?: string;
  relatedAddress?: string;
  read: boolean;
  createdAt: Date;
}

export const useSocket = (walletAddress?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join notification room when wallet address is available
  useEffect(() => {
    if (socket && walletAddress) {
      socket.emit('join_notifications', walletAddress);
    }
  }, [socket, walletAddress]);

  // Join job room
  const joinJobRoom = useCallback(
    (jobId: string) => {
      if (socket) {
        socket.emit('join_job', jobId);
      }
    },
    [socket]
  );

  // Leave job room
  const leaveJobRoom = useCallback(
    (jobId: string) => {
      if (socket) {
        socket.emit('leave_job', jobId);
      }
    },
    [socket]
  );

  // Send message
  const sendMessage = useCallback(
    (jobId: string, sender: string, recipient: string, content: string) => {
      if (socket) {
        socket.emit('send_message', {
          jobId,
          sender,
          recipient,
          content,
        });
      }
    },
    [socket]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (jobId: string, walletAddress: string) => {
      if (socket) {
        socket.emit('typing', { jobId, walletAddress });
      }
    },
    [socket]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (jobId: string, walletAddress: string) => {
      if (socket) {
        socket.emit('stop_typing', { jobId, walletAddress });
      }
    },
    [socket]
  );

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  return {
    socket,
    connected,
    messages,
    notifications,
    joinJobRoom,
    leaveJobRoom,
    sendMessage,
    sendTyping,
    stopTyping,
  };
};
