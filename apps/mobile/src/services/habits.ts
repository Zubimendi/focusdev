import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export type Habit = {
  id: string;
  title: string;
  description?: string;
  cadence: 'daily' | 'weekly';
  targetPerPeriod: number;
  unit?: string;
  todayValue: number;
};

export const habitsService = {
  async list(): Promise<{ habits: Habit[]; date: string }> {
    const headers = await getAuthHeaders();
    const response = await api.get('/habits', { headers });
    return response.data;
  },

  async checkIn(habitId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await api.post(`/habits/${habitId}/check-in`, {}, { headers });
  },
};
