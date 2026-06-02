import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {vitalData} from '../constants/reportData';
import type {MetricType} from '../types';
import ReportCard from './ReportCard';

interface TrendChartProps {
  selectedMetric: MetricType;
}

export default function TrendChart({selectedMetric}: TrendChartProps) {
  const isBloodPressure = selectedMetric === 'bloodPressure';
  const maxValue = isBloodPressure ? 150 : 120;
  const title = isBloodPressure ? '혈압 변화' : '심박수 변화';
  const unit = isBloodPressure ? 'mmHg' : 'bpm';

  return (
    <ReportCard>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {vitalData.map(item => {
          const value = isBloodPressure ? item.bloodPressure : item.heartRate;
          const height = Math.max(18, (value / maxValue) * 140);

          return (
            <View key={item.time} style={styles.barColumn}>
              <Text style={styles.valueLabel}>{value}</Text>
              <View
                style={[
                  styles.bar,
                  isBloodPressure ? styles.pressureBar : styles.heartBar,
                  {
                    height,
                  },
                ]}
              />
              <Text style={styles.timeLabel}>{item.time.slice(0, 2)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.unitText}>단위: {unit}</Text>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#2F352F',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 18,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 7,
    height: 170,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 8,
    width: '100%',
  },
  heartBar: {
    backgroundColor: '#E8A5B8',
  },
  pressureBar: {
    backgroundColor: '#91B6A4',
  },
  timeLabel: {
    color: '#7B857A',
    fontSize: 10,
    marginTop: 7,
  },
  valueLabel: {
    color: '#63705F',
    fontSize: 9,
    marginBottom: 4,
  },
  unitText: {
    color: '#7B857A',
    fontSize: 11,
    marginTop: 12,
    textAlign: 'right',
  },
});
