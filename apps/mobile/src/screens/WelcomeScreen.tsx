import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Terminal, Timer, Target, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background radial-like glow effects */}
      <View style={styles.glowBottomLeft} />
      <View style={styles.glowTopRight} />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress indicators at top */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={['#c0c1ff', '#8083ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressBarActive}
          />
          <View style={styles.progressBarInactive} />
          <View style={styles.progressBarInactive} />
        </View>

        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoContainer}>
              <Terminal color="#c0c1ff" size={48} strokeWidth={2.5} />
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineSection}>
            <Text style={styles.title}>MONOLITH</Text>
            <Text style={styles.subtitle}>Your dev focus, tracked.</Text>
          </View>

          {/* Action Area */}
          <View style={styles.actionArea}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate('Register')}
            >
              <LinearGradient
                colors={['#c0c1ff', '#8083ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Preview Cards */}
          <View style={styles.statsGrid}>
            {/* Focus Depth Card */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Timer size={14} color="#4edea3" />
                <Text style={styles.cardLabel}>FOCUS DEPTH</Text>
              </View>
              <Text style={styles.cardValueMono}>02:00:00</Text>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={['#c0c1ff', '#8083ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: '66%' }]}
                />
              </View>
            </View>

            {/* Daily Goal Card */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Target size={14} color="#ffb95f" />
                <Text style={styles.cardLabel}>DAILY GOAL</Text>
              </View>
              <View style={styles.blocksContainer}>
                <View style={[styles.block, { backgroundColor: '#4edea3' }]} />
                <View style={[styles.block, { backgroundColor: '#4edea3', opacity: 0.4 }]} />
                <View style={[styles.block, { backgroundColor: '#161b2b' }]} />
              </View>
              <Text style={styles.intensityLabel}>HIGH INTENSITY</Text>
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
    backgroundColor: '#0e1322',
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
    backgroundColor: 'rgba(192, 193, 255, 0.1)',
  },
  glowTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
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
    backgroundColor: '#2f3445',
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
    backgroundColor: 'rgba(192, 193, 255, 0.2)',
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#2f3445',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.3)',
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
    color: '#dee1f7',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#c7c4d7',
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
    color: '#1000a9',
    fontSize: 18,
    fontFamily: 'Inter_800ExtraBold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#c0c1ff',
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
    backgroundColor: 'rgba(47, 52, 69, 0.5)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.1)',
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
    color: '#c7c4d7',
    letterSpacing: 1.5,
  },
  cardValueMono: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c0c1ff',
    fontFamily: 'JetBrainsMono_700Bold', // Will need font loading
  },
  progressBarBg: {
    height: 4,
    width: '100%',
    backgroundColor: '#161b2b',
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
    color: '#dee1f7',
    letterSpacing: 1,
  },
});
