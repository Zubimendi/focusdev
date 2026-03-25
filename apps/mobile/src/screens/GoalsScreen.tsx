import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Terminal, Plus, CheckCircle2, Circle, Clock, ChevronRight, LayoutGrid, Target, X, AlertCircle } from 'lucide-react-native';
import { Svg, Circle as SvgCircle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { taskService } from '../services/task';
import { projectService } from '../services/project';
import { goalService } from '../services/goal';
import { type Task } from '@focus/shared';

import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const { colors, isDark } = useAppTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as 'low' | 'medium' | 'high', 
    projectId: '', 
    goalId: '' 
  });

  const fetchData = useCallback(async () => {
    try {
      const tRes = await taskService.getTasks();
      const pRes = await projectService.getProjects();
      const gRes = await goalService.getGoals();
      setTasks(tRes.tasks || []);
      setProjects(pRes.projects || []);
      setGoals(gRes.goals || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }
    try {
      await taskService.createTask(newTask);
      setIsModalVisible(false);
      setNewTask({ title: '', description: '', priority: 'medium', projectId: '', goalId: '' });
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      await taskService.updateTask(task.id, { status: newStatus });
      fetchData(); // Sync with server for full data integrity
    } catch (error) {
      Alert.alert('Error', 'Failed to update task.');
      fetchData(); // Rollback
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length || 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>DEVELOPER EXECUTION</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>Checklists 🔥</Text>
          </View>
          <View style={styles.percentageContainer}>
            <Text style={[styles.pctText, { color: colors.primary }]}>{pct}%</Text>
            <Text style={[styles.pctLabel, { color: colors.onSurfaceVariant }]}>DAILY COMPLETION</Text>
          </View>
        </View>

        {/* Weekly Goals Section */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Target size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Weekly Milestones</Text>
          </View>
        </View>

        {goals.length === 0 ? (
          <View style={[styles.emptyGoalBox, { backgroundColor: colors.primary + '05', borderColor: colors.primary + '50' }]}>
            <Text style={[styles.emptyGoalText, { color: colors.primary }]}>No weekly goals active. Set one up to stay locked in.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsList}>
            {goals.map((goal, i) => (
              <View key={goal.id || i} style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.goalTitle, { color: colors.onSurface }]}>{goal.title}</Text>
                <View style={[styles.goalProgressContainer, { backgroundColor: colors.outlineVariant }]}>
                  <View style={[styles.goalProgressBar, { width: goal.status === 'met' ? '100%' : '30%', backgroundColor: colors.primary }]} />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Task List Section */}
        <View style={[styles.sectionHeader, { marginTop: 40 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Daily Objectives</Text>
          </View>
          <View style={[styles.taskCountBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.taskCountText, { color: colors.onSurfaceVariant }]}>{tasks.length} TOTAL</Text>
          </View>
        </View>

        <View style={styles.taskList}>
          {tasks.length === 0 && !loading ? (
            <Text style={[styles.emptyTasksText, { color: colors.onSurfaceVariant }]}>All clear! Add a task to start your focus cycle.</Text>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={[
                  styles.taskCard, 
                  { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                  task.status === 'done' && { opacity: 0.6, backgroundColor: colors.surface + '80' }
                ]}
                onPress={() => toggleTaskStatus(task)}
              >
                <View style={styles.taskCore}>
                  {task.status === 'done' ? (
                    <CheckCircle2 size={24} color="#4edea3" />
                  ) : (
                    <Circle size={24} color={colors.outline} />
                  )}
                  <View style={styles.taskInfo}>
                    <Text style={[
                      styles.taskTitle, 
                      { color: colors.onSurface },
                      task.status === 'done' && { textDecorationLine: 'line-through', color: colors.onSurfaceVariant }
                    ]}>
                      {task.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.priorityBadge, 
                        { backgroundColor: task.priority === 'high' ? 'rgba(244, 63, 94, 0.1)' : colors.primary + '15' }
                      ]}>
                        <Text style={[
                          styles.priorityText, 
                          { color: task.priority === 'high' ? '#f43f5e' : colors.primary }
                        ]}>
                          {task.priority.toUpperCase()}
                        </Text>
                      </View>
                      <View style={[styles.metaDivider, { backgroundColor: colors.outlineVariant }]} />
                      <Clock size={12} color={colors.onSurfaceVariant} />
                      <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>{task.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.outline} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* Create Task Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>New Objective</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.primary }]}>TITLE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant }]}
                placeholder="What are we shipping?"
                placeholderTextColor={colors.outline}
                value={newTask.title}
                onChangeText={(text) => setNewTask({...newTask, title: text})}
              />

              <Text style={[styles.inputLabel, { color: colors.primary }]}>DESCRIPTION</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant }]}
                placeholder="Break it down..."
                placeholderTextColor={colors.outline}
                multiline
                value={newTask.description}
                onChangeText={(text) => setNewTask({...newTask, description: text})}
              />

              <Text style={[styles.inputLabel, { color: colors.primary }]}>PRIORITY</Text>
              <View style={styles.priorityGrid}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <TouchableOpacity 
                    key={p}
                    style={[
                      styles.pSelect, 
                      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                      newTask.priority === p && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
                    ]}
                    onPress={() => setNewTask({...newTask, priority: p})}
                  >
                    <Text style={[
                      styles.pSelectText, 
                      { color: colors.onSurfaceVariant },
                      newTask.priority === p && { color: colors.primary }
                    ]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {projects.length > 0 && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>PROJECT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
                    {projects.map(p => (
                      <TouchableOpacity 
                        key={p.id}
                        style={[
                          styles.optionChip, 
                          { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                          newTask.projectId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setNewTask({...newTask, projectId: p.id})}
                      >
                        <Text style={[
                          styles.optionChipText, 
                          { color: colors.onSurfaceVariant },
                          newTask.projectId === p.id && { color: colors.onPrimary }
                        ]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.createBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={handleCreateTask}
            >
              <Text style={[styles.createBtnText, { color: colors.onPrimary }]}>INITIATE TASK</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
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
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  
  goalsList: { marginHorizontal: -24, paddingHorizontal: 24 },
  goalCard: { backgroundColor: '#161b2b', padding: 20, borderRadius: 24, width: 240, marginRight: 16, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  goalTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#dee1f7', marginBottom: 12 },
  goalProgressContainer: { height: 6, backgroundColor: 'rgba(70, 69, 84, 0.2)', borderRadius: 3, overflow: 'hidden' },
  goalProgressBar: { height: '100%', backgroundColor: '#818cf8', borderRadius: 3 },
  emptyGoalBox: { padding: 24, backgroundColor: 'rgba(129, 140, 248, 0.05)', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.3)' },
  emptyGoalText: { color: '#818cf8', fontSize: 12, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },

  taskCountBadge: { backgroundColor: '#232a3d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  taskCountText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },

  taskList: { gap: 12 },
  taskCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#161b2b', 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)'
  },
  taskDone: { opacity: 0.6, backgroundColor: 'rgba(22, 27, 43, 0.4)' },
  taskCore: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#dee1f7', marginBottom: 4 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#64748b' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 8, fontFamily: 'Inter_800ExtraBold' },
  metaDivider: { width: 1, height: 10, backgroundColor: '#2f3445' },
  metaText: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },
  emptyTasksText: { color: '#64748b', fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },

  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#818cf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#0e1322', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  modalForm: { gap: 20 },
  inputLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#818cf8', letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
  input: { 
    backgroundColor: '#161b2b', 
    borderRadius: 16, 
    padding: 16, 
    color: '#dee1f7', 
    fontFamily: 'Inter_600SemiBold',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)'
  },
  priorityGrid: { flexDirection: 'row', gap: 12 },
  pSelect: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#161b2b', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.2)' },
  pSelectActive: { backgroundColor: 'rgba(129, 140, 248, 0.1)', borderColor: '#818cf8' },
  pSelectText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#64748b' },
  pSelectTextActive: { color: '#818cf8' },

  optionScroll: { paddingVertical: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#161b2b', marginRight: 8, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.2)' },
  optionChipActive: { backgroundColor: '#818cf8', borderColor: '#818cf8' },
  optionChipText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#64748b' },
  optionChipTextActive: { color: '#fff' },

  createBtn: { 
    backgroundColor: '#818cf8', 
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 32,
    shadowColor: '#818cf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  createBtnText: { fontSize: 16, fontFamily: 'Inter_900Black', color: '#fff', letterSpacing: 1 }
});
