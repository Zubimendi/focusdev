import { useSettingsStore } from '../store/settings-store';

export const useAppTheme = () => {
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#0f1614' : '#eef1f0',
      surface: isDark ? '#1c2421' : '#f7faf8',
      surfaceContainer: isDark ? '#24302c' : '#e2e7e5',
      surfaceContainerHigh: isDark ? '#2e3b36' : '#d5dcd9',
      onSurface: isDark ? '#eef1f0' : '#1c2421',
      onSurfaceVariant: isDark ? '#b8c4be' : '#4a5550',
      primary: isDark ? '#7eb8a8' : '#2d6a5e',
      onPrimary: isDark ? '#0f1614' : '#f7faf8',
      secondary: isDark ? '#a8d4c6' : '#5f8f82',
      outline: isDark ? '#6b7872' : '#8a9691',
      outlineVariant: isDark ? '#3a4843' : '#c5ceca',
      error: isDark ? '#f97066' : '#b42318',
      // Brand ramps used by gradients / accents
      primaryStrong: isDark ? '#2d6a5e' : '#24584e',
      primarySoft: isDark ? '#a8d4c6' : '#7eb8a8',
    },
  };
};
