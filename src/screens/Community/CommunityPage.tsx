import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CommunityPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>커뮤니티</Text>
        <Text style={styles.description}>마음을 나눌 공간을 준비 중입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8F7F2',
    flex: 1,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#3F463D',
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: '#737A70',
    fontSize: 14,
    marginTop: 10,
  },
});

