// 하루 마무리 알림: 사용자가 정한 시각(기본 23:00, 한국 시간)에 등록된 기기로 푸시를 보낸다.

const supabase = require("../config/supabase");
const fetchAll = require("../utils/fetchAll");
const { DEFAULT_NOTIFY_TIME } = require("../utils/settings");
const pushService = require("./pushService");

const DAILY_MESSAGES = [
  "오늘 하루는 어땠나요? 뿡뿡이에게 들려주세요.",
  "하루를 마무리할 시간이에요. 오늘 마음은 어땠는지 기록해 봐요.",
  "수고 많았어요! 자기 전에 오늘 이야기 잠깐 나눌까요?",
  "오늘의 기분을 남겨 두면 내일의 나에게 힘이 돼요.",
  "뿡뿡이가 기다리고 있어요. 오늘 있었던 일을 편하게 말해 주세요."
];

const pickMessage = (random = Math.random) =>
  DAILY_MESSAGES[Math.floor(random() * DAILY_MESSAGES.length)];

// hhmm("23:00")에 알림을 받을 사용자. 알림 시각을 안 정했으면 기본 시각에,
// 알림 켜기/끄기를 안 정했으면 켠 것으로 본다.
async function dueUserIds(hhmm) {
  const rows = await fetchAll(() => {
    let query = supabase
      .from("user_informations")
      .select("user_id")
      .or("notification_enabled.is.null,notification_enabled.eq.true");

    query =
      hhmm === DEFAULT_NOTIFY_TIME
        ? query.or(`notify_time.is.null,notify_time.eq.${hhmm}:00`)
        : query.eq("notify_time", `${hhmm}:00`);

    return query;
  });

  return rows.map(row => row.user_id);
}

async function tokensOf(userIds) {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", userIds);

  if (error) throw new Error(error.message);
  return data;
}

async function removeToken(token) {
  const { error } = await supabase.from("push_tokens").delete().eq("token", token);
  if (error) console.error("[notification] 만료 토큰 삭제 실패:", error.message);
}

// 반환: { users, sent, failed, removed }
async function sendDailyReminders(userIds) {
  const tokens = await tokensOf(userIds);
  const summary = { users: userIds.length, sent: 0, failed: 0, removed: 0 };
  const body = pickMessage();

  for (const { token } of tokens) {
    const result = await pushService.sendToToken(token, {
      title: "뿡뿡이",
      body,
      data: { type: "daily_checkin" }
    });

    if (result.ok) {
      summary.sent += 1;
    } else if (result.invalidToken) {
      summary.removed += 1;
      await removeToken(token);
    } else {
      summary.failed += 1;
      console.error("[notification] 발송 실패:", result.reason);
    }
  }

  return summary;
}

module.exports = {
  DAILY_MESSAGES,
  pickMessage,
  dueUserIds,
  sendDailyReminders
};
