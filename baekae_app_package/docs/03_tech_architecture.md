# 03. 기술 구조

## 추천 구조

```txt
React Native + Expo 앱
        ↓
API 서버(Node.js Express 또는 PHP)
        ↓
DB 서버(MySQL/MariaDB 또는 Firebase)
```

## 왜 앱이 DB에 직접 붙으면 안 되는가

앱에서 DB 서버에 직접 접속하면 앱 내부에 DB 접속 정보가 들어가야 합니다.

```txt
DB Host
DB User
DB Password
DB Port
Database Name
```

앱은 사용자가 설치한 뒤 분석될 수 있기 때문에, DB 계정 정보가 노출될 위험이 큽니다. 따라서 앱은 반드시 API 서버를 통해서만 DB와 통신해야 합니다.

## 올바른 처리 방식

### 좋아요 보내기

```txt
앱 → API 서버 → DB
```

API 서버가 확인할 것:

- 로그인된 사용자인가?
- 마지막 좋아요 이후 6시간이 지났는가?
- 이미 좋아요를 보낸 상대인가?
- 서로 좋아요가 되었는가?
- 매칭 생성이 필요한가?

### 백애꽃 차감

```txt
앱 → API 서버 → DB
```

API 서버가 확인할 것:

- 현재 채팅 중인 매칭이 있는가?
- 새로운 매칭을 시작하려는가?
- 백애꽃 보유량이 충분한가?
- 1송이 차감 후 추천을 제공할 수 있는가?

## React Native와 React의 차이

```txt
React
→ 웹사이트/웹앱 제작
→ HTML, CSS, JS
→ 브라우저에서 실행

React Native
→ Android/iOS 앱 제작
→ View, Text, Pressable 등 네이티브 컴포넌트 사용
→ 실제 앱으로 설치 가능
```

## Android / iOS 지원

React Native + Expo를 사용하면 하나의 코드베이스로 Android와 iOS를 모두 지원할 수 있습니다.

```txt
하나의 React Native 코드
        ↓
Android 빌드 → APK / AAB
iOS 빌드 → IPA / TestFlight / App Store
```

## 추천 기술 스택

### MVP 1안: 서버 직접 운영형

```txt
앱: React Native + Expo
API: Node.js Express
DB: MySQL/MariaDB
채팅: 초기에는 polling, 이후 Socket.IO
관리자: 웹 어드민
```

### MVP 2안: 빠른 개발형

```txt
앱: React Native + Expo
인증: Firebase Auth
DB: Firestore
채팅: Firestore 실시간 구독
푸시: Expo Notifications
관리자: Firebase Console 또는 간단한 웹 어드민
```

## 백애 추천 방향

성준이가 웹/DB/API 감이 있으므로 처음에는 다음 구조가 가장 현실적입니다.

```txt
React Native + Expo 앱
Node.js Express API 서버
MySQL/MariaDB DB
VS Code 개발
```

