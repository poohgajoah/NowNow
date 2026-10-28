// 하루 스트레스 점수 일괄 계산. 그날 심박수 기록이 있는 모든 사용자의 점수를 계산해
// daily_stress_scores에 저장한다. 서버의 새벽 예약(jobs/dailyStressScheduler.js)과
// 수동 실행 스크립트(scripts/dailyStressBatch.js)가 같이 쓴다.
// 모든 사용자 기록을 읽어야 해서 관리자 키(SUPABASE_SERVICE_ROLE_KEY)가 필요하다.

const supabase = require("../config/supabase");
const fetchAll = require("../utils/fetchAll");
const { kstDayRange } = require("../utils/kstDate");
const stressService = require("./stressService");

async function usersWithHeartRate(date) {
  const { start, end } = kstDayRange(date);
  const rows = await fetchAll(() =>
    supabase
      .from("heart_rate_records")
      .select("user_id")
      .gte("measured_at", start)
      .lt("measured_at", end)
  );

  return [...new Set(rows.map(row => row.user_id))];
}

// 반환: { date, users, saved, noScore, failed }
async function runForDate(date) {
  const users = await usersWithHeartRate(date);
  const summary = { date, users: users.length, saved: 0, noScore: 0, failed: 0 };

  for (const user_id of users) {
    try {
      const result = await stressService.calculateAndSaveDay(user_id, date);
      if (result.finalDailyStressScore === null) summary.noScore += 1;
      else summary.saved += 1;
    } catch (error) {
      summary.failed += 1;
      console.error(`[dailyStress] ${date} ${user_id.slice(0, 8)} 실패: ${error.message}`);
    }
  }

  return summary;
}

const formatSummary = ({ date, users, saved, noScore, failed }) =>
  `${date}: 대상 ${users}명 · 저장 ${saved} · 점수 없음(측정 부족) ${noScore} · 실패 ${failed}`;

module.exports = {
  runForDate,
  formatSummary
};
