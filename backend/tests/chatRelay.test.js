const test = require("node:test");
const assert = require("node:assert/strict");

const { createRateLimiter, parseChatRequest } = require("../utils/chatRelay");

test("챗봇 중계 요청 검사", () => {
  assert.deepEqual(
    parseChatRequest({
      message: "  오늘 힘들었어  ",
      history: [
        { role: "user", content: "안녕", extra: "버림" },
        { role: "assistant", content: "반가워요" }
      ]
    }),
    {
      message: "오늘 힘들었어",
      history: [
        { role: "user", content: "안녕" },
        { role: "assistant", content: "반가워요" }
      ]
    }
  );
  assert.deepEqual(parseChatRequest({ message: "hi" }), { message: "hi", history: [] });

  assert.ok(parseChatRequest({ message: "" }).error);
  assert.ok(parseChatRequest({ message: "a".repeat(2001) }).error);
  // 순서가 틀리거나 짝이 안 맞으면 거절
  assert.ok(parseChatRequest({ message: "hi", history: [{ role: "assistant", content: "x" }, { role: "user", content: "y" }] }).error);
  assert.ok(parseChatRequest({ message: "hi", history: [{ role: "user", content: "x" }] }).error);
  assert.ok(
    parseChatRequest({
      message: "hi",
      history: Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x" }))
    }).error
  );
});

test("사용자별 요청 제한: 1분에 limit번", () => {
  const allow = createRateLimiter(2, 60_000);
  assert.equal(allow("a", 0), true);
  assert.equal(allow("a", 1000), true);
  assert.equal(allow("a", 2000), false);
  assert.equal(allow("b", 2000), true); // 다른 사용자는 따로
  assert.equal(allow("a", 60_001), true); // 1분 지나면 다시 허용
});
