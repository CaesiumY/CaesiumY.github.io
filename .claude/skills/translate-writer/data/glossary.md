# 번역 용어집

번역 글 작성 시 일관된 용어 사용을 위한 용어집입니다.

## 일반 규칙

1. **고유명사는 원문 유지**
   - 예: Next.js, React, TypeScript, Turbopack, Vercel

2. **기술 용어는 괄호 안에 원문 병기**
   - 예: 캐싱(Caching), 메모이제이션(Memoization)

3. **한국 개발자 커뮤니티에서 통용되는 표현 우선**
   - 예: "컴포넌트" (O) vs "구성요소" (X)

4. **번역하지 않는 용어**
   - API 이름, 함수명, 설정 키
   - 예: `useEffect`, `getServerSideProps`, `next.config.ts`

## 용어 목록

### 일반 기술 용어

| 원문 | 번역 | 비고 |
|------|------|------|
| Breaking Changes | 주요 변경사항 | 호환성 깨지는 변경 |
| Deprecate | 지원 종료 예정 | deprecated → 더 이상 사용되지 않는 |
| Opt-in | 선택적 활성화 | |
| Opt-out | 선택적 비활성화 | |
| Trade-off | 트레이드오프 | 원문 유지 가능 |
| Migration | 마이그레이션 | |
| Upgrade | 업그레이드 | |
| Dependency | 의존성 | 종속성이 아닌 의존성 사용 (개발자 커뮤니티 표준) |
| Suite | 모음 | evaluation suite → 평가 모음, test suite → 테스트 모음 |
| Nuance | 맥락, 의미, 어감 | 외래어 대신 한국어 표현 사용 |

### React 관련

| 원문 | 번역 | 비고 |
|------|------|------|
| Component | 컴포넌트 | |
| Server Components | 서버 컴포넌트 | React 18+ |
| Client Components | 클라이언트 컴포넌트 | |
| Hooks | 훅 | |
| Memoization | 메모이제이션 | |
| Re-render | 리렌더링 | |
| State | 상태 | |
| Props | props | 원문 유지 권장 |
| Effect | Effect | useEffect 문맥에서 원문 유지 |
| Suspense | Suspense | 고유명사 |
| Hydration | 하이드레이션 | |

### Next.js 관련

| 원문 | 번역 | 비고 |
|------|------|------|
| App Router | App Router | 고유명사 |
| Pages Router | Pages Router | 고유명사 |
| Routing | 라우팅 | |
| Navigation | 네비게이션 | |
| Prefetch | 프리페치 | |
| Build | 빌드 | |
| Bundler | 번들러 | |
| Fast Refresh | Fast Refresh | 고유명사 |
| Turbopack | Turbopack | 고유명사 |
| Middleware | 미들웨어 | |
| Layout | 레이아웃 | |
| Template | 템플릿 | |
| Loading | 로딩 | |
| Error Boundary | 에러 바운더리 | |
| Streaming | 스트리밍 | |

### 캐싱 관련

| 원문 | 번역 | 비고 |
|------|------|------|
| Cache | 캐시 | |
| Caching | 캐싱 | |
| Revalidate | 재검증 | |
| Revalidation | 재검증 | |
| Stale-While-Revalidate | SWR 패턴 | 또는 원문 유지 |
| Invalidate | 무효화 | |
| TTL (Time To Live) | TTL | 원문 유지 |

### 성능 관련

| 원문 | 번역 | 비고 |
|------|------|------|
| Performance | 성능 | |
| Optimization | 최적화 | |
| Lazy Loading | 지연 로딩 | |
| Code Splitting | 코드 분할 | |
| Tree Shaking | 트리 쉐이킹 | |
| Bundle Size | 번들 크기 | |

### 빌드/배포 관련

| 원문 | 번역 | 비고 |
|------|------|------|
| Development | 개발 | 개발 환경 |
| Production | 프로덕션 | |
| Static Site Generation (SSG) | 정적 사이트 생성 | |
| Server Side Rendering (SSR) | 서버 사이드 렌더링 | |
| Incremental Static Regeneration (ISR) | 증분 정적 재생성 | |
| Partial Pre-Rendering (PPR) | 부분 사전 렌더링 | |

### 의역 및 문체 관련 용어

| 원문 | 번역 | 비고 |
|------|------|------|
| compelling | 혹할 만한 / 설득력 있는 | 맥락에 따라 선택 |
| honeymoon period | 달콤한 시간 | 관용구로 번역 |
| prescriptive | 정해진 / 명시적인 | 기술 문맥에서 주로 "정해진" |
| risk averse | 보수적인 / 리스크를 꺼리는 | 문맥에 따라 선택 |
| convention-over-configuration | 관례 우선 | 원문 유지 가능 |
| brute force (migration context) | 전면 전환 / 한 번에 밀어붙이기 | 마이그레이션 맥락 |

### 프레임워크/라이브러리

| 원문 | 번역 | 비고 |
|------|------|------|
| Tanstack Start | Tanstack Start | 프레임워크명 (한글화 불필요) |
| Deno Fresh | Deno Fresh | 프레임워크명 (한글화 불필요) |
| React Router | React Router | 프레임워크명 (한글화 불필요) |
| Remix | Remix | 프레임워크명 (한글화 불필요) |

### 고급 기술 용어

| 원문 | 번역 | 비고 |
|------|------|------|
| Deduplication | 중복 제거 | Layout deduplication |
| Agentic | 에이전트 기반 / 에이전틱 | AI 에이전트 관련 |
| Sub-agent | 서브에이전트 | |
| Context Engineering | 컨텍스트 엔지니어링 | |
| Read-your-writes | read-your-writes | 원문 유지 권장 |
| Stale-While-Revalidate | SWR 동작 / stale-while-revalidate | |
| Worktree | 워크트리 | Git 관련 |
| Headless | 헤드리스 | |
| Non-deterministic | 비결정적인 | |
| Skill | 스킬 | Claude Skills 문맥 |
| Frontmatter | frontmatter | YAML frontmatter |
| Workflow | 워크플로우 | 작업 흐름 |
| Instruction | 지시사항 | Skill.md의 내용 |
| Content Negotiation | 콘텐츠 협상 | HTTP 표준 메커니즘 |
| Changelog | 변경 내역 | 버전 기록 |

---

## 업데이트 기록

| 날짜 | 변경 내용 |
|------|----------|
| 2025-12-18 | 초기 용어집 생성 |
| 2026-02-06 | "dependency" → "의존성"으로 변경 (한국 개발자 커뮤니티 표준) |
| 2026-02-07 | "suite" → "모음", "nuance" → "맥락/의미/어감" 추가 (외래어→한국어 선호) |
| 2026-02-11 | "Content Negotiation" → "콘텐츠 협상", "Changelog" → "변경 내역" 추가 |
| 2026-02-20 | 의역 관련 용어 추가 ("compelling", "honeymoon period", "prescriptive", "risk averse" 등), 프레임워크 용어 추가 ("Tanstack Start", "Deno Fresh" 등) |

---

**참고**: 새로운 용어 추가 시 이 파일을 업데이트해주세요.
