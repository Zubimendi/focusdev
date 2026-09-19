import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export type Note = {
  id: string;
  title: string;
  body: string;
  projectId?: string;
  goalId?: string;
  updatedAt?: string;
  createdAt?: string;
};

export const notesService = {
  async list(q?: string): Promise<{ notes: Note[] }> {
    const headers = await getAuthHeaders();
    const response = await api.get('/notes', { headers, params: q ? { q } : {} });
    return response.data;
  },

  async create(data: { title: string; body?: string }): Promise<{ note: Note }> {
    const headers = await getAuthHeaders();
    const response = await api.post('/notes', data, { headers });
    return response.data;
  },

  async update(
    id: string,
    data: { title?: string; body?: string }
  ): Promise<{ note: Note }> {
    const headers = await getAuthHeaders();
    const response = await api.patch(`/notes/${id}`, data, { headers });
    return response.data;
  },

  async remove(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    await api.delete(`/notes/${id}`, { headers });
  },
};
