import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth-store';
import { taskService } from '../services/task';
import { focusService } from '../services/focus';
import { type Task } from '@focus/shared';
import { Terminal, Bell, Play, Square, FastForward, Clock, User as UserIcon } from 'lucide-react-native';
import { Svg, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const user = useAuthStore((state: any) => state.user);

  // Constants for the SVG ring
  const size = 260;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = timerSeconds / (25 * 60);
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  const fetchRecentData = useCallback(async () => {
    try {
      const res: any = await taskService.getTasks();
      setRecentTasks(res.tasks?.slice(0, 3) || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  }, []);

  useEffect(() => {
    fetchRecentData();
  }, [fetchRecentData]);

  useEffect(() => {
    let interval: any;
    if (isActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isActive) {
      handleToggleTimer(); // Auto-stop when time is up
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds]);

  const handleToggleTimer = async () => {
    if (!isActive) {
      try {
        const res: any = await focusService.startSession({ 
          startTime: new Date().toISOString(),
          taskTitle: taskTitle || 'Focused session'
        });
        setSessionId(res.session?._id || 'temp-id');
        setIsActive(true);
        Keyboard.dismiss();
      } catch (error) {
        Alert.alert('Error', 'Failed to start focus session. Check your connection.');
        console.error('Failed to start session', error);
      }
    } else {
      try {
        if (sessionId) {
          await focusService.endSession(sessionId, 'Completed focus block');
        }
        setIsActive(false);
        setTimerSeconds(25 * 60);
        setSessionId(null);
        fetchRecentData();
      } catch (error) {
        Alert.alert('Error', 'Failed to end session properly.');
        console.error('Failed to end session', error);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tags = ['Coding', 'Learning', 'Building', 'Review', 'Other'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Terminal color="#818cf8" size={24} />
                <Text style={styles.headerTitle}>MONOLITH</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Bell color="#c7c4d7" size={20} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <UserIcon color="#c7c4d7" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.welcomeSection}>
                <View>
                  <Text style={styles.welcomeLabel}>GOOD MORNING, DEVELOPER</Text>
                  <Text style={styles.welcomeTitle}>{user?.name?.split(' ')[0] || 'Tobe'}</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>12 DAY STREAK 🔥</Text>
                </View>
              </View>

              {/* Timer Section */}
              <View style={styles.timerContainer}>
                <View style={styles.ringContainer}>
                  <Svg width={size} height={size} style={styles.svg}>
                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="rgba(129, 140, 248, 0.1)"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#818cf8"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    />
                  </Svg>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeText}>{formatTime(timerSeconds)}</Text>
                    <Text style={styles.sessionType}>{isActive ? 'FOCUSED ON...' : 'DEEP WORK'}</Text>
                  </View>
                </View>
              </View>

              {/* Task Input Section */}
              <View style={styles.actionCard}>
                <Text style={styles.inputLabel}>ACTIVE MISSION</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="What are you working on?"
                  placeholderTextColor="rgba(199, 196, 215, 0.4)"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  editable={!isActive}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagStrip}>
                  {tags.map((tag) => (
                    <TouchableOpacity key={tag} style={styles.tag} onPress={() => !isActive && setTaskTitle(tag)}>
                      <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.startBtn}
                    onPress={handleToggleTimer}
                  >
                    <LinearGradient
                      colors={isActive ? ['#ef4444', '#b91c1c'] : ['#818cf8', '#6366f1']}
                      style={styles.gradientBtn}
                    >
                      {isActive ? <Square size={20} color="#fff" fill="#fff" /> : <Play size={20} color="#fff" fill="#fff" />}
                      <Text style={styles.startBtnText}>{isActive ? 'STOP SESSION' : 'START SESSION'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.skipBtn} onPress={() => {
                    setTimerSeconds(25 * 60);
                    setIsActive(false);
                    setSessionId(null);
                  }}>
                    <FastForward size={20} color="#c7c4d7" />
                    <Text style={styles.skipBtnText}>RESET</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recent Sessions */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                <TouchableOpacity onPress={fetchRecentData}>
                  <Text style={styles.viewAll}>Refresh</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sessionsList}>
                {recentTasks.length > 0 ? recentTasks.map((task) => (
                  <TouchableOpacity key={task.id} style={styles.sessionCard}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{task.title}</Text>
                      <View style={styles.sessionMeta}>
                        <View style={styles.tagSmall}>
                          <Text style={styles.tagTextSmall}>{task.status.toUpperCase()}</Text>
                        </View>
                        <View style={styles.timeMeta}>
                          <Clock size={12} color="#64748b" />
                          <Text style={styles.metaText}>
                            {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.editBtn}>
                      <Text style={styles.editText}>EDIT</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )) : (
                  <View style={styles.emptySessions}>
                    <Text style={styles.emptyText}>No recent sessions. Start focus!</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontFamily: 'Inter_900Black', color: '#818cf8', letterSpacing: -1 },
  iconBtn: { padding: 8, backgroundColor: '#161b2b', borderRadius: 10 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 110 },
  welcomeSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 40
  },
  welcomeLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2 },
  welcomeTitle: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#dee1f7', marginTop: 4 },
  streakBadge: { 
    backgroundColor: 'rgba(255, 185, 95, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 185, 95, 0.2)'
  },
  streakText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#ffb95f' },
  
  timerContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 20 
  },
  ringContainer: { 
    width: 260, 
    height: 260, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  svg: { position: 'absolute' },
  timeDisplay: { alignItems: 'center' },
  timeText: { 
    fontSize: 54, 
    fontFamily: 'JetBrainsMono_700Bold', 
    color: '#dee1f7',
    letterSpacing: -2
  },
  sessionType: { 
    fontSize: 10, 
    fontFamily: 'Inter_800ExtraBold', 
    color: '#818cf8', 
    letterSpacing: 4,
    marginTop: 4
  },

  actionCard: { 
    backgroundColor: '#161b2b', 
    borderRadius: 24, 
    padding: 24, 
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)'
  },
  inputLabel: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2, marginBottom: 16 },
  input: { 
    fontSize: 18, 
    fontFamily: 'Inter_600SemiBold', 
    color: '#dee1f7', 
    marginBottom: 20 
  },
  tagStrip: { marginBottom: 24 },
  tag: { 
    backgroundColor: '#232a3d', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginRight: 8 
  },
  tagText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#c7c4d7' },
  
  buttonRow: { flexDirection: 'row', gap: 12 },
  startBtn: { flex: 2, height: 56, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  startBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_800ExtraBold' },
  skipBtn: { 
    flex: 1, 
    height: 56, 
    backgroundColor: '#232a3d', 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  skipBtnText: { color: '#c7c4d7', fontSize: 10, fontFamily: 'Inter_800ExtraBold' },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginTop: 48, 
    marginBottom: 20 
  },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter_800ExtraBold', color: '#dee1f7' },
  viewAll: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#818cf8' },
  
  sessionsList: { gap: 12 },
  sessionCard: { 
    backgroundColor: '#161b2b', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)'
  },
  sessionInfo: { gap: 8 },
  sessionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#dee1f7' },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tagSmall: { backgroundColor: 'rgba(129, 140, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagTextSmall: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#818cf8' },
  timeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: '#64748b' },
  editBtn: { padding: 8 },
  editText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#64748b' },
  emptySessions: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#64748b', fontStyle: 'italic', fontSize: 12 }
});
