import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const reviewsService = {
  async getCurrentWeekly() {
    const headers = await getAuthHeaders();
    const response = await api.get('/reviews', {
      headers,
      params: { periodType: 'week', current: 'true' },
    });
    return response.data as {
      review: {
        id: string;
        focusMinutes: number;
        sessionCount: number;
        tasksDone: number;
        streak: number;
        byProject: Array<{
          projectId: string;
          name: string;
          color: string;
          focusMinutes: number;
          tasksDone: number;
        }>;
        wins?: string;
        blockers?: string;
        nextFocus?: string;
      };
      goals: Array<{ id: string; title: string; status: string }>;
      period: { start: string; end: string };
    };
  },
};
