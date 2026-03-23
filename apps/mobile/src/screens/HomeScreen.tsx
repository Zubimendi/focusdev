import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth-store';
import { taskService } from '../services/task';
import { type Task } from '@focus/shared';
import FocusTimer from '../components/FocusTimer';
import { Terminal, Bell, Circle, CheckCircle2 } from 'lucide-react-native';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const user = useAuthStore((state: any) => state.user);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res: any = await taskService.getTasks();
        setTasks(res.tasks || []);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      }
    };
    fetchTasks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Terminal color="#818cf8" size={24} />
          <Text style={styles.headerTitle}>MONOLITH</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell color="#c7c4d7" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeLabel}>GOOD MORNING, DEVELOPER</Text>
          <Text style={styles.welcomeTitle}>{user?.name?.split(' ')[0] || 'Tobe'}</Text>
        </View>

        <FocusTimer />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Mission</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.taskCard}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSub}>{item.status.toUpperCase()}</Text>
              </View>
              {item.status === 'done' ? (
                <CheckCircle2 color="#4edea3" size={20} />
              ) : (
                <Circle color="#464554" size={20} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active missions. Focus on yourself.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322' },
  header: { 
    height: 64, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    marginBottom: 20
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontFamily: 'Inter_900Black', color: '#818cf8', letterSpacing: -1 },
  iconBtn: { padding: 8, backgroundColor: '#161b2b', borderRadius: 10 },
  content: { flex: 1, paddingHorizontal: 24 },
  welcomeSection: { marginBottom: 32 },
  welcomeLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2 },
  welcomeTitle: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#dee1f7', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, marginTop: 40 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#dee1f7' },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#818cf8' },
  taskCard: { 
    backgroundColor: '#161b2b', 
    padding: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)'
  },
  taskInfo: { gap: 4 },
  taskTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#dee1f7' },
  taskSub: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#c7c4d7', opacity: 0.6 },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#c7c4d7', fontFamily: 'Inter_400Regular', fontStyle: 'italic', fontSize: 12 }
});
