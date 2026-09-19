import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  sessionId: string | null;
  endsAt: number | null;
  setDurationMinutes: (minutes: number) => void;
  tick: () => void;
  start: (sessionId: string | null) => void;
  stop: () => void;
  reset: () => void;
  syncFromClock: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      isActive: false,
      sessionId: null,
      endsAt: null,

      setDurationMinutes: (minutes) => {
        const durationSeconds = Math.max(1, minutes) * 60;
        const { isActive } = get();
        if (isActive) {
          set({ durationSeconds });
          return;
        }
        set({
          durationSeconds,
          remainingSeconds: durationSeconds,
          endsAt: null,
        });
      },

      tick: () => {
        const { isActive, endsAt, remainingSeconds } = get();
        if (!isActive) return;
        if (endsAt) {
          const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
          if (left !== remainingSeconds) set({ remainingSeconds: left });
          if (left <= 0) set({ isActive: false, endsAt: null });
          return;
        }
        if (remainingSeconds <= 0) {
          set({ isActive: false, endsAt: null, remainingSeconds: 0 });
          return;
        }
        set({ remainingSeconds: remainingSeconds - 1 });
      },

      start: (sessionId) => {
        const { remainingSeconds, durationSeconds } = get();
        const left = remainingSeconds > 0 ? remainingSeconds : durationSeconds;
        set({
          isActive: true,
          sessionId,
          remainingSeconds: left,
          endsAt: Date.now() + left * 1000,
        });
      },

      stop: () => {
        const { durationSeconds } = get();
        set({
          isActive: false,
          sessionId: null,
          endsAt: null,
          remainingSeconds: durationSeconds,
        });
      },

      reset: () => {
        const { durationSeconds } = get();
        set({
          isActive: false,
          sessionId: null,
          endsAt: null,
          remainingSeconds: durationSeconds,
        });
      },

      syncFromClock: () => {
        const { isActive, endsAt } = get();
        if (!isActive || !endsAt) return;
        const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        if (left <= 0) {
          set({
            isActive: false,
            endsAt: null,
            remainingSeconds: 0,
          });
          return;
        }
        set({ remainingSeconds: left });
      },
    }),
    {
      name: 'focusdev-timer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        durationSeconds: s.durationSeconds,
        remainingSeconds: s.remainingSeconds,
        isActive: s.isActive,
        sessionId: s.sessionId,
        endsAt: s.endsAt,
      }),
    }
  )
);
