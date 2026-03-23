import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { FocusSessionSchema, type ApiResponse } from '@focus/shared';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const focusService = {
  async startSession(data: any): Promise<ApiResponse<any>> {
    const validated = FocusSessionSchema.parse(data);
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/focus/start`, validated, { headers });
    return response.data;
  },

  async endSession(id: string, notes?: string): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/focus/end/${id}`, { notes }, { headers });
    return response.data;
  },

  async getSessions(): Promise<ApiResponse<any[]>> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/focus/sessions`, { headers });
    return response.data;
  }
};
