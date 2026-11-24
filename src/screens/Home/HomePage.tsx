import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import CharacterStage from './components/CharacterStage';
import OptionPicker from './components/OptionPicker';
import PreferencesCard, {hasDetail} from './components/PreferencesCard';
import ActionBar from './components/ActionBar';
import LevelBar from './components/LevelBar';
import ChoiceHistorySheet from './components/ChoiceHistorySheet';
import MusicGenrePicker from './components/MusicGenrePicker';
import MailboxButton from './components/MailboxButton';
import MailboxSheet from './components/MailboxSheet';
import {useMailbox} from './hooks/useMailbox';
import type {MusicTrack} from '../../services/api/music';
import {useCharacterHome} from './hooks/useCharacterHome';
import {SCREEN_HORIZONTAL_PADDING} from '../../theme/layout';
import {useAppTheme} from '../../theme/ThemeProvider';
import type {PreferenceKey} from './types';

// 방 안에 행동 아이콘 줄·말풍선·캐릭터가 다 들어가는 최소 높이. 화면이 크면 탭바까지 늘어난다.
const ROOM_MIN_HEIGHT = 440;
// 고른 뒤 하트 효과를 보여 주고 아래 창을 연다.
const DETAIL_OPEN_DELAY = 900;

// 캐릭터 키우기 게임 느낌의 홈: 레벨 카드 → 캐릭터 방(행동 아이콘 줄 · 선택지 · 캐릭터)
export default function HomePage({onOpenChat}: {onOpenChat?: () => void}) {
  const {theme} = useAppTheme();
  const {
    userMood,
    isInteracting,
    userPreferences,
    selectedAction,
    currentOptions,
    level,
    refreshLevel,
    handleActionSelect,
    handleOptionSelect,
    handleCancelOptions,
  } = useCharacterHome();
  const [detailKey, setDetailKey] = useState<PreferenceKey | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  // 우체통: 월간 스트레스 리포트를 편지로 받는다.
  const mailbox = useMailbox();
  const [mailboxOpen, setMailboxOpen] = useState(false);
  // 채팅 탭에서 돌아오면 채팅 경험치가 붙었을 수 있어 레벨을 다시 받는다.
  useFocusEffect(refreshLevel);
  // 홈에서 앨범 자켓을 눌러 고른 곡. 추천곡 창에서 그 곡이 골라진 채로 열린다.
  const [musicVideoId, setMusicVideoId] = useState<string | null>(null);
  // 선택지는 방 안(아이콘 줄 바로 아래)에 펼친다. 음악은 앨범 자켓, 나머지는 작은 버튼.
  const isMusicOpen = selectedAction === 'music';
  const [pickerTop, setPickerTop] = useState(0);

  // 밥주기·음악은 고르자마자 배달앱·추천곡 창을 연다.
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
    // 창을 닫으면 고른 곡 표시를 지운다.
    if (key === null) setMusicVideoId(null);
    setDetailKey(key);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.background}]}
      edges={['top']}>
      {mailboxOpen ? (
        <MailboxSheet
          visible
          onClose={() => setMailboxOpen(false)}
          letters={mailbox.letters}
          draft={mailbox.draft}
          nextDelivery={mailbox.nextDelivery}
          loaded={mailbox.loaded}
          onRead={mailbox.markRead}
        />
      ) : (
      <ScrollView
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
        style={[styles.container, {backgroundColor: theme.background}]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LevelBar
          level={level?.level ?? 1}
          exp={level?.exp ?? 0}
          maxExp={level?.maxExp ?? 100}
          onPressBadge={() => setHistoryOpen(true)}
        />
        <ChoiceHistorySheet
          visible={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        <CharacterStage
          mood={userMood}
          isInteracting={isInteracting}
          minHeight={ROOM_MIN_HEIGHT}
          hideMessage={selectedAction !== null}
          onPressMessage={onOpenChat}
          corner={<MailboxButton hasUnread={mailbox.hasUnread} onPress={() => setMailboxOpen(true)} />}>
          <View onLayout={event => {
            const {y, height} = event.nativeEvent.layout;
            setPickerTop(y + height);
          }}>
            <ActionBar
              completedPreferences={userPreferences}
              selectedAction={selectedAction}
              onActionSelect={handleActionSelect}
              onCancel={handleCancelOptions}
            />
          </View>
          {/* 선택지(앨범 자켓 포함)는 아이콘 줄 아래에 떠 있게 해서, 열려도 캐릭터가 밀려 내려가지 않는다. */}
          <View style={[styles.picker, {top: pickerTop}]} pointerEvents="box-none">
            {isMusicOpen ? (
              <MusicGenrePicker options={currentOptions} onSelect={selectMusic} />
            ) : (
              <OptionPicker
                selectedAction={selectedAction}
                options={currentOptions}
                onOptionSelect={selectOption}
              />
            )}
          </View>
        </CharacterStage>
      </ScrollView>
      )}
      {/* 아래에서 올라오는 창(Modal)이라 스크롤 영역 밖에 둔다. 안에 두면 방과 탭바 사이에 틈이 생긴다. */}
      <PreferencesCard
        preferences={userPreferences}
        detailKey={detailKey}
        onDetailKeyChange={changeDetailKey}
        musicVideoId={musicVideoId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  picker: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 3,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // 캐릭터 방이 탭바 바로 위까지 차도록 아래 여백 없이 늘린다.
  content: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 12,
    rowGap: 12,
  },
});
