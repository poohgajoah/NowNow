import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Text from '../../../components/AppText';

import {useAppTheme} from '../../../theme/ThemeProvider';
import CardHeader from './CardHeader';

interface HealthCardProps {
  title: string;
  value: string;
  unit?: string;
  // 숫자와 단위가 여러 개일 때 (예: 6 시간 30 분). 있으면 value·unit 대신 쓴다.
  parts?: {value: string; unit: string}[];
  caption?: string;
  selected?: boolean;
  onPress?: () => void;
}

// 애플 건강 앱 타일: 위에 색 이름, 아래 큰 숫자와 작은 단위
export default function HealthCard({
  title,
  value,
  unit,
  parts,
  caption,
  selected = false,
  onPress,
}: HealthCardProps) {
  const {theme} = useAppTheme();

  return (
    <Pressable
      accessibilityState={onPress ? {selected} : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.accentStrong : theme.surface,
        },
        pressed && styles.pressed,
      ]}>
      <CardHeader title={title} align="left" />

      <View style={styles.valueRow}>
        {parts?.length ? parts.map(part => (
          <React.Fragment key={part.unit}>
            <Text style={[styles.value, {color: theme.text}]}>{part.value}</Text>
            <Text style={[styles.unit, styles.partUnit, {color: theme.textMuted}]}>{part.unit}</Text>
          </React.Fragment>
        )) : <>
          <Text style={[styles.value, {color: theme.text}]}>{value}</Text>
          {unit && <Text style={[styles.unit, {color: theme.textMuted}]}>{unit}</Text>}
        </>}
      </View>

      {caption && (
        <Text numberOfLines={1} style={[styles.caption, {color: theme.textMuted}]}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    // 고른 카드만 테두리 색이 보인다 (두께는 늘 같게 해서 크기가 안 바뀌게)
    borderWidth: 2,
    flex: 1,
    padding: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 3,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
  },
  // 시간과 분 사이 띄우기
  partUnit: {
    marginRight: 5,
  },
  caption: {
    fontSize: 12,
    marginTop: 2,
  },
});
