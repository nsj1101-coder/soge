# 05. VS Code 시작 가이드

## 개발 도구

Windows 기준으로 아래를 설치합니다.

```txt
1. VS Code
2. Node.js LTS
3. Git
4. Expo Go 앱
5. Android Studio 선택 설치
```

## Expo 프로젝트 생성

```bash
npx create-expo-app baekae
cd baekae
npx expo start
```

터미널에 QR 코드가 뜨면 휴대폰에서 Expo Go로 스캔합니다.

## 추천 VS Code 확장

```txt
ES7+ React/Redux/React-Native snippets
Prettier
ESLint
Tailwind CSS IntelliSense
React Native Tools
```

## 개발 흐름

```txt
VS Code에서 코드 작성
↓
Expo Go로 휴대폰 확인
↓
기능 완성
↓
EAS Build로 Android/iOS 빌드
↓
스토어 등록
```

## 첫 화면 개발 순서

```txt
1. 온보딩 화면
2. 로그인 / 회원가입
3. 가치관 설문
4. 오늘의 추천
5. 매칭 완료
6. 채팅
7. 마이페이지
```

## 프로젝트 폴더 예시

```txt
baekae/
├─ app/
│  ├─ index.tsx
│  ├─ onboarding.tsx
│  ├─ login.tsx
│  ├─ signup.tsx
│  ├─ values.tsx
│  ├─ recommendations.tsx
│  ├─ match-success.tsx
│  └─ chat.tsx
├─ components/
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ MatchRate.tsx
│  └─ FlowerBadge.tsx
├─ constants/
│  └─ colors.ts
├─ services/
│  └─ api.ts
└─ README.md
```

