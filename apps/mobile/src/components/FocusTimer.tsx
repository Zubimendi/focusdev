import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { focusService } from '../services/focus';
import { useSettingsStore } from '../store/settings-store';

export default function FocusTimer() {
  const { theme, timerDuration } = useSettingsStore();
  const initialSeconds = timerDuration * 60;
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSeconds(initialSeconds);
    }
  }, [initialSeconds, isActive]);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

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
        setSeconds(initialSeconds);
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
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#161b2b' : '#f8fafc' }]}>
      <Text style={[styles.timer, { color: theme === 'dark' ? '#dee1f7' : '#0e1322' }]}>{formatTime(seconds)}</Text>
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
  container: { alignItems: 'center', padding: 30, borderRadius: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  timer: { fontSize: 60, fontWeight: 'bold', fontFamily: 'JetBrainsMono_700Bold', marginBottom: 20 },
  button: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  startButton: { backgroundColor: '#34C759' },
  stopButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
