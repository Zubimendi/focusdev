import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Settings, HelpCircle } from 'lucide-react-native';
import { useAuthStore } from '../store/auth-store';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const { colors, isDark } = useAppTheme();
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.avatar, { backgroundColor: isDark ? '#2f3445' : '#e2e8f0' }]}>
        {user?.name || user?.email ? (
          <Text style={[styles.initial, { color: colors.primary }]}>{initial}</Text>
        ) : (
          <User size={48} color={colors.primary} />
        )}
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>
        {user?.name || 'Your profile'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        {user?.email || ''}
      </Text>

      <View style={styles.menu}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Settings size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.menuText, { color: colors.onSurface }]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Support')}
        >
          <HelpCircle size={20} color={colors.onSurfaceVariant} />
          <Text style={[styles.menuText, { color: colors.onSurface }]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={logout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  initial: { fontSize: 36, fontFamily: 'Inter_800ExtraBold' },
  title: { fontSize: 24, fontFamily: 'Inter_900Black' },
  subtitle: { fontSize: 14, fontFamily: 'JetBrainsMono_400Regular', marginTop: 8 },
  menu: { width: '100%', marginTop: 60, gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 16 },
  menuText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
