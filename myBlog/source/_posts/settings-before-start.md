---
title: 윈도우에서 django 개발환경 설치하기(vscode, git, python)
date: 2019-03-31 17:45:31
categories:
  - 멋쟁이 사자처럼
  - 개발환경
  - vscode
tags:
  - 멋쟁이 사자처럼
  - 개발환경
  - vscode
  - python
  - git
thumbnailImage: vscode.png
thumbnailImagePosition: right
coverImage: vscode2.png
coverSize: partial
comments: true
autoExerpt: true
---

멋쟁이 사자처럼 7기
django 개발을 위한 vscod, git, python을 설치해보자!

<!-- excerpt -->

멋쟁이 사자처럼 7기 커리큘럼이 `django`~~(어무해)~~로 바뀜과 동시에, 다루는 `IDE` 등 개발 환경 또한 바뀌게 되었다.

이번에 설치할 목록은 다음과 같다.

{%alert info no-icon%}

1. Visual Studio Code
2. git
3. python
4. django

{%endalert%}

<br>

# vscode 설치하기

{% image center vscode3.png 'vscode 로고'%}

**[vscode 설치 링크](https://code.visualstudio.com/)** 에 들어가서 윈도우OS 전용으로 다운 받은 뒤, 파일을 실행하면 빠른 설치가 가능하다.
언제나 많은 분들이 그러하듯이 계속 다음 다음만 쭈욱 눌러주면 된다.

...면 좋겠으나, 막 누르지는 말고 아래 사진이 나오면 **스탑!!**

<br>

{% image fancybox center vscode_install.png '체크 버튼이 나오는 항목까지만 진행하자' %}

바탕 화면 바로가기는 취향껏 체크해주고, 나머지는 모두 **체크**해주자. 그래야 마우스 컨텍스트 메뉴에서 빠르게 `vscode` 를 실행할 수 있다.

> [마우스 컨텍스트 메뉴](https://ko.wikipedia.org/wiki/%EC%BD%98%ED%85%8D%EC%8A%A4%ED%8A%B8_%EB%A9%94%EB%89%B4)란 마우스 우클릭 시 나오는 여러 메뉴들을 가리킴.

그 이후는 설치 버튼을 누르고 기다리기만 하면 **_미션 1 컴플리트!_**

# Git 설치하기

{% image center git1.png 'git 로고' %}

**[git 설치 링크](https://git-scm.com/)** 로 들어가서, 우측에 있는 최신 버전 다운로드를 누르면 자동으로 설치파일이 다운로드된다.

`vscode` 와 똑같이, 계속 다음만 눌러주다가 아래 이미지에서 **잠깐!!**

<br>

{% image fancybox center git2.png '여기만 바꿔주면 만사 오케이' %}

기존에는 `vim`으로 되어있을 것이지만, 우리는 앞으로 `vscode`를 사용할 것이기 때문에 그에 맞는 선택지를 골라주면 된다.

이 다음은 예상하시겠지만 쭉 다음만 눌러주면 설치가 완료된다.

### 컨텍스트 메뉴 확인하기

{% image fancybox center context_menu.png '이런 메뉴창이 나온다면 성공' %}

{%alert info no-icon%}

- Git GUI Here
- Git Bash Here
- Open with Code

{%endalert%}

바탕화면이나 어디 다른 디렉토리 내에서 마우스 우클릭을 해보자. 위 사진처럼 3가지 컨텍스트 메뉴가 뜨면 `vscode` 및 `git` 설치 성공이다. ~~라데온은 무시하자~~

실험 삼아 `git bash` 를 띄워 `git` 을 입력해보면 설치가 잘 된 것을 확인해볼 수 있을 것이다.

# 파이썬 설치하기

{% image center python1.png '파이썬 로고' %}

이전과 같이 **[파이썬 설치 링크](https://www.python.org/downloads/)** 로 들어가 가급적 최신 버전의 파이썬을 설치하자. 언제나 최신이 짱이다. ~~업데이트를 게을리하지 않는 개발자가 되자~~

우리 개발자들은 파이썬의 명성에 대해 익히 들어왔다. 커뮤니티가 크니, 못하는 게 없다느니... 그러므로 그런 자랑이야기는 스킵하고, 일단 써봐야 알 것 아닌가. 설치나 해보자.

<br>

{% image center fancybox python2.png "출처: liquidweb.com/kb/how-to-install-python-on-windows/ " %}

필자의 경우에는 이미 설치가 되어있어서... 다른 분 사진을 빌려왔다.

버전 상관 없이 처음 설치하시는 분들은 저런 창을 보게 될텐데,

<p>**{%hl_text danger%} 아래 Add python to PATH 를 무조건 체크해야한다. {%endhl_text%}**</p>

이미 겪어본 경험을 바탕으로 말하자면, 저 부분에서 체크를 까먹은 분들이 꽤 많다.
덕분에 적지 않은 분들이 파이썬 설치 확인 커맨드 입력시 `Command not found` 같은 통보(?)를 접하게 되는 불상사가...

설치가 모두 완료 되었으면

{% tabbed_codeblock 파이썬 설치확인 %}

<!-- tab bash -->

python --version

<!-- endtab -->

{% endtabbed_codeblock %}

`git bash`를 켜서 다음의 명령어를 친 뒤 엔터를 눌러보자.
현재 설치한 파이썬 버전이 나오면 올바르게 설치한 것이다.

> 안 나온다면 [여기](https://wxmin.tistory.com/121) 에서 34를 자기 버전에 맞게 바꾸어주면 된다.(ex. 37) 복잡해보이니 그냥 처음부터 PATH에 체크하자...

# django 설치하기

{% image center django1.png 'django 로고' %}

django를 설치하기 위해서는 먼저 해야할 일이 있다.

바로 **가상환경**을 켜는 것.
가상환경이 무엇인지는 다음에 시간이 나면 간단히 링크를 걸어줄 생각이다.
일단 따라해보자.

순서는 다음과 같다.

{%alert info no-icon%}

1. 개발할 작업 디렉토리를 생성한다. (새 폴더 만들기)
2. 마우스 우클릭을 통해 git bash를 연다. or vscode를 열어 터미널을 사용한다.(후자는 추후 설명)
3. `python -m venv 가상환경 이름` 을 입력하고 엔터!
4. 가상환경이 켠다.
5. django를 설치한다.
6. **앞으로도 django 개발시 꼭 가상환경을 켜고 시작한다.**

{%endalert%}

### 가상환경을 만들고, 실행해보자

```
python -m venv 가상환경 이름
```

같은 경우는 순서대로 이러한 뜻을 가지고 있다.
python 명령을 내리겠다. / make 만들겠다. / virtual environment, 가상환경을 / 이름은 이렇게!

주로 하는 가상환경이름은 `venv` or `myvenv` 이다.
필자는 `myvenv` 를 애용하니, 이걸 예시로 하자면
`python -m venv myvenv` 가 되겠다!!

자 가상환경을 만들었으니 이제 켜봐야하지 않겠는가.
`source 가상환경이름/Scripts/activate` 명령어를 치면 된다.

필자의 가상환경은 `myvenv` 라고 했으니

```
source myvenv/Scripts/activate
```

명령어를 입력하면 되는 것이다.

> `source` 는 `.` 으로 대체가 가능하다.
> 되도록 **tab** 키를 눌러 자동완성으로 해야 오타가 적을 것이다.
> 예시를 기준으로 m 치고 탭! s치고 탭! a치고 탭!

가상환경을 끄는 방법은 위처럼 복잡하지 않게

```
deactivate
```

만 입력하면 된다.
아니면 그냥 껏다 키면 자동으로 꺼진다. 하하.

## 가상환경을 켰으니 django를 설치하자.

가상환경을 켜면, 터미널에 `(가상환경이름)` 이렇게 뜰 것이다. 이러면 가상환경이 켜져 있는 것이다.

이제 여기에

```
pip install django
```

만 입력하면 끝이다.

~~django가 이렇게 쉽습니다.~~

django 설치를 확인하고 싶으시다면, 가상환경을 켜신 다음

```
pip list
```

이렇게 쳐보시면 django 가 리스트에 있을 것이다. 없으면... 설치 안 된 거죠 뭐.

여기까지 따라오셨다면, 모든 개발환경 세팅이 완료된 것입니다! 와우!

> pip를 업그레이드 해라 이런 텍스트가 뜰 때가 있는데, 그럼 나와있는 명령어를 그대로 입력하셔서 업그레이드하시면 됩니다!

## 끝내기 전에...

{%alert danger no-icon%}
**앞으로 개발하실 때 꼭!! 가상환경 키고 시작하셔야 합니다!!**
{%endalert%}
