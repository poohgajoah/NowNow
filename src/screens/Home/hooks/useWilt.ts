import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {differenceInCalendarDays, format, subDays, subMonths} from 'date-fns';

import {getChatMessages} from '../../../services/api/chat';
import {getMonthlyReport} from '../../../services/api/reports';
import {supabase} from '../../../services/supabase';
import {DEFAULT_STRESS_CARE_THRESHOLD} from '../../Report/constants/reportData';

// 캐릭터가 시드는 조건. 하나라도 맞으면 시들고, 말풍선이 걱정하는 말로 바뀐다.
// 오늘 돌봐 주면(선택지 고르기) 또는 오늘 채팅하면 그날은 다시 살아난다.
export type WiltReason = 'away' | 'noChat' | 'stress' | 'sleep';

// 이만큼 앱을 안 열었거나 채팅을 안 하면 시든다.
const AWAY_DAYS = 3;
const NO_CHAT_DAYS = 3;
// 지난밤 수면이 이보다 짧으면 시든다.
const SHORT_SLEEP_MINUTES = 5 * 60;

const lastVisitKey = (userId: string) => `nownow.lastVisit.${userId}`;
const revivedKey = (userId: string) => `nownow.revived.${userId}`;
const todayKey = () => format(new Date(), 'yyyy-MM-dd');

// '오랜만에 왔어'는 앱을 연 첫 순간에만 알 수 있다. 홈은 탭을 오갈 때마다 다시 그려지므로
// 앱이 켜져 있는 동안 처음 계산한 값을 기억해 둔다.
let sessionAway: Promise<boolean> | null = null;

const checkAway = (userId: string) => {
  sessionAway ??= AsyncStorage.getItem(lastVisitKey(userId))
    .then(last => {
      void AsyncStorage.setItem(lastVisitKey(userId), new Date().toISOString()).catch(() => {});
      return last ? differenceInCalendarDays(new Date(), new Date(last)) >= AWAY_DAYS : false;
    })
    .catch(() => false);
  return sessionAway;
};

// 마지막으로 사용자가 채팅한 날로부터 며칠 지났는지 (채팅한 적이 없으면 null)
const daysSinceChat = async () => {
  const messages = await getChatMessages();
  const last = [...messages].reverse().find(message => message.chat_role === 'USER');
  return last ? differenceInCalendarDays(new Date(), new Date(last.created_at)) : null;
};

// 오늘(없으면 어제)의 스트레스 점수와 지난밤 수면
const recentHealth = async () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const months = [format(today, 'yyyy-MM')];
  if (format(yesterday, 'yyyy-MM') !== months[0]) months.push(format(subMonths(today, 1), 'yyyy-MM'));
  const reports = await Promise.all(months.map(month => getMonthlyReport(month).catch(() => null)));
  const days = new Map(reports.flatMap(report => report?.days ?? []).map(day => [day.date, day]));
  const pick = (read: (day: NonNullable<ReturnType<typeof days.get>>) => number | null) => {
    for (const date of [format(today, 'yyyy-MM-dd'), format(yesterday, 'yyyy-MM-dd')]) {
      const day = days.get(date);
      // 데모용 고정 값은 실제 기록이 아니라서 뺀다(월간 리포트와 같은 기준).
      if (!day || day.missing?.includes('demo_fixture')) continue;
      const value = read(day);
      if (value !== null) return value;
    }
    return null;
  };
  return {stress: pick(day => day.finalDailyStressScore), sleep: pick(day => day.sleepMinutes)};
};

export function useWilt() {
  const [userId, setUserId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<WiltReason[]>([]);
  const [revived, setRevived] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const {data} = await supabase.auth.getUser();
      const id = data.user?.id;
      if (!id || !active) return;
      setUserId(id);

      const [away, chatDays, health, revivedOn] = await Promise.all([
        checkAway(id),
        daysSinceChat().catch(() => null),
        recentHealth().catch(() => ({stress: null, sleep: null})),
        AsyncStorage.getItem(revivedKey(id)).catch(() => null),
      ]);
      if (!active) return;

      const found: WiltReason[] = [];
      if (away) found.push('away');
      if (chatDays !== null && chatDays >= NO_CHAT_DAYS) found.push('noChat');
      if (health.stress !== null && health.stress >= DEFAULT_STRESS_CARE_THRESHOLD) found.push('stress');
      if (health.sleep !== null && health.sleep > 0 && health.sleep < SHORT_SLEEP_MINUTES) found.push('sleep');
      setReasons(found);
      // 오늘 이미 돌봐 줬거나 오늘 채팅했으면 살아난 상태로 시작
      setRevived(revivedOn === todayKey() || chatDays === 0);
    })().catch(() => {});
    return () => {active = false;};
  }, []);

  // 돌봐 주면(선택지를 고르면) 오늘은 다시 살아난다.
  const revive = useCallback(() => {
    setRevived(true);
    if (userId) void AsyncStorage.setItem(revivedKey(userId), todayKey()).catch(() => {});
  }, [userId]);

  const wilted = reasons.length > 0 && !revived;
  return {wilted, reason: wilted ? reasons[0] : null, revive};
}
