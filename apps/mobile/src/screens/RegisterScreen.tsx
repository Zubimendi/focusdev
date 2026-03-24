import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, Terminal, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../store/auth-store';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const register = useAuthStore((state: any) => state.register);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await register({ email, password, name });
      Alert.alert('Success', 'Account created! Welcome to Monolith.', [
        { text: 'Get Started', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft color="#c7c4d7" size={24} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Terminal color="#c0c1ff" size={32} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Join the focus</Text>
              <Text style={styles.subtitle}>Enter the monolith, master your engineering time.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <View style={styles.inputContainer}>
                  <User color="#8083ff" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Linus Torvalds"
                    placeholderTextColor="rgba(199, 196, 215, 0.4)"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputContainer}>
                  <Mail color="#8083ff" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="linus@linux.org"
                    placeholderTextColor="rgba(199, 196, 215, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Lock color="#8083ff" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(199, 196, 215, 0.4)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.85} 
                onPress={handleRegister}
                disabled={isLoading}
                style={styles.buttonWrapper}
              >
                <LinearGradient
                  colors={['#c0c1ff', '#8083ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Creating Module...' : 'Initialize Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already a member? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
