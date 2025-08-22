---
title: "🎨브라우저 렌더링 과정 완전 분석"
author: Caesiumy
pubDatetime: 2021-06-09T09:00:00Z
modDatetime: 2021-06-09T09:00:00Z
slug: browser-rendering-process-analysis
featured: true
draft: false
tags: ["browser", "rendering", "dom", "cssom", "performance", "frontend"]
ogImage: "./browser-rendering-process/render-tree-construction.png"
description: "DOM 생성부터 화면 출력까지, 브라우저의 렌더링 파이프라인 심화 이해"
---

# 🖌렌더링?

<div align="center">
  <img src="./browser-rendering-process/drawing.gif" />
</div>

평소에 개발 관련이 아니더라도 *영상 렌더링*이라든지 `렌더링` 이라는 말을 들어본 적이 있을 것입니다.

`렌더링` 이란 쉽게 말해 **화면에 그림을 그리는 행위**입니다.

나아가서

`브라우저 렌더링`은 `HTML` 등을 이용해서 **브라우저에 그림을 그리는 행위**를 뜻하죠.

# 🎨렌더링 과정

모든 그림에는 밑그림을 그리고 색을 칠하고, 과정이 필요합니다.
~~위의 스폰지밥 짤처럼 원을 그리는 데에도 긴 과정이 필요해요~~

`브라우저 렌더링`도 그림을 그리는 것과 마찬가지입니다.

자, 준비물을 알아봅시다.

- HTML 파일
- CSS 파일

이것들을 짜내서 브라우저에 그림을 그려봅시다!

## 1. Object-model 생성

![dom](./browser-rendering-process/dom.png)

- `HTML`로 부터 `DOM(Document Object Model)`을 생성합니다. 대략 위 그림처럼 생겼어요.

![cssom](./browser-rendering-process/cssom-tree.png)

- `CSS`로 부터 `CSSOM(CSS Object Model)`을 생성합니다. 둘 다 트리 구조로 되어있군요.

- 이렇게 만들어진 각각의 `DOM`과 `CSSOM`은 서로 독립적인 데이터 구조를 갖고 있습니다.

- `DOM-tree`와 `CSSOM-tree`를 만들기 위해서라도 브라우저에 빨리 `HTML`과 `CSS`를 제공해야겠죠?

## 2. Render Tree 생성

자 이제 만들어 놓은 `DOM`과 `CSSOM`을 합쳐볼 차례입니다.

![render-tree](./browser-rendering-process/render-tree-construction.png)

- 위 그림과 같이 `DOM`과 `CSSOM`이 합쳐져 `Render Tree`를 형성합니다.

- 이러한 `렌더링 트리`에는 페이지를 렌더링하는 데 필요한 노드만 포함됩니다.
  - > 페이지에 표현되지 않는 노드들은 `렌더링 트리`에 **포함되지 않아요!** ex) 위 그림의 `display: none;`
  - > **하지만** `visibility: hidden;` 은 보이지는 않아도 공간을 차지하기 때문에 `렌더링 트리`에 **포함됩니다!**

## 3. 레이아웃 계산하기

`렌더링 트리`가 완성되었으니 이제 공간을 가늠해볼 차례입니다. 그림으로 치면 밑그림 정도죠.

![layout](./browser-rendering-process/layout-viewport.png)

위 그림에서처럼 `뷰포트` 내부에서 `렌더링 트리`가 가진 `노드`들의 위치를 계산합니다.

## 4. 페인팅(or 래스터화)

자 모든 것이 준비되었으니 이제 그림을 그릴 일만 남았네요!

<div align="center">
  <img src="./browser-rendering-process/painting.gif" />
</div>

- 시간이 가장 많이 걸리는 부분입니다. 이제 메인이니까요.

- 그릴 그림이 얼마나 복잡하느냐, 얼마나 많으냐에 따라 시간이 천차만별입니다.
  - `CSS`파일의 크기가 크거나, 색이 다채롭거나, 계산해야하는 그림자 같은 게 있으면 더 길어지겠죠?
  - 반대의 경우에는 시간이 더 빨라집니다!

# 🧹정리

자, 마지막으로 정리를 해봅시다.

1. 처음에 `HTML`, `CSS`를 받아와서 `DOM`, `CSSOM` 트리를 만들었습니다.

2. 이렇게 만들어진 `DOM`, `CSSOM`를 합쳐 `Render Tree`를 만들어냅니다.

3. `Render Tree`의 `노드`를 순회하며 `뷰포트` 내에 차지할 공간을 계산합니다.

4. 이제 `노드`들을 화면에 페인트 하면 됩니다!

간단해보이지만 `DOM`이나 `CSSOM`이 수정되기라도 하면 전부 처음부터 반복해야 합니다.

**어때요 참 쉽죠?**