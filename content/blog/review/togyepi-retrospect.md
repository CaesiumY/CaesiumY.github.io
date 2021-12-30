---
title: 🔨토계피 리뉴얼 회고
date: 2021-10-06 14:10:78
category: review
thumbnail: './images/21-10-06/thumbnail.png'
draft: false
---

![thumbnail](./images/21-10-06/thumbnail.png)

# 결과부터 보여주기

결과 사진이랑 다 깃허브에 올려두었습니다.

[버전2 깃허브 링크](https://github.com/CaesiumY/Togyepi)

[버전2 배포 링크](https://caesiumy.github.io/Togyepi/)

# 토계피가 뭔가요?

학부생 시절 4학년 2학기때(2018년) 했던 프로젝트이자, **처음**으로 자바스크립트를 쓴 프로젝트였고, **첫** 프론트엔드 프로젝트였고, **첫** 협업이었고, **첫** 외주작품으로 했던 프로젝트입니다.

당시 생명과학과 사람과 만나 요구사항에 대해서 얘기도 해보고, 중간 점검도 해보았던 프로젝트라 기억에 크게 남습니다.

기능은 **토질 수치를 계산**해주는 보통 계산기입니다. 거기에 이제 특이한 추가 요구사항을 곁들인...!

그 당시 요구 사항이

1. 논문과 책을 드릴테니 여기 나와있는 필요한 공식들을 간단히 계산할 수 있는 계산기를 만들어주세요.
2. 현장에 나가서 찍은 사진마다 위치와 제목 등을 사진 위에 메모 하고 싶습니다.
   1. 위치는 위도와 경도로 해주셨으면 합니다.
3. 달력을 기반으로 해서 해야할 일을 작성할 수 있도록 하고 싶습니다.
4. 컴퓨터와 휴대폰 전부에서 사용할 수 있으면 좋겠어요.

대강 이랬던 걸로 기억합니다.

> 달력은 없어도 되지 않나요? 를 항상 여쭤봤던 거 같다... '기본 달력이 더 좋아요...' 하면서

## 당시 버전 1 보러가기

[버전1 깃허브 브랜치](https://github.com/CaesiumY/Togyepi/tree/v1)

[버전1 배포 링크](https://togyepi-csy9617.firebaseapp.com/#/)

# 리뉴얼은 왜 하시죠?

아무래도 처음으로 했던 프론트엔드다보니 내부 코드가 (나쁜쪽으로) 기가 막힙니다.
그래서인지 항상 마음 속으로 불편했는데... 어차피 `리액트`를 주로 사용하니 이참에 토계피를 리뉴얼하고 `Vue`는 작별 인사를 하기 위해 리뉴얼을 진행했습니다.

> 옛날 프로젝트를 다시 처음부터 만들어보는 것도 도움된다는 걸 어디서 본 탓도 있습니다.

# 리뉴얼하기

## 0. 사전 준비

최근 릴리즈된 `Vue3`를 사용해보려고 했으나, 토계피의 핵심 요소중 하나인 `Vuetify`가 `Vue3`를 지원하지 않아서 기존버전으로 사용하게 되었습니다.

그리고 **전역 저장소가 필요하지 않아서** `Vuex`도 빼고, 기타 라이브러리 없이 최대한 가볍게 만들고자 노력했습니다.

`PWA`의 경우에는, 버전1 당시엔 직접 뚝딱뚝딱해서 넣었는데, **요즘엔 처음부터 템플릿을 제공**하는 덕분에 쉽게 도입할 수 있었습니다.

> 나머지 디자인이나 로고 등은 그대로!

## 1. 헤더

먼저 개발할 대상은 역시 `헤더` 및 `메뉴`입니다. `앱 셸` 디자인이라 큰 무리는 없었고, `Vuetify`에서도 기본으로 제공하는 컴포넌트이기에 쉽게 만들어낼 수 있었습니다.

달라진 점이라면 기존 버전에는 `툴팁`이 있었지만, 이번엔 `툴팁`을 삭제하였습니다. 굳이 툴팁이 없어도 추가한 `아이콘`을 통해 충분히 이해할 수 있을 것이라고 생각하였습니다.

### 1-1 정보 모달

`헤더` 의 우측 상단에 붙은 아이콘 버튼을 클릭하면 정보 모달이 나옵니다. 이걸 통해서 각 `토질 수치 계산`에 어떤 것들이 필요한지 재료들을 볼 수 있습니다.

**이전 버전에서는 하드 코딩**으로 글을 적었다면, 이번 리뉴얼 버전에서는 **미리 정리해놓은 공식을 잘 정리**하여 보여주었습니다. 프론트엔드 프레임워크의 힘을 보여주는 구간입니다.

좀 더 분리하여 개별 컴포넌트로도 써먹을 수 있지만, **이미 `Vuetify`에서 제공하는 `모달` 컴포넌트와 다를 바가 없어져서** 유니크한 컴포넌트로 놔두었습니다.

> for문과 if문을 적절히 사용하여 중복을 없애고, 지속 가능성을 높였습니다.

## 2. 달력

사실 처음 개발때도 굳이 필요한 기능인가... 고민했던 기능이라 리뉴얼에선 뺄까 고민을 많이 했습니다.

그런데 이제 **`Vuetify`에서 기본으로 달력 UI컴포넌트를 제공**하는 것을 알게 되고, 빼지 않고 구현하기로 마음 먹었습니다.

달력을 붙이고, 모달을 통해 **CREATE**, 팝업을 통해 **READ** 와 **DELETE**를 구현하였습니다. `Vuetify` 달력만의 구성이 헷갈려서 다시 한 번 `Typescript`의 필요성을 실감하게 되었네요.

다음으로 컴포넌트를 분리하는데... `React`에서 했던 것처럼 **한 파일 내 여러 컴포넌트가 불가능**해져서 개별 파일로 나눌 수 밖에 없었습니다.

여기서 고민을 조금 했습니다.

_어차피 나눈 3개의 컴포넌트는 서로 의존도가 깊으니, 좀 길더라도 한 컴포넌트에 넣는 게 맞지 않을까?_

그래도 나눠서 나쁠 건 없으니 일단은 나누어두었습니다. 그랬더니 `이벤트버스`를 만들어야 하나 고려해볼 정도로 각 컴포넌트간의 통신이 여기저기 왔다갔다하다보니 혼선을 빚었는지, **이전에 하나의 컴포넌트일 때는 괜찮았던 부분들이 터지기 시작**했습니다.

다행히도 에러 분기 처리를 해줘서 막았지만, 막상 _'괜히 나눈 게 아닐까'_ 라는 생각만 더 커졌습니다.

> `React` 였다면 어떻게 분리했을까...?? 라는 생각이 머리를 지배한 순간

## 3. 캔버스

이쪽은 시작하기 전 이름을 고민했습니다.

_`Canvas`를 쓰니 캔버스라고 해야하나? 아니면 사진을 수정하는 거니 사진탭이라고 해야하나?_

결국 처음엔 사진을 쓰다가 마지막에 개발이 완료되고 캔버스로 다시 갈아탔습니다.

아무래도 평소에 잘 쓰지 않는 `canvas`이다보니 많이 고생했습니다.

## 3-1 사진을 불러와서 캔버스에 그리기

요구사항은

1. 사진을 불러와서 캔버스에 보여주고,
2. 그 위에 글자 메모를 적어 넣은 뒤,
3. 저장하는 것이었습니다.

그래서 먼저 사진을 불러와서 캔버스에 보여주는 게 우선이었습니다.

사진을 `input`태그로 불러와서 `canvas`에 보여주는 건 쉬웠습니다.

**하지만!**

**`canvas`는 일반 `img`태그처럼 꾸욱 눌러서, 저장하기 컨텍스트 메뉴가 나오게 하는 기능이 없습니다.**

그래서 캔버스 위의 그림을 다시 `img` 태그로 넘겨주어 유저에게 보여주어야 했습니다. 그래야 UX상 유저가 기대하는 기능을 보여줄 수가 있으니까요.

다행히도 `canvas`에는 `toDataURL` 메서드가 있었고, 이 메서드를 통해 캔버스 위에 그려진 그림을 `img`의 `src` 태그로 넘겨줄 수가 있었습니다.

### 첫번째 문제

이 과정에서 **캔버스의 크기가 원본 사진의 해상도를 바꾸어버리는** 경험을 했습니다. 캔버스의 크기가 작으면, 원본 사진의 크기가 어떻게 되든 스케일을 줄여버리는 것이 원인이었습니다.

**그래서 저는 캔버스를 없애기로 했습니다.**

아예 없애는 것이 아니라, 화면에서 보이지 않게 하기로 한 것입니다.

사진이 들어오면, 사진의 크기에 맞게 캔버스의 크기를 지정합니다. 그러면 자연스럽게 캔버스가 유저의 화면을 벗어나게 될테고, 반응형 디자인이 깨지게 됩니다. 어차피 화면에 보여줘야 하는 것은 결국 `img` 태그뿐이기 때문에 **`canvas` 태그를 숨겼습니다.**

> 이러면 아무리 캔버스가 커도 화면에 보이지 않기 때문에 유저는 알아채지 못합니다.

### 두번째 문제

그런데 간헐적으로 **오류**가 났습니다. 유저가 불러들인 사진을 `img`의 `src`로 넣는 부분에서 계속 전달 오류가 나서 이미지를 보여주지 못했습니다.
여러 실험 끝에 알게 된 결과는, **원본 사진의 크기가 커지면 `dataURL`로 파싱하는 과정이 길어져 제때에 `img` 태그의 `src`로 넘겨주지 못하게 되는 것**이었습니다.

여기서 여러 방법을 고민해보았습니다.

1. 어차피 가끔 발생하니 내버려둔다 -> 솔직히 혹했지만... 신은 디테일함에 깃든다고, 그냥 넘어갈 수 없는 문제였습니다.

2. `setTimeout`이나 `sleep`으로 대기 시간을 만든다 -> 각각의 사진마다 걸리는 시간이 다르고, 로딩 시간을 추가하는 것은 UX적으로 치명타라고 생각하여 기각하였습니다.

3. 될 진 모르겠으나 `Promise`를 사용해본다.

네. **3번 방법을 이용**하여 데이터가 파싱할 때까지 기다리고, 파싱이 완료되면 `img` 태그로 넘겨주도록 했습니다.

그랬더니 신기하게도 문제가 해결되었습니다!

> Promise에 또다시 감탄하고 갑니다.

### 캔버스 폼

사진을 보여주고 저장하는 것까지 끝마쳤으니 이제 메모를 구현할 차례입니다.

다행히도 버전1에서 했던 방법이 아직 유효하니 그대로 가져왔습니다.
불행하게도 완벽하지는 못했지요.

그래서 고친 부분은

1. 사진의 크기에 따라 **폰트 크기**를 정합니다. 이게 안 되면 해상도가 큰 사진에는 글자가 개미만해집니다.

2. **글자의 뒷 배경**을 동적으로 만들어줍니다. 다행히 `canvas`에 `measureText`라는 좋은 메서드가 있어 활용하였습니다. 이걸 활용하면 글자가 차지하는 너비를 알 수 있습니다.

3. 각 파트마다 줄 바꿈도 조금 바꾸었습니다. 동적으로 바꾸었다고 생각하시면 됩니다.

> 폼 부분도 컴포넌트 분리가 조금 걱정되었으나, 폼은 특수한 경우라고 생각하고 하나의 컴포넌트로 만들었습니다.

## 3. 계산기

계산기가 가장 어려울 것이라고 생각해서 마지막으로 미뤄두었습니다.
버전1에서는 그랬거든요.

**하지만...**

처음 시작할 때 공을 들인 공식이 완성도가 높았는지 **정말 쉽게 구현하고 말았습니다.**

이전 버전에서 구현하지 못했던

1. `placeholder를` 동적으로 설정하기
2. `hint` 동적으로 설정하기
3. 각 공식들의 함수 동적 설정
4. 어쩌구저쩌구 동적으로

등등... 동적으로 설정하는 건 전부 손쉽게 구현이 가능했습니다.

`spread operator`의 도움도 컸네요.

다만 여기서도 컴포넌트를 분리하고 나니 `자식 - 부모 - 자식` 같은 **컴포넌트 통신**이 이루어져서 또다시 고민에 빠졌습니다.

결국 `ref`를 사용하여 해결하긴 했지만 찝찝한 느낌은 가시지 않았습니다. 스택 오버플로우에서는 이렇게 해도 괜찮다고 하긴 했지만...

> 과연 부모 컴포넌트가 자식 컴포넌트의 함수를 호출하도록 하는 게 맞는 일일까...??

갈수록 컴포넌트 간의 의존도가 높아지는 것 같지만,
`Vuex`를 쓰지 않는 지금으로썬 최선이니 어쩔 수 없이 이대로 유지하도록 했습니다.

### 추가 정보 Expansion

위에서 언급한 컴포넌트들의 재사용성과 지속가능성이 맘에 걸렸는지, **이번 컴포넌트는 재사용성과 지속가능성을 최대한 유지**하여 만들게 되었습니다.

폼처럼 유니크한 것을 요구하는 것도 아니고, 어디에나 붙여쓸 수 있을 것 같은 보편적인 컴포넌트라 가능했던 것 같습니다.

> 만들어놓고 괜히 혼자 뿌-듯

# 마무리

![lighthouse_result](https://raw.githubusercontent.com/CaesiumY/Togyepi/master/screenshots/lighthouse_result.png)

끝으로 `Lighthouse`를 통해 성능 테스트를 해보니 꽤나 높게 나와서 만족했습니다.
접근성에서 점수가 조금 떨어지는 건... 아쉽게도 토계피의 테마 색이 문제라 수정할 수 없었습니다.

마찬가지로 퍼포먼스는 웹 폰트때문에...

`Vue`로 하는 프로젝트는 한동안 이게 마지막이 될 것 같습니다. 앞으로는 `react`에 집중하려고 합니다. 특히 `Next`와 같은 `SSR` 프레임워크가 떠오르고 있다길래 거기에도요.

`우리 형 변환기`에도 `Vue`가 쓰였는데, 사실상 기능은 `Vanilla JS`로도 충분합니다. 나중에 리뉴얼 할 기회가 있다면 바닐라로 해봐야 싶겠네요.

별 상관은 없을 수도 있지만, 컴포넌트들의 이름이 전부 **C**로 시작하다보니 (`Calculator-`, `Canvas-`, `Calendar-`) 헷갈릴 때가 있습니다...

# 다시 보여주기

[버전2 깃허브 링크](https://github.com/CaesiumY/Togyepi)

[버전2 배포 링크](https://caesiumy.github.io/Togyepi/)