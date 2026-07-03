# Translation Feedback Log

> 사용자 피드백 기록
> translation-learner 에이전트가 자동으로 업데이트합니다.

---

## 피드백 통계

- 총 피드백 수: 12
- 긍정 피드백: 12
- 부정 피드백: 0
- 승인된 번역: 12
- 거절된 번역: 0

---

## 피드백 이력

### 2026-07-03

**원문**: Vibe Coder vs Software Engineer (https://yusufaytas.com/vibe-coder-vs-software-engineer)

**번역 제목**: [번역] 바이브 코더 vs 소프트웨어 엔지니어

**유형**: 승인 (1차 검증 통과 후 polish 8건 적용, 수정 요청 없이 승인)

**모드**: thorough

**검토 점수**: Reviewer 8/10 (자연스러움 8·어휘 9·흐름 9·개발자맥락 8), Verifier 8.8/10 (의미 정확성 8.6·기술 정확성 9.5·뉘앙스 8.5) — 모든 하드 임계값 1차 통과

**체감 점수**: 미제공 (수정 요청 없이 바로 승인되어 calibration divergence 분석 대상 아님)

**검토 횟수**: 1회 (1차 PASS 후 polish 8건 적용 → 바로 승인)

**원문 특성**:
- **스타일**: 1인칭 개인 에세이 (개인 블로그, 저자 본인의 경험·의견 서술)
- **주제**: 바이브 코딩과 소프트웨어 엔지니어링의 여섯 가지 차이 — 측정 지표, 작업 단위, 소유권, 컨텍스트, 발견/딜리버리 경계, 견습
- **특징**: 저자 1인칭 "저" 화법, "안전한 머지까지 걸리는 시간(time to safe merge)" 프레임 반복, Zig 메인테이너 Andrew Kelley 인용, "컨트리뷰터 포커" 비유

**Polish에서 적용된 패턴 (8건)**:

| 패턴 번호 | 내용 | 적용 횟수 |
|-----------|------|-----------|
| #4 지시대명사 제거 | "그것은 ~뿐입니다" 3연속 반복 → 주어 구체화/생략 | 3회 |
| #11 존재하다→있다/없다 | 자연스러운 한국어 술어로 교체 | 2회 |
| #23 직역투(does X for me) | "저를 위해 더 나은 작업을 해냅니다" → "더 나은 결과를 내놓습니다" | 1회 |
| #19 문단 서두 접속어 생략 | "그리고" 생략 | 1회 |
| 표기 통일 | "컨텍스트 윈도" → "컨텍스트 윈도우" | 1회 |

**추출된 스타일 규칙**:

| 항목 | 패턴 | 지양 | 권장 |
|------|------|------|------|
| 지시대명사 반복 (3회+) | "그것은 ~뿐입니다" 연속 | 매 문장 동일 지시대명사로 시작 | 주어 구체화 또는 생략, 핵심어를 문두로 당겨오기 |
| does X for me 직역 | "저를 위해 ~해냅니다" | 수혜자 명시 직역 | "~을 내놓습니다/결과가 좋아집니다" (결과 중심 재구성) |
| 1인칭 개인 에세이 저자 voice | "저" (개인 저자) | "저희"(집단 어감이라 어색) | 기업 블로그 "저희"와 명확히 구분 |

**style-guide.md 업데이트**:
- "반드시 피해야 할 표현" 표에 2행 추가 (지시대명사 3회+ 반복, does X for me 직역)
- "§1 문체" 저자 voice 규칙을 기업 블로그("저희") vs 1인칭 개인 에세이("저") 구분으로 확장
- 학습된 패턴 히스토리에 2026-07-03 행 추가
- 분석 대상 샘플에 13번 추가 (1인칭 개인 에세이 스타일)
- 마지막 업데이트 날짜 2026-07-03으로 갱신

**glossary.md 업데이트 제안** (2026-07-03 사용자 승인으로 반영 완료):

| 원문 | 번역 | 비고 |
|------|------|------|
| time to safe merge | 안전한 머지까지 걸리는 시간(time to safe merge) | 저자 고유 지표 프레임, 첫 등장 시 괄호 병기 |
| vibe coding | 바이브 코딩 | 이미 통용 표기 확인 |
| vibe coder | 바이브 코더 | 이미 통용 표기 확인 |
| contributor poker | 컨트리뷰터 포커(contributor poker) | Kelley의 code review 비유, 괄호 병기 + 필요 시 함축 풀어쓰기("패를 하나씩 까 보이며 상대의 실력을 가늠하는 게임") |

**Calibration divergence**: 사용자가 체감 점수를 제공하지 않고 수정 요청 없이 바로 승인 → divergence 분석 해당 없음 (기록 생략)

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/13-vibe-coder-vs-software-engineer.md`

심링크 경로: `.claude/skills/translate-writer/data/samples/13-vibe-coder-vs-software-engineer.md` (mode 120000 확인)

---

### 2026-06-30

**원문**: Building an LLM safe design system (https://polar.sh/blog/orbit-llm-safe-design-system)

**번역 제목**: [번역] LLM도 벗어날 수 없는 디자인 시스템 만들기

**유형**: 승인

**모드**: thorough

**검토 점수**: Reviewer 8.2/10, Verifier(재검증) 8.5/10 (둘 다 PASS)

**체감 점수**: 미제공

**검토 횟수**: 2회 (Verifier 1차 후 재검증 요청 → 8.5로 PASS)

**최상위 교훈**: "의역이 더 좋아" — 사용자 명시 선호. 원문의 직역이 한국어 독자의 이해를 떨어뜨릴 때 의미를 명확히 푸는 의역 선호. 지시어가 가리키는 대상이 없어 끊겨 읽히는 문장은 도입어구·인용부호로 예시임을 드러낼 것.

**원문 특성**:
- **스타일**: 기술 설명 + 디자인 시스템 (Polar 엔지니어링 블로그)
- **주제**: Polar 팀의 LLM 시대 대응 디자인 시스템 Orbit — StyleX 기반 토큰 전용 API, 순수 div 금지, ESLint CI 강제화
- **특징**: "승부수(the bet)" 프레임 반복, 제약 설계 철학, 저자 voice "저희"

**추출된 스타일 규칙**:

| 항목 | 패턴 | 지양 | 권장 |
|------|------|------|------|
| in-the-loop 관용구 | "with an LLM in the loop" | "LLM이 참여해/함께" (약함) | "LLM을 개발 루프에 두고" |
| 주체 명시 (수동→능동) | "generated code" | "생성된 코드" (번역투) | "LLM이 짠 코드" |
| point of use (위치) | "the point of use" | "사용 시점" (시간 오독) | "그 값을 쓰는 자리" |
| way around (우회로) | "way around them" | "돌아갈 길" (오독) | "빠져나갈 구멍" (반복 시 "그 구멍"으로 호응) |
| open string surface | "open string surface" | "열린 문자열 표면" (직역 모호) | "아무 문자열이나 받아주던 열린 입구" |
| reach for (습관적 선택) | "reach for" | "집다" (어색) | "손이 가다" |
| defaults to path of least resistance | "defaults to..." | "기본 설정됩니다" (기계 어감) | "별수 없이 가장 손쉬운 길로 빠집니다" |
| styling pass | "second styling pass" | "스타일링 패스" (음차 모호) | "스타일을 두 번 입히는 과정" |
| opinionated convention | "opinionated convention" | "의견이 담긴 관례" (어색) | "저희 나름의 방침" |
| This flips (지시대명사) | "This flips who..." | "이것은 ~ 바꿉니다" | "이렇게 하면 ~ 뒤바뀝니다" |
| live with the output | "live with the output" | "결과물과 함께 사는 것" | "그 결과를 그대로 안고 가다" |
| contrapositive (논리) | "contrapositive" | "그 역"(오류), "그 반대편"(엄밀성 약화) | "거기서 따라오는 결론" |
| the bet (전략적 베팅) | "the bet" | "도박" (부정 어감) | "승부수" (한 문서 5곳+결말 일관) |
| the bet ~ is built on | "bet ~ is built on" | "승부수는 ~에 있습니다" (토대 소실) | "딛고 선 승부수" |
| make sure (능동) | "make sure the only things..." | "~것들뿐입니다" (make sure 소실) | "~만 CI를 통과하도록 해둘 뿐입니다" |
| 이중 주격 비문 | "버그가…표현 자체가" | 이중 주격 비문 | 한쪽을 주제 조사 "는"으로 |
| too small for X | "too small for X" | "X에는 너무 작다" (모호) | "X를 담아내기엔 너무 작다" |
| keep coming back to | "the one we keep coming back to" | "아이디어가 돌아옵니다" (주체 반전) | "늘 다시 붙드는 생각은 하나입니다" |
| 저자 voice | "we/our" | "우리/저희" 혼용 | "저희"로 통일 |
| 지시어 끊김 | "Cards sit on this surface. ..." | 끊겨 읽히는 예시 직번역 | 도입어구("이를테면") + 인용부호로 예시 드러내기 |

**style-guide.md 업데이트**:
- "반드시 피해야 할 표현" 표에 19행 추가 (LLM safe design system 세션 패턴)
- "의역(Paraphrasing)과 격언체 다루기" 표에 "지시어 없는 예시 나열" 행 추가
- "의미 강도 및 충실도 정정 패턴" 표에 "the bet" 2행 추가
- "구어·관용 표현" 표에 way around, the bet, opinionated convention 추가
- "의역 사용 시점 판단" 표에 "지시어 끊김" 행 추가
- "§9 의역 전략"에 "지시어 끊김 보정" 소섹션 추가
- "§1 문체"에 저자 voice "저희" 통일 원칙 추가
- "샘플에서 발견된 자연스러운 표현 패턴"에 2행 추가
- "원문 유지 용어"에 CSS light-dark(), StyleX, Box (Orbit) 추가
- "한글화 용어"에 design token, styling pass 추가
- "괄호 병기 패턴"에 polymorphic 추가
- 학습된 패턴 히스토리에 2026-06-30 행 추가
- 분석 대상 샘플에 12번 추가
- 마지막 업데이트 날짜 2026-06-30으로 갱신

**glossary.md 업데이트**:
- "의역 및 문체 관련 용어" 표: bet→승부수, escape hatch→탈출구, styling pass, opinionated convention, way around 추가
- "프레임워크/라이브러리" 표: StyleX 추가
- "고급 기술 용어" 표: polymorphic, design token, light-dark(), Box (Orbit) 추가
- 업데이트 기록에 2026-06-30 행 추가

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/12-llm-safe-design-system.md`

심링크 경로: `.claude/skills/translate-writer/data/samples/12-llm-safe-design-system.md` (mode 120000 확인)

---

### 2026-06-15

**원문**: Moving Railway's Frontend Off Next.js (https://blog.railway.com/p/moving-railways-frontend-off-nextjs)

**번역 제목**: [번역] Railway는 왜 프론트엔드를 Next.js에서 걷어냈나

**유형**: 승인

**모드**: thorough

**검토 점수**: Reviewer 8.2/10, Verifier 8.5/10 (둘 다 1차 PASS)

**체감 점수**: 미제공

**검토 횟수**: 1회 (1차 PASS 후 바로 승인)

**사용자 직접 수정 2건**:

1. **framework magic 음차 회피**
   - 원문: "framework magic"
   - 지양: "프레임워크 매직" (음차)
   - 권장: "프레임워크가 뒤에서 부리는 '마법'" / 대안: "암묵적 동작"
   - 패턴: 음차 대신 함축(숨은/암묵적 동작)을 풀어쓰기

2. **"타입 체크됩니다" Konglish 피동 → 능동화**
   - 원문: "are type-checked"
   - 지양: "타입 체크됩니다" (Konglish 피동)
   - 권장: "타입 검사를 거칩니다" (능동적 한국어)
   - 패턴: "체크" 음차 + 피동 동시 회피

**원문 특성**:
- **스타일**: 사례 분석 (Railway 엔지니어링 블로그, 스토리텔링 + 기술)
- **주제**: Railway 프론트엔드 팀의 Next.js → Vite/Nitro 마이그레이션 사례
- **특징**: 펀치라인 헤딩, 구어체, 내부 직원 인터뷰, 편집자 주(Ed:) 포함

**추출된 스타일 규칙**:

| 항목 | 내용 |
|------|------|
| **의미 강도 보존 (also helps)** | "It also helps that ~"는 부가 요인 → "게다가 ~점도 한몫했습니다" (필수 조건으로 격상 금지) |
| **"as a side effect"** | "덤으로" (부수적 이득 뉘앙스) |
| **"Next.js alone" / "stuck on"** | "오롯이 Next.js 몫" / "~에 발이 묶여" (의미 보존 숙어) |
| **수량 일치 검증** | "the following" + 불릿 N개 → 도입부 수량 표현과 반드시 일치 |
| **"everywhere else"** | 전면적 범위 유지 (축소 금지) |
| **강조어 보존** | nothing/just/every 탈락 금지 |
| **펀치라인 헤딩** | "served us well. Then it didn't." → "제 역할을 다했다. 그러다 아니게 됐다." (대구 유지) |
| **구어·관용** | war room → 워룸(war room), dogfood → 직접 사용해보다, (Ed:) → (편집자 주:) |
| **sponsor → 후원** | 외래어 "스폰서"보다 한국어 선호 |

**style-guide.md 업데이트**:
- "반드시 피해야 할 표현" 표에 2행 추가 (framework magic, Konglish 피동)
- "의미 강도 및 충실도 정정 패턴 (사례 분석 스타일)" 소섹션 신설
- "구어·관용 표현 (사례 분석 스타일)" 소섹션 신설
- 학습된 패턴 히스토리에 2026-06-15 행 추가
- 분석 대상 샘플에 11번 추가

**glossary.md 업데이트**:
- "의역 및 문체 관련 용어" 표: framework magic, sponsor, war room, dogfood 추가
- "고급 기술 용어" 표: Nitro, Fastly, content-hashed chunk, ecosystem 추가

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/11-railway-frontend-off-nextjs.md`

---


### 2026-02-20 14:00

**원문**: Reducing local dev time by 83%: Why we migrated off Next.js

**번역 제목**: [번역] 로컬 개발 시간 83% 단축: Next.js에서 벗어난 이유

**유형**: 승인 (최종 점수: ~9/10)

**검토 횟수**: 1회 (초기 승인)

**주요 수정 사항**:

본 번역은 완성도 높은 번역으로 승인되었으며, 이 과정에서 발견된 새로운 의역 패턴들이 스타일 가이드에 추가되었습니다.

#### 원문 특성
- **원문 스타일**: 기술 블로그 사례 분석 (스토리텔링 + 기술)
- **주제**: Inngest 팀의 Next.js → Tanstack Start 마이그레이션 사례
- **문장 길이**: 중간 길이, 자연스러운 톤의 기술 글

#### 번역 특징 및 승인된 주요 의역 패턴

1. **"compelling" 의역**
   - 원문: "At the time, the promise was compelling"
   - 번역: "당시로서는 혹할 만했습니다"
   - 패턴: compelling → 맥락에 따라 "혹할 만한", "설득력 있는" 선택
   - 교훈: 원문의 심리 상태를 더 생생하게 표현하는 의역

2. **"honeymoon period" 비유 번역**
   - 원문: "But the honeymoon didn't last"
   - 번역: "하지만 달콤한 시간은 오래가지 않았습니다"
   - 패턴: 영문 관용구를 한국 관용구로 번역
   - 교훈: 한국 독자에게 더 자연스러운 감정 표현

3. **격언체 명제의 풀어쓰기**
   - 원문: "When developer experience matters, having excited developers matters"
   - 번역: "개발자 경험을 중시한다면, 개발자가 쓰고 싶어하는 도구를 고르는 것도 중요합니다"
   - 패턴: 격언 형태의 추상적 명제 → 구체적 의미로 풀어쓰기
   - 교훈: 원문의 함축을 명확히 드러내면 독자 이해도 향상

4. **형용사 나열의 한 단어 압축**
   - 원문: "mysterious, confusing directives"
   - 번역: "아리송한 지시어"
   - 패턴: 여러 형용사를 한 단어로 축약
   - 교훈: 번역투 회피, 자연스러운 한국어 표현 선택

5. **부정 조건문의 역발상 의역**
   - 원문: "it is only worth investing in conversion-specific engineering... in very risk averse environments"
   - 번역: "즉, 대부분의 팀에게는 한 번에 밀어붙이는 게 낫습니다. 점진적 전환에 별도 투자할 가치는 극도로 보수적인 환경에서만 있습니다."
   - 패턴: 부정 조건 → 긍정 결론 먼저 제시 후 예외 설명
   - 교훈: 대다수 독자에게 먼저 긍정 메시지, 이후 제한 조건 설명으로 설득력 강화

#### 자동 적용된 주요 패턴 (41개 polish 수정)
- #7 ~의 과다 제거 (8회): "다른 스킬의 인정", "다른 도구의 지원" 등
- #1 피동태→능동태 (7회): "~되었다" → "~했다"
- #3 지시대명사 제거 (5회): "이것은/그것은" 제거
- #9 군더더기 제거 (6회): "실제로", "사실상" 등 불필요한 부사 제거
- #10 관료적 표현 순화 (5회): "~에 의해", "~되다" 구조 단순화

**점수 이력**:
- 초기 승인: ~9/10 (높은 완성도, 의역 전략 적절함)

**추출된 스타일 규칙**:

| 항목 | 내용 |
|------|------|
| **"compelling" 의역** | 맥락에 따라 "혹할 만한", "설득력 있는" 선택 |
| **"honeymoon period" 비유** | "달콤한 시간"으로 한국식 관용구 번역 |
| **격언체 명제** | 추상적 표현 → 구체적 의미로 풀어쓰기 |
| **형용사 나열** | 여러 형용사 → 한 단어 압축 ("아리송한") |
| **"prescriptive" (기술 맥락)** | "정해진", "명시적인" 등으로 선택 |
| **부정 조건 역발상** | 대다수 독자에게 먼저 긍정, 이후 제한 조건 |
| **"brute force" 의역** | "한 번에 밀어붙이기", "전면 전환" 등 숙어로 번역 |

**style-guide.md 업데이트**:

새로운 섹션 추가: "9. 의역 전략 (Paraphrasing Strategy)"

```diff
+ ## 9. 의역 전략 (Paraphrasing Strategy)
+
+ ### 원문의 함축을 명확하게 드러내기
+
+ **원칙**: 원문의 약간의 모호성이나 함축을 한국 독자에게 명확하게 풀어낼 수 있다면, 그렇게 해야 한다.
+
+ #### 격언체와 일반화된 명제
+ #### 비유와 감정 표현
+ #### 형용사 나열을 의미 축약으로 변환
+ #### 부정 조건을 역발상으로 표현
```

새로운 패턴을 "반드시 피해야 할 표현" 섹션에 추가:

```diff
+ ### 의역(Paraphrasing)과 격언체 다루기
+
+ | 원문 스타일 | 자연스러운 번역 | 예시 |
+ |-----------|----------------|------|
+ | "compelling" (설득력/매력) | 맥락에 따라 "혹할 만했다", "설득력 있었다" | ❌ compelling한 약속 → ✅ 혹할 만했습니다 |
+ | "honeymoon period" (신혼기간의 비유) | "달콤한 시간" (관용구로 번역) | ❌ honeymoon didn't last → ✅ 달콤한 시간은 오래가지 않았습니다 |
+ | 격언체 명제 | 풀어쓰기 또는 원문의 함축 명확화 | ❌ When developer experience matters, having excited developers matters → ✅ 개발자 경험을 중시한다면, 개발자가 쓰고 싶어하는 도구를 고르는 것도 중요합니다 |
+ | 형용사 나열 (arioso, confusing) | 한 단어로 압축 또는 원문 구조 유지 | ❌ "아리송한 지시어와 혼란스러운 경계" → ✅ "아리송한 지시어를 버리고" (부정→긍정 역발상) |
+ | "prescriptive" (기술 문맥) | "정해진", "명시적인", "규정된" (문맥에 따라) | ❌ prescriptive data loader approach → ✅ 정해진 데이터 로딩 방식 |
+ | 부정 조건문 (risk averse only) | 부정→긍정 역발상 의역 | ❌ only worth... in risk averse environments → ✅ 극도로 보수적인 환경에서만 (먼저 대다수는 아니라고 명시) |
+ | 단축형 표현 (brute force migration) | 문맥에 맞는 한글 숙어 | ❌ brute force approach → ✅ 한 번에 밀어붙이기 |
```

**용어집 업데이트 제안**:

| 원문 | 번역 | 비고 |
|------|------|------|
| compelling | 혹할 만한 / 설득력 있는 | 맥락에 따라 선택 |
| honeymoon period | 달콤한 시간 | 관용구 번역 |
| prescriptive | 정해진 / 명시적인 | 기술 맥락 |
| risk averse | 보수적인 / 리스크를 꺼리는 | 문맥에 따라 |
| brute force (migration) | 한 번에 밀어붙이기 / 전면 전환 | 마이그레이션 맥락 |
| Tanstack Start | Tanstack Start | 원문 유지 |
| Deno Fresh | Deno Fresh | 원문 유지 |

**분석 대상 샘플 추가**:
- `10-inngest-migrating-off-nextjs-tanstack-start.md` - 사례 분석 스타일

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/10-inngest-migrating-off-nextjs.md`

---

### 2026-02-11 02:49

**원문**: Making agent-friendly pages with content negotiation

**번역 제목**: [번역] 콘텐츠 협상으로 에이전트 친화적인 페이지 만들기

**유형**: 승인 (최종 점수: ~8.5/10)

**검토 횟수**: 1회 (초기 승인)

**주요 수정 사항**:

본 번역은 완성된 번역으로 승인되었으며, 이 과정에서 발견된 새로운 번역 패턴들이 스타일 가이드에 추가되었습니다.

#### 원문 특성
- **원문 스타일**: 기술 설명 문서 (Vercel 공식 블로그)
- **주제**: HTTP 콘텐츠 협상을 통한 에이전트 최적화 기술
- **문장 길이**: 중간~긴 문장이 많음

#### 번역 특징
1. **역주 활용**
   - RFC 7231 표준 설명 역주 추가
   - 콘텐츠 협상 개념을 한국 독자에게 설명
   - 패턴: HTTP 표준 용어는 역주로 기술적 배경 제공

2. **동사 선택의 다양성**
   - "보여줍니다" → "내보냅니다", "담습니다" (문맥에 따라 구분)
   - "접근하다" → "얻다" (기술 문맥에서 더 명확한 의미)
   - 패턴: 같은 동사 반복 회피, 문맥에 맞는 구체적 동사 선택

3. **관계절 제거로 명확성 향상**
   - 원문: 긴 관계절이 있는 복잡한 구조
   - 번역: "Next.js 라우트 핸들러가 Contentful 콘텐츠를 마크다운으로 변환합니다"
   - 패턴: 주어를 명시하여 누가 무엇을 하는지 명확하게 함

**추출된 스타일 규칙**:

| 항목 | 내용 |
|------|------|
| **"보여줍니다" 과다 사용 방지** | 문맥에 맞는 동사 선택 ("내보냅니다", "담습니다", "제공합니다") |
| **"접근하다" 문맥 구분** | 기술 문맥에서는 "얻다"로, 물리적 접근은 "접근하다" 사용 |
| **관계절 제거로 명확성 강화** | 복잡한 관계절은 주어를 명시하여 동격으로 표현 |
| **역주 추가 규칙** | RFC 표준, HTTP 개념 등 기술 배경이 필요한 용어는 역주로 설명 |

**style-guide.md 업데이트**:

새로운 패턴을 "반드시 피해야 할 표현" 섹션에 추가:

```diff
+ | "보여줍니다" (과다) | 문맥에 맞는 동사 | ❌ 결과를 보여줍니다 → ✅ 결과를 내보냅니다/담습니다 |
+ | "접근하다" (과다) | "얻다", "접근하다" (상황에 맞게) | ❌ 마크다운에 접근할 수 있다 → ✅ 마크다운을 얻을 수 있다 |
```

새로운 섹션 추가: "8. 문장 구조 및 연결" → "관계절과 동격 표현"

```diff
+ ### 관계절과 동격 표현
+ - **기술 문맥에서는 동격을 명확히**: 관계절 제거로 간결화
+ - ❌ "Next.js 라우트 핸들러로 요청을 전달하는 Contentful 콘텐츠를 마크다운으로 변환합니다"
+ - ✅ "Next.js 라우트 핸들러가 Contentful 콘텐츠를 마크다운으로 변환합니다" (주어 명확화)
```

새로운 섹션 추가: "10. 역주(Translator's Note) 규칙"

```diff
+ ## 10. 역주(Translator's Note) 규칙
+
+ ### 역주 추가 시점
+ - **개념 설명 필요**: 한국 독자에게 낯선 기술 용어나 표준을 소개할 때
+ - **문화적 배경**: 원문의 비유나 사례가 한국 독자에게 낯설 때
+ - **번역 선택 설명**: 특정 용어를 의도적으로 번역하거나 원문 유지한 이유 설명
+
+ ### 역주 형식
+ ```markdown
+ > **역주**: [설명 내용]
+ ```
```

**용어집 업데이트 제안**:

| 원문 | 번역 | 비고 |
|------|------|------|
| Content Negotiation | 콘텐츠 협상 | HTTP 표준 메커니즘 |
| Changelog | 변경 내역 | 버전 기록 |

**점수 이력**:
- 초기 승인: ~8.5/10 (완성도 높음, 기술 정확성 우수)

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/09-agent-friendly-content-negotiation.md`

---

### 2026-02-07 00:40

**원문**: The Complete Guide to Building Skills for Claude (Part 6: Resources and References)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 6부: 리소스와 레퍼런스

**유형**: 승인 (Phase 2 review + Phase 3 polish 후)

**검토 횟수**: 2회 (Phase 2 review: 7→8.5/10 → Phase 3 polish 8문장 개선)

**주요 수정 사항**:

#### Phase 2 Review (기술 검토) - 12개 수정
1. "다루는 마지막 파트" → "마지막 파트로, 정리합니다" (번역투 제거)
2. "필요에 맞춰" → "필요할 때" (자연스러운 표현)
3. "커스터마이징할 수 있습니다" → "자유롭게 수정해서 쓸 수 있습니다" (외래어→한국어)
4. "설명만으로 스킬을 생성할 수 있습니다" → "설명만 주면 스킬을 자동으로 만들어줍니다" (능동적 표현)
5. "업로드 전후로 스킬을 검증할 때" → "스킬을 업로드하기 전후에" (문장 구조 개선)
6. "빠르게 시작하고 싶다면" → "빠르게 시작하려면" (조건절 간소화)
7. "이 목록을 확인하며 누락 사항이 없는지 점검하세요" → "이 목록으로 빠진 부분이 없는지 확인하세요" (동사 중복 제거)
8. "포함 사항" → "포함할 내용" (자연스러운 표현)
9. "식별" → "정리"/"파악" (번역투 제거)
10. "폴더명이 kebab-case로 작성됨" → "폴더명이 kebab-case" (간결화)
11. "이 가이드의 패턴을 보여주는" → "이 가이드에서 다룬 패턴을 실제로 구현한" (구체화)
12. "지속적으로 업데이트되며" → "계속 업데이트되며", "레포지토리" → "저장소", "활용하세요" → "쓰세요" (간결화, 외래어→한국어)

**점수 이력**:
- Phase 2 Review: 8.5/10 → 통과
- Phase 3 Polish: 8개 문장 개선
- 최종 승인

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/08-claude-skills-guide-part-6.md`

---

### 2026-02-07 15:15

**원문**: The Complete Guide to Building Skills for Claude (Part 5: Patterns and Troubleshooting)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 5부: 패턴과 트러블슈팅

**유형**: 승인 (Phase 2 review + Phase 3 polish 후)

**검토 횟수**: 2회 (Phase 2 review: 7→8/10 → Phase 3 polish 11문장 분석, 9개 개선)

**점수 이력**:
- Phase 2 Review 1차: 7/10
- Phase 2 Review 2차: 8/10 (11개 수정 후)
- Phase 3 Polish: 11문장 분석, 9개 개선 + 1건 사용자 수정
- 최종 승인

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/07-claude-skills-guide-part-5.md`

---

### 2026-02-07 11:30

**원문**: The Complete Guide to Building Skills for Claude (Part 4: Distribution and Sharing)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 4부: 배포와 공유

**유형**: 승인 (Phase 2 review + Phase 3 polish 후)

**검토 횟수**: 2회 (Phase 2 review: 9/10 → Phase 3 polish 최종 승인)

**점수 이력**:
- Phase 2 Review: 9/10 (기술적 정확성)
- Phase 3 Polish: 4개 문장 개선 후 최종 승인
- 최종 품질 점수: 9.5/10

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/20260207-claude-skills-guide-part-4.md`

---

### 2026-02-07 06:39

**원문**: The Complete Guide to Building Skills for Claude (Part 3: Testing and Iteration)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 3부: 테스트와 반복

**유형**: 승인 (2차 polish 후)

**검토 횟수**: 3회 (Review 1차: 7/10 → Review 2차: 7.5/10 → Polish Round 1 → Polish Round 2 + 사용자 피드백 → 승인)

**점수 이력**:
- Review 1차: 7/10
- Review 2차: 7.5/10 (수동 수정 후)
- Polish Round 1: 10문장 개선
- Polish Round 2: 6문장 개선 + 사용자 피드백 1건
- 최종 승인

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/20260207-claude-skills-guide-part-3.md`

---

### 2026-02-06 15:00

**원문**: The Complete Guide to Building Skills for Claude (Part 1: Introduction and Fundamentals)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 1부: 소개와 기본 개념

**유형**: 승인 후 직접 수정 (7건 수정사항)

**점수 이력**:
- 초기 점수: 8.5/10
- 최종 점수: 8.5/10 (사용자 직접 수정으로 완성도 향상)

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/20260206-claude-skills-guide-part-1.md`

---

### 2026-02-06 14:30

**원문**: The Complete Guide to Building Skills for Claude (Part 2: Planning and Design)

**번역 제목**: [번역] Claude 스킬 구축 완벽 가이드 - 2부: 계획과 설계

**유형**: 승인 (최종 점수: 8/10)

**검토 횟수**: 1회 (초기 점수 8/10)

**점수 이력**:
- 초기 점수: 8/10
- 최종 점수: 8/10

**승인된 번역 저장**:

저장 경로: `.claude/skills/translate-writer/data/approved-posts/20260206-claude-skills-guide-part-2.md`

---

## 자주 등장하는 피드백 패턴

| 피드백 유형 | 빈도 | 적용된 규칙 |
|-------------|------|-------------|
| 의역 전략 (격언, 비유, 부정조건, 지시어 끊김) | 높음 | "9. 의역 전략" 섹션 + 지시어 끊김 보정 추가 |
| in-the-loop 등 관용구 직역 회피 | 높음 (신규) | "반드시 피해야 할 표현" 표 확충 |
| 수동형 번역투 (generated code 등) | 높음 (신규) | 주체 명시 능동화 패턴 추가 |
| "승부수" vs "도박" 단어 선택 | 중간 (신규) | glossary + style-guide 동시 반영 |
| 저자 voice "저희" 통일 | 중간 (신규) | "§1 문체" 원칙 추가 |
| "~경우" 제거 | 높음 | 반드시 피해야 할 표현에 추가 |
| "제공하다" 대체 | 중간 | 스타일 가이드 확충 |
| 긴 관계절 간결화 | 중간 | 구조 규칙에 반영 |
| "이들은/이것은" 제거 | 중간 | 반드시 피해야 할 표현에 추가 |
| 진행형 간결화 | 중간 | 번역투 회피 패턴에 추가 |
| 문장 병합 | 중간 | 새로운 섹션 추가 |
| 외래어→한국어 선호 | 높음 | 새로운 섹션 추가 |
| 동사 선택 다양성 | 낮음 | "보여줍니다", "접근하다" 문맥 구분 |
| 역주 활용 | 낮음 | 새로운 규칙 섹션 추가 |

---

## 승인된 번역 목록

| 날짜 | 원문 | 번역 제목 | 최종 점수 |
|------|------|----------|-----------|
| 2026-02-06 | The Complete Guide to Building Skills for Claude (Part 1) | [번역] Claude 스킬 구축 완벽 가이드 - 1부 | 8.5/10 |
| 2026-02-06 | The Complete Guide to Building Skills for Claude (Part 2) | [번역] Claude 스킬 구축 완벽 가이드 - 2부 | 8/10 |
| 2026-02-07 | The Complete Guide to Building Skills for Claude (Part 3) | [번역] Claude 스킬 구축 완벽 가이드 - 3부 | 승인 |
| 2026-02-07 | The Complete Guide to Building Skills for Claude (Part 4) | [번역] Claude 스킬 구축 완벽 가이드 - 4부 | 9.5/10 |
| 2026-02-07 | The Complete Guide to Building Skills for Claude (Part 5) | [번역] Claude 스킬 구축 완벽 가이드 - 5부 | 승인 |
| 2026-02-07 | The Complete Guide to Building Skills for Claude (Part 6) | [번역] Claude 스킬 구축 완벽 가이드 - 6부 | 승인 |
| 2026-02-11 | Making agent-friendly pages with content negotiation | [번역] 콘텐츠 협상으로 에이전트 친화적인 페이지 만들기 | ~8.5/10 |
| 2026-02-20 | Reducing local dev time by 83%: Why we migrated off Next.js | [번역] 로컬 개발 시간 83% 단축: Next.js에서 벗어난 이유 | ~9/10 |
| 2026-06-15 | Moving Railway's Frontend Off Next.js | [번역] Railway는 왜 프론트엔드를 Next.js에서 걷어냈나 | R 8.2 / V 8.5 |
| 2026-06-30 | Building an LLM safe design system | [번역] LLM도 벗어날 수 없는 디자인 시스템 만들기 | R 8.2 / V 8.5 |
| 2026-07-03 | Vibe Coder vs Software Engineer | [번역] 바이브 코더 vs 소프트웨어 엔지니어 | R 8.0 / V 8.8 |

---

## 용어집 업데이트 이력

| 날짜 | 원문 | 번역 | 제안자 | 반영 여부 |
|------|------|------|--------|----------|
| 2026-02-06 | dependency | 의존성 | translation-learner | 반영 완료 |
| 2026-02-07 | suite | 모음 | translation-learner | 반영 완료 |
| 2026-02-07 | nuance | 맥락/의미/어감 | translation-learner | 반영 완료 |
| 2026-02-11 | Content Negotiation | 콘텐츠 협상 | translation-learner | 반영 완료 |
| 2026-02-11 | changelog | 변경 내역 | translation-learner | 반영 완료 |
| 2026-02-20 | compelling | 혹할 만한 / 설득력 있는 | translation-learner | 반영 완료 |
| 2026-02-20 | honeymoon period | 달콤한 시간 | translation-learner | 반영 완료 |
| 2026-02-20 | prescriptive | 정해진 / 명시적인 | translation-learner | 반영 완료 |
| 2026-02-20 | risk averse | 보수적인 / 리스크를 꺼리는 | translation-learner | 반영 완료 |
| 2026-02-20 | brute force (migration) | 한 번에 밀어붙이기 / 전면 전환 | translation-learner | 반영 완료 |
| 2026-06-15 | framework magic | 프레임워크가 뒤에서 부리는 '마법' / 암묵적 동작 | translation-learner | 반영 완료 |
| 2026-06-15 | sponsor | 후원 | translation-learner | 반영 완료 |
| 2026-06-15 | war room | 워룸(war room) | translation-learner | 반영 완료 |
| 2026-06-15 | dogfood | 직접 사용해보다 / 도그푸딩 | translation-learner | 반영 완료 |
| 2026-06-15 | Nitro, Fastly, content-hashed chunk, ecosystem | (각 항목 참조) | translation-learner | 반영 완료 |
| 2026-06-30 | bet | 승부수 | translation-learner | 반영 완료 |
| 2026-06-30 | escape hatch | 탈출구 | translation-learner | 반영 완료 |
| 2026-06-30 | styling pass | 스타일을 입히는 과정 | translation-learner | 반영 완료 |
| 2026-06-30 | opinionated convention | 저희 나름의 방침 | translation-learner | 반영 완료 |
| 2026-06-30 | way around | 빠져나갈 구멍 / 우회로 | translation-learner | 반영 완료 |
| 2026-06-30 | polymorphic | 다형적(polymorphic) | translation-learner | 반영 완료 |
| 2026-06-30 | design token | 디자인 토큰 | translation-learner | 반영 완료 |
| 2026-06-30 | light-dark() | light-dark() (원문 유지) | translation-learner | 반영 완료 |
| 2026-06-30 | Box (Orbit) | Box (원문 유지) | translation-learner | 반영 완료 |
| 2026-06-30 | StyleX | StyleX (원문 유지) | translation-learner | 반영 완료 |
| 2026-07-03 | time to safe merge | 안전한 머지까지 걸리는 시간(time to safe merge) | translation-learner | 반영 완료 |
| 2026-07-03 | vibe coding / vibe coder | 바이브 코딩 / 바이브 코더 | translation-learner | 반영 완료 |
| 2026-07-03 | contributor poker | 컨트리뷰터 포커(contributor poker) | translation-learner | 반영 완료 |

---

✅ **마지막 업데이트**: 2026-07-03 KST
