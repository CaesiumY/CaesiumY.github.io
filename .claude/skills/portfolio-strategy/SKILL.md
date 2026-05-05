---
allowed-tools: [Read, Write, Glob, Grep, Task, AskUserQuestion]
argument-hint: "[--jd <경로|URL|인라인>] [--target <프로젝트명>] [--reviewer=hr|tech|both]"
description: 인터뷰형 4-Phase 하네스로 포트폴리오 섹션을 작성하는 스킬. 이력서(about.md, projects.ts)에서 후보 선별 → 사용자 인터뷰 → 마크다운 작성 → 채용 담당자 시점 평가 루프를 단계별 강한 게이트로 진행합니다. "포트폴리오 작성", "포트폴리오 채워줘", "JD에 맞춰 포트폴리오", "이력서를 포트폴리오로 확장", "문제·해결·결과로 풀어줘", "포트폴리오 케이스 스터디" 등의 요청에 반드시 사용하세요. 단순 이력서 압축 작성은 /resume-specialist를 사용합니다 — 이 스킬은 이력서로는 부족한 정량 지표·트레이드오프·맥락을 사용자 인터뷰로 보강해 케이스 스터디 형태로 작성합니다.
---

# 포트폴리오 전략 스킬

이력서의 한 줄을 포트폴리오의 한 케이스 스터디로 확장하는 4-Phase 하네스 워크플로우입니다. 단순 생성이 아니라 사용자 인터뷰를 거쳐 정량 지표·트레이드오프·맥락까지 채운 결과물을 만듭니다.

## 워크플로우

```
입력: [--jd <경로|URL|인라인>] [--target <프로젝트명>] [--reviewer=hr|tech|both]
  │
  ▼
Phase 1: 선별 (Curation)
  - about.md + projects.ts에서 후보 추출
  - JD 제공 시 매칭 점수로 우선순위
  ✋ GATE 1: 사용자가 작성할 항목 N개 최종 선택
  │
  ▼
Phase 2: 인터뷰 (Interview)
  - 항목별 앵커링·정량·의사결정·실패 질문
  - 인터뷰 노트 즉시 영속화 (data/interviews/)
  ✋ GATE 2: 사용자가 인터뷰 노트 검토·편집 후 진행 승인
  │
  ▼
Phase 3: 작성 (Drafting)
  - Task: portfolio-strategist 에이전트 호출
  - 인터뷰 노트 + 템플릿 → 마크다운 섹션
  │
  ▼
Phase 4: 평가 (Review)
  - Task: portfolio-reviewer 에이전트 호출
  - 다차원 임계(구조 Binary / 적합도 70+ / 가독성 75+) + 종합 80+
  - 미통과 시 Phase 3 재작성 (최대 3회)
  ✋ GATE 3: 평가 결과 검토 + 진행 결정
  ✋ GATE 4: PASS 시 최종 마크다운 검토 후 data/drafts/ 저장
  │
  ▼
완료: 사용자가 직접 src/pages/portfolio.md에 옮겨 다듬음
```

## 데이터 소스

- `src/pages/about.md` — 경력, 프리랜스, 사이드 프로젝트, AI-Native Development 이력
- `src/data/projects.ts` — 프로젝트 메타데이터 (techStack, date, category, featured)
- `src/pages/portfolio.md` — 기존 포트폴리오 (참조용, 자동 덮어쓰기 안 함)

세 파일은 사용자가 손으로 관리하므로 항상 양쪽을 교차 확인해 최신 정보를 사용합니다.

## 옵션 처리

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `--jd <경로\|URL\|인라인>` | JD를 파일 경로, URL, 또는 인라인 텍스트로 제공 | 없음 (일반 시장 표준) |
| `--target <프로젝트명>` | 특정 프로젝트로 한정해 진행 | 없음 (Phase 1에서 후보 5개 선택) |
| `--reviewer=hr\|tech\|both` | Phase 4 평가자 시점 | `hr` (IT 채용 담당자) |

