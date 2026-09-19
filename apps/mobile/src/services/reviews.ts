import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export type PeriodType = 'week' | 'month';

export const reviewsService = {
  async getCurrent(periodType: PeriodType = 'week') {
    const headers = await getAuthHeaders();
    const response = await api.get('/reviews', {
      headers,
      params: { periodType, current: 'true' },
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
        nextPeriodGoals?: string;
      };
      goals: Array<{ id: string; title: string; status: string }>;
      period: { start: string; end: string };
    };
  },
};
