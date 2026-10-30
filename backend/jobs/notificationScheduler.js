// 서버가 켜져 있는 동안 1분마다 "지금(한국 시간) 알림 받을 사람"을 찾아 하루 마무리 푸시를 보낸다.
// 같은 날 같은 사람에게 두 번 보내지 않도록 보낸 기록을 메모리에 둔다(서버를 다시 켜면 초기화).
//
// 필요한 환경변수: SUPABASE_SERVICE_ROLE_KEY, FCM_SERVICE_ACCOUNT_PATH
// 끄기: NOTIFICATION_DISABLED=true

const { kstDateOf, kstTimeOf } = require("../utils/kstDate");
const pushService = require("../services/pushService");
const { dueUserIds, sendDailyReminders } = require("../services/notificationService");

const MINUTE_MS = 60_000;

const sentToday = new Set();
let sentDate = null;
let running = false;

async function tick(now = Date.now()) {
  if (running) return;
  running = true;

  try {
    const date = kstDateOf(now);
    const hhmm = kstTimeOf(now);

    if (sentDate !== date) {
      sentToday.clear();
      sentDate = date;
    }

    const userIds = (await dueUserIds(hhmm)).filter(id => !sentToday.has(id));
    if (userIds.length === 0) return;

    const summary = await sendDailyReminders(userIds);
    userIds.forEach(id => sentToday.add(id));

    console.log(
      `[notification] ${date} ${hhmm} 대상 ${summary.users}명 · 발송 ${summary.sent} · 실패 ${summary.failed} · 만료 토큰 삭제 ${summary.removed}`
    );
  } catch (error) {
    console.error("[notification] 실패:", error.message);
  } finally {
    running = false;
  }
}

function startNotificationScheduler() {
  if (process.env.NOTIFICATION_DISABLED === "true") {
    console.log("[notification] NOTIFICATION_DISABLED=true라 알림을 보내지 않음");
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !pushService.isConfigured()) {
    console.warn(
      "[notification] 관리자 키 또는 FCM_SERVICE_ACCOUNT_PATH가 없어 알림을 보내지 않음"
    );
    return;
  }

  // 매 분 0초에 맞춰 돈다.
  setTimeout(() => {
    tick();
    setInterval(tick, MINUTE_MS).unref();
  }, MINUTE_MS - (Date.now() % MINUTE_MS)).unref();

  console.log("[notification] 하루 마무리 알림 예약 (사용자 설정 시각, 기본 23:00 KST)");
}

module.exports = { startNotificationScheduler, tick };
