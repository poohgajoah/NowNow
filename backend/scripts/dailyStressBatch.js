// 하루 스트레스 점수 수동 계산. 서버가 꺼져 있어 새벽 예약을 놓친 날을 채울 때 쓴다.
// 실행(backend 폴더에서): node scripts/dailyStressBatch.js [YYYY-MM-DD]   (날짜를 비우면 어제)

const { addDays, isDate, kstToday } = require("../utils/kstDate");
const { formatSummary, runForDate } = require("../services/dailyStressBatch");

async function main() {
  const date = process.argv[2] || addDays(kstToday(), -1);

  if (!isDate(date)) {
    throw new Error(`날짜는 YYYY-MM-DD 형식이어야 합니다: ${date}`);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("backend/.env에 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  }

  const summary = await runForDate(date);
  console.log(formatSummary(summary));

  if (summary.failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
