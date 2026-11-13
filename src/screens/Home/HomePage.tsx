import React from 'react';
import {ScrollView, StyleSheet, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CharacterStage from './components/CharacterStage';
import OptionPicker from './components/OptionPicker';
import PreferencesCard from './components/PreferencesCard';
import ActionBar from './components/ActionBar';
import StatusHud from './components/StatusHud';
import {useCharacterHome} from './hooks/useCharacterHome';
import {SCREEN_BOTTOM_INSET, SCREEN_HORIZONTAL_PADDING} from '../../theme/layout';
import {useAppTheme} from '../../theme/ThemeProvider';

// 상태바·상태창·탭바가 차지하는 높이. 나머지를 캐릭터 방에 준다(오늘 고른 칩은 스크롤로 본다).
const HOME_CHROME_HEIGHT = 237;
// 선택지가 열리면 방 아래에 선택지 창이 붙어서 방을 그만큼 줄인다.
const HOME_CHROME_HEIGHT_OPTIONS = 580;
// 방 안에 행동 아이콘 줄·말풍선·캐릭터가 다 들어가는 높이
const ROOM_MIN_HEIGHT = 440;
const ROOM_MAX_HEIGHT = 720;

// 캐릭터 키우기 게임 느낌의 홈: 상태창 → 캐릭터 방(위쪽 행동 아이콘 줄) → 선택지 → 오늘 고른 것
export default function HomePage() {
  const {theme} = useAppTheme();
  const {height: windowHeight} = useWindowDimensions();
  const {
    userMood,
    isInteracting,
    userPreferences,
    selectedAction,
    currentOptions,
    handleActionSelect,
    handleOptionSelect,
    handleCancelOptions,
  } = useCharacterHome();
  const chromeHeight = selectedAction
    ? HOME_CHROME_HEIGHT_OPTIONS
    : HOME_CHROME_HEIGHT;
  const roomHeight = Math.min(
    ROOM_MAX_HEIGHT,
    Math.max(ROOM_MIN_HEIGHT, windowHeight - chromeHeight),
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.background}]}
      edges={['top']}>
      <ScrollView
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
        style={[styles.container, {backgroundColor: theme.background}]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <StatusHud preferences={userPreferences} />

        <CharacterStage
          mood={userMood}
          isInteracting={isInteracting}
          height={roomHeight}
          hideMessage={selectedAction !== null}>
          <ActionBar
            completedPreferences={userPreferences}
            selectedAction={selectedAction}
            onActionSelect={handleActionSelect}
            onCancel={handleCancelOptions}
          />
        </CharacterStage>

        <OptionPicker
          selectedAction={selectedAction}
          options={currentOptions}
          onOptionSelect={handleOptionSelect}
          onCancelOptions={handleCancelOptions}
        />

        <PreferencesCard preferences={userPreferences} />
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
    paddingBottom: SCREEN_BOTTOM_INSET,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 12,
    rowGap: 12,
  },
});
