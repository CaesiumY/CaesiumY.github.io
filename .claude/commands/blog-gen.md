---
allowed-tools: [Read, Write, Bash, Glob, TodoWrite, Task]
argument-hint: "[제목]" [--category 카테고리] [--tags 태그1,태그2] [--featured] [--publish] [--skip-review]
description: AI 기반 블로그 포스트 자동 생성 (제목 분석 → 슬러그/태그/섹션 구조 생성, 기본 품질 검토)
---

## 현재 블로그 구조

!`ls -1 contents/blog/ | grep -v "^\." | grep -v "^_"`

## 기존 태그 패턴

!`grep -rh "^tags:" contents/blog/ --include="*.md" 2>/dev/null | sort | uniq | head -15`

## 스타일 가이드 참조

아래 스타일 가이드에 정의된 문체, 구조, 어휘 패턴을 따라 작성하세요.

@.claude/skills/blog-writer/data/style-guide.md

> **참고**: 스타일 가이드가 비어있거나 `[분석 필요]`가 많으면 아래 샘플 글 참조:
> - @contents/blog/career/toss-interview-retrospect/index.md (회고 스타일)
> - @contents/blog/ai/custom-commands-instead-of-cli-claude-code/index.md (기술 스타일)

## 작업

**"$ARGUMENTS"** 제목으로 블로그 포스트를 생성하세요.

### 실행 단계

1. **제목 분석 & 문체 파악**
   - 글의 성격 파악 (튜토리얼, 회고, 가이드, 분석 등)
   - 기존 글 문체 참조하여 톤 결정 (존댓말/반말, 이모지, 강조 방식)
   - 한글 제목 → 영문 슬러그 변환 (URL-friendly: 소문자, 하이픈)
   - 예: "React 성능 최적화" → `react-performance-optimization`

2. **태그 생성**
   - 기존 태그 패턴 참조 (소문자 + 하이픈 조합)
   - 제목과 카테고리 기반 5-7개 태그 추천
   - `--tags` 옵션이 있으면 해당 태그 사용

3. **섹션 구조 생성**
   - 글 성격에 맞는 맞춤형 섹션 헤더 생성
   - 반드시 `## 목차`로 시작, `## 마무리`로 종료
   - 중간 섹션은 제목 의미에 맞게 동적 생성

4. **파일 생성**
   - 경로: `contents/blog/[category]/[slug]/index.md`
   - 카테고리 미지정 시 기본값: `technical`
   - 새 카테고리면 디렉토리 자동 생성

5. **SEO 리포트 출력**

6. **품질 검토 (기본 실행, --skip-review로 생략)**
   - Task 도구로 `content-reviewer` 에이전트 실행
   - 스타일 가이드 준수 여부 검토
   - 100점 만점 품질 평가 (5개 항목)
   - 검토 결과를 SEO 리포트 뒤에 출력

### 옵션 처리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--category` | 카테고리 지정 | technical |
| `--tags` | 태그 수동 지정 (쉼표 구분) | AI 추천 |
| `--featured` | 홈 피처드 섹션 표시 | false |
| `--publish` | 발행 상태로 생성 (draft: false) | draft: true |
| `--skip-review` | 품질 검토 생략 (빠른 작업용) | false |

### 카테고리 목록

| 카테고리 | 용도 |
|----------|------|
| technical | 기술 글, 튜토리얼 |
| retrospect | 회고, 후기 |
| career | 면접, 커리어 |
| algorithm | 알고리즘, 코테 |
| ai | AI, Claude Code |
| project | 프로젝트 |
| tools | 개발 도구 |
| test | 테스트 |
| translation | 번역 |

### Frontmatter 템플릿

```yaml
---
title: "[제목]"
description: "[AI 생성 - 120~160자 권장]"
pubDatetime: [현재 UTC 시간 ISO 8601]
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
featured: false
draft: true
ogImage: "./thumbnail.png"
---
```

**주의**: `slug` 필드는 사용하지 않음 (파일 경로에서 자동 생성됨)

### 생성될 마크다운 구조

```markdown
---
[frontmatter]
---

## 목차

## [AI 생성 섹션 1]

[내용을 작성하세요]

## [AI 생성 섹션 2]

[내용을 작성하세요]

...

## 마무리

[내용을 작성하세요]

## 참고 자료

-
```

### SEO 리포트 (생성 후 출력)

```
📊 SEO 분석 리포트
─────────────────────────────
✅ 제목: [제목] (n자)
✅ 설명: [description] (n자) - 권장: 120-160자
✅ 태그: n개 - ["tag1", "tag2", ...]
✅ 파일: contents/blog/[category]/[slug]/index.md
✅ URL: /posts/[category]/[slug]
─────────────────────────────
```

### 품질 검토 결과 (기본 실행)

Task 도구로 `content-reviewer` 에이전트를 호출하여 아래 형식으로 검토 결과 출력 (`--skip-review` 시 생략):

```
📝 품질 검토 결과
─────────────────────────────
점수: XX/100

| 항목 | 점수 |
|------|------|
| 문체 일관성 | X/25 |
| 구조 준수 | X/20 |
| 한국어 자연스러움 | X/25 |
| SEO 최적화 | X/15 |
| 기술적 정확성 | X/15 |

✅ 잘된 점:
- [구체적 피드백]

💡 개선 제안:
- [구체적 제안]
─────────────────────────────
```
