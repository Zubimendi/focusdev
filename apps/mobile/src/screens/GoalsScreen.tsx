import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, CheckCircle2, Flame, Plus } from 'lucide-react-native';
import { Svg, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { taskService } from '../services/task';
import { type Task } from '@focus/shared';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res: any = await taskService.getTasks();
      setTasks(res.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleGoal = async (task: Task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      await taskService.updateTask(task.id, { status: nextStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Reverting.');
      fetchTasks(); // Revert
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length || 1;
  const pct = Math.round((completedCount / totalCount) * 100);
  const remaining = tasks.filter(t => t.status !== 'done').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>DEVELOPER EXECUTION</Text>
            <Text style={styles.title}>Checklists 🔥</Text>
          </View>
          <View style={styles.percentageContainer}>
            <Text style={styles.pctText}>{pct}%</Text>
            <Text style={styles.pctLabel}>DAILY COMPLETION</Text>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.checklist}>
          {loading ? (
            <ActivityIndicator color="#818cf8" size="large" style={{ marginTop: 20 }} />
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={[styles.goalItem, task.status === 'done' && styles.goalItemCompleted]}
                onPress={() => toggleGoal(task)}
              >
                <View style={styles.goalLeft}>
                  <View style={[styles.checkbox, task.status === 'done' && styles.checkboxActive]}>
                    {task.status === 'done' ? (
                      <CheckCircle2 size={18} color="#0e1322" fill="#4edea3" />
                    ) : (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={[styles.goalText, task.status === 'done' && styles.goalTextCompleted]}>
                    {task.title}
                  </Text>
                </View>
                {task.status !== 'done' && (
                  <Text style={styles.goalTime}>TODO</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No goals set for today. Stay focused!</Text>
            </View>
          )}
        </View>

        {/* Streak Banner */}
        <View style={styles.streakBanner}>
          <Flame size={20} color="#ffb95f" fill="#ffb95f" />
          <Text style={styles.streakBannerText}>
            {remaining > 0 ? `Keep the streak alive! ${remaining} more to go 🔥` : 'Legendary focus! All goals achieved! 🏆'}
          </Text>
        </View>

        {/* Weekly Goals placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Goals</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weeklyGrid}>
          <View style={styles.weeklyCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>LEARNING</Text>
              </View>
              <View style={styles.smallRing}>
                <Svg width={40} height={40}>
                  <Circle
                    cx={20}
                    cy={20}
                    r={18}
                    stroke="rgba(129, 140, 248, 0.1)"
                    strokeWidth={3}
                    fill="none"
                  />
                  <Circle
                    cx={20}
                    cy={20}
                    r={18}
                    stroke="#818cf8"
                    strokeWidth={3}
                    strokeDasharray={18 * 2 * Math.PI}
                    strokeDashoffset={18 * 2 * Math.PI * 0.4}
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90, 20, 20)"
                  />
                </Svg>
                <Text style={styles.ringPct}>60%</Text>
              </View>
            </View>
            <View>
              <Text style={styles.weeklyGoalTitle}>Master React Hooks</Text>
              <Text style={styles.weeklyGoalProgress}>3/5 Modules</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon', 'Task creation is being implemented.')}
      >
        <LinearGradient
          colors={['#818cf8', '#6366f1']}
          style={styles.fabGradient}
        >
          <Plus size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 110 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 40
  },
  label: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#dee1f7', marginTop: 4 },
  percentageContainer: { alignItems: 'flex-end' },
  pctText: { fontSize: 32, fontFamily: 'JetBrainsMono_700Bold', color: '#4edea3', letterSpacing: -1 },
  pctLabel: { fontSize: 8, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 1 },
  
  checklist: { gap: 12 },
  goalItem: { 
    backgroundColor: '#161b2b', 
    padding: 24, 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)'
  },
  goalItemCompleted: { backgroundColor: 'rgba(78, 222, 163, 0.05)', borderColor: 'rgba(78, 222, 163, 0.1)' },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxInner: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#464554' },
  checkboxActive: { backgroundColor: 'transparent' },
  goalText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#dee1f7', flex: 1 },
  goalTextCompleted: { color: '#64748b', textDecorationLine: 'line-through' },
  goalTime: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#c7c4d7' },

  streakBanner: { 
    backgroundColor: 'rgba(255, 185, 95, 0.1)', 
    padding: 20, 
    borderRadius: 20, 
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 185, 95, 0.2)'
  },
  streakBannerText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#ffb95f' },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginTop: 48, 
    marginBottom: 20 
  },
  sectionTitle: { fontSize: 24, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#818cf8' },

  weeklyGrid: { gap: 16 },
  weeklyCard: { 
    backgroundColor: '#161b2b', 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(70, 69, 84, 0.1)' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  categoryBadge: { backgroundColor: 'rgba(129, 140, 248, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  categoryText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: '#818cf8' },
  smallRing: { alignItems: 'center', justifyContent: 'center' },
  ringPct: { position: 'absolute', fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#dee1f7' },
  weeklyGoalTitle: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#dee1f7', marginBottom: 6 },
  weeklyGoalProgress: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: '#64748b' },

  fab: { 
    position: 'absolute', 
    bottom: 120, 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16
  },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#64748b', fontStyle: 'italic', fontSize: 14 }
});
