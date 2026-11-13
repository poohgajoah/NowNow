import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

import Text from '../../../components/AppText';
import {useAppTheme} from '../../../theme/ThemeProvider';
import type {PreferenceKey, PreferenceOption} from '../types';

interface OptionPickerProps {
  selectedAction: PreferenceKey | null;
  options: PreferenceOption[];
  onOptionSelect: (choice: string) => void;
}

// 버튼 아래 입체 테두리 두께. 누르면 그만큼 내려가 눌린 느낌을 준다.
const BUTTON_DEPTH = 3;

// 행동 아이콘 줄 바로 아래에 가로로 작게 펼쳐지는 오늘의 선택지.
// 닫기는 같은 아이콘을 한 번 더 누르면 된다.
export default function OptionPicker({
  selectedAction,
  options,
  onOptionSelect,
}: OptionPickerProps) {
  const {theme} = useAppTheme();
  const transitionAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    transitionAnim.setValue(0);
    Animated.spring(transitionAnim, {
      friction: 7,
      tension: 90,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [selectedAction, transitionAnim]);

  if (!selectedAction) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.row,
        {
          opacity: transitionAnim,
          transform: [
            {
              translateY: transitionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-8, 0],
              }),
            },
          ],
        },
      ]}>
      {options.map(option => (
        <Pressable
          key={option.label}
          accessibilityHint={option.description}
          onPress={() => onOptionSelect(option.label)}
          style={({pressed}) => [
            styles.option,
            {backgroundColor: theme.surface, borderBottomColor: theme.border},
            pressed && styles.pressed,
          ]}>
          <Text
            numberOfLines={2}
            style={[styles.label, {color: theme.text}]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 26,
    paddingHorizontal: 14,
  },
  option: {
    alignItems: 'center',
    borderBottomWidth: BUTTON_DEPTH,
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  pressed: {
    borderBottomWidth: 1,
    marginTop: BUTTON_DEPTH - 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
