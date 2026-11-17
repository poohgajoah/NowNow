<p align="center">
  <img src="src/assets/images/charactor.png" width="140" alt="뿡뿡이" />
</p>

<h1 align="center">NowNow (나우나우)</h1>

<p align="center">
  스마트워치 생체 데이터로 스트레스를 측정하고,<br/>
  나를 기억하는 AI 캐릭터 <b>뿡뿡이</b>와 대화하며 관리하는 웰니스 케어 앱
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.85-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Kotlin-7F52FF?logo=kotlin&logoColor=white" />
  <img src="https://img.shields.io/badge/Health_Connect-4285F4?logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/pgvector-336791?logo=postgresql&logoColor=white" />
</p>

<p align="center">
  4인 팀 프로젝트 · 앱(React Native) · 백엔드(Node.js) · AI 서버(Cloudflare Worker)를 한 레포에서 관리해요
</p>

<!-- 📸 스크린샷: docs/ 폴더에 이미지를 넣고 경로를 바꿔 주세요
| 홈 | 채팅 | 실시간 리포트 | 주간 리포트 | 내 설정 |
|---|---|---|---|---|
| <img src="docs/home.jpg" width="160"/> | <img src="docs/chat.jpg" width="160"/> | <img src="docs/report-daily.jpg" width="160"/> | <img src="docs/report-weekly.jpg" width="160"/> | <img src="docs/mypage.jpg" width="160"/> |
-->

---

## 📑 목차

