import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target } from 'lucide-react-native';

export default function GoalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Target size={64} color="#4edea3" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>Set and track your daily focus objectives.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1322', alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 28, fontFamily: 'Inter_900Black', color: '#dee1f7' },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', color: '#c7c4d7', textAlign: 'center', marginTop: 12 },
});
