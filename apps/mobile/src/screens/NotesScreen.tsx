import React, { useCallback, useEffect, useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '../hooks/useAppTheme';
import { notesService, type Note } from '../services/notes';
import { FadeIn, Skeleton } from '../components/ui/Skeleton';

export default function NotesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { notes: list } = await notesService.list();
      setNotes(list);
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t load notes' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setTitle(note.title);
    setBody(note.body || '');
    setModalOpen(true);
  };

  const save = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Title required' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await notesService.update(editing.id, { title: title.trim(), body });
      } else {
        await notesService.create({ title: title.trim(), body });
      }
      setModalOpen(false);
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Save failed';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setSaving(false);
    }
  };

  const remove = (note: Note) => {
    Alert.alert('Delete note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.remove(note.id);
            await load();
          } catch {
            Toast.show({ type: 'error', text1: 'Couldn’t delete note' });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Notes</Text>
        <TouchableOpacity onPress={openCreate}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 24 }}>
          <Skeleton height={72} style={{ marginBottom: 12 }} />
          <Skeleton height={72} style={{ marginBottom: 12 }} />
          <Skeleton height={72} />
        </View>
      ) : (
        <FadeIn>
        <ScrollView contentContainerStyle={styles.list}>
          {notes.length === 0 ? (
            <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>No notes yet. Tap + to add one.</Text>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{note.title}</Text>
                  {!!note.body && (
                    <Text numberOfLines={2} style={[styles.cardBody, { color: colors.onSurfaceVariant }]}>
                      {note.body}
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(note)}>
                    <Pencil size={18} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(note)}>
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        </FadeIn>
      )}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{editing ? 'Edit note' : 'New note'}</Text>
            <TextInput
              style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
              placeholder="Title"
              placeholderTextColor={colors.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.bodyInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
              placeholder="Body (optional)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={body}
              onChangeText={setBody}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={{ color: colors.onSurfaceVariant, fontFamily: 'Inter_600SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.primary, fontFamily: 'Inter_800ExtraBold' }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: { fontSize: 20, fontFamily: 'Inter_900Black' },
  list: { padding: 24, gap: 12, paddingBottom: 40 },
  empty: { textAlign: 'center', fontFamily: 'Inter_500Medium', marginTop: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  cardBody: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 16, paddingTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_800ExtraBold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
  },
  bodyInput: { minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
