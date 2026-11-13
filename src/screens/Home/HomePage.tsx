import React, {useState} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import CharacterStage from './components/CharacterStage';
import OptionPicker from './components/OptionPicker';
import PreferencesCard, {hasDetail} from './components/PreferencesCard';
import ActionBar from './components/ActionBar';
import MusicGenrePicker from './components/MusicGenrePicker';
import type {MusicTrack} from '../../services/api/music';
import {useCharacterHome} from './hooks/useCharacterHome';
import {SCREEN_BOTTOM_INSET, SCREEN_HORIZONTAL_PADDING} from '../../theme/layout';
import {useAppTheme} from '../../theme/ThemeProvider';
import type {PreferenceKey} from './types';

// 상태바·탭바·여백이 차지하는 높이. 나머지를 캐릭터 방에 준다.
const HOME_CHROME_HEIGHT = 160;
// 오늘 고른 칩 한 줄 높이. 칩이 있으면 방을 그만큼 줄여 칩이 화면 안에 보이게 한다.
const CHIPS_HEIGHT = 50;
// 방 안에 행동 아이콘 줄·말풍선·캐릭터가 다 들어가는 높이
const ROOM_MIN_HEIGHT = 440;
const ROOM_MAX_HEIGHT = 720;
// 고른 뒤 하트 효과를 보여 주고 아래 창을 연다.
const DETAIL_OPEN_DELAY = 900;

// 캐릭터 키우기 게임 느낌의 홈: 캐릭터 방(위쪽 행동 아이콘 줄) → 선택지 → 오늘 고른 것
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
  const [detailKey, setDetailKey] = useState<PreferenceKey | null>(null);
  // 홈에서 앨범 자켓을 눌러 고른 곡. 추천곡 창에서 그 곡이 골라진 채로 열린다.
  const [musicVideoId, setMusicVideoId] = useState<string | null>(null);
  // 선택지는 방 안(아이콘 줄 바로 아래)에 펼친다. 음악은 앨범 자켓, 나머지는 작은 버튼.
  const isMusicOpen = selectedAction === 'music';

  // 먹이·음악은 칩이 방 아래(스크롤 밖)에 생겨서, 고르자마자 배달앱·추천곡 창을 바로 연다.
  const selectOption = (choice: string) => {
    const action = selectedAction;
    handleOptionSelect(choice);
    if (action && hasDetail(action)) {
      setTimeout(() => setDetailKey(action), DETAIL_OPEN_DELAY);
    }
  };
  const selectMusic = (choice: string, track: MusicTrack | null) => {
    setMusicVideoId(track?.videoId ?? null);
    selectOption(choice);
  };
  const changeDetailKey = (key: PreferenceKey | null) => {
    // 칩을 눌러 다시 열면 처음 상태(곡 안 고름)로 연다.
    if (key === null) setMusicVideoId(null);
    setDetailKey(key);
  };
  const hasChips = Object.values(userPreferences).some(Boolean);
  const chromeHeight = HOME_CHROME_HEIGHT + (hasChips ? CHIPS_HEIGHT : 0);
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
          {isMusicOpen ? (
            <MusicGenrePicker options={currentOptions} onSelect={selectMusic} />
          ) : (
            <OptionPicker
              selectedAction={selectedAction}
              options={currentOptions}
              onOptionSelect={selectOption}
            />
          )}
        </CharacterStage>

        <PreferencesCard
          preferences={userPreferences}
          detailKey={detailKey}
          onDetailKeyChange={changeDetailKey}
          musicVideoId={musicVideoId}
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
    paddingBottom: SCREEN_BOTTOM_INSET,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 12,
    rowGap: 12,
  },
});
