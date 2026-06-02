import React from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';

interface ReportCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ReportCard({children, style}: ReportCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});

