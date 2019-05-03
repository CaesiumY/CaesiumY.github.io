---
title: vscode 추천 익스텐션(Extensions)과 세팅
categories:
  - 멋쟁이 사자처럼
  - 개발환경
  - vscode
tags:
  - 멋쟁이 사자처럼
  - 개발환경
  - vscode
coverSize: partial
comments: true
date: 2019-04-02 23:46:33
thumbnailImage: prettier.png
coverImage: extension_shot.png
---

vscode 확장 프로그램들을 설치하고 세팅하여, 활용을 극대화해보자!

<!-- excerpt -->

우리는 앞서 올린 게시글에서 개발환경을 설정하는 법을 배웠지만 그 개발 환경을 바로 쓰기에는 아직 이르다.
개발자는 게을러지기 위해 부지런해지는 법. 어서 쉽고 편한 확장 프로그램을 설치하러 떠나보자!!

> 필자가 설치한 A-Z 순서대로 서술할 것이다.

# Auto closing tag

{%image center 1.png 'auto closing tag' %}

오토 클로징 태그라고, 태그를 입력시 자동으로 닫는 태그를 생성해준다.

나중에 `emmet` 에 익숙해지면 잘 안 쓰이겠지만, 그래도 없으면 불편함이 체감되는 확장 프로그램.

> `alt` + `.` 을 함께 입력해보자.
> 닫는 태그가 빠진 곳을 수동으로 채워주는 단축키이다.

# Auto Rename tag

{%image center 2.png 'auto rename tag' %}

위의 확장 프로그램과 비슷한 역할이지만, 더 좋다고(?) 할 수 있는 확장 프로그램이다.

원래 여는 태그의 이름을 바꾸면 닫는 태그의 이름도 함께 바꿔주어야 하는 수고로움이 수반되지만,
이 확장 프로그램과 함께라면 **그런 건 없다.**
여는 태그의 이름이 바뀌면 닫는 태그의 이름도 함께 바꾸어준다. _어메이징!!_

# Bracket Pair Colorizer

{%image center colorizer.png 'Bracket Pair Colorizer' %}

((((())))) ???

수학에서 괄호가 엄청 많이 있어서 당황한 적이 있을 것이다. 도대체 어디서부터가 어디까지인지...

허나 이 익스텐션은 **짝이 되는 괄호끼리 색을 칠해**, 가독성을 높였다!
~~알록달록한 괄호들을 보는 맛도 있다 츄릅~~

# Debugger for Chrome

{%image center debugger_for_chrome.png 'Debugger for Chrome' %}

