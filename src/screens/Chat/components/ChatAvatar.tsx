import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';

export default function ChatAvatar() {
  const {theme} = useAppTheme();

  return (
    <View style={[styles.avatar, {backgroundColor: theme.accentMuted}]}>
      <View style={[styles.face, {backgroundColor: theme.accent}]}>
        <View style={styles.eye} />
        <View style={[styles.eye, styles.rightEye]} />
        <View style={styles.mouth} />
      </View>
      <View style={[styles.leftHand, {backgroundColor: theme.accent}]} />
      <View style={[styles.rightHand, {backgroundColor: theme.accent}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  face: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  eye: {
    backgroundColor: '#151515',
    borderRadius: 2,
    height: 4,
    left: 7,
    position: 'absolute',
    top: 8,
    width: 4,
  },
  rightEye: {
    left: 14,
  },
  mouth: {
    borderBottomColor: '#151515',
    borderBottomWidth: 1,
    borderRadius: 4,
    height: 5,
    left: 9,
    position: 'absolute',
    top: 14,
    width: 7,
  },
  leftHand: {
    borderRadius: 4,
    height: 8,
    left: 7,
    position: 'absolute',
    top: 17,
    width: 8,
  },
  rightHand: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 7,
    top: 17,
    width: 8,
  },
});
