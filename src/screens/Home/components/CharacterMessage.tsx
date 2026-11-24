import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';

import Text from '../../../components/AppText';
import {shadows} from '../../../theme/shadows';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {useCharacterName, usePersonalize} from '../../../context/CharacterNameProvider';
import type {WiltReason} from '../hooks/useWilt';
import type {MoodType} from '../types';

interface CharacterMessageProps {
  userMood: MoodType;
  // 캐릭터가 시든 까닭. 있으면 걱정하는 말로 바뀐다.
  worry?: WiltReason | null;
  // 말풍선을 누르면 채팅 탭으로
  onPress?: () => void;
}

// 시들었을 때 말풍선 (두 줄). '뿡뿡이'는 사용자가 정한 이름으로 바뀐다.
const WORRY_LINES: Record<WiltReason, [string, string]> = {
  away: ['오랜만이야… 많이 기다렸어', '그동안 잘 지냈어?'],
  noChat: ['요즘 이야기를 못 들어서 걱정했어', '무슨 일 있었는지 말해 줄래?'],
  stress: ['요즘 많이 힘들어 보여서 걱정돼…', '뿡뿡이한테 털어놔 줘'],
  sleep: ['어젯밤 잠을 잘 못 잤지? 걱정돼…', '오늘은 무리하지 말자'],
};

// 캐릭터 머리 위 말풍선. 기분이 바뀌면 톡 튀어나오고, 누르면 채팅으로 간다.
export default function CharacterMessage({userMood, worry, onPress}: CharacterMessageProps) {
  const {theme} = useAppTheme();
  const {characterName} = useCharacterName();
  const p = usePersonalize();
  const [firstLine, secondLine] = worry
    ? WORRY_LINES[worry].map(p)
    : ['오늘 하루는 어땠어??', `${characterName}에게 말해줘!`];
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    popAnim.setValue(0);
    Animated.spring(popAnim, {
      friction: 6,
      tension: 140,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [popAnim, userMood, worry]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: popAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              scale: popAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${firstLine} ${secondLine} 채팅 열기`}
        disabled={!onPress}
        onPress={onPress}
        style={({pressed}) => [styles.bubble, {backgroundColor: theme.surface}, pressed && styles.pressed]}>
        <Text style={[styles.message, {color: theme.text}]}>{firstLine}{'\n'}{secondLine}</Text>
      </Pressable>
      <View style={[styles.tail, {borderTopColor: theme.surface}]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  bubble: {
    ...shadows.subtle,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  pressed: {
    transform: [{scale: 0.96}],
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  tail: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 9,
    borderRightColor: 'transparent',
    borderRightWidth: 9,
    borderTopWidth: 10,
    height: 0,
    marginTop: -1,
    width: 0,
  },
});
