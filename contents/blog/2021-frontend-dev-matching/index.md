---
title: "🔍[2021 Dev-Matching: 웹 프론트엔드 개발자] 회고"
author: Caesiumy
pubDatetime: 2021-09-05T09:00:00Z
description: "프로그래머스 Dev-Matching 웹 프론트엔드 개발자 회고"
featured: false
draft: false
tags:
  - review
  - frontend
  - career
  - programmers
---

![banner](./b_banner.png)

[<공고 바로가기>](https://programmers.co.kr/competitions/1582)

# 0. 데브 매칭이란?

[프로그래머스](https://programmers.co.kr/competitions)에서 진행하는 채용을 전제로한 챌린지이다.
비단 프론트엔드 분야 뿐만 아니라 백엔드(서버), 안드로이드, ios 앱 등 여러 분야로 진행된다. 다른 테스트와 다른 점이라면 **시간 제한 과제 테스트**로 진행된다는 점!

내가 참여한 프론트엔드 분야는 `Vanilla Javascript`, `html`, `css` 만을 사용할 수 있다. `react` 나 `vue`를 사용하지 않고 순수 자바스크립트로 개발하라는 조건은 확실히 '과제' 라고 할만한 도전 과제이다.

> 프레임워크와 라이브러리의 소중함을 깨달을 순간이 왔다.

# 1. 준비하기

코딩 테스트는 알고리즘 문제를 풀어보면 된다. 그럼 과제 테스트는?
다행히도 프로그래머스에서는 매년 챌린지를 진행해왔기 때문에 **이전 과제들**을 풀어보면 된다. 특히 올해 상반기 챌린지는 친절하게도 풀이까지 붙어있다.

> 하지만 풀이에서 보여준 건 기본 조건이다.

이전 챌린지들의 풀이는 인터넷에 찾아보면 나와있다.
~~사실 외부로 유출하면 안 된다고 되어있는데 괜찮으려나~~

만약 순수 자바스크립트로 개발하는 것이 처음이라면, 그것도 **순수 자바스크립트로 `SPA` 를 따라해서 `컴포넌트 기반`으로 개발하는 것이 처음이라면(나처럼)!** 풀이를 참고해보는 것을 무척 추천한다.

> 물론 따라하지 말고 직접 구현해봐야 실력이 는다.

나는 의욕이 먼저 앞섰는지 `함수 기반 리액트`를 구현해보겠다고 `가상 돔`, `리액트 훅스` 등의 개념을 바닐라로 구현하는 법을 공부하다 시험날이 다가왔다... 덕분에 결국 클래스 기반으로 작성하게 된 건 비밀...

# 2. 챌린지

문제는 어려울 것이 없었다. 오히려 `html` 마크업과, `css` 가 전부 완성되어있어 정말 `js`에만 집중하면 될 정도였다!

> 지난번 토스 코테도 그렇고 테스트 문제들이 진화하는 게 느껴진다.

## 2-1 넌 못 지나간다

**그런데...!** 초장부터 난관에 부딪혔다. `js` 스크립트를 불러오는 과정에서 `module` 타입이 먹히질 않는 것이었다!

기존에는 `웹팩`으로 번들링하던 습관이 있어서 **어떠한 라이브러리도 사용하지 못하는 이번 챌린지에서** 눈치채지 못한 부분이었다.

```html
<script type="module" src="./src/app.js"></script>
```

위의 코드가 안 된다고? 그럼 `import` 와 `export` 는 어떻게 쓰라는 거지?

결국 찾은 방법은 `IIFE` 패턴을 사용하는 것.

```js
// components/Component.js
(function(global) {
  class Component {
    // 컴포넌트 구현
  }
  global.Component = Component;
})(window);
```

이런 식으로 전역 객체에 직접 할당하는 방법으로 해결했다.

## 2-2 상태관리는 어떻게?

프레임워크 없이 상태를 관리하는 것도 신경 쓸 부분이 많았다.

상태가 변경될 때마다 연관된 컴포넌트들을 다시 렌더링해야 하는데, 이를 수동으로 관리하는 것은 꽤나 번거로웠다.

```js
class Store {
  constructor() {
    this.state = {};
    this.observers = [];
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify() {
    this.observers.forEach(observer => observer(this.state));
  }
}
```

간단한 옵저버 패턴을 구현해서 상태 변경을 감지하고 컴포넌트들을 업데이트했다.

## 2-3 라우팅은?

SPA를 구현하려면 라우팅도 필요했다. `history API`를 사용해서 구현했다.

```js
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }
  
  init() {
    window.addEventListener('popstate', this.handleRoute.bind(this));
    this.handleRoute();
  }
  
  push(path) {
    history.pushState(null, null, path);
    this.handleRoute();
  }
  
  handleRoute() {
    const path = location.pathname;
    const route = this.routes[path] || this.routes['/404'];
    route();
  }
}
```

# 3. 결과

결과적으로는 **만족스러웠다!** 

모든 기능을 구현했고, 코드도 나름 깔끔하게 정리했다고 생각한다.

특히 이번 챌린지를 통해 배운 점들:

## 3-1 프레임워크의 소중함

평소에 `React`나 `Vue`를 쓸 때는 당연하게 여겼던 기능들을 직접 구현해보니 프레임워크가 얼마나 많은 일을 대신해주는지 깨달았다.

- 컴포넌트 시스템
- 상태 관리
- 라이프사이클 관리
- 이벤트 바인딩
- 라우팅

이런 기본적인 것들을 하나하나 구현하는 것만으로도 상당한 시간이 걸렸다.

## 3-2 바닐라 JS의 재발견

반면에 순수 자바스크립트만으로도 충분히 복잡한 애플리케이션을 만들 수 있다는 것을 확인했다.

특히 최신 브라우저에서 제공하는 API들(`Web Components`, `Fetch`, `History API` 등)을 활용하면 프레임워크 없이도 모던한 웹 앱을 만들 수 있다.

## 3-3 성능에 대한 이해

프레임워크 없이 직접 DOM을 조작하면서 성능 최적화에 대해 더 깊이 생각하게 되었다.

- 불필요한 리렌더링 방지
- 이벤트 위임 활용
- 메모리 누수 방지

이런 부분들을 직접 신경 써야 하니까 더 주의 깊게 코드를 작성하게 되었다.

# 4. 마무리

이번 Dev-Matching을 통해 **기본기의 중요성**을 다시 한번 깨달았다.

평소에는 프레임워크에 의존해서 개발하다가, 순수 자바스크립트만으로 개발해보니 부족한 부분들이 많이 보였다.

앞으로는 프레임워크를 사용하더라도 내부 동작 원리를 더 깊이 이해하고 사용해야겠다는 생각이 든다.

결과는 며칠 뒤에 나온다고 하니, 결과와 상관없이 좋은 경험이었다!

> 결과적으로는... 합격했다! 🎉