import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {addDays, format, isAfter, startOfDay} from 'date-fns';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';

import Text from '../../../components/AppText';
import {getWeeklyReport, type WeeklyReportData} from '../../../services/api/reports';
import {useAppTheme} from '../../../theme/ThemeProvider';
import {WEEKLY_GOALS, WEEKLY_REPORT_COUNT} from '../constants/reportData';
import {getRecentWeeks} from '../utils/weekLabels';
import AnimatedBar from './AnimatedBar';
import CardHeader from './CardHeader';
import HealthCard from './HealthCard';
import ReportCard from './ReportCard';
import StressKeywordCard from './StressKeywordCard';

// 주간 리포트: 한 주의 걸음수·수면을 요일별로 보고 지난주와 비교한다.
// 스트레스 키워드를 누르면 그 키워드가 나온 날이 요일별 그래프에 표시된다. (자세한 스트레스 분석은 홈 우체통의 월간 편지)

type Metric = 'steps' | 'sleep';
type Week = ReturnType<typeof getRecentWeeks>[number];

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
const CHART_HEIGHT = 150;

const valueOf = (day: WeeklyReportData['days'][number] | undefined, metric: Metric) =>
  (metric === 'steps' ? day?.totalSteps : day?.sleepMinutes) ?? null;

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

// 수면: 6 시간 50 분 (실시간 탭 수면 카드와 같은 모양)
const sleepParts = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return [...(h > 0 ? [{value: String(h), unit: '시간'}] : []), {value: String(m), unit: '분'}];
};
const sleepText = (minutes: number) => sleepParts(minutes).map(part => `${part.value}${part.unit}`).join(' ');
const barLabel = (value: number, metric: Metric) =>
  metric === 'steps' ? Math.round(value).toLocaleString() : `${Math.floor(value / 60)}:${String(Math.round(value % 60)).padStart(2, '0')}`;

// 서버가 준 날짜별 기록을 월~일 7칸으로 맞춘다 (기록 없는 날·아직 안 온 날은 null).
function useWeekDays(week: Week, report: WeeklyReportData | null) {
  return useMemo(() => {
    const byDate = new Map(report?.days.map(day => [day.date, day]));
    const today = startOfDay(new Date());
    return WEEKDAYS.map((label, index) => {
      const date = addDays(week.start, index);
      const key = format(date, 'yyyy-MM-dd');
      return {label, key, future: isAfter(date, today), day: byDate.get(key)};
    });
  }, [week.start, report]);
}

