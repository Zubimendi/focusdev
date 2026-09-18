import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import FocusLogo from "../components/FocusLogo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  charcoal: "#1C2421",
  charcoalDeep: "#0F1614",
  stone: "#EEF1F0",
  stoneMuted: "#E2E7E5",
  teal: "#7EB8A8",
  tealDeep: "#2D6A5E",
  mint: "#B8E0D2",
  mintSoft: "#A8D4C6",
  white: "#F7FAF8",
};

export default function WelcomeScreen({ navigation }: any) {
  const rise = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(
      120,
      rise.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.04,
          duration: 2750,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe, rise]);

  const riseStyle = (index: number) => ({
    opacity: rise[index],
    transform: [
      {
        translateY: rise[index].interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Hero */}
        <View style={styles.hero}>
          <ImageBackground
            source={require("../../assets/landing-hero.jpg")}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.heroScrim} />
          <LinearGradient
            colors={[
              "rgba(15,22,20,0.55)",
              "rgba(15,22,20,0.4)",
              COLORS.stone,
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView edges={["top"]} style={styles.heroSafe}>
            <Animated.View style={[styles.nav, riseStyle(0)]}>
              <FocusLogo
                size={32}
                color={COLORS.white}
                coreColor={COLORS.charcoal}
                wordmarkColor={COLORS.white}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                hitSlop={8}
              >
                <Text style={styles.navLogin}>Log in</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.heroCopy}>
              <Animated.Text style={[styles.eyebrow, riseStyle(1)]}>
                For developers who protect their attention
              </Animated.Text>
              <Animated.Text style={[styles.headline, riseStyle(2)]}>
                Deep work,{"\n"}
                <Text style={styles.headlineAccent}>quietly measured.</Text>
              </Animated.Text>
              <Animated.Text style={[styles.subhead, riseStyle(3)]}>
                FocusDev is your personal studio for focus sessions, projects,
                and weekly reviews—built for how you actually ship.
              </Animated.Text>

              <Animated.View style={[styles.ctaRow, riseStyle(3)]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate("Register")}
                  style={styles.ctaPrimary}
                >
                  <Text style={styles.ctaPrimaryText}>Begin your practice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("Login")}
                  style={styles.ctaSecondary}
                >
                  <Text style={styles.ctaSecondaryText}>
                    I already have an account
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Product preview */}
            <Animated.View style={[styles.previewWrap, riseStyle(3)]}>
              <View style={styles.previewCard}>
                <View style={styles.previewChrome}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <Text style={styles.previewChromeLabel}>
                    focusdev — today
                  </Text>
                </View>
                <View style={styles.previewBody}>
                  <Animated.View
                    style={[
                      styles.timerWrap,
                      { transform: [{ scale: breathe }] },
                    ]}
                  >
                    <Svg
                      width={140}
                      height={140}
                      viewBox="0 0 120 120"
                      style={{ transform: [{ rotate: "-90deg" }] }}
                    >
                      <Circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="6"
                      />
                      <Circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={COLORS.teal}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="220"
                        strokeDashoffset="55"
                      />
                    </Svg>
                    <View style={styles.timerCenter}>
                      <Text style={styles.timerDigits}>24:18</Text>
                      <Text style={styles.timerLabel}>deep work</Text>
                    </View>
                  </Animated.View>
                  <Text style={styles.sessionNote}>
                    Session linked to{" "}
                    <Text style={{ color: COLORS.teal }}>FocusDev Monorepo</Text>
                  </Text>

                  <View style={styles.weekBlock}>
                    <Text style={styles.weekLabel}>This week</Text>
                    {[
                      { name: "FocusDev", h: "12h 40m", w: "82%" },
                      { name: "Client API", h: "4h 15m", w: "38%" },
                      { name: "Portfolio", h: "1h 50m", w: "18%" },
                    ].map((row) => (
                      <View key={row.name} style={styles.weekRow}>
                        <View style={styles.weekRowTop}>
                          <Text style={styles.weekName}>{row.name}</Text>
                          <Text style={styles.weekHours}>{row.h}</Text>
                        </View>
                        <View style={styles.weekBarBg}>
                          <View
                            style={[styles.weekBarFill, { width: row.w as any }]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>

        {/* Craft section */}
        <View style={styles.sectionStone}>
          <Text style={styles.sectionDisplay}>
            Treat attention{"\n"}like a craft.
          </Text>
          <Text style={styles.sectionBody}>
            Start a session. Tie it to a project. Close the loop with tasks and
            goals—so progress is something you can feel at the end of the day,
            not guess at.
          </Text>
        </View>

        {/* Weekly close */}
        <View style={styles.sectionMuted}>
          <Text style={styles.sectionEyebrow}>The weekly close</Text>
          <Text style={styles.sectionDisplay}>
            A calm review, not another dashboard to ignore.
          </Text>
          <Text style={[styles.sectionBody, { marginBottom: 28 }]}>
            Numbers for focus hours and finished work. Scores for the goals you
            set. Space to write what worked, what blocked you, and what next
            week should protect.
          </Text>
          <View style={styles.pillars}>
            {[
              {
                title: "Measure",
                body: "Hours, sessions, and tasks—broken down by project.",
              },
              {
                title: "Score",
                body: "Weekly OKRs you can mark met, open, or missed.",
              },
              {
                title: "Reflect",
                body: "Wins, blockers, and intentions—in your own words.",
              },
            ].map((item) => (
              <View key={item.title} style={styles.pillar}>
                <Text style={styles.pillarTitle}>{item.title}</Text>
                <Text style={styles.pillarBody}>{item.body}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Closing CTA */}
        <View style={styles.sectionDark}>
          <FocusLogo
            size={40}
            color={COLORS.teal}
            coreColor={COLORS.charcoal}
            wordmarkColor={COLORS.stone}
          />
          <Text style={styles.closeHeadline}>
            Make room for the work{"\n"}that matters.
          </Text>
          <Text style={styles.closeBody}>
            Free to start. Built for solo developers juggling more than one
            project—and ready when you grow.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Register")}
            style={styles.ctaPrimary}
          >
            <Text style={styles.ctaPrimaryText}>Create your workspace</Text>
          </TouchableOpacity>
          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} FocusDev. Built for deep work.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  hero: {
    minHeight: SCREEN_HEIGHT * 0.92,
    position: "relative",
    overflow: "hidden",
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,22,20,0.72)",
  },
  heroSafe: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.92,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navLogin: {
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  heroCopy: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: COLORS.mintSoft,
    marginBottom: 16,
  },
  headline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: Math.min(44, SCREEN_WIDTH * 0.11),
    lineHeight: Math.min(44, SCREEN_WIDTH * 0.11) * 1.02,
    letterSpacing: -1.2,
    color: COLORS.white,
    marginBottom: 16,
  },
  headlineAccent: {
    color: COLORS.mint,
  },
  subhead: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.8)",
    maxWidth: 360,
    marginBottom: 24,
  },
  ctaRow: {
    gap: 10,
  },
  ctaPrimary: {
    backgroundColor: COLORS.teal,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  ctaPrimaryText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: COLORS.charcoalDeep,
  },
  ctaSecondary: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ctaSecondaryText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 15,
    color: COLORS.white,
  },
  previewWrap: {
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  previewCard: {
    backgroundColor: COLORS.charcoal,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(28,36,33,0.15)",
    overflow: "hidden",
  },
  previewChrome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  previewChromeLabel: {
    marginLeft: 8,
    fontFamily: "Outfit_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  previewBody: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  timerWrap: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timerCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  timerDigits: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    letterSpacing: -0.5,
    color: COLORS.stone,
  },
  timerLabel: {
    fontFamily: "Outfit_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
  },
  sessionNote: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 20,
  },
  weekBlock: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 16,
    gap: 12,
  },
  weekLabel: {
    fontFamily: "Outfit_500Medium",
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
  },
  weekRow: {
    gap: 6,
  },
  weekRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekName: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  weekHours: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  weekBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  weekBarFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "rgba(126,184,168,0.8)",
  },
  sectionStone: {
    backgroundColor: COLORS.stone,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  sectionMuted: {
    backgroundColor: COLORS.stoneMuted,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  sectionEyebrow: {
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLORS.tealDeep,
    marginBottom: 14,
  },
  sectionDisplay: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: COLORS.charcoal,
    marginBottom: 16,
  },
  sectionBody: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(28,36,33,0.65)",
  },
  pillars: {
    borderTopWidth: 1,
    borderTopColor: "rgba(28,36,33,0.1)",
    paddingTop: 24,
    gap: 22,
  },
  pillar: {
    gap: 8,
  },
  pillarTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 20,
    color: COLORS.charcoal,
  },
  pillarBody: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(28,36,33,0.6)",
  },
  sectionDark: {
    backgroundColor: COLORS.charcoal,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    alignItems: "center",
    gap: 20,
  },
  closeHeadline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: COLORS.stone,
    textAlign: "center",
  },
  closeBody: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(238,241,240,0.6)",
    textAlign: "center",
    maxWidth: 320,
  },
  footerCopy: {
    marginTop: 12,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
});
