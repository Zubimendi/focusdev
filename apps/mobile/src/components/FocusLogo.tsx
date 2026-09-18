import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type FocusLogoProps = {
  size?: number;
  color?: string;
  coreColor?: string;
  wordmark?: boolean;
  wordmarkColor?: string;
};

/** FocusDev mark: concentric focus rings + aperture core */
export default function FocusLogo({
  size = 36,
  color = "#F4F7F5",
  coreColor = "#EEF1F0",
  wordmark = true,
  wordmarkColor,
}: FocusLogoProps) {
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Circle
          cx="24"
          cy="24"
          r="21"
          stroke={color}
          strokeWidth="1.5"
          opacity={0.35}
        />
        <Circle
          cx="24"
          cy="24"
          r="14.5"
          stroke={color}
          strokeWidth="1.75"
          opacity={0.65}
        />
        <Path
          d="M24 5.5V10.5M24 37.5V42.5M5.5 24H10.5M37.5 24H42.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Circle cx="24" cy="24" r="6.5" fill={color} />
        <Circle cx="24" cy="24" r="2.5" fill={coreColor} />
      </Svg>
      {wordmark && (
        <Text
          style={[
            styles.wordmark,
            {
              color: wordmarkColor || color,
              fontSize: size * 0.48,
            },
          ]}
        >
          FocusDev
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordmark: {
    fontFamily: "Fraunces_500Medium",
    letterSpacing: -0.6,
    includeFontPadding: false,
  },
});
