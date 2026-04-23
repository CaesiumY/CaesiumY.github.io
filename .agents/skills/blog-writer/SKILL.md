---
name: blog-writer
argument-hint: "[주제/제목]" [--category 카테고리] [--analyze] [--skip-review]
description: 저자의 스타일을 학습하여 한국어 블로그 글을 작성하는 파이프라인. 스타일 분석, 초안 작성, 80점 기준 검토 루프, 사용자 승인까지 수행합니다. "글 써줘", "블로그 작성", "포스트 생성", "write a blog post", "새 글 쓰기" 등의 요청에 사용하세요. 번역이 아닌 원본 한국어 글을 쓸 때 /translate-writer 대신 이 스킬을 사용합니다.
---

# /blog-writer - 한국어 블로그 글쓰기

저자의 기존 스타일을 반영해 한국어 블로그 글을 작성합니다.

Codex에서는 `.agents/agents/*.md`의 역할 프롬프트를 참고해 기본 파일 읽기/검색/편집 도구로 직접 수행합니다. 사용자가 명시적으로 하위 에이전트나 병렬 작업을 요청한 경우에만 Codex sub-agent를 사용합니다.

## 참조 파일

- 스타일 가이드: `.agents/skills/blog-writer/data/style-guide.md`
- 피드백 로그: `.agents/skills/blog-writer/data/feedback-log.md`
- 샘플 글: `.agents/skills/blog-writer/data/samples/`
- 역할 프롬프트:
  - `.agents/agents/style-analyzer.md`
  - `.agents/agents/content-writer.md`
  - `.agents/agents/content-reviewer.md`
  - `.agents/agents/style-learner.md`

## 작업

`$ARGUMENTS` 주제로 블로그 글을 작성하세요.

## 실행 단계

### Phase 0: 스타일 가이드 확인

1. 스타일 가이드와 최근 피드백을 읽습니다.
2. `--analyze` 옵션이 있거나 스타일 가이드에 `[분석 필요]`가 3개 이상 있으면, `style-analyzer` 역할 프롬프트를 기준으로 샘플 글을 분석해 스타일 가이드를 갱신합니다.
3. 카테고리는 `--category` 값이 있으면 따르고, 없으면 주제와 기존 카테고리 구조를 기준으로 추론합니다.

### Phase 1: 초안 작성

`content-writer` 역할 프롬프트와 스타일 가이드를 기준으로 초안을 작성합니다.

Frontmatter는 AstroPaper 스키마를 따릅니다.

```yaml
---
title: "제목"
description: "120-160자 설명"
pubDatetime: 2026-01-01T00:00:00Z
modDatetime: 2026-01-01T00:00:00Z
tags: ["관련-태그"]
featured: false
draft: true
---
```

### Phase 2: 검토 루프

`content-reviewer` 역할 프롬프트 기준으로 100점 만점 평가를 수행합니다.

- 80점 이상이면 사용자 승인 단계로 이동합니다.
- 80점 미만이면 구체적인 수정 지시를 반영해 최대 3회까지 다시 작성합니다.
- 3회 후에도 기준 미만이면 현재 점수와 주요 문제를 사용자에게 보고하고 진행 여부를 확인합니다.
- `--skip-review`가 있으면 검토 루프를 생략하되, 최종 응답에 생략 사실을 명시합니다.

### Phase 3: 사용자 승인

사용자에게 제목, 카테고리, 점수, 저장 예정 경로, 핵심 미리보기를 보여주고 승인/수정/거절 중 하나를 확인합니다.

- 승인: `contents/blog/[category]/[slug]/index.md`에 저장하고 학습 단계로 이동합니다.
- 수정: 피드백을 반영해 Phase 1로 돌아갑니다.
- 거절: 거절 이유를 피드백 로그에 기록하고 종료합니다.

### Phase 4: 저장 및 학습

승인된 경우:

1. 글은 `draft: true`로 저장합니다.
2. 승인본을 `.agents/skills/blog-writer/data/approved-posts/`에 백업합니다.
3. 필요하면 `.agents/skills/blog-writer/data/samples/`에 샘플을 추가합니다.
4. `style-learner` 역할 프롬프트 기준으로 피드백 로그와 스타일 가이드를 갱신합니다.
5. 스타일 가이드를 바꿀 때는 먼저 `.agents/skills/blog-writer/data/style-history/`에 백업합니다.

## 카테고리

| 카테고리 | 용도 |
| --- | --- |
| ai | AI, Codex, LLM |
| technical | 기술 글, 튜토리얼 |
| retrospect | 회고, 후기 |
| career | 면접, 커리어 |
| algorithm | 알고리즘, 코테 |
| project | 프로젝트 |
| tools | 개발 도구 |

## 완료 기준

- 모든 출력과 본문은 한국어로 작성합니다.
- 최종 글은 초안 상태로 저장하고, 발행 여부는 사용자가 직접 결정합니다.
- 변경 후에는 필요한 경우 `pnpm build`로 정적 빌드 반영 여부를 확인합니다.
