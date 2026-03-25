import { useSettingsStore } from '../store/settings-store';

export const useAppTheme = () => {
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#0e1322' : '#f8fafc',
      surface: isDark ? '#161b2b' : '#ffffff',
      surfaceContainer: isDark ? '#1a1f2f' : '#f1f5f9',
      surfaceContainerHigh: isDark ? '#25293a' : '#e2e8f0',
      onSurface: isDark ? '#dee1f7' : '#0e1322',
      onSurfaceVariant: isDark ? '#c7c4d7' : '#64748b',
      primary: isDark ? '#c0c1ff' : '#494bd6',
      onPrimary: isDark ? '#1000a9' : '#ffffff',
      secondary: isDark ? '#4edea3' : '#006d48',
      outline: isDark ? '#908fa0' : '#747785',
      outlineVariant: isDark ? '#464554' : '#c4c6d4',
      error: isDark ? '#ffb4ab' : '#ba1a1a',
    }
  };
};
