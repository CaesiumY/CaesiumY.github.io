---
title: "윤창식"
---

# 자랑하고 싶은 개발자, 윤창식입니다.

AI-Native 기반의 개발 워크플로우를 지향하며, 비즈니스 목표 달성을 위한 도구 사용을 아끼지 않습니다.

| 항목         | 링크                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| **Email**    | [dbs2636@gmail.com](mailto:dbs2636@gmail.com)                                 |
| **Github**   | [github.com/caesiumy](https://github.com/caesiumy)                            |
| **LinkedIn** | [linkedin.com/in/chang-sik-yoon](https://www.linkedin.com/in/chang-sik-yoon/) |
| **Blog**     | [caesiumy.dev](https://caesiumy.dev/)                                         |

- **언어·프레임워크**: `TypeScript` `React` `Next.js`
- **상태·데이터**: `React Query` `Zustand` `Jotai` `MSW` `Orval`
- **스타일링·UI**: `TailwindCSS` `shadcn/ui` `MUI` `Storybook`
- **테스트**: `Vitest` `React Testing Library` `Playwright`
- **빌드·CI/CD**: `Vite` `Webpack` `Turborepo` `pnpm` `GitHub Actions`
- **AI 워크플로우**: `Claude` `Codex` `MCP`

---

## AI-Native Development

- **멀티 에이전트 번역 파이프라인 설계**: 품질이 매번 달라지던 단일 프롬프트 번역을 SoC 기반 역할 분리 + 이중 병렬 검증(한국어 품질 / 원문 충실도) 6개 에이전트로 재구성 — 발행 검토에서 **거절 0회**, 글 1편당 15~20분으로 수렴 ([관련 글](https://caesiumy.dev/posts/ai/ai-translation-orchestration))
- **MCP 기반 개발 환경 통합**: 티켓 생성·상태 갱신·커밋 메시지·PR·작업 로그로 건당 20분 안팎 새던 반복 작업을 Figma·Linear·Chrome DevTools 연동으로 자동화하고 승인 게이트만 사람이 담당하도록 재설계 — **반복 노동 약 80% 감소** ([Figma 연동](https://caesiumy.dev/posts/ai/mcp-figma-ui-generation) | [이슈→PR](https://caesiumy.dev/posts/ai/linear-mcp-slack-ticket-automation))
- **E2E 자동화 스킬 제작 후 실무 투입(e2e-flow-skill)**: QA 인력이 없어 E2E 도입이 계속 밀리던 문제를 `인프라 셋업 → 자연어 시나리오로 테스트 생성 → 실패 trace를 UI 변경·테스트 버그·앱 버그·환경 이슈 4종으로 분류해 자가 복구 → 확장(VRT·CI 샤딩)` 파이프라인으로 해결. 외주 프로젝트의 API 클라이언트 이관 검증에 직접 사용 ([GitHub](https://github.com/CaesiumY/e2e-flow-skill))
- **오픈소스 Claude Code 알림 플러그인(dding-dong) 설계·배포**: 다중 세션 알림 부재로 인한 컴퓨터 상주 문제를 크로스 플랫폼(macOS/Linux/WSL) 훅 + Qwen Voice 목소리 클론 TTS로 해결, 마켓플레이스·스킬·랜딩 페이지 통합으로 진입 장벽 최소화 ([랜딩](https://caesiumy.dev/dding-dong/) | [GitHub](https://github.com/CaesiumY/dding-dong))

---

## Experience

### [팀스파르타](https://nbcamp.spartacodingclub.kr/frontend) <span class="text-sm text-gray-500 dark:text-gray-400">코딩 부트캠프 운영 에듀테크 기업</span>

**내배캠 리액트 트랙 튜터 (2023.12 ~ 2025.05, 1년 6개월)**

- **중도 포기율 75% 감소**: 맞춤형 클래스 담당, 9to9 상주 환경에서 학습 병목 실시간 해결, 라이브 강의 80회+
- **수강생 노션 템플릿 표준화**: 노션 페이지 UI/UX 및 관계형 DB 구조 문제 발견 → 전면 개선 후 전 트랙 표준 템플릿으로 채택
- **AI 과제 리뷰 자동화**: 제출된 과제를 리뷰하는 반복 과중 업무 → AI로 코드 베이스 분석, GitHub 이슈 및 사내 문서 항목으로 피드백 자동 등록
- **교육 콘텐츠 설계**: 최신 프론트엔드 트렌드(Next.js, TypeScript) 기반 커리큘럼과 실무형 인턴십 과제·평가 지표를 설계하고, 개발 기초 과정의 AI Agent 활용 섹션을 기획·집필

### [KC-MIC](https://kc-mic.com/) <span class="text-sm text-gray-500 dark:text-gray-400">반도체 기업 AI 연구 조직</span>

**프론트엔드 엔지니어 (2022.03 ~ 2023.09, 1년 6개월)**

- **CRA(craco)→Vite 마이그레이션 + 클래스→함수형 전환**: eject로 노출된 웹팩 설정을 craco로 덮어쓰던 비표준 환경을 정리해 빌드 시간 70% 단축(빌드 출력 기준 실측), Hook 유용성·React 발전 방향 근거로 팀 합의
- **상태관리 최적화**: 복잡한 전역 상태로 인한 불필요 리렌더링 발견 → RTK + 슬라이스 분리로 해결
- **실시간 데이터 동기화**: 기존 바이너리 값으로 운영 → gRPC/Protobuf 스트리밍으로 개선하여 타입 안정성과 가독성 확보
- **코드 품질 체계화**: 파편화된 CSS 규칙으로 인한 협업 비효율 → 디자인 시스템 + 코드 리뷰 문화로 해결
- **사내 블로그 구축**: 비개발자 콘텐츠 관리 필요 → Notion API CMS로 사내 블로그 구축 및 빌드 단계 이미지 최적화 도입

---

## Freelance Projects

프리랜서 계약 프로젝트로, 재직 기간 및 프로젝트 간 병행 진행되었습니다.

### 한국 기술 마켓 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechmarket.com/">kotechmarket.com</a> <span class="text-sm text-gray-500 dark:text-gray-400">|</span> <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechhub.com/">kotechhub.com</a>

**유저 페이지 · 관리자 페이지 프론트엔드 개발 (2024.05 ~ 2026.05, 2년)**

- **Turborepo 모노레포 구축**: 동일 기능/다른 UI 배포라는 사업 특성 고려, 유저 모노레포(8+ 앱)·관리자·대시보드 **3개 레포**를 단일 구조로 운영
- **Core 패키지 중앙 집중화**: 각 앱의 모노레포 특징 미활용 문제 발견 → 공통 로직 추출로 코드 재사용성 향상
- **FSD 아키텍처 최적화**: 도입 초기 생산성 저하 발견 → 아키텍처는 목표가 아닌 수단으로 재정의, 커스텀 레이어 구조 적용
- **선언적 폴백/에러 UI**: 위젯 하나의 API 실패가 페이지 전체를 죽이고, 화면마다 로딩·에러 분기를 수기로 달아 보일러플레이트가 쌓이던 문제 → Suspense/ErrorBoundary로 장애 영향 범위를 컴포넌트 단위로 격리하고 명령형 분기를 선언적 경계로 흡수
- **API 클라이언트 점진적 이관(Orval)**: Swagger 문서로 TypeScript 타입을 수기 작성하던 반복 비용 → 엔드포인트 단위 `자동 생성 → 레거시 타입·응답 호환성 대조 → 이관 → Vitest·RTL 유닛 + Playwright E2E 검증` 1루프로 **약 100개 엔드포인트 무중단 이관**, 신규 연동은 명령어 1회로 대체. AI 일괄 처리 실패 후 **자동화 대상을 작업이 아닌 검증으로 재정의**한 것이 전환점
- **AI 디자인 시스템 자동화 파이프라인 구축**(설계·운영 전담): SSOT JSON 멱등성·스토리북 검증으로 AI 출력 안정화(20회→2회), 다중 브랜드 신규 출시 3주→3일

### 교육 지원 플랫폼 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://www.chungbook-e.com/">chungbook-e.com</a>

**유저 페이지 · 관리자 페이지 프론트엔드 개발 (2025.05 ~ 2026.01, 8개월)**

- **AI 기반 개발 파이프라인 도입(MSW 선제 스키마 + Orval/TanStack Query 자동 생성)**: 백엔드 의존성 제거로 예상 개발 공수 2개월 → 1개월 단축, 이후 유지보수 포함 8개월 계약 완수
- **Linear 기반 진행도 체계화**: 이슈 트래커 도입 + MCP로 AI 기반 티켓 관리, 로드맵 제공으로 클라이언트 반복 문의 해소
- **근거 기반 기술적 갈등 조율**: ID 타입 논쟁에서 의미론적 관점 + JS 숫자 한계 근거로 설득, 데이터 리스크 사전 방지

---

## Activities

### 출판

- 『[자바스크립트 + 리액트 디자인 패턴](https://www.yes24.com/Product/Goods/129374961)』 역자 (한빛미디어, 2023~2024)
  - 최신 리액트 디자인 패턴과 렌더링 최적화 기법을 깊이 있게 연구하고, 한국 독자가 이해하기 쉽도록 의역 및 용어를 재정립

### 강의

- **기업 대상 AI 활용 교육 (주강사 · 기술튜터)** — 대기업 임원·시니어 개발자 대상 Claude Code·생성형 AI 실무 교육 (2026년)
  - [삼성전자], [카카오페이], [포스코], [고려대학교], [한솔제지], [가톨릭대학교]
  - 그 외 삼성증권, 삼성바이오로직스, 삼성인력개발원, 동희홀딩스 등
- [한양대학교] AI 활용 프로그래밍 정규 교과목 강의 진행 (2026)
  - 14주차 분량 슬라이드를 AI 파이프라인(디자인 시스템 + PRD 기반 정리 + 스크린샷 비주얼 검증)으로 제작해 견적 2주 → 실제 3일에 완수 ([관련 글](https://caesiumy.dev/posts/ai/ai-playwright-slide-generation-system))
- [오즈코딩스쿨] 프론트엔드 주강사, 실시간 세션 및 AI 특강 진행 (2025.12 ~ 2026.06)
- [프로그래머스] Next.js & Notion API 라이브 코딩 강사 (2022 ~ 2023)

### 베타 리더

- 『[모두의 깃 & 깃허브](https://www.yes24.com/Product/Goods/110795446)』, 『[혼자 공부하는 컴퓨터 구조 + 운영체제](https://www.yes24.com/Product/Goods/111378840)』 등 기술 서적 검수 참여

### 커뮤니티

- OpenAI Startup Meetup Seoul 스태프 (2026.04) · 소문난 주니어 콘퍼런스 운영진 (2023) · 파이콘 자원봉사자 (2023)
- [내공식탁] [프론트엔드 개발자 직무 멘토링](https://linkareer.com/activity/98159) (2022)

---

## Side Projects

### [기술 블로그](https://caesiumy.dev/) <a class="text-sm text-gray-500 dark:text-gray-400" href="https://github.com/CaesiumY/CaesiumY.github.io">GitHub</a> (2019 ~ , CI 도입 2025.08)

- **CI/CD 파이프라인 구축**: 배포 후에야 회귀를 발견하던 문제를 GitHub Actions 단일 머지 게이트(의존성 감사 → 린트 → 포맷 → 자작 검증 3종 → 빌드 → E2E **65개 케이스**)와 GitHub Pages 자동 배포로 해결
- **회귀 방지 스크립트 자작**: 리뷰로만 걸러지던 반복 실수 3종(문서 동기화 이탈·에이전트 정의 규칙 위반·게시글 분류 불일치)을 검증 스크립트로 CI에 편입해 사람의 주의력에 의존하던 검사를 자동 차단으로 전환

### [ko/design.md](https://www.getdesign.kr/) (2026.05)

- 한국 주요 서비스(토스, 배달의민족, 원티드 등)의 디자인 시스템을 LLM 프롬프트 컨텍스트용 마크다운(design.md) 카탈로그로 정리

### [dding-dong](https://caesiumy.dev/dding-dong/) (2026.02)

- 크로스 플랫폼(macOS/Linux/WSL) 사운드·OS 알림 및 AI 음성 합성(TTS) 커스텀 팩 시스템 구축 ([GitHub](https://github.com/CaesiumY/dding-dong))

### [Notion API 블로그](https://github.com/CaesiumY/notion-blog-v2) (2022.10 ~ 2023.05)

- Next.js App Router 마이그레이션 및 ISR 도입으로 노션 연동 페이지 로딩 속도 최적화

### [마치 무비 나잇](https://mrch-movie-night.vercel.app/) (2023.02)

- Firebase Realtime Database를 활용한 실시간 좌석 예매 시스템 및 풀스택 1인 개발

### [마헤 뮤지컬 사이트](https://musical-ticketing.vercel.app/) (2022.04)

- 웹 폰트 서브셋·프리로드 등 로딩 최적화로 Lighthouse 성능 점수 100점(All Green) 달성

[더 많은 프로젝트 보기 →](/projects)

더 자세한 내용은 [GitHub](https://github.com/CaesiumY)에서 확인하실 수 있습니다.
