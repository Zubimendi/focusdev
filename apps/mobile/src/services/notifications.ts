import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  readAt?: string;
  createdAt: string;
};

export const notificationsService = {
  async list(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const headers = await getAuthHeaders();
    const response = await api.get('/notifications', { headers });
    return response.data;
  },

  async markRead(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    await api.patch(`/notifications/${id}`, {}, { headers });
  },

  async markAllRead(): Promise<void> {
    const headers = await getAuthHeaders();
    await api.post('/notifications', { action: 'read-all' }, { headers });
  },
};
