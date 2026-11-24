import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';


interface CharacterPetProps {
  isInteracting: boolean;
}

// 캐릭터 그림. 팀원이 준 움직이는 GIF(8프레임)를 프레임별 PNG로 나눠 둔 것.
// frame0: 평소 모습. frame1~7: 선택지를 골랐을 때 한 번 재생하는 웃는 동작(1→7 후 0으로 복귀).
// 안드로이드 RN은 GIF 재생에 추가 설정이 필요해서 프레임을 직접 넘긴다.
const characterFrames = [
  require('../../../assets/images/character/frame0.png'),
  require('../../../assets/images/character/frame1.png'),
  require('../../../assets/images/character/frame2.png'),
  require('../../../assets/images/character/frame3.png'),
  require('../../../assets/images/character/frame4.png'),
  require('../../../assets/images/character/frame5.png'),
  require('../../../assets/images/character/frame6.png'),
  require('../../../assets/images/character/frame7.png'),
];
const FRAME_DURATION = 300; // 원본 GIF와 같은 속도

const IDLE_DURATION = 1400;

export default function CharacterPet({isInteracting}: CharacterPetProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const bounceDirectionRef = useRef(-1);
  // 가만히 있을 때도 숨 쉬듯 살짝 커졌다 작아진다.
  const idleAnim = useRef(new Animated.Value(0)).current;
  const [frame, setFrame] = useState(0);

  // 선택지를 고르면 웃는 동작을 한 번 재생하고 기본 모습으로 돌아온다.
  useEffect(() => {
    if (!isInteracting) return;
    const timers = characterFrames.map((_, i) =>
      setTimeout(
        () => setFrame((i + 1) % characterFrames.length),
        i * FRAME_DURATION,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [isInteracting]);

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(idleAnim, {
          duration: IDLE_DURATION,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(idleAnim, {
          duration: IDLE_DURATION,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    breathing.start();
    return () => breathing.stop();
  }, [idleAnim]);

  useEffect(() => {
    if (!isInteracting) {
      return;
    }

    bounceDirectionRef.current *= -1;
    bounceAnim.setValue(0);

    Animated.sequence([
      Animated.timing(bounceAnim, {
        duration: 130,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        duration: 130,
        toValue: -0.45,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        friction: 4,
        tension: 120,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim, isInteracting]);

  const translateY = bounceAnim.interpolate({
    inputRange: [-0.45, 0, 1],
    outputRange: [3, 0, -13],
  });

  const scale = bounceAnim.interpolate({
    inputRange: [-0.45, 0, 1],
    outputRange: [0.98, 1, 1.08],
  });

  const direction = bounceDirectionRef.current;

  const translateX = bounceAnim.interpolate({
    inputRange: [-0.45, 0, 1],
    outputRange: [-3 * direction, 0, 9 * direction],
  });

  const rotate = bounceAnim.interpolate({
    inputRange: [-0.45, 0, 1],
    outputRange:
      direction > 0 ? ['-3deg', '0deg', '5deg'] : ['3deg', '0deg', '-5deg'],
  });

  return (
    <Animated.View
      style={[
        styles.stage,
        {
          transform: [
            {
              scaleY: idleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.035],
              }),
            },
            {
              translateY: idleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -3],
              }),
            },
          ],
        },
      ]}>
      <Animated.View
        style={[
          styles.character,
          {
            transform: [{translateX}, {translateY}, {scale}, {rotate}],
          },
        ]}>
        {/* 프레임을 모두 겹쳐 두고 현재 것만 보여 줘야 바꿀 때 깜빡이지 않는다. */}
        {characterFrames.map((source, i) => (
          <Animated.Image
            key={i}
            source={source}
            resizeMode="contain"
            fadeDuration={0}
            style={[styles.frame, i !== frame && styles.hidden]}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    height: 215,
    justifyContent: 'flex-end',
    width: '100%',
  },
  character: {
    // 프레임은 모든 동작이 들어가는 같은 영역(321x470)으로 잘라 두었다: 가로 가운데 = 캐릭터 가운데, 아래 끝 = 발끝
    height: 205,
    width: 140,
  },
  // absoluteFill(위·아래·좌·우 0)만 주면 안드로이드에서 그림이 원본 크기로 나와서 너비·높이를 직접 준다.
  frame: {height: '100%', left: 0, position: 'absolute', top: 0, width: '100%'},
  hidden: {opacity: 0},
});
