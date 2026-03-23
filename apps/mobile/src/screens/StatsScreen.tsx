import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Terminal, Download, Share2, Timer, Code, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [showSessions, setShowSessions] = React.useState(true);
  const [showCode, setShowCode] = React.useState(true);
  const [showTime, setShowTime] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Terminal color="#818cf8" size={24} />
          <Text style={styles.logoText}>MONOLITH</Text>
        </View>
        <View style={styles.avatarPlaceholder} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Share Your Streak 🔥</Text>
          <Text style={styles.subtitle}>Customize and share your progress with the community.</Text>
        </View>

        {/* Share Card Preview */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#1e1b4b', '#2f3445', '#0e1322']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareCard}
          >
            {/* Background Glows */}
            <View style={styles.cardGlowTop} />
            <View style={styles.cardGlowBottom} />

            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardInfoLabel}>ACTIVITY REPORT</Text>
                <Text style={styles.cardMainTitle}>Day 12 <Text style={{color: '#ffb95f'}}>🔥</Text></Text>
              </View>
              <View style={styles.cardIcon}>
                <Terminal color="white" size={20} fill="white" />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>SESSIONS</Text>
                <Text style={styles.statBoxValue}>42</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>FOCUS TIME</Text>
                <Text style={styles.statBoxValue}>18h</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>LEETCODE</Text>
                <Text style={[styles.statBoxValue, { color: '#4edea3' }]}>156</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>GOALS</Text>
                <Text style={[styles.statBoxValue, { color: '#ffb95f' }]}>100%</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatarContainer}>
                  <View style={styles.userAvatar} />
                </View>
                <View>
                  <Text style={styles.userName}>@tobe_dev</Text>
                  <Text style={styles.userRole}>FocusDev Community</Text>
                </View>
              </View>
              <Text style={styles.footerBrand}>MONOLITH</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Customization Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionLabel}>COLOR THEME</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity style={[styles.themeCircle, { backgroundColor: '#c0c1ff', borderWidth: 2, borderColor: '#fff' }]} />
            <TouchableOpacity style={[styles.themeCircle, { backgroundColor: '#4edea3', opacity: 0.6 }]} />
            <TouchableOpacity style={[styles.themeCircle, { backgroundColor: '#ffb4ab', opacity: 0.6 }]} />
            <TouchableOpacity style={[styles.themeCircle, { backgroundColor: '#ffb95f', opacity: 0.6 }]} />
            <TouchableOpacity style={[styles.themeCircle, { backgroundColor: '#64748b', opacity: 0.6 }]} />
          </View>

          <View style={styles.togglesContainer}>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Timer size={18} color="#c7c4d7" />
                <Text style={styles.toggleText}>Show Sessions</Text>
              </View>
              <Switch 
                value={showSessions} 
                onValueChange={setShowSessions}
                trackColor={{ false: '#2f3445', true: '#8083ff' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Code size={18} color="#c7c4d7" />
                <Text style={styles.toggleText}>Show LeetCode</Text>
              </View>
              <Switch 
                value={showCode} 
                onValueChange={setShowCode}
                trackColor={{ false: '#2f3445', true: '#8083ff' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.toggleItem}>
              <View style={styles.toggleLeft}>
                <Calendar size={18} color="rgba(199, 196, 215, 0.4)" />
                <Text style={[styles.toggleText, { opacity: 0.6 }]}>Show Focus Time</Text>
              </View>
              <Switch 
                value={showTime} 
                onValueChange={setShowTime}
                trackColor={{ false: '#2f3445', true: '#8083ff' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity>
              <LinearGradient
                colors={['#c0c1ff', '#8083ff']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.primaryAction}
              >
                <Download size={20} color="#1000a9" />
                <Text style={styles.primaryActionText}>Save to Photos</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction}>
              <Share2 size={20} color="#dee1f7" />
              <Text style={styles.secondaryActionText}>Share to Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0e1322',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Inter_900Black',
    color: '#818cf8',
    letterSpacing: -1,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f3445',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.2)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_800ExtraBold',
    color: '#dee1f7',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#c7c4d7',
    marginTop: 8,
  },
  cardContainer: {
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  shareCard: {
    aspectRatio: 0.8,
    padding: 32,
    justifyContent: 'space-between',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.4)',
  },
  cardGlowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(192, 193, 255, 0.15)',
  },
  cardGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(78, 222, 163, 0.08)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfoLabel: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#c0c1ff',
    letterSpacing: 2.5,
  },
  cardMainTitle: {
    fontSize: 48,
    fontFamily: 'Inter_900Black',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -1,
  },
  cardIcon: {
    padding: 12,
    backgroundColor: 'rgba(47, 52, 69, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  statBox: {
    width: (width - 48 - 64 - 12) / 2, // Accounting for padding and gap
    padding: 20,
    backgroundColor: 'rgba(47, 52, 69, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
  },
  statBoxLabel: {
    fontSize: 9,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#c7c4d7',
    letterSpacing: 0,
  },
  statBoxValue: {
    fontSize: 22,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#fff',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 1,
    backgroundColor: '#c0c1ff',
  },
  userAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#2f3445',
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c7c4d7',
    opacity: 0.7,
  },
  footerBrand: {
    fontSize: 12,
    fontFamily: 'Inter_900Black',
    color: '#fff',
    opacity: 0.4,
    letterSpacing: -0.5,
  },
  controlsSection: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_700Bold',
    color: '#c7c4d7',
    letterSpacing: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  togglesContainer: {
    backgroundColor: '#161b2b',
    borderRadius: 20,
    padding: 4,
    gap: 0,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#dee1f7',
  },
  actionsContainer: {
    marginTop: 32,
    gap: 16,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1000a9',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.5)',
  },
  secondaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#dee1f7',
  },
});
