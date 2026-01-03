---
title: "AI와 Playwright로 강의 슬라이드 자동 생성 시스템 구축하기"
description: "Claude API 다단계 에이전트로 강의 슬라이드를 자동 생성하는 시스템 구축 경험. Playwright 기반 HTML-PowerPoint 변환 엔진, 단위 변환 시스템, AI 파이프라인 설계 전략까지."
pubDatetime: 2026-01-03T00:00:00Z
tags: ["ai", "claude", "playwright", "pptx", "automation", "education", "tutorial"]
draft: true
---

## 목차

## 문제 정의: 왜 자동화가 필요한가?

나는 교육 기관에서 강의 자료를 만들면서 반복 노동의 늪에 빠졌다. 비전공자 대상 강의처럼 커리큘럼이 정해져 있는 경우, 매 차시마다 동일한 형식의 슬라이드를 수십 장씩 만들어야 했다.

AI 활용 교육 프로그램의 강의 자료 제작을 담당하게 되었다. 커리큘럼은 이미 정해져 있었다. 매주 학습자들이 배울 개념, 실습할 프로젝트, 예제 코드까지 모두 체계적으로 정리되어 있었다. 문제는 **이걸 어떻게 슬라이드로 옮기느냐**였다.

매번 PowerPoint를 열어 텍스트를 입력하고, 폰트를 맞추고, 정렬을 조정하는 과정은... 솔직히 지루했다 ~~(잠이 솔솔)~~. 슬라이드 하나를 만드는 데 10분이 걸린다면, 10장짜리 강의 자료는 100분이다. 여러 회차의 과정이면 계산하기도 싫다.

그래서 나는 생각했다.

> 이거 AI한테 시키면 되지 않을까?

## 첫 번째 시도: "프롬프트 하나면 되겠지"

처음에는 "프롬프트 하나면 되겠지" 생각했다. 나는 AI한테 "강의 자료 만들어줘"라고 던졌다.

결과는 기대에 못 미쳤다.

슬라이드 순서가 뒤죽박죽이었다. 중요한 내용이 빠졌다. 발표자 노트는 너무 짧았다.

> 한 번에 너무 많은 일을 시키면 안 되는구나.

이때 깨달았다. AI 에이전트에게도 **역할 분리**가 필요하다는 것을. 한 명한테 "기획, 디자인, 개발 다 해"라고 하면 망하는 것처럼 말이다.

## 다단계 파이프라인 설계: 역할을 나눠라

나는 전체 프로세스를 5단계로 나눴다.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Curriculum │ → │  Research   │ → │  Organizer  │ → │   Design    │ → │    PPTX     │
│    Agent    │    │    Agent    │    │    Agent    │    │    Skill    │    │    Skill    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     ↓                  ↓                  ↓                  ↓                  ↓
커리큘럼 추출       웹 리서치        교안 구조화         HTML 슬라이드      PowerPoint
                 (선택적)        + 사용자 확인
```

### 1단계: Curriculum Agent (데이터 추출)

커리큘럼 문서에서 해당 차시의 학습 목표, 주요 개념, 예제 코드를 뽑아낸다. 이 에이전트는 **읽기 전용**이다. 창의성을 발휘하지 않는다. 그냥 정보를 추출해서 구조화한다.

```javascript
// Curriculum Agent 프롬프트 예시
const curriculumPrompt = `
다음 커리큘럼에서 해당 차시의 정보를 추출해주세요:
- 학습 목표 (3-5개)
- 핵심 개념 (키워드)
- 실습 프로젝트 설명
- 예제 코드 (있다면)

JSON 형식으로 반환하세요.
`;
```

### 2단계: Research Agent (보강)

커리큘럼에 없는 내용은 웹에서 찾는다. 예를 들어 "변수란 무엇인가"를 설명할 때, 초보자가 이해하기 쉬운 비유가 필요하다면 검색한다.

나는 이 단계를 선택적으로 만들었다. 커리큘럼이 충분히 상세하면 스킵한다. 왜냐하면 웹 검색은 시간이 오래 걸리고, 출처 검증이 필요하기 때문이다.

### 3단계: Organizer Agent (구조화)

여기가 핵심이다. 추출한 정보를 **슬라이드 단위로 재구성**한다.

> AI한테 한 번에 너무 많은 일을 시키지 마라. 하나씩, 명확하게.

나는 이 에이전트한테 다음을 요구했다.

- 슬라이드 순서 정하기 (도입 → 개념 설명 → 예제 → 실습 → 정리)
- 각 슬라이드의 제목과 본문 작성
- 발표자 노트 작성 (강사가 말할 내용)
- 비전공자가 이해할 수 있는 수준으로 쉽게 설명

중요한 점: 이 단계 후 **사용자 확인**을 받는다. 나는 AI가 만든 교안 구조를 검토하고 수정한다. 여기서 확정하지 않으면 나중에 디자인까지 다시 해야 한다.

```javascript
// 검증 단계 예시
const validationErrors = [];

