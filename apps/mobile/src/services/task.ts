import * as SecureStore from 'expo-secure-store';
import { TaskSchema } from '@focus/shared';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const taskService = {
  async getTasks(): Promise<{ tasks: any[] }> {
    const headers = await getAuthHeaders();
    const response = await api.get('/tasks', { headers });
    const tasks = (response.data.tasks || []).map((t: any) => ({
      ...t,
      id: t._id || t.id
    }));
    return { tasks };
  },

  async createTask(data: any): Promise<{ task: any }> {
    const validated = TaskSchema.parse(data);
    const headers = await getAuthHeaders();
    const response = await api.post('/tasks', validated, { headers });
    const task = { ...response.data.task, id: response.data.task._id };
    return { task };
  },

  async updateTask(id: string, data: any): Promise<{ task: any }> {
    const headers = await getAuthHeaders();
    const response = await api.patch(`/tasks/${id}`, data, { headers });
    const task = { ...response.data.task, id: response.data.task._id };
    return { task };
  },

  async deleteTask(id: string): Promise<any> {
    const headers = await getAuthHeaders();
    const response = await api.delete(`/tasks/${id}`, { headers });
    return response.data;
  }
};
