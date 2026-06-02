import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {preferenceLabels} from '../constants/preferenceOptions';
import type {PreferenceKey, UserPreferences} from '../types';

interface PreferencesCardProps {
  preferences: UserPreferences;
}

const formatInteractionText = (key: PreferenceKey, value: string) => {
  const messages: Record<PreferenceKey, string> = {
    feed: `${preferenceLabels[key]}로 ${value}`,
    play: `${preferenceLabels[key]}로 ${value}`,
    music: `${preferenceLabels[key]}으로 ${value}`,
    hobby: `${preferenceLabels[key]}으로 ${value}`,
  };

  return messages[key];
};

export default function PreferencesCard({preferences}: PreferencesCardProps) {
  const entries = Object.entries(preferences) as [PreferenceKey, string][];

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>뿡뿡이와 함께한 것들</Text>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.text}>{formatInteractionText(key, value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    color: '#2F352F',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 25,
  },
  dot: {
    backgroundColor: '#E8A5B8',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  text: {
    color: '#4B5149',
    fontSize: 14,
  },
  strong: {
    fontWeight: '700',
  },
});