if (!slides || slides.length === 0) {
    validationErrors.push("슬라이드가 없습니다.");
}

slides.forEach((slide, index) => {
    if (!slide.title) {
        validationErrors.push(`슬라이드 ${index + 1}에 제목이 없습니다.`);
    }
    if (!slide.content) {
        validationErrors.push(`슬라이드 ${index + 1}에 본문이 없습니다.`);
    }
});

if (validationErrors.length > 0) {
    throw new Error(`검증 실패:\n${validationErrors.join('\n')}`);
}
```

검증 단계를 거치면 AI의 실수를 막을 수 있다. 필드 누락이나 슬라이드 개수 오류 같은 것 말이다.

### 4단계: Design Skill (HTML 생성)

교안 구조가 확정되면 HTML 슬라이드를 만든다. 나는 10개의 템플릿을 준비했다.

- 제목 슬라이드
- 학습 목표 슬라이드
- 개념 설명 슬라이드 (2열 레이아웃)
- 코드 예제 슬라이드
- 이미지 중심 슬라이드
- 리스트 슬라이드
- ...

AI는 각 슬라이드의 내용에 맞는 템플릿을 선택하고, 텍스트를 채운다. 출력은 HTML 파일이다.

### 5단계: PPTX Skill (PowerPoint 변환)

HTML을 PowerPoint로 변환한다. 이게 제일 어려웠다. 왜냐하면...

## 핵심 기술 1: HTML을 PowerPoint로 변환하기

HTML과 PowerPoint는 좌표 체계가 다르다.

- HTML: CSS pixels (상대 단위)
- PowerPoint: inches, points, EMU (절대 단위)

나는 Playwright를 사용해서 브라우저에서 HTML을 렌더링한 후, 각 요소의 위치를 픽셀 단위로 추출했다. 그리고 PowerPoint 좌표로 변환했다.

### 단위 변환 시스템

```javascript
// 브라우저 픽셀 → PowerPoint 단위 변환
const PT_PER_PX = 0.75;      // 1px = 0.75pt
const PX_PER_IN = 96;        // 96px = 1 inch
const EMU_PER_IN = 914400;   // 914,400 EMU = 1 inch

// 픽셀을 inch로 변환
const pxToInch = (px) => px / PX_PER_IN;

// 픽셀을 포인트로 변환
const pxToPt = (px) => px * PT_PER_PX;
```

왜 이렇게 복잡한가? PowerPoint는 레거시 시스템이다. OOXML 스펙을 보면 EMU(English Metric Unit)라는 단위를 사용한다. 1 inch = 914,400 EMU다. 하지만 PptxGenJS 라이브러리는 inch를 쓴다. 그래서 나는 중간에 변환 계층을 만들었다.

### Playwright로 정밀 위치 추출

```javascript
// Playwright로 브라우저 실행
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`);

// 모든 슬라이드 요소 추출
const elements = await page.$$eval('.slide-element', (els) => {
    return els.map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return {
            type: el.tagName.toLowerCase(),
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            fontSize: style.fontSize,
            color: style.color,
            textAlign: style.textAlign,
            content: el.textContent
        };
    });
});

await browser.close();
```

`getBoundingClientRect()`는 브라우저가 실제로 렌더링한 위치를 반환한다. CSS의 복잡한 계산(flexbox, grid, margin collapse 등)을 신경 쓸 필요가 없다. 브라우저가 다 해준다.

### 텍스트 렌더링 보정

문제가 하나 있었다. PowerPoint는 텍스트 박스의 너비를 **저추정**한다. 같은 폰트, 같은 크기로 설정해도 텍스트가 잘린다.

나는 실험 끝에 2% 확장이 필요하다는 걸 알았다.