크롬 디버거를 `vscode`로 가져오는 익스텐션이다. 필자는 설치만 하고 사용할 일이 없었는데,
말하자면 길어지니, 필요하면 [여기](https://noooop.tistory.com/entry/VS-code%EC%97%90%EC%84%9C-Debugger-for-Chrome-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)에서 사용방법을 익혀보자.

# Git History

{%image center git_history.png 'Git History' %}

나중에 멋사에서 배우게 될 `git`을 좀 더 편하게 사용하게 해주는 익스텐션이다.
현재 작업환경에서 어떤 깃 활동을 했는지 자세히 보여주는 역할을 해준다.

> 1. `ctrl` + `shift` + `p` 또는 `f1` 을 눌러 사용자 팔레트를 연다.
> 2. `git log` 를 입력한다.
> 3. **Git: View History** 항목을 선택한 뒤 엔터!

# Hightlight Matching Tag

{%image center highlight_matching_tag.png 'Highlight Matching Tag' %}

앞서 설명한 괄호에 색 입혀서 구분하게 하는 기능을 태그로 비슷하게 가져왔다고 생각하면 된다.

자세히 말하자면, 현재 내가 **선택한 태그의 여는 태그 혹은 닫는 태그가 어디있는지 표시(하이라이트)해주는 기능**이라는 것이다.

> 더 궁금하다면 언제나 그렇듯이 확장 프로그램 설명란을 참조할 것!!

{%image center example.png '확장 프로그램을 소개하는 이런 페이지 말이다.' %}

# IntelliSense for CSS, SCSS class names in HTML, Slim and SCSS

{%image fancybox center intellisense.png 'IntelliSense for CSS, SCSS class names in HTML, Slim and SCSS' %}

html이 바늘이라면, css는 실!
그 실을 바늘에 자동으로 꿰어주는 없어서는 안 될 익스텐션이다.

간단하게 말하자면, css를 **자동완성**하도록 도와준다.

### HTML CSS Support

{%image center css_support.png 'HTML CSS Support' %}

위에서 언급한 인텔리센스와 이 서포트는 그냥 같은 역할이다.
위 익스텐션이 먹통이면 이걸 사용하는 정도...??

> 자동완성이 안 된다면 `ctrl` + `space`를 눌러보자.
> 어디서나 공통인 **자동완성 단축키**이다.

# Jinja

{%image center jinja.png 'Jinja' %}

~~이 익스텐션은 '진짜'다...~~

`django`로 개발하다보면, 필수적으로 **템플릿 태그**를 사용하게 된다.
그러나 이 템플릿 태그가 모두 같은 색이라면 구분하기 힘들 것이 안 봐도 비디오.

그렇다. 바로 그 템플릿 태그에 **색을 씌워주는** 확장 프로그램이다.

> 없어도 될 거 같은데?? 하지 말고 일단 설치하자.

# Korean Language Pack for Visual Studio Code

{%image center korean.png 'Korean Language Pack for Visual Studio Code' %}

한국인은 역시 한글을 써야한다.
영문과인 필자도 정말정말 애용하는 익스텐션.

`vscode`의 대부분을 **한글**로 사용할 수 있게 해주는 언어팩.

# Live Server

{%image center live_server.png 'Live Server' %}

자신이 만들고 있는 **페이지를 열어주고**, 라이브로 갱신시켜 보여주는 익스텐션.

`django` 개발 중에는 쓸 일이 드물겠지만, 그래도 `html` 과 `css` 만을 사용한 페이지를 만들 때는 유용하다.

# Live Share

{%image center live_share.png 'Live Share' %}

운영진들이 앞으로 쓸 일이 많아질 거 같은 익스텐션 1위...
물론 협업에 사용해도 매우 좋은 확장프로그램이다.

**실시간으로 코드를 공유**하여 프로그래밍을 돕는 방식이기에 디버깅, 협업 어디에도 어울린다.
AWS에 있는 Cloud9이나, 국내 서비스인 구름IDE와 비슷하다고 생각하면 되겠다.

사용 방법도 간단하다. 왼쪽 메뉴에 생기는 Live Share 메뉴를 클릭하고, 서버를 만든 뒤, 서버 링크를 복사하여 팀원을 초대하면 끝!

# Markdown All in One

{%image center markdown.png 'Markdown All in One' %}

**마크다운 문법**을 편하게 사용하도록 단축키를 추가해주는 확장 프로그램이다.

마크다운이 뭐냐구요...??
나중에 깃허브에 올릴 readme 또는 현재 필자가 쓰는 블로그 등에 쓰이는 문법.
어차피 언젠가는 익혀야하기 때문에 미리 설치해둡시다.

# Material Theme

{%image center material.png 'Material Theme' %}

기존의 `vscode` 테마를 탈피한 다른 테마를 설치할 수 있도록 하는 확장프로그램.
사용 방법은 위에 보이는 **색 테마 설정 버튼** 또는 사용자 팔레트를 열어서 `theme` 이라고 입력한 다음 테마를 바꾸어보자.

> 사용자 팔레트는 `f1` 또는 `ctrl` + `shift` + `p` 로 연다.

# Path Intellisense

{%image center path.png 'Path Intellisense' %}

모두들 언젠가 로컬에 있는 파일을 참조해야 할 경우가 생길 것이다.
바로 그때 **로컬 파일을** 빠르게, 정확하게 참조할 수 있도록 **자동완성**을 해주는 기능.

### npm Instellisense

{%image center npm.png 'npm Intellisense' %}

자매품이다. 위 확장 프로그램과 **함께** 설치하자.

# Power Mode

{%image center power.png 'Power Mode' %}

아는 사람만 알고, 쓰는 사람만 쓴다는 **바로 그 모드.**
코딩하는 손 맛이 생긴다고 하는데, 필자는 안 쓰는 쪽이다.

백문이 불여일견이다.
**확장 프로그램 상세페이지를 통해 예시를 보고, 그 예사롭지 않음에 놀라보자.**

# Prettier

{%image center prettier2.png 'Prettier' %}

쓰는 이 모두가 감탄을 금치 못하는 **바로 그 모드2.**
뒤죽박죽이던 코드를 치우는 모습은 그야말로 도라에몽이 에디터 안으로 강림한 듯한 편안함.

이것도 쓰는 사람만 쓰고, 안 쓰는 사람은 안 쓴다고 한다. 필자는 쓰는 쪽.

`django` 에 쓰이는 템플릿 태그에서 가끔 오류가 생기곤 하는데,
그럴 땐 `vscode` 를 **잠시 껏다가 켜보자.**

> 뭐든지 오류가 생기면 껏다 켜거나, 새로 시작해보자.

사용방법은 **사용자 팔레트**를 연 뒤, `Format Document`를 찾아 선택하면 완료!

헌데... 이 방법은 조금 번거롭다.
그래서 준비했다! **매 저장(`ctrl` + `s`)시마다 바로바로 코드가 정리**될 수 있도록 말이다.

{%alert info no-icon%}

1. `prettier` 를 설치한다
2. `vscode` 설정에 들어간다.
3. **사용자 설정은 모든 곳에 적용되는 곳**이고, 작업 영역 설정은 **지금 바로 이 작업 환경(디렉토리)에서만 적용**되는 설정이다. 취향껏 고르자.
4. 검색창에 `format on save` 를 입력해보자. 저장할 때마다 서식을 지정한다는 뜻이다.
   {%image center on_save.png %}

5. 위 그림과 같이 체크한다.
6. 잘 되었나 확인해보고 싶으면 뒤죽박죽인 자신의 코드에서 `ctrl` + `s`로 **저장**해보자.
7. 아니면 설정 검색창에서 `setting.json` 를 검색하고, 편집 버튼을 눌러 살펴보자.

{%endalert%}

> `settings.json`에서 `editor.formatOnSave`가 `true` 값인지 확인해봐도 된다.

# Python

{%image center python.png 'Python'%}

`django`의 기반이 되는 언어는 `python` 이다.
묻지도 따지지도 말고 **그냥 설치하자.**

# Settings Sync

{%image center sync.png 'Setting Sync'%}

> 이렇게 많은 확장 프로그램을 데스크탑에 설치해놓았는데,
> 아니! 노트북에도 일일히 해야 한다구!?

라는 걱정을 덜어주는 확장 프로그램.

깃허브의 `gist`를 활용하여, **현재 에디터 설정을 업로드 / 다운로드**를 가능케 하는 신비로운 물건.

대신 초기 설정이 너무 복잡하기 때문에 이곳에서 설명하는 것은 불가능하고,
**확장 프로그램의 '세부 정보' 에 가면 친절히 잘 설명되어 있으니 그곳을 참조하자.**

# vscode icons

{%image center vscode_icon.png 'vscode icons'%}

왼쪽 메뉴바를 보시라. 너무 단조로워서 파일 찾기가 힘들지는 않은가??
그런 당신을 위한 확장 프로그램!! `vscode icon` !!

이름처럼 `vscode`의 단조로운 **파일 아이콘을 보기 쉽게 바꾸어주는** 확장 프로그램이다.

~~예시는 세부정보를 보시고~~

**사용 방법**은 이미지에 나온 것처럼 `파일 아이콘 테마 설정`
또는 사용자 팔레트를 통해 `vscode icons`를 검색하여 활성화하면 된다.

# vscode-styled-components

{%image center components.png 'vscode-styled-components'%}

이것도 맨 위에서 설명했던 코드 강조와 비슷하다.
그저 스타일이라는 말이 붙었기에, **스타일을 표현하는 코드들에 색을 입혀주는** 확장 프로그램.

## 기타 팁

- `settings.json`에서 **빨간색의 밑줄**이 그어진다면, 윗줄 마지막에 콤마 `,` 를 제대로 넣어뒀는지 확인해보자.
- 설정에 들어가서 `mouse wheel zoom` 을 검색하고 나온 결과에 체크해보자. `ctrl` + `마우스 휠` 로 **에디터의 글자 크기를 조절**할 수가 있다.

### 나머지 쓰면 좋은 익스텐션

- Color Highlight
- Comment Anchors
- GitLens
- TODO Highlight
- django
