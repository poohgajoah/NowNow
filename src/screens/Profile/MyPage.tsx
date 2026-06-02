import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  accountMenus,
  appMenus,
  logoutMenu,
  themeMenu,
  wellnessMenus,
} from './constants/profileData';
import ProfileHeader from './components/ProfileHeader';
import SettingsSection from './components/SettingsSection';
import {useThemePreference} from './hooks/useThemePreference';
import {useAppTheme} from '../../theme/ThemeProvider';

export default function MyPage() {
  const {themeLabel, themeDescription, toggleThemeMode} = useThemePreference();
  const {theme} = useAppTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.background}]}
      edges={['top']}>
      <ScrollView
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
        scrollEnabled
        style={[styles.container, {backgroundColor: theme.background}]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, {color: theme.text}]}>내 설정</Text>
        <ProfileHeader />
        <SettingsSection title="계정" items={accountMenus} />
        <SettingsSection
          title="앱 설정"
          items={[
            ...appMenus.slice(0, 1),
            {
              label: themeLabel,
              description: themeDescription,
              Icon: themeMenu.Icon,
              onPress: toggleThemeMode,
            },
            ...appMenus.slice(1),
          ]}
        />
        <SettingsSection title="웰니스" items={wellnessMenus} />
        <SettingsSection
          items={logoutMenu.map(item => ({...item, destructive: true}))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
    paddingHorizontal: 18,
    paddingTop: 18,
    rowGap: 16,
  },
  title: {
    color: '#2F352F',
    fontSize: 24,
    fontWeight: '800',
  },
});