```javascript
// 텍스트 박스 너비 보정
const adjustedWidth = rect.width * 1.02;  // 2% 확장

pptx.addText(content, {
    x: pxToInch(rect.left),
    y: pxToInch(rect.top),
    w: pxToInch(adjustedWidth),  // 보정된 너비
    h: pxToInch(rect.height),
    fontSize: pxToPt(parseFloat(style.fontSize)),
    color: style.color.replace('#', ''),
    align: style.textAlign
});
```

> 1%는 부족했고, 3%는 너무 넓었다. 이 수치는 폰트와 운영체제에 따라 달라질 수 있으니 주의해야 한다.

이 2%는 여러 번의 실험 끝에 찾아낸 값이다 (골디락스 존을 찾아라).

### 인라인 포매팅 처리

텍스트가 단순한 문자열이면 쉽다. 하지만 **bold**, *italic*, <u>underline</u>이 섞이면 복잡하다.

```html
<p>이것은 <b>굵은</b> 텍스트와 <i>기울임</i>이 섞인 문장입니다.</p>
```

PowerPoint는 rich text를 배열로 표현한다.

```javascript
// PptxGenJS rich text 형식
pptx.addText([
    { text: "이것은 ", options: {} },
    { text: "굵은", options: { bold: true } },
    { text: " 텍스트와 ", options: {} },
    { text: "기울임", options: { italic: true } },
    { text: "이 섞인 문장입니다.", options: {} }
], { ... });
```

나는 HTML 파싱 함수를 만들었다.

```javascript
// HTML 인라인 포매팅을 PowerPoint rich text로 변환
function parseInlineFormatting(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const result = [];

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            result.push({ text: node.textContent, options: {} });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const options = {};
            // bold/strong 태그 감지
            if (node.tagName === 'B' || node.tagName === 'STRONG') {
                options.bold = true;
            }
            // italic/em 태그 감지
            if (node.tagName === 'I' || node.tagName === 'EM') {
                options.italic = true;
            }
            // underline 태그 감지
            if (node.tagName === 'U') {
                options.underline = true;
            }

            // 재귀적으로 자식 노드 탐색
            node.childNodes.forEach(child => {
                traverse(child, options);
            });
        }
    }

    traverse(doc.body);
    return result;
}
```

중첩된 스타일(`<b><i>굵고 기울임</i></b>`)도 처리한다. 재귀적으로 탐색하면서 옵션을 병합한다.

## 핵심 기술 2: PPTX 파일 구조 이해하기

처음에는 PptxGenJS가 만든 파일이 제대로 작동하는지 확인할 방법이 없었다. PowerPoint로 열어보면 "파일이 손상되었습니다"라는 에러가 뜨기도 했다.

나는 PPTX 파일 내부를 뜯어봤다.

### PPTX = ZIP 파일

PPTX는 사실 ZIP 파일이다. 확장자를 `.zip`으로 바꾸고 압축을 풀면 XML 파일들이 나온다.

```
presentation.pptx (ZIP)
├── [Content_Types].xml
├── _rels/
├── ppt/
│   ├── presentation.xml
│   ├── slides/
│   │   ├── slide1.xml
│   │   ├── slide2.xml
│   │   └── ...
│   ├── slideLayouts/
│   └── ...
└── docProps/
```

각 슬라이드는 `ppt/slides/slide1.xml` 같은 XML 파일이다. 이 XML은 OOXML(Office Open XML) 스펙을 따른다.

### 디버깅 워크플로우

나는 Python 스크립트를 만들어서 PPTX를 언팩/팩하는 도구를 만들었다.

```bash
# 1. PPTX 해체
python unpack.py presentation.pptx output_dir

# 2. XML 편집/분석 (텍스트 에디터로)

# 3. 재조립
python pack.py output_dir presentation.pptx
```

이렇게 하면 문제가 생긴 슬라이드의 XML을 직접 볼 수 있다. 예를 들어, 텍스트 위치가 이상하면 `<a:off>` 태그의 `x`, `y` 값을 확인한다.

```xml
<!-- slide1.xml 일부 -->
<p:sp>
    <p:nvSpPr>
        <p:cNvPr id="2" name="TextBox 1"/>
    </p:nvSpPr>
    <p:spPr>
        <a:xfrm>
            <a:off x="914400" y="1828800"/>  <!-- EMU 단위 -->
            <a:ext cx="2743200" cy="914400"/>
        </a:xfrm>
    </p:spPr>
    <p:txBody>
        <a:p>
            <a:r>
                <a:t>안녕하세요</a:t>
            </a:r>
        </a:p>
    </p:txBody>
</p:sp>
```

