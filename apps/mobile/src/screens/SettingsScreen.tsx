import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Moon, Sun, Clock, Bell } from "lucide-react-native";
import { useSettingsStore } from "../store/settings-store";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    theme,
    setTheme,
    timerDuration,
    setTimerDuration,
    notificationSound,
    setNotificationSound,
  } = useSettingsStore();
  const isDark = theme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0e1322" : "#ffffff" }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDark ? "#dee1f7" : "#0e1322"} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? "#dee1f7" : "#0e1322" }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#8b8e9f" : "#64748b" }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: isDark ? "#161b2b" : "#f1f5f9" }]}>
          <TouchableOpacity
            style={[styles.row, theme === "dark" && styles.activeRow]}
            onPress={() => setTheme("dark")}
          >
            <Moon size={20} color={theme === "dark" ? "#c0c1ff" : "#64748b"} />
            <Text
              style={[styles.rowText, { color: isDark ? "#c7c4d7" : "#0e1322" }, theme === "dark" && styles.activeText]}
            >
              Dark Theme
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? "#1f2438" : "#e2e8f0" }]} />
          <TouchableOpacity
            style={[styles.row, theme === "light" && styles.activeRow]}
            onPress={() => setTheme("light")}
          >
            <Sun size={20} color={theme === "light" ? "#c0c1ff" : "#64748b"} />
            <Text
              style={[styles.rowText, { color: isDark ? "#c7c4d7" : "#0e1322" }, theme === "light" && styles.activeText]}
            >
              Light Theme
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#8b8e9f" : "#64748b" }]}>Pomodoro Config</Text>
        <View style={[styles.card, { backgroundColor: isDark ? "#161b2b" : "#f1f5f9" }]}>
          <View style={styles.row}>
            <Clock size={20} color={isDark ? "#c7c4d7" : "#64748b"} />
            <Text style={[styles.rowText, { color: isDark ? "#c7c4d7" : "#0e1322" }]}>Duration: {timerDuration}m</Text>
          </View>
          <View style={styles.durationButtons}>
            {[15, 25, 45, 60].map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[
                  styles.pill,
                  { backgroundColor: isDark ? "#1f2438" : "#e2e8f0" },
                  timerDuration === dur && styles.activePill,
                ]}
                onPress={() => setTimerDuration(dur)}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isDark ? "#c7c4d7" : "#64748b" },
                    timerDuration === dur && styles.activePillText,
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
        <Text style={[styles.sectionTitle, { color: isDark ? "#8b8e9f" : "#64748b" }]}>Notifications</Text>
        <View style={[styles.card, { backgroundColor: isDark ? "#161b2b" : "#f1f5f9" }]}>
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
            <Bell size={20} color={isDark ? "#c7c4d7" : "#64748b"} />
            <Text style={[styles.rowText, { color: isDark ? "#c7c4d7" : "#0e1322" }]}>Sound: {notificationSound}</Text>
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
