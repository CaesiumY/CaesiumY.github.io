---
title: "[번역] 로컬 개발 시간 83% 단축: Next.js에서 벗어난 이유"
description: "Inngest 팀이 Next.js에서 Tanstack Start로 마이그레이션하여 로컬 개발 로드 시간을 10-12초에서 2-3초로 단축한 과정과 교훈을 공유합니다."
pubDatetime: 2026-02-19T05:50:47Z
modDatetime: 2026-02-19T16:51:33Z
featured: false
draft: false
tags: ["translation", "next-js", "tanstack", "react", "migration", "dx"]
ogImage: "https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/featured-image.png"
---

> 이 글은 [Reducing local dev time by 83%: Why we migrated off Next.js](https://www.inngest.com/blog/migrating-off-nextjs-tanstack-start)의 한글 번역입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- Inngest 팀은 Next.js의 느린 로컬 개발 속도(10-12초)와 높은 인지 부하에 지쳐, Tanstack Start로 마이그레이션했습니다.
- Turbopack 도입, Next.js 업그레이드 등 여러 시도를 했지만 근본적인 개선이 되지 않았습니다.
- Tanstack Start, Deno Fresh, React Router v7 세 가지 대안을 프로토타이핑한 후 Tanstack Start를 선택했습니다.
- 엔지니어 1명이 AI의 도움을 받아 약 2주 만에 마이그레이션을 완료했습니다.
- 결과: 초기 페이지 로드 2-3초, 이후 라우트는 거의 즉시 로드됩니다.

### 핵심 교훈
- 서버/클라이언트 번들링 이슈를 빨리 잡으려면 자주 빌드하세요.
- 전면 전환 방식은 거대한 PR을 만들지만, 철저한 UAT(사용자 수용 테스트)로 보완할 수 있습니다.

</details>

---

**원문 작성일**: 2026년 1월 30일 (금요일)

**작성자**: Jacob Heric

![로컬 개발 시간 83% 단축: Next.js에서 벗어난 이유 대표 이미지](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/featured-image.png)

Inngest에서 DX(개발자 경험)는 알파이자 오메가입니다. 탁월한 사용성과 편리한 API가 고객들이 Inngest를 선택하고 계속 쓰는 이유입니다. 그래서 모든 엔지니어링 결정이 **단순하게, 명확하게, 즐겁게**라는 같은 원칙을 따르는 것도 당연합니다. 개발자가 Inngest를 쓸 때 느끼는 감정과 우리 팀이 Inngest를 *만들 때* 느끼는 감정을 분리하는 건 거의 불가능합니다.

이 글은 우리가 Next.js에서 벗어난 과정과 이유에 대한 이야기입니다.

## 초기 신호, 그리고 해결 시도

제가 약 2년 전 Inngest에 합류했을 때, 팀은 이미 Next.js에 올인한 상태였습니다. App Router가 아직 베타일 때 도입했고, [하루 만에 Vite에서 마이그레이션](https://www.inngest.com/blog/migrating-from-vite-to-nextjs?ref=blog-migrating-off-nextjs-tanstack-start)했으며, RSC(React 서버 컴포넌트)를 React의 미래로 받아들였습니다. 당시로서는 혹할 만했습니다. SPA의 빈 로딩 화면과 네트워크 워터폴에서 벗어나고, 중첩 레이아웃과 스트리밍이 기본으로 지원되며, 단일 프레임워크로 통합하는 거였죠.

하지만 달콤한 시간은 오래가지 않았습니다. Next.js는 특정 워크플로우에 최적화되어 있습니다 — 프레임워크에 풀타임으로 집중하는 전담 프론트엔드 팀 말입니다. 대부분의 엔지니어가 여러 역할을 겸하는 소규모 팀인 우리에게 인지 부하는 가혹했습니다. `"use client"` / `"use server"` 지시어, 겹겹이 쌓인 캐시 API, RSC와 클라이언트 컴포넌트 간의 모호한 경계 — 이 모든 것이 시간이 갈수록 마찰을 키웠습니다.

프론트엔드에 익숙하지 않은 엔지니어들은 기능을 출시하기보다 프레임워크와 싸우느라 시간을 낭비했습니다.

### RSC에서 물러나기

첫 번째 시도로, RSC 사용을 줄이고 바닐라 서버 컴포넌트를 최소한으로 쓰며 클라이언트 컴포넌트를 주로 사용했습니다. 이 방법은 어느 정도 도움이 되었고, 적어도 잠깐은 개발자 경험이 대체로 괜찮았습니다.

하지만 곧 모든 게 느려졌습니다. *정말* 느려졌습니다. **로컬 개발에서 초기 페이지 로드 시간이 최소 10-12초까지 늘어났습니다.** 슬랙에 쏟아진 반응: "진짜 싫어." "프론트엔드가 너무 느려."

우리 개발자 경험이 *형편없었다*는 것을 모두가 동의했습니다.

### Turbopack 추가와 Next.js 업그레이드

상황을 살려보려 Next.js를 업그레이드하고 Vercel의 프로파일링 도구를 사용해봤습니다. 별 효과가 없었습니다.

그래서 Turbopack을 시도했습니다. 사실 두 번이나요. 우리 규모의 코드베이스에서는 결코 만만한 작업이 아니었습니다. 매번 의존성 업그레이드와 리팩토링이 필요했습니다. 게다가 당시 Vercel이 프로덕션 빌드에서는 Webpack만 지원했기 때문에 로컬 개발 환경과 프로덕션 환경이 달라지는 문제도 생겼습니다.

이로 인해 몇 가지 문제가 발생했고, 안타깝게도 로컬 로드 시간도 평균 몇 초 줄었을 뿐입니다.

Turbopack은 사실 그다지 *turbo*하지 않은 것 같았습니다. Next.js 바깥을 살펴볼 때가 된 것이죠.

## 대안 검토

![그림 1: Next.js와 Tanstack Start 비교](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-1-performance-comparison.png)

더 빠른 로컬 로드 시간, 합리적인 라우터 API, 서버/클라이언트 컴포넌트에 대한 명확한 규칙이 필요했습니다. Tanstack Start, Deno Fresh, React Router v7(사실상 Remix) 세 가지를 프로토타이핑했습니다.

이전 스타트업에서 Deno Fresh와 Remix 모두 대규모 복잡한 애플리케이션에 사용해본 적이 있습니다. 둘 다 훌륭합니다. Deno의 고성능 TypeScript 기본 런타임과 확고한 도구 체계는 특히 매력적입니다. React Router는 실전에서 검증된 프레임워크입니다. 하지만 Fresh가 버전 1과 2 사이에 오래 걸린 점이 걱정이었고, Remix가 React Router에 합쳐졌다가 다시 별도 프리뷰 플랫폼으로 분리한 것도 우려되었습니다. Tanstack Start는? 이 글을 쓰는 시점에도 여전히 릴리스 후보(RC) 단계입니다!

그럼에도 각각으로 프로토타입을 만들어 필수 통합 기능과 요구사항을 확인했습니다. 세 가지 모두 통과했지만 효과는 제각각이었습니다. 명확한 탈락 사유는 없었습니다.

## Tanstack 선택과 마이그레이션

![그림 2: 프로토타입에서 배포까지의 마이그레이션 타임라인](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-2-migration-timeline.png)

결국 Tanstack Start를 선택했습니다. 앞서 공유한 맥락을 보면 의외의 선택처럼 보일 수 있지만, 팀은 이미 Tanstack의 다른 라이브러리를 사용하고 있었고 그 방향성에 매우 긍정적이었습니다.

개발자 경험을 중시한다면, 개발자가 쓰고 싶어하는 도구를 고르는 것도 중요합니다.

### 점진적 전환, 아니면 전면 전환?

다음은 점진적으로 진행할지, 한 번에 밀어붙일지의 선택이었습니다.

**전면 전환 방식**은 시간과 리소스가 관건이었습니다. 인증과 통합은 프로토타이핑 단계에서 처리했지만, 라우트 변환에 필요한 노력이 미지수였습니다.

**점진적 접근 방식**은 조건부 라우팅과 공유 컴포넌트 라이브러리의 조건부 임포트가 필요했는데, 이 라이브러리가 Next.js 유틸리티에 크게 의존했습니다. 인프라 작업이 더 많아지는 셈이었죠.

결정하려면 라우트 변환 작업량을 파악해야 했습니다. 이를 추정하는 유일한 방법은 직접 해보는 것이었습니다.

### 한 번에 밀어붙이기

Next.js 앱 헤드가 두 개 있었습니다. 하나는 개발 서버용, 하나는 대시보드용이었습니다.

**개발 서버**는 대시보드 라우트의 일부만 있어서 여기서 시작해 몇 개를 변환했습니다. 놀랍게도 변환이 충분히 빨라서 그대로 밀고 나가 며칠 만에 전부 완료했습니다. 전체적으로, 개발 서버는 약 일주일 만에 마이그레이션이 끝났습니다.

공유 컴포넌트는 Next.js를 사용하는 곳마다 복사본을 만들어 Tanstack 대응 코드로 교체했습니다. 앱 헤드 간 상호 참조 문제가 몇 가지 있었지만, 간단한 임시 타입 해킹으로 빠르게 해결했습니다.

**대시보드**는 더 오래 걸렸습니다. 라우트가 더 많고 복잡도가 높았습니다. 프로젝트가 조금 더 길어졌지만, 그래도 AI 도움을 받은 엔지니어 1명이 약 2주면 충분했습니다.

## 결과

마이그레이션 후 DX가 *극적으로* 개선되었습니다. 로컬 초기 페이지 로드는 거의 2-3초를 넘지 않습니다. 그것도 **어떤** 라우트든 처음 로드할 때만 해당됩니다. 첫 번째 이후의 라우트는 Tanstack에서 거의 항상 즉시 로드됩니다. Next.js의 모든 라우트 첫 로드가 항상 느렸던 것과 대조됩니다. 슬랙에서의 반응이 완전히 바뀌었습니다: "이렇게 빠를 줄 몰랐어!"

### 기술적 트레이드오프

기술적 트레이드오프는 이 [비교 매트릭스](https://tanstack.com/start/latest/docs/framework/react/comparison)에 상세히 나와 있습니다. 우리에게 핵심 차이는 Next.js의 '관례 우선(convention-over-configuration)' 방식을 버린 것이었습니다. 아리송한 지시어를 버리고, Tanstack의 명확한 라우트 설정과 정해진 데이터 로딩 방식을 선택한 것입니다.

아래 예시를 보면 Next.js의 App Router가 Tanstack Router와 일부 규칙을 공유하지만, Remix를 써본 분이라면 Tanstack과의 유사점을 바로 알아챌 것입니다.

### Next.js App Router

레이아웃과 서버 사이드 데이터 페칭이 뒤섞이는 전형적인 패턴입니다. 서버 사이드 페칭임을 알 수 있는 유일한 단서는 `async/await`입니다.

### Tanstack Router

여기서 `getEnvironment`는 서버에서만 실행되는 `createServerFn`입니다. `useLoaderData` 훅으로 클라이언트 사이드에서 라우트 데이터에 접근합니다. 기본적으로 Remix + [Tanstack 서버 함수](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)입니다.

## AI를 어떻게 활용했는가

![그림 3: AI 보조 변환 워크플로우](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-3-ai-workflow.png)

아키텍처와 패턴을 깔끔하고 일관되게 유지하려고, AI에게는 변환 반복 작업만 맡겼습니다. 라우트와 하위 라우트를 변환하고, 서버/클라이언트 데이터 페칭 패턴을 정한 뒤 AI가 그 패턴을 비슷한 라우트에 적용하도록 했습니다. 그다음 결과를 확인하고 필요한 부분을 정리했습니다. 이 과정을 반복했습니다.

AI는 난해한 버그나 TypeScript 이슈 해결에도 도움이 되었습니다. 반복 작업을 줄이고 디버깅 시간을 제한해서, 엔지니어 1명이 약 2주 만에 마이그레이션을 완료했고 최종 병합과 UAT(사용자 수용 테스트) 기간에도 다른 기능 개발에 거의 영향을 주지 않았습니다.

최종 병합과 UAT 동안 기능 개발이 중단된 것은 겨우 2-3일이었습니다. AI 없이는 훨씬 더 오래 걸렸을 것이고, 위험도 더 컸을 것입니다.

## 배운 교훈

이 프로젝트는 빠르고 비교적 순조로웠습니다. 하지만 같은 길을 선택할 분들에게 도움이 될 몇 가지 팁을 정리했습니다.

### Tanstack Start에서 배운 것들

**자주, 일찍 빌드하고 컴파일하세요.** 서버 사이드 코드가 많다면, 클라이언트나 서버에 포함되면 안 되는 코드가 번들에 섞이는 문제를 겪게 됩니다. 이런 문제를 빌드 에러 출력에서 분리하기는 매우 어렵습니다. 빌드 사이의 변경 범위를 작게 유지하면, 문제가 발생했을 때 자신에게 감사하게 될 것입니다.

**개발 모드만 믿지 마세요.** 개발 모드와 빌드된 앱의 동작이 달라 몇 번 문제를 겪었습니다. 확신이 안 서면, 빌드 후 로컬에서 프리뷰하세요. 로컬 빌드 및 프리뷰를 위한 스크립트 예시:

```json
"build": "pnpm build:tsc pnpm build:vite",
"build:tsc": "tsc --noEmit",
"build:vite": "vite build",
"start:local": "PORT=5173 node -r dotenv/config .output/server/index.mjs dotenv_config_path=.env.local"
```

### 마이그레이션 과정에서 배운 것들

**전면 전환은 거대한 PR을 만듭니다.** 한 번에 밀어붙이는 변환은 거대한 PR을 만들고, 기존 방식으로는 리뷰가 거의 불가능합니다. 우리는 이 트레이드오프를 받아들이고, 대신 철저한 사용자 수용 테스트에 의존했습니다. 이를 통해 사용자에게 최소한의 영향으로 전환할 수 있었습니다.

프로덕션 외부에서 테스트하기 어려운 통합 플로우에서 이슈가 딱 하나 발생해 즉시 롤백한 정도입니다.

즉, 대부분의 팀에게는 한 번에 밀어붙이는 게 낫습니다. 점진적 전환에 별도 투자할 가치는 극도로 보수적인 환경에서만 있습니다.

## 자신만의 마이그레이션 결정 내리기

Tanstack Start로 전환할 준비가 되었다면, 마이그레이션 결과물은 모두 UI 모노레포에 오픈소스로 공개되어 있습니다: [https://github.com/inngest/inngest/tree/main/ui](https://github.com/inngest/inngest/tree/main/ui)

전환 시점이나 대안을 아직 결정하지 못했다면, 아래 참고 가이드를 보세요 (제 경험 기반입니다!):

![프레임워크 마이그레이션 결정 가이드](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/framework-migration-decision.png)

물론, Inngest [디스코드](https://www.inngest.com/discord?ref=blog-migrating-off-nextjs-tanstack-start)에서 저에게 직접 물어보셔도 됩니다.

서버리스 및 이벤트 기반 워크플로우에 내구성을 더하되 인프라 복잡함은 피하고 싶다면, [inngest.com](https://inngest.com)을 살펴보세요.

## 참고 자료

- [Reducing local dev time by 83%: Why we migrated off Next.js - 원문](https://www.inngest.com/blog/migrating-off-nextjs-tanstack-start)
- [Tanstack Start vs Next.js 비교 매트릭스](https://tanstack.com/start/latest/docs/framework/react/comparison)
- [Tanstack 서버 함수 가이드](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [Inngest UI 모노레포 (GitHub)](https://github.com/inngest/inngest/tree/main/ui)
- [Inngest의 Vite에서 Next.js 마이그레이션 경험](https://www.inngest.com/blog/migrating-from-vite-to-nextjs?ref=blog-migrating-off-nextjs-tanstack-start)
