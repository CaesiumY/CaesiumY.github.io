---
name: polish
argument-hint: "[선택된 텍스트]"
description: 개별 문장을 분석하고 3-4개 개선 옵션을 점수와 함께 제시하는 문장 다듬기 스킬. 번역 파일이면 원본 영어 문장을 찾아 의미 보존 여부까지 검증합니다. "이 문장 다듬어줘", "자연스럽게 고쳐줘", "문장 개선", "polish this sentence", "번역투 수정" 등의 요청에 사용하세요. 파일 전체가 아닌 특정 문장 1-2개를 다듬을 때 /polish-file 대신 이 스킬을 사용합니다.
---

# /polish - 문장 다듬기

선택된 문장을 분석하고 개선 옵션을 제시합니다. 번역 파일이면 대응하는 원문을 함께 확인합니다.

Codex에서는 `.agents/agents/polish-agent.md`의 역할 프롬프트를 참고해 직접 분석합니다. 사용자가 명시적으로 하위 에이전트나 병렬 작업을 요청한 경우에만 Codex sub-agent를 사용합니다.

## 참조 파일

- polish 역할 프롬프트: `.agents/agents/polish-agent.md`
- 옵션 템플릿: `.agents/skills/polish/references/ask-user-templates.md`
- 번역투 패턴: `.agents/skills/translate-writer/references/translation-patterns.md`
- 번역 스타일 가이드: `.agents/skills/translate-writer/data/style-guide.md`

## 입력

대상 텍스트: `$ARGUMENTS`

## 실행 단계

### Step 0: 원본 감지

현재 작업 파일이 번역 파일인지 확인합니다.

- 경로에 `translation/` 포함
- frontmatter에 `tags: ["translation"]` 포함

번역 파일이면 본문 초반에서 원본 URL을 찾습니다.

```text
\[([^\]]+)\]\((https?://[^)]+)\).*번역
```

원본 URL이 있으면 웹 조회로 본문을 가져오고, 섹션 위치와 키워드로 대응 원문 문장을 추정합니다. 원문 접근에 실패하면 원문 없이 분석합니다.

### Step 1: 문장 분석

`.agents/agents/polish-agent.md` 기준으로 다음을 산정합니다.

- 현재 점수
- 발견된 번역투/가독성 패턴
- 원문 의미 보존 여부
- 3-4개 개선 옵션과 각 옵션의 점수

### Step 2: 옵션 제시

번역 파일이면 원문, 현재 번역, 원본 검증 결과를 먼저 보여줍니다.

각 옵션은 사용자가 바로 비교할 수 있도록 개선된 문장 전체를 포함해야 합니다.

### Step 3: 선택 적용

- 현재 유지: 변경하지 않고 종료합니다.
- 개선 옵션 선택: 적용 대상 파일을 확인한 뒤 원문 위치를 찾아 선택된 문장으로 교체합니다.

## 완료 기준

- 개선 옵션은 원문 의미를 보존해야 합니다.
- 선택된 문장만 바꾸고 주변 문맥은 불필요하게 수정하지 않습니다.
- 파일 경로가 불분명하면 적용 전 사용자에게 확인합니다.
