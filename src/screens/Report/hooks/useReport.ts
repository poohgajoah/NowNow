import {useMemo, useState} from 'react';

import {
  monthlyStressData,
  todayHRVData,
  weeklyStressData,
} from '../constants/reportData';
import type {MetricType, ReportPeriod} from '../types';

export const useReport = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('heartRate');
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [stressPeriod, setStressPeriod] = useState<'week' | 'month'>('week');

  const peakStress = useMemo(
    () =>
      todayHRVData.reduce((max, current) =>
        current.stress > max.stress ? current : max,
      ),
    [],
  );

  const lowestStress = useMemo(
    () =>
      todayHRVData.reduce((min, current) =>
        current.stress < min.stress ? current : min,
      ),
    [],
  );

  const stressCauses =
    stressPeriod === 'week' ? weeklyStressData : monthlyStressData;

  return {
    selectedMetric,
    setSelectedMetric,
    period,
    setPeriod,
    stressPeriod,
    setStressPeriod,
    peakStress,
    lowestStress,
    stressCauses,
  };
};
