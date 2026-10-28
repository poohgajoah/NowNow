// 서버가 켜져 있는 동안 매일 03:00(한국 시간)에 어제 하루 스트레스 점수를 계산·저장한다.
// 서버가 꺼져 있던 날은 예약이 돌지 않으므로, 서버를 켤 때 최근 며칠을 한 번 보충 계산한다
// (같은 날을 다시 계산해도 덮어쓰기라 안전하다).
//
// 환경변수
// - STRESS_BATCH_DISABLED=true  예약을 끈다
// - STRESS_BATCH_CATCHUP_DAYS   서버 시작 때 보충할 지난 날 수 (기본 3, 0이면 안 함)

const { addDays, kstToday, msUntilNextKstHour } = require("../utils/kstDate");
const { formatSummary, runForDate } = require("../services/dailyStressBatch");

const RUN_HOUR_KST = 3;

let running = false;

async function runDates(dates, label) {
  // 앞선 계산이 아직 끝나지 않았으면 겹쳐 돌리지 않는다.
  if (running) {
    console.log(`[dailyStress] ${label}: 이전 계산이 진행 중이라 건너뜀`);
    return;
  }

  running = true;
  try {
    for (const date of dates) {
      const summary = await runForDate(date);
      console.log(`[dailyStress] ${label} ${formatSummary(summary)}`);
    }
  } catch (error) {
    console.error(`[dailyStress] ${label} 실패: ${error.message}`);
  } finally {
    running = false;
  }
}

function scheduleNext() {
  const delay = msUntilNextKstHour(RUN_HOUR_KST);

  setTimeout(async () => {
    await runDates([addDays(kstToday(), -1)], "새벽 계산");
    scheduleNext();
  }, delay).unref();

  const hours = Math.floor(delay / 3600000);
  const minutes = Math.round((delay % 3600000) / 60000);
  console.log(`[dailyStress] 다음 계산: ${hours}시간 ${minutes}분 뒤 (매일 03:00 KST)`);
}

function startDailyStressScheduler() {
  if (process.env.STRESS_BATCH_DISABLED === "true") {
    console.log("[dailyStress] STRESS_BATCH_DISABLED=true라 예약하지 않음");
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[dailyStress] 관리자 키(SUPABASE_SERVICE_ROLE_KEY)가 없어 예약하지 않음");
    return;
  }

  const catchupDays = Number(process.env.STRESS_BATCH_CATCHUP_DAYS ?? 3);
  if (Number.isInteger(catchupDays) && catchupDays > 0) {
    const today = kstToday();
    const dates = Array.from({ length: catchupDays }, (_, i) =>
      addDays(today, -(catchupDays - i))
    );
    runDates(dates, "시작 보충");
  }

  scheduleNext();
}

module.exports = { startDailyStressScheduler };
