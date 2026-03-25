import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Terminal, Calendar, Filter, Clock, Edit2, Bolt } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

const sessions = [
  { id: '1', title: 'Refactor Auth Middleware', type: 'Coding', duration: '45 min', time: '10:30 AM', color: '#6366f1' },
  { id: '2', title: 'Architecture Whiteboarding', type: 'Building', duration: '25 min', time: '01:15 PM', color: '#4edea3' },
  { id: '3', title: 'Post-mortem Review', type: 'Learning', duration: '15 min', time: '03:45 PM', color: '#ffb95f' },
  { id: '4', title: 'Unit Test Suite Execution', type: 'Coding', duration: '15 min', time: '05:00 PM', color: '#6366f1' },
];

const getInitialDays = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return weekDays.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day, date: d.getDate(), fullDate: d.toDateString(), active: d.toDateString() === new Date().toDateString() };
  });
};

const days = getInitialDays();
const currentLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

export default function SessionsScreen() {
  const { colors, isDark } = useAppTheme();
  const progress = 0.75;
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
          <Text style={[styles.logoText, { color: colors.primary }]}>MONOLITH</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Calendar color={colors.onSurfaceVariant} size={20} />
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2f3445' : '#e2e8f0' }]} />
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
              style={[
                styles.dateCard, 
                item.active ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, opacity: 0.6 }
              ]}
            >
              <Text style={[styles.dateDay, { color: item.active ? colors.onPrimary : colors.onSurfaceVariant }]}>{item.day}</Text>
              <Text style={[styles.dateDate, { color: item.active ? colors.onPrimary : colors.onSurface }]}>{item.date}</Text>
              {item.active && <View style={[styles.activeDot, { backgroundColor: colors.onPrimary }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.summaryCard, { backgroundColor: isDark ? 'rgba(47, 52, 69, 0.7)' : 'rgba(255, 255, 255, 0.7)', borderColor: colors.outlineVariant }]}>
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>TODAY&apos;S PERFORMANCE</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>4</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>sessions</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>1h 40m</Text>
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
                stroke={isDark ? "#161b2b" : "#f1f5f9"}
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

        <View style={styles.sessionsList}>
          {sessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.cardSidebar, { backgroundColor: session.color }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={[styles.sessionTitle, { color: colors.onSurface }]}>{session.title}</Text>
                  <View style={styles.sessionTags}>
                    <View style={[styles.tag, { backgroundColor: `${session.color}15` }]}>
                      <Text style={[styles.tagText, { color: session.color }]}>{session.type}</Text>
                    </View>
                    <View style={styles.timeInfo}>
                      <Clock size={12} color={colors.onSurfaceVariant} />
                      <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>{session.duration} · {session.time}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? 'rgba(47, 52, 69, 0.4)' : 'rgba(226, 232, 240, 0.4)' }]}>
                  <Edit2 size={16} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0e1322',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: '#0e1322',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#818cf8',
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
    color: '#dee1f7',
    marginTop: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#161b2b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterText: {
    color: '#dee1f7',
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
  dateCardInactive: {
    backgroundColor: '#161b2b',
    opacity: 0.6,
  },
  dateCardActive: {
    backgroundColor: '#8083ff',
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
    color: '#dee1f7',
    marginTop: 4,
  },
  textActive: {
    color: '#0d0096',
  },
  activeDot: {
    width: 4,
    height: 4,
    backgroundColor: '#0d0096',
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
    color: '#c0c1ff',
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
  sessionCard: {
    backgroundColor: '#161b2b',
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
    color: '#dee1f7',
  },
  sessionTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
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
