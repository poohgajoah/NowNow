import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';

import ChatAvatar from './ChatAvatar';

interface ChatHeaderProps {
  title: string;
  onBack: () => void;
}

export default function ChatHeader({title, onBack}: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={({pressed}) => [
          styles.backButton,
          pressed && styles.pressedBackButton,
        ]}>
        <ChevronLeft color="#4B5149" size={24} />
      </Pressable>
      <View style={styles.headerTitleArea}>
        <ChatAvatar />
        <Text style={styles.headerTitle}>뿡뿡이</Text>
        <View style={styles.divider} />
        <Text style={styles.headerSubtitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    backgroundColor: '#EEF7EC',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginTop: 2,
    width: 36,
  },
  pressedBackButton: {
    backgroundColor: 'rgba(75, 81, 73, 0.1)',
  },
  headerTitleArea: {
    alignItems: 'center',
    flex: 1,
    paddingRight: 36,
  },
  headerTitle: {
    color: '#42483F',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  divider: {
    backgroundColor: '#C7D4C3',
    height: StyleSheet.hairlineWidth,
    marginTop: 10,
    width: '100%',
  },
  headerSubtitle: {
    color: '#555C53',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
});
