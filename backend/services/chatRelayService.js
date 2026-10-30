// 챗봇 AI 중계. 앱 → 팀 백엔드(로그인 확인) → AI 서버(Cloudflare Worker) → OpenAI.
// AI 서버 주소와 토큰은 서버 .env에만 둔다(AI_RELAY_URL, AI_RELAY_TOKEN). 앱에는 넣지 않는다.

const TIMEOUT_MS = 50_000;

class RelayError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function requestReply(message, history) {
  const url = process.env.AI_RELAY_URL;
  const token = process.env.AI_RELAY_TOKEN;

  if (!url || !token) {
    throw new RelayError(503, "AI 중계 설정(AI_RELAY_URL, AI_RELAY_TOKEN)이 필요합니다.");
  }

  let response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message, history }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new RelayError(504, "AI 답변 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.");
    }
    throw new RelayError(502, "AI 서버에 연결하지 못했어요.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // AI 서버 오류 코드는 그대로 전하지 않고 상황만 알린다.
    console.error("[chatRelay] AI 서버 오류:", response.status, data?.error);
    if (response.status === 429) {
      throw new RelayError(429, "AI 사용량이 많아요. 잠시 후 다시 시도해 주세요.");
    }
    throw new RelayError(502, "AI 답변을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  if (typeof data?.reply !== "string" || !data.reply.trim()) {
    throw new RelayError(502, "AI가 빈 답변을 보냈어요. 다시 시도해 주세요.");
  }

  return data.reply;
}

module.exports = { requestReply, RelayError };
