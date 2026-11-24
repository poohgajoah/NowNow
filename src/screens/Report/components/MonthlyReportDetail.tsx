import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, BackHandler, StyleSheet, View} from 'react-native';
import Text from '../../../components/AppText';

import {format, getDay, parseISO} from 'date-fns';

import {useAppTheme} from '../../../theme/ThemeProvider';
import {getStressLevel, stressLevels} from '../constants/reportData';
import {getMonthlyReport, type MonthlyReportData} from '../../../services/api/reports';
import {createMockMonthlyReport} from '../constants/monthlyReportMock';
import type {DailyStress} from '../types';
import CardHeader from './CardHeader';
import DetailHeader from './DetailHeader';
import HealthCard from './HealthCard';
import ReportCard from './ReportCard';
import KeywordDonut from './KeywordDonut';

// UI 확인용: true 면 서버 대신 목업 데이터로 월간 리포트를 그린다.
const USE_MONTHLY_MOCK = false;
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export interface Month {
  key: string; // YYYY-MM
  label: string;
}

const hours = (minutes: number | null) => (minutes === null ? '-' : String(Math.round((minutes / 60) * 10) / 10));
const count = (value: number | null) => (value === null ? '-' : Math.round(value).toLocaleString());

// 일간 탭의 건강 카드와 같은 모양으로 한 달 요약을 2x2로 보여준다.
function MonthlySummary({report}: {report: MonthlyReportData}) {
  const level = report.averageStressScore === null ? null : getStressLevel(report.averageStressScore);
  const diff = report.averageStressScore !== null && report.previousAverageStressScore !== null
    ? Math.round((report.averageStressScore - report.previousAverageStressScore) * 10) / 10
    : null;
  const diffText = diff === null ? null
    : diff > 0 ? `지난달보다 ${diff}점 ↑` : diff < 0 ? `지난달보다 ${-diff}점 ↓` : '지난달과 같음';

  return (
    <>
      <View style={styles.grid}>
        <HealthCard
          title="평균 스트레스"
          value={report.averageStressScore === null ? '-' : String(report.averageStressScore)}
          unit={report.averageStressScore === null ? undefined : '점'}
          caption={diffText ?? level?.label}
        />
        <HealthCard
          title="스트레스 높은 날"
          value={String(report.highStressDays)}
          unit="일"
          caption={`기록한 ${report.dayCount}일 중`}
        />
      </View>
      <View style={styles.grid}>
        <HealthCard
          title="평균 수면"
          value={hours(report.averageSleepMinutes)}
          unit={report.averageSleepMinutes === null ? undefined : '시간'}
        />
        <HealthCard
          title="평균 걸음수"
          value={count(report.averageSteps)}
          unit={report.averageSteps === null ? undefined : '걸음'}
        />
      </View>
    </>
  );
}

