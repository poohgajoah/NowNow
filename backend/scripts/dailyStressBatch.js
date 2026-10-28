// 하루 스트레스 점수 일괄 계산. 매일 03:00(한국 시간)에 GitHub Actions가 실행한다
// (.github/workflows/daily-stress.yml). 그날 심박수 기록이 있는 모든 사용자의 점수를
// 계산해 daily_stress_scores에 저장한다. 점수는 심박수가 없으면 나오지 않는다.
//
// 실행: node scripts/dailyStressBatch.js [YYYY-MM-DD]   (날짜를 비우면 어제)
// 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (RLS를 넘어 모든 사용자를 읽어야 한다)

const supabase = require("../config/supabase");
const fetchAll = require("../utils/fetchAll");
const { addDays, isDate, kstDayRange, kstToday } = require("../utils/kstDate");
const stressService = require("../services/stressService");

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

async function main() {
  const date = process.argv[2] || process.env.BATCH_DATE || addDays(kstToday(), -1);

  if (!isDate(date)) {
    throw new Error(`날짜는 YYYY-MM-DD 형식이어야 합니다: ${date}`);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  const users = await usersWithHeartRate(date);
  let saved = 0;
  let noScore = 0;
  let failed = 0;

  for (const user_id of users) {
    try {
      const result = await stressService.calculateAndSaveDay(user_id, date);
      if (result.finalDailyStressScore === null) noScore += 1;
      else saved += 1;
    } catch (error) {
      failed += 1;
      // 로그가 공개될 수 있어 사용자 ID는 앞부분만 남긴다.
      console.error(`[${user_id.slice(0, 8)}] 실패: ${error.message}`);
    }
  }

  console.log(
    `${date}: 대상 ${users.length}명 · 저장 ${saved} · 점수 없음(측정 부족) ${noScore} · 실패 ${failed}`
  );

  if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
