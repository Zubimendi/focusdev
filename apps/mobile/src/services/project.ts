import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return { Authorization: `Bearer ${token}` };
};

export const projectService = {
  async getProjects(): Promise<{ projects: any[] }> {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/projects`, { headers });
    const projects = (response.data.projects || []).map((p: any) => ({
      ...p,
      id: p._id || p.id
    }));
    return { projects };
  },

  async createProject(data: any): Promise<{ project: any }> {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/projects`, data, { headers });
    const project = { ...response.data.project, id: response.data.project._id };
    return { project };
  }
};
