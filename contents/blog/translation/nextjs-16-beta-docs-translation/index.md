---
title: "Next.js 16 (beta) 릴리즈 한글 번역"
description: "Next.js 16 Beta 한글 번역 - Turbopack 안정화, React Compiler 지원, 개선된 캐싱 API 등 주요 기능과 Breaking Changes를 한국어로 상세히 정리"
pubDatetime: 2025-10-10T00:00:00Z
modDatetime: 2025-10-10T00:00:00Z
featured: true
draft: false
tags: ["nextjs", "translation", "react", "nextjs-16", "beta"]
canonicalURL: "https://nextjs.org/blog/next-16-beta"
---

> 이 문서는 Next.js 16 Beta 공식 블로그 글의 한글 번역입니다.

## 목차

## 핵심 요약
<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 개선사항

**성능 대폭 향상**
- **Turbopack 기본 번들러 적용**: 프로덕션 빌드 2-5배 향상, Fast Refresh 최대 10배 향상
- **파일 시스템 캐싱 (Beta)**: 대규모 프로젝트 재시작 시 컴파일 시간 대폭 단축
- **레이아웃 중복 제거**: 네트워크 전송 크기 대폭 감소 (50개 링크 → 1개 레이아웃 다운로드)

**새로운 기능**
- **React Compiler 안정화**: 컴포넌트 자동 메모이제이션으로 불필요한 리렌더링 제거
- **Build Adapters API (Alpha)**: 배포 플랫폼 맞춤 빌드 프로세스 커스터마이징
- **개선된 캐싱 API**:
  - `updateTag()`: 즉시 캐시 갱신 (read-your-writes)
  - `refresh()`: 캐시되지 않은 데이터만 선택적 갱신
  - `revalidateTag()`: SWR 동작으로 개선

**React 19.2 통합**
- View Transitions: 부드러운 페이지 전환 애니메이션
- `useEffectEvent()`: Effect에서 비반응형 로직 추출
- `<Activity/>`: 백그라운드 활동 렌더링

### ⚠️ 주요 변경사항 (Breaking Changes)

**필수 업그레이드**
- **Node.js 20.9+ 필요** (Node.js 18 지원 종료)
- **TypeScript 5.1+ 필요**
- **브라우저**: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+

**주요 API 변경사항**
- **비동기 필수**: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` 모두 `await` 사용 필수
- **`revalidateTag()` 변경**: 두 번째 인수로 `cacheLife` 프로필 필수 (예: `revalidateTag('tag', 'max')`)
- **이미지 보안 강화**: 로컬 IP 최적화 기본 차단, 쿼리 문자열 패턴 설정 필요

**제거된 주요 기능**
- AMP 지원 완전 제거
- `next lint` 명령 제거 (ESLint 직접 사용)
- PPR 플래그 제거 (Cache Components로 통합 중)
- `serverRuntimeConfig`, `publicRuntimeConfig` 제거 (환경 변수 사용)


**마이그레이션 주의사항**
- PPR 사용 중인 경우: 현재 `canary` 버전 유지, 마이그레이션 가이드 대기
- 자동 codemod로 대부분의 Breaking Changes 자동 수정 가능
- 상세한 마이그레이션 가이드는 안정 버전 출시 전 제공 예정

</details>

---

**원문 작성일**: 2025년 10월 9일 (목요일)

**작성자**: Andrew Clark, Jimmy Lai, Jiwon Choi, JJ Kasper, Tobias Koppers

Next.js 16 Beta가 공개되었습니다. 정식 버전 출시에 앞서 Turbopack, 캐싱 시스템, Next.js 아키텍처의 최신 개선사항을 미리 경험할 수 있습니다. 이번 릴리스의 주요 내용은 다음과 같습니다:

- [**Turbopack (안정화)**](#turbopack-안정화): 모든 앱의 기본 번들러로, 최대 5-10배 빠른 Fast Refresh와 2-5배 빠른 빌드 제공
- [**Turbopack 파일 시스템 캐싱 (Beta)**](#turbopack-파일-시스템-캐싱-beta): 대규모 앱을 위한 더욱 빠른 시작 및 컴파일 시간
- [**React Compiler 지원 (안정화)**](#react-compiler-지원-안정화): 자동 메모이제이션을 위한 내장 통합
- [**Build Adapters API (Alpha)**](#build-adapters-api-alpha): 빌드 프로세스를 수정할 수 있는 커스텀 어댑터 생성
- [**향상된 라우팅**](#향상된-라우팅-및-네비게이션): 레이아웃 중복 제거 및 점진적 프리페칭을 통한 최적화된 네비게이션과 프리페칭
- [**개선된 캐싱 API**](#개선된-캐싱-api): 새로운 `updateTag()`와 개선된 `revalidateTag()`
- [**React 19.2**](#react-192-및-canary-기능): View Transitions, `useEffectEvent()`, `<Activity/>`
- [**주요 변경사항**](#주요-변경사항-및-기타-업데이트): 비동기 params, `next/image` 기본값 등

**Beta 버전을 사용해보시고 피드백을 공유해주세요.** 여러분의 테스트가 정식 버전 출시 전에 문제를 발견하고 Next.js를 개선하는 데 큰 도움이 됩니다. 발견한 버그나 이슈는 [GitHub](https://github.com/vercel/next.js/issues)에 보고해주세요.

Beta로 업그레이드하기:

```bash
# 자동화된 업그레이드 CLI 사용
npx @next/codemod@canary upgrade beta

