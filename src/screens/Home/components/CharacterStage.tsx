import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import {SCREEN_HORIZONTAL_PADDING} from '../../../theme/layout';
import {useAppTheme} from '../../../theme/ThemeProvider';
import type {WiltReason} from '../hooks/useWilt';
import type {MoodType} from '../types';
import CharacterMessage from './CharacterMessage';
import CharacterPet from './CharacterPet';
import RoomDecor from './RoomDecor';

interface CharacterStageProps {
  mood: MoodType;
  isInteracting: boolean;
  // 캐릭터가 시든 까닭(없으면 null). 시들면 말풍선도 걱정하는 말로 바뀐다.
  worry?: WiltReason | null;
  minHeight: number;
  // 선택지가 열려 방이 작아지면 말풍선이 아이콘 줄을 덮어서 숨긴다.
  hideMessage?: boolean;
  // 말풍선을 누르면 (채팅 탭으로)
  onPressMessage?: () => void;
  // 방 위쪽에 놓을 것(행동 아이콘 줄)
  children?: React.ReactNode;
  // 방 오른쪽 아래 구석에 놓을 것(우체통)
  corner?: React.ReactNode;
}

// 방 색(벽·캐릭터 그림자). 벽지·창문·바닥 등 꾸밈은 RoomDecor가 그린다.
const ROOM = {
  light: {wall: '#F8FBF5', shadow: '#E8D88E'},
  dark: {wall: '#252722', shadow: '#1E201B'},
};

// 돌봐 주면 떠오르는 하트 (가로 위치, 늦게 출발하는 정도)
const HEARTS = [
  {left: -46, delay: 0},
  {left: 4, delay: 120},
  {left: 50, delay: 240},
];

// 캐릭터가 사는 방: 위쪽 행동 아이콘 줄, 벽·바닥, 말풍선, 캐릭터, 하트 효과
export default function CharacterStage({
  mood,
  isInteracting,
  worry = null,
  minHeight,
  hideMessage = false,
  onPressMessage,
  children,
  corner,
}: CharacterStageProps) {
  const {theme} = useAppTheme();
  const room = ROOM[theme.mode];
  const heartAnims = useRef(HEARTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isInteracting) return;

    heartAnims.forEach(anim => anim.setValue(0));
    Animated.stagger(
      HEARTS[1].delay,
      heartAnims.map(anim =>
        Animated.timing(anim, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [heartAnims, isInteracting]);

  return (
    <View style={[styles.room, {backgroundColor: room.wall, minHeight}]}>
      <RoomDecor mode={theme.mode} />

      {children}

      <View style={styles.content}>
        {!hideMessage && <CharacterMessage userMood={mood} worry={worry} onPress={onPressMessage} />}

        <View style={styles.characterArea}>
          {HEARTS.map(({left}, index) => (
            <Animated.Text
              key={left}
              pointerEvents="none"
              style={[
                styles.heart,
                {
                  marginLeft: left,
                  opacity: heartAnims[index].interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: heartAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -70],
                      }),
                    },
                    {
                      scale: heartAnims[index].interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: [0.4, 1.1, 0.9],
                      }),
                    },
                  ],
                },
              ]}>
              💗
            </Animated.Text>
          ))}
          <View style={[styles.groundShadow, {backgroundColor: room.shadow}]} />
          <CharacterPet isInteracting={isInteracting} wilted={worry !== null} />
        </View>
      </View>

      {corner && <View style={styles.corner}>{corner}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  // 둥근 카드 테두리 없이 화면 가로 끝까지 채운다(홈 화면 좌우 여백만큼 바깥으로).
  room: {
    flexGrow: 1,
    marginHorizontal: -SCREEN_HORIZONTAL_PADDING,
    overflow: 'hidden',
    paddingTop: 16,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    // 캐릭터(와 말풍선)를 바닥에서 띄우는 정도
    paddingBottom: 66,
  },
  characterArea: {
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  groundShadow: {
    borderRadius: 50,
    bottom: 2,
    height: 16,
    opacity: 0.7,
    position: 'absolute',
    width: 136,
  },
  // 우체통: 바닥 위, 캐릭터 오른쪽
  corner: {
    bottom: 56,
    position: 'absolute',
    right: 14,
    zIndex: 2,
  },
  heart: {
    fontSize: 22,
    left: '50%',
    position: 'absolute',
    top: 30,
    zIndex: 2,
  },
});
