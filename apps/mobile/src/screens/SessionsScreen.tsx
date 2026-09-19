import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Terminal, Calendar, Filter, Clock, Edit2, Bolt } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { focusService } from '../services/focus';
import { useAuthStore } from '../store/auth-store';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const getInitialDays = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return weekDays.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day, date: d.getDate(), fullDate: d.toDateString(), active: d.toDateString() === new Date().toDateString() };
  });
};

function sessionMinutes(s: { duration?: number; startTime: string; endTime?: string }) {
  if (typeof s.duration === 'number' && s.duration > 0) return s.duration;
  if (s.endTime) {
    return Math.max(0, (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000);
  }
  return 0;
}

function formatDuration(mins: number) {
  const m = Math.round(mins);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h ${r}m` : `${h}h`;
}

export default function SessionsScreen() {
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const [days] = useState(getInitialDays);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const load = useCallback(async () => {
    try {
      const { sessions: list } = await focusService.getSessions();
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const daySessions = useMemo(
    () =>
      sessions.filter(
        (s) => new Date(s.startTime).toDateString() === selectedDate
      ),
    [sessions, selectedDate]
  );

  const todayMinutes = daySessions.reduce((acc, s) => acc + sessionMinutes(s), 0);
  const progress = Math.min(todayMinutes / 120, 1);
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.logoRow}>
          <Terminal color={colors.primary} size={24} />
          <Text style={[styles.logoText, { color: colors.primary }]}>FocusDev</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Calendar color={colors.onSurfaceVariant} size={20} />
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2f3445' : '#e2e8f0' }]}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>{initial}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>LOG HISTORY</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>Sessions</Text>
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.surface }]}>
            <Filter size={14} color={colors.onSurface} />
            <Text style={[styles.filterText, { color: colors.onSurface }]}>{currentLabel}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.dateStrip}
          contentContainerStyle={styles.dateStripContent}
        >
          {days.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              onPress={() => setSelectedDate(item.fullDate)}
              style={[
                styles.dateCard, 
                selectedDate === item.fullDate
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, opacity: 0.6 }
              ]}
            >
              <Text style={[styles.dateDay, { color: selectedDate === item.fullDate ? colors.onPrimary : colors.onSurfaceVariant }]}>{item.day}</Text>
              <Text style={[styles.dateDate, { color: selectedDate === item.fullDate ? colors.onPrimary : colors.onSurface }]}>{item.date}</Text>
              {selectedDate === item.fullDate && <View style={[styles.activeDot, { backgroundColor: colors.onPrimary }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(47, 52, 69, 0.7)' : 'rgba(255, 255, 255, 0.7)', borderColor: colors.outlineVariant }]}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>DAY PERFORMANCE</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{daySessions.length}</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>sessions</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{formatDuration(todayMinutes)}</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>focus</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressRing}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isDark ? "#1c2421" : "#f1f5f9"}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#4edea3"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <View style={styles.ringIcon}>
              <Bolt size={14} color="#4edea3" fill="#4edea3" />
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.sessionsList}>
            {daySessions.length === 0 ? (
              <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>No sessions this day.</Text>
            ) : (
              daySessions.map((session) => {
                const mins = sessionMinutes(session);
                const time = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const title = session.notes || 'Focus session';
                return (
                  <View key={session.id || session._id} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
                    <View style={[styles.cardSidebar, { backgroundColor: colors.primary }]} />
                    <View style={styles.cardContent}>
                      <View style={styles.cardInfo}>
                        <Text style={[styles.sessionTitle, { color: colors.onSurface }]}>{title}</Text>
                        <View style={styles.sessionTags}>
                          <View style={styles.timeInfo}>
                            <Clock size={12} color={colors.onSurfaceVariant} />
                            <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
                              {formatDuration(mins)} · {time}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? 'rgba(47, 52, 69, 0.4)' : 'rgba(226, 232, 240, 0.4)' }]}>
                        <Edit2 size={16} color={colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f1614',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: '#0f1614',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#7eb8a8',
    letterSpacing: -1,
    fontFamily: 'Inter_900Black',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f3445',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    color: '#c7c4d7',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_900Black',
    color: '#eef1f0',
    marginTop: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1c2421',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterText: {
    color: '#eef1f0',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  dateStrip: {
    marginHorizontal: -24,
    marginBottom: 32,
  },
  dateStripContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dateCard: {
    width: 64,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#c7c4d7',
    textTransform: 'uppercase',
  },
  dateDate: {
    fontSize: 20,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#eef1f0',
    marginTop: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(47, 52, 69, 0.7)',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryInfo: {
    gap: 8,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#c7c4d7',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#7eb8a8',
  },
  statUnit: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#c7c4d7',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(70, 69, 84, 0.2)',
  },
  progressRing: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIcon: {
    position: 'absolute',
  },
  sessionsList: {
    gap: 16,
  },
  empty: { textAlign: 'center', fontFamily: 'Inter_500Medium', paddingVertical: 24 },
  sessionCard: {
    backgroundColor: '#1c2421',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardSidebar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    gap: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#eef1f0',
  },
  sessionTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c7c4d7',
  },
  editBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 52, 69, 0.4)',
  },
});
