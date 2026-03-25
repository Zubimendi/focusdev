import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'dark' | 'light';
  timerDuration: number;
  notificationSound: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setTimerDuration: (duration: number) => void;
  setNotificationSound: (sound: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      timerDuration: 25,
      notificationSound: 'Zen Chime',
      setTheme: (theme) => set({ theme }),
      setTimerDuration: (timerDuration) => set({ timerDuration }),
      setNotificationSound: (notificationSound) => set({ notificationSound }),
    }),
    {
      name: 'focusdev-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
