import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

import {useAppTheme} from '../../../theme/ThemeProvider';
import type {MoodType} from '../types';
import CharacterMessage from './CharacterMessage';
import CharacterPet from './CharacterPet';

interface CharacterStageProps {
  mood: MoodType;
  isInteracting: boolean;
  height: number;
  // 선택지가 열려 방이 작아지면 말풍선이 아이콘 줄을 덮어서 숨긴다.
  hideMessage?: boolean;
  // 방 위쪽에 놓을 것(행동 아이콘 줄)
  children?: React.ReactNode;
}

// 방 색. 다크 모드에서는 어둡게 바꾼다.
const ROOM = {
  light: {wall: '#F8FBF5', floor: '#DCEBD2', shadow: '#C3D8B6'},
  dark: {wall: '#252722', floor: '#30332D', shadow: '#1E201B'},
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
  height,
  hideMessage = false,
  children,
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
    <View style={[styles.room, {backgroundColor: room.wall, height}]}>
      <View style={[styles.floor, {backgroundColor: room.floor}]} />

      {children}

      <View style={styles.content}>
        {!hideMessage && <CharacterMessage userMood={mood} />}

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
          <CharacterPet mood={mood} isInteracting={isInteracting} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  room: {
    borderRadius: 26,
    overflow: 'hidden',
    paddingTop: 16,
  },
  floor: {
    bottom: 0,
    height: '28%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 18,
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
    width: 120,
  },
  heart: {
    fontSize: 22,
    left: '50%',
    position: 'absolute',
    top: 30,
    zIndex: 2,
  },
});
