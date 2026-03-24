import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Folder, Link as LinkIcon, Plus, ChevronRight, LayoutGrid, Github } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const projects = [
  { name: "FocusDev Monorepo", repo: "Zubimendi/focusdev", focusTime: "24h 45m", status: "active", color: "#6366f1" },
  { name: "E-commerce Frontend", repo: "Zubimendi/shop-ui", focusTime: "12h 10m", status: "paused", color: "#10b981" },
  { name: "Personal Portfolio", repo: "Zubimendi/portfolio", focusTime: "5h 50m", status: "active", color: "#f59e0b" },
  { name: "Quantum Physics Lib", repo: "Zubimendi/q-phys", focusTime: "30m", status: "active", color: "#f43f5e" },
];

export default function ProjectsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>DEVELOPER WORKSPACE</Text>
            <Text style={styles.title}>Project Focus</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Plus size={24} color="#818cf8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>
          Track your deep work hours per repository and analyze where your engineering energy is going.
        </Text>

        {/* Project List */}
        <View style={styles.projectList}>
          {projects.map((project, i) => (
            <TouchableOpacity key={i} style={styles.projectCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                  <Folder size={24} color="#fff" />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: project.status === 'active' ? 'rgba(78, 222, 163, 0.1)' : 'rgba(70, 69, 84, 0.2)' }]}>
                  <Text style={[styles.statusText, { color: project.status === 'active' ? '#4edea3' : '#64748b' }]}>
                    {project.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={styles.repoRow}>
                  <LinkIcon size={12} color="#64748b" />
                  <Text style={styles.repoText}>{project.repo}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.footerLabel}>TOTAL FOCUS</Text>
                  <Text style={styles.focusValue}>{project.focusTime}</Text>
                </View>
                <TouchableOpacity style={styles.detailBtn}>
                  <ChevronRight size={20} color="#818cf8" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Connect More Card */}
          <TouchableOpacity style={styles.connectCard}>
            <View style={styles.connectIcon}>
              <Github size={24} color="#818cf8" />
            </View>
            <Text style={styles.connectText}>CONNECT REPOSITORY</Text>
          </TouchableOpacity>
        </View>

        {/* Engineering Analysis Card */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.05)']}
          style={styles.analysisCard}
        >
          <View style={styles.analysisHeader}>
            <LayoutGrid size={24} color="#818cf8" />
            <Text style={styles.analysisTitle}>Engineering Analysis</Text>
          </View>
          <Text style={styles.analysisContent}>
            You've spent <Text style={styles.highlight}>82%</Text> of your focus time this week on the <Text style={styles.underlined}>focusdev</Text> project. Consider checking your backlog on secondary projects.
          </Text>
        </LinearGradient>
      </ScrollView>
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
    marginBottom: 16
  },
  label: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#818cf8', letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#dee1f7', marginTop: 4 },
  addBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#161b2b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(70, 69, 84, 0.2)' },
  description: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 22, marginBottom: 32 },
  
  projectList: { gap: 16 },
  projectCard: { 
    backgroundColor: '#161b2b', 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(70, 69, 84, 0.1)' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  iconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', letterSpacing: 1 },
  
  cardInfo: { marginBottom: 20 },
  projectName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#dee1f7', marginBottom: 6 },
  repoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.6 },
  repoText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: '#64748b' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(70, 69, 84, 0.1)' },
  footerLabel: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', color: '#64748b', letterSpacing: 1 },
  focusValue: { fontSize: 20, fontFamily: 'JetBrainsMono_700Bold', color: '#dee1f7' },
  detailBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#232a3d', alignItems: 'center', justifyContent: 'center' },
  
  connectCard: { 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: 'rgba(70, 69, 84, 0.2)', 
    alignItems: 'center', 
    gap: 12,
    marginTop: 8
  },
  connectIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(129, 140, 248, 0.1)', alignItems: 'center', justifyContent: 'center' },
  connectText: { fontSize: 11, fontFamily: 'Inter_800ExtraBold', color: '#818cf8', letterSpacing: 1.5 },
  
  analysisCard: { padding: 24, borderRadius: 24, marginTop: 40, borderWidth: 1, borderColor: 'rgba(129, 140, 248, 0.2)' },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  analysisTitle: { fontSize: 18, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  analysisContent: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#64748b', lineHeight: 22 },
  highlight: { color: '#818cf8', fontFamily: 'Inter_800ExtraBold' },
  underlined: { color: '#dee1f7', textDecorationLine: 'underline', fontFamily: 'Inter_700Bold' }
});
