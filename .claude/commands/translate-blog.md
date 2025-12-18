---
allowed-tools: [Read, Write, Bash, Glob, TodoWrite, WebFetch, Task]
argument-hint: <URL 또는 파일경로> [--glossary <용어집경로>] [--review] [--featured] [--publish]
description: URL 또는 로컬 마크다운 파일을 번역하여 블로그 글 생성 (TL;DR 자동 생성, 용어집 참조)
---

## 현재 번역 글 목록

!`ls -1 contents/blog/translation/ 2>/dev/null | grep -v "^_" | grep -v "^\." || echo "번역 글 없음"`

## 기존 태그 패턴

!`grep -rh "^tags:" contents/blog/translation/ --include="*.md" 2>/dev/null | sort | uniq | head -10`

## 용어집 참조

아래 용어집이 존재하면 번역 시 일관된 용어를 사용하세요.
용어집이 없으면 새로운 기술 용어 발견 시 용어집 업데이트를 제안하세요.

!`cat contents/blog/translation/_glossary.md 2>/dev/null || echo "⚠️ 용어집 없음 - 번역 후 용어집 업데이트 권장"`

## 기존 번역 글 문체 참조

아래 기존 번역 글의 말투, 문체, 구조를 참고하여 **일관된 톤과 형식**으로 작성하세요.

### 번역 글 스타일 레퍼런스
@contents/blog/translation/nextjs-16-beta-docs-translation/index.md

## 작업

**"$ARGUMENTS"** 를 번역하여 블로그 포스트를 생성하세요.

### 실행 단계

#### 1. 입력 분석 및 원문 수집

**URL인 경우** (http:// 또는 https://로 시작):
- WebFetch 도구로 원문 가져오기
- HTML을 마크다운으로 변환
- 메타데이터 추출 (제목, 작성자, 작성일, URL)

**로컬 파일인 경우**:
- Read 도구로 파일 읽기
- frontmatter에서 메타데이터 추출
- 파일 경로에서 출처 정보 유추

#### 2. 메타데이터 추출 및 분석

추출해야 할 정보:
- **원문 제목**: 번역 제목 생성의 기반
- **작성자**: 원문 작성자 정보 (크레딧용)
- **작성일**: 원문 발행일
- **원문 URL**: 참고 자료 링크
- **주요 키워드**: 태그 생성에 활용

#### 3. 슬러그 및 경로 생성

- 원문 제목 기반 영문 슬러그 생성
- URL-friendly: 소문자, 하이픈, 영문만
- 예: "Next.js 16 Beta" → `nextjs-16-beta-translation`
- 경로: `contents/blog/translation/[slug]/index.md`

#### 4. TL;DR 핵심 요약 생성

원문의 핵심 내용을 구조화된 요약으로 작성:
- **주요 개선사항/기능**: 3-5개 bullet points
- **주요 변경사항**: 중요 변경점 요약
- **주의사항**: 마이그레이션/업그레이드 시 주의점

`<details><summary>` 형식으로 접을 수 있게 작성.

#### 5. 본문 번역

**번역 원칙:**
- 용어집이 있으면 참조하여 일관된 용어 사용
- 기술 용어는 원문 유지 또는 괄호 안에 원문 병기
- 자연스러운 한국어 표현 사용 (번역투 지양)
- 코드 블록은 원문 유지, 주석은 필요시 번역
- 원문의 섹션 구조 유지

**문체 가이드:**
- 존댓말 사용 (기존 번역 글 참조)
- 이모지는 원문에 있는 경우에만 사용
- 강조는 **볼드** 사용

#### 6. 후처리 및 포맷팅

- blockquote로 번역 안내문 추가: `> 이 문서는 ... 한글 번역입니다.`
- 원문 정보 섹션 추가: `**원문 작성일**: ...`, `**작성자**: ...`
- 참고 자료 섹션에 원문 링크 포함
- SEO 최적화된 description 생성 (120-160자)

#### 7. 품질 검증 (--review 옵션 시)

Task 도구로 `translation-reviewer` 에이전트 실행:
- 번역 정확성 검토
- 용어 일관성 확인
- 가독성 점검
- 포맷 검증

### 옵션 처리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--glossary` | 사용할 용어집 경로 | `_glossary.md` |
| `--review` | 번역 품질 검토 에이전트 실행 | false |
| `--featured` | 홈 피처드 섹션 표시 | false |
| `--publish` | 발행 상태로 생성 (draft: false) | draft: true |

### Frontmatter 템플릿

```yaml
---
title: "[원문 제목] 한글 번역"
description: "[원문 제목] 한글 번역 - [핵심 내용 요약 120-160자]"
pubDatetime: [현재 UTC 시간 ISO 8601]
modDatetime: [현재 UTC 시간 ISO 8601]
tags: ["translation", "[관련-기술-태그]", ...]
featured: false
draft: true
---
```

**주의**:
- `tags`에 반드시 `"translation"` 포함
- `slug` 필드는 사용하지 않음 (파일 경로에서 자동 생성됨)

### 생성될 마크다운 구조

```markdown
---
[frontmatter]
---

> 이 문서는 [원문 제목]의 한글 번역입니다.

## 목차

## 핵심 요약
<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]

### 주의사항
- [주의할 점]

</details>

---

**원문 작성일**: [YYYY년 MM월 DD일 (요일)]

**작성자**: [원문 작성자]

[번역된 본문 내용...]

## 참고 자료

- [원문 제목](원문 URL)
- [관련 공식 문서](URL)
```

### SEO 리포트 (생성 후 출력)

```
📊 번역 글 SEO 분석 리포트
─────────────────────────────
✅ 제목: [제목] (n자)
✅ 설명: [description] (n자) - 권장: 120-160자
✅ 태그: ["translation", ...] - n개
✅ 원문: [원문 URL]
✅ 파일: contents/blog/translation/[slug]/index.md
✅ URL: /posts/translation/[slug]
─────────────────────────────
```

### 용어집 업데이트 제안 (새 용어 발견 시)

번역 중 새로운 기술 용어 발견 시 아래 형식으로 제안:

```
📚 용어집 업데이트 제안
─────────────────────────────
| 원문 | 번역 | 비고 |
|------|------|------|
| [term] | [번역] | [설명] |
─────────────────────────────
용어집 업데이트를 원하시면 "용어집 업데이트" 라고 말씀해주세요.
```
