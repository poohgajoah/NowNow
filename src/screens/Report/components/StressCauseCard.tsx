import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {TrendingUp} from 'lucide-react-native';

import {causeColors} from '../constants/reportData';
import type {StressCause} from '../types';
import ReportCard from './ReportCard';

interface StressCauseCardProps {
  causes: StressCause[];
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
}

export default function StressCauseCard({
  causes,
  period,
  onPeriodChange,
}: StressCauseCardProps) {
  const totalCount = causes.reduce((sum, item) => sum + item.count, 0);

  return (
    <ReportCard>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <TrendingUp color="#517763" size={20} />
          </View>
          <Text style={styles.title}>스트레스 원인 분석</Text>
        </View>
        <View style={styles.toggle}>
          {(['week', 'month'] as const).map(item => (
            <Pressable
              key={item}
              onPress={() => onPeriodChange(item)}
              style={[
                styles.toggleButton,
                period === item && styles.activeToggleButton,
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  period === item && styles.activeToggleText,
                ]}>
                {item === 'week' ? '주간' : '월간'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.count}>
        {totalCount}
        <Text style={styles.countUnit}>건의 스트레스 기록</Text>
      </Text>

      <View style={styles.causes}>
        {causes.map((item, index) => (
          <View key={item.cause}>
            <View style={styles.causeRow}>
              <View style={styles.causeLabelRow}>
                <View
                  style={[
                    styles.dot,
                    {backgroundColor: causeColors[index % causeColors.length]},
                  ]}
                />
                <Text style={styles.causeLabel}>{item.cause}</Text>
              </View>
              <Text style={styles.causeValue}>
                {item.count}회 · {item.percentage}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.progress,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: causeColors[index % causeColors.length],
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 14,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#E7F1E2',
    borderRadius: 11,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  title: {
    color: '#2F352F',
    fontSize: 17,
    fontWeight: '800',
  },
  toggle: {
    backgroundColor: '#F4F8F1',
    borderRadius: 13,
    flexDirection: 'row',
    padding: 4,
  },
  toggleButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 9,
  },
  activeToggleButton: {
    backgroundColor: '#C9DEBF',
  },
  toggleText: {
    color: '#5B6559',
    fontSize: 13,
    fontWeight: '700',
  },
  activeToggleText: {
    color: '#263326',
  },
  count: {
    color: '#2F352F',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 18,
  },
  countUnit: {
    color: '#6E746B',
    fontSize: 13,
    fontWeight: '600',
  },
  causes: {
    marginTop: 18,
    rowGap: 14,
  },
  causeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  causeLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  causeLabel: {
    color: '#2F352F',
    fontSize: 14,
    fontWeight: '700',
  },
  causeValue: {
    color: '#6E746B',
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    backgroundColor: '#EEF2EB',
    borderRadius: 5,
    height: 9,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 5,
    height: '100%',
  },
});

