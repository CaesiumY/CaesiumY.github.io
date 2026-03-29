---
allowed-tools: [Skill]
argument-hint: "[선택된 텍스트]"
description: 선택된 문장의 개선 옵션을 점수와 함께 제안 (polish 스킬 호출)
---

# /polish - 문장 다듬기

선택된 문장을 분석하고 개선된 옵션들을 점수와 함께 제시합니다.
번역 파일인 경우 원본 영어 문장을 자동으로 찾아 의미 보존까지 검증합니다.

## 실행

Skill 도구를 사용하여 `polish` 스킬을 호출하세요.

```
skill: "polish"
args: "$ARGUMENTS"
```
