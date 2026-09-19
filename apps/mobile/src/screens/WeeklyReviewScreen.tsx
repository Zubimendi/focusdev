import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Target } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import { reviewsService, type PeriodType } from '../services/reviews';

function formatMinutes(m: number) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  return min > 0 ? `${h}h ${min}m` : `${h}h`;
}

export default function PeriodReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const periodType: PeriodType = route.params?.periodType === 'month' ? 'month' : 'week';
  const isMonth = periodType === 'month';
  const title = isMonth ? 'Monthly review' : 'Weekly review';
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof reviewsService.getCurrent>> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await reviewsService.getCurrent(periodType);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodType]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const review = data?.review;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.replace('PeriodReview', { periodType: isMonth ? 'week' : 'month' })
          }
        >
          <Text style={[styles.switchLink, { color: colors.primary }]}>
            {isMonth ? 'Week' : 'Month'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : !review ? (
        <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
          Couldn’t load this {isMonth ? 'month' : 'week'}’s review.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
          }
        >
          <View style={[styles.periodRow, { backgroundColor: colors.surface }]}>
            <Calendar size={18} color={colors.primary} />
            <Text style={[styles.periodText, { color: colors.onSurfaceVariant }]}>
              {data?.period?.start
                ? `${new Date(data.period.start).toLocaleDateString()} – ${new Date(data.period.end).toLocaleDateString()}`
                : isMonth
                  ? 'This month'
                  : 'This week'}
            </Text>
          </View>

          <View style={styles.grid}>
            {[
              { label: 'Focus', value: formatMinutes(review.focusMinutes) },
              { label: 'Sessions', value: String(review.sessionCount) },
              { label: 'Tasks done', value: String(review.tasksDone) },
              { label: 'Streak', value: `${review.streak}d` },
            ].map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label.toUpperCase()}</Text>
                <Text style={[styles.statValue, { color: colors.onSurface }]}>{s.value}</Text>
              </View>
            ))}
          </View>

          {review.byProject?.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>By project</Text>
              {review.byProject.map((p) => (
                <View key={p.projectId} style={styles.projectRow}>
                  <View style={[styles.dot, { backgroundColor: p.color || colors.primary }]} />
                  <Text style={[styles.projectName, { color: colors.onSurface }]}>{p.name}</Text>
                  <Text style={[styles.projectMeta, { color: colors.onSurfaceVariant }]}>
                    {formatMinutes(p.focusMinutes)} · {p.tasksDone} tasks
                  </Text>
                </View>
              ))}
            </View>
          )}

          {data?.goals && data.goals.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.sectionHeader}>
                <Target size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 0 }]}>Goals</Text>
              </View>
              {data.goals.slice(0, 8).map((g) => (
                <View key={g.id} style={styles.goalRow}>
                  <Text style={[styles.goalTitle, { color: colors.onSurface }]}>{g.title}</Text>
                  <Text style={[styles.goalStatus, { color: colors.onSurfaceVariant }]}>{g.status}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  back: { padding: 4 },
  title: { fontSize: 20, fontFamily: 'Inter_900Black' },
  switchLink: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  empty: { textAlign: 'center', marginTop: 40, fontFamily: 'Inter_500Medium' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginBottom: 20 },
  periodText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1 },
  statLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', letterSpacing: 1 },
  statValue: { fontSize: 22, fontFamily: 'JetBrainsMono_700Bold', marginTop: 8 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_800ExtraBold', marginBottom: 12 },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  projectName: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  projectMeta: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular' },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  goalTitle: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium', marginRight: 8 },
  goalStatus: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
});
