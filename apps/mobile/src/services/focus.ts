import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { FocusSessionSchema, type ApiResponse } from '@focus/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const focusService = {
  async startSession(data: any): Promise<{ session: any }> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/focus/start`, data, { headers });
    const session = { ...response.data.session, id: response.data.session._id };
    return { session };
  },

  async endSession(id: string, notes: string): Promise<{ session: any }> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/focus/end/${id}`, { notes }, { headers });
    const session = { ...response.data.session, id: response.data.session._id };
    return { session };
  },

  async getSessions(): Promise<{ sessions: any[] }> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/focus/sessions`, { headers });
    const sessions = (response.data.sessions || []).map((s: any) => ({
      ...s,
      id: s._id || s.id
    }));
    return { sessions };
  }
};
