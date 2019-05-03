---
title: Git을 vscode를 통해 간편하게 사용해보자!
categories:
  - 멋쟁이 사자처럼
  - 개발환경
  - git
tags:
  - 멋쟁이 사자처럼
  - 개발환경
  - vscode
  - git
coverSize: partial
comments: true
date: 2019-04-07 16:39:49
thumbnailImage: git2.png
coverImage: git5.png
---

입문자가 git을 CLI로 사용하는 것은 어렵다. 명령어니 뭐니...
그러니 vscode를 통해 쉽고 간편하게 익혀보자!

<!-- excerpt -->

{%image git6.jpeg (codeburst.io/git-and-github-in-a-nutshell-b0a3cc06458f) %}

# git이란 무엇인가

아마 개발자들이라고 하면 `git` 에 대해 모르는 사람이 없을 것이지만,
입문자들은 금시초문인 것이 당연하다.

그런데 이 `git`을 관리해주는 [Github](https://github.com/) 가 마이크로소프트에 한화 약 **8조원**에 인수되었다고 한다면, `git`이 개발자들에게 있어서 어떤 의미인지 빠르게 짐작할 수 있을 것이라고 생각한다.

> 넥슨의 예상 매각 가격이 약 10~13조원이라고 하는데, 겨우 인터넷 서비스가 8조원...??

이러한 `git`은 이곳에 포스팅하기에도 벅찬, **매우 많은 기능을 제공**해준다. ~~페르마의 마지막 정리~~
버전 관리, 백업, 정적 페이지 호스팅 등등...
실제로 많은 IT회사에서도 **서류에 자신의 `github` 주소를 담으라고** 하기도 한다.
이렇듯이 앞으로 개발 업계에 몸을 담으려면 **빼놓을 수 없는 서비스**일 것이다.

# 그래서 어떻게 쓰죠??

{%image git3.png (dev.to/neshaz/git-commands-ultimate-tutorial-part-2-7ko)%}

`git` 을 쓰는 방법은 여러가지가 있다.

- 위의 사진처럼 CLI에 명령어를 입력해서 해도 되고,
- `git desktop` 같은 유틸을 사용해도 되고,
- 앞으로 설명하려는 `vscode` 같은 에디터에 탑재된 기능을 사용해도 된다.

> CLI란 `Command Line Interface`의 약자로, 보통 해커하면 생각나는 검은 화면에 하얀 글씨를 떠올리면 편하다.

**CLI로 `git`을 사용하는 방법은 [여기](https://gmlwjd9405.github.io/2017/10/27/how-to-collaborate-on-GitHub-1.html)에서 참고해보자!** 필자도 여기에서 기본적인 명령어들을 익혔다.

> `git`을 사용하려면 [Github](https://github.com/)아이디가 필요하다. 어서 가서 가입하자!

# vscode를 통해 git 사용해보기

---

## 소스 제어자를 설정하자

{%image center fancybox vscode_git1.png '필자의 블로그가 보이는 탐색기이다.'%}

탐색기는 제쳐두고, 왼쪽에 메뉴바에 주목해주시길 바란다.
위에서 3번째가 바로 `git`을 관리해주는, **소스 제어**라는 항목이다.
한 번 들어가보자.

{%image center fancybox vscode_git2.png '아무것도 안 하면 이렇게 뜬다.'%}

정말 아무것도 세팅하지 않았을 시에 이렇게 뜰 것이다.
자 이게 **소스 제어자를 `git`**으로 바꾸어줄 시간이다.

{%image center fancybox vscode_git3.png '지웠으니 괜찮겠지??'%}

`ctrl` + `shift` + ` 를 함께 누르거나, 위 메뉴에서 터미널을 선택해 **새 터미널**을 눌러보자. 사진과 같은 터미널이 뜰 것이다.

이곳에서 `cd` 명령어를 통해 원하는 디렉토리에 들어가면 되지만,
어차피 대부분 작업환경에서 `vscode`를 실행하였을 것이기 때문에 **그냥 바로 시작해도 된다.**

그럼 바로 시작해보자
**`git init`을 터미널에 입력하고 엔터를 쳐보자.**

> 시작할 때는 `git init`을 입력하자.
> init은 initialize, '시작하다, 초기 내용을 설정하다'라는 의미이다.

{%image center fancybox vscode_git4.png '이번엔 모자이크'%}

그럼 **소스 제어: GIT** 이라는 표시와 함께,
**변동이 있는 파일들**이 주르륵 나타날 것이다.

---

## git과 github를 연동해주자

### 계정 연동

여기서 또 커맨드로 해주어야 할 것이 있다.
바로 **git과 github를 연동**해주는 것! 그래야 github에서 나를 인식하기 때문이다.

```
git config --global user.name '유저 이름'
git config --global user.email '유저 이메일'
```

github 가입시 적어냈던 유저 이름과 이메일을 적어주면 된다.

> `git init` 과 달리 한 번만 적어주면 된다.

### 레포지토리 연동

{%image center fancybox github2.png '뭐가 많지만 일단 아래를 따라하자'%}

방금 만들어진 레포지토리로 들어가면, 사진처럼 바로 위에 `https://github.com/유저 이름/레포지토리 이름.git` 형식으로 된 링크가 뜰 것이다. **얼른 복사하자.**

참고로 위 사진의 명령어들은 `cli`를 사용할 때 쓰는 것들이다.
우리는 `vscode`를 이용할 것이므로 패스.

그럼 터미널에

```
git remote add origin '복사한 레포지토리 주소 붙여넣기'
```

를 입력하여 현재 작업 영역과 레포지토리를 연동해주자.

> 입력한 주소를 확인 하는 명령어는 `git remote -v`
> 잘못 입력했을 경우에는 `git remote remove origin`으로 삭제하고 다시 설정해주자

#### 전 저런 창이 안 떠요

{%image center fancybox github1.png '오픈 소스니깐 공개!'%}

아마 레포지토리 생성 시 Readme.md 생성을 체크해서 그랬을 것이다.
**걱정할 필요 없다.**

일단 그렇게 레포지토리를 만들었으면, 위와 같은 모습일 것이다.
사진처럼 _clone or download_ 를 클릭해서 **나오는 링크를 복사**하자. 레포지토리의 `git` 링크이다.

아까 터미널로 돌아와서,

```
git clone '복사한 레포지토리 주소'
```

를 입력하면 레포지토리 이름으로 된 폴더가 생길 것이다.
그곳에서 작업하면 된다.

**이렇게 작업할 시에는 위의 `git init` 부분은 생락해도 된다.**
왜냐하면 `clone`할 시 `init`도 같이 해주기 때문.
~~그래서 필자는 이 방법을 주로 쓴다~~

> 만약 vscode 터미널이 아닌 git bash로 했다면 붙여넣기 명령어는 `shift` + `insert`

자 이제 터미널로 할 일은 끝났다. **어려운 일은 이제 끝**이라고 생각하면 된다!!

---

## git add와 commit

{%image center fancybox vscode_git4.png '35는 변동된 파일의 숫자'%}

이 사진을 다시 보자.
**메시지 (커밋하려면 Ctrl + Enter 누르기)** 가 보일 것이다.

이곳에 github에 올리는 **메시지**를 적고, (test, docs, fix 등 간단 설명)
우측 상단에 **체크** 표시를 누르고 확인을 하면 **add와 commit 모두 동시**에 되는 것이다!!

소스 제어 탭의 다른 기능은 다음과 같다.

- 변경 내용을 클릭시 어떻게 바뀌었는지 **변동 내역 확인 가능**
- 되돌리기를 통해 변동 **이전으로 되돌리기 가능**
- **원하는 파일만** 스테이징(add) 가능
- 모든 파일 스테이징 가능
- 기타 등등

---

## git push를 통해 github에 올려보자

{%image center fancybox vscode_git5.png 'master옆의 아이콘은 다를 수도 있다.'%}

자 이제 마지막 스텝만 남았다.
`vscode` 좌측 하단을 보면 다음과 같은 바가 보일 것이다.

master는 현재 master 브랜치에 있다는 뜻이고,(관리자라고 생각하면 편하다.)
그 **옆에 있는 아이콘을 클릭**하면 된다.

척 봐도 **동기화**라고 쓰여있는 듯한 아이콘일 수도 있고,
처음이면 **클라우드에 업로드하는 모양**일 수도 있다.

위 사진은 4개 변동사항을 **내려받고**, 26개의 변동사항을 **올려야 한다**는 뜻이다.
내려받을 변동사항이 있으면 **바로바로 받자**. 안 받고 하면 **충돌**이 일어날 수도...

# 이미 만들어진 레포지토리를 가져오고 싶어요.

다른 로컬 환경에서(다른 컴퓨터나) `git`을 이어서 하고 싶을 때!

```
git clone '레포지토리 주소`
```

를 명령어로 입력해보자. 뭔가 주르륵 뜨면서 **자동으로 다운로드** 될 것이다.

이 명령어로 다운받았을 시, **위의 레포지토리 연동 부분은 건너뛰어도 된다!** 와 세상 편안!
~~그러니 오류 났을 시 그냥 clone으로 처음부터 다시 처리하자~~

---

일단 생각나는대로 git에 대한 간단 사용법을 적어보았다. 부족한 부분이 있으면 피드백을!!

### 같이보면 좋은 포스트

- [깃허브로 취업하기](https://sujinlee.me/professional-github/)
- [깃허브로 협업하기](https://gmlwjd9405.github.io/2017/10/27/how-to-collaborate-on-GitHub-1.html)
- [멋사 성균관대 박성우 분께서 제작하신 git 가이드라인](https://drive.google.com/file/d/10zcqBw4Nzz5SshiZVmt8ST41mwN86kdh/view)
- [생활코딩 지옥에서 온 Git(구)](https://opentutorials.org/course/2708)
- [생활코딩 Git4 cli로 협업](https://opentutorials.org/module/3967)
- [생활코딩 Git 소스트리 협업](https://opentutorials.org/module/3991)

~~포스트 쓰려니 너무 많아져서 생략...~~
