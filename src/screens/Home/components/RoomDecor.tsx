import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
} from 'react-native-svg';

import type {ThemeMode} from '../../../theme/ThemeProvider';

// 새싹 토끼의 방: 벽지 · 창문 · 선반 · 나무 바닥 · 러그 · 화분. 캐릭터 뒤에 깔리는 그림이다.
// 방 크기에 맞춰 그리고, 다크 모드에서는 밤 방으로 바꾼다.

const PALETTE = {
  light: {
    wall: '#F8FBF5',
    dot: '#EBF3E5',
    wainscot: '#EEF5E8',
    trim: '#D9E7CF',
    floor: '#EBDCC6',
    plank: '#DECAAE',
    baseboard: '#D6C1A3',
    rug: '#CFE6B8',
    rugInner: '#DDEFCB',
    rugStripe: '#BEDCA3',
    frame: '#FFFFFF',
    frameLine: '#D6E2CD',
    skyTop: '#CFE8FA',
    skyBottom: '#EAF6FD',
    sun: '#FFE59A',
    cloud: '#FFFFFF',
    curtain: '#F6D3DE',
    curtainFold: '#EDBFCD',
    shelf: '#D8BE98',
    shelfEdge: '#C7A87D',
    pot: '#E8A88A',
    potRim: '#D99375',
    leaf: '#A9D58A',
    leafDark: '#8CC26B',
    book1: '#F2C6D3',
    book2: '#BFDDF0',
    book3: '#F6E2A6',
  },
  dark: {
    wall: '#252722',
    dot: '#2C2F29',
    wainscot: '#2A2D27',
    trim: '#363A32',
    floor: '#3A332B',
    plank: '#332D26',
    baseboard: '#2E2822',
    rug: '#34412C',
    rugInner: '#3B4932',
    rugStripe: '#2F3A28',
    frame: '#3A3D36',
    frameLine: '#45493F',
    skyTop: '#1B2536',
    skyBottom: '#2A3850',
    sun: '#F4E7B5', // 밤에는 달
    cloud: '#3A465A',
    curtain: '#4D3B42',
    curtainFold: '#43333A',
    shelf: '#4A3F33',
    shelfEdge: '#3E342A',
    pot: '#8A5A47',
    potRim: '#7A4D3C',
    leaf: '#5E8A4A',
    leafDark: '#4E7740',
    book1: '#6E4F5A',
    book2: '#465E70',
    book3: '#6E6448',
  },
};

// 잎 하나 (밑동 x,y에서 위로, 기울기 angle도)
const leafPath = (x: number, y: number, length: number, width: number) =>
  `M ${x} ${y} C ${x - width} ${y - length * 0.45}, ${x - width * 0.4} ${y - length}, ${x} ${y - length} ` +
  `C ${x + width * 0.4} ${y - length}, ${x + width} ${y - length * 0.45}, ${x} ${y} Z`;

function Sprout({x, y, size, colors}: {x: number; y: number; size: number; colors: typeof PALETTE.light}) {
  return (
    <G>
      <Path d={leafPath(x, y, size, size * 0.55)} fill={colors.leaf} transform={`rotate(-35 ${x} ${y})`} />
      <Path d={leafPath(x, y, size, size * 0.55)} fill={colors.leafDark} transform={`rotate(35 ${x} ${y})`} />
    </G>
  );
}

function Pot({x, bottom, width, colors}: {x: number; bottom: number; width: number; colors: typeof PALETTE.light}) {
  const h = width * 0.85;
  const top = bottom - h;
  return (
    <G>
      <Path
        d={`M ${x - width / 2} ${top} L ${x + width / 2} ${top} L ${x + width * 0.36} ${bottom} L ${x - width * 0.36} ${bottom} Z`}
        fill={colors.pot}
      />
      <Rect x={x - width * 0.56} y={top - width * 0.16} width={width * 1.12} height={width * 0.22} rx={width * 0.08} fill={colors.potRim} />
    </G>
  );
}