> 도대체 1px이 몇 inch인지, 브라우저와 PowerPoint가 왜 다르게 계산하는지 이해할 수 없었다.

하지만 XML을 직접 보니 이해가 됐다. EMU 단위 때문이었다.

### 검증 도구

나는 LibreOffice를 headless 모드로 실행해서 PPTX를 PDF로 변환하는 스크립트를 만들었다. 변환이 성공하면 파일이 유효하다는 뜻이다.

```bash
libreoffice --headless --convert-to pdf presentation.pptx
```

변환이 실패하면 에러 로그를 보고 어느 슬라이드가 문제인지 찾는다.

## 핵심 기술 3: 에러 수집 패턴

초기에는 하나의 에러가 발생하면 바로 중단됐다. 슬라이드 30장 중 15번째에서 에러가 나면, 15번 슬라이드를 수정하고 다시 실행했다. 그런데 16번 슬라이드에서 또 에러가 났다.

나는 에러를 **수집**하는 방식으로 바꿨다.

```javascript
const conversionErrors = [];

slides.forEach((slide, index) => {
    try {
        convertSlide(slide);
    } catch (error) {
        conversionErrors.push({
            slideNumber: index + 1,
            error: error.message
        });
    }
});

// 모든 에러를 한 번에 보고
if (conversionErrors.length > 0) {
    console.error("변환 실패한 슬라이드:");
    conversionErrors.forEach(err => {
        console.error(`  슬라이드 ${err.slideNumber}: ${err.error}`);
    });
}
```

이렇게 하면 한 번 실행으로 모든 문제를 파악할 수 있다. 30장 중 5장이 문제면, 5개 에러를 동시에 보고 한 번에 수정한다.

## 장점과 한계

### 장점

나는 이 시스템 덕분에 강의 자료 제작 시간을 **80% 단축**했다. 전체 과정의 자료를 2주 만에 완성했다.

1. **일관성**: 모든 슬라이드가 동일한 디자인과 구조를 유지한다.
2. **재사용성**: 다른 교육 프로그램에도 적용할 수 있다. 커리큘럼만 바꾸면 된다.
3. **확장성**: 새로운 템플릿을 추가하기 쉽다.

### 한계

물론 완벽하지는 않다.

1. **CSS 그래디언트 미지원**: PowerPoint는 CSS 그래디언트를 지원하지 않는다. 나는 Sharp 라이브러리로 그래디언트를 PNG로 렌더링해서 이미지로 삽입했다.
2. **SVG 제한**: SVG를 PowerPoint shape로 변환하는 건 불가능하다. PNG로 변환해야 한다.
3. **폰트 의존성**: 시스템에 설치된 폰트만 사용 가능하다. 웹 폰트는 안 된다.

## 마무리

AI 에이전트로 강의 자료를 자동 생성하는 시스템을 만들면서 배운 점을 정리해봤다.

1. **역할 분리가 핵심이다**: AI한테 한 번에 너무 많은 일을 시키지 마라.
2. **사용자 확인 단계를 넣어라**: AI의 블랙박스 문제를 해결할 수 있다.
3. **단위 변환은 신중하게**: px, pt, inch, EMU... 각각의 관계를 명확히 이해해야 한다.
4. **에러를 수집하라**: 하나씩 고치지 말고 한 번에 파악하라.

나는 이 시스템을 더 발전시킬 계획이다. 다음에는 AI가 이미지 배치를 자동으로 최적화하는 기능을 추가하려고 한다. 그리고 발표자 노트를 음성으로 변환하는 TTS 통합도 고려 중이다.

교육 콘텐츠를 만드는 사람들에게 도움이 되길 바란다. 궁금한 점은 댓글로 남겨주세요.

## 참고 자료

- [PptxGenJS 공식 문서](https://gitbrent.github.io/PptxGenJS/)
- [Playwright 공식 문서](https://playwright.dev/)
- [OOXML 스펙 (Office Open XML)](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-pptx/)
- [EMU 단위 설명](https://startbigthinksmall.wordpress.com/2010/01/04/points-inches-and-emus-measuring-units-in-office-open-xml/)
