---
layout: ../layouts/AboutLayout.astro
title: "윤창식"
---

# 자랑하고 싶은 개발자, 윤창식입니다.

기술 서적 <자바스크립트+리액트 디자인 패턴> 역자이자, 100회 이상의 라이브 강의 경험이 있습니다.
AI-Native 개발 워크플로우를 지향하며, 비즈니스 목표 달성을 위한 도구 사용을 아끼지 않습니다.

| 항목         | 링크                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| **Email**    | [dbs2636@gmail.com](mailto:dbs2636@gmail.com)                                 |
| **Github**   | [github.com/caesiumy](https://github.com/caesiumy)                            |
| **LinkedIn** | [linkedin.com/in/chang-sik-yoon](https://www.linkedin.com/in/chang-sik-yoon/) |
| **Blog**     | [caesiumy.dev](https://caesiumy.dev/)                                         |

**Tech Keywords**: `TypeScript` `Next.js` `React` `TailwindCSS` `Claude Code` `Turborepo` `Orval` `UX`

---

## AI-Native Development

- **멀티 에이전트 파이프라인 설계**: SoC 기반 역할 분리와 이중 병렬 검증으로 6개 에이전트 번역 파이프라인 구축 ([관련 글](https://caesiumy.dev/posts/ai/ai-translation-orchestration))
- **MCP 기반 개발 환경 통합**: Figma·Linear·Chrome DevTools 연동, 이슈→PR 워크플로우 자동화 ([Figma 연동](https://caesiumy.dev/posts/ai/mcp-figma-ui-generation) | [이슈→PR](https://caesiumy.dev/posts/ai/linear-mcp-slack-ticket-automation))
- **도메인 특화 에이전트 구축**: 목적별 워크플로우 자동화 — 글 작성, 콘텐츠 검토, 면접 준비 ([관련 글](https://caesiumy.dev/posts/ai/claude-interview-agents))
- **강의 슬라이드 자동 생성 파이프라인 구축**: 디자인 시스템 + PRD 기반 콘텐츠 정리 + 스크린샷 비주얼 검증으로 주어진 2주 → 실제 3일 완수 ([관련 글](https://caesiumy.dev/posts/ai/ai-playwright-slide-generation-system))
- **오픈소스 Claude Code 알림 플러그인(dding-dong) 설계·배포**: 다중 세션 알림 부재로 인한 컴퓨터 상주 문제를 크로스 플랫폼(macOS/Linux/WSL) 훅 + Qwen Voice 목소리 클론 TTS로 해결, 마켓플레이스·스킬·랜딩 페이지 통합으로 진입 장벽 최소화 ([dding-dong](https://github.com/CaesiumY/dding-dong))

---

## Experience

### [팀스파르타](https://nbcamp.spartacodingclub.kr/frontend) <span class="text-sm text-gray-500 dark:text-gray-400">코딩 부트캠프 운영 에듀테크 기업</span>

**내배캠 리액트 트랙 튜터 (2023.12 ~ 2025.05, 1년 6개월)**

- **중도 포기율 75% 감소**: 맞춤형 클래스 담당, 9to9 상주 환경에서 학습 병목 실시간 해결, 라이브 강의 80회+
- **수강생 노션 템플릿 표준화**: 노션 페이지 UI/UX 및 관계형 DB 구조 문제 발견 → 전면 개선 후 전 트랙 표준 템플릿으로 채택
- **AI 과제 리뷰 자동화**: 제출된 과제를 리뷰하는 반복 과중 업무 → AI로 코드 베이스 분석, GitHub 이슈 및 사내 문서 항목으로 피드백 자동 등록
- **교육 커리큘럼 설계**: 최신 프론트엔드 트렌드(Next.js, TypeScript 등) 반영, 실무형 인턴십 과제/평가 지표 설계
- **AI 강의 교안 작성**: 개발 기초 과정 중 AI Agent 활용 섹션 기획 및 교안 작성

### [KC-MIC](https://kc-mic.com/) <span class="text-sm text-gray-500 dark:text-gray-400">반도체 기업 AI 연구 조직</span>

**프론트엔드 엔지니어 (2022.03 ~ 2023.09, 1년 6개월)**

- **CRA(craco)→Vite 마이그레이션 + 클래스→함수형 전환**: 비표준 빌드 환경 정리로 빌드 명령어 70% 단축(실측), Hook 유용성·React 발전 방향 근거로 팀 합의
- **상태관리 최적화**: 복잡한 전역 상태로 인한 불필요 리렌더링 발견 → RTK + 슬라이스 분리로 해결
- **실시간 데이터 동기화**: 기존 바이너리 값으로 운영 → gRPC/Protobuf 스트리밍으로 개선하여 타입 안정성과 가독성 확보
- **코드 품질 체계화**: 파편화된 CSS 규칙으로 인한 협업 비효율 → 디자인 시스템 + 코드 리뷰 문화로 해결
- **관리자 대시보드 개발**: BAAS 관리자 대시보드 개발, RHF/Zod 폼 검증
- **사내 블로그 구축**: 비개발자 콘텐츠 관리 필요 → Notion API CMS로 사내 블로그 구축 및 빌드 단계 이미지 최적화 도입
- **커스텀 디자인 시스템**: 오픈소스 디자인 시스템(MUI) 오버라이드로 브랜드 맞춤 UI 디자인 적용

---

## Freelance Projects

### 교육 지원 플랫폼 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://www.chungbook-e.com/">chungbook-e.com</a>

**유저 페이지 · 관리자 페이지 프론트엔드 개발 (2025.05 ~ 2026.01, 8개월)**

- **AI 기반 개발 파이프라인 도입(MSW 선제 스키마 + Orval/TanStack Query 자동 생성)**: 백엔드 의존성 제거로 예상 개발 공수 2개월 → 1개월 단축, 이후 유지보수 포함 8개월 계약 완수
- **Linear 기반 진행도 체계화**: 이슈 트래커 도입 + MCP로 AI 기반 티켓 관리, 로드맵 제공으로 클라이언트 반복 문의 해소
- **근거 기반 기술적 갈등 조율**: ID 타입 논쟁에서 의미론적 관점 + JS 숫자 한계 근거로 설득, 데이터 리스크 사전 방지

### 한국 기술 마켓 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechmarket.com/">kotechmarket.com</a> <span class="text-sm text-gray-500 dark:text-gray-400">|</span> <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechhub.com/">kotechhub.com</a>

**유저 페이지 · 관리자 페이지 프론트엔드 개발 (2024.05 ~ 2026.05, 2년)**

- **Turborepo 모노레포 구축**: 동일 기능/다른 UI 배포라는 사업 특성 고려, 신규 브랜드 출시 속도 향상
- **Core 패키지 중앙 집중화**: 각 앱의 모노레포 특징 미활용 문제 발견 → 공통 로직 추출로 코드 재사용성 향상
- **FSD 아키텍처 최적화**: 도입 초기 생산성 저하 발견 → 아키텍처는 목표가 아닌 수단으로 재정의, 커스텀 레이어 구조 적용
- **선언적 폴백/에러 UI**: Suspense/ErrorBoundary로 컴포넌트 단위 에러 핸들링 및 폴백 UI 적용
- **AI 디자인 시스템 자동화 파이프라인 구축**: SSOT JSON 멱등성·스토리북 검증으로 AI 출력 안정화(20회→2회), 다중 브랜드 신규 출시 3주→3일

---

## Activities

### 출판

- 『[자바스크립트 + 리액트 디자인 패턴](https://www.yes24.com/Product/Goods/129374961)』 역자 (한빛미디어, 2023~2024)
  - 최신 리액트 디자인 패턴과 렌더링 최적화 기법을 깊이 있게 연구하고, 한국 독자가 이해하기 쉽도록 의역 및 용어를 재정립

### 강의

- [한양대학교] AI 활용 프로그래밍 정규 교과목 강의 진행 (2026)
- [오즈코딩스쿨] 프론트엔드 주강사, 실시간 세션 및 AI 특강 진행 (2025.12 ~ 현재)
- [프로그래머스] [Next.js & Notion API 라이브 코딩 강사](https://drive.google.com/file/d/1TcAVluxcY4sfIncMkC5CC4-H1orCwcpS/view?usp=sharing) (2022~2023)
  - 실시간 라이브 코딩을 통해 예외 상황 대처 능력과 지식 전달 능력 증명

### 베타 리더

- 『[모두의 깃 & 깃허브](https://www.yes24.com/Product/Goods/110795446)』, 『[혼자 공부하는 컴퓨터 구조 + 운영체제](https://www.yes24.com/Product/Goods/111378840)』 등 기술 서적 검수 참여

---

## Side Projects

### [dding-dong](https://caesiumy.dev/dding-dong/) (2026.02)

- 크로스 플랫폼(macOS/Linux/WSL) 사운드·OS 알림 및 AI 음성 합성(TTS) 커스텀 팩 시스템 구축

### [Notion API 블로그](https://github.com/CaesiumY/notion-blog-v2) (2022.10 ~ 2023.05)

- Next.js App Router 마이그레이션 및 ISR 도입으로 노션 연동 페이지 로딩 속도 최적화

### [마치 무비 나잇](https://mrch-movie-night.vercel.app/) (2023.02)

- Firebase Realtime Database를 활용한 실시간 좌석 예매 시스템 및 풀스택 1인 개발

### [마헤 뮤지컬 사이트](https://musical-ticketing.vercel.app/) (2022.04)

- 웹 폰트 최적화 등을 통해 Lighthouse 성능 점수 100점(All Green) 달성

[더 많은 프로젝트 보기 →](/projects)

---

## Etc.

### 강의/멘토링

- [내공식탁] [프론트엔드 개발자 직무 멘토링](https://linkareer.com/activity/98159) (2022)

### 네트워킹

- OpenAI Startup Meetup Seoul 스태프 (2026.04)
- 소문난 주니어 콘퍼런스 운영진 (2023)
- 파이콘 자원봉사자 (2023)

---

더 자세한 내용은 [GitHub](https://github.com/CaesiumY)에서 확인하실 수 있습니다.
