import { create } from 'zustand';

interface SettingsState {
  theme: 'dark' | 'light';
  timerDuration: number;
  notificationSound: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setTimerDuration: (duration: number) => void;
  setNotificationSound: (sound: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  timerDuration: 25,
  notificationSound: 'Zen Chime',
  setTheme: (theme) => set({ theme }),
  setTimerDuration: (timerDuration) => set({ timerDuration }),
  setNotificationSound: (notificationSound) => set({ notificationSound }),
}));
