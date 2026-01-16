---
title: "[번역] React 모범 사례 공개"
description: "[번역] React Best Practices - Vercel이 10년 이상의 React와 Next.js 최적화 경험을 AI 에이전트 친화적 구조로 공개. 워터폴 제거, 번들 크기 최적화 등 40개 이상의 성능 규칙을 담은 프레임워크"
pubDatetime: 2026-01-16T10:11:26Z
modDatetime: 2026-01-16T10:11:26Z
tags: ["translation", "react", "next-js", "performance", "vercel", "ai"]
featured: false
draft: false
---

> 이 문서는 [Introducing: React Best Practices](https://vercel.com/blog/introducing-react-best-practices)의 한글 번역입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- Vercel이 10년 이상의 React와 Next.js 최적화 경험을 `react-best-practices` 저장소에 공개
- AI 에이전트와 LLM에 맞게 구조를 짜서 코드 리뷰와 자동 최적화에 쓸 수 있음
- 40개 이상의 성능 규칙을 8개 카테고리로 분류하고 영향도(CRITICAL~LOW)를 표시
- 가장 큰 효과를 내는 두 가지: (1) 워터폴 제거, (2) 번들 크기 축소
- Opencode, Codex, Claude Code, Cursor 등 코딩 에이전트에 Agent Skills로 설치 가능

### 핵심 메시지
- 성능 최적화는 반응적이 아닌 **예방적**으로 접근해야 합니다
- 스택의 상위(워터폴, 번들 크기)부터 최적화하면 누적 효과가 큽니다
- 이 모범 사례는 이론이 아닌 프로덕션 환경에서 검증된 실전 경험입니다

</details>

---

**원문 작성일**: 2026년 1월 15일

**작성자**: Shu Ding (소프트웨어 엔지니어), Andrew Qu (Chief of Software, Vercel)

10년 이상의 React와 Next.js 최적화 경험을 [`react-best-practices`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)에 담았습니다. 이 저장소는 AI 에이전트와 LLM에 최적화된 구조로 만들었습니다.

![React Best Practices 이미지](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F14aMyBW08k2S4GJM0NsG25%2F7605d0aff8d41f9386cc3e36d39d972a%2Fml.png&w=1920&q=75)

React 성능 작업은 대개 사후 대응입니다. 배포 후 앱이 느려지면 팀은 증상부터 쫓게 됩니다. 비용도 많이 들고, 엉뚱한 곳을 최적화하기 십상입니다.

10년 넘게 프로덕션 코드베이스에서 동일한 근본 원인을 봐왔습니다.

- 의도치 않게 순차적으로 실행되는 비동기 작업
- 시간이 지나면서 점점 커지는 클라이언트 번들
- 필요 이상으로 리렌더링되는 컴포넌트

이유는 간단합니다. 마이크로 최적화가 아니기 때문입니다. 대기 시간, 버벅임, 그리고 모든 사용자 세션마다 발생하는 반복 비용으로 나타납니다.

그래서 이 문제들을 쉽게 찾고 빠르게 고칠 수 있는 React 모범 사례 프레임워크를 만들었습니다.

## 성능 최적화가 실패하는 이유

대부분의 성능 작업은 스택의 너무 낮은 곳에서 시작하기 때문에 실패합니다.

요청 워터폴이 600ms의 대기 시간을 더한다면, `useMemo` 호출을 아무리 최적화해도 소용없습니다. 300KB JavaScript를 추가로 보내는 상황에서 루프 최적화로 몇 마이크로초 줄여봐야 소용없습니다.

성능 작업은 누적됩니다. 오늘 배포한 작은 성능 저하는 누군가 기술 부채를 갚기 전까지 모든 세션에 장기적인 세금이 됩니다.

그래서 이 프레임워크는 효과가 가장 큰 두 가지 수정부터 시작합니다.

1. 워터폴 제거
2. 번들 크기 축소

그런 다음 서버 사이드 성능, 클라이언트 사이드 데이터 페칭, 리렌더링 최적화로 이어집니다.

총 8개 카테고리, 40개 이상의 규칙이 영향도 순으로 나열되어 있습니다. CRITICAL(워터폴 제거, 번들 크기 축소)부터 점진적 개선(고급 패턴)까지입니다.

## 성능 카테고리

이 저장소는 8개의 성능 카테고리를 다룹니다.

- 비동기 워터폴 제거
- 번들 크기 최적화
- 서버 사이드 성능
- 클라이언트 사이드 데이터 페칭
- 리렌더링 최적화
- 렌더링 성능
- 고급 패턴
- JavaScript 성능

각 규칙에는 영향도 등급(CRITICAL~LOW)과 코드 예시가 있어서, 우선순위를 정하고 수정 방법을 바로 확인할 수 있습니다.

예를 들어, 다음은 사용하지 않는 코드를 불필요하게 블로킹하는 흔한 패턴입니다.

*잘못된 예 (두 분기 모두 블로킹됨):*

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // 즉시 반환하지만 userData를 기다렸음
    return { skipped: true }
  }

  // 이 분기만 userData를 사용함
  return processUserData(userData)
}
```

*올바른 예 (필요할 때만 블로킹됨):*

```typescript
async function handleRequest(
  userId: string,
  skipProcessing: boolean
) {
  if (skipProcessing) {
    return { skipped: true }
  }

  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

개별 규칙 파일들을 `AGENTS.md` 하나로 모아서, 에이전트가 코드 리뷰나 최적화 제안 시 참조할 수 있습니다. AI 에이전트도 일관되게 따를 수 있게 설계해서, 대규모 코드베이스에서도 팀이 같은 판단을 내릴 수 있습니다.

## 프로덕션에서 검증된 사례

이 규칙들은 이론이 아닙니다. 프로덕션 코드베이스에서 실제 성능 작업을 통해 얻은 경험입니다.

몇 가지 예시:

![성능 개선 사례 이미지](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5klVTrwVHBbwRXeifeHmAd%2F1b866288fb2c9fb9f22301299348d94a%2FCleanShot_2026-01-14_at_09.28.52_2x.png&w=1920&q=75)

**루프 순회 통합**

채팅 페이지가 동일한 메시지 목록을 8번 따로 스캔하고 있었습니다. 단일 패스로 결합했고, 메시지가 수천 개일 때 효과가 확실합니다.

**await 병렬화**

API가 한 데이터베이스 호출이 끝날 때까지 기다렸다가 다음 호출을 시작했습니다. 서로 의존하지 않는데도 말입니다. 동시에 실행하니 전체 대기 시간이 절반으로 줄었습니다.

**폰트 폴백 튜닝**

커스텀 폰트가 로드되기 전에 시스템 폰트를 사용할 때 헤드라인이 좁아 보였습니다. letter-spacing을 조정해서 폴백 폰트가 깨진 것처럼 보이지 않고 의도된 것처럼 보이도록 만들었습니다.

## Agent Skills로 설치 가능

이 모범 사례는 [Agent Skills](https://github.com/vercel-labs/agent-skills)로도 나와 있어서, Opencode, Codex, Claude Code, Cursor 등에 설치할 수 있습니다. 에이전트가 연쇄적인 `useEffect` 호출이나 무거운 클라이언트 사이드 import를 발견하면, 이 패턴을 참조하여 수정을 제안할 수 있습니다.

```bash
npx add-skill vercel-labs/agent-skills
```

[`react-best-practices`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) 저장소를 확인해보세요.

## 참고 자료

- [Introducing: React Best Practices - Vercel 공식 블로그](https://vercel.com/blog/introducing-react-best-practices)
- [react-best-practices - GitHub 저장소](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
- [Agent Skills - GitHub 저장소](https://github.com/vercel-labs/agent-skills)
