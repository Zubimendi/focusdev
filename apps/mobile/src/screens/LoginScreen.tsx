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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.glowTopRight, { backgroundColor: isDark ? 'rgba(192, 193, 255, 0.08)' : 'rgba(128, 131, 255, 0.1)' }]} />
      <View style={[styles.glowBottomLeft, { backgroundColor: isDark ? 'rgba(78, 222, 163, 0.05)' : 'rgba(78, 222, 163, 0.1)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft color={colors.onSurfaceVariant} size={24} />
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
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>EMAIL ADDRESS</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Mail color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="architect@focus.dev"
                      placeholderTextColor={colors.onSurfaceVariant + '66'}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>PASSWORD</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    <Lock color={colors.primary} size={18} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.onSurface }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.onSurfaceVariant + '66'}
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
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  activeOpacity={0.85} 
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={styles.buttonWrapper}
                >
                  <LinearGradient
                    colors={isDark ? ['#c0c1ff', '#8083ff'] : ['#8083ff', '#5b5ee1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    <Text style={[styles.buttonText, { color: isDark ? colors.onPrimary : '#ffffff' }]}>
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
    backgroundColor: '#0e1322',
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(192, 193, 255, 0.08)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(78, 222, 163, 0.05)',
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
    backgroundColor: '#2f3445',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.05)',
    marginBottom: 40,
  },
  header: {
    marginBottom: 48,
  },
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#2f3445',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192, 193, 255, 0.2)',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_900Black',
    color: '#dee1f7',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#c7c4d7',
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
    color: 'rgba(199, 196, 215, 0.5)',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(47, 52, 69, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.1)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#dee1f7',
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
    color: '#8083ff',
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
    color: '#1000a9',
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
    color: '#c7c4d7',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    opacity: 0.7,
  },
  footerLink: {
    color: '#c0c1ff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
});
