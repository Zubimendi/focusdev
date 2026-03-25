import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Moon, Sun, Clock, Bell } from "lucide-react-native";
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettingsStore } from "../store/settings-store";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const {
    theme,
    setTheme,
    timerDuration,
    setTimerDuration,
    notificationSound,
    setNotificationSound,
  } = useSettingsStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={[styles.row, theme === "dark" && { backgroundColor: isDark ? "#1c2235" : "#e2e8f0" }]}
            onPress={() => setTheme("dark")}
          >
            <Moon size={20} color={theme === "dark" ? colors.primary : colors.onSurfaceVariant} />
            <Text
              style={[styles.rowText, { color: colors.onSurfaceVariant }, theme === "dark" && { color: colors.primary }]}
            >
              Dark Theme
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
          <TouchableOpacity
            style={[styles.row, theme === "light" && { backgroundColor: isDark ? "#1c2235" : "#e2e8f0" }]}
            onPress={() => setTheme("light")}
          >
            <Sun size={20} color={theme === "light" ? colors.primary : colors.onSurfaceVariant} />
            <Text
              style={[styles.rowText, { color: colors.onSurfaceVariant }, theme === "light" && { color: colors.primary }]}
            >
              Light Theme
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Pomodoro Config</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <View style={styles.row}>
            <Clock size={20} color={colors.onSurfaceVariant} />
            <Text style={[styles.rowText, { color: colors.onSurface }]}>Duration: {timerDuration}m</Text>
          </View>
          <View style={styles.durationButtons}>
            {[15, 25, 45, 60].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.pill,
                  { backgroundColor: colors.background },
                  timerDuration === dur && { backgroundColor: colors.primary },
                ]}
                onPress={() => setTimerDuration(dur)}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: colors.onSurfaceVariant },
                    timerDuration === dur && { color: colors.onPrimary },
                  ]}
                >
                  {dur}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              setNotificationSound(
                notificationSound === "Zen Chime"
                  ? "Digital Beep"
                  : "Zen Chime",
              )
            }
          >
            <Bell size={20} color={colors.onSurfaceVariant} />
            <Text style={[styles.rowText, { color: colors.onSurface }]}>Sound: {notificationSound}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e1322" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, fontFamily: "Inter_900Black", color: "#dee1f7" },
  section: { marginTop: 32, paddingHorizontal: 24 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "JetBrainsMono_400Regular",
    color: "#8b8e9f",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  card: { backgroundColor: "#161b2b", borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  activeRow: { backgroundColor: "#1c2235" },
  rowText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#c7c4d7" },
  activeText: { color: "#c0c1ff" },
  divider: { height: 1, backgroundColor: "#1f2438", marginLeft: 48 },
  durationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 0,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#1f2438",
  },
  activePill: { backgroundColor: "#c0c1ff" },
  pillText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#c7c4d7" },
  activePillText: { color: "#0e1322" },
});
