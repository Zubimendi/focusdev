import { create } from 'zustand';
import { authService } from '../services/auth';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const { user } = await authService.getMe();
      set({ user, isLoading: false });
    } catch (err) {
      set({ user: null, token: null, isLoading: false });
    }
  }
}));
