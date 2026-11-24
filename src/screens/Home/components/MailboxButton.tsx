import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import Svg, {Circle, Ellipse, Path, Rect} from 'react-native-svg';
import {Mail, MailOpen} from 'lucide-react-native';

import {shadows} from '../../../theme/shadows';
import {useAppTheme} from '../../../theme/ThemeProvider';
import type {ThemeMode} from '../../../theme/ThemeProvider';

interface MailboxButtonProps {
  hasUnread: boolean;
  onPress: () => void;
}

// 방 바닥(캐릭터 오른쪽)에 서 있는 빨간 우체통. 방 그림(RoomDecor)과 같은 납작한 그림체.
const COLORS: Record<ThemeMode, {body: string; shade: string; light: string; slot: string; post: string; shadow: string}> = {
  light: {body: '#E5483F', shade: '#C7352D', light: '#F27C73', slot: '#5A1F1C', post: '#9A4038', shadow: '#D6C1A3'},
  dark: {body: '#B9443D', shade: '#99352F', light: '#CC655D', slot: '#3A1513', post: '#6E2F2A', shadow: '#2E2822'},
};

function MailboxArt({mode}: {mode: ThemeMode}) {
  const c = COLORS[mode];
  return (
    <Svg width={64} height={100} viewBox="0 0 64 100">
      {/* 바닥 그림자 */}
      <Ellipse cx={32} cy={95} rx={22} ry={4.5} fill={c.shadow} opacity={0.8} />
      {/* 기둥 */}
      <Rect x={26} y={60} width={12} height={36} rx={3} fill={c.post} />
      {/* 몸통: 위가 둥근 상자 */}
      <Path d="M8 60 V28 A24 24 0 0 1 56 28 V60 Q56 64 52 64 H12 Q8 64 8 60 Z" fill={c.body} />
      {/* 오른쪽 그늘과 왼쪽 빛 */}
      <Path d="M44 7.2 A24 24 0 0 1 56 28 V60 Q56 64 52 64 H46 V28 Q46 15 44 7.2 Z" fill={c.shade} />
      <Rect x={13} y={26} width={4} height={30} rx={2} fill={c.light} opacity={0.7} />
      {/* 편지 넣는 구멍 */}
      <Rect x={17} y={31} width={30} height={6} rx={3} fill={c.slot} />
      {/* 앞면 편지 그림 */}
      <Circle cx={32} cy={50} r={8} fill="#FFFFFF" opacity={0.95} />
      <Rect x={27} y={46.5} width={10} height={7} rx={1.2} fill={c.body} />
      <Path d="M27.3 47 L32 50.6 L36.7 47" stroke="#FFFFFF" strokeWidth={1.2} fill="none" strokeLinejoin="round" />
      {/* 아래 받침 */}
      <Rect x={6} y={60} width={52} height={6} rx={3} fill={c.shade} />
    </Svg>
  );
}

// 우체통 그림 + 위에 늘 메일 아이콘이 떠 있다.
// 평소: 열린 봉투(가만히). 새 편지가 오면: 닫힌 분홍 봉투 + 빨간 점, 둥실둥실 움직인다.
export default function MailboxButton({hasUnread, onPress}: MailboxButtonProps) {
  const {theme} = useAppTheme();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasUnread) {
      bob.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {duration: 700, toValue: 1, useNativeDriver: true}),
        Animated.timing(bob, {duration: 700, toValue: 0, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hasUnread, bob]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasUnread ? '우체통, 새 편지가 도착했어요' : '우체통'}
      hitSlop={10}
      onPress={onPress}
      style={({pressed}) => [styles.wrap, pressed && styles.pressed]}>
      <Animated.View
        style={[styles.bubble, {
          backgroundColor: theme.surface,
          transform: [{translateY: bob.interpolate({inputRange: [0, 1], outputRange: [0, -6]})}],
        }]}>
        {hasUnread ? (
          <>
            <Mail size={20} color={theme.accentStrong} strokeWidth={2.2} />
            <View style={[styles.dot, {backgroundColor: theme.stressWorst, borderColor: theme.surface}]} />
          </>
        ) : (
          <MailOpen size={20} color={theme.icon} strokeWidth={2} />
        )}
        {/* 말풍선 꼬리 */}
        <View style={[styles.tail, {borderTopColor: theme.surface}]} />
      </Animated.View>
      <MailboxArt mode={theme.mode} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center'},
  pressed: {opacity: 0.75},
  bubble: {
    alignItems: 'center',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    marginBottom: 6,
    width: 38,
    ...shadows.subtle,
  },
  dot: {
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: -1,
    top: -1,
    width: 12,
  },
  tail: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 6,
    borderRightColor: 'transparent',
    borderRightWidth: 6,
    borderTopWidth: 7,
    bottom: -6,
    height: 0,
    position: 'absolute',
    width: 0,
  },
});
