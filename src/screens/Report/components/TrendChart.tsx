import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import {vitalData} from '../constants/reportData';
import {useAppTheme} from '../../../theme/ThemeProvider';
import type {MetricType} from '../types';
import ReportCard from './ReportCard';

interface TrendChartProps {
  selectedMetric: MetricType;
}

interface AnimatedBarProps {
  colorStyle: ViewStyle;
  height: number;
  index: number;
  metricKey: MetricType;
}

function AnimatedBar({colorStyle, height, index, metricKey}: AnimatedBarProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      delay: index * 45,
      duration: 360,
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }, [index, metricKey, progress]);

  const animatedHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  return (
    <Animated.View
      style={[styles.bar, colorStyle, {height: animatedHeight}]}
    />
  );
}

export default function TrendChart({selectedMetric}: TrendChartProps) {
  const {theme} = useAppTheme();
  const isBloodPressure = selectedMetric === 'bloodPressure';
  const maxValue = isBloodPressure ? 150 : 120;
  const title = isBloodPressure ? '혈압 변화' : '심박수 변화';
  const unit = isBloodPressure ? 'mmHg' : 'bpm';

  return (
    <ReportCard>
      <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
      <View style={styles.chart}>
        {vitalData.map((item, index) => {
          const value = isBloodPressure ? item.bloodPressure : item.heartRate;
          const height = Math.max(18, (value / maxValue) * 140);

          return (
            <View key={item.time} style={styles.barColumn}>
              <Text style={[styles.valueLabel, {color: theme.textMuted}]}>
                {value}
              </Text>
              <AnimatedBar
                colorStyle={
                  isBloodPressure
                    ? {backgroundColor: theme.nav}
                    : {backgroundColor: theme.accent}
                }
                height={height}
                index={index}
                metricKey={selectedMetric}
              />
              <Text style={[styles.timeLabel, {color: theme.textMuted}]}>
                {item.time.slice(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.unitText, {color: theme.textMuted}]}>
        단위: {unit}
      </Text>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  title: {
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
  timeLabel: {
    fontSize: 10,
    marginTop: 7,
  },
  valueLabel: {
    fontSize: 9,
    marginBottom: 4,
  },
  unitText: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'right',
  },
});
