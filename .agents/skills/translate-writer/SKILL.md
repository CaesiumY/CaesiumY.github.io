---
name: translate-writer
argument-hint: <URL 또는 파일경로> [--mode=quick|thorough|perfect] [--analyze] [--skip-review]
description: 영어 기술 블로그/문서를 고품질 한국어 블로그 포스트로 변환하는 전문 번역 파이프라인. 스타일 가이드, 용어집, 한국어 품질 검토, 원문 충실도 검증, 문장 polish를 함께 사용합니다. URL이나 파일 경로를 주며 "번역해줘", "한국어로", "translate", "번역 블로그", "옮겨줘", "영어 글" 등을 요청하면 반드시 이 스킬을 사용하세요.
---

# /translate-writer - 영어 기술 글 번역

영어 기술 블로그나 문서를 한국어 블로그 포스트로 번역합니다.

Codex에서는 `.agents/agents/*.md`의 역할 프롬프트를 참고해 기본 파일 읽기/검색/편집 및 웹 조회 도구로 직접 수행합니다. 사용자가 명시적으로 하위 에이전트나 병렬 작업을 요청한 경우에만 Codex sub-agent를 사용합니다.

## 참조 파일

- 스타일 가이드: `.agents/skills/translate-writer/data/style-guide.md`
- 용어집: `.agents/skills/translate-writer/data/glossary.md`
- 시리즈 규칙: `.agents/skills/translate-writer/data/series.md`
- 피드백 로그: `.agents/skills/translate-writer/data/feedback-log.md`
- 번역투 패턴: `.agents/skills/translate-writer/references/translation-patterns.md`
- 완료 출력 템플릿: `.agents/skills/translate-writer/references/output-template.md`
- 역할 프롬프트:
  - `.agents/agents/translation-style-analyzer.md`
  - `.agents/agents/content-translator.md`
  - `.agents/agents/translation-reviewer.md`
  - `.agents/agents/translation-verifier.md`
  - `.agents/agents/polish-agent.md`
  - `.agents/agents/translation-learner.md`

## 모드

| 모드 | 검토 기준 | Polish | 용도 |
| --- | --- | --- | --- |
| `--mode=quick` | 8점 | 생략 | 빠른 참고용 |
| `--mode=thorough` | 8점 | 9.5점 미만 | 일반 블로그, 기본값 |
| `--mode=perfect` | 9점 | 9.8점 미만 | 중요 문서 |

## 실행 단계

### Phase 0: 스타일 가이드 확인

1. 스타일 가이드, 용어집, 최근 피드백을 읽습니다.
2. `--analyze` 옵션이 있거나 스타일 가이드에 `[분석 필요]`가 3개 이상 있으면, `translation-style-analyzer` 역할 프롬프트를 기준으로 샘플 번역과 기존 번역을 분석해 스타일 가이드를 갱신합니다.
3. 모드는 `quick`, `thorough`, `perfect` 중 하나로 확정합니다. 지정이 없으면 `thorough`를 사용합니다.

### Phase 1: 원문 수집 및 번역

1. 입력이 URL이면 웹 조회로 원문 제목, 작성자, 작성일, 본문을 수집합니다.
2. 입력이 로컬 파일이면 파일을 읽어 원문으로 사용합니다.
3. `content-translator` 역할 프롬프트, 스타일 가이드, 용어집을 기준으로 번역합니다.
4. `.agents/skills/translate-writer/data/series.md`의 URL 패턴과 일치하면 frontmatter에 `series` 필드를 추가합니다.

번역 글은 기본적으로 `contents/blog/translation/[slug]/index.md`에 저장할 초안으로 작성합니다.

### Phase 2: 이중 검증

같은 번역본에 대해 두 기준을 독립적으로 적용합니다.

- `translation-reviewer`: 한국어 품질, 번역투 패턴, 가독성, 형식 검토
- `translation-verifier`: 원문 의미 보존, 기술 정확성, 뉘앙스 검증

통과 조건:

- reviewer와 verifier 모두 모드별 종합 기준을 만족해야 합니다.
- 각 역할 프롬프트에 정의된 하드 임계값을 모두 통과해야 합니다.
- 기준 미달이면 미달 차원만 구조화해 수정하고 최대 3회 반복합니다.

`--skip-review`가 있으면 검토 루프를 생략하되, 최종 응답에 생략 사실을 명시합니다.

### Phase 3: Polish

`quick` 모드는 이 단계를 생략합니다.

`thorough`와 `perfect` 모드는 `/polish-file` 흐름을 사용합니다.

1. 문장별 점수를 산정합니다.
2. 모드별 기준 미만 문장만 개선 대상으로 고릅니다.
3. 사용자에게 진행 여부를 확인합니다.
4. 선택한 문장에 대해 `/polish` 흐름으로 개선 옵션을 제시하고 파일에 반영합니다.
5. 리포트는 `.agents/polish-reports/[slug]-[timestamp].json`에 저장합니다.

### Phase 4: 사용자 승인

사용자에게 원문, 번역 제목, 모드, reviewer/verifier 점수, polish 결과, 저장 예정 경로를 보여주고 승인/수정/추가 다듬기/거절 중 하나를 확인합니다.

- 승인: Phase 5로 이동합니다.
- 수정: 피드백을 반영해 Phase 1로 돌아갑니다.
- 추가 다듬기: Phase 3으로 돌아갑니다.
- 거절: `translation-learner` 역할 기준으로 부정 피드백을 기록하고 종료합니다.

### Phase 5: 저장 및 학습

승인된 경우:

1. 번역문을 `contents/blog/translation/[slug]/index.md`에 `draft: true`로 저장합니다.
2. 승인본을 `.agents/skills/translate-writer/data/approved-posts/`에 백업합니다.
3. 필요하면 `.agents/skills/translate-writer/data/samples/`에 샘플을 추가합니다.
4. `translation-learner` 역할 프롬프트 기준으로 피드백 로그를 갱신합니다.
5. 스타일 가이드 변경 전에는 `.agents/skills/translate-writer/data/style-history/`에 백업합니다.
6. 새 용어가 있으면 용어집 업데이트를 제안하거나 반영합니다.

## 완료 기준

- 모든 출력과 번역은 한국어로 작성합니다.
- 용어집을 우선하고, 원문 의미 보존을 한국어 자연스러움보다 낮게 두지 않습니다.
- 발행은 사용자가 결정하므로 새 번역은 기본적으로 `draft: true`입니다.
- 변경 후에는 필요한 경우 `pnpm build`로 정적 빌드 반영 여부를 확인합니다.
