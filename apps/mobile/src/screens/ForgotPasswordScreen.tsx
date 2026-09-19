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
import { Mail, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { authService } from '../services/auth';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors, isDark } = useAppTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim().includes('@')) {
      Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
      Toast.show({
        type: 'success',
        text1: 'Check your inbox',
        text2: 'If an account exists, we sent reset instructions.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Toast.show({ type: 'error', text1: 'Request failed', text2: message });
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

            <Text style={[styles.title, { color: colors.onSurface }]}>Forgot password</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {sent
                ? 'If an account exists for that email, we sent reset instructions. Open the link on any device, then return here to sign in.'
                : 'Enter your email and we’ll send reset instructions if an account exists.'}
            </Text>

            {!sent && (
              <View style={styles.form}>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Mail color={colors.primary} size={18} style={{ marginRight: 12 }} />
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
                  <LinearGradient
                    colors={isDark ? ['#7eb8a8', '#2d6a5e'] : [colors.primary, '#2d6a5e']}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Send reset link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
              <Text style={[styles.link, { color: colors.primary }]}>Back to sign in</Text>
            </TouchableOpacity>
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
  title: { fontSize: 28, fontFamily: 'Inter_900Black', marginBottom: 12 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 28 },
  form: { gap: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, fontFamily: 'Inter_500Medium' },
  button: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { fontSize: 17, fontFamily: 'Inter_800ExtraBold', color: '#fff' },
  linkWrap: { marginTop: 24, alignItems: 'center' },
  link: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});
