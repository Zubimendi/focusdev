import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../store/auth-store';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const register = useAuthStore((state: any) => state.register);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  const handleRegister = async () => {
    try {
      await register({ email, password, name });
      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkText: { marginTop: 15, color: '#007AFF', textAlign: 'center' },
});
