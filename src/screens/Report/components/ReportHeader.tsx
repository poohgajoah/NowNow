import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Sparkles} from 'lucide-react-native';

export default function ReportHeader() {
  const today = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <Sparkles color="#FFFFFF" size={24} />
      </View>
      <View>
        <Text style={styles.title}>건강 리포트</Text>
        <Text style={styles.subtitle}>{today} 상태를 한눈에</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: '#91B6A4',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    padding: 20,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 15,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F4FBF1',
    fontSize: 12,
    marginTop: 4,
  },
});

