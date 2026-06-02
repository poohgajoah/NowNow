import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Moon} from 'lucide-react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';
import {sleepData} from '../constants/reportData';
import ReportCard from './ReportCard';

export default function SleepCard() {
  const {theme} = useAppTheme();

  return (
    <ReportCard>
      <View style={styles.header}>
        <Moon color={theme.accent} size={21} />
        <View>
          <Text style={[styles.title, {color: theme.text}]}>수면 패턴</Text>
          <Text style={[styles.subtitle, {color: theme.textMuted}]}>
            총 7시간 10분
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {sleepData.map((item, index) => (
          <View key={item.name} style={styles.row}>
            <Text style={[styles.name, {color: theme.text}]}>{item.name}</Text>
            <View style={styles.progressArea}>
              <View style={[styles.track, {backgroundColor: theme.surfaceMuted}]}>
                <View
                  style={[
                    styles.progress,
                    {
                      width: `${item.value / 2}%`,
                      backgroundColor: index === 0 ? theme.accent : item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.value, {color: theme.text}]}>
                {item.value}분
              </Text>
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
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
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
    fontSize: 14,
    fontWeight: '700',
  },
  progressArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  track: {
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
    fontSize: 12,
    fontWeight: '700',
    width: 58,
  },
});
