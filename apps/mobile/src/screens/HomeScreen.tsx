import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/auth-store';
import { taskService } from '../services/task';
import { type Task } from '@focus/shared';
import FocusTimer from '../components/FocusTimer';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hi, {user?.name || user?.email}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FocusTimer />

      <Text style={styles.sectionTitle}>Your Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskStatus}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  welcome: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: '#FF3B30', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  taskItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  taskTitle: { fontSize: 16 },
  taskStatus: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
});