# ...또는 수동으로 업그레이드
npm install next@beta react@latest react-dom@latest

# ...또는 새 프로젝트 시작
npx create-next-app@beta
```

## 개발자 경험 (Developer Experience)

### Turbopack (안정화)

Turbopack이 개발 및 프로덕션 빌드 모두에서 안정화되었으며, 이제 모든 새로운 Next.js 프로젝트의 기본 번들러가 되었습니다. 올여름 초 베타 릴리스 이후, 채택률이 급격히 증가했습니다: Next.js 15.3 이상에서 개발 세션의 50% 이상과 프로덕션 빌드의 20%가 이미 Turbopack을 사용하고 있습니다.

Turbopack을 사용하면 다음을 기대할 수 있습니다:

- 2-5배 빠른 프로덕션 빌드
- 최대 10배 빠른 Fast Refresh

모든 Next.js 개발자에게 이러한 성능 향상을 제공하기 위해 Turbopack을 기본값으로 설정했으며, 별도의 설정이 필요하지 않습니다. 커스텀 webpack 설정이 있는 앱의 경우, 다음 명령을 실행하여 계속 webpack을 사용할 수 있습니다:

```bash
next dev --webpack
next build --webpack
```

### Turbopack 파일 시스템 캐싱 (Beta)

Turbopack은 이제 개발 환경에서 파일 시스템 캐싱을 지원합니다. 실행 간 컴파일러 아티팩트를 디스크에 저장하여, 특히 대규모 프로젝트의 재시작 시 컴파일 시간을 크게 단축합니다.

설정에서 파일 시스템 캐싱을 활성화하세요:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
```

모든 내부 Vercel 앱이 이미 이 기능을 사용하고 있으며, 대규모 저장소에서 개발자 생산성이 눈에 띄게 향상되었습니다.

파일 시스템 캐싱을 개선하는 동안 여러분의 피드백을 듣고 싶습니다. 사용해보시고 경험을 공유해주세요.

### create-next-app

`create-next-app`이 간소화된 설정 흐름, 업데이트된 프로젝트 구조, 개선된 기본값으로 재설계되었습니다. 새 템플릿에는 App Router, TypeScript, Tailwind CSS, ESLint가 기본으로 포함됩니다.

### Build Adapters API (Alpha)

