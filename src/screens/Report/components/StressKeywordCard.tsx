import React from 'react';
import {Pressable, StyleSheet, View, type ViewStyle} from 'react-native';

import Text from '../../../components/AppText';

import {useAppTheme} from '../../../theme/ThemeProvider';
import type {WeeklyReportData} from '../../../services/api/reports';
import CardHeader from './CardHeader';
import ReportCard from './ReportCard';

interface StressKeywordCardProps {
  causes: WeeklyReportData['causes'];
  selectedCause: string | null;
  onSelectCause: (cause: string | null) => void;
  hint?: string;
  emptyText?: string;
}

export default function StressKeywordCard({
  causes,
  selectedCause,
  onSelectCause,
  hint = '누르면 그래프에 그날이 표시돼요.',
  emptyText = '이번 주에는 기록된 원인이 없어요.',
}: StressKeywordCardProps) {
  const {theme} = useAppTheme();

  return (
    <ReportCard>
      <CardHeader title="스트레스 원인" />

      {causes.length === 0 ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{emptyText}</Text>
      ) : (
        <>
          <KeywordChips causes={causes} selectedCause={selectedCause} onSelectCause={onSelectCause} />
          <Text style={[styles.hint, styles.hintBelow, {color: theme.textMuted}]}>{hint}</Text>
        </>
      )}
    </ReportCard>
  );
}

// 원인 키워드 버튼 줄만 (다른 카드 안에 넣을 때)
export function KeywordChips({
  causes,
  selectedCause,
  onSelectCause,
  style,
}: Pick<StressKeywordCardProps, 'causes' | 'selectedCause' | 'onSelectCause'> & {
  style?: ViewStyle;
}) {
  const {theme} = useAppTheme();

  return (
    <View style={[styles.chips, style]}>
      {causes.map(({cause, count}) => {
        const selected = selectedCause === cause;

        return (
          <Pressable
            key={cause}
            accessibilityRole="button"
            accessibilityState={{selected}}
            onPress={() => onSelectCause(selected ? null : cause)}
            style={({pressed}) => [
              styles.chip,
              {backgroundColor: selected ? theme.accentStrong : theme.surfaceMuted},
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.chipText, {color: selected ? theme.accentText : theme.text}]}>
              {cause}
            </Text>
            <Text style={[styles.chipCount, {color: selected ? theme.accentText : theme.textMuted}]}>
              {count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
  },
  hintBelow: {
    marginTop: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pressed: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipCount: {
    fontSize: 13,
    fontWeight: '500',
  },
});
