import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Moon, Sun, Clock, Bell, Shield, Lock, BarChart3, Github } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAppTheme } from '../hooks/useAppTheme';
import { useSettingsStore } from "../store/settings-store";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../services/auth";
import { useAuthStore } from "../store/auth-store";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const {
    theme,
    setTheme,
    timerDuration,
    setTimerDuration,
    notificationSound,
    setNotificationSound,
    showCharts,
    setShowCharts,
  } = useSettingsStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [githubLinked, setGithubLinked] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
        const u = res.user as {
          preferences?: { showCharts?: boolean };
          githubLinked?: boolean;
          githubUsername?: string | null;
        };
        const p = u?.preferences;
        if (typeof p?.showCharts === "boolean") setShowCharts(p.showCharts);
        setGithubLinked(Boolean(u?.githubLinked));
        setGithubUsername(u?.githubUsername || null);
      })
      .catch(() => undefined);
  }, [setShowCharts]);

  const toggleCharts = async (next: boolean) => {
    setShowCharts(next);
    try {
      await authService.updatePreferences({ showCharts: next });
    } catch {
      /* local preference still applies */
    }
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      Toast.show({ type: "success", text1: "Password updated" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Couldn't update password.";
      Toast.show({ type: "error", text1: "Update failed", text2: message });
    } finally {
      setChangingPassword(false);
    }
  };

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

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Security</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={styles.row}>
              <Shield size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.rowText, { color: colors.onSurface, flex: 1 }]}>
                Two-factor authentication
              </Text>
            </View>
            <Text style={[styles.securityNote, { color: colors.onSurfaceVariant }]}>
              {user?.twoFactorEnabled
                ? "2FA is enabled on your account. Manage backup codes and setup in the FocusDev web app."
                : "Enable two-factor authentication in the FocusDev web app under Settings → Security."}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.outlineVariant, marginLeft: 16 }]} />
            <View style={styles.passwordBlock}>
              <View style={styles.row}>
                <Lock size={20} color={colors.onSurfaceVariant} />
                <Text style={[styles.rowText, { color: colors.onSurface }]}>Change password</Text>
              </View>
              <TextInput
                style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.background }]}
                placeholder="Current password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={[styles.input, { color: colors.onSurface, borderColor: colors.outlineVariant, backgroundColor: colors.background }]}
                placeholder="New password (10+ with complexity)"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.onPrimary }]}>Update password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Performance</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => toggleCharts(!showCharts)}
            >
              <BarChart3 size={20} color={showCharts ? colors.primary : colors.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.onSurface }]}>
                  Stats charts {showCharts ? "on" : "off"}
                </Text>
                <Text style={[styles.securityNote, { paddingHorizontal: 0, paddingBottom: 0, paddingTop: 4 }]}>
                  When off, Stats skips heatmap and trend fetches.
                </Text>
              </View>
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
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Integrations</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                const webBase =
                  process.env.EXPO_PUBLIC_WEB_URL ||
                  "https://focusdev-web.vercel.app";
                Linking.openURL(`${webBase}/settings?tab=Integrations`).catch(
                  () =>
                    Toast.show({
                      type: "error",
                      text1: "Couldn’t open Settings in browser",
                    })
                );
              }}
            >
              <Github size={20} color={githubLinked ? colors.primary : colors.onSurfaceVariant} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.onSurface }]}>
                  {githubLinked
                    ? `GitHub connected${githubUsername ? ` (@${githubUsername})` : ""}`
                    : "Connect GitHub"}
                </Text>
                <Text
                  style={[
                    styles.securityNote,
                    { paddingHorizontal: 0, paddingBottom: 0, paddingTop: 4 },
                  ]}
                >
                  Opens the web app to link your account, then you can attach repos to projects.
                </Text>
              </View>
            </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1614" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: { padding: 8, marginLeft: -8 },
  title: { fontSize: 20, fontFamily: "Inter_900Black", color: "#eef1f0" },
  section: { marginTop: 24, paddingHorizontal: 24 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "JetBrainsMono_400Regular",
    color: "#8b8e9f",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  card: { backgroundColor: "#1c2421", borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  rowText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#c7c4d7" },
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
  pillText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#c7c4d7" },
  securityNote: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  passwordBlock: { paddingBottom: 16, gap: 10 },
  input: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { fontFamily: "Inter_800ExtraBold", fontSize: 15 },
});
