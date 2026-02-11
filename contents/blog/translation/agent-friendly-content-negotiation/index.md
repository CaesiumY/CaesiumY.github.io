---
title: "[번역] 콘텐츠 협상으로 에이전트 친화적인 페이지 만들기"
description: "Vercel이 HTTP 콘텐츠 협상을 활용해 동일한 URL에서 에이전트에게는 마크다운을, 사람에게는 HTML을 보여주는 방법. 페이로드 크기 99.6% 감소 달성."
pubDatetime: 2026-02-11T02:32:29Z
modDatetime: 2026-02-11T02:32:29Z
featured: false
draft: false
tags: ["translation", "vercel", "ai", "web", "http"]
---

> 이 글은 [Making agent-friendly pages with content negotiation](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation)의 한글 번역입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- AI 에이전트는 CSS, JavaScript, 이미지 없이 깔끔한 텍스트만 필요하므로, 마크다운이 최적 형식입니다.
- HTTP 콘텐츠 협상을 통해 같은 URL에서 에이전트에게는 마크다운을, 사람에게는 HTML을 제공합니다.
- 일반적인 블로그 글이 HTML로는 500KB지만 마크다운으로는 2KB에 불과합니다 (99.6% 감소).
- Next.js 미들웨어가 `Accept` 헤더를 확인하여 마크다운 요청을 라우트 핸들러로 전달합니다.
- 마크다운 사이트맵으로 에이전트가 사용 가능한 모든 콘텐츠를 쉽게 탐색할 수 있습니다.

### 핵심 메시지
- 에이전트를 위한 최적화는 별도 사이트가 아닌 콘텐츠 협상으로 구현 가능합니다.
- 토큰 효율성이 에이전트 성능과 비용을 크게 좌우합니다.

</details>

---

**원문 작성일**: 2026년 2월 4일

**작성자**: Zach Cowan, Mitul Shah

에이전트는 웹을 탐색하지만, 사람과는 다르게 읽습니다. CSS, 클라이언트 사이드 JavaScript, 이미지가 필요하지 않습니다. 불필요한 마크업은 컨텍스트 윈도우를 채우고 유용한 정보 없이 토큰만 소비합니다. 에이전트에게는 깔끔하고 구조화된 텍스트만 필요합니다.

Vercel은 이를 위해 블로그와 변경 내역 페이지를 업데이트하여 에이전트가 마크다운에 접근할 수 있도록 하면서도, 사람에게는 여전히 완성된 HTML과 CSS 환경을 보여줍니다. 핵심은 콘텐츠 협상(Content Negotiation)입니다. 중복 콘텐츠도, 별도 사이트도 없습니다.

> **역주**: 콘텐츠 협상(Content Negotiation)은 [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-5.3)에 정의된 HTTP 표준 메커니즘입니다. 클라이언트가 `Accept` 헤더를 통해 "나는 이런 형식을 선호합니다"라고 알리면, 서버가 같은 URL에서 요청에 맞는 최적의 형식을 골라 응답합니다. 예를 들어 브라우저는 `text/html`을, AI 에이전트는 `text/markdown`을 요청하면, 서버가 각각에 맞는 형식으로 동일한 콘텐츠를 반환하는 방식입니다.

에이전트는 HTTP `Accept` 헤더로 선호하는 형식을 지정합니다. 예를 들어 Claude Code는 페이지를 가져올 때 다음과 같은 헤더를 보냅니다:

```
Accept: text/markdown, text/html, */*
```

`text/markdown`을 맨 앞에 배치하여, 마크다운을 HTML보다 먼저 요청합니다. 점점 더 많은 에이전트가 이 방식으로 마크다운을 명시적으로 선호하기 시작했습니다.

curl 요청으로 직접 시도해볼 수 있습니다:

```bash
curl https://vercel.com/blog/self-driving-infrastructure -H "accept: text/markdown"
```

미들웨어가 요청의 `Accept` 헤더를 확인해 마크다운 선호 여부를 판단합니다. 마크다운이 선호되면, Next.js 라우트 핸들러가 Contentful 콘텐츠를 마크다운으로 변환합니다.

변환 과정에서 콘텐츠 구조는 그대로 보존됩니다. 코드 블록의 구문 강조 마커가 유지되고, 헤딩 계층 구조도 유지되며, 링크도 그대로 작동합니다. 에이전트는 HTML 버전과 동일한 정보를 토큰 효율성에 최적화된 형식으로 받습니다.

일반적인 블로그 글은 HTML, CSS, JavaScript를 모두 포함하면 500KB에 달합니다. 하지만 같은 콘텐츠를 마크다운으로 내보내면 2KB에 불과합니다. 페이로드 크기가 99.6% 줄어듭니다.

토큰 제한 내에서 작동하는 에이전트에게 작은 페이로드란, 요청당 더 많은 콘텐츠를 읽고 마크업 대신 실제 정보에 예산을 쓸 수 있다는 뜻입니다. 더 빠르게 작동하고, 한계에 덜 자주 부딪힙니다.

[Next.js 16 remote cache](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)와 공유 슬러그를 활용해 HTML과 마크다운 버전을 동기화합니다. Contentful에서 콘텐츠가 업데이트되면, 두 버전 모두 동시에 새로고침됩니다.

에이전트는 사용 가능한 콘텐츠를 발견할 수 있어야 합니다. Vercel은 에이전트 소비에 최적화된 형식으로 모든 콘텐츠를 나열하는 마크다운 사이트맵을 구현했습니다. 사이트맵에는 발행 날짜, 콘텐츠 유형, HTML과 마크다운 버전 직접 링크 등 각 콘텐츠의 메타데이터가 담겨 있습니다. 에이전트가 사용 가능한 전체 정보를 파악하고, 필요에 맞는 형식을 고를 수 있습니다.

직접 확인해보세요. 이 페이지의 URL 끝에 `.md`를 붙이면 [마크다운 버전](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation.md)을 볼 수 있습니다.

## 참고 자료

- [Making agent-friendly pages with content negotiation - 원문](https://vercel.com/blog/making-agent-friendly-pages-with-content-negotiation)
- [Next.js 16 remote cache 공식 문서](https://nextjs.org/docs/app/api-reference/directives/use-cache-remote)
