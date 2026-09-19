import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Timer, BarChart4, TrendingUp, Award, Star, CheckCircle } from 'lucide-react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { focusService } from '../services/focus';
import { useSettingsStore } from '../store/settings-store';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type StatsPayload = Awaited<ReturnType<typeof focusService.getStats>>;

function heatmapLevel(val: number, isDark: boolean) {
  if (val === 0) return isDark ? 'rgba(47, 52, 69, 0.6)' : '#f1f5f9';
  const opacity = isDark ? 0.25 + val * 0.2 : 0.35 + val * 0.15;
  return `rgba(78, 222, 163, ${Math.min(opacity, 1)})`;
}

export default function StatsScreen() {
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const showCharts = useSettingsStore((s) => s.showCharts);
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const stats = await focusService.getStats(range, showCharts);
      setData(stats);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, showCharts]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const summary: Array<{ label: string; value: string; change?: string }> =
    data?.summary ?? [];
  const icons = [Timer, BarChart4, CheckCircle, TrendingUp];

  const heatmapRows = 7;
  const heatmapCols = data?.heatmap?.length
    ? Math.ceil(data.heatmap.length / heatmapRows)
    : 0;
  const heatmapGrid: number[][] = [];
  if (data?.heatmap) {
    for (let c = 0; c < heatmapCols; c++) {
      const col: number[] = [];
      for (let r = 0; r < heatmapRows; r++) {
        col.push(data.heatmap[c * heatmapRows + r] ?? 0);
      }
      heatmapGrid.push(col);
    }
  }

  const barData: Array<{ day: string; height: string; minutes?: number }> =
    data?.last7Days ?? [];
  const byProject: Array<{
    name: string;
    color?: string;
    focusMinutes?: number;
  }> = data?.byProject ?? [];
  const totalProjectMinutes =
    byProject.reduce(
      (a: number, p: { focusMinutes?: number }) => a + (p.focusMinutes || 0),
      0
    ) || 1;
  const allocation = byProject.slice(0, 5).map(
    (p: { name: string; color?: string; focusMinutes?: number }) => ({
      label: p.name,
      pct: `${Math.round(((p.focusMinutes || 0) / totalProjectMinutes) * 100)}%`,
      color: p.color || colors.primary,
    })
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>PERFORMANCE HUB</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>Your Progress</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('PeriodReview', { periodType: 'week' })}>
              <Text style={[styles.reviewLink, { color: colors.primary }]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PeriodReview', { periodType: 'month' })}>
              <Text style={[styles.reviewLink, { color: colors.primary }]}>Month</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.rangeToggle, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              onPress={() => setRange('week')}
              style={[styles.toggleBtn, range === 'week' && { backgroundColor: isDark ? '#232a3d' : '#e2e8f0' }]}
            >
              <Text style={[styles.toggleText, { color: colors.onSurfaceVariant }, range === 'week' && { color: colors.onSurface }]}>THIS WEEK</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRange('month')}
              style={[styles.toggleBtn, range === 'month' && { backgroundColor: isDark ? '#232a3d' : '#e2e8f0' }]}
            >
              <Text style={[styles.toggleText, { color: colors.onSurfaceVariant }, range === 'month' && { color: colors.onSurface }]}>THIS MONTH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <>
            <View style={styles.statGrid}>
              {summary.length === 0 ? (
                <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Inter_500Medium', paddingVertical: 24 }}>
                  No performance data yet. Start a focus session to begin tracking.
                </Text>
              ) : summary.map((s, i) => {
                const Icon = icons[i] || Timer;
                const valueColor = s.label === 'Current Streak' ? '#ffb95f' : undefined;
                return (
                  <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Icon size={20} color={isDark ? colors.primary : colors.primary} />
                    <View>
                      <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label.toUpperCase()}</Text>
                      <Text style={[styles.statValue, { color: colors.onSurface }, valueColor ? { color: valueColor } : {}]}>{s.value}</Text>
                      {!!s.change && s.change !== '—' && (
                        <Text style={[styles.statChange, { color: colors.onSurfaceVariant }]}>{s.change}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {!showCharts && (
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 16 }}>
                Charts are off. Enable them in Settings to load trends.
              </Text>
            )}

            {showCharts && heatmapGrid.length > 0 && data?.heatmap?.some((v: number) => v > 0) && (
            <View style={[styles.heatmapSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Activity Density</Text>
                <View style={[styles.periodBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.periodText, { color: colors.onSurfaceVariant }]}>LAST 50 DAYS</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heatmapContainer}>
                <View style={styles.heatmap}>
                  {heatmapGrid.map((col, ci) => (
                    <View key={ci} style={styles.heatmapColumn}>
                      {col.map((val, ri) => (
                        <View 
                          key={ri} 
                          style={[styles.heatmapSquare, { backgroundColor: heatmapLevel(val, isDark) }]} 
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
            )}

            {showCharts && barData.some((b: { minutes?: number }) => (b.minutes || 0) > 0) && (
            <View style={[styles.intensitySection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Daily Intensity</Text>
              <View style={styles.chartContainer}>
                {barData.map((b, i) => (
                  <View key={i} style={styles.barItem}>
                    <View style={[styles.bar, { height: b.height as `${number}%`, backgroundColor: isDark ? colors.primary : colors.primary + '80' }]} />
                    <Text style={[styles.barLabel, { color: colors.onSurfaceVariant }]}>{b.day}</Text>
                  </View>
                ))}
              </View>
            </View>
            )}

            {showCharts && allocation.length > 0 && (
              <View style={[styles.allocationSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Focus by project</Text>
                <View style={[styles.allocationBar, { backgroundColor: colors.background }]}>
                  {allocation.map((a, i) => (
                    <View key={i} style={[styles.allocationSegment, { width: a.pct as `${number}%`, backgroundColor: a.color }]} />
                  ))}
                </View>
                <View style={styles.allocationList}>
                  {allocation.map((a, i) => (
                    <View key={i} style={styles.allocationItem}>
                      <View style={styles.allocationLeft}>
                        <View style={[styles.dot, { backgroundColor: a.color }]} />
                        <Text style={[styles.allocationText, { color: colors.onSurfaceVariant }]}>{a.label}</Text>
                      </View>
                      <Text style={[styles.allocationPct, { color: colors.onSurface }]}>{a.pct}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {showCharts && (
            <View style={styles.highlightsGrid}>
              <View style={[styles.highlightCard, { backgroundColor: isDark ? 'rgba(78, 222, 163, 0.1)' : '#ecfdf5' }]}>
                <View style={styles.highlightIcon}>
                  <Award size={24} color="#4edea3" fill={isDark ? "rgba(78, 222, 163, 0.4)" : "rgba(78, 222, 163, 0.2)"} />
                </View>
                <View>
                  <Text style={[styles.highlightLabel, { color: colors.onSurfaceVariant }]}>BEST DAY</Text>
                  <Text style={[styles.highlightValue, { color: colors.onSurface }]}>
                    {data?.highlights?.bestDay ?? '—'}
                  </Text>
                </View>
              </View>
              <View style={[styles.highlightCard, { backgroundColor: isDark ? 'rgba(126, 184, 168, 0.15)' : '#eef2ff' }]}>
                <View style={styles.highlightIcon}>
                  <Star size={24} color={colors.primary} fill={isDark ? "rgba(129, 140, 248, 0.4)" : colors.primary + '30'} />
                </View>
                <View>
                  <Text style={[styles.highlightLabel, { color: colors.onSurfaceVariant }]}>FOCUS SCORE</Text>
                  <Text style={[styles.highlightValue, { color: colors.onSurface }]}>
                    {data?.highlights?.focusScore != null ? `${data.highlights.focusScore}%` : '—'}
                  </Text>
                </View>
              </View>
            </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1614' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  header: { 
    marginTop: 20,
    marginBottom: 40,
    gap: 12
  },
  reviewLink: { fontSize: 13, fontFamily: 'Inter_700Bold', alignSelf: 'flex-start' },
  label: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#eef1f0', marginTop: 4 },
  rangeToggle: { 
    flexDirection: 'row', 
    backgroundColor: '#1c2421', 
    padding: 6, 
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  toggleText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#64748b' },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { 
    width: (width - 48 - 12) / 2, 
    backgroundColor: '#1c2421', 
    padding: 24, 
    borderRadius: 24, 
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)'
  },
  statLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 1 },
  statValue: { fontSize: 24, fontFamily: 'JetBrainsMono_700Bold', color: '#eef1f0' },
  statChange: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 4 },

  heatmapSection: { marginTop: 40, backgroundColor: '#1c2421', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_900Black', color: '#eef1f0' },
  periodBadge: { backgroundColor: '#232a3d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  periodText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },
  heatmapContainer: { marginHorizontal: -4 },
  heatmap: { flexDirection: 'row', gap: 6 },
  heatmapColumn: { gap: 6 },
  heatmapSquare: { width: 14, height: 14, borderRadius: 3 },

  intensitySection: { marginTop: 24, backgroundColor: '#1c2421', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  chartContainer: { flexDirection: 'row', height: 160, alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20 },
  barItem: { flex: 1, alignItems: 'center', gap: 12 },
  bar: { width: 12, borderRadius: 6 },
  barLabel: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },

  allocationSection: { marginTop: 24, backgroundColor: '#1c2421', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  allocationBar: { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', marginTop: 20, marginBottom: 24 },
  allocationSegment: { height: '100%' },
  allocationList: { gap: 16 },
  allocationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  allocationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  allocationText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#c7c4d7' },
  allocationPct: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', color: '#eef1f0' },

  highlightsGrid: { flexDirection: 'row', gap: 12, marginTop: 24 },
  highlightCard: { flex: 1, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  highlightIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  highlightLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 1 },
  highlightValue: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#eef1f0', marginTop: 2 }
});
