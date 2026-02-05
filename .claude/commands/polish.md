---
allowed-tools: [Read, Edit, AskUserQuestion, Grep, Task, WebFetch, Glob]
argument-hint: "[선택된 텍스트]"
description: 선택된 문장의 개선 옵션을 점수와 함께 제안 (번역 원본 자동 참조)
---

# /polish - 문장 다듬기 커맨드

선택된 문장을 분석하고 개선된 옵션들을 점수와 함께 제시합니다.
**번역 파일인 경우** 원본 글에서 대응하는 문장을 찾아 함께 분석합니다.

## 입력

**대상 텍스트**: $ARGUMENTS

---

## 실행 단계

### Step 0: 원본 감지 및 추출 (번역 파일인 경우)

번역 파일 여부를 확인하고 원본을 가져옵니다.

#### 0-1. 현재 컨텍스트에서 파일 경로 확인

사용자가 작업 중인 파일이 번역 파일인지 확인:
- 경로에 `translation/` 포함 여부
- frontmatter에 `tags: ["translation"]` 포함 여부

#### 0-2. 원본 URL 추출

번역 파일의 본문 시작 부분에서 원본 URL 패턴을 찾습니다:

```
> 이 문서는 ... ["제목"](URL)의 한글 번역입니다.
```

Grep으로 패턴 검색:
```
패턴: \[.*\]\(https?://[^)]+\).*번역
```

#### 0-3. 원본 콘텐츠 가져오기

WebFetch 도구로 원본 URL의 내용을 가져옵니다:

```
WebFetch(url=원본URL, prompt="전체 본문 텍스트를 마크다운 형식으로 추출해주세요")
```

#### 0-4. 대응하는 원문 문장 찾기

번역문의 위치(문단, 순서)를 기반으로 원본에서 대응하는 문장을 찾습니다:
- 같은 섹션 헤더 아래의 유사 위치
- 키워드 매칭 (고유명사, 숫자, 코드 등)
- 문장 구조 유사성

### Step 1: polish-agent 호출

Task 도구로 **polish-agent** 에이전트를 호출하여 분석 수행:

**원본이 있는 경우:**
```
문장: "$ARGUMENTS"
원본: "[Step 0에서 찾은 영어 원문]"
모드: "interactive"
```

**원본이 없는 경우:**
```
문장: "$ARGUMENTS"
모드: "interactive"
```

에이전트가 반환하는 정보:
- 현재 점수
- 원본 검증 결과 (원본이 있는 경우)
- 발견된 패턴
- 3-4개 개선 옵션 (점수, 문장, 개선 내용)

### Step 2: 사용자에게 옵션 제시

**AskUserQuestion** 도구를 사용하여 원문과 함께 옵션을 제시하세요.

#### 원본이 있는 경우 (번역 파일)

먼저 원문 정보를 텍스트로 출력한 후 AskUserQuestion 호출:

```
📝 **원문 (English)**
> [영어 원문 문장]

📝 **현재 번역**
> [현재 한국어 번역]

⚠️ **원본 검증**: [검증 결과 - 의미 누락/보존 등]
```

그 다음 AskUserQuestion 호출:

```json
{
  "questions": [{
    "question": "어떤 옵션으로 수정할까요?",
    "header": "문장 선택",
    "multiSelect": false,
    "options": [
      {
        "label": "A (10.0점)",
        "description": "개선된 문장 전체 텍스트 | 수정: #1, #10 | 원본 의미 ✅"
      },
      {
        "label": "B (9.8점)",
        "description": "개선된 문장 전체 텍스트 | 수정: #1 | 원본 의미 ✅"
      },
      {
        "label": "C (9.5점)",
        "description": "개선된 문장 전체 텍스트 | 수정: 간결화 | 원본 의미 ✅"
      },
      {
        "label": "현재 유지 (X.X점)",
        "description": "원본 문장 그대로 유지"
      }
    ]
  }]
}
```

**중요**: 각 옵션의 description에 **개선된 문장 전체 텍스트**를 포함하여 사용자가 바로 비교할 수 있게 합니다.

#### 원본이 없는 경우

```json
{
  "questions": [{
    "question": "어떤 옵션으로 수정할까요?",
    "header": "문장 선택",
    "multiSelect": false,
    "options": [
      {
        "label": "A (10.0점)",
        "description": "개선된 문장 전체 텍스트 | 수정: #1, #10"
      },
      {
        "label": "B (9.8점)",
        "description": "개선된 문장 전체 텍스트 | 수정: #1"
      },
      {
        "label": "C (9.5점)",
        "description": "개선된 문장 전체 텍스트 | 수정: 간결화"
      },
      {
        "label": "현재 유지 (X.X점)",
        "description": "원본 문장 그대로 유지"
      }
    ]
  }]
}
```

### Step 3: 선택 적용

사용자가 옵션을 선택하면:

1. **"현재 유지"** 선택 시:
   - "원본을 유지합니다." 메시지 출력
   - 변경 없이 종료

2. **개선 옵션 선택 시**:
   - 사용자에게 적용 대상 파일 확인
   - Grep 도구로 원본 문장 위치 검색
   - Edit 도구로 선택된 옵션으로 교체
   - 변경 완료 메시지 출력

---

## 참조

- **핵심 로직**: `.claude/agents/polish-agent.md`
- **전체 패턴 (28개)**: `.claude/agents/translation-reviewer.md`
- **스타일 가이드**: `.claude/skills/translate-writer/data/style-guide.md`

---

## 예시 실행

### 예시 1: 번역 파일에서 실행 (원본 있음)

**입력**: "이 기능을 활용하면 성능을 향상시키는 것이 가능합니다"
**파일**: `contents/blog/translation/some-article/index.md`

**Step 0 결과**:
- 원본 URL 발견: `https://example.com/article`
- 대응 원문: "This feature can significantly improve performance"

**출력 (AskUserQuestion 전)**:
```
📝 **원문 (English)**
> This feature can significantly improve performance

📝 **현재 번역**
> 이 기능을 활용하면 성능을 향상시키는 것이 가능합니다

⚠️ **원본 검증**: "significantly" 누락됨
```

**옵션 제시 (AskUserQuestion)**:
- 옵션 A (10.0점): "이 기능을 쓰면 성능이 크게 좋아집니다" | #1, #10 수정 + significantly 복원 ✅
- 옵션 B (9.8점): "이 기능으로 성능을 크게 높일 수 있습니다" | #1 수정 + significantly 복원 ✅
- 옵션 C (9.5점): "이 기능을 사용하면 성능이 상당히 향상됩니다" | #10 수정 + significantly 복원 ✅
- 현재 유지 (8.8점): 원본 (의미 누락 유지)

---

### 예시 2: 일반 파일에서 실행 (원본 없음)

**입력**: "이 기능을 활용하면 성능을 향상시키는 것이 가능합니다"
**파일**: `contents/blog/general/my-post/index.md`

**polish-agent 분석 결과**:
- 패턴 #1 발견: "~것이 가능합니다" (-0.5)
- 패턴 #10 발견: "활용하면" (-0.2)
- 현재 점수: 9.3점

**옵션 제시 (AskUserQuestion)**:
- 옵션 A (10.0점): "이 기능을 쓰면 성능이 좋아집니다" | #1, #10 수정, 간결화
- 옵션 B (9.8점): "이 기능으로 성능을 높일 수 있습니다" | #1 수정
- 옵션 C (9.5점): "이 기능을 사용하면 성능 향상이 가능합니다" | #10만 수정
- 현재 유지 (9.3점): 원본
