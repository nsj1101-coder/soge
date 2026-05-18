# 백애(白愛) MVP 앱

> 사진보다 마음이 먼저, 가치관으로 시작하는 사랑

백애는 프로필 사진보다 가치관 답변을 먼저 보고 연결되는 소개팅 앱 MVP입니다. 이 저장소는 기획 문서와 디자인 시안을 바탕으로 만든 React Native + Expo 앱 프로토타입입니다.

## 구현 범위

- 온보딩
- 기본 프로필 입력
- 8문항 가치관 설문
- 사진 없는 오늘의 추천 카드
- 가치관 매칭률 계산
- 6시간 좋아요 제한 UI/로직
- 서로 좋아요 시 매칭 성공 화면
- 매칭 후 채팅
- 채팅 중 새로운 매칭 시작 시 백애꽃 1송이 차감
- 매칭 차단, 채팅 메시지 신고 흐름
- 마이페이지와 가치관 답변 확인

## 실행

```bash
npm install
npm run start
```

Android에서 확인하려면 Expo Go 또는 Android Emulator를 준비한 뒤 아래 명령을 사용합니다.

```bash
npm run android
```

브라우저 검증용 실행은 아래 명령을 사용합니다.

```bash
npm run web
```

## 개발 명령

```bash
npm run typecheck
```

## 주요 구조

```txt
app/
  _layout.tsx
  index.tsx
  auth.tsx
  values.tsx
  match-success.tsx
  (tabs)/
    recommendations.tsx
    matches.tsx
    chat.tsx
    profile.tsx
components/
constants/
data/
services/
state/
types/
docs/
design/
```

## 설계 메모

현재 MVP는 서버 없이 앱 내부 상태와 mock API 계층으로 동작합니다. 실제 출시 단계에서는 `services/api.ts`의 경계를 Node.js Express API와 MySQL/MariaDB 또는 Firebase로 교체하면 됩니다.

문서 원본은 `docs/`에 있고, 디자인 기준 이미지는 `design/baekae_ui_mockup_showcase.png`입니다.
