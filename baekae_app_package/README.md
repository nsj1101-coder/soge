# 백애(白愛) 앱 기획 패키지

> 사진보다 마음이 먼저, 가치관으로 시작하는 사랑

이 폴더는 소개팅 앱 **백애**의 초기 MVP 기획, 기능 정의, 기술 구조, 비용 추정, VS Code 개발 시작 가이드를 정리한 자료입니다.

## 폴더 구성

```txt
baekae_app_package/
├─ README.md
├─ docs/
│  ├─ 01_concept.md
│  ├─ 02_mvp_features.md
│  ├─ 03_tech_architecture.md
│  ├─ 04_cost_estimate.md
│  ├─ 05_vscode_start_guide.md
│  └─ 06_next_prompts.md
└─ design/
   └─ baekae_ui_mockup_showcase.png
```

## 핵심 컨셉

**백애**는 외모 중심 소개팅 앱이 아니라, 사진 없이 가치관 질문을 기반으로 매칭률을 보여주고, 서로 좋아요를 보냈을 때만 채팅이 열리는 소개팅 앱입니다.

## MVP 핵심 기능

1. 사진 없는 가치관 프로필
2. 가치관 매칭률 표시
3. 6시간마다 좋아요 1회 발송
4. 서로 좋아요 시 매칭 성사
5. 매칭 후 채팅 기능
6. 채팅 중 새로운 매칭을 시작하면 `백애 1송이` 차감

## 추천 기술 방향

- 앱: React Native + Expo
- 개발 툴: VS Code
- API 서버: Node.js Express 또는 PHP API
- DB: MySQL/MariaDB 또는 Firebase
- 초기 추천 구조: 앱 → API 서버 → DB