export default function RoomDecor({mode, floorRatio = 0.28}: {mode: ThemeMode; floorRatio?: number}) {
  const [size, setSize] = useState<{w: number; h: number} | null>(null);
  const c = PALETTE[mode];

  const render = () => {
    if (!size) return null;
    const {w, h} = size;
    const floorTop = h * (1 - floorRatio);
    const wainscotTop = floorTop - Math.min(70, h * 0.1);

    // 창문: 왼쪽 벽, 아이콘 줄 아래 · 말풍선 위
    const win = {x: w * 0.08, y: h * 0.2, w: Math.min(96, w * 0.26), h: Math.min(104, h * 0.15)};
    // 선반: 오른쪽 벽, 말풍선 위
    const shelf = {x: w * 0.66, y: h * 0.34, w: Math.min(104, w * 0.27)};
    // 러그: 캐릭터 발밑
    const rug = {cx: w / 2, cy: h - 42, rx: Math.min(150, w * 0.4), ry: 26};

    return (
      <Svg width={w} height={h}>
        <Defs>
          <Pattern id="wallDots" width="34" height="34" patternUnits="userSpaceOnUse">
            <Circle cx="8" cy="8" r="2" fill={c.dot} />
            <Circle cx="25" cy="25" r="2" fill={c.dot} />
          </Pattern>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.skyTop} />
            <Stop offset="1" stopColor={c.skyBottom} />
          </LinearGradient>
        </Defs>

        {/* 벽 + 벽지 점무늬 */}
        <Rect x={0} y={0} width={w} height={floorTop} fill={c.wall} />
        <Rect x={0} y={0} width={w} height={wainscotTop} fill="url(#wallDots)" />
        {/* 아래쪽 판넬과 몰딩 */}
        <Rect x={0} y={wainscotTop} width={w} height={floorTop - wainscotTop} fill={c.wainscot} />
        <Rect x={0} y={wainscotTop - 3} width={w} height={5} fill={c.trim} />

        {/* 창문 */}
        <Rect x={win.x - 6} y={win.y - 6} width={win.w + 12} height={win.h + 12} rx={14} fill={c.frame} stroke={c.frameLine} strokeWidth={1.5} />
        <Rect x={win.x} y={win.y} width={win.w} height={win.h} rx={9} fill="url(#sky)" />
        <Circle cx={win.x + win.w * 0.72} cy={win.y + win.h * 0.28} r={win.w * 0.13} fill={c.sun} />
        {mode === 'dark' && (
          <Circle cx={win.x + win.w * 0.78} cy={win.y + win.h * 0.24} r={win.w * 0.11} fill={c.skyTop} />
        )}
        <G>
          <Ellipse cx={win.x + win.w * 0.32} cy={win.y + win.h * 0.62} rx={win.w * 0.18} ry={win.h * 0.08} fill={c.cloud} />
          <Ellipse cx={win.x + win.w * 0.44} cy={win.y + win.h * 0.56} rx={win.w * 0.13} ry={win.h * 0.09} fill={c.cloud} />
        </G>
        <Line x1={win.x + win.w / 2} y1={win.y} x2={win.x + win.w / 2} y2={win.y + win.h} stroke={c.frame} strokeWidth={5} />
        <Line x1={win.x} y1={win.y + win.h / 2} x2={win.x + win.w} y2={win.y + win.h / 2} stroke={c.frame} strokeWidth={5} />
        {/* 커튼 */}
        <Rect x={win.x - 14} y={win.y - 14} width={win.w + 28} height={8} rx={4} fill={c.shelfEdge} />
        <Path d={`M ${win.x - 12} ${win.y - 8} Q ${win.x + 10} ${win.y + win.h * 0.5} ${win.x - 4} ${win.y + win.h + 14} L ${win.x - 18} ${win.y + win.h + 14} Z`} fill={c.curtain} />
        <Path d={`M ${win.x + win.w + 12} ${win.y - 8} Q ${win.x + win.w - 10} ${win.y + win.h * 0.5} ${win.x + win.w + 4} ${win.y + win.h + 14} L ${win.x + win.w + 18} ${win.y + win.h + 14} Z`} fill={c.curtainFold} />

        {/* 선반 + 작은 화분 + 책 */}
        <Rect x={shelf.x} y={shelf.y} width={shelf.w} height={8} rx={3} fill={c.shelf} />
        <Rect x={shelf.x + 8} y={shelf.y + 8} width={6} height={12} fill={c.shelfEdge} />
        <Rect x={shelf.x + shelf.w - 14} y={shelf.y + 8} width={6} height={12} fill={c.shelfEdge} />
        <Sprout x={shelf.x + 22} y={shelf.y - 16} size={18} colors={c} />
        <Pot x={shelf.x + 22} bottom={shelf.y} width={20} colors={c} />
        <Rect x={shelf.x + shelf.w - 44} y={shelf.y - 30} width={10} height={30} rx={2} fill={c.book1} />
        <Rect x={shelf.x + shelf.w - 33} y={shelf.y - 26} width={10} height={26} rx={2} fill={c.book2} />
        <Rect x={shelf.x + shelf.w - 22} y={shelf.y - 22} width={10} height={22} rx={2} fill={c.book3} transform={`rotate(10 ${shelf.x + shelf.w - 17} ${shelf.y})`} />

        {/* 나무 바닥 */}
        <Rect x={0} y={floorTop} width={w} height={h - floorTop} fill={c.floor} />
        {[0.3, 0.62].map(ratio => (
          <Line key={ratio} x1={0} y1={floorTop + (h - floorTop) * ratio} x2={w} y2={floorTop + (h - floorTop) * ratio} stroke={c.plank} strokeWidth={2} />
        ))}
        {[0.18, 0.55, 0.85].map((ratio, index) => {
          const y1 = floorTop + (h - floorTop) * (index % 2 ? 0.3 : 0);
          return <Line key={ratio} x1={w * ratio} y1={y1} x2={w * ratio} y2={y1 + (h - floorTop) * 0.3} stroke={c.plank} strokeWidth={2} />;
        })}
        <Rect x={0} y={floorTop - 2} width={w} height={7} fill={c.baseboard} />

        {/* 러그 */}
        <Ellipse cx={rug.cx} cy={rug.cy} rx={rug.rx} ry={rug.ry} fill={c.rug} />
        <Ellipse cx={rug.cx} cy={rug.cy} rx={rug.rx - 14} ry={rug.ry - 7} fill={c.rugInner} stroke={c.rugStripe} strokeWidth={2} strokeDasharray="6 6" />

        {/* 바닥 큰 화분 (왼쪽 구석) */}
        <G>
          <Sprout x={w * 0.12} y={floorTop + 8} size={44} colors={c} />
          <Sprout x={w * 0.12 - 2} y={floorTop + 2} size={30} colors={c} />
          <Pot x={w * 0.12} bottom={floorTop + 44} width={40} colors={c} />
        </G>
        {/* 오른쪽 구석 작은 화분 */}
        <G>
          <Sprout x={w * 0.9} y={floorTop + 26} size={24} colors={c} />
          <Pot x={w * 0.9} bottom={floorTop + 50} width={26} colors={c} />
        </G>
      </Svg>
    );
  };

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        if (!size || size.w !== width || size.h !== height) setSize({w: width, h: height});
      }}>
      {render()}
    </View>
  );
}
