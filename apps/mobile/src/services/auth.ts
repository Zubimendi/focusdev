import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LoginSchema, RegisterSchema, type ApiResponse, type AuthResponse } from '@focus/shared';

// Replace with your local IP for physical device testing
const API_URL = 'http://localhost:3000/api';

export const authService = {
  async register(data: any): Promise<ApiResponse<any>> {
    const validated = RegisterSchema.parse(data);
    const response = await axios.post(`${API_URL}/auth/register`, validated);
    return response.data;
  },

  async login(data: any): Promise<AuthResponse> {
    const validated = LoginSchema.parse(data);
    const response = await axios.post(`${API_URL}/auth/login`, validated);
    const { token, user } = response.data;
    
    await SecureStore.setItemAsync('auth_token', token);
    return { token, user };
  },

  async logout() {
    await SecureStore.deleteItemAsync('auth_token');
  },

  async getMe(): Promise<ApiResponse<any>> {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
