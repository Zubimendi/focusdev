import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Timer,
  Folder,
  BarChart3,
  Settings,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "../hooks/useAppTheme";

const SUPPORT_EMAIL = "support@focusdev.app";

const FAQ = [
  {
    id: "focus",
    q: "How do I start a focus session?",
    a: "From Home or Timer, name what you’re working on and start. When you stop, minutes count toward Stats and reviews.",
  },
  {
    id: "github",
    q: "How do GitHub commits count toward goals?",
    a: "Connect GitHub on web Settings, link a repo to a project, set a goal commit tag, then push with [fd:tag] in the commit subject and sync.",
  },
  {
    id: "reviews",
    q: "What are weekly and monthly reviews?",
    a: "They snapshot focus, sessions, tasks, and goals for the period so you can score goals and reflect — like a personal PMS.",
  },
  {
    id: "charts",
    q: "Can I turn off Stats charts?",
    a: "Yes. In Settings, toggle Stats charts off. Stats then loads summary numbers only and skips trend fetches.",
  },
  {
    id: "2fa",
    q: "Is 2FA required?",
    a: "No. Two-factor authentication is optional and can be set up in the web app under Settings → Security.",
  },
  {
    id: "export",
    q: "How do I export or delete my data?",
    a: "On the web app, Settings → Data lets you download a JSON export or delete your account.",
  },
];

const TOPICS = [
  { icon: Timer, title: "Focus & timer", route: "Timer" as const },
  { icon: Folder, title: "Projects", route: "Projects" as const },
  { icon: BarChart3, title: "Stats", route: "Stats" as const },
  { icon: Settings, title: "Settings", route: "Settings" as const },
];

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("focus");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [query]);

  const composeEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: "error",
        text1: "Add a subject and message",
      });
      return;
    }
    const body = `${message.trim()}\n\n— Sent from FocusDev mobile`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject.trim()
    )}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
      setSubject("");
      setMessage("");
    } catch {
      Toast.show({ type: "error", text1: "Could not open email", text2: SUPPORT_EMAIL });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]}>Support</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Real answers for FocusDev — no fake tickets.
        </Text>

        <View
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          ]}
        >
          <Search size={18} color={colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Search help…"
            placeholderTextColor={colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.topicGrid}>
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.title}
                style={[
                  styles.topicCard,
                  { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                ]}
                onPress={() => {
                  if (t.route === "Settings") navigation.navigate("Settings");
                  else navigation.navigate("Main", { screen: t.route });
                }}
              >
                <Icon size={18} color={colors.primary} />
                <Text style={[styles.topicText, { color: colors.onSurface }]}>
                  {t.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          FAQ
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
          ]}
        >
          {filtered.length === 0 ? (
            <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>
              No matches. Try another search or email us below.
            </Text>
          ) : (
            filtered.map((item, idx) => {
              const open = openId === item.id;
              return (
                <View key={item.id}>
                  {idx > 0 && (
                    <View
                      style={[styles.divider, { backgroundColor: colors.outlineVariant }]}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.faqRow}
                    onPress={() => setOpenId(open ? null : item.id)}
                  >
                    <Text style={[styles.faqQ, { color: colors.onSurface, flex: 1 }]}>
                      {item.q}
                    </Text>
                    {open ? (
                      <ChevronUp size={18} color={colors.onSurfaceVariant} />
                    ) : (
                      <ChevronDown size={18} color={colors.onSurfaceVariant} />
                    )}
                  </TouchableOpacity>
                  {open && (
                    <Text style={[styles.faqA, { color: colors.onSurfaceVariant }]}>
                      {item.a}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
          Contact
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.outlineVariant, padding: 16, gap: 12 },
          ]}
        >
          <Text style={[styles.contactHint, { color: colors.onSurfaceVariant }]}>
            Opens your email app to {SUPPORT_EMAIL}.
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.onSurface,
                borderColor: colors.outlineVariant,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Subject"
            placeholderTextColor={colors.onSurfaceVariant}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              {
                color: colors.onSurface,
                borderColor: colors.outlineVariant,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="What happened?"
            placeholderTextColor={colors.onSurfaceVariant}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={composeEmail}
          >
            <Mail size={18} color={colors.onPrimary} />
            <Text style={[styles.sendText, { color: colors.onPrimary }]}>
              Compose email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  back: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_900Black" },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    lineHeight: 20,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  topicCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  topicText: { fontSize: 13, fontFamily: "Inter_700Bold", flex: 1 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: "hidden" },
  empty: { padding: 20, textAlign: "center", fontFamily: "Inter_500Medium" },
  divider: { height: 1, marginLeft: 16 },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqQ: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  faqA: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  contactHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  textarea: { minHeight: 110 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendText: { fontFamily: "Inter_800ExtraBold", fontSize: 15 },
});
