import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, type ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export function Skeleton({
  height = 16,
  width = '100%' as number | `${number}%`,
  style,
  radius = 8,
}: {
  height?: number;
  width?: number | `${number}%`;
  style?: ViewStyle;
  radius?: number;
}) {
  const { colors, isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius: radius,
          opacity,
          backgroundColor: isDark ? colors.surfaceContainerHigh : '#e8ecf0',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.outlineVariant,
        },
        style,
      ]}
    />
  );
}

export function PageSkeleton() {
  return (
    <View style={styles.page}>
      <Skeleton height={28} width="40%" />
      <Skeleton height={14} width="70%" style={{ marginTop: 8 }} />
      <View style={styles.row}>
        <Skeleton height={88} style={{ flex: 1 }} />
        <Skeleton height={88} style={{ flex: 1 }} />
      </View>
      <Skeleton height={180} style={{ marginTop: 4 }} />
      <Skeleton height={64} />
      <Skeleton height={64} />
    </View>
  );
}

export function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
