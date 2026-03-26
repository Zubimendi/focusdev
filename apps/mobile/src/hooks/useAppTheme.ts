import { useSettingsStore } from '../store/settings-store';

export const useAppTheme = () => {
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#0e1322' : '#ffffff',
      surface: isDark ? '#161b2b' : '#ffffff',
      surfaceContainer: isDark ? '#1a1f2f' : '#f1f5f9',
      surfaceContainerHigh: isDark ? '#25293a' : '#e2e8f0',
      onSurface: isDark ? '#dee1f7' : '#020617',
      onSurfaceVariant: isDark ? '#c7c4d7' : '#475569',
      primary: isDark ? '#c0c1ff' : '#4f46e5',
      onPrimary: isDark ? '#1000a9' : '#ffffff',
      secondary: isDark ? '#4edea3' : '#0ea5e9',
      outline: isDark ? '#908fa0' : '#94a3b8',
      outlineVariant: isDark ? '#464554' : '#e2e8f0',
      error: isDark ? '#ffb4ab' : '#ef4444',
    }
  };
};
