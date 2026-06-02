import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Moon} from 'lucide-react-native';

import {sleepData} from '../constants/reportData';
import ReportCard from './ReportCard';

export default function SleepCard() {
  return (
    <ReportCard>
      <View style={styles.header}>
        <Moon color="#7D6AA6" size={21} />
        <View>
          <Text style={styles.title}>수면 패턴</Text>
          <Text style={styles.subtitle}>총 7시간 10분</Text>
        </View>
      </View>

      <View style={styles.rows}>
        {sleepData.map(item => (
          <View key={item.name} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.progressArea}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.progress,
                    {width: `${item.value / 2}%`, backgroundColor: item.color},
                  ]}
                />
              </View>
              <Text style={styles.value}>{item.value}분</Text>
            </View>
          </View>
        ))}
      </View>
    </ReportCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    color: '#2F352F',
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6E746B',
    fontSize: 12,
    marginTop: 3,
  },
  rows: {
    marginTop: 18,
    rowGap: 14,
  },
  row: {
    gap: 8,
  },
  name: {
    color: '#4B5149',
    fontSize: 14,
    fontWeight: '700',
  },
  progressArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  track: {
    backgroundColor: '#EEF2EB',
    borderRadius: 5,
    flex: 1,
    height: 9,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 5,
    height: '100%',
  },
  value: {
    color: '#2F352F',
    fontSize: 12,
    fontWeight: '700',
    width: 58,
  },
});

