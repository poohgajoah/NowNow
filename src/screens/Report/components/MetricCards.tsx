import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Activity, HeartPulse} from 'lucide-react-native';

import type {MetricType} from '../types';

interface MetricCardsProps {
  selectedMetric: MetricType;
  onSelectMetric: (metric: MetricType) => void;
}

const metrics: {
  key: MetricType;
  label: string;
  value: string;
  Icon: typeof HeartPulse;
}[] = [
  {key: 'heartRate', label: '심박수', value: '72 bpm', Icon: HeartPulse},
  {key: 'bloodPressure', label: '혈압', value: '118/76', Icon: Activity},
];

export default function MetricCards({
  selectedMetric,
  onSelectMetric,
}: MetricCardsProps) {
  return (
    <View style={styles.grid}>
      {metrics.map(({key, label, value, Icon}) => {
        const selected = selectedMetric === key;

        return (
          <Pressable
            key={key}
            onPress={() => onSelectMetric(key)}
            style={({pressed}) => [
              styles.card,
              selected && styles.selectedCard,
              pressed && styles.pressedCard,
            ]}>
            <Icon color={selected ? '#FFFFFF' : '#E8A5B8'} size={22} />
            <Text style={[styles.label, selected && styles.selectedText]}>
              {label}
            </Text>
            <Text style={[styles.value, selected && styles.selectedText]}>
              {value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7ECE3',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  selectedCard: {
    backgroundColor: '#E8A5B8',
    borderColor: '#E8A5B8',
  },
  pressedCard: {
    opacity: 0.8,
  },
  label: {
    color: '#4B5149',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    color: '#2F352F',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 3,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