// 달력: 날마다 스트레스 단계 색으로 숫자를 쓰고, 원인 키워드를 고르면 그날을 진하게 채운다.
// 따로 카드를 만들지 않고 원인 분석 카드 안에 들어간다.
function StressCalendar({report, highlighted}: {report: MonthlyReportData; highlighted: Set<string>}) {
  const {theme} = useAppTheme();
  const byDate = new Map(report.days.map(day => [day.date, day]));
  const first = parseISO(`${report.month}-01`);
  const lead = (getDay(first) + 6) % 7; // 월요일 시작
  const lastDate = Number(report.days[report.days.length - 1]?.date.slice(8, 10) ?? 0);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({length: cells.length / 7}, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <View>

      {/* 한 줄에 7칸을 직접 묶는다(퍼센트 너비는 반올림 때문에 6칸에서 줄이 넘어갔다). */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map(label => (
          <Text key={label} style={[styles.weekday, {color: theme.textMuted}]}>{label}</Text>
        ))}
      </View>
      {weeks.map((week, row) => (
        <View key={`week-${row}`} style={styles.weekRow}>
          {week.map((dayNumber, col) => {
            if (dayNumber === null) return <View key={`empty-${row}-${col}`} style={styles.cell} />;
            const date = `${report.month}-${String(dayNumber).padStart(2, '0')}`;
            const score = byDate.get(date)?.finalDailyStressScore ?? null;
            const level = score === null ? null : getStressLevel(score);
            const color = level ? theme[level.colorKey] : null;
            const future = dayNumber > lastDate;
            const marked = highlighted.has(date);
            // 평소엔 배경 없이 숫자 색으로 단계를 보이고, 키워드로 고른 날만 칸을 진하게 채운다.
            const filled = marked && color;
            return (
              <View key={date} style={styles.cell}>
                <View
                  accessibilityLabel={`${dayNumber}일 ${score === null ? '기록 없음' : `${score}점 ${level?.label}`}`}
                  style={styles.cellInner}>
                  {/* 채움은 따로 그린다: 같은 칸의 배경색만 바꾸면 안드로이드에서 모서리가 각지게 나왔다. */}
                  {filled && <View style={[styles.cellFill, {backgroundColor: color}]} />}
                  <Text
                    style={[
                      styles.cellText,
                      {color: filled ? theme.surface : color ?? theme.textMuted},
                      future && styles.future,
                    ]}>
                    {dayNumber}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <View style={[styles.divider, {backgroundColor: theme.border}]} />
      <View style={styles.legend}>
        {[...stressLevels].reverse().map(level => (
          <View key={level.label} style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: theme[level.colorKey]}]} />
            <Text style={[styles.legendText, {color: theme.textMuted}]}>{level.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// 일간 탭의 '뿡뿡이의 스트레스 원인 분석' 카드와 같은 모양
function MonthlyAnalysisCard({analysis, keywords, calendar}: {
  analysis: MonthlyReportData['analysis'];
  keywords?: React.ReactNode;
  calendar?: React.ReactNode;
}) {
  const {theme} = useAppTheme();
  const [top, ...rest] = analysis.causes;
  const others = rest.filter(cause => cause.label !== top?.label).slice(0, 2);
  return (
    <ReportCard>
      <CardHeader title="이번 달 스트레스 원인" />

      {/* 숫자보다 '무엇이 원인인지'가 먼저 읽히게: 원인 이름을 크게, 설명은 문장으로 */}
      {top ? (
        <>
          {/* 가장 큰 원인: 이름은 왼쪽에 크게, 설명은 오른쪽에 */}
          <View style={styles.topCause}>
            <Text style={[styles.topCauseName, {color: theme.text}]}>{top.label}</Text>
            <Text style={[styles.topCauseText, {color: theme.text}]}>{top.conclusion}</Text>
          </View>

          {others.length > 0 && (
            // 구분선은 '이런 날도…' 소제목 위에, 아래 줄들 사이에는 첫 줄 빼고 선
            <View style={[styles.others, {borderTopColor: theme.border}]}>
              <Text style={[styles.causeName, {color: theme.text}]}>이런 날도 스트레스가 높았어요</Text>
              {others.map((cause, index) => (
                <View
                  key={`${cause.kind}:${cause.label}`}
                  style={[styles.otherRow, index > 0 && [styles.otherRowDivided, {borderTopColor: theme.border}]]}>
                  <Text style={[styles.otherName, {color: theme.text}]}>{cause.label}</Text>
                  <Text style={[styles.otherMeta, {color: theme.textMuted}]}>{cause.days}일 · 평소보다 높음</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={[styles.body, {color: theme.text}]}>{analysis.message}</Text>
      )}

      {keywords && (
        <>
          <View style={[styles.divider, {backgroundColor: theme.border}]} />
          {keywords}
        </>
      )}

      {/* 원그래프 아래, 달력 구분선 위 */}
      {top && (
        <Text style={[styles.note, {color: theme.textMuted}]}>
          이번 달 하루 정리와 스트레스 점수로 본 경향이에요. 진단이 아니에요.
        </Text>
      )}

      {calendar && (
        <>
          <View style={[styles.sectionDivider, {backgroundColor: theme.border}]} />
          <Text style={[styles.sectionTitle, {color: theme.text}]}>날짜별 스트레스</Text>
          {calendar}
        </>
      )}
    </ReportCard>
  );
}

// 월간 스트레스 리포트 화면. 홈의 우체통에서 '편지'로 연다.
// initialReport: 우체통이 미리 받아 둔 데이터가 있으면 다시 부르지 않는다.
export default function MonthlyReportDetail({month, onBack, backLabel = '월간', initialReport = null}: {
  month: Month;
  onBack: () => void;
  backLabel?: string;
  initialReport?: MonthlyReportData | null;
}) {
  const {theme} = useAppTheme();
  const [report, setReport] = useState<MonthlyReportData | null>(initialReport);
  const [unavailable, setUnavailable] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (USE_MONTHLY_MOCK) {
      setReport(createMockMonthlyReport(month.key));
      return;
    }
    if (initialReport) return;
    getMonthlyReport(month.key)
      .then(data => {if (active) setReport(data);})
      .catch(() => {if (active) setUnavailable(true);});
    return () => {active = false;};
  }, [month.key, initialReport]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  const scoredDays: DailyStress[] = useMemo(() => (report?.days ?? []).flatMap(day =>
    day.finalDailyStressScore !== null && !day.missing?.includes('demo_fixture')
      ? [{date: day.date, score: day.finalDailyStressScore, causes: day.causes}] : []), [report]);

  const highlighted = useMemo(() => new Set(selectedCause
    ? scoredDays.filter(day => day.causes.includes(selectedCause)).map(day => day.date) : []),
  [selectedCause, scoredDays]);

  return (
    <>
      <DetailHeader
        backLabel={backLabel}
        onBack={onBack}
        title={month.label}
        subtitle={report ? `${format(parseISO(report.from), 'M.d')} ~ ${format(parseISO(report.to), 'M.d')}` : undefined}
      />

      {!report || report.dayCount === 0 ? (
        <ReportCard>
          {!report && !unavailable ? (
            <ActivityIndicator style={styles.loading} color={theme.accent} />
          ) : (
            <Text style={[styles.muted, {color: theme.textMuted}]}>
              {unavailable ? '월간 기록을 불러오지 못했어요. 서버 연결을 확인해 주세요.' : '이 달에 표시할 스트레스 기록이 없어요.'}
            </Text>
          )}
        </ReportCard>
      ) : (
        <>
          {/* 원인 분석 카드 안에 키워드 버튼: 누르면 아래 달력에 그 원인이 나온 날이 칠해진다. */}
          {/* 원인 분석 + 키워드 + 달력을 한 카드로 (키워드를 누르면 바로 아래 달력이 바뀐다) */}
          <MonthlyAnalysisCard
            analysis={report.analysis}
            keywords={report.causes.length > 0 && (
              <KeywordDonut
                causes={report.causes}
                selectedCause={selectedCause}
                onSelectCause={setSelectedCause}
              />
            )}
            calendar={<StressCalendar report={report} highlighted={highlighted} />}
          />
          <MonthlySummary report={report} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', gap: 10},
  weekRow: {flexDirection: 'row'},
  weekday: {flex: 1, fontSize: 12, fontWeight: '700', marginBottom: 6, textAlign: 'center'},
  cell: {aspectRatio: 1, flex: 1, padding: 3},
  cellInner: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  cellFill: {borderRadius: 12, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0},
  cellText: {fontSize: 18, fontWeight: '800'},
  future: {opacity: 0.4},
  divider: {height: StyleSheet.hairlineWidth, marginBottom: 12, marginTop: 10},
  // 카드 안에서 원인 부분과 달력 부분을 나누는 선과 소제목
  sectionDivider: {height: 1, marginBottom: 14, marginTop: 16},
  // '이번 달 스트레스 원인' 카드 제목과 같은 글씨 (CardHeader 가운데 제목: 18, 800)
  sectionTitle: {fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center'},
  legend: {columnGap: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  legendItem: {alignItems: 'center', columnGap: 5, flexDirection: 'row'},
  legendDot: {borderRadius: 5, height: 10, width: 10},
  legendText: {fontSize: 12, fontWeight: '600'},
  loading: {marginVertical: 12},
  topCause: {alignItems: 'center', flexDirection: 'row', gap: 26},
  topCauseName: {fontSize: 26, fontWeight: '800', letterSpacing: -0.4, maxWidth: '45%'},
  topCauseText: {flex: 1, fontSize: 16, lineHeight: 24},
  // '이런 날도…' 소제목
  causeName: {fontSize: 19, fontWeight: '800', letterSpacing: -0.2, marginBottom: 6},
  body: {fontSize: 16, lineHeight: 24},
  others: {borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16, paddingTop: 14},
  otherRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8},
  otherRowDivided: {borderTopWidth: StyleSheet.hairlineWidth},
  otherName: {fontSize: 16, fontWeight: '600'},
  otherMeta: {fontSize: 13},
  muted: {fontSize: 13, lineHeight: 19},
  note: {fontSize: 12, marginTop: 14, textAlign: 'center'},
});
