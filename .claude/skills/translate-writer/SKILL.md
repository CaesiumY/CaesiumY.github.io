---
allowed-tools: [Read, Write, Bash, Glob, TodoWrite, Task, AskUserQuestion, WebFetch]
argument-hint: <URL 또는 파일경로> [--mode=quick|thorough|perfect] [--analyze] [--skip-review]
description: 영어 기술 블로그/문서를 고품질 한국어 블로그 포스트로 변환하는 전문 번역 파이프라인. 이 스킬은 단순히 텍스트를 번역하는 것이 아니라, 저자의 스타일을 학습하고 6개 전문 에이전트(번역기, 번역투 리뷰어, 원문 충실도 검증기, 문장 polish 등)가 협업하여 출판 수준의 번역을 생성합니다. 사용자가 영어 글을 번역하거나 한국어로 옮기고 싶다고 하면 반드시 이 스킬을 사용하세요. URL이나 파일 경로를 주며 번역을 요청하는 경우, "번역해줘", "한국어로", "translate", "번역 블로그", "옮겨줘", "영어 글" 등의 키워드가 포함된 경우 모두 해당합니다. 직접 번역하지 말고 반드시 이 스킬을 호출하세요 — 직접 번역은 스타일 가이드, 용어집, 이중 검증을 활용할 수 없어 품질이 크게 떨어집니다.
---

## 번역 글쓰기 에이전트 시스템

6개의 전문 에이전트가 협업하여 자연스러운 한국어 번역을 생성합니다.

```
사용자 요청 (URL/파일) [--mode=quick|thorough|perfect]
  → Phase 0: 스타일 가이드 확인 (없으면 translation-style-analyzer 호출)
  → Phase 1: 번역 (content-translator, 스타일 가이드 + 용어집 참조)
  → Phase 2: 이중 검증 (병렬, 최대 3회 반복)
      ├─ translation-reviewer (한국어 품질, 28개 패턴)
      └─ translation-verifier (원문 충실도, T1~T10)
      미달 시 → content-translator에 수정 지시 → 재검증
  → Phase 3: Polish 정밀 다듬기 [quick: 건너뛰기]
      문장별 분석 → 기준 미만 필터링 → 사용자 확인 후 순차 개선
  → Phase 4: 사용자 최종 결정
      ✅ 승인 → Phase 5 | 📝 수정 → Phase 1 | 🔧 다듬기 → Phase 3 | ❌ 거절 → 종료
  → Phase 5: 저장 및 학습 (translation-learner)
```

---

## 모드별 동작

| 모드 | 검토 기준 | Polish | 소요 시간 | 용도 |
|------|----------|--------|----------|------|
| `--mode=quick` | 8점 | 건너뛰기 | 5-10분 | 빠른 참고용 |
| `--mode=thorough` (기본) | 8점 | 9.5점 미만만 | 15-20분 | 일반 블로그 |
| `--mode=perfect` | 9점 | 9.8점 미만 전체 | 30분+ | 중요 문서 |

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

### 모드 파싱

1. 인자에서 `--mode=` 추출 (없으면 `thorough`)
2. 모드별 설정값 적용:
   - quick: review_threshold=8, skip_polish=true
   - thorough: review_threshold=8, polish_threshold=9.5
   - perfect: review_threshold=9, polish_threshold=9.8

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

##### 시리즈 자동 감지 (Phase 1 추가)

번역 전 시리즈 여부를 자동으로 확인합니다:

1. **URL 패턴 매칭**
   - `claude.com/blog/*` → `series: "Claude 공식 블로그 번역"`
   - 시리즈 목록: @.claude/skills/translate-writer/data/series.md 참조

2. **Frontmatter에 추가**
   - 시리즈가 감지되면 Frontmatter에 `series` 필드 자동 추가
   ```yaml
   series: "Claude 공식 블로그 번역"  # URL 패턴 매칭 시
   ```

3. **감지 실패 시**
   - 시리즈 필드 생략 (기존 동작 유지)

#### Phase 2: 이중 검증 (reviewer + verifier 병렬)

**병렬 실행**: 두 에이전트를 Task 도구로 **동시에** 호출합니다.

```
반복 (최대 3회):
  1. 병렬 실행:
     - translation-reviewer 에이전트: 한국어 품질 평가 (10점 만점)
     - translation-verifier 에이전트: 원문 충실도 평가 (10점 만점)
       (원문 URL/파일 + 번역 파일 모두 전달)
       ⚠️ URL인 경우 반드시 원본 URL을 함께 전달할 것 — verifier가 WebFetch로 직접 접속하여 누락 요소(코드 블록, 이미지 등)를 검증함

  2. 결과 병합:
     - 두 점수 모두 기준 이상 → Phase 3으로
     - reviewer만 미달:
       → reviewer의 번역투 수정 지시를 content-translator에게 전달
       → 수정 후 재검증
     - verifier만 미달:
       → verifier의 의미 오류 수정 지시를 content-translator에게 전달
       → 수정 후 재검증
     - 둘 다 미달:
       → 두 보고서의 수정 지시를 통합하여 content-translator에게 전달
       → 수정 후 재검증
```

