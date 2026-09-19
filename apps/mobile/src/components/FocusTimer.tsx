import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { focusService } from '../services/focus';
import { useSettingsStore } from '../store/settings-store';
import { useTimerStore } from '../store/timer-store';

export default function FocusTimer() {
  const { theme, timerDuration } = useSettingsStore();
  const {
    remainingSeconds,
    isActive,
    sessionId,
    setDurationMinutes,
    start,
    stop,
    tick,
    syncFromClock,
  } = useTimerStore();
  const completingRef = useRef(false);

  useEffect(() => {
    setDurationMinutes(timerDuration);
  }, [timerDuration, setDurationMinutes]);

  useEffect(() => {
    syncFromClock();
  }, [syncFromClock]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => tick(), 250);
    return () => clearInterval(id);
  }, [isActive, tick]);

  useEffect(() => {
    if (isActive || remainingSeconds > 0 || !sessionId || completingRef.current) return;
    completingRef.current = true;
    (async () => {
      try {
        await focusService.endSession(sessionId, 'Pomodoro complete');
      } catch {
        /* ignore */
      } finally {
        stop();
        completingRef.current = false;
      }
    })();
  }, [isActive, remainingSeconds, sessionId, stop]);

  const toggleTimer = async () => {
    if (!isActive) {
      try {
        const res: any = await focusService.startSession({
          startTime: new Date().toISOString(),
        });
        start(res.session?._id || res.session?.id || null);
      } catch (error) {
        console.error('Failed to start session', error);
      }
    } else {
      try {
        if (sessionId) {
          await focusService.endSession(sessionId, 'Focused session');
        }
        stop();
      } catch (error) {
        console.error('Failed to end session', error);
        stop();
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1c2421' : '#f8fafc' }]}>
      <Text style={[styles.timer, { color: theme === 'dark' ? '#eef1f0' : '#0f1614' }]}>
        {formatTime(remainingSeconds)}
      </Text>
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
  container: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timer: { fontSize: 60, fontWeight: 'bold', fontFamily: 'JetBrainsMono_700Bold', marginBottom: 20 },
  button: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  startButton: { backgroundColor: '#34C759' },
  stopButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
