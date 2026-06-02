import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';
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
  const {theme} = useAppTheme();
  const entries = Object.entries(preferences) as [PreferenceKey, string][];

  if (entries.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, {backgroundColor: theme.surface}]}>
      <Text style={[styles.title, {color: theme.text}]}>
        뿡뿡이와 함께한 것들
      </Text>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <View style={[styles.dot, {backgroundColor: theme.accent}]} />
          <Text style={[styles.text, {color: theme.text}]}>
            {formatInteractionText(key, value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
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
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  text: {
    fontSize: 14,
  },
  strong: {
    fontWeight: '700',
  },
});
