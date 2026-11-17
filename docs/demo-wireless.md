# 시연: USB 없이 노트북 백엔드 + 휴대폰

노트북에서 백엔드를 띄우고, 휴대폰을 **노트북 모바일 핫스팟**에 연결해서 시연한다.
Supabase·OpenAI는 클라우드라서 **노트북은 인터넷에 연결돼 있어야** 한다.

```
휴대폰 ──(노트북 핫스팟 와이파이)──▶ 노트북 백엔드 http://192.168.137.1:5000 ──(인터넷)──▶ Supabase · OpenAI
```

## 1. 미리 한 번 (시연 전날까지)

### 노트북
1. 레포 받기, `npm install`, `cd backend && npm install`
2. `backend/.env` 채우기 (`backend/.env.example` 참고)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_RELAY_URL`, `AI_RELAY_TOKEN` — 없으면 **채팅 답변이 안 나온다**
   - `OPENAI_API_KEY`, `YOUTUBE_API_KEY`
3. 핫스팟 되는지 확인: **설정 → 네트워크 및 인터넷 → 모바일 핫스팟**이 켜지는지
4. 방화벽에서 5000번 포트 열기 (관리자 PowerShell, 시연 끝나면 지워도 된다)
   ```powershell
   New-NetFirewallRule -DisplayName "NowNow backend 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
   ```
   지우기: `Remove-NetFirewallRule -DisplayName "NowNow backend 5000"`

### 시연용 APK 만들기
```sh
npm run build:demo-apk
```
- 결과: `android/app/build/outputs/apk/debug/app-debug.apk`
- 앱 코드가 APK 안에 들어 있어서 **Metro 없이** 실행되고, 서버 주소가 `http://192.168.137.1:5000`으로 고정된다.
- 핫스팟 주소가 다르면(아래 3번 확인) 주소를 바꿔서 직접 빌드한다.
  ```sh
  cd android && gradlew.bat assembleDebug -PnownowBundledTest -PnownowApiBaseUrl=http://<노트북IP>:5000
  ```
  내부망 주소(192.168.x.x, 10.x.x.x, 172.16~31.x.x)만 허용된다.

### 휴대폰
1. APK 설치 (설정에서 "출처를 알 수 없는 앱 설치" 허용)
2. 테스트 계정으로 로그인
3. Health Connect 권한: 나우나우 → 걸음·심박·혈중산소·혈압·수면 **읽기** 허용

## 2. 시연 당일

1. 노트북을 인터넷(행사장 와이파이 등)에 연결
2. **모바일 핫스팟 켜기**
3. 노트북 핫스팟 주소 확인 — 보통 `192.168.137.1`
   ```powershell
   ipconfig | findstr 192.168.137
   ```
4. 백엔드 실행: `cd backend && npm start`
5. 휴대폰을 노트북 핫스팟 와이파이에 연결
6. 휴대폰 브라우저에서 `http://192.168.137.1:5000/api/character/level` 열기
   → `{"message":"로그인이 필요합니다."}`가 보이면 연결 성공
7. 앱 실행

노트북 절전 모드가 켜지면 핫스팟이 끊길 수 있다. 전원 연결 + 절전 끄기.

## 3. 혈압계 (오므론 HEM-7142T2)

검증된 경로: **혈압계 → OMRON connect 앱 → Health Connect → 나우나우 리포트**

미리:
- 휴대폰에 OMRON connect 설치, 혈압계 페어링
- Health Connect에서 OMRON connect의 혈압 **쓰기**, 나우나우의 혈압 **읽기** 허용

당일:
- 리포트는 **오늘 0시 이후** 혈압만 보여 준다 → 시연 날 미리 한 번 재 둔다
- 잰 뒤 OMRON connect 앱을 한 번 열어 동기화 → 나우나우 리포트에서 새로고침

주의: 내 설정의 **혈압계 연결 → 검색 시작**(블루투스 직접 수신)은 실기기 검증 전이라 시연에서 쓰지 않는다.

## 안 될 때

| 증상 | 확인 |
|---|---|
| 앱에서 "서버에 연결하지 못했어요" | 휴대폰이 노트북 핫스팟에 붙어 있는지, 6번 브라우저 확인, 방화벽 규칙 |
| 브라우저에서도 안 열림 | 백엔드가 켜져 있는지(`npm start` 창), 핫스팟 주소가 `192.168.137.1`인지 |
| 채팅만 "AI 중계 설정이 필요합니다" | `backend/.env`의 `AI_RELAY_URL`, `AI_RELAY_TOKEN` |
| 로그인·데이터가 안 뜸 | 노트북 인터넷 연결 (Supabase) |
| 행사장 와이파이가 로그인 페이지형이라 핫스팟 공유가 안 됨 | 다른 휴대폰 핫스팟에 노트북·시연폰 둘 다 연결 → 노트북 IP 확인 후 그 주소로 APK 다시 빌드 |