[Build Adapters RFC](https://github.com/vercel/next.js/discussions/77740)에 따라 커뮤니티 및 배포 플랫폼과 협력하여 Build Adapters API의 첫 Alpha 버전을 제공했습니다.

Build Adapters를 사용하면 빌드 프로세스에 연결되는 커스텀 어댑터를 생성할 수 있어, 배포 플랫폼과 커스텀 빌드 통합이 Next.js 설정을 수정하거나 빌드 출력을 처리할 수 있습니다.

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    adapterPath: require.resolve('./my-adapter.js'),
  },
};

module.exports = nextConfig;
```

[RFC 토론](https://github.com/vercel/next.js/discussions/77740)에서 피드백을 공유해주세요.

### React Compiler 지원 (안정화)

React Compiler 1.0 릴리스에 맞춰 React Compiler에 대한 내장 지원이 Next.js 16에서 안정화되었습니다. React Compiler는 컴포넌트를 자동으로 메모이제이션하여, 수동 코드 변경 없이 불필요한 리렌더링을 줄입니다.

`reactCompiler` 설정 옵션이 `experimental`에서 안정화 단계로 승격되었습니다. 다양한 애플리케이션 유형에서 빌드 성능 데이터를 계속 수집 중이므로 기본적으로 활성화되어 있지 않습니다. React Compiler가 Babel에 의존하므로, 이 옵션을 활성화하면 개발 및 빌드 중 컴파일 시간이 더 길어질 것으로 예상됩니다.

```typescript
// next.config.ts
const nextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

최신 버전의 React Compiler 플러그인을 설치하세요:

```bash
npm install babel-plugin-react-compiler@latest
```

## 핵심 기능 및 아키텍처 (Core Features & Architecture)

### 향상된 라우팅 및 네비게이션

Next.js 16에는 라우팅 및 네비게이션 시스템의 완전한 개선이 포함되어 페이지 전환이 더 가볍고 빨라졌습니다.

**레이아웃 중복 제거 (Layout deduplication)**: 공유 레이아웃이 있는 여러 URL을 프리페치할 때, 레이아웃이 각 Link마다 별도로 다운로드되는 대신 한 번만 다운로드됩니다. 예를 들어, 50개의 제품 링크가 있는 페이지는 이제 공유 레이아웃을 50번이 아닌 한 번만 다운로드하여, 네트워크 전송 크기를 대폭 감소시킵니다.

**점진적 프리페칭 (Incremental prefetching)**: Next.js는 이제 전체 페이지가 아닌, 캐시에 아직 없는 부분만 프리페치합니다. 프리페치 캐시는 이제:

- 링크가 뷰포트를 벗어날 때 요청을 취소합니다
- 호버 시 또는 뷰포트에 재진입할 때 링크 프리페칭의 우선순위를 높입니다
- 데이터가 무효화될 때 링크를 다시 프리페치합니다
- Cache Components와 같은 향후 기능과 원활하게 작동합니다

**Trade-off**: 더 많은 개별 프리페치 요청을 볼 수 있지만, 총 전송 크기는 훨씬 낮습니다. 이는 거의 모든 애플리케이션에 적합한 trade-off입니다. 증가된 요청 수가 문제를 일으키는 경우 알려주세요. data chunk를 더 효율적으로 인라인하기 위한 추가 최적화가 진행 중입니다.

이러한 변경사항은 코드 수정 없이 자동으로 적용되며, 모든 상황에서 앱 성능을 개선합니다.

### PPR 및 Cache Components

Next.js 16은 실험적인 **Partial Pre-Rendering (PPR)** 플래그와 설정 옵션을 제거합니다. PPR은 Cache Components로 통합되고 있습니다.

Next.js 16부터는 `experimental.cacheComponents` 설정을 사용하여 PPR을 선택할 수 있습니다. 이는 기존 PPR과 다른 방식으로 구현되었으며, Cache Components의 추가 기능과 동작은 Next.js Conf 및 Next.js 16 안정 버전 출시 이전에 문서화되고 발표될 예정입니다.

> **애플리케이션이 PPR에 의존하는 경우** (`experimental.ppr = true`): 현재 사용 중인 Next.js `canary`의 고정 버전을 유지하세요. 마이그레이션에 문제가 있는 경우 현재 버전을 유지하세요. 안정 버전 출시 전에 마이그레이션 가이드를 제공할 예정입니다.