**루프 조건**:
- quick: reviewer 8점 이상 + verifier 8점 이상 또는 3회 수정 완료
- thorough: reviewer 8점 이상 + verifier 8점 이상 또는 3회 수정 완료
- perfect: reviewer 9점 이상 + verifier 9점 이상 또는 3회 수정 완료

**3회 수정 후에도 기준 미만**:
- 사용자에게 상황 보고
- 각 에이전트의 현재 점수와 주요 문제점 안내
- 계속 진행할지 사용자 결정

#### Phase 3: Polish 정밀 다듬기

**quick 모드**: 이 단계 건너뛰기 → Phase 4로

**thorough/perfect 모드** — `/polish-file` 스킬의 로직을 따릅니다:

1. **문장별 분석**: `/polish-file`의 Step 1-2와 동일 (polish-agent batch 호출)
2. **필터링**: 기준 점수 미만 문장만 선택 (thorough: 9.5, perfect: 9.8)
3. **사용자 확인**: "N개 문장 다듬기 진행?" (지금 다듬기 / 나중에 / 건너뛰기)
4. **순차 개선**: 각 문장에 대해 `/polish` 스킬의 Step 1-3을 따라 실행 (polish-agent → 옵션 제시 → Edit 적용)
5. **JSON 리포트 저장**: `.claude/polish-reports/[slug]-[timestamp].json`

상세 로직: `/polish-file` 스킬 참조, 개별 문장 다듬기: `/polish` 스킬 참조

#### Phase 4: 사용자 최종 결정

AskUserQuestion으로 사용자에게 질문:

```
## 번역 검토

**한국어 품질 점수**: X/10 (reviewer)
**원문 충실도 점수**: X/10 (verifier)
**원문**: [원문 제목]
**번역 제목**: [한글 제목]
**모드**: [quick|thorough|perfect]
**Polish**: [완료/건너뜀/N개 개선]

[번역 미리보기 또는 전체 내용]

---

이 번역을 어떻게 처리할까요?

1. ✅ 승인 - 이대로 저장
2. 📝 수정 요청 - 피드백 입력 후 재번역
3. 🔧 추가 다듬기 - Phase 3으로 돌아가기
4. ❌ 거절 - 폐기
```

**사용자 선택에 따른 처리**:

| 선택 | 처리 |
|------|------|
| ✅ 승인 | Phase 5로 |
| 📝 수정 | 피드백 받기 → Phase 1로 |
| 🔧 추가 다듬기 | Phase 3으로 |
| ❌ 거절 | translation-learner (부정) → 종료 |

#### Phase 5: 저장 및 학습 (translation-learner)

승인된 경우:
1. `contents/blog/translation/[slug]/index.md` 저장
2. `approved-posts/`에 백업 저장
3. `samples/`에 심링크 추가 (`ln -s ../approved-posts/<파일명> .`) — style-analyzer가 승인된 스타일을 학습
4. style-guide.md 업데이트 (승인 패턴 강화)
5. feedback-log.md 기록
6. 새 용어 발견 시 용어집 업데이트 제안

거절된 경우:
1. 거절 이유 파악
2. feedback-log.md 기록
3. 필요시 style-guide.md에 "피해야 할 패턴" 추가

---

## 옵션 처리

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--mode=quick` | 빠른 번역 (polish 생략) | - |
| `--mode=thorough` | 일반 번역 (기본값) | ✓ |
| `--mode=perfect` | 꼼꼼한 번역 (높은 기준) | - |
| `--analyze` | 강제 스타일 재분석 | false |
| `--skip-review` | 검토 루프 스킵 (테스트용) | false |

---

## 에이전트 역할

| 에이전트 | 역할 | 점수 체계 |
|----------|------|----------|
| translation-style-analyzer | 기존 번역 분석 → 스타일 가이드 생성 | - |
| content-translator | URL/파일 번역 | - |
| translation-reviewer | 한국어 품질 검토 (28개 패턴) | 10점 만점 |
| translation-verifier | 원문 충실도 검증 (T1~T10) | 10점 만점 |
| polish-agent | 문장 단위 정밀 분석 (10개 핵심 패턴) | 10점 만점 |
| translation-learner | 피드백 학습 → 스타일 가이드 업데이트 | - |

---

## 관련 스킬

| 스킬 | 용도 |
|------|------|
| `/polish` | 개별 문장 다듬기 (translate-writer Phase 3에서 내부 활용) |
| `/polish-file` | 파일 전체 문장 품질 분석 + 순차 개선 |
| `/blog-writer` | 원본 한국어 블로그 글 작성 (번역이 아닌 경우) |

---

## 완료 출력

완료 시 아래 템플릿을 참조하여 출력하세요:
@.claude/skills/translate-writer/references/output-template.md

---

## 주의사항

1. **draft: true**: 모든 번역은 초안으로 생성. 발행은 사용자가 직접.
2. **루프 제한**: Translator↔Reviewer+Verifier 이중 검증 루프는 최대 3회.
3. **모드 선택**: 목적에 맞는 모드 선택 안내.
4. **피드백 축적**: 모든 피드백은 feedback-log.md에 기록.
5. **용어집 존중**: `glossary.md`의 용어를 우선 참조.
6. **백업**: style-guide.md 변경 전 항상 style-history/에 백업.
7. **한국어**: 모든 출력과 번역은 한국어로.
8. **Polish 리포트**: 학습 및 추적용으로 보존.
