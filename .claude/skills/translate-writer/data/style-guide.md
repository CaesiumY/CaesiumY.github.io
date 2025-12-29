# 번역 스타일 가이드

> 이 가이드는 translation-style-analyzer 에이전트에 의해 자동 생성/업데이트됩니다.
> 마지막 업데이트: 2025-12-29

---

## 1. 문체 (Tone)

### 존댓말 사용 원칙
- 기본: 존댓말 (~습니다/~입니다) 사용
- 코드 설명: 존댓말 유지 (예: "설정에서 파일 시스템 캐싱을 활성화하세요")
- 인용/직접 화법: "~했습니다" 형태 유지 (예: "Horthy는 설명했습니다.")

### 문장 종결 패턴
- **서술문**: "~입니다", "~합니다", "~됩니다"
  - 예: "Turbopack이 개발 및 프로덕션 빌드 모두에서 안정화되었습니다."
- **권유문**: "~하세요", "~주세요"
  - 예: "설정에서 파일 시스템 캐싱을 활성화하세요."
  - 예: "피드백을 공유해주세요."
- **설명문**: "~합니다", "~됩니다"
  - 예: "이 API는 사용자 인터랙션이 필요한 기능에서 변경사항이 즉시 반영되도록 보장합니다."
- **목록 항목**: 명사형 또는 간결한 서술문
  - 예: "2-5배 빠른 프로덕션 빌드"
  - 예: "최대 10배 빠른 Fast Refresh"

---

## 2. 번역투 회피 패턴

### 반드시 피해야 할 표현

| 번역투 | 자연스러운 표현 | 예시 |
|--------|----------------|------|
| "~하는 것이 가능하다" | "~할 수 있다" | ❌ 실행하는 것이 가능하다 → ✅ 실행할 수 있다 |
| "~에 의해 ~되다" | 능동태로 변환 | ❌ 팀에 의해 개발되었다 → ✅ 팀이 개발했다 |
| "그것은/이것은" | 주어 구체화 또는 생략 | ❌ 이것은 중요한 기능이다 → ✅ 중요한 기능이다 |
| "~경우" 과다 | 재구성 | ❌ 에러가 발생하는 경우 → ✅ 에러가 발생하면 |
| "~에 대해" 과다 | 조사로 대체 | ❌ 기능에 대해 설명 → ✅ 기능을 설명 |
| "~것이다" 과다 | "~합니다"로 변환 | ❌ 개선될 것이다 → ✅ 개선됩니다 |

### 샘플에서 발견된 자연스러운 표현 패턴

| 원문 패턴 | 번역 패턴 | 실제 예시 |
|----------|----------|----------|
| "This allows X to Y" | "X가 Y할 수 있게 합니다" | "팀이 여러 Claude 에이전트 세션을 병렬로 실행할 수 있도록 합니다" |
| "X is now Y" | "X가 Y되었습니다" | "Turbopack이 안정화되었습니다" |
| "You can X" | "X할 수 있습니다" | "파일 시스템 캐싱을 활성화할 수 있습니다" |
| "X explained/said" | "X는 설명했습니다/말했습니다" | "Horthy는 설명했습니다" |
| "When X happens" | "X하면" 또는 "X할 때" | "사용자가 태그가 지정된 콘텐츠를 요청하면" |

---

## 3. 용어 규칙

### 용어집 참조
@.claude/skills/translate-writer/data/glossary.md

### 원문 유지 용어
샘플에서 확인된 원문 유지 용어:
- **프레임워크/도구**: React, Next.js, TypeScript, Turbopack, Babel, ESLint, Tailwind CSS
- **기능명**: Fast Refresh, App Router, View Transitions, Cache Components
- **API/함수**: `revalidateTag()`, `updateTag()`, `refresh()`, `useEffectEvent()`, `<Activity/>`
- **설정 키**: `experimental.cacheComponents`, `images.localPatterns`
- **약어**: SWR (Stale-While-Revalidate), SDK, API, TTL, PPR
- **고유명사**: Y Combinator, YC, Claude Code, Claude Agent SDK, Vercel

### 한글화 용어
샘플에서 확인된 한글화 용어:
- **일반 기술 용어**:
  - bundler → 번들러
  - caching → 캐싱
  - routing → 라우팅
  - navigation → 네비게이션
  - prefetching → 프리페칭
  - memoization → 메모이제이션
  - revalidation → 재검증 (괄호 병기: revalidation)
  - middleware → 미들웨어
  - deduplication → 중복 제거
- **React/Next.js 용어**:
  - component → 컴포넌트
  - rendering → 렌더링
  - hydration → 하이드레이션
  - layout → 레이아웃
  - streaming → 스트리밍
- **일반 용어**:
  - production → 프로덕션
  - development → 개발
  - deprecated → 더 이상 사용되지 않는 / 지원 종료 예정
  - breaking changes → 주요 변경사항
  - migration → 마이그레이션

