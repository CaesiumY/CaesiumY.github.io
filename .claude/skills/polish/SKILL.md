---
allowed-tools: [Read, Edit, AskUserQuestion, Grep, Task, WebFetch, Glob]
argument-hint: "[선택된 텍스트]"
description: 개별 문장을 분석하고 3-4개 개선 옵션을 점수와 함께 제시하는 문장 다듬기 스킬. 번역 파일이면 원본 영어 문장을 자동으로 찾아 의미 보존 여부까지 검증합니다. "이 문장 다듬어줘", "자연스럽게 고쳐줘", "문장 개선", "polish this sentence", "번역투 수정" 등의 요청에 사용하세요. 파일 전체가 아닌 특정 문장 1-2개를 다듬을 때 /polish-file 대신 이 스킬을 사용합니다.
---

# /polish - 문장 다듬기 스킬

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
패턴: \[([^\]]+)\]\((https?://[^)]+)\).*번역
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

**AskUserQuestion** 도구를 사용하여 옵션을 제시하세요.

번역 파일인 경우 먼저 원문 정보를 텍스트로 출력:
```
📝 **원문 (English)**
> [영어 원문 문장]

📝 **현재 번역**
> [현재 한국어 번역]

⚠️ **원본 검증**: [검증 결과 - 의미 누락/보존 등]
```

AskUserQuestion 옵션 포맷은 참조 파일을 따르세요:
@.claude/skills/polish/references/ask-user-templates.md

**중요**: 각 옵션의 description에 **개선된 문장 전체 텍스트**를 포함하여 사용자가 바로 비교할 수 있게 합니다.

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
- **전체 패턴 (28개)**: `.claude/skills/translate-writer/references/translation-patterns.md`
- **스타일 가이드**: `.claude/skills/translate-writer/data/style-guide.md`
