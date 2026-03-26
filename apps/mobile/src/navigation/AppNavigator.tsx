import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LayoutDashboard, Timer, ClipboardList, BarChart3, Folder } from 'lucide-react-native';
import { useAuthStore } from '../store/auth-store';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SessionsScreen from '../screens/SessionsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import StatsScreen from '../screens/StatsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import { useAppTheme } from '../hooks/useAppTheme';

function MainTabs() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : isDark ? 'rgba(14, 19, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={{ flex: 1 }} />
          ) : null
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter_700Bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size * 1.1 : size;
          if (route.name === 'Home') return <LayoutDashboard size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Checklists') return <ClipboardList size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Timer') return <Timer size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Stats') return <BarChart3 size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Projects') return <Folder size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Checklists" component={GoalsScreen} />
      <Tab.Screen name="Timer" component={SessionsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAuthStore((state: any) => state.token);
  const { colors, isDark } = useAppTheme();

  // Build a React Navigation theme that matches our app theme
  const navTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.onSurface,
      border: colors.outlineVariant,
      notification: colors.error,
    },
    fonts: {
      regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
      medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
      bold: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
      heavy: { fontFamily: 'Inter_800ExtraBold', fontWeight: '800' as const },
    }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
