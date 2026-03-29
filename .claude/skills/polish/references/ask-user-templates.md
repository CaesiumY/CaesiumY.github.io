# AskUserQuestion 옵션 템플릿

## 번역 파일인 경우 (원본 있음)

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

## 일반 파일인 경우 (원본 없음)

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

## 옵션 작성 규칙

- `label`: 점수를 포함한 짧은 라벨 (예: "A (10.0점)")
- `description`: **개선된 문장 전체 텍스트** + 수정 패턴 번호 + (번역 시) 원본 의미 보존 여부
- 번역 파일은 원본 의미 보존 여부를 ✅/⚠️로 표시
- 옵션은 점수 내림차순으로 정렬