function WeekChart({days, metric, animationKey, marked}: {
  days: ReturnType<typeof useWeekDays>;
  metric: Metric;
  animationKey: string;
  // 고른 스트레스 키워드가 나온 날. 있으면 그날 막대만 진하게, 나머지는 흐리게.
  marked: Set<string> | null;
}) {
  const {theme} = useAppTheme();
  const goal = WEEKLY_GOALS[metric];
  const values = days.map(({day}) => valueOf(day, metric));
  const max = Math.max(goal * 1.25, ...values.map(value => value ?? 0));
  const best = Math.max(...values.map(value => value ?? -1));

  return (
    <View>
      <View style={styles.chart}>
        {/* 목표선 */}
        <View pointerEvents="none" style={[styles.goalLine, {bottom: (goal / max) * CHART_HEIGHT, borderColor: theme.accent}]}>
          <Text style={[styles.goalLabel, {color: theme.accentStrong, backgroundColor: theme.surface}]}>
            목표 {metric === 'steps' ? goal.toLocaleString() : `${goal / 60}시간`}
          </Text>
        </View>
        {days.map(({label, key, future}, index) => {
          const value = values[index];
          const color = marked
            ? (marked.has(key) ? theme.accentStrong : theme.border)
            : value === best && value !== null ? theme.accentStrong : value === null ? theme.border : theme.nav;
          return (
            <View
              key={key}
              accessible
              accessibilityLabel={`${label}요일 ${value === null ? '기록 없음' : metric === 'steps' ? `${Math.round(value)}걸음` : sleepText(value)}`}
              style={styles.column}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.barValue, {color: theme.textMuted}]}>
                {value === null ? '' : barLabel(value, metric)}
              </Text>
              <AnimatedBar
                index={index}
                animationKey={`${animationKey}-${metric}`}
                height={value ? Math.max(6, (value / max) * CHART_HEIGHT) : future ? 0 : 3}
                colorStyle={{backgroundColor: color}}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {days.map(({label, key, future}) => {
          const hit = marked?.has(key);
          return (
            <View key={key} style={styles.dayCell}>
              <Text style={[styles.dayLabel, {color: hit ? theme.accentStrong : theme.textMuted}, future && styles.future]}>{label}</Text>
              {/* 키워드가 나온 날 표시 점 */}
              <View style={[styles.dayDot, {backgroundColor: hit ? theme.accentStrong : 'transparent'}]} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function WeeklyReport() {
  const {theme} = useAppTheme();
  // 마지막 주도 지난주와 비교할 수 있게 한 주 더 받는다.
  const weeks = useMemo(() => getRecentWeeks(WEEKLY_REPORT_COUNT + 1), []);
  const [index, setIndex] = useState(0);
  const [metric, setMetric] = useState<Metric>('steps');
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, WeeklyReportData | 'failed'>>({});

  const week = weeks[index];
  // 주를 바꾸면 고른 키워드는 지운다.
  useEffect(() => setSelectedCause(null), [index]);
  const previousWeek = weeks[index + 1];

  useEffect(() => {
    let active = true;
    for (const {key} of [week, previousWeek]) {
      if (reports[key]) continue;
      getWeeklyReport(key)
        .then(data => {if (active) setReports(previous => ({...previous, [key]: data}));})
        .catch(() => {if (active) setReports(previous => ({...previous, [key]: 'failed'}));});
    }
    return () => {active = false;};
    // reports는 일부러 빼서, 이미 받은 주는 다시 부르지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, previousWeek]);

  const current = reports[week.key];
  const report = current && current !== 'failed' ? current : null;
  const previous = reports[previousWeek.key];
  const previousReport = previous && previous !== 'failed' ? previous : null;
  const days = useWeekDays(week, report);
  const markedDays = useMemo(() => (selectedCause
    ? new Set((report?.days ?? []).filter(day => day.causes?.includes(selectedCause)).map(day => day.date))
    : null), [selectedCause, report]);

  const collect = (data: WeeklyReportData | null, m: Metric) =>
    (data?.days ?? []).map(day => valueOf(day, m)).filter((value): value is number => value !== null);
  const steps = collect(report, 'steps');
  const sleep = collect(report, 'sleep');
  const avgSteps = average(steps);
  const avgSleep = average(sleep);
  const prevSteps = average(collect(previousReport, 'steps'));
  const prevSleep = average(collect(previousReport, 'sleep'));

  const stepsCaption = avgSteps !== null && prevSteps
    ? (() => {
      const pct = Math.round(((avgSteps - prevSteps) / prevSteps) * 100);
      return pct === 0 ? '지난주와 비슷해요' : `지난주보다 ${Math.abs(pct)}% ${pct > 0 ? '↑' : '↓'}`;
    })()
    : undefined;
  const sleepCaption = avgSleep !== null && prevSleep !== null
    ? (() => {
      const diff = Math.round(avgSleep - prevSleep);
      return diff === 0 ? '지난주와 비슷해요' : `지난주보다 ${sleepText(Math.abs(diff))} ${diff > 0 ? '↑' : '↓'}`;
    })()
    : undefined;

  // 한 줄 요약: 목표를 넘긴 날 수와 가장 좋았던 날
  const insights = useMemo(() => {
    const lines: string[] = [];
    const pick = (m: Metric) => days
      .map(({label, day}) => ({label, value: valueOf(day, m)}))
      .filter((item): item is {label: string; value: number} => item.value !== null);
    const stepDays = pick('steps');
    const sleepDays = pick('sleep');
    if (stepDays.length) {
      const top = stepDays.reduce((a, b) => (b.value > a.value ? b : a));
      const reached = stepDays.filter(item => item.value >= WEEKLY_GOALS.steps).length;
      lines.push(`가장 많이 걸은 날은 ${top.label}요일(${Math.round(top.value).toLocaleString()}걸음)이에요.`);
      lines.push(`${WEEKLY_GOALS.steps.toLocaleString()}걸음을 넘긴 날은 ${reached}일이에요.`);
    }
    if (sleepDays.length) {
      const enough = sleepDays.filter(item => item.value >= WEEKLY_GOALS.sleep).length;
      const shortest = sleepDays.reduce((a, b) => (b.value < a.value ? b : a));
      lines.push(`${WEEKLY_GOALS.sleep / 60}시간 넘게 잔 날은 ${enough}일이에요.`);
      if (shortest.value < WEEKLY_GOALS.sleep) {
        lines.push(`${shortest.label}요일 잠이 가장 짧았어요(${sleepText(shortest.value)}).`);
      }
    }
    return lines;
  }, [days]);

  const range = `${format(week.start, 'M.d')} ~ ${format(addDays(week.start, 6), 'M.d')}`;
  const canOlder = index < WEEKLY_REPORT_COUNT - 1;
  const canNewer = index > 0;

  return (
    <>
      {/* 주 이동: 목록을 거치지 않고 화살표로 */}
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="지난주"
          disabled={!canOlder}
          hitSlop={10}
          onPress={() => setIndex(i => i + 1)}
          style={({pressed}) => [styles.arrow, !canOlder && styles.disabled, pressed && styles.pressed]}>
          <ChevronLeft size={26} color={theme.text} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={[styles.navTitle, {color: theme.text}]}>{index === 0 ? '이번 주' : week.label.replace(/^\d+년 /, '')}</Text>
          <Text style={[styles.navRange, {color: theme.textMuted}]}>{range}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 주"
          disabled={!canNewer}
          hitSlop={10}
          onPress={() => setIndex(i => i - 1)}
          style={({pressed}) => [styles.arrow, !canNewer && styles.disabled, pressed && styles.pressed]}>
          <ChevronRight size={26} color={theme.text} />
        </Pressable>
      </View>

      {!current ? (
        <ReportCard><ActivityIndicator style={styles.loading} color={theme.accent} /></ReportCard>
      ) : current === 'failed' ? (
        <ReportCard>
          <Text style={[styles.muted, {color: theme.textMuted}]}>주간 기록을 불러오지 못했어요. 서버 연결을 확인해 주세요.</Text>
        </ReportCard>
      ) : (
        <>
          <View style={styles.grid}>
            <HealthCard
              title="평균 걸음수"
              value={avgSteps === null ? '-' : Math.round(avgSteps).toLocaleString()}
              unit={avgSteps === null ? undefined : '걸음'}
              caption={stepsCaption}
              selected={metric === 'steps'}
              onPress={() => setMetric('steps')}
            />
            <HealthCard
              title="평균 수면"
              value="-"
              parts={avgSleep === null ? undefined : sleepParts(avgSleep)}
              caption={sleepCaption}
              selected={metric === 'sleep'}
              onPress={() => setMetric('sleep')}
            />
          </View>

          <StressKeywordCard
            causes={report?.causes ?? []}
            selectedCause={selectedCause}
            onSelectCause={setSelectedCause}
            hint="누르면 아래 요일별 그래프에 그날이 표시돼요."
          />

          <ReportCard>
            {/* 걸음수·수면 전환은 위 평균 카드를 눌러서 한다. 지금 보는 항목은 제목으로 알려 준다. */}
            <CardHeader title={metric === 'steps' ? '요일별 걸음수' : '요일별 수면'} />
            <WeekChart days={days} metric={metric} animationKey={week.key} marked={markedDays} />
          </ReportCard>

          <ReportCard>
            <CardHeader title="한 주 요약" />
            {insights.length ? insights.map(line => (
              <Text key={line} style={[styles.insight, {color: theme.text}]}>· {line}</Text>
            )) : (
              <Text style={[styles.muted, {color: theme.textMuted}]}>이 주에는 걸음수·수면 기록이 없어요.</Text>
            )}
          </ReportCard>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  nav: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  navCenter: {alignItems: 'center'},
  navTitle: {fontSize: 20, fontWeight: '800'},
  navRange: {fontSize: 13, marginTop: 2},
  arrow: {padding: 6},
  disabled: {opacity: 0.25},
  pressed: {opacity: 0.5},
  grid: {flexDirection: 'row', gap: 10},
  chart: {alignItems: 'flex-end', flexDirection: 'row', gap: 10, height: CHART_HEIGHT + 22},
  column: {flex: 1, justifyContent: 'flex-end'},
  barValue: {fontSize: 10, fontWeight: '600', marginBottom: 4, textAlign: 'center'},
  goalLine: {borderStyle: 'dashed', borderTopWidth: 1, left: 0, position: 'absolute', right: 0},
  goalLabel: {fontSize: 10, fontWeight: '700', paddingHorizontal: 4, position: 'absolute', right: 0, top: -8},
  labels: {flexDirection: 'row', gap: 10, marginTop: 8},
  dayCell: {alignItems: 'center', flex: 1, gap: 4},
  dayLabel: {fontSize: 12, fontWeight: '700', textAlign: 'center'},
  dayDot: {borderRadius: 3, height: 6, width: 6},
  future: {opacity: 0.4},
  insight: {fontSize: 15, lineHeight: 24},
  muted: {fontSize: 14, lineHeight: 20},
  loading: {marginVertical: 12},
});
