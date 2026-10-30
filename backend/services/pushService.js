// Firebase Cloud Messaging(FCM) HTTP v1로 푸시를 보낸다. 추가 라이브러리 없이
// 서비스 계정 키로 구글 접근 토큰을 받아 쓴다.
// 환경변수 FCM_SERVICE_ACCOUNT_PATH: Firebase 콘솔에서 받은 서비스 계정 JSON 파일 경로
// (예: secrets/firebase-service-account.json, Git에 올리지 않는다)

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

let account;
let accessToken = null;

function loadAccount() {
  if (account !== undefined) return account;

  const file = process.env.FCM_SERVICE_ACCOUNT_PATH;
  if (!file) {
    account = null;
    return account;
  }

  account = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8"));
  return account;
}

const isConfigured = () => loadAccount() !== null;

const base64url = value => Buffer.from(value).toString("base64url");

// 서비스 계정으로 서명한 JWT를 구글 접근 토큰(1시간)으로 바꾼다. 만료 1분 전까지 재사용.
async function getAccessToken() {
  if (accessToken && accessToken.expiresAt - 60_000 > Date.now()) {
    return accessToken.value;
  }

  const { client_email, private_key } = loadAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );
  const signature = crypto
    .sign("sha256", Buffer.from(`${header}.${claims}`), private_key)
    .toString("base64url");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`
    })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`FCM 인증 실패: ${data.error_description ?? data.error}`);
  }

  accessToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
  return accessToken.value;
}

/**
 * 기기 하나에 알림을 보낸다.
 * 반환: { ok: true } | { ok: false, invalidToken: boolean, reason }
 * invalidToken이면 앱 삭제 등으로 더 이상 쓸 수 없는 토큰이라 지워도 된다.
 */
async function sendToToken(token, { title, body, data = {} }) {
  const { project_id } = loadAccount();
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data,
          android: { priority: "high" }
        }
      })
    }
  );

  if (response.ok) return { ok: true };

  const error = (await response.json().catch(() => null))?.error;
  const code = error?.details?.find(detail => detail.errorCode)?.errorCode;

  return {
    ok: false,
    invalidToken: code === "UNREGISTERED" || code === "INVALID_ARGUMENT",
    reason: code ?? error?.status ?? response.status
  };
}

module.exports = { isConfigured, sendToToken };
