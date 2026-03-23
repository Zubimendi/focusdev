import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Settings } from 'lucide-react-native';
import { useAuthStore } from '../store/auth-store';

export default function ProfileScreen() {
  const logout = useAuthStore((state: any) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatar}>
        <User size={48} color="#c0c1ff" />
      </View>
      <Text style={styles.title}>Developer Profile</Text>
      <Text style={styles.subtitle}>@tobe_dev · Level 42</Text>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Settings size={20} color="#c7c4d7" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <LogOut size={20} color="#ffb4ab" />
          <Text style={[styles.menuText, { color: '#ffb4ab' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2f3445', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  subtitle: { fontSize: 14, fontFamily: 'JetBrainsMono_400Regular', color: '#c7c4d7', marginTop: 8 },
  menu: { width: '100%', marginTop: 60, gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: '#161b2b', borderRadius: 16 },
  menuText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#dee1f7' },
});
