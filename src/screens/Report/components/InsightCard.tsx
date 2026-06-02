import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {AlertCircle, ChevronRight, Sparkles} from 'lucide-react-native';

import type {HrvPoint, StressCause} from '../types';
import ReportCard from './ReportCard';

interface InsightCardProps {
  peakStress: HrvPoint;
  lowestStress: HrvPoint;
  topCause: StressCause;
}

export default function InsightCard({
  peakStress,
  lowestStress,
  topCause,
}: InsightCardProps) {
  return (
    <>
      <ReportCard style={styles.analysisCard}>
        <View style={styles.titleRow}>
          <AlertCircle color="#C48239" size={21} />
          <Text style={styles.title}>스트레스 분석</Text>
        </View>
        <View style={styles.analysisBox}>
          <Text style={styles.caption}>가장 스트레스가 높은 시간</Text>
          <Text style={styles.pointText}>{peakStress.time}</Text>
          <Text style={styles.description}>
            {peakStress.note ?? '업무 관련 스트레스'}
          </Text>
        </View>
        <View style={styles.analysisBox}>
          <Text style={styles.caption}>가장 안정적인 시간</Text>
          <Text style={styles.pointText}>{lowestStress.time}</Text>
          <Text style={styles.description}>수면 중 안정적인 흐름</Text>
        </View>
      </ReportCard>

      <ReportCard style={styles.recommendCard}>
        <View style={styles.titleRow}>
          <Sparkles color="#E8A5B8" size={21} />
          <Text style={styles.title}>AI 추천</Text>
        </View>
        <Text style={styles.recommendText}>
          이번 기록에서는 {topCause.cause}가 가장 크게 나타났어요. 짧은
          호흡 루틴이나 10분 산책이 도움이 될 수 있어요.
        </Text>
        <Pressable style={({pressed}) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>맞춤형 루틴 시작하기</Text>
          <ChevronRight color="#FFFFFF" size={18} />
        </Pressable>
      </ReportCard>
    </>
  );
}

const styles = StyleSheet.create({
  analysisCard: {
    rowGap: 12,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  title: {
    color: '#2F352F',
    fontSize: 17,
    fontWeight: '800',
  },
  analysisBox: {
    backgroundColor: '#FFF3F7',
    borderRadius: 14,
    padding: 14,
  },
  caption: {
    color: '#6E746B',
    fontSize: 12,
    fontWeight: '700',
  },
  pointText: {
    color: '#E08FA9',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  description: {
    color: '#4B5149',
    fontSize: 13,
    marginTop: 3,
  },
  recommendCard: {
    rowGap: 13,
  },
  recommendText: {
    color: '#4B5149',
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#E8A5B8',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
  },
  pressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