### 개선된 캐싱 API

Next.js 16은 캐시 동작에 대한 더 명시적인 제어를 위해 개선된 캐싱 API를 도입합니다.

#### revalidateTag() (업데이트됨)

`revalidateTag()`는 이제 stale-while-revalidate (SWR) 동작을 활성화하기 위해 두 번째 인수로 [**`cacheLife` 프로필**](https://nextjs.org/docs/app/api-reference/functions/cacheLife#reference)을 요구합니다:

```typescript
import { revalidateTag } from 'next/cache';

// ✅ 내장 cacheLife 프로필 사용 (대부분의 경우 'max'를 권장)
revalidateTag('blog-posts', 'max');

// 또는 다른 내장 프로필 사용
revalidateTag('news-feed', 'hours');
revalidateTag('analytics', 'days');

// 또는 커스텀 재검증(revalidation) 시간이 있는 인라인 객체 사용
revalidateTag('products', { revalidate: 3600 });

// ⚠️ 더 이상 사용되지 않음 - 단일 인수 형식
revalidateTag('blog-posts');
```

프로필 인수는 내장 `cacheLife` 프로필 이름(`'max'`, `'hours'`, `'days'`와 같은) 또는 `next.config`에 정의된 [커스텀 프로필](https://nextjs.org/docs/app/api-reference/functions/cacheLife#defining-reusable-cache-profiles)을 허용합니다. 인라인 `{ revalidate: number }` 객체를 전달할 수도 있습니다. 대부분의 경우 `'max'` 사용을 권장합니다. 이는 장기 콘텐츠의 백그라운드 재검증(revalidation)을 활성화하기 때문입니다. 사용자가 태그가 지정된 콘텐츠를 요청하면, Next.js가 백그라운드에서 재검증(revalidation)하는 동안 즉시 캐시된 데이터를 받습니다.

특정 태그로 지정된 캐시 항목을 stale-while-revalidate 방식으로 무효화하고 싶다면 `revalidateTag()`를 사용하세요. 이 방식은 데이터가 즉시 업데이트되지 않아도 괜찮은 정적 콘텐츠(예: 블로그 포스트, 제품 목록 등)에 적합합니다. 사용자는 기존 캐시된 데이터를 먼저 받고, 백그라운드에서 새로운 데이터로 갱신됩니다.

> **마이그레이션 안내:** 기존 코드 마이그레이션 시 stale-while-revalidate 동작을 원한다면 `revalidateTag()`의 두 번째 인수로 `cacheLife` 프로필을 전달하세요(대부분의 경우 `'max'` 권장). 반면에 사용자가 변경사항을 즉시 확인해야 하는 경우(read-your-writes가 필요한 경우)에는 Server Actions에서 `updateTag()`를 사용하세요.

#### updateTag() (새로운 기능)

`updateTag()`는 **read-your-writes** 시맨틱을 제공하는 새로운 Server Actions 전용 API로, 하나의 요청 안에서 캐시를 만료시키는 동시에 새로운 데이터로 즉시 갱신합니다:

```typescript
'use server';

import { updateTag } from 'next/cache';

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);

  // 캐시를 만료시키고 즉시 새로 고침 - 사용자가 변경사항을 바로 확인
  updateTag(`user-${userId}`);
}
```

이 API는 사용자 인터랙션이 필요한 기능에서 변경사항이 즉시 반영되도록 보장합니다. 폼 제출, 사용자 설정 변경 등 사용자가 즉각적인 피드백을 기대하는 모든 워크플로우에 적합합니다.

#### refresh() (새로운 기능)

`refresh()`는 캐시되지 않은 데이터만을 갱신하는 Server Actions 전용 API입니다. 기존 캐시는 그대로 유지됩니다:

```typescript
'use server';

import { refresh } from 'next/cache';

export async function markNotificationAsRead(notificationId: string) {
  // 데이터베이스에서 알림을 읽음 상태로 업데이트
  await db.notifications.markAsRead(notificationId);

  // 헤더에 표시되는 알림 개수를 새로 고침
  // (별도로 가져오며 캐시되지 않음)
  refresh();
}
```

이 API는 클라이언트 측 `router.refresh()`를 보완합니다. 서버 액션 실행 후 페이지 내 다른 위치의 캐시되지 않은 데이터를 갱신해야 할 때 사용하세요. 캐시된 페이지 구조와 정적 콘텐츠는 빠른 속도를 유지하면서, 알림 개수나 실시간 지표, 상태 표시기 같은 동적 데이터만 갱신됩니다.

### React 19.2 및 Canary 기능

Next.js 16의 App Router는 React 19.2 기능과 점진적으로 안정화 중인 기능을 포함하는 최신 React [Canary 릴리스](https://react.dev/blog/2023/05/03/react-canaries)를 사용합니다. 주요 내용은 다음과 같습니다:

- **[View Transitions](https://react.dev/reference/react/ViewTransition)**: Transition이나 페이지 이동 시 변경되는 요소에 애니메이션 효과 적용
- **[`useEffectEvent`](https://react.dev/reference/react/useEffectEvent)**: Effect에서 반응성이 없는 로직을 추출하여 재사용 가능한 Effect Event 함수로 만들기
- **[Activity](https://react.dev/reference/react/Activity)**: `display: none`으로 UI를 숨기면서도 상태는 유지하고 Effect는 정리하여 "백그라운드 활동" 렌더링

[React 19.2 발표](https://react.dev/blog/2025/10/01/react-19-2)에서 자세히 알아보세요.

## 주요 변경사항 및 기타 업데이트

### 버전 요구사항

| 변경사항          | 세부사항                                               |
| ----------------- | ------------------------------------------------------ |
| **Node.js 20.9+** | 최소 버전 요구사항: 20.9.0 (LTS); Node.js 18 지원 종료 |
| **TypeScript 5+** | 최소 버전 요구사항: 5.1.0                              |
| **브라우저**      | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+     |

### 제거된 기능

이전에 deprecated된 기능들이 완전히 제거되었습니다:

| 제거된 항목                                           | 대체 방법                                                                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **AMP 지원**                                          | 모든 AMP API와 설정 완전 제거 (`useAmp`, `export const config = { amp: true }`)                                                                |
| **`next lint` 명령**                                  | Biome 또는 ESLint를 직접 사용; `next build`는 더 이상 린팅을 실행하지 않음. codemod 제공: `npx @next/codemod@canary next-lint-to-eslint-cli .` |
| **`devIndicators` 옵션**                              | 설정에서 `appIsrStatus`, `buildActivity`, `buildActivityPosition` 제거. 표시기는 유지됨.                                                       |
| **`serverRuntimeConfig`, `publicRuntimeConfig`**      | 환경 변수 사용 (`.env` 파일)                                                                                                                   |
| **`experimental.turbopack` 위치**                     | 설정이 최상위 `turbopack`으로 이동 (더 이상 `experimental`에 없음)                                                                             |
| **`experimental.dynamicIO` 플래그**                   | `experimental.cacheComponents`로 이름 변경                                                                                                     |
| **`experimental.ppr` 플래그**                         | PPR 플래그 제거; Cache Components 프로그래밍 모델로 진화 중                                                                                    |
| **`export const experimental_ppr`**                   | 라우트 수준 PPR 내보내기 제거; Cache Components 프로그래밍 모델로 진화 중                                                                      |
| **자동 `scroll-behavior: smooth`**                    | 다시 활성화하려면 HTML 문서에 `data-scroll-behavior="smooth"` 추가                                                                             |
| **`unstable_rootParams()`**                           | 다가오는 마이너 버전에서 제공할 대체 API 작업 중                                                                                               |
| **동기 `params`, `searchParams` props** 접근          | 비동기를 사용해야 함: `await params`, `await searchParams`                                                                                     |
| **동기 `cookies()`, `headers()`, `draftMode()`** 접근 | 비동기를 사용해야 함: `await cookies()`, `await headers()`, `await draftMode()`                                                                |
| **메타데이터 이미지 라우트 `params` 인수**            | 비동기 `params`로 변경; `generateImageMetadata`의 `id`는 이제 `Promise<string>`                                                                |
| **쿼리 문자열이 있는 `next/image` 로컬 src**          | 경로 열거 공격(path enumeration attack)을 방지하기 위해 `images.localPatterns` 설정 필요                                                       |

### 동작 변경사항

Next.js 16에서 새로운 기본 동작을 갖는 기능들:

| 변경된 동작                           | 세부사항                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **기본 번들러**                       | Turbopack이 모든 애플리케이션의 기본 번들러로 변경; `next build --webpack`으로 옵트아웃 가능                                                                        |
| **`images.minimumCacheTTL` 기본값**   | 60초에서 4시간(14400초)으로 변경; cache-control 헤더가 없는 이미지의 재검증(revalidation) 비용 감소                                                                 |
| **`images.imageSizes` 기본값**        | 기본 크기에서 `16` 제거 (전체 프로젝트의 4.2%만 사용); srcset 크기와 API 변형 감소                                                                                  |
| **`images.qualities` 기본값**         | `[1..100]`에서 `[75]`로 변경; `quality` 속성값은 `images.qualities` 배열의 가장 가까운 값으로 자동 조정됨                                                           |
| **`images.dangerouslyAllowLocalIP`**  | 새로운 보안 제한 조치로 로컬 IP 이미지 최적화 기본 차단; 사설 네트워크 전용으로 `true` 설정 필요                                                                    |
| **`images.maximumRedirects` 기본값**  | 무제한에서 최대 3개 리디렉션으로 변경; 비활성화하려면 `0`으로 설정하거나 드문 엣지 케이스에 대해 증가                                                               |
| **`@next/eslint-plugin-next` 기본값** | ESLint 플랫 설정(Flat Config) 형식을 기본값으로 변경, 레거시 설정 지원 중단 예정인 ESLint v10에 맞춰 정렬                                                           |
| **프리페치 캐시 동작**                | 레이아웃 중복 제거와 점진적 프리페칭으로 완전히 재작성                                                                                                              |
| **`revalidateTag()` 서명**            | SWR(Stale-While-Revalidate) 동작을 위해 두 번째 인수로 `cacheLife` 프로필 필요                                                                                      |
| **Turbopack의 Babel 설정**            | babel 설정이 발견되면 자동으로 Babel 활성화 (이전에는 하드 에러로 종료)                                                                                             |
| **터미널 출력**                       | 더 명확한 형식, 더 나은 오류 메시지, 개선된 성능 지표로 재설계                                                                                                      |
| **개발 및 빌드 출력 디렉토리**        | `next dev`와 `next build`가 별도의 출력 디렉토리를 사용하여 동시 실행 가능                                                                                          |
| **잠금 파일 동작**                    | 동일한 프로젝트에서 여러 `next dev` 또는 `next build` 인스턴스를 방지하는 잠금 파일 메커니즘 추가                                                                   |
| **병렬 라우트 `default.js`**          | 모든 병렬 라우트 슬롯에 명시적인 `default.js` 파일 필수; 없으면 빌드 실패. 이전 동작 유지를 위해 `notFound()` 호출 또는 `null` 반환하는 `default.js` 파일 생성 필요 |
| **현대적인 Sass API**                 | `sass-loader`를 v16으로 업그레이드, 현대적인 Sass 구문과 새로운 기능 지원                                                                                           |

### 더 이상 사용되지 않는 기능

Next.js 16에서 deprecated되었으며, 향후 버전에서 제거 예정인 기능:

| 더 이상 사용되지 않는 항목   | 세부사항                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `middleware.ts` 파일명       | 네트워크 경계와 라우팅 역할을 명확히 하기 위해 `proxy.ts`로 이름 변경                                                           |
| `next/legacy/image` 컴포넌트 | 개선된 성능과 기능을 위해 `next/image` 사용                                                                                     |
| `images.domains` 설정        | 개선된 보안 제한을 위해 `images.remotePatterns` 설정 사용                                                                       |
| `revalidateTag()` 단일 인수  | SWR을 위해 `revalidateTag(tag, profile)` 사용, 또는 즉시 반영(read-your-writes)을 위해 Server Actions에서 `updateTag(tag)` 사용 |

### 추가 개선사항

- **성능 개선**: `next dev`와 `next start` 명령어의 상당한 성능 최적화
- **`next.config.ts`를 위한 Node.js 네이티브 TypeScript 지원**: `--experimental-next-config-strip-types` 플래그와 함께 `next dev`, `next build`, `next start` 명령어를 실행하여 `next.config.ts`의 네이티브 TypeScript 지원 활성화

안정 버전 출시 전에 더 상세한 마이그레이션 가이드를 문서로 제공할 예정입니다.

## 피드백 및 커뮤니티

피드백을 공유하여 Next.js의 발전에 기여해주세요:

- [GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [GitHub Issues](https://github.com/vercel/next.js/issues)
- [Discord Community](https://nextjs.org/discord)

## 기여자 (Contributors)

Next.js는 3,000명 이상의 개발자가 함께 만들어가는 프로젝트입니다. 이번 릴리스는 다음 분들의 기여로 완성되었습니다:

- **Next.js** 팀: [Andrew](https://github.com/acdlite), [Hendrik](https://github.com/unstubbable), [Janka](https://github.com/lubieowoce), [Jiachi](https://github.com/huozhi), [Jimmy](https://github.com/feedthejim), [Jiwon](https://github.com/devjiwonchoi), [JJ](https://github.com/ijjk), [Josh](https://github.com/gnoff), [Jude](https://github.com/gao_jude), [Sam](https://x.com/samselikoff), [Sebastian](https://github.com/sebmarkbage), [Sebbie](https://github.com/eps1lon), [Wyatt](https://github.com/wyattjoh), 그리고 [Zack](https://github.com/ztanner).
- **Turbopack** 팀: [Benjamin](https://github.com/bgw), [Josh](https://github.com/Cy-Tek), [Luke](https://github.com/lukesandberg), [Niklas](https://github.com/mischnic), [Tim](https://github.com/timneutkens), [Tobias](https://github.com/sokra), 그리고 [Will](https://github.com/wbinnssmith).
- **Next.js Docs** 팀: [Delba](https://github.com/delbaoliveira), [Rich](https://github.com/molebox), [Ismael](https://github.com/ismaelrumzan), 그리고 [Joseph](https://github.com/icyJoseph).

@mischnic, @timneutkens, @unstubbable, @wyattjoh, @Cy-Tek, @lukesandberg, @OoMNoO, @ztanner, @icyJoseph, @huozhi, @gnoff, @ijjk, @povilasv, @dwrth, @obendev, @aymericzip, @devjiwonchoi, @SyMind, @vercel-release-bot, @Shireee, @eps1lon, @dharun36, @kachkaev, @bgw, @yousefdawood7, @TheAlexLichter, @sokra, @ericx0099, @leerob, @Copilot, @fireairforce, @fufuShih, @anvibanga, @hayes, @Milancen123, @martinfrancois, @lubieowoce, @gaojude, @lachlanjc, @liketiger, @styfle, @aaronbrown-vercel, @Samii2383, @FelipeChicaiza, @kevva, @m1abdullahh, @F7b5, @Anshuman71, @RobertFent, @poteto, @chloe-yan, @sireesha-siri, @brian-lou, @joao4xz, @stefanprobst, @samselikoff, @acdlite, @gwkline, @bgub, @brock-statsig, 그리고 @karlhorky 님께 도움에 대해 큰 감사를 드립니다!

## 참고 자료

- [Next.js 16 Beta 공식 블로그](https://nextjs.org/blog/next-16-beta)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [GitHub - Next.js](https://github.com/vercel/next.js)
