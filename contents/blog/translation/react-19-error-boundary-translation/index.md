---
title: "React 19에서 달라진 에러 바운더리 동작"
description: "React 19에서 에러 바운더리 동작이 개선되었습니다. 첫 번째 에러 발생 시 렌더링을 즉시 중단해 중복 로그를 줄이고 리소스 효율성을 높입니다."
pubDatetime: 2025-12-31T17:00:00Z
featured: false
draft: false
tags: ["translation", "react", "react-19", "error-boundary", "error-handling"]
---

> 이 문서는 [React 19 Error Boundary Behaves Differently](https://andrei-calazans.com/posts/react-19-error-boundary-changed/)의 한글 번역입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 변경사항

- **첫 에러 발생 시 렌더링 즉시 중단**: 형제 컴포넌트 렌더링 방지
- **React 18**: 모든 형제 컴포넌트 렌더링을 시도하고, 각 에러마다 `componentDidCatch`가 호출됨
- **React 19**: 첫 번째 에러 후 즉시 중단되어 불필요한 렌더링 방지

### 실무 영향

- 중복 에러 로그 방지 로직을 제거할 수 있음
- 리소스 낭비 방지 (에러 발생 시 형제 컴포넌트의 불필요한 렌더링 중단)

</details>

---

**원문 작성일**: 2025년 11월 6일

**작성자**: Andrei Calazans

최근 React Native 앱을 React 19로 업그레이드하면서 에러 바운더리 동작이 달라져서 흥미로웠습니다.

[React 19 블로그 포스트](https://it.react.dev/blog/2024/12/05/react-19#error-handling)를 보면 `componentDidCatch`의 중복 에러 로그가 제거되어 에러 처리가 개선되었습니다. 이제 React는 에러를 한 번만 던집니다.

하지만 이것이 전부가 아닙니다. 예제를 보겠습니다:

```jsx
import React from "react";

function Throws({ id }) {
  console.log("rendered throw ", id);
  throw new Error("Something went wrong " + id);
  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="App">
      <h1>Test the error boundary</h1>
      <ErrorBoundary fallback={<p>opps yo</p>}>
        <h1>Hello world</h1>
        <Throws id="one" />
        <Throws id="two" />
      </ErrorBoundary>
    </div>
  );
}
```

## 렌더링 동작 비교

콘솔에 "rendered throw one"과 "rendered throw two"가 모두 출력될까요?

React 18에서는 두 메시지가 모두 출력됩니다. 각 `Throws` 컴포넌트가 던진 에러에 대해 `componentDidCatch`가 두 번씩 호출됩니다.

**React 18 콘솔 출력:**

```
rendered throw  one

rendered throw  one

Error: Something went wrong one

Error: Something went wrong one

rendered throw  two

rendered throw  two

Error: Something went wrong two

Error: Something went wrong two
```

*흥미로운 점은 React가 `componentDidCatch` 호출 전에 에러가 발생한 컴포넌트를 두 번 렌더링한다는 것입니다. 복구 가능 여부를 테스트하는 듯합니다.*

하지만 React 19에서는 첫 번째 에러 발생 시 렌더링을 즉시 중단합니다. 따라서 "rendered throw one"만 출력되고 `componentDidCatch`가 호출됩니다.

**React 19 콘솔 출력:**

```
rendered throw  one

rendered throw  one

Error: Something went wrong one
```

매우 합리적인 변경입니다. 첫 번째 에러가 발생하면 에러 바운더리가 전체를 감싸고 있으므로, 형제 컴포넌트를 렌더링할 필요가 없습니다. 리소스 낭비도 없습니다.

## 결론

회사에서 중복 에러 로그 방지 로직이 있었는데, 이제 대부분 제거했습니다.

## 참고 자료

- [React 19 Error Boundary Behaves Differently - 원문](https://andrei-calazans.com/posts/react-19-error-boundary-changed/)
- [React 19 공식 블로그 - Error Handling](https://it.react.dev/blog/2024/12/05/react-19#error-handling)
