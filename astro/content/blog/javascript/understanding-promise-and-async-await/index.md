---
title: "[JS] \U0001F680병렬로 비동기 데이터 한 번에 받아오기"
description: >-
  > [썸네일
  메이커(링크)](https://velog.io/@oneook/%EC%8D%B8%EB%84%A4%EC%9D%BC-%EB%A9%94%EC%9D%B4%EC%BB%A4Thumbnail-Maker-Toy-Project)
pubDate: '2021-08-23'
category: javascript
draft: false
heroImage: ./promise_thumbnail.png
---

![article_thumbnail](./promise_thumbnail.png)

> [썸네일 메이커(링크)](https://velog.io/@oneook/%EC%8D%B8%EB%84%A4%EC%9D%BC-%EB%A9%94%EC%9D%B4%EC%BB%A4Thumbnail-Maker-Toy-Project)
> 잘 만들었으니 다들 가서 확인해보세요!

# 0. 암튼 기다려줘!

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

그랬다. `Promise` 없이 그저 `setTimeout`과 `async/await`를 혼합해 놓고선 `setTimeout`을 `await`를 통해 기다리라고 했던 것이다.

자바스크립트 최신 문법만을 배우는 뉴비들에게서 자주 나타나는 문제이다. `async/await`를 맹신한 나머지 `Promise`를 구시대의 유물로 취급하여 쓰지 않으려는 문제.

물론 최신 문법이 편한 건 맞지만, `async/await`는 길어지는 콜백 지옥, 메서드 체이닝을 피하기 위한 방법이지, `Promise`를 저 밑바닥으로 보내버리는 방법이 절대 아니다!

> 이제부터 `Promise`와 `async/await` 를 사용해 비동기 최적화를 해보자!

# 1. Promise는 아직 필요하고, await는 만능이 아니다.

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

`await`는 Promise의 `pending` 상태가 끝날 때까지 기다려주는 것이지, `setTimeout`의 일정 시간 이후에 `실행 컨텍스트`에 추가되고 실행되는 것을 기다려주는 것이 아니다.

> 이 부분은 따로 `실행 컨텍스트`를 공부하면 이해하게 될 것이다.

# 2. 병렬로 비동기 데이터를 한 번에 받아온다고?

원래 이해하기 위해서는 단계가 필요하다.

0. `setTimeout`으로 비동기처럼 꾸미기
1. 배열을 비동기로 가져오기
1. 배열의 아이템을 각각 순서대로 비동기로 가져와보기
1. 어라 안 되네?
1. `await`를 사용해서 다시 각각 순서대로 비동기로 가져와보기
1. 어라 배열 메서드들이 안 먹히네?
1. 기본 `for` 문을 사용하면 되는구나!
1. 순차적으로 불러오는 건 가능한데, 이러면 시간이 오래 걸려
1. 다른 방법이 없을까?

이러한 중간 과정 다 생략하고, 우리가 원하는 결과를 빠르게 보자.

## 배열의 아이템을 `Promise.all()`을 사용해 병렬로 한 번에 가져오기

백문이 불여일견이라고, 코드를 보면 이해가 쉽다.

```js
const getPromiseCrewList = () => {
  // 크루 리스트를 비동기로 반환하는 함수
  return new Promise(resolve => {
    // Promise를 반환해줘야 await 사용가능
    setTimeout(() => {
      const crewList = ['Spike', 'Ain', 'Jet', 'Faye', 'Edward']
      resolve(crewList) // crewList를 반환해준다.
    }, 2000)
  })
}

const processParallelPromise = name => {
  // 각각의 이름들에 대해 비동기로 동작하는 함수
  return new Promise(resolve => {
    setTimeout(() => {
      name.length > 3 ? resolve(true) : resolve(false)
    }, 1000)
  })
}

const startParallelPromise = async () => {
  // 비동기로 가져온 배열의 아이템을 각각 비동기 함수에 넘겨주는 함수
  console.time('Parallel')
  const crew = await getPromiseCrewList()
  // ["Spike", "Ain", "Jet", "Faye", "Edward"], 3초 뒤에 배열을 반환한다.
  const mappingPromiseArray = crew.map(c => processParallelPromise(c))
  // [Promise, Promise, Promise, Promise, Promise], 이처럼 Promise의 배열로 만들어준다.
  const makeParallelPromiseArray = Promise.all(mappingPromiseArray)
  // Promise {<pending>}, Promise의 배열이기에 Promise.all에게 넘겨주는 게 가능해진다.
  const isOverThree = await makeParallelPromiseArray
  // Promise.all() 덕분에 병렬로 불러오게 된다.

  console.log(isOverThree) // [true, false, false, true, true]
  console.timeEnd('Parallel') // about 3002ms
}

startParallelPromise()
```

만약 병렬로 안 불러왔다면, 초기 2000ms + 각각 1000ms \* 5가 되어 **7초**가 걸렸을 것이다.
하지만 병렬로 불러온 덕분에 초기 2000ms + 1000ms가 되어 **겨우 3초**만에 모든 데이터를 가져오는 게 가능!

## 코드 샌드박스로 직접 보기

<iframe src="https://codesandbox.io/embed/ecstatic-agnesi-d575o?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="ecstatic-agnesi-d575o"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

콘솔창을 보면 **3초만**에 모든 값을 가져온 것을 알 수 있다.

# 3. 같이 보기

위 코드를 보면서 이해하면 다행이지만, 그게 아니라면 아래의 참고 문서 읽어보길 권한다.

- [[Async function] async/await 비동기 처리](https://mygumi.tistory.com/328)
- [비동기 함수 - 프라미스에 친숙해질 수 있게 해주는 함수](https://developers.google.com/web/fundamentals/primers/async-functions)

> 비동기는 어느 자바스크립트 개발자에게나 어려운 과제이다. 낙담하지 말고 이론을 잘 살펴보면 길이 보일 것이다!
