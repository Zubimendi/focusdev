import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Terminal, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/auth-store';

import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { colors, isDark } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state: any) => state.login);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Please enter your credentials to proceed.'
      });
      return;
    }

    try {
      await login({ email, password });
      Toast.show({
        type: 'success',
        text1: 'Welcome Home',
        text2: 'Session authenticated successfully.'
      });
    } catch (error: any) {
      let message = 'Verification failed. Please check your credentials.';
      if (error.message.includes('401')) message = 'Invalid email or password.';
      if (error.message.includes('network')) message = 'Network anomaly detected. Check your connection.';
      
      Toast.show({
        type: 'error',
        text1: 'Auth Core Failure',
        text2: message
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Replicate Landing Screen Glows */}
      <View style={[styles.glowTopRight, { backgroundColor: isDark ? 'rgba(192, 193, 255, 0.08)' : 'rgba(79, 70, 229, 0.08)' }]} />
      <View style={[styles.glowBottomLeft, { backgroundColor: isDark ? 'rgba(78, 222, 163, 0.05)' : 'rgba(14, 165, 233, 0.05)' }]} />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: colors.background }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft color={colors.onSurface} size={24} />
              </TouchableOpacity>

              <View style={styles.header}>
                <View style={[styles.logoContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.primary + '33' : colors.outlineVariant }]}>
                  <Terminal color={colors.primary} size={32} strokeWidth={2.5} />
                </View>
                <Text style={[styles.title, { color: colors.onSurface }]}>Welcome back</Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Resume your deep work sessions.</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>EMAIL ADDRESS</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Mail color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="architect@focus.dev"
                      placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.primary }]}>PASSWORD</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Lock color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="••••••••"
                      placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
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
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  activeOpacity={0.85} 
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={isDark ? ['#c0c1ff', '#8083ff'] : [colors.primary, '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                      {isLoading ? 'Verifying...' : 'Authenticate'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>New to the monolith? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>Register now</Text>
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
  container: {
    flex: 1,
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  safeArea: {
    flex: 1,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 40,
  },
  header: {
    marginBottom: 48,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_900Black',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
    opacity: 0.8,
  },
  form: {
    gap: 28,
  },
  inputWrapper: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  eyeIcon: {
    padding: 8,
    marginRight: -4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonWrapper: {
    marginTop: 12,
    shadowColor: '#8083ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    opacity: 0.7,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
});
