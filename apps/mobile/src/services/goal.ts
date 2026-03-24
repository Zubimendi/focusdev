import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const goalService = {
  async getGoals(): Promise<{ goals: any[] }> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/goals`, { headers });
    const goals = (response.data.goals || []).map((g: any) => ({
      ...g,
      id: g._id || g.id
    }));
    return { goals };
  },

  async createGoal(data: any): Promise<{ goal: any }> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/goals`, data, { headers });
    const goal = { ...response.data.goal, id: response.data.goal._id };
    return { goal };
  }
};
