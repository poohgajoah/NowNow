import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet} from 'react-native';


interface CharacterPetProps {
  isInteracting: boolean;
  // 시드는 동작: true가 되면 잎이 시들며 풀이 죽고(마지막 모습 유지), false로 돌아오면 거꾸로 일어나 웃는다.
  // 언제 시드는지는 홈의 useWilt가 정한다.
  wilted?: boolean;
}

// 캐릭터 그림. 팀원이 준 움직이는 GIF(각 8프레임)를 프레임별 PNG로 나눠 둔 것.
// 안드로이드 RN은 GIF 재생에 추가 설정이 필요해서 프레임을 직접 넘긴다.
// 모든 프레임은 같은 크기(321x470)로, 캐릭터 가운데·발끝이 같은 자리에 오게 맞춰 두었다.
// smile: 0은 평소 모습, 1~7은 선택지를 골랐을 때 한 번 재생하는 웃는 동작(1→7 후 0으로 복귀).
const smileFrames = [
  require('../../../assets/images/character/frame0.png'),
  require('../../../assets/images/character/frame1.png'),
  require('../../../assets/images/character/frame2.png'),
  require('../../../assets/images/character/frame3.png'),
  require('../../../assets/images/character/frame4.png'),
  require('../../../assets/images/character/frame5.png'),
  require('../../../assets/images/character/frame6.png'),
  require('../../../assets/images/character/frame7.png'),
];
// wilt: 0은 평소 모습과 같고, 7로 갈수록 잎이 시들고 고개를 숙인다.
const wiltFrames = [
  require('../../../assets/images/character/wilt/frame0.png'),
  require('../../../assets/images/character/wilt/frame1.png'),
  require('../../../assets/images/character/wilt/frame2.png'),
  require('../../../assets/images/character/wilt/frame3.png'),
  require('../../../assets/images/character/wilt/frame4.png'),
  require('../../../assets/images/character/wilt/frame5.png'),
  require('../../../assets/images/character/wilt/frame6.png'),
  require('../../../assets/images/character/wilt/frame7.png'),
];
// 겹쳐 그릴 전체 프레임. 시드는 동작은 WILT_START부터.
const characterFrames = [...smileFrames, ...wiltFrames];
const WILT_START = smileFrames.length;
const SMILE_FRAME_DURATION = 300; // 원본 GIF와 같은 속도
const WILT_FRAME_DURATION = 350;

// [프레임, 보여 줄 시간] 목록을 차례로 보여 준다. 정리 함수를 돌려준다.
type Step = [frame: number, duration: number];
const playSteps = (steps: Step[], setFrame: (frame: number) => void) => {
  let at = 0;
  const timers = steps.map(([frame, duration]) => {
    const timer = setTimeout(() => setFrame(frame), at);
    at += duration;
    return timer;
  });
  return () => timers.forEach(clearTimeout);
};
const steps = (frames: number[], duration: number): Step[] => frames.map(frame => [frame, duration]);
const WILT_ORDER = Array.from({length: wiltFrames.length}, (_, i) => WILT_START + i);
const SMILE_ORDER = [1, 2, 3, 4, 5, 6, 7, 0];

const IDLE_DURATION = 1400;

export default function CharacterPet({isInteracting, wilted = false}: CharacterPetProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const bounceDirectionRef = useRef(-1);
  // 가만히 있을 때도 숨 쉬듯 살짝 커졌다 작아진다.
  const idleAnim = useRef(new Animated.Value(0)).current;
  const [frame, setFrame] = useState(0);
  const wasWilted = useRef(false);
  // 살아나는 중(거꾸로 재생 + 웃기)에는 따로 웃는 동작을 시작하지 않는다.
  const reviving = useRef(false);

  // 시들기: 켜지면 0→7 재생 후 마지막 모습 유지.
  // 꺼지면(돌봐 주면) 7→0 거꾸로 일어난 뒤 한 번 웃는다.
  useEffect(() => {
    if (wilted === wasWilted.current) return;
    wasWilted.current = wilted;
    if (wilted) return playSteps(steps(WILT_ORDER, WILT_FRAME_DURATION), setFrame);
    reviving.current = true;
    const revive = [...WILT_ORDER].reverse();
    const stop = playSteps([
      ...steps(revive, WILT_FRAME_DURATION),
      ...steps(SMILE_ORDER, SMILE_FRAME_DURATION),
    ], setFrame);
    const done = setTimeout(() => {reviving.current = false;},
      revive.length * WILT_FRAME_DURATION + SMILE_ORDER.length * SMILE_FRAME_DURATION);
    return () => {
      stop();
      clearTimeout(done);
      reviving.current = false;
    };
  }, [wilted]);

  // 선택지를 고르면 웃는 동작을 한 번 재생하고 기본 모습으로 돌아온다. 시든 동안·살아나는 중에는 따로 웃지 않는다.
  useEffect(() => {
    if (!isInteracting || wasWilted.current || reviving.current) return;
    return playSteps(steps(SMILE_ORDER, SMILE_FRAME_DURATION), setFrame);
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
    height: 315,
    justifyContent: 'flex-end',
    width: '100%',
  },
  character: {
    // 프레임은 모든 동작이 들어가는 같은 영역(321x470)으로 잘라 두었다: 가로 가운데 = 캐릭터 가운데, 아래 끝 = 발끝
    // 비율 321:470 유지
    height: 304,
    width: 208,
  },
  // absoluteFill(위·아래·좌·우 0)만 주면 안드로이드에서 그림이 원본 크기로 나와서 너비·높이를 직접 준다.
  frame: {height: '100%', left: 0, position: 'absolute', top: 0, width: '100%'},
  hidden: {opacity: 0},
});
