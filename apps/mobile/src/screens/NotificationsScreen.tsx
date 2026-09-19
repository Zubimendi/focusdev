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
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import { notificationsService, type AppNotification } from '../services/notifications';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { notifications } = await notificationsService.list();
      setItems(notifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (n: AppNotification) => {
    if (n.readAt) return;
    try {
      await notificationsService.markRead(n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      );
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    try {
      await notificationsService.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, readAt: x.readAt || new Date().toISOString() })));
    } catch {
      /* ignore */
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Notifications</Text>
        <TouchableOpacity onPress={markAll}>
          <Text style={[styles.markAll, { color: colors.primary }]}>Read all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
          }
        >
          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Bell size={32} color={colors.onSurfaceVariant} />
              <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>You’re all caught up.</Text>
            </View>
          ) : (
            items.map((n) => (
              <TouchableOpacity
                key={n.id}
                onPress={() => markRead(n)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                    opacity: n.readAt ? 0.75 : 1,
                  },
                ]}
              >
                {!n.readAt && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{n.title}</Text>
                  {!!n.body && (
                    <Text style={[styles.cardBody, { color: colors.onSurfaceVariant }]}>{n.body}</Text>
                  )}
                  <Text style={[styles.time, { color: colors.onSurfaceVariant }]}>
                    {new Date(n.createdAt).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
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
  title: { fontSize: 20, fontFamily: 'Inter_900Black' },
  markAll: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  list: { padding: 24, gap: 12, paddingBottom: 40 },
  emptyWrap: { alignItems: 'center', marginTop: 48, gap: 12 },
  empty: { fontFamily: 'Inter_500Medium' },
  card: { flexDirection: 'row', padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  cardBody: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  time: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', marginTop: 8 },
});