## Phase 1: 선별 (Curation)

### 실행

1. `src/pages/about.md`와 `src/data/projects.ts`를 읽어 모든 후보 항목을 추출. about.md의 Experience, Freelance Projects, Side Projects 섹션 + projects.ts 항목을 통합 리스트로 만듭니다.

2. JD가 제공되었으면 다음을 수행합니다:
   - JD가 URL이면 WebFetch로, 파일 경로면 Read로, 인라인이면 그대로 사용
   - JD를 5가지 슬롯으로 파싱:
     1. **회사·도메인** (예: 핀테크 스타트업, B2C 커머스 등)
     2. **핵심 책임** (JD의 "Responsibilities" 항목)
     3. **우대 기술 키워드** (상위 5~7개)
     4. **시니어리티** (Junior / Mid / Senior / Staff)
     5. **인재상·평가 기준** ★ JD에 "이런 분과 함께하고 싶어요", "We value...", 회사 가치관·평가 기준 항목으로 명시된 키워드. 명시가 없으면 빈 슬롯으로 둠.
   - 각 후보 항목과 JD의 키워드·책임·인재상 일치도를 항목별 가중치로 채점

3. JD가 없으면 featured + 최신성으로 정렬합니다.

4. 각 후보 항목에 대해 **이력서 한 줄 PSR 점검**을 수행합니다.
   - about.md에서 해당 항목 한 줄을 추출
   - 그 한 줄을 P (문제) / S (해결) / R (결과) 셋으로 분해
   - 빠진 요소를 표시 → Phase 2 인터뷰의 입력이 됨 (Q21에서 보강 질문)
   - 이 점검은 strategy.md §1.1 "PSR 압축 ↔ 상세 풀이 관계" 원칙에 기반함

5. 상위 후보(권장 5개)를 **항목별 가중치 합** 표로 사용자에게 제시. 단일 점수 대신 분해 출력하면 사용자가 우선순위 근거를 검증할 수 있음.

```markdown
## Phase 1: 선별 결과

### JD 파싱 결과
- **회사·도메인**: {파싱 결과}
- **핵심 책임**: {파싱 결과}
- **우대 키워드**: {상위 5~7개}
- **시니어리티**: {Junior/Mid/Senior/Staff}
- **인재상·평가 기준**: {파싱 결과 또는 "JD에 명시 없음 (빈 슬롯)"}

### 후보 우선순위 (항목별 가중치 분해)

JD 제공 시 가중치: 기술 매칭 40 / 책임 매칭 30 / 인재상 매칭 20 / featured 10 = 100
(인재상 슬롯이 비어 있으면 기술 매칭 50 / 책임 매칭 35 / featured 15 로 재조정)

| # | 프로젝트 | 기술 매칭 (40) | 책임 매칭 (30) | 인재상 매칭 (20) | featured (10) | 총점 |
|---|---|---|---|---|---|---|
| 1 | 한국 기술 마켓 | 36 (Turborepo★) | 22 | 18 | 10 | **86** |
| 2 | 교육 지원 플랫폼 | 32 (MSW★) | 26 | 14 | 10 | **82** |
| 3 | dding-dong | 18 | 15 | 12 (AI-Native) | 10 | 55 |
| 4 | 팀스파르타 | 20 | 12 | 16 (멘토링) | 0 | 48 |
| 5 | KC-MIC | 28 | 22 | 8 | 0 | 58 |

### 이력서 한 줄 PSR 점검

| 프로젝트 | P | S | R | 갱신 후보 |
|---|---|---|---|---|
| 한국 기술 마켓 | ⚠️ 약함 | ✅ | ✅ (Turborepo로 출시 속도 향상) | Phase 2 Q21에서 보강 |
| 교육 지원 플랫폼 | ✅ | ✅ | ✅ (50% 단축) | 갱신 불필요 |
| ... | ... | ... | ... | ... |
```