- [기획 배경](#-기획-배경)
- [주요 기능](#-주요-기능)
- [시스템 구성](#️-시스템-구성)
- [실행 방법](#-실행-방법)
- [시연: USB 없이 노트북 + 휴대폰](#-시연-usb-없이-노트북-백엔드--휴대폰)
- [Health Connect 연동](#-삼성헬스--health-connect-연동)
- [혈압계 연동](#-혈압계-연동)
- [폴더 구조](#-폴더-구조)
- [팀 구성](#-팀-구성)
- [앞으로 해볼 것](#-앞으로-해볼-것)

## 💡 기획 배경

- 스트레스를 받아도 **38.1%는 별다른 대처 없이 혼자 참는다**고 답했어요. (서울대 보건대학원 조사, 1,500명 대상)
- 국내 우울증 환자는 2024년 약 110만 명으로 5년 새 33% 늘었지만, 스트레스 인지율은 오히려 줄었어요. 스트레스를 **알아차리지 못하고 방치**하는 경우가 많다는 뜻이에요.
- 삼성헬스, Welltory 같은 기존 서비스는 측정값을 보여주는 데서 끝나요.

NowNow는 **항상 차고 있는 스마트워치**로 스트레스를 꾸준히 측정하고, 그 데이터를 아는 **AI 캐릭터와의 대화**로 정서적 케어까지 이어지게 만든 앱이에요.

## ✨ 주요 기능

### 🏠 홈 — 뿡뿡이 돌보기
- 캐릭터 방 위쪽의 **밥주기 · 놀이 · 음악 · 휴식** 아이콘을 누르면, 아이콘 바로 아래에 오늘의 선택지 3개가 떠요. 선택지는 날마다 바뀌어요.
- 고르면 뿡뿡이가 기뻐하고, 고른 결과는 **취향으로 저장**돼 챗봇 답변에 쓰여요. 오늘 아직 안 한 행동에는 `!` 표시가 떠요.
- **음악**은 오늘의 장르마다 대표곡을 **앨범 자켓**으로 보여 줘요. 누르면 그 곡이 바로 재생 대기 상태로 열리고, 유튜브 뮤직으로도 열 수 있어요.
- **밥주기**를 고르면 배달앱(배민·쿠팡이츠)으로 바로 갈 수 있어요.

### 💬 채팅 — 나를 기억하는 뿡뿡이
- 건강 기록, 과거 대화 요약(임베딩 의미 검색), 취향·별명을 합쳐 다정한 반말로 답해요.
- 대화에 맞춰 **할 일을 버튼으로 제안**해요. 명상·스트레칭 영상, 음식·배달앱, 음악, 영화(CGV·메가박스) 등이에요.
- **오늘의 건강기록♡** 버튼으로 내 건강 데이터를 바탕으로 상담받을 수 있어요.
- 하루를 정리하면 스트레스 원인 **키워드**를 자동으로 분류해요. 키워드는 직접 추가할 수도 있어요.
- 위험한 수치나 표현을 감지하면 전문 도움을 안내하는 **안전 가드레일**이 있어요. ([`shared/careSafety.js`](shared/careSafety.js))

### 📊 리포트
- **실시간 리포트**: 오늘의 걸음 수, 심박수, 수면, 혈압, 혈중산소와 시간대별 스트레스(최고·최저 시간과 점수)
- **주간 리포트**: 7일간 건강·대화 데이터로 본 스트레스 변화와 원인 키워드 집계
- 최근 기록과 원인 키워드를 바탕으로 **AI 추천**을 보여 줘요. 서버에 연결할 수 없으면 기본 추천을 보여 줘요.
- 혈압은 직접 입력하거나, 오므론 혈압계 기록을 가져올 수 있어요. ([혈압계 연동](#-혈압계-연동))

### 📈 스트레스 지수
- 심박수와 pseudo-HRV로 시간대별 스트레스를 계산하고, 수면·걸음 수·혈압·혈중산소를 반영해 **100점 만점 일일 스트레스 지수**를 내요.
- 서버가 **매일 새벽 3시(KST)** 전날 점수를 계산해 저장해요. 서버가 꺼져 있던 날은 켜질 때 채워 넣어요. ([`dailyStressScheduler.js`](backend/jobs/dailyStressScheduler.js))
- 내 설정에서 **스트레스 감지 기준**을 나에게 맞게 바꿀 수 있어요.

### ⚙️ 내 설정
- 계정(별명·성별·나이), MBTI와 활동·음식·음악 취향
- 알림: 하루 마무리 · 날씨 · 놀자(평일/주말/매일) · 안부 알림. 폰에서 직접 예약해요.
- 라이트/다크 모드, 건강 데이터 권한·앱 권한 관리, 혈압계 연결

## 🏗️ 시스템 구성

```
 Galaxy Watch      오므론 혈압계
     │                 │
     ▼                 ▼
 Samsung Health    OMRON connect
     └──────┬──────────┘
            ▼
     Health Connect ──▶ HealthConnectModule.kt (Kotlin, RN Bridge)
                                   │
                     ┌─────────────▼──────────────┐
                     │     React Native 앱 (src/)   │
                     └─────────────┬──────────────┘
                                   │ Supabase 로그인 토큰
                                   ▼
                     Node.js / Express 백엔드 (backend/)
          (인증 · 건강 · 채팅 · 리포트 · 스트레스 · 캐릭터 · 음악 API)
              │                   │                    │
              │ AI_RELAY          │ 임베딩              │
              ▼                   ▼                    ▼
   AI 서버 (chatbot-server/)   OpenAI Embeddings     Supabase PostgreSQL
   Cloudflare Worker ──▶       (text-embedding-      + pgvector
   OpenAI gpt-4o-mini          3-small, 1536차원)    (사용자 · 건강 기록 · 채팅
   (챗봇 답변 · 리포트 추천)                           요약 · 리포트 · 임베딩)
```

- 앱은 LLM이나 DB를 직접 부르지 않아요. 모든 요청은 로그인 토큰과 함께 **백엔드**로 가고, 서버가 토큰으로 사용자를 확인해요.
- **챗봇 답변 · 리포트 AI 추천**: 백엔드가 건강 기록 · 대화 기억 · 취향을 모아 AI 서버의 `/chat`으로 중계하고, AI 서버가 OpenAI를 호출해요. ([`chatRelayService.js`](backend/services/chatRelayService.js), [`chatbot-server/worker.mjs`](chatbot-server/worker.mjs))
- **대화 기억 검색**: 최근 30일 채팅 요약을 벡터로 만들어 `memory_embeddings`에 저장하고, 질문과 가까운 요약 3개를 찾아 챗봇에 넘겨요. ([`chatMemorySearch.js`](backend/services/chatMemorySearch.js)) `OPENAI_API_KEY`가 없으면 이 단계는 건너뛰어요.
- **음악 추천**: 백엔드가 YouTube Data API v3로 장르별 곡을 찾아요.
- AI 서버 주소 · 토큰, OpenAI · YouTube 키는 백엔드 `.env`에만 두고 앱에는 넣지 않아요.

### 백엔드 API

| 경로 | 하는 일 |
|---|---|
| `/api/auth` | 회원가입 · 로그인 |
| `/api/me` | 내 프로필 · 취향 · 설정 |
| `/api/health` | 건강 기록 저장(증분 동기화) · 조회 |
| `/api/chat` | 대화 저장 · AI 답변 중계 · 하루 요약 |
| `/api/reports` | 실시간 · 주간 리포트, AI 추천 |
| `/api/stress` | 스트레스 점수 |
| `/api/moods` | 기분 기록 |
| `/api/character` | 홈 캐릭터 행동(밥주기 · 놀이 · 음악 · 휴식) 저장 |
| `/api/music` | 장르별 추천곡 |

자세한 요청 · 응답은 [`docs/backend-api-requirements.md`](docs/backend-api-requirements.md)에 있어요.

## 🚀 실행 방법

### 1. 백엔드

```sh
cd backend
cp .env.example .env   # 값 채우기 (아래 표)
npm install
npm start              # http://localhost:5000
npm test               # 자동 테스트
```

| `.env` 값 | 용도 |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | DB · 로그인 (service role 키는 절대 커밋 금지) |
| `AI_RELAY_URL`, `AI_RELAY_TOKEN` | AI 서버 주소와 토큰 |
| `OPENAI_API_KEY` | (선택) 대화 기억 의미 검색 |
| `YOUTUBE_API_KEY` | 홈 음악 추천곡 |

### 2. 앱 (Android)

```sh
npm install
npm start              # Metro (개발 서버)
npm run android        # 다른 터미널에서 빌드 · 설치
```

- **에뮬레이터**는 PC의 `localhost:5000`을 `10.0.2.2`로 자동 접속해요. Health Connect를 못 읽으면 개발 빌드에서는 **목업 건강 데이터**가 나와요.
- **USB로 연결한 실기기**는 PC 서버에 닿도록 포트를 연결해 줘요.
  ```sh
  adb reverse tcp:8081 tcp:8081   # Metro
  adb reverse tcp:5000 tcp:5000   # 백엔드
  ```
- Windows에서 `npm run android`가 `'gradlew.bat' is not recognized`로 실패하면, `android` 폴더에서 직접 빌드해요.
  ```sh
  cd android && gradlew.bat app:installDebug
  ```
- 실제 건강 데이터는 **Android + Health Connect** 기기에서만 나와요. 설정 방법은 [실기기 연동 설정](#실기기-연동-설정-갤럭시워치-기준)을 참고하세요.

### 3. AI 서버 (Cloudflare Worker)

```sh
cd chatbot-server
node --test                              # 테스트
npx wrangler secret put OPENAI_API_KEY   # OpenAI 키
npx wrangler secret put DEMO_TOKEN       # 백엔드 AI_RELAY_TOKEN과 같은 값
npx wrangler deploy
```

배포한 주소를 백엔드 `.env`의 `AI_RELAY_URL`에 넣어요. 키와 토큰은 Cloudflare 비밀값으로만 두고 코드에는 넣지 않아요.

## 📱 시연: USB 없이 노트북 백엔드 + 휴대폰

노트북에서 백엔드를 띄우고, 휴대폰을 **노트북의 모바일 핫스팟**에 연결해서 시연해요. USB 케이블도, Metro(개발 서버)도 필요 없어요.

```
 시연 휴대폰 ──(노트북 핫스팟 와이파이)──▶ 노트북 백엔드 http://192.168.137.1:5000
                                                      │
                                               (노트북 인터넷)
                                                      ▼
                                         Supabase · AI 서버 · OpenAI · YouTube
```

- 휴대폰은 **노트북 핫스팟**에만 연결해요. 행사장 와이파이는 기기끼리 서로 못 보게 막혀 있는 경우가 많아서예요.
- 노트북은 **인터넷에 연결돼 있어야** 해요. DB(Supabase)와 AI가 클라우드에 있어요.
- Windows 핫스팟에 붙은 기기에서 노트북 주소는 보통 **`192.168.137.1`**로 고정이에요. 그래서 이 주소를 넣은 APK를 미리 만들어 둘 수 있어요.

### 준비물

| 준비물 | 비고 |
|---|---|
| Windows 노트북 | 모바일 핫스팟이 켜져야 함 (아래 1-3에서 확인) |
| 노트북 인터넷 | 행사장 와이파이 / 유선 / 다른 폰 테더링 |
| Android 시연 폰 | Health Connect 있는 기기 (Android 14 이상은 기본 내장) |
| 테스트 계정 | 앱 로그인용 |
| 오므론 혈압계 HEM-7142T2 | 혈압 시연용, 건전지 확인 |
| `backend/.env` 값 | 팀원에게 받기 (아래 1-2) |

### 1. 노트북 준비 (시연 전날까지, 한 번만)

**1-1. 프로젝트 받기**
```sh
git clone https://github.com/poohgajoah/NowNow.git
cd NowNow
git checkout feat/wireless-demo   # main에 합쳐지기 전까지
npm install
cd backend && npm install && cd ..
```
- Node.js 22 이상, Android 빌드 환경(JDK 17, Android SDK)이 있어야 APK를 만들 수 있어요.
- 빌드 환경이 없으면 다른 컴퓨터에서 만든 APK 파일만 받아서 폰에 설치해도 돼요(아래 2번 결과물).

**1-2. 백엔드 설정 파일 `backend/.env`**

`backend/.env.example`을 복사해서 `backend/.env`를 만들고 값을 채워요.

```
PORT=5000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_RELAY_URL=...
AI_RELAY_TOKEN=...
OPENAI_API_KEY=...
YOUTUBE_API_KEY=...
```

| 값 | 없으면 |
|---|---|
| `SUPABASE_*` | 로그인·모든 데이터가 안 됨 (**필수**) |
| `AI_RELAY_URL`, `AI_RELAY_TOKEN` | **채팅에서 뿡뿡이가 대답을 못 함** ("AI 중계 설정이 필요합니다") |
| `OPENAI_API_KEY` | 대화 기억 검색만 꺼짐 (채팅은 됨) |
| `YOUTUBE_API_KEY` | 홈 음악 추천곡(앨범 자켓)이 안 뜸 |

> `.env`는 GitHub에 올라가지 않아요. 키는 메신저로 주고받은 뒤 파일에만 넣고, 채팅방에는 남기지 않는 게 좋아요.

**1-3. 모바일 핫스팟 되는지 확인**
1. **설정 → 네트워크 및 인터넷 → 모바일 핫스팟**
2. "인터넷 연결 공유"가 지금 쓰는 와이파이로 되어 있는지 확인하고 **켜기**
3. 네트워크 이름·암호를 확인해 둬요. **속성 → 편집**에서 바꿀 수 있어요.

켜지지 않으면 그 노트북은 핫스팟을 지원하지 않는 거예요. 아래 "안 될 때"의 다른 방법을 써요.

**1-4. 방화벽에서 5000번 포트 열기**

휴대폰이 노트북 백엔드에 접속할 수 있게 해 줘요. **관리자 권한 PowerShell**에서 한 번만 실행해요.
```powershell
New-NetFirewallRule -DisplayName "NowNow backend 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```
- 관리자 PowerShell: 시작 메뉴에서 "PowerShell" 검색 → 마우스 오른쪽 → **관리자 권한으로 실행**
- 처음 `npm start` 할 때 "Node.js 네트워크 액세스 허용" 창이 뜨면 **허용**을 눌러도 돼요.
- 시연이 끝나면 지워도 돼요.
  ```powershell
  Remove-NetFirewallRule -DisplayName "NowNow backend 5000"
  ```

### 2. 시연용 APK 만들기

```sh
npm run build:demo-apk
```
- 결과물: `android/app/build/outputs/apk/debug/app-debug.apk` (약 190MB)
- 이 APK는
  - 앱 코드가 안에 들어 있어서 **Metro 없이** 혼자 실행돼요.
  - 서버 주소가 **`http://192.168.137.1:5000`**으로 고정돼 있어요.
- 핫스팟 주소가 다르면(아래 3-3에서 확인) 그 주소로 직접 빌드해요.
  ```sh
  cd android
  gradlew.bat assembleDebug -PnownowBundledTest -PnownowApiBaseUrl=http://<노트북IP>:5000
  ```
  - `http://`는 내부망 주소(`192.168.x.x`, `10.x.x.x`, `172.16~31.x.x`)만 허용돼요. 다른 주소면 빌드가 멈춰요.
  - 배포 서버가 생기면 `-PnownowApiBaseUrl=https://서버주소`로 빌드하면 돼요.
- 빌드가 `'gradlew.bat' is not recognized`로 실패하면 `android` 폴더 안에서 `gradlew.bat ...`를 직접 실행해요.

### 3. 시연 폰 준비 (시연 전날까지)

**3-1. APK 설치**
1. APK 파일을 폰으로 옮겨요. USB 파일 복사, 카카오톡 나에게 보내기, 구글 드라이브 등 아무거나 돼요.
2. 폰에서 파일을 열고, "출처를 알 수 없는 앱 설치" 허용을 묻으면 허용해요.
3. 예전 나우나우가 있는데 설치가 안 되면 지우고 다시 설치해요.

**3-2. 로그인 + 건강 데이터 권한**
1. 앱 실행 → 테스트 계정으로 로그인
2. Health Connect 권한을 물으면 **모두 허용**해요: 걸음 수, 심박수, 혈중 산소, 혈압, 수면
   - 나중에 바꾸기: 폰 **설정 → Health Connect → 앱 권한 → NowNow**
3. 갤럭시워치 데이터도 보여 줄 거면 삼성헬스 → 설정 → Health Connect에서 쓰기를 허용해요. ([실기기 연동 설정](#실기기-연동-설정-갤럭시워치-기준))

**3-3. 오므론 혈압계 연결** (아래 [혈압계 시연](#혈압계-시연) 참고)

### 4. 리허설 (시연 전날 꼭 한 번)

실제 장소와 비슷하게 처음부터 끝까지 한 번 해 봐요. 아래 "시연 당일 순서"를 그대로 따라 하면 돼요. 특히 **폰 브라우저 연결 확인(5-6)**이 되는지 꼭 봐요.

### 5. 시연 당일 순서

1. **노트북 인터넷 연결**: 행사장 와이파이 / 유선 / 테더링
2. **노트북 전원 연결 + 절전 끄기**: 절전 모드로 들어가면 핫스팟이 끊겨요.
   - 설정 → 시스템 → 전원 → 화면·절전 시간을 "안 함"으로
3. **모바일 핫스팟 켜기**
4. **노트북 핫스팟 주소 확인** (PowerShell)
   ```powershell
   ipconfig | findstr 192.168.137
   ```
   - `IPv4 주소 . . . : 192.168.137.1`이 보이면 OK
   - 다른 주소면 2번에서 그 주소로 APK를 다시 만들어야 해요.
5. **백엔드 실행**
   ```sh
   cd backend
   npm start
   ```
   - `Server running on port 5000`이 보이면 OK
   - 이 창은 시연이 끝날 때까지 **닫지 않아요**.
6. **시연 폰을 노트북 핫스팟 와이파이에 연결** → 폰 브라우저에서 아래 주소 열기
   ```
   http://192.168.137.1:5000/api/character/level
   ```
   - `{"message":"로그인이 필요합니다."}`가 보이면 **연결 성공**이에요. 로그인 없이 열어서 이 메시지가 맞아요.
   - 안 열리면 아래 "안 될 때"를 봐요.
7. **앱 실행**: 홈에 레벨·캐릭터가 보이면 준비 끝
8. (혈압 시연이면) 혈압계로 한 번 재고 → OMRON connect로 동기화 → 나우나우 리포트에서 확인

### 혈압계 시연

**검증된 경로**
```
오므론 HEM-7142T2 ──(블루투스)──▶ OMRON connect 앱 ──▶ Health Connect ──▶ 나우나우 리포트
```
S24에서 혈압계 화면 값과 나우나우 값이 같은 것까지 확인했어요.

**미리 할 것**
1. 시연 폰에 **OMRON connect** 앱 설치 (Play 스토어)
2. OMRON connect에서 혈압계 **페어링**: 앱 안내대로 혈압계 블루투스 버튼을 길게 눌러 화면에 `-P-`가 깜박일 때 연결
3. OMRON connect 설정에서 **Health Connect 연동 켜기** → 혈압 **쓰기** 허용
4. Health Connect → 앱 권한 → **NowNow → 혈압 읽기** 허용
5. 한 번 재서 나우나우 리포트에 뜨는지 확인

**당일**
- 리포트는 **오늘 0시 이후** 혈압만 보여 줘요. 시연 시작 전에 미리 한 번 재 둬요.
- 재고 나서 **OMRON connect 앱을 열어** 동기화해요. Health Connect로 넘어가는 데 몇십 초 걸릴 수 있어요.
- 나우나우 **리포트 → 새로고침**을 누르면 혈압 카드에 떠요.
- 바로 안 뜨면 OMRON connect를 한 번 더 열었다가 다시 새로고침해요.

**시연에서 쓰지 않을 것**
- **내 설정 → 혈압계 연결 → 검색 시작**(블루투스 직접 수신)은 실제 혈압계로 아직 검증하지 않았어요. 위 OMRON connect 경로로만 보여 줘요.

### 안 될 때

| 증상 | 확인할 것 |
|---|---|
| 앱에 "서버에 연결하지 못했어요" | ① 폰이 **노트북 핫스팟**에 붙어 있는지 (행사장 와이파이 아님) ② 5-6번 브라우저 확인 ③ 백엔드 창이 켜져 있는지 |
| 폰 브라우저에서도 안 열림 | ① 백엔드 `npm start` 창 확인 ② 방화벽 규칙(1-4) ③ 주소가 `192.168.137.1`인지(5-4) |
| 로그인은 되는데 데이터가 하나도 안 뜸 | 노트북 인터넷 연결 (Supabase) |
| 채팅에 "AI 중계 설정이 필요합니다" | `backend/.env`의 `AI_RELAY_URL`, `AI_RELAY_TOKEN` → 백엔드 다시 시작 |
| 홈 음악 앨범 자켓 대신 🎵만 뜸 | `backend/.env`의 `YOUTUBE_API_KEY` |
| 리포트에 혈압이 안 뜸 | 오늘 잰 기록인지, OMRON connect 동기화, Health Connect 권한(혈압 쓰기/읽기) |
| 앱 화면이 하얗게만 나옴 | 앱 완전히 종료(최근 앱에서 밀기) 후 다시 실행 |
| 행사장 와이파이가 로그인 페이지형이라 핫스팟 공유가 안 됨 | 다른 폰 핫스팟에 **노트북과 시연 폰 둘 다** 연결 → 노트북 IP 확인(`ipconfig`) → 그 주소로 APK 다시 빌드(2번) |
| 노트북이 핫스팟을 지원하지 않음 | 위와 같이 다른 폰 핫스팟 사용 |

## ⌚ 삼성헬스 · Health Connect 연동

### 왜 Health Connect인가
- 처음에는 **삼성헬스 SDK**로 갤럭시워치 데이터를 바로 읽으려고 했어요. 그런데 삼성헬스 SDK는 **파트너 승인**이 필요했고, 프로젝트 기간 안에 승인이 나지 않았어요.
- 그래서 구글과 삼성이 함께 만든 Android 건강 데이터 플랫폼인 **Health Connect**를 쓰기로 했어요. 삼성헬스가 Health Connect로 데이터를 동기화해 주기 때문에, 앱은 **Health Connect만 읽으면** 돼요.
- 덕분에 앱이 특정 기기에 묶이지 않아요. 오므론 혈압계, Fitbit 등 Health Connect에 데이터를 쓰는 다른 기기도 같은 코드로 읽혀요.

### 데이터 흐름

```
 Galaxy Watch ──(블루투스)──▶ Samsung Health ──(동기화)──▶ Health Connect
                                                              │
                                  HealthConnectModule (Kotlin · Coroutine IO · Promise)
                                       │                              │
                           getHealthData() · 화면 표시     syncHealthData() · 증분 동기화
                                       ▼                              ▼
                              리포트 카드 · 차트          POST /api/health/records → Supabase
```

### 읽는 데이터

| 데이터 | Health Connect 레코드 | 권한 | 화면 표시 범위 |
|---|---|---|---|
| 걸음 수 | `StepsRecord` (`COUNT_TOTAL` 집계) | `READ_STEPS` | 오늘 0시 ~ 지금 |
| 심박수 | `HeartRateRecord` | `READ_HEART_RATE` | 오늘 0시 ~ 지금 |
| 산소포화도 | `OxygenSaturationRecord` | `READ_OXYGEN_SATURATION` | 오늘 0시 ~ 지금 |
| 혈압 | `BloodPressureRecord` | `READ_BLOOD_PRESSURE` | 오늘 0시 ~ 지금 |
| 수면 | `SleepSessionRecord` | `READ_SLEEP` | 최근 24시간 |

- 시간 값은 모두 ISO-8601 문자열이에요. 혈압에는 기록한 앱(`sourcePackage`)도 같이 넘겨요.
- 심박수는 레코드 하나에 샘플이 여러 개라 모두 펼친 뒤 가장 늦은 값을 최신값으로 써요.
- 수면은 자정을 넘기므로 **최근 24시간** 기준으로 읽어요.

### 저장 — 증분 동기화

앱은 [`healthSync.ts`](src/services/health/healthSync.ts)로 기록을 백엔드 `POST /api/health/records`에 보내요. 앱은 DB에 직접 쓰지 않아요.

- **언제**: 앱을 켜거나 다시 볼 때(5분 간격), 리포트의 새로고침 버튼
- **무엇을**: Health Connect **Changes API**로 마지막 동기화 뒤에 추가 · 수정 · 삭제된 기록만 읽어요. 첫 동기화는 최근 30일을 읽어요.
- **실패해도 안 빠짐**: 서버 저장이 모두 성공했을 때만 동기화 위치를 저장해요. 실패하면 다음에 같은 변경분부터 다시 보내요.
- **수정 · 삭제 반영**: Health Connect 레코드 id와 기록한 앱을 같이 저장해서, 바뀐 기록은 고치고 지워진 기록은 서버에서도 지워요.
- **걸음 수**: 폰과 워치 기록이 겹치므로 Health Connect 집계(중복 제거)를 시간별로 보내요.
- 잘못 잰 값 하나 때문에 동기화가 멈추지 않도록 이상한 행만 건너뛰어요.

| 요청 키 | 테이블 | 중복 기준 |
|---|---|---|
| `heart_rate` | `heart_rate_records` | `user_id, measured_at` |
| `blood_pressure` | `blood_pressure_records` | `user_id, measured_at` |
| `oxygen` | `oxygen_records` | `user_id, measured_at` |
| `steps` + `steps_replace` | `steps_records` (시간별) | 구간 교체 |
| `sleep` | `sleep_records` | `user_id, start_time, end_time` |
| `deleted` | 위 테이블 중 출처 컬럼이 있는 4개 | `source_record_id` |

- 혈압은 자동 동기화에서 빼고, **직접 입력 · 블루투스 수신 값만 서버에 저장**해요. Health Connect 혈압은 리포트 화면에만 합쳐서 보여 줘요.
- `user_id`는 앱이 보내지 않아요. 서버가 로그인 토큰으로 정해요.

### 네이티브 모듈 구성

| 파일 | 역할 |
|---|---|
| [`HealthConnectModule.kt`](android/app/src/main/java/com/mibandtest/HealthConnectModule.kt) | `getHealthData()` · `syncHealthData()`. IO 코루틴에서 읽고 Promise로 돌려줘요. |
| [`HealthConnectPackage.kt`](android/app/src/main/java/com/mibandtest/HealthConnectPackage.kt) | 모듈을 `ReactPackage`로 묶어 등록해요. |
| [`AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml) | 건강 데이터 읽기 · 블루투스 · 알림 권한, Health Connect 권한 화면용 activity-alias |
| [`mockHealthData.ts`](src/services/health/mockHealthData.ts) | 에뮬레이터 등 개발 환경용 목업 데이터 (서버에 저장하지 않음, 릴리스 빌드에선 안 씀) |

### 실기기 연동 설정 (갤럭시워치 기준)

1. **Health Connect 확인**: Android 14 이상은 시스템에 내장돼 있어요. Android 13 이하는 Play 스토어에서 설치해요.
2. **워치 ↔ 삼성헬스 연결**: Galaxy Wearable 앱으로 페어링하고, 삼성헬스에 데이터가 들어오는지 확인해요.
3. **삼성헬스 → Health Connect 쓰기 허용**: 삼성헬스 → 설정 → Health Connect에서 걸음 수 · 심박수 · 혈중 산소 · 혈압 · 수면을 허용해요.
4. **NowNow 읽기 허용**: Health Connect → 앱 권한 → NowNow에서 5가지 읽기를 모두 허용해요.
5. 앱의 **리포트**를 열면 데이터가 표시돼요. Logcat의 `HEALTH_DATA` / `HEALTH_ERROR` 태그로 값과 오류를 볼 수 있어요.

> 갤럭시워치 혈압은 **Samsung Health Monitor 앱**에서 커프 혈압계로 보정한 뒤에 측정할 수 있어요.

### 주의할 점 · 한계
- 동기화는 앱이 켜져 있을 때만 돌아요. 기록이 빠지지는 않지만 서버에 늦게 들어가요. 백그라운드 동기화는 [설계 문서](docs/background-sync-design.md)만 있어요.
- 삼성헬스 → Health Connect 동기화는 실시간이 아니라서, 방금 잰 값이 늦게 보일 수 있어요.
- 갤럭시워치의 **ECG 원시 데이터와 HRV(RR 간격)는 Health Connect로 넘어오지 않아요.** 그래서 심박수 표준편차 기반 pseudo-HRV로 계산해요.
- Health Connect는 Android 전용이에요. iOS에서는 건강 데이터가 표시되지 않아요.

## 🩺 혈압계 연동

| 경로 | 방법 | 상태 |
|---|---|---|
| **오므론 혈압계** (HEM-7142T2) | 혈압계 → OMRON connect 앱 → Health Connect → NowNow 리포트 | ✅ S24에서 값 일치 확인 |
| **블루투스 직접 수신** | 내 설정 → 혈압계 연결 → 검색 시작. 표준 혈압 서비스(BLE `0x1810`)로 측정값을 받아 저장 | 🧪 실기기 검증 필요 |
| **갤럭시워치** | Samsung Health Monitor에서 측정 → Health Connect | ✅ |
| **직접 입력** | 리포트 혈압 카드에서 수축기 · 이완기 입력 | ✅ |

- 블루투스 직접 수신 코드: [`bloodPressureBluetooth.ts`](src/services/bloodPressureBluetooth.ts) (Android 12 이상)
- 조사 내용과 확인 순서: [`docs/omron-hem-7142t2-integration.md`](docs/omron-hem-7142t2-integration.md)

## 📁 폴더 구조

```
src/
├─ navigation/       # 로그인 분기 · 하단 탭 (홈 · 채팅 · 리포트 · 내 설정)
├─ screens/          # 화면별 폴더 (컴포넌트 · 훅 · 상수 · 타입을 화면 안에 둠)
│   ├─ Home/ Chat/ Report/ Profile/ Login/
├─ services/
│   ├─ api/          # 백엔드 API 호출
│   ├─ health/       # Health Connect 동기화 · 목업
│   ├─ notifications/# 폰에서 예약하는 알림
│   ├─ delivery/     # 배달앱 열기
│   └─ bloodPressureBluetooth.ts
├─ theme/            # 라이트/다크 테마, 색 · 간격
└─ assets/
android/app/src/main/java/com/mibandtest/
└─ HealthConnectModule.kt, HealthConnectPackage.kt
backend/             # Node.js / Express 서버 (routes · services · jobs · db/migrations · tests)
chatbot-server/      # AI 서버 (Cloudflare Worker → OpenAI)
shared/              # 앱 · 서버가 같이 쓰는 코드 (안전 가드레일, 건강 기록 검색)
docs/                # API 명세, 설계 · 연동 문서
```

## 👥 팀 구성

| 팀원 | 맡은 부분 |
|---|---|
| [@poohgajoah](https://github.com/poohgajoah) | 건강 데이터 · 백엔드 · 홈 화면 |
| [@letsggong03](https://github.com/letsggong03) | 챗봇 대화 · 리포트 · 내 설정 · 혈압계 |
| [@h2st0ry](https://github.com/h2st0ry) | ERD 설계 · 초기 화면 UI/UX · 3D 캐릭터 |
<!-- TODO: 4번째 팀원 줄 추가 → | [@아이디](https://github.com/아이디) | 맡은 부분 | -->

### [@poohgajoah](https://github.com/poohgajoah)
- **Health Connect 네이티브 모듈 (Kotlin)**: 삼성헬스 SDK 승인이 기간 안에 나지 않아 Health Connect로 바꾸고, 걸음 수 · 심박수 · 산소포화도 · 혈압 · 수면을 읽는 모듈을 만들어 React Native Bridge로 연결했어요. 갤럭시워치를 직접 차고 테스트했어요.
- **증분 동기화**: Changes API로 바뀐 기록만 서버에 보내고, 저장에 성공했을 때만 위치를 갱신해 기록이 빠지지 않게 했어요.
- **스트레스 지수**: HRV 논문을 바탕으로 점수 기준을 정하고, 심박수 표준편차 기반 pseudo-HRV와 100점 만점 `FinalDailyStressScore` 공식을 만들었어요. 매일 새벽 3시 자동 계산도 붙였어요.
- **DB 구현 (Supabase)**: ERD를 Supabase에 맞게 반영하고, 건강 기록 raw 테이블과 임베딩용 pgvector 컬럼을 설계했어요.
- **백엔드 · AI 서버**: 앱 데이터가 모두 로그인 확인을 거쳐 백엔드로 가도록 바꾸고, AI 서버(Cloudflare Worker) 중계와 대화 기억 검색을 연결했어요.
- **홈 화면**: 게임처럼 뿡뿡이를 돌보는 홈(행동 아이콘 줄, 오늘의 선택지, 음악 앨범 자켓)과 새 앱 아이콘을 만들었어요.
- 로그인 · 회원가입과 세션 유지, 리포트 실시간 · 주간 구성, Android 빌드 오류 해결, 시스템 구성도 작성

### [@letsggong03](https://github.com/letsggong03)
- **뿡뿡이 대화**: 다정한 말투, 대화에 맞는 할 일 제안(영상 · 음식 · 배달앱 · 음악 · 영화), 오늘의 건강기록 상담
- **감정일기와 키워드**: 하루 정리에서 스트레스 원인 키워드 자동 분류 · 직접 추가, 리포트 집계 반영
- **안전 가드레일**: 위험한 수치나 표현을 감지해 도움을 안내 ([`shared/careSafety.js`](shared/careSafety.js))
- **리포트**: 걸음 수 · 수면 그래프, AI 추천과 기본 추천, 실시간 스트레스 분석, 혈압 직접 입력
- **내 설정**: 계정 · 별명 · 취향, 알림(하루 마무리 · 날씨 · 놀자 · 안부), 권한 관리
- **오므론 혈압계 연동**: Health Connect 혈압 표시, 블루투스 직접 수신 코드

### [@h2st0ry](https://github.com/h2st0ry)
- **ERD 설계**: 사용자 · 건강 · 채팅 · 리포트 데이터 구조 설계
- **3D 캐릭터**: 뿡뿡이 캐릭터 디자인 · 모델링 · 애니메이션
- **UI/UX 디자인**: 전체 화면 디자인
- **프로젝트 세팅**: React Native 프로젝트 생성, 폴더 구조(화면별 컴포넌트 · 훅 · 상수 분리) 설계
- **초기 화면 구현**
  - 홈: 캐릭터 방, 말풍선, 기분 선택, 먹이 · 놀이 · 음악 · 취미 상호작용과 취향 카드
  - 채팅: 대화 화면(아바타 · 헤더 · 말풍선 · 입력창), 대화 흐름 훅과 이야기 분석
  - 리포트: 지표 카드 · 수면 카드 · 추세 차트 · 스트레스 원인 카드 · 인사이트 카드
  - 내 설정: 프로필 헤더와 설정 메뉴
  - 하단 탭 네비게이션
- **테마**: 라이트/다크 모드 테마 시스템(색 · 간격), 화면 전체 다크 모드 색 조정

## 🧯 트러블슈팅

| 문제 | 해결 |
|---|---|
| 삼성헬스 SDK 개발 권한을 기간 내에 받지 못함 | Health Connect로 전환해 Kotlin 모듈을 직접 개발 |
| Kotlin 모듈이 앱과 따로 동작해 통합이 어려움 | React Native Bridge로 네이티브 모듈을 등록해 JS에서 호출 |
| 정밀한 HRV에 필요한 ECG 원시 데이터에 접근 불가 | 심박수 표준편차 기반 pseudo-HRV로 대체 |
| 며칠 만에 앱을 켜면 그 사이 건강 기록이 빠짐 | Changes API 기반 증분 동기화, 저장 성공 시에만 위치 갱신 |
| iOS 기준 프로젝트라 Android 빌드 실패 | 빌드 설정을 정리해 Android 실기기에서 실행 |

## 🛠️ 기술 스택

| 분야 | 사용 기술 |
|---|---|
| 앱 | React Native 0.85, React 19, TypeScript, React Navigation |
| 네이티브 | Kotlin, Health Connect 1.1.0, Kotlin Coroutines, react-native-ble-plx |
| 백엔드 | Node.js 22, Express 5 |
| DB · 인증 | Supabase PostgreSQL, pgvector, Supabase Auth |
| AI | Cloudflare Workers, OpenAI `gpt-4o-mini` (챗봇), `text-embedding-3-small` + pgvector (대화 기억 검색) |
| 외부 API | YouTube Data API v3 (음악 추천) |
| UI | react-native-svg (차트), lucide-react-native, react-native-youtube-iframe, Pretendard |

## 🔭 앞으로 해볼 것

- **유튜브 뮤직 연동**: 구글 로그인 후 내가 '좋아요' 누른 곡 중에서 장르별 대표곡 보여 주기
- 오므론 혈압계 블루투스 직접 수신 실기기 검증
- 백그라운드 건강 데이터 동기화: 기기 전용 토큰 + WorkManager ([설계](docs/background-sync-design.md))
- 백엔드 HTTPS 배포 (지금은 PC 서버 + USB 연결로 시연)
- Health Connect 설치 · 지원 여부 확인(`getSdkStatus`), iOS HealthKit 연동
