import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { TaskSchema, type ApiResponse } from '@focus/shared';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const taskService = {
  async getTasks(): Promise<ApiResponse<any[]>> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/tasks`, { headers });
    return response.data;
  },

  async createTask(data: any): Promise<ApiResponse<any>> {
    const validated = TaskSchema.parse(data);
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/tasks`, validated, { headers });
    return response.data;
  },

  async updateTask(id: string, data: any): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/tasks/${id}`, data, { headers });
    return response.data;
  },

  async deleteTask(id: string): Promise<ApiResponse<any>> {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/tasks/${id}`, { headers });
    return response.data;
  }
};
