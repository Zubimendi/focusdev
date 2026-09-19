import { create } from 'zustand';
import { authService } from '../services/auth';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  restoreSession: () => Promise<void>;
  login: (credentials: any) => Promise<{ requires2FA: boolean; pendingToken?: string }>;
  verify2FA: (pendingToken: string, code: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  restoreSession: async () => {
    set({ isBootstrapping: true });
    try {
      const stored = await authService.getStoredToken();
      if (!stored) {
        set({ token: null, user: null, isBootstrapping: false });
        return;
      }
      set({ token: stored });
      await get().loadUser();
    } catch {
      await authService.logout();
      set({ user: null, token: null });
    } finally {
      set({ isBootstrapping: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(credentials);
      if (result.requires2FA) {
        set({ isLoading: false });
        return { requires2FA: true, pendingToken: result.pendingToken };
      }
      set({
        user: result.user,
        token: result.token,
        isLoading: false,
      });
      return { requires2FA: false };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  verify2FA: async (pendingToken, code) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.verify2FA(pendingToken, code);
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
      const token = get().token ?? (await authService.getStoredToken());
      set({ user, token, isLoading: false });
    } catch {
      await authService.logout();
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
