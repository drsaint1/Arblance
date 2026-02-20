import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Profile API
export const userApi = {
  createUser: async (walletAddress: string) => {
    const response = await apiClient.post('/users', { walletAddress });
    return response.data;
  },

  getUserProfile: async (walletAddress: string) => {
    const response = await apiClient.get(`/users/${walletAddress}`);
    return response.data;
  },

  updateUserProfile: async (
    walletAddress: string,
    profileData: {
      email?: string;
      bio?: string;
      githubUsername?: string;
      twitterUsername?: string;
      websiteUrl?: string;
      avatarUrl?: string;
      username?: string;
      displayName?: string;
    }
  ) => {
    const response = await apiClient.put(`/users/${walletAddress}`, profileData);
    return response.data;
  },

  checkUsername: async (username: string) => {
    const response = await apiClient.get(`/users/check-username/${username}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  getMessages: async (jobId: string, limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);

    const response = await apiClient.get(`/chat/job/${jobId}?${params}`);
    return response.data;
  },

  markMessagesAsRead: async (jobId: string, walletAddress: string) => {
    const response = await apiClient.post(`/chat/job/${jobId}/mark-read`, {
      walletAddress,
    });
    return response.data;
  },

  getUnreadCount: async (walletAddress: string) => {
    const response = await apiClient.get(`/chat/unread/${walletAddress}`);
    return response.data;
  },
};

// Notifications API
export const notificationApi = {
  getNotifications: async (walletAddress: string, limit = 20, unreadOnly = false) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
    });

    const response = await apiClient.get(`/notifications/${walletAddress}?${params}`);
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (walletAddress: string) => {
    const response = await apiClient.post(`/notifications/${walletAddress}/mark-all-read`);
    return response.data;
  },

  getUnreadCount: async (walletAddress: string) => {
    const response = await apiClient.get(`/notifications/${walletAddress}/unread-count`);
    return response.data;
  },
};

// Escrow API
export const escrowApi = {
  createEscrowRecord: async (escrowData: {
    contractId: string;
    creator: string;
    recipient: string;
    totalAmount: string;
    milestones: Array<{ description: string; amount: string; released: boolean }>;
    transactionHash?: string;
  }) => {
    const response = await apiClient.post('/escrow', escrowData);
    return response.data;
  },

  getUserEscrows: async (walletAddress: string) => {
    const response = await apiClient.get(`/escrow/user/${walletAddress}`);
    return response.data;
  },

  getEscrowById: async (contractId: string) => {
    const response = await apiClient.get(`/escrow/${contractId}`);
    return response.data;
  },

  releaseMilestone: async (contractId: string, milestoneIndex: number, releasedAmount: string) => {
    const response = await apiClient.post(`/escrow/${contractId}/release`, {
      milestoneIndex,
      releasedAmount,
    });
    return response.data;
  },

  cancelEscrow: async (contractId: string) => {
    const response = await apiClient.post(`/escrow/${contractId}/cancel`);
    return response.data;
  },

  getEscrowStats: async (walletAddress: string) => {
    const response = await apiClient.get(`/escrow/stats/${walletAddress}`);
    return response.data;
  },
};

export default apiClient;
