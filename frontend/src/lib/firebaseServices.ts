import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Message, Notification } from "@/types";

/**
 * Send a message
 */
export const sendMessage = async (
  jobId: string,
  sender: string,
  receiver: string,
  content: string
): Promise<void> => {
  if (!db) return;

  await addDoc(collection(db, "messages"), {
    jobId,
    sender: sender.toLowerCase(),
    receiver: receiver.toLowerCase(),
    content,
    timestamp: Timestamp.now().toMillis(),
    read: false,
  });
};

/**
 * Listen to messages for a job
 */
export const subscribeToMessages = (
  jobId: string,
  userAddress: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  if (!db) return () => {};

  const q = query(
    collection(db, "messages"),
    where("jobId", "==", jobId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.sender.toLowerCase() === userAddress.toLowerCase() ||
        data.receiver.toLowerCase() === userAddress.toLowerCase()
      ) {
        messages.push({
          id: doc.id,
          ...data,
        } as Message);
      }
    });
    callback(messages);
  });
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  if (!db) return;

  const messageRef = doc(db, "messages", messageId);
  await updateDoc(messageRef, { read: true });
};

/**
 * Create a notification
 */
export const createNotification = async (
  recipient: string,
  type: Notification["type"],
  title: string,
  message: string,
  link?: string
): Promise<void> => {
  if (!db) return;

  await addDoc(collection(db, "notifications"), {
    recipient: recipient.toLowerCase(),
    type,
    title,
    message,
    timestamp: Timestamp.now().toMillis(),
    read: false,
    link: link || "",
  });
};

/**
 * Listen to user notifications
 */
export const subscribeToNotifications = (
  userAddress: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  if (!db) return () => {};

  const q = query(
    collection(db, "notifications"),
    where("recipient", "==", userAddress.toLowerCase()),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      } as Notification);
    });
    callback(notifications);
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  if (!db) return;

  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
};
