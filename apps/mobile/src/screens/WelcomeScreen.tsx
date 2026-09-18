import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import FocusLogo from "../components/FocusLogo";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  charcoal: "#1C2421",
  charcoalDeep: "#0F1614",
  stone: "#EEF1F0",
  teal: "#7EB8A8",
  mint: "#B8E0D2",
  mintSoft: "#A8D4C6",
  white: "#F7FAF8",
};

export default function WelcomeScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.05,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breathe, fade, slide]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/landing-hero.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.scrim} />
      <LinearGradient
        colors={[
          "rgba(15,22,20,0.35)",
          "rgba(15,22,20,0.55)",
          "rgba(15,22,20,0.92)",
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Animated.View
          style={[
            styles.topBar,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <FocusLogo
            size={30}
            color={COLORS.white}
            coreColor={COLORS.charcoal}
            wordmarkColor={COLORS.white}
          />
        </Animated.View>

        <View style={styles.middle}>
          <Animated.View
            style={[
              styles.timerOrb,
              {
                opacity: fade,
                transform: [{ scale: breathe }],
              },
            ]}
          >
            <Svg width={112} height={112} viewBox="0 0 120 120">
              <Circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="5"
              />
              <Circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={COLORS.teal}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset="70"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.timerCenter}>
              <Text style={styles.timerDigits}>24:18</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.bottom,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Text style={styles.headline}>
            Deep work,{"\n"}
            <Text style={styles.headlineAccent}>quietly measured.</Text>
          </Text>
          <Text style={styles.subhead}>
            Sessions, projects, and weekly reviews—built for how you ship.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Register")}
            style={styles.ctaPrimary}
          >
            <Text style={styles.ctaPrimaryText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Login")}
            style={styles.ctaSecondary}
          >
            <Text style={styles.ctaSecondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.charcoalDeep,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,22,20,0.45)",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  middle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: SCREEN_HEIGHT * 0.22,
  },
  timerOrb: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  timerCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  timerDigits: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 26,
    letterSpacing: -0.5,
    color: COLORS.stone,
  },
  bottom: {
    paddingBottom: 12,
    gap: 12,
  },
  headline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
    color: COLORS.white,
    marginBottom: 4,
  },
  headlineAccent: {
    color: COLORS.mint,
  },
  subhead: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    lineHeight: 23,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 16,
  },
  ctaPrimary: {
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaPrimaryText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    color: COLORS.charcoalDeep,
  },
  ctaSecondary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  ctaSecondaryText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 15,
    color: COLORS.white,
  },
});
