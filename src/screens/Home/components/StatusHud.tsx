import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import Text from '../../../components/AppText';
import {CHARACTER_NAME} from '../../../constants/app';
import {shadows} from '../../../theme/shadows';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {interactionActions} from '../constants/homeContent';
import type {UserPreferences} from '../types';

interface StatusHudProps {
  preferences: UserPreferences;
}

// 한 줄 상태창: 이름, 오늘의 돌봄 진행도
export default function StatusHud({preferences}: StatusHudProps) {
  const {theme} = useAppTheme();
  const total = interactionActions.length;
  const doneCount = interactionActions.filter(({key}) => preferences[key]).length;
  const fill = useRef(new Animated.Value(doneCount / total)).current;

  useEffect(() => {
    Animated.spring(fill, {
      friction: 7,
      toValue: doneCount / total,
      useNativeDriver: false,
    }).start();
  }, [doneCount, fill, total]);

  return (
    <View style={[styles.card, {backgroundColor: theme.surface}]}>
      <View style={styles.careHeader}>
        <Text style={[styles.name, {color: theme.text}]}>{CHARACTER_NAME}</Text>
        <Text style={[styles.careLabel, {color: theme.textMuted}]}>
          오늘의 돌봄 {doneCount}/{total}
        </Text>
      </View>
      <View style={[styles.track, {backgroundColor: theme.surfaceMuted}]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: theme.accent,
              width: fill.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.subtle,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    rowGap: 8,
  },
  careHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  careLabel: {
    fontSize: 12,
  },
  track: {
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
    height: '100%',
  },
});
