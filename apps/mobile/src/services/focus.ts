import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const focusService = {
  async startSession(data: any): Promise<{ session: any }> {
    const headers = await getAuthHeaders();
    const response = await api.post('/focus/start', data, { headers });
    const session = { ...response.data.session, id: response.data.session._id };
    return { session };
  },

  async endSession(id: string, notes: string): Promise<{ session: any }> {
    const headers = await getAuthHeaders();
    const response = await api.post(`/focus/end/${id}`, { notes }, { headers });
    const session = { ...response.data.session, id: response.data.session._id };
    return { session };
  },

  async getSessions(): Promise<{ sessions: any[] }> {
    const headers = await getAuthHeaders();
    const response = await api.get('/focus/sessions', { headers });
    const sessions = (response.data.sessions || []).map((s: any) => ({
      ...s,
      id: s._id || s.id
    }));
    return { sessions };
  }
};
