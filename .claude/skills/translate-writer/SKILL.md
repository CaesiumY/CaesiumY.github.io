---
allowed-tools: [Read, Write, Bash, Glob, TodoWrite, Task, AskUserQuestion, WebFetch]
argument-hint: <URL 또는 파일경로> [--analyze] [--skip-review]
description: AI 기반 번역 에이전트 시스템 (스타일 학습 → 자동 번역 → 검토 루프 → 사용자 승인)
---

## 번역 글쓰기 에이전트 시스템

4개의 전문 에이전트가 협업하여 자연스러운 한국어 번역을 생성합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    사용자 요청 (URL/파일)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 0: 스타일 가이드 확인                                      │
│  - style-guide.md 존재 및 내용 확인                               │
│  - 비어있으면 → translation-style-analyzer 에이전트 호출          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: 번역 (content-translator 에이전트)                      │
│  - 스타일 가이드 + 용어집 참조                                    │
│  - URL/파일 → 한국어 번역                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: 검토 루프 (translation-reviewer 에이전트)               │
│  - 10점 만점 평가 (28개 번역투 패턴 체크)                         │
│  │                                                              │
│  ├──→ 8점 미만: Translator에게 수정 지시 (최대 3회)               │
│  │                                                              │
│  └──→ 8점 이상: 사용자 승인 요청                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: 사용자 최종 결정                                        │
│                                                                 │
│  ✅ 승인: → translation-learner 호출 → 파일 저장                  │
│  📝 수정 요청: → Translator에게 피드백 전달 → Phase 2로            │
│  ❌ 거절: → translation-learner (부정 피드백) → 종료               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 현재 스타일 가이드 상태

@.claude/skills/translate-writer/data/style-guide.md

## 용어집

@.claude/skills/translate-writer/data/glossary.md

## 최근 피드백

!`tail -30 .claude/skills/translate-writer/data/feedback-log.md 2>/dev/null || echo "피드백 로그 없음"`

## 샘플 번역 목록

!`ls -la .claude/skills/translate-writer/data/samples/ 2>/dev/null || echo "샘플 없음 - 초기 분석 필요"`

---

## 작업

**"$ARGUMENTS"** 를 한국어로 번역하세요.

### 실행 단계

#### Phase 0: 스타일 가이드 확인

1. `.claude/skills/translate-writer/data/style-guide.md` 읽기
2. `[분석 필요]` 문자열이 많으면 → translation-style-analyzer 에이전트 먼저 호출
3. 용어집 확인: `.claude/skills/translate-writer/data/glossary.md`
4. 스타일 가이드가 준비되면 Phase 1로 진행

**translation-style-analyzer 호출 조건**:
- style-guide.md에 `[분석 필요]`가 3개 이상
- `--analyze` 옵션 사용 시
- samples/ 폴더에 새 파일 추가 후

#### Phase 1: 번역 (content-translator)

Task 도구로 content-translator 에이전트 호출:
```
- 입력: [URL 또는 파일 경로]
- 스타일 가이드 참조
- 용어집 참조
- 번역 생성 및 반환
```

**URL인 경우**: WebFetch로 원문 수집
**파일인 경우**: Read로 파일 읽기

#### Phase 2: 검토 루프 (translation-reviewer)

**루프 조건**: 점수 8점 이상 또는 3회 수정 완료

```
반복 (최대 3회):
  1. translation-reviewer 에이전트로 평가 (10점 만점)
  2. 점수 < 8:
     - 수정 지시를 content-translator에게 전달
     - 수정된 번역 받기
  3. 점수 >= 8:
     - 루프 종료
     - 사용자 승인 요청
```

**3회 수정 후에도 8점 미만**:
- 사용자에게 상황 보고
- 현재 점수와 주요 문제점 안내
- 계속 진행할지 사용자 결정

#### Phase 3: 사용자 최종 결정

AskUserQuestion으로 사용자에게 질문:

```
## 번역 검토

**점수**: X/10
**원문**: [원문 제목]
**번역 제목**: [한글 제목]

[번역 미리보기 또는 전체 내용]

---

이 번역을 어떻게 처리할까요?

1. ✅ 승인 - 이대로 저장
2. 📝 수정 요청 - 피드백 입력 후 수정
3. ❌ 거절 - 폐기
```

**사용자 선택에 따른 처리**:

| 선택 | 처리 |
|------|------|
| ✅ 승인 | translation-learner 호출 (긍정) → 파일 저장 → 완료 |
| 📝 수정 | 피드백 받기 → translation-learner 호출 → Phase 1로 |
| ❌ 거절 | translation-learner 호출 (부정) → 종료 |

#### Phase 4: 저장 및 학습 (translation-learner)

승인된 경우:
1. `contents/blog/translation/[slug]/index.md` 저장
2. `approved-posts/`에 백업 저장
3. style-guide.md 업데이트 (승인 패턴 강화)
4. feedback-log.md 기록
5. 새 용어 발견 시 용어집 업데이트 제안

거절된 경우:
1. 거절 이유 파악
2. feedback-log.md 기록
3. 필요시 style-guide.md에 "피해야 할 패턴" 추가

---

## 옵션 처리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--analyze` | 강제 스타일 재분석 | false |
| `--skip-review` | 검토 루프 스킵 (테스트용) | false |

---

## 에이전트 역할

| 에이전트 | 역할 | 점수 체계 |
|----------|------|----------|
| translation-style-analyzer | 기존 번역 분석 → 스타일 가이드 생성 | - |
| content-translator | URL/파일 번역 | - |
| translation-reviewer | 번역 품질 검토 (28개 패턴) | 10점 만점 |
| translation-learner | 피드백 학습 → 스타일 가이드 업데이트 | - |

---

## 기존 커맨드와의 관계

| 커맨드 | 용도 | 학습 |
|--------|------|------|
| `/translate-blog` | 단순 번역 (빠른 작업용) | ❌ |
| `/translate-writer` | 풀 에이전트 시스템 (품질 중심) | ✅ |

---

## 완료 출력

```
📝 번역 완료
─────────────────────────────────────

✅ 원문: [원문 제목]
✅ 번역 제목: [한글 제목]
✅ 파일: contents/blog/translation/[slug]/index.md
✅ 점수: X/10
✅ 상태: draft: true

📊 검토 히스토리:
- 1차: X점 → 수정
- 2차: X점 → 통과
- 사용자 승인: ✅

📚 학습된 내용:
- [피드백 요약]

📖 용어집 업데이트:
- [새 용어 (있으면)]

─────────────────────────────────────
💡 발행하려면: frontmatter의 draft: false로 변경
```

---

## 주의사항

1. **draft: true**: 모든 번역은 초안으로 생성. 발행은 사용자가 직접.
2. **루프 제한**: Translator↔Reviewer 루프는 최대 3회.
3. **피드백 축적**: 모든 피드백은 feedback-log.md에 기록.
4. **용어집 존중**: `glossary.md`의 용어를 우선 참조.
5. **백업**: style-guide.md 변경 전 항상 style-history/에 백업.
6. **한국어**: 모든 출력과 번역은 한국어로.
