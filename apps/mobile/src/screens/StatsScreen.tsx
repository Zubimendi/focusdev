import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Terminal, Download, Share2, Timer, Code, Calendar, BarChart4, TrendingUp, Award, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

const heatmapData = [
  [0,40,100,0,60,80,100],
  [20,0,40,100,80,40,0],
  [100,100,80,40,100,60,20],
  [40,0,40,100,20,80,60],
  [20,60,100,0,80,40,100],
];

const stats = [
  { icon: ClockIcon, label: "Focus Hours", value: "38.5h", color: "#818cf8" },
  { icon: TimerIcon, label: "Sessions", value: "24", color: "#818cf8" },
  { icon: CodeIcon, label: "LeetCode Solved", value: "14", color: "#818cf8" },
  { icon: FlameIcon, label: "Streak Days", value: "12", color: "#ffb95f", valueColor: "#ffb95f" },
];

const barData = [
  { day: "M", height: "60%", color: "rgba(129, 140, 248, 0.4)" },
  { day: "T", height: "80%", color: "#4edea3" },
  { day: "W", height: "40%", color: "#818cf8" },
  { day: "T", height: "70%", color: "#ffb4ab" },
  { day: "F", height: "30%", color: "rgba(78, 222, 163, 0.6)" },
  { day: "S", height: "20%", color: "rgba(129, 140, 248, 0.8)" },
  { day: "S", height: "50%", color: "rgba(129, 140, 248, 0.3)" },
];

const allocation = [
  { label: "Coding", pct: "70%", color: "#818cf8" },
  { label: "Learning", pct: "20%", color: "#4edea3" },
  { label: "Building", pct: "10%", color: "#ffb4ab" },
];

// Re-using icons with custom names for the stats mapping
function ClockIcon(props: any) { return <Timer {...props} />; }
function TimerIcon(props: any) { return <BarChart4 {...props} />; }
function CodeIcon(props: any) { return <Code {...props} />; }
function FlameIcon(props: any) { return <TrendingUp {...props} />; }

export default function StatsScreen() {
  const { colors, isDark } = useAppTheme();
  const [range, setRange] = useState<'week' | 'month'>('week');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header & Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>PERFORMANCE HUB</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>Your Progress</Text>
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

        {/* Stat Bento Grid */}
        <View style={styles.statGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <s.icon size={20} color={isDark ? s.color : colors.primary} />
              <View>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{s.label.toUpperCase()}</Text>
                <Text style={[styles.statValue, { color: colors.onSurface }, s.valueColor ? { color: s.valueColor } : {}]}>{s.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Activity Heatmap */}
        <View style={[styles.heatmapSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Activity Density</Text>
            <View style={[styles.periodBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.periodText, { color: colors.onSurfaceVariant }]}>LAST 30 DAYS</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heatmapContainer}>
            <View style={styles.heatmap}>
              {heatmapData.map((col, ci) => (
                <View key={ci} style={styles.heatmapColumn}>
                  {col.map((val, ri) => (
                    <View 
                      key={ri} 
                      style={[
                        styles.heatmapSquare, 
                        { backgroundColor: val === 0 ? (isDark ? 'rgba(47, 52, 69, 0.6)' : '#f1f5f9') : `rgba(78, 222, 163, ${isDark ? val/100 : 0.4 + val/200})` }
                      ]} 
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Daily Intensity Bar Chart */}
        <View style={[styles.intensitySection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Daily Intensity</Text>
          <View style={styles.chartContainer}>
            {barData.map((b, i) => (
              <View key={i} style={styles.barItem}>
                <View style={[styles.bar, { height: b.height as any, backgroundColor: isDark ? b.color : colors.primary + '80' }]} />
                <Text style={[styles.barLabel, { color: colors.onSurfaceVariant }]}>{b.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Focus Allocation */}
        <View style={[styles.allocationSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Focus Allocation</Text>
          <View style={[styles.allocationBar, { backgroundColor: colors.background }]}>
            {allocation.map((a, i) =>                <View key={i} style={[styles.allocationSegment, { width: a.pct as any, backgroundColor: a.color }]} />
            )}
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

        {/* Highlights */}
        <View style={styles.highlightsGrid}>
          <View style={[styles.highlightCard, { backgroundColor: isDark ? 'rgba(78, 222, 163, 0.1)' : '#ecfdf5' }]}>
            <View style={styles.highlightIcon}>
              <Award size={24} color="#4edea3" fill={isDark ? "rgba(78, 222, 163, 0.4)" : "rgba(78, 222, 163, 0.2)"} />
            </View>
            <View>
              <Text style={[styles.highlightLabel, { color: colors.onSurfaceVariant }]}>BEST DAY</Text>
              <Text style={[styles.highlightValue, { color: colors.onSurface }]}>Tuesday</Text>
            </View>
          </View>
          <View style={[styles.highlightCard, { backgroundColor: isDark ? 'rgba(129, 140, 248, 0.1)' : '#eef2ff' }]}>
            <View style={styles.highlightIcon}>
              <Star size={24} color={colors.primary} fill={isDark ? "rgba(129, 140, 248, 0.4)" : colors.primary + '30'} />
            </View>
            <View>
              <Text style={[styles.highlightLabel, { color: colors.onSurfaceVariant }]}>BEST WEEK</Text>
              <Text style={[styles.highlightValue, { color: colors.onSurface }]}>Week 12</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  header: { 
    marginTop: 20,
    marginBottom: 40,
    gap: 20
  },
  label: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#dee1f7', marginTop: 4 },
  rangeToggle: { 
    flexDirection: 'row', 
    backgroundColor: '#161b2b', 
    padding: 6, 
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#232a3d' },
  toggleText: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#64748b' },
  toggleTextActive: { color: '#dee1f7' },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { 
    width: (width - 48 - 12) / 2, 
    backgroundColor: '#161b2b', 
    padding: 24, 
    borderRadius: 24, 
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)'
  },
  statLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 1 },
  statValue: { fontSize: 24, fontFamily: 'JetBrainsMono_700Bold', color: '#dee1f7' },

  heatmapSection: { marginTop: 40, backgroundColor: '#161b2b', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  periodBadge: { backgroundColor: '#232a3d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  periodText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },
  heatmapContainer: { marginHorizontal: -4 },
  heatmap: { flexDirection: 'row', gap: 6 },
  heatmapColumn: { gap: 6 },
  heatmapSquare: { width: 14, height: 14, borderRadius: 3 },

  intensitySection: { marginTop: 24, backgroundColor: '#161b2b', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  chartContainer: { flexDirection: 'row', height: 160, alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20 },
  barItem: { flex: 1, alignItems: 'center', gap: 12 },
  bar: { width: 12, borderRadius: 6 },
  barLabel: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: '#64748b' },

  allocationSection: { marginTop: 24, backgroundColor: '#161b2b', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.1)' },
  allocationBar: { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', marginTop: 20, marginBottom: 24 },
  allocationSegment: { height: '100%' },
  allocationList: { gap: 16 },
  allocationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  allocationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  allocationText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#c7c4d7' },
  allocationPct: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', color: '#dee1f7' },

  highlightsGrid: { flexDirection: 'row', gap: 12, marginTop: 24 },
  highlightCard: { flex: 1, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  highlightIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center' },
  highlightLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#c7c4d7', letterSpacing: 1 },
  highlightValue: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', color: '#dee1f7', marginTop: 2 }
});
