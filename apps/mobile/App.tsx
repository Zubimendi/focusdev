import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settings-store';

SplashScreen.preventAutoHideAsync();

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#7eb8a8',
        backgroundColor: '#1c2421',
        borderRadius: 12,
        minHeight: 72,
        height: 'auto',
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
      text1Style={{
        fontSize: 15,
        fontFamily: 'Outfit_700Bold',
        color: '#eef1f0',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Outfit_500Medium',
        color: '#b8c4be',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#f97066',
        backgroundColor: '#1c2421',
        borderRadius: 12,
        minHeight: 72,
        height: 'auto',
        paddingVertical: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1NumberOfLines={2}
      text2NumberOfLines={5}
      text1Style={{
        fontSize: 15,
        fontFamily: 'Outfit_700Bold',
        color: '#eef1f0',
      }}
      text2Style={{
        fontSize: 13,
        fontFamily: 'Outfit_500Medium',
        color: '#b8c4be',
      }}
    />
  ),
};

export default function App() {
  const theme = useSettingsStore((state) => state.theme);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: theme === 'dark' ? '#0f1614' : '#eef1f0',
        }}
        onLayout={onLayoutRootView}
      >
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Toast config={toastConfig} position="top" topOffset={56} />
      </View>
    </SafeAreaProvider>
  );
}
