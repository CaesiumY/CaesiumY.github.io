---
name: polish-file
argument-hint: <파일경로> [--threshold=9.5] [--resume] [--report-only]
description: 마크다운 파일 전체의 문장 품질을 분석하고 점수별 개선을 제안하는 스킬. 번역 파일이면 원본 URL에서 영어 원문을 가져와 의미 보존까지 검증합니다. "파일 전체 다듬기", "글 품질 점검", "문장별 분석", "번역 품질 검사", "polish file", "파일 리뷰" 등의 요청에 사용하세요. 개별 문장이 아닌 파일 전체를 대상으로 할 때 /polish 대신 이 스킬을 사용합니다.
---

# /polish-file - 파일 전체 다듬기

마크다운 파일의 문장을 분석하고, 기준 점수 미만 문장을 순차적으로 개선합니다. 번역 파일이면 원문도 함께 확인합니다.

Codex에서는 `.agents/agents/polish-agent.md`의 역할 프롬프트를 참고해 직접 분석합니다. 사용자가 명시적으로 하위 에이전트나 병렬 작업을 요청한 경우에만 Codex sub-agent를 사용합니다.

## 참조 파일

- polish 역할 프롬프트: `.agents/agents/polish-agent.md`
- 번역투 패턴: `.agents/skills/translate-writer/references/translation-patterns.md`
- 리포트 스키마: `.agents/skills/polish-file/references/report-schema.md`
- 출력 템플릿: `.agents/skills/polish-file/references/output-templates.md`
- 옵션 템플릿: `.agents/skills/polish/references/ask-user-templates.md`
- 리포트 저장 위치: `.agents/polish-reports/`

## 옵션

| 옵션 | 설명 | 기본값 |
| --- | --- | --- |
| `--threshold=X.X` | 기준 점수, 미만 문장만 개선 대상 | 9.5 |
| `--resume` | 이전 분석 리포트에서 이어서 진행 | false |
| `--report-only` | JSON 리포트만 생성하고 개선하지 않음 | false |

## 실행 단계

### Step 0: 원본 감지

다음 조건 중 하나라도 해당하면 번역 파일로 봅니다.

- 파일 경로에 `translation/` 포함
- frontmatter에 `tags: ["translation"]` 포함

번역 파일이면 본문 초반에서 원본 URL을 찾습니다.

```text
\[([^\]]+)\]\((https?://[^)]+)\).*번역
```

원본 URL이 있으면 웹 조회로 전체 본문을 마크다운 형식으로 추출합니다. 접근에 실패하면 원문 없이 일반 문장 분석으로 진행합니다.

### Step 1: 문장 추출

1. 대상 파일을 읽습니다.
2. frontmatter와 코드 블록은 제외합니다.
3. 본문 문장을 분리하고 각 문장의 라인 번호를 기록합니다.
4. 번역 파일이면 섹션 헤더, 순서, 고유명사, 숫자, 코드 키워드로 대응 원문을 추정합니다.

### Step 2: 문장별 분석

각 문장에 대해 `.agents/agents/polish-agent.md` 기준으로 점수, 발견 패턴, 개선 옵션, 원문 의미 보존 여부를 산정합니다.

결과는 다음 구조의 JSON 리포트로 정리합니다.

```json
{
  "file": "contents/blog/example/index.md",
  "threshold": 9.5,
  "average_score": 9.2,
  "sentences": [
    {
      "line": 42,
      "original": "문장",
      "source": "source sentence if available",
      "score": 8.7,
      "patterns_found": ["#1"],
      "status": "pending",
      "options": []
    }
  ]
}
```

### Step 3: 리포트 저장

리포트는 `.agents/polish-reports/[slug]-[timestamp].json`에 저장합니다. `--report-only`가 있으면 여기서 종료합니다.

### Step 4: 사용자 확인

전체 문장 수, 평균 점수, 기준 미만 문장 수를 보여주고 지금 다듬을지, 리포트만 둘지, 취소할지 확인합니다.

### Step 5: 순차 개선

기준 점수 미만 문장에 대해 `/polish` 스킬 흐름을 적용합니다.

1. 진행률과 라인 번호를 표시합니다.
2. 원문이 있으면 함께 보여줍니다.
3. 3-4개 개선 옵션과 현재 유지 옵션을 제시합니다.
4. 사용자가 선택한 옵션을 파일에 반영합니다.
5. 리포트의 `status`와 선택 결과를 갱신합니다.

## 완료 기준

- 코드 블록과 frontmatter는 문장 분석/수정 대상에서 제외합니다.
- 개선 옵션은 원문 의미를 보존해야 합니다.
- 리포트는 학습과 추적을 위해 보존합니다.
