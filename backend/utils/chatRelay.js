// POST /api/chat/reply 요청 검사. AI 서버(chatbot-server/worker.mjs)와 같은 규칙.
// 반환: { message, history } 또는 { error }

const MAX_MESSAGE = 2000;
const MAX_TURN = 4000;
const MAX_HISTORY = 10; // 최근 5회 문답

function parseChatRequest(body) {
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history = body?.history ?? [];

  if (!message || message.length > MAX_MESSAGE) {
    return { error: `message는 1~${MAX_MESSAGE}자여야 합니다.` };
  }

  // user → assistant 순서의 짝이어야 한다.
  const validHistory =
    Array.isArray(history) &&
    history.length <= MAX_HISTORY &&
    history.length % 2 === 0 &&
    history.every(
      (turn, index) =>
        turn &&
        turn.role === (index % 2 === 0 ? "user" : "assistant") &&
        typeof turn.content === "string" &&
        turn.content.trim() &&
        turn.content.length <= MAX_TURN
    );

  if (!validHistory) {
    return {
      error: `history는 user/assistant 순서의 짝, 최대 ${MAX_HISTORY}개, 각 ${MAX_TURN}자 이하여야 합니다.`
    };
  }

  return {
    message,
    history: history.map(({ role, content }) => ({ role, content }))
  };
}

// 사용자별 1분에 limit번까지. 메모리 기록이라 서버를 다시 켜면 초기화된다.
function createRateLimiter(limit, windowMs = 60_000) {
  const hits = new Map();

  return (key, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter(time => now - time < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    return true;
  };
}

module.exports = { parseChatRequest, createRateLimiter };