JD가 없으면 항목별 분해는 더 단순해집니다 (featured 30 / 최신성 30 / 임팩트 정량화 40).

### ✋ GATE 1

`AskUserQuestion`으로 사용자가 최종 작성할 항목을 다중 선택합니다. 도입부(motivation) 작성 여부도 함께 확인합니다.

```
질문: 어떤 항목을 포트폴리오에 작성하시겠습니까?
- [ ] (선택지로 위 5개 항목 + "도입부 함께 작성" 옵션 + "기타: 직접 입력")
- 기본 권장: 본인이 가장 자랑하고 싶은 3~4개 + 도입부
```

## Phase 2: 인터뷰 (Interview)

### 실행

선택된 항목을 한 번에 하나씩 순회합니다.

1. `references/interview-questions.md`를 Read로 로드. 4개 카테고리(앵커링·정량·의사결정·실패) 질문 풀에서 항목 특성에 맞게 3~5개를 선별합니다. "의사결정" 카테고리는 트레이드오프를 포함합니다 (전체 라벨: "의사결정·트레이드오프").

2. **앵커링 질문 우선**: about.md/projects.ts에서 추론된 정보로 변수를 채워 "이게 맞나요?" 형태로 시작. 예: "교육 지원 플랫폼은 8개월(2025.05~2026.01) 진행된 것으로 정리되어 있습니다. 이 기간 중 본인이 맡은 핵심 역할을 한 줄로 표현하면 어떻게 됩니까?"

3. **정량 질문 필수**: 결과 슬롯을 채울 수치 답변을 반드시 1개 이상 확보합니다. 답변이 비어 있으면 다른 카테고리로 넘어가지 말고 다른 표현으로 다시 묻습니다.

4. **AskUserQuestion 활용**: 객관식·다중 선택이 가능한 질문은 도구 사용. 자유 서술이 필요한 질문은 일반 텍스트.

5. 각 질문 답변을 받는 즉시 인터뷰 노트에 추가합니다.

6. 항목 인터뷰가 끝나면 `data/interviews/{프로젝트_슬러그}.md`로 저장. 저장 형식은 `references/interview-questions.md` 하단의 출력 형식 참조.

7. 다음 항목으로 진행. 모든 선택 항목이 끝날 때까지 반복.

### 슬러그 규칙

`{프로젝트명}` → 영문/한글 → kebab-case 변환. 예: "교육 지원 플랫폼" → `education-support-platform.md`. 충돌 시 날짜 suffix 추가.

### ✋ GATE 2

모든 인터뷰가 끝나면 사용자에게 노트 파일 경로를 제시하고 검토·편집 후 진행 승인을 요청합니다.

```
질문: 인터뷰 노트가 다음 위치에 저장되었습니다.
  - data/interviews/education-support-platform.md
  - data/interviews/kotech-market.md
  ...

직접 검토·편집 후 다음 단계(작성)로 진행할까요?
1. 진행 — Phase 3 작성 시작
2. 추가 인터뷰 — 특정 항목에 질문 더 필요
3. 종료 — 인터뷰 노트만 저장하고 종료 (재진입 시 노트 재사용 가능)
```

## Phase 3: 작성 (Drafting)

### 실행

선택 항목별로 `portfolio-strategist` 에이전트를 호출합니다. 도입부 작성이 선택되었으면 첫 호출에서 도입부도 함께 생성합니다.

```
Task 도구 사용:
- subagent_type: "portfolio-strategist"
- prompt: |
    다음 입력으로 포트폴리오 마크다운 섹션을 작성하세요.

    인터뷰 노트 경로: data/interviews/{프로젝트_슬러그}.md
    JD 컨텍스트: {JD 파싱 결과 요약 또는 "일반 시장 표준"}
    이력서 원문 한 줄: "{about.md에서 매칭되는 줄}"
    도입부 작성 여부: {true/false — 첫 항목일 때만 true}
    포트폴리오 전략 원칙: references/strategy.md
    작성 템플릿: references/templates.md

    출력은 마크다운 섹션만 반환하세요. 자가 검증 체크리스트를 출력 직전 모두 통과해야 합니다.
```

