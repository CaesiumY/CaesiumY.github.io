---
title: "[번역] React 서버 컴포넌트 성능 소개"
description: "React 서버 컴포넌트의 성능을 CSR, SSR과 비교 분석한 글의 한국어 번역. LCP, 데이터 페칭, 스트리밍 관점에서 각 렌더링 방식의 장단점을 실제 측정 데이터와 함께 설명합니다."
pubDatetime: 2026-01-17T12:05:00Z
modDatetime: 2026-01-17T12:05:00Z
featured: false
draft: true
tags: ["translation", "react", "server-components", "performance", "next-js", "ssr"]
---

> 이 문서는 [Intro to Performance of React Server Components](https://calendar.perfplanet.com/2025/intro-to-performance-of-react-server-components/)의 한글 번역입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- React 서버 컴포넌트는 데이터 페칭이 관련될 때만 성능 이점이 있습니다
- CSR 대비 LCP 개선: 4.1s → 1.28s (SSR), 데이터 페칭 시 1.28s (서버 컴포넌트)
- 서버 컴포넌트는 스트리밍을 통해 점진적 렌더링을 구현하여 데이터 로딩 시간을 최적화합니다
- 모든 렌더링 방식에는 트레이드오프가 있습니다 (비인터랙티브 구간, 서버 비용 등)

### 주의사항
- 올바르게 구현하지 않으면 오히려 성능이 저하될 수 있습니다
- 전체 앱을 서버 우선 방식으로 재설계해야 하므로 마이그레이션 비용이 큽니다
- 아직 실험 단계 기술이므로 확립된 Best Practice가 부족합니다

</details>

---

**원문 작성일**: 2025년 1월

**작성자**: [Nadia Makarevich](https://www.developerway.com/)

[React 서버 컴포넌트](https://react.dev/reference/rsc/server-components)에 대해 들어보셨나요? React를 매일 사용하지 않더라도 아마 들어봤을 겁니다. 지난 몇 년간 React 커뮤니티에서 가장 뜨거운 주제였으니까요.

가장 멋진 새 기능일 뿐만 아니라, 서버 컴포넌트는 성능 관점에서 자주 거론됩니다. 정말 성능에 좋다고 알려져 있죠.

주된 약속은 비교적 단순합니다. 더 많은 작업을 서버로 밀어내고, 더 적은 JavaScript를 전송하고, 데이터를 더 일찍 페칭하면 페이지의 초기 로드가 빨라진다는 것입니다. 하지만 정확히 어떻게 이런 일이 일어날까요? 그리고 성능이 얼마나 개선될까요? 오늘은 이를 조사해보겠습니다.

참고로 이 글은 40분 분량의 전체 조사를 React를 사용하지 않는 독자를 위해 짧게 요약한 버전입니다. 모든 구현 세부사항까지 알고 싶다면 [원문을 확인하세요](https://www.developerway.com/posts/bundle-size-investigation).

## 조사 환경 설정

여기서 문제는 서버 컴포넌트를 독립적으로 사용해서 측정할 수 없다는 점입니다. 켜고 끌 수 있는 React 기능이 아니거든요.

서버 컴포넌트는 매우 복잡한 기술이며, 일부 최신 번들러와 프레임워크에 깊이 통합되어 있어서 직접 구현하기는 거의 불가능합니다. 적어도 합리적인 노력으로는요.

게다가 이해하기 쉬운 기능도 아닙니다. 특히 성능 관점에서 이해하려면 React가 평소 어떻게 렌더링하고 데이터를 페칭하는지 명확히 알고 있어야 합니다.

클라이언트와 서버 모두에서요! 여기서 재미있는 점이 있습니다. 서버 렌더링이라는 개념은 이미 있습니다! 그것도 수년간 말이죠. 그렇다면 무엇이 다를까요?

이 모든 것을 조사하기 위해 여러 클라이언트 사이드 라우트와 클라이언트 사이드 데이터 페칭을 가진 단일 페이지 앱(SPA)을 만들었습니다. 직접 실험을 재현하고 싶다면 [GitHub에서 확인할 수 있습니다](https://github.com/developerway/react-server-components).

웹사이트의 한 페이지는 다음과 같습니다.

![왼쪽에 사이드바 네비게이션, 오른쪽에 메시지 목록을 보여주는 데모 앱 인박스 페이지](https://calendar.perfplanet.com/images/2025/nadia/inbox-full.png)

이 페이지의 일부 데이터는 동적이며 REST 엔드포인트를 통해 페칭됩니다. 구체적으로 왼쪽 사이드바 항목은 `/api/sidebar`에서, 오른쪽 메시지 목록은 `/api/messages`에서 페칭됩니다.

`/api/sidebar` 엔드포인트는 **100ms**로 꽤 빠릅니다. 하지만 `/api/messages` 엔드포인트는 **1초**가 걸립니다. 누군가 백엔드 최적화를 깜빡했네요. 이 수치는 오래되고 큰 프로젝트에서는 어느 정도 현실적인 편입니다.

이 글에서는 초기 로드에 집중하여 다음을 측정하겠습니다.

- [LCP](https://web.dev/articles/lcp) - 페이지 정적 부분의 로딩과 일치합니다
- 인박스 목록의 메시지가 보이는 시간
- 사이드바 항목이 보이는 시간

## 클라이언트 사이드 렌더링

먼저 클라이언트 사이드 렌더링입니다. 세대에 따라 클라이언트 사이드 렌더링이 기본 React 경험이거나 심지어 기본 웹 경험일 수도 있습니다.

구현 관점에서 브라우저가 `/inbox` URL을 요청하면 서버가 다음과 같은 HTML로 응답합니다.

```html
<!doctype html>
<html lang="en">
  <head>
    <script type="module" src="/assets/index-C3kWgjO3.js"></script>
    <link rel="stylesheet" href="/assets/index-C26Og_lN.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

`head` 태그에 `script`와 `link` 요소가 있고, `body`에는 빈 `div`가 있습니다. 그게 전부입니다. 브라우저에서 JavaScript를 비활성화하면 빈 페이지가 보입니다. 빈 div니까 당연하죠.

이 빈 `div`를 멋진 페이지로 변환하려면 브라우저가 JavaScript 파일을 다운로드하고 실행해야 합니다. 파일에는 React 개발자가 작성한 모든 것이 들어있습니다.

```jsx
// 멋진 앱의 진입점
export default function App() {
  return (
    <SomeLayout>
      <Sidebar />
      <MainContent />
    </SomeLayout>
  );
}
```

이와 함께 다음과 같은 코드도 있습니다.

```jsx
// 단순화를 위해 만든 가상 API
const DOMElements = renderToDOM(<App />);
const root = document.getElementById("root");
root.appendChild(DOMElements);
```

React 자체가 `App` 진입점 컴포넌트를 DOM 노드로 변환합니다. 그런 다음 `id`로 빈 div를 찾습니다. 그리고 생성된 요소를 빈 div에 주입합니다.

전체 인터페이스가 갑자기 보입니다.

초기 로드의 성능을 기록하면 다음과 같은 그림이 나옵니다.

![클라이언트 사이드 렌더링을 보여주는 타임라인 다이어그램](https://calendar.perfplanet.com/images/2025/nadia/client-side-rendering-schema.png)

JavaScript를 다운로드하는 동안 사용자는 여전히 빈 화면을 봅니다. JS가 컴파일·실행된 후에야 UI가 보이고 LCP가 기록되고 fetch 같은 부수 효과가 실행됩니다.

JavaScript 캐시가 없는 초기 로딩 수치는 다음과 같습니다 (CPU와 네트워크 쓰로틀링 적용: 6배 속도 저하 및 Slow 4G).

|  | LCP | 사이드바 | 메시지 |
| --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |

## 서버 사이드 렌더링 (데이터 페칭 없음)

빈 페이지를 그토록 오래 봐야 한다는 점이 어느 순간 사람들을 짜증나게 했습니다. 처음 한 번뿐이라고 해도요. 게다가 SEO 목적으로도 최선의 솔루션은 아니었습니다.

그래서 사람들은 해결책을 고민하기 시작했습니다. 너무 편리한 React 세계를 포기하지 않으면서요.

전체 React 앱이 최종적으로 다음과 같다는 건 이미 알고 있습니다.

```jsx
// 단순화를 위한 가상 API
const DOMElements = renderToDOM(<App />);
```

하지만 React가 DOM 노드 대신 앱의 HTML을 생성할 수 있다면 어떨까요?

```jsx
const HTMLString = renderToString(<App />);
```

서버가 빈 div 대신 브라우저로 보낼 수 있는 실제 문자열 말이죠.

```jsx
// HTMLString에는 다음 문자열이 포함됩니다:
<div className="...">
  <div className="...">...</div>
  ...
</div>
```

이론적으로 클라이언트 사이드 렌더링을 위한 극도로 단순한 서버는 다음과 같습니다.

```jsx
// 클라이언트 사이드 렌더링에는 이것만 있으면 됩니다
export const serveStatic = async (c) => {
  const html = fs.readFileSync("index.html").toString();

  return c.body(html, 200);
};
```

여전히 단순하게 유지할 수 있습니다. `html` 변수에서 문자열을 찾아 바꾸는 단계만 하나 추가하면 됩니다.

```jsx
// SSR이 적용된 동일한 서버
export const serveStatic = async (c) => {
  const html = fs.readFileSync("index.html").toString();

  // HTML 문자열 추출
  const HTMLString = renderToString(<App />);
  // 서버 응답에 주입
  const htmlWithSSR = html.replace('<div id="root"></div>', HTMLString);

  return c.body(htmlWithSSR, 200);
};
```

이제 전체 UI가 JavaScript를 기다리지 않고 처음부터 바로 보입니다.

React의 서버 사이드 렌더링(SSR)과 정적 사이트 생성(SSG) 시대에 오신 것을 환영합니다. [renderToString](https://react.dev/reference/react-dom/server/renderToString)은 실제로 React가 지원하는 진짜 API니까요. 이것이 말 그대로 일부 React SSG/SSR 프레임워크의 핵심 구현입니다.

클라이언트 사이드 렌더링 프로젝트에서 정확히 이렇게 하면 서버 사이드 렌더링 프로젝트가 됩니다. 성능 프로필이 약간 바뀝니다. LCP 수치가 왼쪽으로 이동하여 HTML과 CSS가 다운로드된 직후에 나타납니다. 전체 HTML이 초기 서버 응답으로 전송되고 모든 것이 즉시 보이니까요.

![서버 사이드 렌더링을 보여주는 타임라인 다이어그램](https://calendar.perfplanet.com/images/2025/nadia/server-side-rendering.png)

여기서 몇 가지 짚어볼 점이 있습니다.

첫째, 보시다시피 LCP 수치(페이지 "스켈레톤"이 보이는 시점)가 크게 개선됩니다 (곧 측정해보겠습니다).

하지만 여전히 동일한 JavaScript를 정확히 같은 방식으로 다운로드, 컴파일, 실행해야 합니다. 페이지가 인터랙티브해야 하니까요. 즉, 구현한 모든 드롭다운, 필터, 정렬 알고리즘이 작동해야 합니다. 기다리는 동안 전체 페이지는 이미 보입니다!

페이지가 이미 보이지만 JavaScript 다운로드를 기다려야 하는 그 간격 동안 사용자에게는 페이지가 **망가진 것처럼** 보입니다. 물론 특별한 조치를 취하지 않는 한요.

또한 그림에서 LCP 마크만 이동했습니다. "사이드바 항목"과 "메시지"는 구조적으로 정확히 같은 위치에 있습니다. 코드를 전혀 변경하지 않았고 여전히 클라이언트에서 데이터를 페칭하고 있기 때문입니다!

결과적으로 서버에서 페이지를 사전 렌더링해도 사이드바 항목이나 목록 데이터가 나타나는 시간에는 전혀 영향이 없습니다.

수치는 다음과 같습니다.

|  | LCP (캐시 없음) | 사이드바 (캐시 없음) | 메시지 (캐시 없음) | 비인터랙티브 구간 |
| --- | --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |  |
| 서버 사이드 렌더링 (클라이언트 데이터 페칭) | **1.61 s** | 4.7 s | 5.1 s | 2.39 s |

보시다시피 초기 로드의 LCP 값은 실제로 크게 떨어졌습니다. **4.1초에서 1.61초로요**! 이론적인 도식과 정확히 일치합니다. 하지만 초기 로드에서 페이지가 2초 이상 반응하지 않습니다.

SSR로 전환하면 비인터랙티브 구간과 서버 비용이라는 대가를 치릅니다. 피할 수 없습니다. 사용자가 첫 실행 중에 다운로드해야 하는 JavaScript 양을 줄여서 최소화할 수만 있습니다.

하지만 아무도 SSR을 수동으로 구현하지는 않을 겁니다. 대부분 처음부터 SSR 친화적인 프레임워크를 사용할 겁니다. 예를 들어 앱을 Next.js로 옮기면 수치는 다음과 같습니다.

|  | LCP (캐시 없음) | 사이드바 (캐시 없음) | 메시지 (캐시 없음) | 비인터랙티브 구간 |
| --- | --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |  |
| 서버 사이드 렌더링 (클라이언트 데이터 페칭) | **1.61 s** | 4.7 s | 5.1 s | 2.39 s |
| Next.js SSR (최신 버전) | ***1.28 s*** | 4.4 s | 4.9 s | 2.52 s |

Next.js는 코드 분할과 리소스 우선순위를 매우 다르게 처리하므로 LCP에서 훨씬 더 많은 것을 짜냈습니다. 나머지 수치는 비슷합니다.

## 서버 사이드 렌더링 (데이터 페칭 포함)

비인터랙티브 구간은 제쳐두고, 사이드바와 메시지 표시 시간에 변화가 없는 것도 문제입니다. 하지만 이미 서버 영역에 있으니 여기서 그 데이터를 추출할 수 없을까요? 분명 더 빠를 겁니다. 최소한 대기 시간과 대역폭은 훨씬 나을 겁니다.

당연히 가능합니다! 다만 앞서 했던 단순한 사전 렌더링에 비해 구현 작업이 훨씬 많아집니다. 먼저 서버입니다. 거기서 데이터를 페칭해야 합니다.

```jsx
// SSR 서버에 데이터 페칭 추가
export const serveStatic = async (c) => {
  const html = fs.readFileSync("index.html").toString();

  // 데이터 페칭 로직
  const sidebarPromise = fetch(`/api/sidebar`).then((res) => res.json());
  const messagesPromise = fetch(`/api/messages`).then((res) => res.json());

  const [sidebar, messages] = await Promise.all([
    sidebarPromise,
    messagesPromise,
  ]);

  // HTML 문자열 추출
  const HTMLString = renderToString(<App />);
  // 서버 응답에 주입
  const htmlWithSSR = html.replace('<div id="root"></div>', HTMLString);

  ... // 나머지는 동일
};
```

그런 다음 해당 데이터를 React 앱에 전달해야 합니다.

```jsx
// 페칭한 데이터를 props로 전달
const HTMLString = renderToString(<App messages={messages} sidebar={sidebar} />);
```

그런 다음 해당 데이터를 HTML 코드에 주입하는 여러 마법을 부리고, 앱에서 그 데이터를 추출해 초기화합니다. 정확한 세부사항은 지금 중요하지 않습니다. 중요한 건 다음과 같습니다.

- 서버에서 해당 데이터를 페칭하지 못할 이유가 없습니다. 몇 가지 Promise를 `await`하기만 하면 됩니다
- 완벽하게 작동합니다!

성능 구조가 다시 바뀝니다.

![서버 데이터 페칭이 포함된 SSR을 보여주는 타임라인 다이어그램](https://calendar.perfplanet.com/images/2025/nadia/server-side-rendering-with-data.png)

이제 이전에 동적이었던 항목을 포함한 전체 페이지가 CSS 다운로드가 완료되자마자 보입니다. 그런 다음 이전과 똑같이 JavaScript를 기다려야 하고, 그래야 페이지가 인터랙티브해집니다.

다시 말하지만 대부분은 이를 위해 프레임워크를 사용할 것이므로 Next.js 수치를 바로 보여드리겠습니다.

|  | LCP (캐시 없음) | 사이드바 (캐시 없음) | 메시지 (캐시 없음) | 비인터랙티브 구간 |
| --- | --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |  |
| 서버 사이드 렌더링 (클라이언트 데이터 페칭) | **1.61 s** | 4.7 s | 5.1 s | 2.39 s |
| Next.js SSR (클라이언트 데이터 페칭) | ***1.28 s*** | 4.4 s | 4.9 s | 2.52 s |
| Next.js SSR (서버 데이터 페칭) | 1.78 s | 1.78 s | 1.78 s | 2.52 s |

LCP 값이 오히려 떨어졌습니다. 당연하죠. 사전 렌더링 전에 데이터 페칭이 끝나야 하니까요.

렌더링을 시작하려면 해당 데이터가 필요하므로 정말로 기다려야 합니다.

하지만 사이드바와 메시지 항목은 이제 훨씬 빨리 나타납니다. **4.9초에서 1.78초로요**. 전체 페이지 보기가 LCP보다 중요하다면 확실한 개선입니다. 또는 사이드바만 사전 페칭할 수도 있습니다 (이 엔드포인트는 꽤 빠릅니다). 메시지 부분은 클라이언트에 유지하면서 최소한의 성능 저하만 감수하면 됩니다.

## React 서버 컴포넌트 소개

좋습니다. 이전 섹션을 요약하면 서버에서 페칭하고 사전 렌더링하는 방식은 초기 로드 성능에 큰 도움이 됩니다. 하지만 여전히 문제가 있습니다.

데이터 페칭입니다! 현재 서버에서 메시지를 사전 페칭해서 메시지 표시 대기 시간을 줄이면 초기 로드와 사이드바 표시 시간 모두 느려집니다.

현재 서버 렌더링이 동기 프로세스이기 때문입니다. 먼저 모든 데이터를 기다린 다음 `renderToString`에 전달하고, 그 결과를 클라이언트로 보냅니다.

![동기 SSR 구조를 보여주는 다이어그램](https://calendar.perfplanet.com/images/2025/nadia/current-ssr-structure.png)

하지만 서버가 더 똑똑해질 수 있다면요? fetch 요청은 Promise, 비동기 함수입니다. 기술적으로 다른 작업을 시작하려고 기다릴 필요가 없습니다. 다음과 같이 할 수 있다면 어떨까요?

1. 기다리지 않고 fetch Promise를 트리거합니다
2. 해당 데이터가 필요하지 않은 React 항목 렌더링을 시작하고, 준비되면 즉시 클라이언트로 보냅니다
3. 사이드바 Promise가 해결되고 데이터를 사용할 수 있으면 사이드바 부분을 렌더링하고 서버 페이지에 주입한 다음 클라이언트로 보냅니다
4. 메시지에 대해서도 동일하게 합니다

기본적으로 클라이언트 사이드 렌더링에 있는 것과 정확히 동일한 데이터 페칭 구조를 복제하되 *서버에서* 하는 겁니다.

![React 서버 컴포넌트 스트리밍 구조를 보여주는 다이어그램](https://calendar.perfplanet.com/images/2025/nadia/server-components-structure.png)

이게 가능하다면 이론적으로 엄청나게 빨라질 수 있습니다. 가장 단순한 SSR 속도로 플레이스홀더가 있는 초기 페이지를 제공하고, JavaScript가 다운로드·실행되기 훨씬 *전에* 사이드바와 메시지 항목을 볼 수 있게 됩니다.

이를 위해 React는 단순한 동기 `renderToString`을 포기해야 합니다. 렌더링 프로세스를 청크 단위로 다시 작성하고, 해당 청크를 렌더링된 구조에 주입할 수 있게 만들고, 클라이언트에 독립적으로 제공할 수 있어야 합니다.

꽤 큰 작업입니다! 그리고 이것이 말 그대로 스트리밍과 결합된 React 서버 컴포넌트가 하는 일입니다.

정확한 구현 방식은 [정신이 아득해질 정도로 복잡하고](https://www.developerway.com/posts/react-server-components-performance#introducing-react-server-components) React를 사용하지 않는 독자에게는 그다지 중요하지 않습니다. 설명한 대로 작동한다고 가정하고, 수치만 확인해봅시다.

수치는 다음과 같습니다.

|  | LCP (캐시 없음) | 사이드바 (캐시 없음) | 메시지 (캐시 없음) | 비인터랙티브 구간 |
| --- | --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |  |
| 서버 사이드 렌더링 (클라이언트 데이터 페칭) | **1.61 s** | 4.7 s | 5.1 s | 2.39 s |
| Next.js SSR (클라이언트 데이터 페칭) | ***1.28 s*** | 4.4 s | 4.9 s | 2.52 s |
| Next.js SSR (서버 데이터 페칭) | 1.78 s | 1.78 s | 1.78 s | 2.52 s |
| Next.js App Router (Suspense를 사용한 서버 페칭) | ***1.28 s*** | ***1.28 s*** | ***1.28 s*** | **2.52 s** |

수치는 인상적입니다. 어떤 이유로 함께 병합되었습니다. 어딘가에서 배칭을 하는 것 같은데, 세 가지가 결국 동일한 청크로 묶였습니다.

하지만 `/api/sidebar`의 시간을 3초로, `/api/messages`의 시간을 5초로 늘리면 점진적 렌더링 그림이 보입니다. 사용자에게는 클라이언트 사이드 렌더링과 정확히 똑같아 보이지만 더 빠릅니다.

하지만 성능 프로필은 재미있어집니다.

![React 서버 컴포넌트를 보여주는 Chrome DevTools 성능 프로필](https://calendar.perfplanet.com/images/2025/nadia/server-components-performance-profile.png)

네트워크 섹션에서 저 긴 HTML 막대가 보이시나요? 서버가 데이터를 기다리는 동안 연결을 열어두고 있는 겁니다. 더 "전통적인" SSR과 비교해보세요.

![전통적인 SSR을 보여주는 Chrome DevTools 성능 프로필](https://calendar.perfplanet.com/images/2025/nadia/traditional-ssr-performance-profile.png)

HTML은 완료되자마자 끝나고 기다리지 않습니다.

## 조사 결과

좋습니다. 이 수치들은 꽤 인상적이지 않나요? 서버 컴포넌트는 비인터랙티브 구간을 제외한 모든 범주에서 확실한 승자입니다.

|  | LCP (캐시 없음) | 사이드바 (캐시 없음) | 메시지 (캐시 없음) | 비인터랙티브 구간 |
| --- | --- | --- | --- | --- |
| 클라이언트 사이드 렌더링 | 4.1 s | 4.7 s | 5.1 s |  |
| 서버 사이드 렌더링 (클라이언트 데이터 페칭) | **1.61 s** | 4.7 s | 5.1 s | 2.39 s |
| Next.js SSR (클라이언트 데이터 페칭) | ***1.28 s*** | 4.4 s | 4.9 s | 2.52 s |
| Next.js SSR (서버 데이터 페칭) | 1.78 s | 1.78 s | 1.78 s | 2.52 s |
| Next.js App Router (Suspense를 사용한 서버 페칭) | ***1.28 s*** | ***1.28 s*** | ***1.28 s*** | **2.52 s** |

그렇다면 주변 모든 사람에게 서버 컴포넌트로 전환하라고 압박해야 할까요?

솔직히 말하기 어렵습니다. 네, 서버 컴포넌트를 올바르게 구현하면 초기 로드를 개선할 수 있습니다.

하지만!

**데이터 페칭**이 포함될 때만 서버 컴포넌트의 성능 이점을 볼 수 있습니다. 인터랙티브 앱만 렌더링하면 되거나 동적 데이터를 크게 신경 쓰지 않고 LCP가 주요 관심사라면 "전통적인" SSR과 동일한 성능 결과를 얻을 겁니다.

그리고 서버 컴포넌트로 전환하는 데는 엄청난 비용이 듭니다. 새로운 서버 우선 방식으로 데이터를 페칭하도록 전체 앱을 완전히 재설계해야 하니까요. 알던 모든 것이 뒤집힙니다 (다시 한 번). 또한 *올바르게* 구현해야 합니다. 실수 하나면 성능이 안 좋아지거나 오히려 나빠질 수 있습니다.

그리고 거기서 실수하기는 정말, 정말, 정말 쉽습니다. 여전히 매우 실험적인 최첨단 기술이라는 점을 잊지 마세요. 아직 확립된 Best Practice도 없고, IDE 지원도 최소한이며, 전면 도입 시 완전한 벤더 락인이 발생합니다. 적어도 React 관련 서클에서는 인터넷을 뒤흔든 [최근 보안 취약점](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)은 말할 것도 없고요.

잠재적인 성능 개선이 그만한 가치가 있는지는 물론 여러분이 결정할 일입니다.

## 참고 자료

- [Intro to Performance of React Server Components - 원문](https://calendar.perfplanet.com/2025/intro-to-performance-of-react-server-components/)
- [React Server Components 공식 문서](https://react.dev/reference/rsc/server-components)
- [실험 코드 GitHub 저장소](https://github.com/developerway/react-server-components)
- [전체 조사 원문](https://www.developerway.com/posts/bundle-size-investigation)
