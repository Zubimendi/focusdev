import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { authService } from '../services/auth';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { colors, isDark } = useAppTheme();
  const initialToken = (route.params?.token as string) || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim()) {
      Toast.show({ type: 'error', text1: 'Missing token', text2: 'Paste the reset token from your email link.' });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token.trim(), password);
      Toast.show({
        type: 'success',
        text1: 'Password updated',
        text2: 'You can sign in with your new password.',
      });
      navigation.navigate('Login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Toast.show({ type: 'error', text1: 'Reset failed', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color={colors.onSurface} size={24} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.onSurface }]}>New password</Text>
            <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>
              At least 10 characters with uppercase, lowercase, a number, and a special character.
            </Text>

            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.primary }]}>RESET TOKEN</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder="From your email link"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <Text style={[styles.label, { color: colors.primary }]}>NEW PASSWORD</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Lock color={colors.primary} size={18} style={{ marginRight: 12 }} />
                <TextInput
                  style={[styles.input, { color: colors.onSurface }]}
                  placeholder="Strong password"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color={colors.onSurfaceVariant} size={20} />
                  ) : (
                    <Eye color={colors.onSurfaceVariant} size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                <LinearGradient
                  colors={isDark ? ['#7eb8a8', '#2d6a5e'] : [colors.primary, '#2d6a5e']}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Update password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 40 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 32,
  },
  title: { fontSize: 28, fontFamily: 'Inter_900Black', marginBottom: 8 },
  hint: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 24 },
  form: { gap: 12 },
  label: { fontSize: 11, fontFamily: 'Inter_800ExtraBold', letterSpacing: 1.5, marginLeft: 4, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_500Medium' },
  button: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: '#fff' },
});
