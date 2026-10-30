const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createRateLimiter, parseChatRequest } = require("../utils/chatRelay");
const { kstTimeOf } = require("../utils/kstDate");

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

test("한국 시간 HH:MM", () => {
  assert.equal(kstTimeOf(Date.parse("2026-10-30T14:00:00Z")), "23:00");
  assert.equal(kstTimeOf(Date.parse("2026-10-30T15:05:30Z")), "00:05");
});

test("FCM 발송: 서명한 토큰으로 인증하고, 만료 토큰을 구분한다", async () => {
  // 가짜 서비스 계정
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fcm-"));
  const file = path.join(dir, "account.json");
  fs.writeFileSync(
    file,
    JSON.stringify({
      project_id: "nownow-test",
      client_email: "push@nownow-test.iam.gserviceaccount.com",
      private_key: privateKey.export({ type: "pkcs8", format: "pem" })
    })
  );
  process.env.FCM_SERVICE_ACCOUNT_PATH = file;

  const calls = [];
  const realFetch = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    if (url === "https://oauth2.googleapis.com/token") {
      // 구글이 받는 JWT 서명이 서비스 계정 키로 검증되는지 확인
      const [header, claims, signature] = new URLSearchParams(init.body).get("assertion").split(".");
      const valid = crypto.verify("sha256", Buffer.from(`${header}.${claims}`), publicKey, Buffer.from(signature, "base64url"));
      assert.equal(valid, true);
      assert.equal(JSON.parse(Buffer.from(claims, "base64url")).iss, "push@nownow-test.iam.gserviceaccount.com");
      return Response.json({ access_token: "google-token", expires_in: 3600 });
    }
    const { message } = JSON.parse(init.body);
    if (message.token === "dead-token") {
      return Response.json(
        { error: { status: "NOT_FOUND", details: [{ errorCode: "UNREGISTERED" }] } },
        { status: 404 }
      );
    }
    return Response.json({ name: "projects/nownow-test/messages/1" });
  };

  try {
    delete require.cache[require.resolve("../services/pushService")];
    const pushService = require("../services/pushService");
    assert.equal(pushService.isConfigured(), true);

    const ok = await pushService.sendToToken("live-token", { title: "뿡뿡이", body: "안녕", data: { type: "daily_checkin" } });
    assert.deepEqual(ok, { ok: true });

    const sendCall = calls.find(call => call.url.includes("fcm.googleapis.com"));
    assert.equal(sendCall.url, "https://fcm.googleapis.com/v1/projects/nownow-test/messages:send");
    assert.equal(sendCall.init.headers.Authorization, "Bearer google-token");
    assert.deepEqual(JSON.parse(sendCall.init.body).message.notification, { title: "뿡뿡이", body: "안녕" });

    const dead = await pushService.sendToToken("dead-token", { title: "t", body: "b" });
    assert.deepEqual(dead, { ok: false, invalidToken: true, reason: "UNREGISTERED" });

    // 접근 토큰은 한 번만 받아서 재사용한다
    assert.equal(calls.filter(call => call.url.includes("oauth2")).length, 1);
  } finally {
    global.fetch = realFetch;
    delete process.env.FCM_SERVICE_ACCOUNT_PATH;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
