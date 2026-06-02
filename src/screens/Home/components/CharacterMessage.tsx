import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

import type {MoodType} from '../types';

interface CharacterMessageProps {
  userMood: MoodType;
}

const messages: Record<MoodType, string> = {
  sad: '오늘 기분이 좋지 않아 보여...\n무슨 일 있어?',
  neutral: '오늘은 차분한 하루였나 봐.\n조금 더 들려줄래?',
  happy: '기분이 좋아 보여서 나도 좋아!\n오늘 좋은 일이 있었어?',
};

export default function CharacterMessage({userMood}: CharacterMessageProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        duration: 260,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        duration: 260,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim, userMood]);

  return (
    <View style={styles.card}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{translateY: translateAnim}],
        }}>
        <Text style={styles.message}>{messages[userMood]}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 82,
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  message: {
    color: '#4B5149',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
