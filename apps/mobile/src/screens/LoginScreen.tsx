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
  const verify2FA = useAuthStore((state: any) => state.verify2FA);
  const isLoading = useAuthStore((state: any) => state.isLoading);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing details',
        text2: 'Enter your email and password.',
      });
      return;
    }

    if (needs2FA) {
      if (totpCode.length !== 6 || !pendingToken) {
        Toast.show({
          type: 'error',
          text1: 'Verification code',
          text2: 'Enter the 6-digit code from your authenticator app.',
        });
        return;
      }
      try {
        await verify2FA(pendingToken, totpCode);
        Toast.show({ type: 'success', text1: 'Welcome back', text2: 'You’re signed in.' });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Invalid verification code.';
        Toast.show({ type: 'error', text1: 'Verification failed', text2: message });
      }
      return;
    }

    try {
      const result = await login({ email: email.trim().toLowerCase(), password });
      if (result.requires2FA && result.pendingToken) {
        setNeeds2FA(true);
        setPendingToken(result.pendingToken);
        Toast.show({
          type: 'success',
          text1: 'Two-factor auth',
          text2: 'Enter the code from your authenticator app.',
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'Welcome back',
        text2: 'You’re signed in.',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Couldn’t sign you in. Try again.';
      Toast.show({
        type: 'error',
        text1: 'Sign in failed',
        text2: message,
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
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {needs2FA ? 'Verify it’s you' : 'Welcome back'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                  {needs2FA
                    ? 'Enter the 6-digit code from your authenticator app.'
                    : 'Resume your deep work sessions.'}
                </Text>
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

                {!needs2FA && (
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
                    <TouchableOpacity
                      style={styles.forgotPassword}
                      onPress={() => navigation.navigate('ForgotPassword')}
                    >
                      <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {needs2FA && (
                  <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: colors.primary }]}>AUTHENTICATOR CODE</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                      <TextInput
                        style={[styles.input, { color: colors.onSurface, letterSpacing: 4 }]}
                        placeholder="000000"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                        value={totpCode}
                        onChangeText={(t) => setTotpCode(t.replace(/\D/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.forgotPassword}
                      onPress={() => {
                        setNeeds2FA(false);
                        setPendingToken(null);
                        setTotpCode('');
                      }}
                    >
                      <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Use a different account</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  activeOpacity={0.85} 
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={isDark ? ['#7eb8a8', '#2d6a5e'] : [colors.primary, '#2d6a5e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                      {isLoading ? 'Verifying...' : needs2FA ? 'Verify code' : 'Authenticate'}
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
    shadowColor: '#2d6a5e',
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
