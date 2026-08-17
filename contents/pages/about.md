---
title: "윤창식"
---

# 자랑하고 싶은 개발자, 윤창식입니다.

AI-Native 기반의 개발 워크플로우를 지향하며, 비즈니스 목표 달성을 위한 도구 사용을 아끼지 않습니다.

| 항목         | 링크                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| **Email**    | [wise@caesiumy.dev](mailto:wise@caesiumy.dev)                                 |
| **Github**   | [github.com/caesiumy](https://github.com/caesiumy)                            |
| **LinkedIn** | [linkedin.com/in/chang-sik-yoon](https://www.linkedin.com/in/chang-sik-yoon/) |
| **Blog**     | [caesiumy.dev](https://caesiumy.dev/)                                         |

- **언어/프레임워크**: `TypeScript` `React` `Next.js`
- **상태/데이터**: `TanStack Query` `Zustand` `Jotai` `MSW` `Orval`
- **스타일링/UI**: `TailwindCSS` `shadcn/ui` `MUI` `Storybook`
- **테스트**: `Vitest` `React Testing Library` `Playwright`
- **빌드/배포/CI-CD**: `Vite` `Webpack` `Turborepo` `pnpm` `GitHub Actions` `AWS(S3, CloudFront)`
- **AI 워크플로우**: `Claude` `Codex` `MCP`

---

## AI-Native Development

- **멀티 에이전트 번역 파이프라인 설계**: 품질이 들쭉날쭉하던 단일 프롬프트 번역 문제를 다중 에이전트로 재구성해 발행 검토 **거절 0회**, 편당 15~20분으로 수렴시켰습니다 ([관련 글](https://caesiumy.dev/posts/ai/ai-translation-orchestration))
- **MCP 기반 개발 환경 통합**: 반복 작업에서 건당 20분 안팎이 샜습니다. Figma, Linear, Chrome DevTools 연동과 승인 게이트 재설계로 자동화해 **반복 노동을 약 80% 줄였습니다** ([Figma 연동](https://caesiumy.dev/posts/ai/mcp-figma-ui-generation) | [이슈→PR](https://caesiumy.dev/posts/ai/linear-mcp-slack-ticket-automation))
- **E2E 자동화 스킬 제작 후 실무 투입(e2e-flow-skill)**: QA 인력 부재로 밀리던 E2E 도입을 자연어 시나리오 생성과 실패 trace 자가 복구 스킬로 해결해 외주 API 이관 검증에 실제 투입했습니다 ([GitHub](https://github.com/CaesiumY/e2e-flow-skill))
- **오픈소스 Claude Code 알림 플러그인(dding-dong) 설계와 배포**: 다중 세션 알림 부재로 컴퓨터 상주 문제를 크로스 플랫폼(macOS/Linux/WSL) 훅과 TTS로 해결하고, 마켓플레이스, 스킬, 랜딩 페이지를 묶어 배포해 진입 장벽을 낮췄습니다 ([랜딩](https://caesiumy.dev/dding-dong/) | [GitHub](https://github.com/CaesiumY/dding-dong))

---

## Experience

### [팀스파르타 내일배움캠프](https://nbcamp.spartaclub.kr/)

**리액트 트랙 튜터 (2023.12 ~ 2025.05, 1년 6개월)**

- **중도 포기율 75% 감소**: 맞춤형 클래스 담당, 9to9 상주 환경에서 학습 병목 실시간 해결, 라이브 강의 80회+
- **AI 과제 리뷰 자동화**: 반복되던 과제 리뷰를 AI 코드베이스 분석으로 대체하고 GitHub 이슈와 사내 문서에 피드백이 자동 등록되게 만들어 수기 반복 리뷰를 걷어냈습니다
- **교육 자산 설계와 표준화**: 수강생 노션 페이지의 UI/UX와 DB 구조를 개선해 **전 트랙 표준 템플릿으로 채택**되었고, 최신 커리큘럼과 인턴십 과제까지 설계, 집필했습니다

### [KC Softmax(현 ML2)](https://www.kc-ml2.com/) <span class="text-sm text-gray-500 dark:text-gray-400">반도체 기업 AI 연구 조직</span>

**프론트엔드 엔지니어 (2022.03 ~ 2023.09, 1년 6개월)**

- **CRA(craco)→Vite 마이그레이션과 클래스→함수형 전환**: eject로 웹팩 설정이 노출된 채 craco로 덮어쓰는 비표준 환경이었습니다. 이를 정리해 빌드 시간을 70% 줄였습니다(실측). 함수형 전환은 Hook 유용성과 React 발전 방향을 근거로 팀 합의를 이끌었습니다
- **상태관리 최적화**: 프레임마다 갱신되는 화면에서 자주 안 바뀌는 컴포넌트까지 리렌더됐습니다. Redux Toolkit(RTK) 슬라이스를 **갱신 주기 기준으로 분리**해 구독 범위를 좁혔고 비실시간 컴포넌트를 프레임 단위 리렌더에서 제외했습니다
- **실시간 데이터 동기화**: 바이너리 값으로 운영되던 구간을 gRPC/Protobuf로 개선해 타입 안정성을 확보했습니다. 모노레포가 아니라 양쪽 레포 스키마 동기화가 까다롭던 문제는 S3, CDN 단일 공급원 삼아 빌드 시 최신 스키마를 자동 반영해 해결했습니다
- **다국어 번역 파일의 배포 구조 개선**: 번역 파일이 프로젝트 내부에 있어 문구 수정마다 개발자 배포가 필요했습니다. S3와 CDN으로 분리 제공해 비개발자도 업로드만으로 즉시 반영하고 렌더링도 빨라졌습니다
- **커스텀 디자인 시스템 구축**: 파편화된 CSS로 스타일이 제각각이던 문제를 MUI 토큰 오버라이드 공통 컴포넌트로 정리해 신규 화면 개발 속도가 빨라지고 스타일 불일치 지적이 줄었습니다. RHF/Zod 폼도 통일하고 GitHub PR 템플릿과 필수 리뷰어 규칙으로 코드 리뷰 문화를 도입했습니다
- **사내 블로그 구축**: 비개발자 콘텐츠 관리를 위해 Notion API CMS로 사내 블로그를 구축하고 빌드 단계 이미지 최적화를 도입해 개발자 없이 등록, 수정하게 했습니다

---

## Freelance Projects

프리랜서 계약 프로젝트로, 재직 기간 및 프로젝트 간 병행 진행되었습니다.

### 한국기술마켓 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechmarket.com/">kotechmarket.com</a> <span class="text-sm text-gray-500 dark:text-gray-400">|</span> <a class="text-sm text-gray-500 dark:text-gray-400" href="https://kotechhub.com/">kotechhub.com</a>

**유저 페이지, 관리자 페이지 프론트엔드 개발 (2024.05 ~ 2026.05, 2년)**

- **모노레포 아키텍처 설계와 재정비(Turborepo, FSD)**: 동일 기능에 다른 UI를 배포하는 특성상 유저 모노레포(8+ 앱), 관리자, 대시보드 3개 레포를 Turborepo로 운영하며 공통 로직을 Core 패키지로 추출했습니다. 신규 앱 셋업 시간과 중복 코드가 줄고 공통 수정 1회가 8+ 앱에 일괄 반영됩니다. 유저 페이지는 데스크톱 기준 화면에 미디어쿼리를 더해 모바일과 태블릿까지 대응하는 반응형 웹으로 구현했습니다
- **선언적 폴백과 에러 UI**: 위젯 하나가 실패하면 페이지 전체가 죽었고 화면마다 로딩과 에러 분기를 수기로 달아야 했습니다. Suspense/ErrorBoundary로 장애를 컴포넌트 단위로 격리하고 화면별 분기 코드를 없앴습니다
- **API 클라이언트 점진적 이관(Orval)**: Swagger 문서로 타입을 수기 작성하던 반복 비용을 엔드포인트 단위 `자동 생성 → 레거시 타입과 응답 호환성 대조 → 이관 → Vitest, RTL, Playwright 검증` 1루프로 묶어 해결했습니다. 약 100개 엔드포인트를 무중단 이관했고, 신규 연동은 명령어 1회로 대체됩니다
- **디자인 시스템을 AI로 자동화하는 파이프라인 구축**(설계와 운영 전담): SSOT JSON 멱등성과 스토리북 검증으로 AI 출력을 안정화(20회→약 2회)했고 3주 걸리던 다중 브랜드 신규 출시를 3일에 끝냈습니다

### 교육 지원 플랫폼 <a class="text-sm text-gray-500 dark:text-gray-400" href="https://www.chungbook-e.com/">chungbook-e.com</a>

**유저 및 관리자 페이지 프론트엔드 개발 (2025.05 ~ 2026.01, 8개월)**

- **AI 기반 개발 파이프라인 도입(MSW 선제 스키마와 Orval/TanStack Query 자동 생성)**: 백엔드 의존성을 제거해 2개월로 잡혔던 예상 개발 공수를 1개월로 줄였습니다. 이후 유지보수를 포함해 8개월 계약을 완수했습니다
- **Linear 기반 진행도 체계화**: 이슈 트래커에 MCP로 AI 티켓 관리를 붙이고 로드맵으로 클라이언트 반복 문의를 해소했습니다
- **근거 기반 기술적 갈등 조율**: ID 타입 논쟁에서 의미론적 관점과 JS 숫자 한계를 근거로 설득해 데이터 리스크를 사전에 막았습니다

---

## Activities

### 출판

- 『[자바스크립트 + 리액트 디자인 패턴](https://www.yes24.com/Product/Goods/129374961)』 역자 (한빛미디어, 2023~2024)

### 강의

- **기업 대상 AI 활용 교육**: 대기업 임원과 시니어 개발자 대상 Claude Code, 생성형 AI 실무 교육 (2026 ~ )
  - 삼성전자, 카카오페이, 포스코, 고려대학교, 가톨릭대학교
  - 그 외 삼성증권, 삼성바이오로직스, 삼성인력개발원 등
- [한양대학교] AI 활용 프로그래밍 정규 교과목 강의 진행 (2026 ~ )
  - 14주차 분량 슬라이드를 AI 파이프라인(디자인 시스템, PRD 기반 정리, 스크린샷 비주얼 검증)으로 제작해 견적 2주를 실제 3일에 완수 ([관련 글](https://caesiumy.dev/posts/ai/ai-playwright-slide-generation-system))
- [오즈코딩스쿨] 프론트엔드 주강사, 실시간 세션 및 AI 특강 진행 (2025.12 ~ 2026.06, 6개월)
- [프로그래머스] Next.js & Notion API 라이브 코딩 강사 (2022 ~ 2023, 8개월)

### 베타 리더

- 『[모두의 깃 & 깃허브](https://www.yes24.com/Product/Goods/110795446)』, 『[혼자 공부하는 컴퓨터 구조 + 운영체제](https://www.yes24.com/Product/Goods/111378840)』 등 기술 서적 검수 참여

### 커뮤니티

- OpenAI Startup Meetup Seoul 스태프 (2026.04), 소문난 주니어 콘퍼런스 운영진 (2023), 파이콘 자원봉사자 (2023)
- [내공식탁] [프론트엔드 개발자 직무 멘토링](https://linkareer.com/activity/98159) (2022)

---

## Side Projects

### [caesiumy.dev](https://caesiumy.dev/) (2019 ~ )

- Astro 기반 정적 기술 블로그입니다. 배포 후에야 드러나던 회귀를 GitHub Actions 단일 머지 게이트(감사→린트→포맷→검증 3종→빌드→E2E 65개)와 GitHub Pages 자동 배포로 해결했습니다

### [ko/design.md](https://www.getdesign.kr/) (2026.05)

- LLM에 브랜드 디자인 언어를 설명하려면 매번 프롬프트를 새로 써야 했습니다. 한국 주요 서비스의 디자인 규칙을 `design.md`로 표준화해 한 번의 복사로 주입되는 공개 카탈로그로 묶었습니다

### [Notion API 블로그](https://github.com/CaesiumY/notion-blog-v2) (2022.10 ~ 2023.05)

- Next.js App Router 마이그레이션 및 ISR 도입으로 노션 연동 페이지 로딩 속도 최적화

### [마헤 뮤지컬 사이트](https://musical-ticketing.vercel.app/) (2022.04)

- 웹 폰트 서브셋과 프리로드 등 로딩 최적화로 Lighthouse 성능 점수 100점(All Green) 달성

[더 많은 프로젝트 보기 →](/projects)

더 자세한 내용은 [GitHub](https://github.com/CaesiumY)에서 확인하실 수 있습니다.
