import {useCallback, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addMonths, format, startOfMonth, subMonths} from 'date-fns';

import {getMonthlyReport, type MonthlyReportData} from '../../../services/api/reports';
import {supabase} from '../../../services/supabase';

// 홈 우체통: 한 달이 끝나면 다음 달 1일에 그달 스트레스 리포트가 '편지'로 도착한다.
// 이번 달 것은 '쓰는 중인 편지'로 지금까지의 기록을 미리 볼 수 있다.

// 지난 몇 달치 편지를 보관할지
const ARCHIVE_MONTHS = 3;
// 읽은 편지(YYYY-MM) 목록. 계정마다 따로 둔다.
const readKey = (userId: string) => `nownow.mailbox.read.${userId}`;

export interface Letter {
  key: string; // YYYY-MM
  month: number; // 1~12
  label: string; // 2026년 10월
  inProgress: boolean;
  report: MonthlyReportData | null;
  unread: boolean;
}

const monthOf = (date: Date) => ({
  key: format(date, 'yyyy-MM'),
  month: date.getMonth() + 1,
  label: format(date, 'yyyy년 M월'),
});

export function useMailbox() {
  const [userId, setUserId] = useState<string | null>(null);
  const [readMonths, setReadMonths] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Map<string, MonthlyReportData | null>>(new Map());
  const [loaded, setLoaded] = useState(false);

  // 모듈 로드 시점이 아니라 홈이 열린 날 기준
  const today = useMemo(() => new Date(), []);
  const current = useMemo(() => monthOf(today), [today]);
  const archive = useMemo(
    () => Array.from({length: ARCHIVE_MONTHS}, (_, i) => monthOf(subMonths(today, i + 1))),
    [today],
  );
  // 이번 달 편지가 도착하는 날 (다음 달 1일)
  const nextDelivery = useMemo(() => startOfMonth(addMonths(today, 1)), [today]);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser()
      .then(async ({data}) => {
        const id = data.user?.id ?? 'guest';
        const raw = await AsyncStorage.getItem(readKey(id)).catch(() => null);
        if (!active) return;
        setUserId(id);
        try {
          setReadMonths(new Set(raw ? JSON.parse(raw) : []));
        } catch {
          setReadMonths(new Set());
        }
      })
      .catch(() => {});
    return () => {active = false;};
  }, []);

  const refresh = useCallback(() => {
    let active = true;
    Promise.all([current, ...archive].map(({key}) =>
      getMonthlyReport(key).then(data => [key, data] as const).catch(() => [key, null] as const)))
      .then(entries => {
        if (!active) return;
        setReports(new Map(entries));
        setLoaded(true);
      });
    return () => {active = false;};
  }, [current, archive]);

  useEffect(refresh, [refresh]);

  // 기록이 하루도 없는 달은 편지가 오지 않는다.
  const letters: Letter[] = useMemo(() => archive.flatMap(month => {
    const report = reports.get(month.key) ?? null;
    if (!report || report.dayCount === 0) return [];
    return [{...month, inProgress: false, report, unread: !readMonths.has(month.key)}];
  }), [archive, reports, readMonths]);

  const draft: Letter = useMemo(() => ({
    ...current,
    inProgress: true,
    report: reports.get(current.key) ?? null,
    unread: false,
  }), [current, reports]);

  const markRead = useCallback((key: string) => {
    setReadMonths(previous => {
      if (previous.has(key)) return previous;
      const next = new Set(previous).add(key);
      if (userId) AsyncStorage.setItem(readKey(userId), JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, [userId]);

  return {
    letters,
    draft,
    nextDelivery,
    loaded,
    hasUnread: letters.some(letter => letter.unread),
    markRead,
    refresh,
  };
}
