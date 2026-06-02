import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  ChevronLeft,
  Gamepad2,
  Music,
  PartyPopper,
  Utensils,
} from 'lucide-react-native';

import {preferenceLabels} from '../constants/preferenceOptions';
import type {PreferenceKey, PreferenceOption, UserPreferences} from '../types';

interface InteractionButtonsProps {
  selectedAction: PreferenceKey | null;
  options: PreferenceOption[];
  completedPreferences: UserPreferences;
  onActionSelect: (action: PreferenceKey) => void;
  onOptionSelect: (choice: string) => void;
  onCancelOptions: () => void;
}

const actions: {
  key: PreferenceKey;
  label: string;
  Icon: typeof Utensils;
}[] = [
  {key: 'feed', label: '먹이 주기', Icon: Utensils},
  {key: 'play', label: '놀아 주기', Icon: Gamepad2},
  {key: 'music', label: '음악 듣기', Icon: Music},
  {key: 'hobby', label: '휴식 취하기', Icon: PartyPopper},
];

const completedMessages: Record<PreferenceKey, string> = {
  feed: '배불러요!',
  play: '즐거워요!',
  music: '흥얼거려요!',
  hobby: '편안해요!',
};

export default function InteractionButtons({
  selectedAction,
  options,
  completedPreferences,
  onActionSelect,
  onOptionSelect,
  onCancelOptions,
}: InteractionButtonsProps) {
  const transitionAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    transitionAnim.setValue(0);
    Animated.spring(transitionAnim, {
      friction: 8,
      tension: 90,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [selectedAction, transitionAnim]);

  const animatedStyle = {
    opacity: transitionAnim,
    transform: [
      {
        translateY: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
      {
        scale: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  if (selectedAction) {
    return (
      <Animated.View style={[styles.optionPanel, animatedStyle]}>
        <View style={styles.optionHeader}>
          <Pressable
            onPress={onCancelOptions}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}>
            <ChevronLeft color="#60665E" size={18} />
          </Pressable>
          <Text style={styles.optionTitle}>
            {preferenceLabels[selectedAction]} 취향 고르기
          </Text>
        </View>

        {options.map(option => (
          <Pressable
            key={option.label}
            onPress={() => onOptionSelect(option.label)}
            style={({pressed}) => [
              styles.optionButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </Pressable>
        ))}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.grid, animatedStyle]}>
      {actions.map(({key, label, Icon}) => {
        const completed = Boolean(completedPreferences[key]);

        return (
          <Pressable
            key={key}
            disabled={completed}
            onPress={() => onActionSelect(key)}
            style={({pressed}) => [
              styles.button,
              completed && styles.completedButton,
              pressed && !completed && styles.pressedButton,
            ]}>
            <Icon color={completed ? '#9AA39A' : '#60665E'} size={24} />
            <Text style={[styles.label, completed && styles.completedLabel]}>
              {completed ? completedMessages[key] : label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexBasis: '47%',
    flexDirection: 'row',
    gap: 9,
    minHeight: 58,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  completedButton: {
    backgroundColor: '#E9EEE7',
    shadowOpacity: 0,
    elevation: 0,
  },
  pressedButton: {
    opacity: 0.72,
  },
  label: {
    color: '#4B5149',
    fontSize: 14,
    fontWeight: '600',
  },
  completedLabel: {
    color: '#7E887E',
  },
  optionPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    rowGap: 9,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  optionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  optionTitle: {
    color: '#3F463D',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#F6FAF4',
    borderColor: '#DBE7D6',
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  optionLabel: {
    color: '#3F463D',
    fontSize: 14,
    fontWeight: '700',
  },
  optionDescription: {
    color: '#6E746B',
    fontSize: 12,
    marginTop: 4,
  },
});
