---
allowed-tools: [Read, Write, Bash, Glob, Task, AskUserQuestion, Edit, WebFetch]
argument-hint: <파일경로> [--threshold=9.5] [--resume]
description: 마크다운 파일 전체의 문장 품질을 분석하고 점수별 개선을 제안하는 스킬. 번역 파일이면 원본 URL에서 영어 원문을 가져와 의미 보존까지 검증합니다. "파일 전체 다듬기", "글 품질 점검", "문장별 분석", "번역 품질 검사", "polish file", "파일 리뷰" 등의 요청에 사용하세요. 개별 문장이 아닌 파일 전체를 대상으로 할 때 /polish 대신 이 스킬을 사용합니다.
---

# /polish-file - 파일 전체 다듬기 스킬

마크다운 파일의 모든 문장을 분석하고, 기준 점수 미만 문장들을 순차적으로 개선합니다.
**번역 파일인 경우** 원본 글을 가져와 각 문장의 원문과 함께 분석합니다.

---

## 아키텍처

```
/polish-file <파일>
  → Step 0: 원본 감지 (번역 파일이면 WebFetch로 영어 원문 가져오기)
  → Step 1: 파일 읽기 + 문장 추출 (frontmatter/코드블록 제외, 번역 시 원문 매칭)
  → Step 2: polish-agent batch 호출 (문장별 점수 + 패턴 분석)
  → Step 3: JSON 리포트 생성 (.claude/polish-reports/)
  → Step 4: 사용자 확인 ("N개 문장 다듬기 진행?")
  → Step 5: 순차 개선 (옵션 제시 → 선택 → Edit 적용)
```

---

## 입력

**대상 파일**: $ARGUMENTS

### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--threshold=X.X` | 기준 점수 (미만 문장만 개선 대상) | 9.5 |
| `--resume` | 이전 분석에서 이어서 진행 | false |
| `--report-only` | JSON 리포트만 생성 (개선 없음) | false |

---

## 실행 단계

### Step 0: 원본 감지 및 추출 (번역 파일인 경우)

#### 0-1. 번역 파일 여부 확인

다음 조건 중 하나라도 해당하면 번역 파일:
- 파일 경로에 `translation/` 포함
- frontmatter에 `tags: ["translation"]` 포함

#### 0-2. 원본 URL 추출

번역 파일의 본문 시작 부분에서 원본 URL 패턴을 찾습니다:

```
> 이 문서는 ... ["제목"](URL)의 한글 번역입니다.
```

정규식 패턴:
```
\[([^\]]+)\]\((https?://[^)]+)\).*번역
```

#### 0-3. 원본 콘텐츠 가져오기

WebFetch 도구로 원본 URL의 내용을 가져옵니다:

```
WebFetch(url=원본URL, prompt="전체 본문 텍스트를 마크다운 형식으로 추출해주세요. 각 문단과 문장을 명확히 구분해주세요.")
```

#### 0-4. 원본 문장 리스트 생성

원본 콘텐츠를 문장 단위로 분리하여 리스트로 저장:
```json
{
  "source_url": "https://...",
  "source_sentences": [
    {"index": 0, "section": "Introduction", "text": "..."},
    {"index": 1, "section": "Introduction", "text": "..."},
    ...
  ]
}
```

### Step 1: 파일 읽기 및 문장 추출

