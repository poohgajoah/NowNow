import React from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Send} from 'lucide-react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({value, onChangeText, onSend}: ChatInputProps) {
  return (
    <View style={styles.inputArea}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        placeholder="오늘 하루를 이야기해 주세요..."
        placeholderTextColor="#9CA3AF"
        returnKeyType="send"
        style={styles.input}
      />
      <Pressable
        onPress={onSend}
        style={({pressed}) => [
          styles.sendButton,
          pressed && styles.pressedSendButton,
        ]}>
        <Send color="#FFFFFF" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    backgroundColor: '#EEF7EC',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    color: '#4B5149',
    flex: 1,
    fontSize: 13,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#E8A5B8',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 44,
    width: 48,
  },
  pressedSendButton: {
    opacity: 0.82,
  },
});
