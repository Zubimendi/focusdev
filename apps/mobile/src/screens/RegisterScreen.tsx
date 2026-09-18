import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Mail,
  Lock,
  Terminal,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/auth-store";
import { useAppTheme } from "../hooks/useAppTheme";

type Status =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function RegisterScreen({ navigation }: any) {
  const { colors, isDark } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const register = useAuthStore((state) => state.register);
  const storeLoading = useAuthStore((state) => state.isLoading);
  const isLoading = storeLoading || status.kind === "loading";

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!name.trim() || !email.trim() || !password) {
      const message = "Fill in your name, email, and password.";
      setStatus({ kind: "error", message });
      Toast.show({ type: "error", text1: "Missing details", text2: message });
      return;
    }

    if (password.length < 8) {
      const message = "Use at least 8 characters for your password.";
      setStatus({ kind: "error", message });
      Toast.show({ type: "error", text1: "Password too short", text2: message });
      return;
    }

    setStatus({ kind: "loading", message: "Creating your account…" });

    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });

      const message = "You’re all set — continue to sign in.";
      setStatus({ kind: "success", message });
      Toast.show({
        type: "success",
        text1: "Account created",
        text2: message,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't create your account. Try again.";
      setStatus({ kind: "error", message });
      Toast.show({
        type: "error",
        text1: "Couldn't sign up",
        text2: message,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                  },
                ]}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft color={colors.onSurface} size={24} />
              </TouchableOpacity>

              <View style={styles.header}>
                <View
                  style={[
                    styles.logoContainer,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Terminal color={colors.primary} size={32} strokeWidth={2.5} />
                </View>
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  Create account
                </Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  Start tracking focus across your projects.
                </Text>
              </View>

              {status.kind !== "idle" && (
                <View
                  style={[
                    styles.banner,
                    status.kind === "loading" && {
                      backgroundColor: colors.primary + "18",
                      borderColor: colors.primary + "40",
                    },
                    status.kind === "success" && {
                      backgroundColor: "rgba(126, 184, 168, 0.18)",
                      borderColor: colors.primary,
                    },
                    status.kind === "error" && {
                      backgroundColor: "rgba(180, 35, 24, 0.12)",
                      borderColor: colors.error,
                    },
                  ]}
                >
                  <View style={styles.bannerRow}>
                    {status.kind === "loading" && (
                      <ActivityIndicator color={colors.primary} />
                    )}
                    {status.kind === "success" && (
                      <CheckCircle2 color={colors.primary} size={20} />
                    )}
                    {status.kind === "error" && (
                      <AlertCircle color={colors.error} size={20} />
                    )}
                    <Text
                      style={[
                        styles.bannerText,
                        {
                          color:
                            status.kind === "error"
                              ? colors.error
                              : colors.onSurface,
                        },
                      ]}
                    >
                      {status.message}
                    </Text>
                  </View>
                  {status.kind === "success" && (
                    <TouchableOpacity
                      style={[styles.bannerCta, { backgroundColor: colors.primary }]}
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text style={[styles.bannerCtaText, { color: colors.onPrimary }]}>
                        Continue to login
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>
                    FULL NAME
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <User color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="Your name"
                      placeholderTextColor={
                        isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                      }
                      value={name}
                      onChangeText={setName}
                      editable={!isLoading}
                      autoComplete="name"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>
                    EMAIL ADDRESS
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <Mail color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="you@example.com"
                      placeholderTextColor={
                        isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                      }
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                      autoComplete="email"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>
                    PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <Lock color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="At least 8 characters"
                      placeholderTextColor={
                        isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                      }
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff color={colors.onSurfaceVariant} size={20} />
                      ) : (
                        <Eye color={colors.onSurfaceVariant} size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleRegister}
                  disabled={isLoading || status.kind === "success"}
                  style={[
                    styles.buttonWrapper,
                    (isLoading || status.kind === "success") && { opacity: 0.6 },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isDark
                        ? ["#7eb8a8", "#2d6a5e"]
                        : [colors.primary, "#24584e"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <View style={styles.buttonInner}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.buttonText}>Creating account…</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>
                        {status.kind === "success"
                          ? "Account created"
                          : "Create account"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text
                    style={[styles.footerText, { color: colors.onSurfaceVariant }]}
                  >
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>
                      Log in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 32,
  },
  header: { marginBottom: 28 },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_900Black",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    opacity: 0.85,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    gap: 12,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  bannerCta: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bannerCtaText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  form: { gap: 22 },
  inputWrapper: { gap: 10 },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  eyeIcon: { padding: 8, marginRight: -4 },
  buttonWrapper: {
    marginTop: 8,
    shadowColor: "#2d6a5e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 0.5,
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textDecorationLine: "underline",
  },
});
