import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {Check} from 'lucide-react-native';

import Text from '../../../components/AppText';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {completedMessages, interactionActions} from '../constants/homeContent';
import type {PreferenceKey, UserPreferences} from '../types';

interface ActionBarProps {
  completedPreferences: UserPreferences;
  selectedAction: PreferenceKey | null;
  onActionSelect: (action: PreferenceKey) => void;
  onCancel: () => void;
}

const BOUNCE_DURATION = 1300;

function ActionIcon({
  action,
  index,
  completed,
  selected,
  onPress,
}: {
  action: (typeof interactionActions)[number];
  index: number;
  completed: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const {theme} = useAppTheme();
  // 아직 안 한 아이콘은 통통 튀어서 눌러 달라는 느낌을 준다. 아이콘마다 박자를 엇갈린다.
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (completed) {
      bounceAnim.setValue(0);
      return;
    }

    const bouncing = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(bounceAnim, {
          duration: BOUNCE_DURATION,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          duration: BOUNCE_DURATION,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    bouncing.start();
    return () => bouncing.stop();
  }, [bounceAnim, completed, index]);

  return (
    <Pressable
      accessibilityLabel={action.label}
      disabled={completed}
      onPress={onPress}
      style={({pressed}) => [styles.item, pressed && styles.pressed]}>
      <Animated.View
        style={[
          styles.iconWrap,
          selected && {backgroundColor: theme.surface},
          {
            transform: [
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          },
        ]}>
        <Text style={[styles.emoji, completed && styles.completedEmoji]}>
          {action.emoji}
        </Text>
        {completed ? (
          <View style={[styles.badge, {backgroundColor: theme.stressNormal}]}>
            <Check color="#FFFFFF" size={10} strokeWidth={3.5} />
          </View>
        ) : (
          // 오늘 아직 안 한 행동 표시
          <View style={[styles.badge, {backgroundColor: theme.accent}]}>
            <Text style={styles.badgeMark}>!</Text>
          </View>
        )}
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {color: completed ? theme.textMuted : theme.text},
          selected && {color: theme.accent},
        ]}>
        {completed ? completedMessages[action.key] : action.label}
      </Text>
    </Pressable>
  );
}

// 캐릭터 방 위쪽에 가로로 놓는 행동 아이콘(먹이·놀이·음악·휴식)
export default function ActionBar({
  completedPreferences,
  selectedAction,
  onActionSelect,
  onCancel,
}: ActionBarProps) {
  return (
    <View style={styles.bar}>
      {interactionActions.map((action, index) => (
        <ActionIcon
          key={action.key}
          action={action}
          index={index}
          completed={Boolean(completedPreferences[action.key])}
          selected={selectedAction === action.key}
          // 고르고 있는 아이콘을 한 번 더 누르면 선택지를 닫는다.
          onPress={() =>
            selectedAction === action.key
              ? onCancel()
              : onActionSelect(action.key)
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  item: {
    alignItems: 'center',
    rowGap: 4,
    width: 72,
  },
  pressed: {
    transform: [{scale: 0.9}],
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 20,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  emoji: {
    fontSize: 38,
  },
  completedEmoji: {
    opacity: 0.4,
  },
  badge: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
  },
  badgeMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
