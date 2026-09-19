import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Folder, Link as LinkIcon, Plus, LayoutGrid } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../hooks/useAppTheme';
import { projectService } from '../services/project';

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'paused' | 'archived';
  githubRepoFullName?: string;
  githubRepo?: string;
  focusMinutes?: number;
  taskCounts?: { done: number; total: number };
}

function formatFocusTime(minutes: number) {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProjectsScreen() {
  const { colors, isDark } = useAppTheme();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(
        (data.projects || []).map((p: any) => ({
          ...p,
          id: p.id || p._id,
          status: p.status || 'active',
          color: p.color || '#2d6a5e',
        }))
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Project name is required');
      return;
    }
    setCreating(true);
    try {
      await projectService.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color: '#2d6a5e',
      });
      setName('');
      setDescription('');
      setShowCreate(false);
      await load();
    } catch {
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const topProject = [...projects]
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => (b.focusMinutes || 0) - (a.focusMinutes || 0))[0];
  const totalWeek = projects.reduce((a, p) => a + (p.focusMinutes || 0), 0);
  const topShare =
    topProject && totalWeek > 0
      ? Math.round(((topProject.focusMinutes || 0) / totalWeek) * 100)
      : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.label, { color: colors.primary }]}>WORKSPACE</Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>Project Focus</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
            onPress={() => setShowCreate(true)}
          >
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          Track your deep work hours per project and analyze where your engineering energy is going.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : projects.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.outlineVariant }]}>
            <Folder size={40} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
              No projects yet. Create one to start tracking.
            </Text>
            <TouchableOpacity
              style={[styles.createCta, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreate(true)}
            >
              <Text style={styles.createCtaText}>New Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.projectList}>
            {projects.map((project) => (
              <View
                key={project.id}
                style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: project.color }]}>
                    <Folder size={24} color="#fff" />
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          project.status === 'active'
                            ? 'rgba(78, 222, 163, 0.1)'
                            : colors.outlineVariant + '40',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            project.status === 'active' ? '#4edea3' : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {project.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={[styles.projectName, { color: colors.onSurface }]}>
                    {project.name}
                  </Text>
                  {(project.githubRepoFullName || project.githubRepo) && (
                    <View style={styles.repoRow}>
                      <LinkIcon size={12} color={colors.onSurfaceVariant} />
                      <Text style={[styles.repoText, { color: colors.onSurfaceVariant }]}>
                        {project.githubRepoFullName || project.githubRepo}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant }]}>
                  <View>
                    <Text style={[styles.footerLabel, { color: colors.onSurfaceVariant }]}>
                      FOCUS THIS WEEK
                    </Text>
                    <Text style={[styles.focusValue, { color: colors.onSurface }]}>
                      {formatFocusTime(project.focusMinutes || 0)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.footerLabel, { color: colors.onSurfaceVariant }]}>
                      TASKS
                    </Text>
                    <Text style={[styles.focusValue, { color: colors.onSurface, fontSize: 16 }]}>
                      {project.taskCounts?.done || 0}/{project.taskCounts?.total || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.connectCard,
                { borderColor: colors.outlineVariant, backgroundColor: colors.surface + '30' },
              ]}
              onPress={() => setShowCreate(true)}
            >
              <View style={styles.connectIcon}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.connectText, { color: colors.primary }]}>ADD PROJECT</Text>
            </TouchableOpacity>
          </View>
        )}

        {topProject && totalWeek > 0 && (
          <LinearGradient
            colors={[
              isDark ? 'rgba(45, 106, 94, 0.18)' : '#e0e7ff',
              isDark ? 'rgba(45, 106, 94, 0.08)' : '#f3f4f6',
            ]}
            style={[
              styles.analysisCard,
              { borderColor: isDark ? 'rgba(126, 184, 168, 0.25)' : '#c7d2fe' },
            ]}
          >
            <View style={styles.analysisHeader}>
              <LayoutGrid size={24} color={colors.primary} />
              <Text style={[styles.analysisTitle, { color: colors.onSurface }]}>
                Engineering Analysis
              </Text>
            </View>
            <Text style={[styles.analysisContent, { color: colors.onSurfaceVariant }]}>
              You've spent{' '}
              <Text style={[styles.highlight, { color: colors.primary }]}>{topShare}%</Text> of
              your focus time this week on the{' '}
              <Text style={[styles.underlined, { color: colors.onSurface }]}>
                {topProject.name}
              </Text>{' '}
              project.
            </Text>
          </LinearGradient>
        )}
      </ScrollView>

      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>New Project</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                },
              ]}
              placeholder="Project name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={[
                styles.input,
                styles.inputArea,
                {
                  backgroundColor: colors.background,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.cancelBtn}>
                <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Inter_700Bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating}
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: creating ? 0.6 : 1 }]}
              >
                <Text style={styles.saveBtnText}>{creating ? 'Creating…' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1614' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 16,
  },
  label: { fontSize: 10, fontFamily: 'Inter_800ExtraBold', color: '#7eb8a8', letterSpacing: 2 },
  title: { fontSize: 32, fontFamily: 'Inter_900Black', color: '#eef1f0', marginTop: 4 },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1c2421',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 32,
  },
  empty: {
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  createCta: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  createCtaText: { color: '#fff', fontFamily: 'Inter_800ExtraBold', fontSize: 12, letterSpacing: 1 },
  projectList: { gap: 16 },
  projectCard: {
    backgroundColor: '#1c2421',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 9, fontFamily: 'Inter_800ExtraBold', letterSpacing: 1 },
  cardInfo: { marginBottom: 20 },
  projectName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#eef1f0', marginBottom: 6 },
  repoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.6 },
  repoText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: '#64748b' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 69, 84, 0.1)',
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    color: '#64748b',
    letterSpacing: 1,
  },
  focusValue: { fontSize: 20, fontFamily: 'JetBrainsMono_700Bold', color: '#eef1f0' },
  connectCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(70, 69, 84, 0.2)',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  connectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(126, 184, 168, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectText: {
    fontSize: 11,
    fontFamily: 'Inter_800ExtraBold',
    color: '#7eb8a8',
    letterSpacing: 1.5,
  },
  analysisCard: {
    padding: 24,
    borderRadius: 24,
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(126, 184, 168, 0.25)',
  },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  analysisTitle: { fontSize: 18, fontFamily: 'Inter_900Black', color: '#eef1f0' },
  analysisContent: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748b',
    lineHeight: 22,
  },
  highlight: { color: '#7eb8a8', fontFamily: 'Inter_800ExtraBold' },
  underlined: {
    color: '#eef1f0',
    textDecorationLine: 'underline',
    fontFamily: 'Inter_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_900Black', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  inputArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontFamily: 'Inter_800ExtraBold', fontSize: 13 },
});
