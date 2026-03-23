import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { focusService } from '../services/focus';

export default function FocusTimer() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = async () => {
    if (!isActive) {
      try {
        const res: any = await focusService.startSession({ startTime: new Date().toISOString() });
        setSessionId(res.session._id);
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start session', error);
      }
    } else {
      try {
        await focusService.endSession(sessionId!, 'Focused session');
        setIsActive(false);
        setSeconds(0);
        setSessionId(null);
      } catch (error) {
        console.error('Failed to end session', error);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(seconds)}</Text>
      <TouchableOpacity
        style={[styles.button, isActive ? styles.stopButton : styles.startButton]}
        onPress={toggleTimer}
      >
        <Text style={styles.buttonText}>{isActive ? 'STOP' : 'START FOCUS'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#fff', padding: 30, borderRadius: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  timer: { fontSize: 60, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 20 },
  button: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  startButton: { backgroundColor: '#34C759' },
  stopButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
