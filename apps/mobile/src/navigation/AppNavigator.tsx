import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Home, Timer, Target, BarChart4, User } from 'lucide-react-native';
import { useAuthStore } from '../store/auth-store';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SessionsScreen from '../screens/SessionsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
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
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(14, 19, 34, 0.95)',
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
          ) : null
        ),
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter_700Bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size * 1.1 : size;
          if (route.name === 'Home') return <Home size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Sessions') return <Timer size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Goals') return <Target size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Stats') return <BarChart4 size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
          if (route.name === 'Profile') return <User size={iconSize} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAuthStore((state: any) => state.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
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
