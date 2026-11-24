import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {format, parseISO} from 'date-fns';

import Text from '../../../components/AppText';
import {usePersonalize} from '../../../context/CharacterNameProvider';
import type {MonthlyReportData} from '../../../services/api/reports';
import {supabase} from '../../../services/supabase';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {getStressLevel} from '../constants/reportData';

// 우체통 편지 맨 위: 캐릭터가 쓴 편지글. 월간 리포트 숫자를 캐릭터 말투 문장으로 풀어 쓴다.
// 글 속 '뿡뿡이'는 사용자가 정한 캐릭터 이름으로 바뀐다(usePersonalize).

const characterFace = require('../../../assets/images/character/frame2.png');

// 스트레스 단계 → 마음 날씨
const WEATHER: Record<string, string> = {
  편안함: '맑음',
  낮음: '구름 조금',
  보통: '흐림',
  높음: '비',
};

// 편지지 색 (방 그림처럼 따뜻한 크림색, 다크 모드는 어두운 종이)
const PAPER = {
  light: {paper: '#FFFBF2', line: '#F1E6D2', ink: '#4A3F35', stamp: '#F6D3DE'},
  dark: {paper: '#2C2A25', line: '#3A3730', ink: '#EDE6DA', stamp: '#4D3B42'},
};

const round1 = (value: number) => Math.round(value * 10) / 10;

function buildParagraphs(report: MonthlyReportData, month: number, inProgress: boolean) {
  const lines: string[] = [];

  lines.push(inProgress
    ? `${month}월이 아직 다 지나진 않았지만, 지금까지 지켜본 이야기를 먼저 살짝 전해 줄게.`
    : `${month}월 한 달도 정말 수고 많았어. 한 달 동안 지켜본 이야기를 편지로 전해 줄게.`);

  if (report.averageStressScore !== null) {
    const level = getStressLevel(report.averageStressScore);
    let text = `이번 달 너의 마음 날씨는 대체로 '${WEATHER[level.label] ?? level.label}'이었어 (평균 ${report.averageStressScore}점).`;
    if (report.previousAverageStressScore !== null) {
      const diff = round1(report.averageStressScore - report.previousAverageStressScore);
      if (diff <= -1) text += ` 지난달보다 ${-diff}점 낮아져서 정말 다행이야.`;
      else if (diff >= 1) text += ` 지난달보다 ${diff}점 높아져서 조금 걱정됐어.`;
      else text += ' 지난달이랑 비슷하게 지나갔어.';
    }
    lines.push(text);
  }

  if (report.highStressDays > 0) {
    let text = `스트레스가 높았던 날은 ${report.highStressDays}일이었어.`;
    if (report.peakDay) {
      text += ` 그중에서도 ${format(parseISO(report.peakDay.date), 'M월 d일')}이 제일 힘들어 보였는데, 그날은 괜찮았어?`;
    }
    lines.push(text);
  } else if (report.dayCount > 0) {
    lines.push('스트레스가 크게 높은 날 없이 지나가서 나도 기뻤어.');
  }

  if (report.topCause) {
    lines.push(`'${report.topCause}' 이야기를 한 날엔 마음이 특히 무거워 보였어. 아래에 내가 본 걸 정리해 뒀어.`);
  }

  if (report.averageSleepMinutes !== null) {
    const hours = round1(report.averageSleepMinutes / 60);
    lines.push(hours < 7
      ? `잠은 하루 평균 ${hours}시간 잤더라. 다음 달엔 조금만 더 푹 자 보자.`
      : `잠은 하루 평균 ${hours}시간, 잘 챙겨 자 줘서 고마워.`);
  }

  lines.push(inProgress
    ? '남은 날들도 내가 옆에서 같이 기록할게. 다 쓰면 다시 보내 줄게!'
    : '다음 달에도 내가 옆에 있을게. 힘든 일 있으면 언제든 나한테 말해 줘!');

  return lines;
}

export default function LetterNote({report, month, inProgress}: {
  report: MonthlyReportData;
  month: number;
  inProgress: boolean;
}) {
  const {theme} = useAppTheme();
  const p = usePersonalize();
  const c = PAPER[theme.mode];
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser()
      .then(({data}) => {
        const name = data.user?.user_metadata?.nownow_chat_name;
        if (active && typeof name === 'string' && name.trim()) setNickname(name.trim());
      })
      .catch(() => {});
    return () => {active = false;};
  }, []);

  const paragraphs = buildParagraphs(report, month, inProgress);

  return (
    <View style={[styles.paper, {backgroundColor: c.paper, borderColor: c.line}]}>
      {/* 오른쪽 위 우표 */}
      <View style={[styles.stamp, {backgroundColor: c.stamp, borderColor: c.paper}]}>
        <Image source={characterFace} resizeMode="contain" style={styles.stampImage} />
      </View>

      <Text style={[styles.to, {color: c.ink}]}>To. {nickname ?? '소중한 친구'}에게</Text>

      {/* 문단을 나누지 않고 한 편지글로 이어 쓴다. */}
      <Text style={[styles.body, {color: c.ink}]}>{p(paragraphs.join(' '))}</Text>

      <Text style={[styles.from, {color: theme.accentStrong}]}>{p('From. 너의 뿡뿡이가')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {borderRadius: 18, borderWidth: 1, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 22},
  stamp: {
    alignItems: 'center',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    top: 16,
    transform: [{rotate: '6deg'}],
    width: 50,
  },
  stampImage: {height: 46, width: 40},
  // 본문 첫 줄이 우표에 가리지 않게 아래 여백을 넉넉히
  to: {fontSize: 18, fontWeight: '800', marginBottom: 30, marginRight: 64},
  body: {fontSize: 15, lineHeight: 26},
  from: {fontSize: 16, fontWeight: '800', marginTop: 16, textAlign: 'right'},
});