에이전트의 응답이 마크다운 섹션이 아닌 보고 메시지(인터뷰 보강 필요 등)면 사용자에게 그 메시지를 그대로 전달하고 결정을 요청합니다.

### Phase 3 → Phase 4 자동 진행

Phase 3에서 사용자 게이트는 두지 않습니다. 작성 직후 곧바로 Phase 4 평가가 시작됩니다 (재작성 루프가 자동 처리).

## Phase 4: 평가 (Review)

### 실행

작성된 마크다운에 대해 `portfolio-reviewer` 에이전트를 호출합니다.

```
Task 도구 사용:
- subagent_type: "portfolio-reviewer"
- prompt: |
    다음 마크다운을 평가하세요.

    평가 대상 마크다운:
    {Phase 3 출력}

    인터뷰 노트 경로: data/interviews/{프로젝트_슬러그}.md
    이력서 원문 한 줄: "{about.md에서 매칭되는 줄}"  ← 단어수 비율 계산에 사용
    JD 컨텍스트: {Phase 1 파싱 결과 5개 슬롯 또는 "미제공"}
      - 인재상 슬롯이 채워졌으면 동적 매칭 점검 활성화 (rubric 참조)
    평가자 시점: {hr | tech | both — --reviewer 옵션값}
    재작성 사이클: {1~3}
    평가 루브릭: references/review-rubric.md

    출력은 review-rubric.md의 출력 형식을 따르세요.
    출력에 "단어수 비율: 1:N (정상/복사 의심/장황 의심)" 라인 포함.
    인재상 슬롯이 채워진 경우 "인재상 매칭" 평가 라인도 포함.
```

### 재작성 루프

- 평가가 FAIL이면 Phase 3을 재실행. 단, prompt에 평가 피드백을 추가해 재작성을 유도합니다:
  ```
  이전 평가에서 다음 카테고리가 미통과되었습니다. 이 부분에 집중해 재작성하세요.
  - {미통과 카테고리}: {구체적 피드백}
  ```
- 최대 3회 반복. 3회 후에도 미통과 시 ✋ GATE 3에서 사용자 결정.

### ✋ GATE 3 (각 평가 사이클 후)

```
질문: 평가 결과는 다음과 같습니다.
{평가 결과 표}

다음 단계는?
1. PASS 시 → 자동으로 GATE 4로 진행
2. FAIL 1~2회차 → 자동 재작성 (사용자 알림만, 결정 불필요)
3. FAIL 3회차 → 사용자 결정 필수:
   a. 강제 진행하여 drafts/ 저장 (점수 낮아도 저장)
   b. 인터뷰 보강 후 처음부터 (Phase 2 재진입)
   c. 종료 (인터뷰 노트만 보존)
```

### ✋ GATE 4 (PASS 시)

```
질문: 작성이 완료되었습니다. 최종 마크다운을 검토해주세요.
{최종 마크다운 출력}

저장하시겠습니까?
1. 저장 — data/drafts/{프로젝트_슬러그}.md에 저장
2. 수정 — 사용자가 직접 코멘트 후 Phase 3 재실행
3. 폐기 — 저장하지 않고 종료
```

저장 후 사용자에게 다음 안내합니다:
- 저장 경로: `.claude/skills/portfolio-strategy/data/drafts/{프로젝트_슬러그}.md`
- 다음 단계: 사용자가 직접 `src/pages/portfolio.md`에 옮겨 다듬어 사용

## 출력 예시 (전체 흐름)

