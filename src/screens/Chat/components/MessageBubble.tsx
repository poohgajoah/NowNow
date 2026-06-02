import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {Message} from '../types';

interface MessageBubbleProps {
  message: Message;
  onButtonPress: (action: string) => void;
}

export default function MessageBubble({
  message,
  onButtonPress,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userMessageRow : styles.botMessageRow,
      ]}>
      {isUser && <Text style={styles.timeText}>{message.createdAt}</Text>}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}>
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}>
          {message.content}
        </Text>

        {message.buttons && (
          <View style={styles.buttonGroup}>
            {message.buttons.map((button, index) => (
              <Pressable
                key={`${button.action}-${index}`}
                onPress={() => onButtonPress(button.action)}
                style={({pressed}) => [
                  styles.choiceButton,
                  pressed && styles.pressedChoiceButton,
                ]}>
                <Text style={styles.choiceButtonText}>{button.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      {!isUser && <Text style={styles.timeText}>{message.createdAt}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    maxWidth: '78%',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  timeText: {
    color: '#7B857A',
    fontSize: 10,
    marginBottom: 3,
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#4B5149',
  },
  botMessageText: {
    color: '#4B5149',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  choiceButton: {
    backgroundColor: '#E8A5B8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pressedChoiceButton: {
    opacity: 0.82,
  },
  choiceButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
