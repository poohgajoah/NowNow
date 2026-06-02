import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';

import type {MoodType} from '../types';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onMoodChange: (mood: MoodType) => void;
}

const moods: {label: string; value: MoodType; face: string}[] = [
  {label: '좋지 않아', value: 'sad', face: '☹'},
  {label: '그냥 그래', value: 'neutral', face: '😐'},
  {label: '행복해', value: 'happy', face: '☺'},
];

interface MoodOptionProps {
  label: string;
  value: MoodType;
  face: string;
  selected: boolean;
  onMoodChange: (mood: MoodType) => void;
}

function MoodOption({
  label,
  value,
  face,
  selected,
  onMoodChange,
}: MoodOptionProps) {
  const selectedAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selectedAnim, {
      duration: 360,
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [selected, selectedAnim]);

  const backgroundColor = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F4F6F2', '#C9DEBF'],
  });

  const borderColor = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E4EAE0', '#B8D1AF'],
  });

  return (
    <Pressable
      onPress={() => onMoodChange(value)}
      style={({pressed}) => [
        styles.optionPressable,
        pressed && styles.pressedOption,
      ]}>
      <Animated.View style={[styles.option, {backgroundColor, borderColor}]}>
        <Text style={styles.face}>{face}</Text>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function MoodSelector({
  selectedMood,
  onMoodChange,
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {moods.map(mood => {
        const selected = selectedMood === mood.value;

        return (
          <MoodOption
            key={mood.value}
            label={mood.label}
            value={mood.value}
            face={mood.face}
            selected={selected}
            onMoodChange={onMoodChange}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 0,
    paddingVertical: 12,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  optionPressable: {
    flex: 1,
  },
  pressedOption: {
    opacity: 0.75,
  },
  face: {
    color: '#5D625B',
    fontSize: 22,
    lineHeight: 24,
  },
  label: {
    color: '#4C5149',
    fontSize: 14,
    marginTop: 5,
  },
});
