import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Terminal, Timer, Target, ChevronRight } from 'lucide-react-native';

import { useAppTheme } from '../hooks/useAppTheme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Background radial-like glow effects */}
      <View style={[styles.glowBottomLeft, { backgroundColor: isDark ? 'rgba(192, 193, 255, 0.1)' : 'rgba(192, 193, 255, 0.15)' }]} />
      <View style={[styles.glowTopRight, { backgroundColor: isDark ? 'rgba(78, 222, 163, 0.1)' : 'rgba(78, 222, 163, 0.12)' }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress indicators at top */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={['#c0c1ff', '#8083ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressBarActive}
          />
          <View style={[styles.progressBarInactive, { backgroundColor: colors.surfaceContainerHigh }]} />
          <View style={[styles.progressBarInactive, { backgroundColor: colors.surfaceContainerHigh }]} />
        </View>

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(192, 193, 255, 0.2)' : 'rgba(73, 75, 214, 0.15)' }]} />
            <View style={[styles.logoContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Terminal color={colors.primary} size={48} strokeWidth={2.5} />
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineSection}>
            <Text style={[styles.title, { color: colors.onSurface }]}>MONOLITH</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Your dev focus, tracked.</Text>
          </View>

          {/* Action Area */}
          <View style={styles.actionArea}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate('Register')}
            >
              <LinearGradient
                colors={isDark ? ['#c0c1ff', '#8083ff'] : ['#494bd6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={[styles.primaryButtonText, { color: isDark ? '#1000a9' : '#ffffff' }]}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={[styles.loginLinkText, { color: colors.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Preview Cards */}
          <View style={styles.statsGrid}>
            {/* Focus Depth Card */}
            <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.cardHeader}>
                <Timer size={14} color="#4edea3" />
                <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>FOCUS DEPTH</Text>
              </View>
              <Text style={[styles.cardValueMono, { color: colors.primary }]}>02:00:00</Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                <LinearGradient
                  colors={['#c0c1ff', '#8083ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: '66%' }]}
                />
              </View>
            </View>

            {/* Daily Goal Card */}
            <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.cardHeader}>
                <Target size={14} color="#ffb95f" />
                <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>DAILY GOAL</Text>
              </View>
              <View style={styles.blocksContainer}>
                <View style={[styles.block, { backgroundColor: '#4edea3' }]} />
                <View style={[styles.block, { backgroundColor: '#4edea3', opacity: 0.4 }]} />
                <View style={[styles.block, { backgroundColor: colors.background }]} />
              </View>
              <Text style={[styles.intensityLabel, { color: colors.onSurface }]}>HIGH INTENSITY</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  progressContainer: {
    paddingTop: 40,
    flexDirection: 'row',
    gap: 12,
    width: 200,
    alignSelf: 'center',
  },
  progressBarActive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarInactive: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter_900Black',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    fontWeight: '500',
    marginTop: 8,
  },
  actionArea: {
    width: '100%',
    gap: 24,
    marginBottom: 40,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8083ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_800ExtraBold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  glassCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1.5,
  },
  cardValueMono: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'JetBrainsMono_700Bold',
  },
  progressBarBg: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  blocksContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  block: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  intensityLabel: {
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1,
  },
});