### 괄호 병기 패턴
기술 용어 중 괄호로 원문을 병기하는 경우:
- "재검증(revalidation)"
- "중복 제거(Layout deduplication)"
- "점진적 프리페칭(Incremental prefetching)"
- "read-your-writes" (개념 자체가 영어로 통용)

### 일관성 규칙
- 한 문서 내에서 동일 용어는 동일하게 번역
- 용어집에 없는 새 용어 발견 시 용어집 업데이트 제안

### 용어집에 추가 제안 용어

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

---

## 4. 구조 규칙

### 필수 요소
- **번역 안내 blockquote**: `> 이 문서는 [원문 제목]의 한글 번역입니다.`
  - 링크 포함 형식: `> 이 문서는 [원문 제목](URL)의 한글 번역입니다.`
- **목차**: `## 목차` (Astro가 자동 생성)
- **TL;DR**: `<details>` 태그로 접을 수 있게
- **원문 정보**: 작성자, 작성일 (구분선 후 배치)
- **참고 자료**: `## 참고 자료` (문서 마지막에 배치)

### 섹션 순서 (샘플 기준)
1. Frontmatter (YAML)
2. 번역 안내 blockquote
3. 목차 (`## 목차`)
4. 핵심 요약 (`## 핵심 요약` + TL;DR)
5. 구분선 (`---`)
6. 원문 정보 (작성일, 작성자)
7. 본문 서론 (원문 내용 시작)
8. 본문 섹션들
9. 참고 자료 (`## 참고 자료`)

### TL;DR 형식
```markdown
## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용/개선사항
- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]

### 주의사항/핵심 메시지 (선택)
- [주의할 점 또는 핵심 메시지]

</details>
```

### 원문 정보 형식
```markdown
---

**원문 작성일**: YYYY년 MM월 DD일 (요일)

**작성자**: [원문 작성자 이름]
```

### 참고 자료 형식
```markdown
## 참고 자료

- [제목](URL)
- [원문 제목 - 원문](원문 URL)
```

---

## 5. Frontmatter 규칙

```yaml
---
title: "[번역] 원문 제목" 또는 "원문 제목 한글 번역"
description: "[번역] 또는 원문 제목 + 핵심 내용 요약 120-160자"
pubDatetime: YYYY-MM-DDTHH:MM:SSZ  # ISO 8601 UTC
modDatetime: YYYY-MM-DDTHH:MM:SSZ  # 수정일 (선택)
featured: false  # 또는 true
draft: false  # 또는 true (작성 중일 때)
tags: ["translation", "관련-태그", ...]
---
```

### title 패턴 (샘플 기준)
- 패턴 A: `"Next.js 16 Beta 한글 번역"`
- 패턴 B: `"[번역] 세 YC 스타트업이 Claude Code로 회사를 구축한 방법"`

### description 패턴 (샘플 기준)
- 제목 반복 + 핵심 키워드 나열
- 예: `"Next.js 16 Beta 한글 번역 - Turbopack 안정화, React Compiler 지원, 개선된 캐싱 API 등 주요 기능과 Breaking Changes를 한국어로 상세히 정리"`

### 태그 규칙
- 항상 `"translation"` 태그 포함
- 관련 기술 태그 추가 (소문자, 하이픈 사용)
  - 예: `"next-js"`, `"react"`, `"claude-code"`, `"ai"`, `"startup"`
- 4-5개 권장

---

## 6. SEO 최적화

### 제목
- 형식: `"[번역] 원문 제목"` 또는 `"원문 제목 한글 번역"`
- 길이: 20-70자
- 핵심 키워드를 앞쪽에 배치

### Description
- 길이: 120-160자
- 핵심 키워드 포함 (기술명, 기능명)
- 번역임을 명시 (`한글 번역`, `한국어로 정리` 등)
- 주요 내용 하이라이트

---

## 7. 코드 블록 규칙

### 코드 내 주석
- 코드 내 주석은 한글로 번역
- 예: `// 자동화된 업그레이드 CLI 사용`
- 예: `// 캐시를 만료시키고 즉시 새로 고침`

### 코드 블록 전후 설명
- 코드 블록 앞에 간략한 설명 제공
- 예: "설정에서 파일 시스템 캐싱을 활성화하세요:"

### 언어 태그
- 적절한 언어 태그 사용
- 예: ` ```typescript `, ` ```bash `, ` ```javascript `

---

## 학습된 패턴 히스토리

| 날짜 | 피드백 | 적용된 변경 |
|------|--------|-------------|
| 2025-12-29 | 초기 샘플 분석 | 2개 샘플 기반 스타일 가이드 생성 |

---

## 분석 대상 샘플

> translation-style-analyzer가 분석한 샘플 목록

- `01-nextjs-16-beta.md` - Next.js 16 Beta 공식 블로그 번역 (기술 문서 스타일)
- `02-yc-claude-code.md` - YC 스타트업 Claude Code 활용 사례 번역 (인터뷰/스토리 스타일)
