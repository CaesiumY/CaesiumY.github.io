---
title: '[JS] 병렬로 비동기 데이터 한 번에 받아오기'
date: 2021-08-23 23:08:75
category: javascript
thumbnail: './images/21-08-23/promise_thumbnail.png'
draft: false
---

![article_thumbnail](./images/21-08-23/promise_thumbnail.png)

> [썸네일 메이커(링크)](https://velog.io/@oneook/%EC%8D%B8%EB%84%A4%EC%9D%BC-%EB%A9%94%EC%9D%B4%EC%BB%A4Thumbnail-Maker-Toy-Project)
> 잘 만들었으니 다들 가서 확인해보세요!

# 0. async / await 는 만능이 아니다

최근에 그런 질문을 봤었다.

`setTimeout`을 이용해 비동기처럼 환경을 구성해서 데이터를 받아와 처리하는 코드인데 이게 왜 안 돌아가냐고.

코드는 가져올 수 없고, 대충 원하는 결과는 이러했다.

```
1
2
3
Done!
```

위처럼 나오게 하고 싶은데

```
Done!
1
2
3
```

결과는 이랬다는 것이다.

비동기를 모르는 개발자나, Promise에 대해 깊이 생각해보지 않은 개발자였다면 _어라 이거 왜 이러지??_ 라고 생각했을 것이다.

그러나 나는 코드를 보자마자 문제점을 떠올렸다.

> 이거 `Promise` 가 없네

그랬다. `Promise` 없이 그저 `setTimeout`과 `async/await`를 혼합해 놓고선 `setTimeout`을 `await`를 통해 기다리려고 했던 것이다.

자바스크립트 최신 문법만을 배우는 뉴비들에게서 자주 나타나는 문제이다. `async/await`를 맹신한 나머지 `Promise`를 구시대의 유물로 취급하여 쓰지 않으려는 문제.

물론 최신 문법이 편한 건 맞지만, `async/await`는 길어지는 콜백 지옥, 메서드 체이닝을 피하기 위한 방법이지, `Promise`를 저 밑바닥으로 보내버리는 방법이 절대 아니다!

> 이제부터 `Promise`와 `async/await` 를 사용해 비동기 최적화를 해보자!

# 1. 병렬로 비동기 데이터를 한 번에 받아온다고?

`Promise`에는 여러 메서드들이 있다. 여러 비동기 중 가장 빨리 가져오는 것만 반환한다든지, 여러 개의 비동기를 병렬로 한 번에 가져온다든지 하는 등등...

그리고 우리는 후자를 살펴볼 것이다.

## Promise

[MDN Promise 문서](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise)

사실 문서를 읽는 게 정말 정말 좋은 선택이지만, **TL;DR**를 위해 간단히 요약하자면,

```js
return new Promise((resolve, reject) => {
  //성공하면
  resolve('반환 값')

  //실패하면
  reject('반환 값')
})
```

이렇게 Promise 구조를 익혀두면 된다.
주로 `setTimeout`을 안에서 사용해 시간이 지나면 `resolve`하게 하는 식으로 테스트를 하곤 한다.

## async / await

역시나 **TL;DR**를 위해서 간단히 하고 싶은 말만 하자면,

**`await`는 뭐든 연산이 끝날 때까지 기다려주는 만능 코드가 아니다!**

`await`는