```
[Phase 1] 후보 5개 추출 완료. 우선순위 표 출력 → GATE 1
[Phase 1] 사용자: "교육 지원 플랫폼", "한국 기술 마켓" + 도입부 선택
[Phase 2] 교육 지원 플랫폼 인터뷰 시작 (4개 질문)
[Phase 2] data/interviews/education-support-platform.md 저장
[Phase 2] 한국 기술 마켓 인터뷰 시작 (4개 질문)
[Phase 2] data/interviews/kotech-market.md 저장 → GATE 2
[Phase 2] 사용자: 진행 승인
[Phase 3] portfolio-strategist 호출 (도입부 + 교육 지원 플랫폼)
[Phase 4] portfolio-reviewer 호출
[Phase 4] PASS (종합 84점) → GATE 3
[Phase 4] 사용자: 자동 진행
[Phase 3] portfolio-strategist 호출 (한국 기술 마켓)
[Phase 4] portfolio-reviewer 호출
[Phase 4] FAIL 1차 (구조 미통과 - 정량 지표 누락) → 자동 재작성
[Phase 3] 재작성
[Phase 4] PASS (종합 81점) → GATE 4
[Phase 4] 사용자: 저장
[완료] data/drafts/에 2개 파일 저장
```

## 참조 파일

이 스킬은 progressive disclosure 컨벤션을 따릅니다. 본 SKILL.md는 라우팅·오케스트레이션만 담당하고, 다음 4개 reference는 해당 Phase 진입 시점에만 Read로 로드합니다.

| Phase | 참조 파일 |
|---|---|
| Phase 1, 3, 4 (전략 원칙) | `references/strategy.md` |
| Phase 2 (인터뷰 진행) | `references/interview-questions.md` |
| Phase 3 (작성 템플릿) | `references/templates.md` |
| Phase 4 (평가 루브릭) | `references/review-rubric.md` |

## 하위 호환성과 도메인 분리

이 스킬은 다음 기존 스킬과 도메인이 구분됩니다.

- `/resume-specialist`: 이력서 압축 작성 (1~2 페이지 압축, ATS 키워드, STAR 메서드)
- `/blog-writer`: 블로그 글 작성 (자유 서사, 저자 스타일 학습)
- `/polish` / `/polish-file`: 작성된 글의 문장 다듬기

본 스킬이 만들어내는 것은 **인터뷰로 보강된 케이스 스터디**입니다. 이력서가 너무 압축되어 채용 담당자에게 임팩트 전달이 부족할 때 그 한 줄을 한 섹션으로 풀어내는 게 핵심 가치입니다.

## 데이터 안전성

- `src/pages/portfolio.md`를 자동으로 수정하지 않습니다. 항상 `data/drafts/`에 별도 저장.
- 인터뷰 노트는 Phase 2 종료 즉시 영속화되므로 Phase 3·4가 실패해도 사용자 답변이 유실되지 않습니다.
- 다음 회차에 동일 프로젝트로 다른 JD에 맞춰 작성할 때 인터뷰 노트가 있으면 Phase 2를 스킵 또는 부분 재실행 가능합니다 (변경된 부분만 추가 질문).

## 완료 출력

```
📝 포트폴리오 전략 스킬 완료
─────────────────────────────────────

✅ 선별 항목: {N}개
✅ 인터뷰 노트:
   - data/interviews/{slug-1}.md
   - data/interviews/{slug-2}.md
   ...
✅ 평가 통과 드래프트:
   - data/drafts/{slug-1}.md (점수 {N}/100, 사이클 {N}/3)
   - data/drafts/{slug-2}.md (점수 {N}/100, 사이클 {N}/3)

📊 평가 요약:
   - 평균 종합 점수: {N}/100
   - 첫 시도 PASS 비율: {N}/{N}

─────────────────────────────────────
💡 다음 단계: drafts/의 마크다운을 src/pages/portfolio.md에 옮겨 다듬어 사용
💡 같은 프로젝트로 다른 JD 변형 작성 시: 인터뷰 노트 재사용 가능
```