1. Read 도구로 대상 파일 읽기
2. 마크다운 파싱:
   - frontmatter 제외 (--- 블록)
   - 코드 블록 제외 (```)
   - 본문만 추출
3. 문장 단위 분리:
   - 마침표(.), 물음표(?), 느낌표(!) 기준
   - 단, 코드 인라인(`...`)이나 링크 내부는 분리하지 않음
4. 각 문장의 라인 번호 기록
5. **(번역 파일)** 각 문장에 대응하는 원문 매칭:
   - 섹션 헤더 기반 위치 추정
   - 고유명사/숫자/코드 키워드 매칭
   - 문장 순서 기반 추정

### Step 2: polish-agent 호출 (batch 모드)

각 문장에 대해 Task 도구로 polish-agent 호출:

**번역 파일인 경우 (원문 포함):**
```
문장: "[추출된 문장]"
원본: "[매칭된 영어 원문]"
모드: "batch"
```

**일반 파일인 경우:**
```
문장: "[추출된 문장]"
모드: "batch"
```

반환값 (JSON):
```json
{
  "original": "...",
  "source": "[영어 원문 - 번역 파일인 경우]",
  "score": 9.3,
  "source_validation": {
    "meaning_preserved": true,
    "issues": []
  },
  "patterns_found": ["#1", "#10"],
  "options": [...]
}
```

### Step 3: JSON 리포트 생성

리포트를 `.claude/polish-reports/[slug]-[timestamp].json`에 저장합니다.
스키마 상세: @.claude/skills/polish-file/references/report-schema.md

### Step 4: 사용자 확인

AskUserQuestion으로 질문:

```
## 파일 분석 완료

**파일**: [파일명]
**전체 문장**: N개
**평균 점수**: X.X/10
**개선 대상** (< 9.5점): M개

진행 방법을 선택하세요:

1. ✅ 지금 다듬기 - M개 문장 순차 개선
2. 📄 리포트만 저장 - 나중에 /polish-file --resume로 이어서
3. ❌ 취소
```

### Step 5: 순차 개선 (선택 시)

기준 점수 미만 문장들에 대해 순차적으로:

1. 현재 문장 표시 (진행률 포함)
   ```
   [3/12] Line 67
   ```

2. **(번역 파일)** 원문 정보 먼저 출력:
   ```
   📝 **원문 (English)**
   > This feature can significantly improve performance

   📝 **현재 번역**
   > 이 기능을 활용하면 성능을 향상시키는 것이 가능합니다

   ⚠️ **원본 검증**: "significantly" 누락됨
   ```

3. AskUserQuestion으로 옵션 제시
   ```json
   {
     "questions": [{
       "question": "어떤 옵션으로 수정할까요?",
       "header": "문장 선택",
       "multiSelect": false,
       "options": [
         {
           "label": "A (10.0점)",
           "description": "이 기능을 쓰면 성능이 크게 좋아집니다 | #1, #10 수정 + 의미 복원 ✅"
         },
         {
           "label": "B (9.8점)",
           "description": "이 기능으로 성능을 크게 높일 수 있습니다 | #1 수정 + 의미 복원 ✅"
         },
         {
           "label": "현재 유지",
           "description": "원본 문장 그대로 유지"
         },
         {
           "label": "건너뛰기",
           "description": "이 문장은 나중에 처리"
         }
       ]
     }]
   }
   ```

4. 사용자 선택에 따라:
   - 옵션 선택: Edit 도구로 파일 수정
   - 현재 유지/건너뛰기: 다음 문장으로

5. JSON 리포트의 progress 및 status 업데이트

---

## --resume 모드

이전 분석을 이어서 진행:

1. 가장 최근 JSON 리포트 파일 찾기
   ```bash
   ls -t .claude/polish-reports/[slug]-*.json | head -1
   ```

2. 리포트에서 `status: "pending"` 문장부터 시작

3. 이미 완료된 항목 건너뛰기

---

## 출력

진행 중/완료 출력 템플릿: @.claude/skills/polish-file/references/output-templates.md

---

## translate-writer 연계

translate-writer의 Phase 3에서 이 스킬을 호출합니다:

```
Phase 2 완료 (translation-reviewer 통과)
        │
        ▼
Phase 3: polish-file 호출
        - --threshold에 따른 문장 필터링
        - 사용자 확인 후 개선
        │
        ▼
Phase 4: 최종 승인
```

---

## 참조

- **핵심 로직**: `.claude/agents/polish-agent.md`
- **전체 패턴 (28개)**: `.claude/agents/translation-reviewer.md`
- **리포트 저장 위치**: `.claude/polish-reports/`

---

## 주의사항

1. **문장 추출 정확성**: 코드 블록, frontmatter 제외 확인
2. **라인 번호**: Edit 시 정확한 위치 매칭 필요
3. **리포트 보존**: 학습 데이터 및 추적용으로 삭제하지 않음
4. **중단 대비**: progress 상태 수시 업데이트
5. **성능**: 문장 수가 많으면 시간이 걸릴 수 있음 (예상 시간 안내)
6. **원본 매칭 정확도**: 번역 파일에서 원문-번역문 매칭이 100% 정확하지 않을 수 있음. 섹션 헤더와 키워드 기반으로 최선의 추정
7. **원본 접근 실패 시**: WebFetch 실패 시 일반 모드로 폴백 (원본 없이 분석)
8. **원본 의미 보존 필수**: 모든 개선 옵션은 원본 의미를 반드시 보존해야 함
