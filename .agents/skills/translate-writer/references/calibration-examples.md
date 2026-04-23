# 평가자 Calibration 예시

> 이 파일은 reviewer와 verifier가 채점 시 참조하는 기준 예시입니다.
> **채점 전에 반드시 이 예시를 읽고 자신의 채점 기준을 조율하세요.**

---

## 점수 인플레이션 경고

번역 평가에서 가장 흔한 함정은 **"문제를 발견하고도 별 것 아니라고 스스로를 설득하는 것"**입니다. 이 패턴은 다음과 같이 나타납니다:

1. "~에 의해 개발되었다"를 발견했지만, "의미는 맞으니까 넘어가자" → 수동태(#3)는 한국어에서 부자연스럽습니다. 발견 즉시 감점해야 합니다.
2. "활용하다"가 3번 나왔지만, "기술 문서니까 이 정도는 괜찮다" → #8 어휘 과다에 해당합니다. 2회 이상이면 감점 사유입니다.
3. "또한"으로 시작하는 문장이 5개인데, "연결이 자연스러우니까 OK" → #18 접속사 과다입니다. 문서당 2-3회 이하가 기준입니다.

**핵심 원칙**: 번역투 패턴 하나를 발견할 때마다 "이게 원어민이 쓸 문장인가?"를 자문하세요. 원어민이 쓰지 않을 표현이라면 감점입니다.

---

## Reviewer Calibration (한국어 품질)

### 9점 예시: 거의 원어민 수준

**장르**: 사례 분석 (Inngest 마이그레이션)

**원문** (영어):
> At the time, the promise was compelling: escape the blank loading screens and network waterfalls of SPAs, get nested layouts and streaming as defaults, and unify on a single framework. But the honeymoon didn't last. Next.js is optimized for a specific workflow — dedicated frontend teams working full-time with the framework. For our small team where most engineers wear multiple hats, the cognitive load was punishing.

**번역**:
> 당시로서는 혹할 만했습니다. SPA의 빈 로딩 화면과 네트워크 워터폴에서 벗어나고, 중첩 레이아웃과 스트리밍이 기본으로 지원되며, 단일 프레임워크로 통합하는 거였죠. 하지만 달콤한 시간은 오래가지 않았습니다. Next.js는 특정 워크플로우에 최적화되어 있습니다 — 프레임워크에 풀타임으로 집중하는 전담 프론트엔드 팀 말입니다. 대부분의 엔지니어가 여러 역할을 겸하는 소규모 팀인 우리에게 인지 부하는 가혹했습니다.

**점수**: 9/10

**근거**:
- 번역투 0건. 수동태, "~것이 가능하다", "~의" 과다 등 28개 패턴 중 해당 사항 없음
- "compelling" → "혹할 만했습니다"로 원문의 심리적 뉘앙스를 살린 의역이 탁월함
- "honeymoon didn't last" → "달콤한 시간은 오래가지 않았습니다"로 영어 관용구를 한국어 감성에 맞게 변환
- "cognitive load was punishing" → "인지 부하는 가혹했습니다"로 강도를 정확히 전달
- 문장 길이와 호흡이 한국어 독자에게 자연스러움

**왜 10점이 아닌지**:
- "단일 프레임워크로 통합하는 거였죠"에서 "거였죠"가 약간 구어체로 치우침. 블로그 톤에 적합하지만, "것이었습니다" 정도의 톤 일관성을 유지할 수도 있음

---

### 9점 예시: 거의 원어민 수준

**장르**: 기술 에세이 (콘텐츠 협상)

**원문** (영어):
> Agents browse the web, but they read differently than humans. They don't need CSS, client-side JavaScript, or images. Unnecessary markup fills up context windows and burns tokens without adding useful information. What agents need is clean, structured text.

**번역**:
> 에이전트는 웹을 탐색하지만, 사람과는 다르게 읽습니다. CSS, 클라이언트 사이드 JavaScript, 이미지가 필요하지 않습니다. 불필요한 마크업은 컨텍스트 윈도우를 채우고 유용한 정보 없이 토큰만 소비합니다. 에이전트에게는 깔끔하고 구조화된 텍스트만 필요합니다.

**점수**: 9/10

**근거**:
- 번역투 0건. "이것은"(#4)으로 시작하지 않고 주어를 구체화함
- "burns tokens" → "토큰만 소비합니다"로 간결하게 전달
- 두 번째 문장에서 "They"를 번역하지 않고 자연스럽게 주어 생략 (한국어답게 처리)
- 기술 용어(CSS, JavaScript, 컨텍스트 윈도우)를 적절히 원문 유지

**왜 10점이 아닌지**:
- "구조화된"이 약간 번역체 느낌. "잘 정리된 텍스트" 정도가 더 자연스러울 수 있음

---

### 8점 예시: 좋지만 개선 여지

**장르**: 튜토리얼/가이드 (Claude 스킬 가이드 1부)

**원문** (영어):
> Skills are a collection of instructions that teach Claude how to handle specific tasks or workflows. They come as simple folders. Skills are one of the most powerful ways to customize Claude for your specific needs. Instead of re-explaining your preferences, processes, and domain expertise in every conversation, skills let you teach Claude once and have it apply that knowledge going forward.

**번역**:
> 스킬은 Claude에게 특정 작업이나 워크플로우를 처리하는 방법을 가르치는 지시사항 모음입니다. 간단한 폴더 형태로 구성됩니다. 스킬은 Claude를 특정 요구사항에 맞춰 커스터마이징하는 가장 강력한 방법 중 하나입니다. 매번 대화마다 선호사항, 프로세스, 도메인 전문지식을 다시 설명하는 대신, 스킬을 사용하면 Claude에게 한 번만 가르치면 이후 계속 활용할 수 있습니다.

**점수**: 8/10

**근거**:
- 전반적으로 정확하고 읽기 좋은 번역
- 문장 구조가 명확하고 기술 내용 전달이 정확함
- 번역투 1건 발견: "활용할 수 있습니다"(#8) → "쓸 수 있습니다"가 더 자연스러움
- "커스터마이징하는"은 외래어지만 기술 맥락에서 허용 범위 (#26 기술 용어 과번역 방지와 균형)

**왜 9점이 아닌지**:
- "활용할 수 있습니다"(#8)가 1건 있음
- "선호사항, 프로세스, 도메인 전문지식"에서 외래어가 3개 연속으로 나열되어 약간 딱딱함. "선호하는 방식, 작업 절차, 전문 지식" 정도로 풀어쓸 수 있음
- "가장 강력한 방법 중 하나입니다"는 영어 "one of the most powerful"의 직역에 가까움

---

### 7점 예시: 보통 — 번역투가 느껴짐

**장르**: 튜토리얼/가이드 (Claude 스킬 가이드 6부 — 수정 전 버전 재구성)

**원문** (영어):
> This document is the last part of the guide, covering resources and references. You can customize skills to fit your needs. The skill-creator can generate skills from just a description. Use this checklist to verify that there are no missing items before and after uploading skills. Start by checking the best practices guide to identify any gaps.

**번역 (수정 전 재구성)**:
> 이 문서는 가이드에서 다루는 마지막 파트로, 리소스와 레퍼런스에 대해 다룹니다. 필요에 맞춰 스킬을 커스터마이징할 수 있습니다. skill-creator는 설명만으로 스킬을 생성할 수 있습니다. 스킬을 업로드 전후로 스킬을 검증할 때 이 목록을 확인하며 누락 사항이 없는지 점검하세요. 모범 사례 가이드를 확인하여 식별할 수 있는 차이점을 시작하세요.

**점수**: 7/10

**근거 — 발견된 번역투 패턴**:
- #24 "~에 대해" 과다: "리소스와 레퍼런스에 대해 다룹니다" → "리소스와 레퍼런스를 정리합니다"
- #8 "활용하다" 계열: "커스터마이징할 수 있습니다" → "자유롭게 수정해서 쓸 수 있습니다" (외래어 풀어쓰기)
- #3 수동태/어색한 구문: "설명만으로 스킬을 생성할 수 있습니다" → "설명만 주면 스킬을 자동으로 만들어줍니다" (능동적 표현)
- #14 "확인하다" 남발: "확인하며", "점검하세요"가 한 문장에 동시 등장 → "이 목록으로 빠진 부분이 없는지 확인하세요"
- 번역투 패턴 4건 발견으로 8점 미달

**왜 8점이 아닌지**:
- 번역투 패턴이 4건 이상 발견됨
- 마지막 문장("식별할 수 있는 차이점을 시작하세요")이 의미가 불명확함
- 전반적으로 원문 구조에 끌려가는 느낌이 강함

---

### 6점 예시: 미달 — 상당한 수정 필요

**장르**: 사례 분석 (Inngest 마이그레이션 — 번역투 재삽입 가공)

**원문** (영어):
> We tried upgrading Next.js and using Vercel's profiling tools. It didn't make much difference. So we tried Turbopack. Twice, actually. It was never a trivial undertaking for a codebase our size. Each time required dependency upgrades and refactoring. On top of that, Vercel only supported Webpack for production builds at the time, creating a split between local dev and production environments.

**번역 (번역투 재삽입 가공)**:
> 상황을 개선하기 위해서 Next.js를 업그레이드하는 것을 진행하였고 Vercel에 의해 제공되는 프로파일링 도구를 활용하였습니다. 그러나 이것은 큰 차이를 만들지 못했습니다. 따라서 Turbopack을 시도하는 것을 진행했습니다. 사실 두 번이나요. 우리의 규모의 코드베이스에서는 이것은 결코 사소한 작업이 아니었습니다. 각 시도의 경우 의존성 업그레이드와 리팩토링이 필요했습니다. 또한, 당시 Vercel은 프로덕션 빌드에서 Webpack만을 지원하는 것에 의해 로컬 개발 환경과 프로덕션 환경 사이의 분리가 존재했습니다.

**점수**: 6/10

**근거 — 발견된 번역투 패턴**:
- #6 "~하기 위해서" 반복: "개선하기 위해서"
- #9 "진행하다" 과다: "업그레이드하는 것을 진행하였고", "시도하는 것을 진행했습니다" (2회)
- #3 수동태 "~에 의해": "Vercel에 의해 제공되는", "지원하는 것에 의해"
- #8 "활용하다": "활용하였습니다"
- #4 "이것은" 지시대명사: "이것은 큰 차이를", "이것은 결코" (2회)
- #16 "그러나" 과다 + #17 "따라서" 과다: 연이어 사용
- #15 "경우" 과다: "각 시도의 경우"
- #22 "~의" 과다: "우리의 규모의 코드베이스에서는"
- #11 "존재하다": "분리가 존재했습니다"
- #18 "또한" 문장 시작: "또한, 당시~"
- 번역투 패턴 10건 이상 발견. 하드 임계값(8점 = 번역투 2건 이하) 크게 미달

**왜 7점이 아닌지**:
- 번역투가 거의 모든 문장에 존재 (6문장 중 5문장)
- 수동태, 지시대명사, "진행하다" 등 심각한 패턴이 중첩
- 원문의 간결한 톤("Twice, actually.")이 완전히 소실됨

---

## Verifier Calibration (원문 충실도)

### 9점 예시: 원문과 거의 완벽 대응

**장르**: 사례 분석 (Inngest 마이그레이션)

**원문** (영어):
> When developer experience matters, having excited developers matters. The brute force approach creates enormous PRs, but we accepted that tradeoff and leaned into thorough user acceptance testing instead. It is only worth investing in conversion-specific engineering in very risk averse environments.

**번역**:
> 개발자 경험을 중시한다면, 개발자가 쓰고 싶어하는 도구를 고르는 것도 중요합니다. 전면 전환은 거대한 PR을 만들지만, 우리는 이 트레이드오프를 받아들이고, 대신 철저한 사용자 수용 테스트에 의존했습니다. 즉, 대부분의 팀에게는 한 번에 밀어붙이는 게 낫습니다. 점진적 전환에 별도 투자할 가치는 극도로 보수적인 환경에서만 있습니다.

**점수**: 9/10

**근거**:
- 원문의 핵심 메시지 3가지(DX 중시, 전면 전환의 트레이드오프, 점진적 전환의 제한적 가치)가 모두 정확히 전달됨
- "brute force" → "전면 전환" / "한 번에 밀어붙이는"으로 맥락에 맞는 의역
- "risk averse" → "극도로 보수적인"으로 뉘앙스 보존
- "excited developers" → "개발자가 쓰고 싶어하는 도구를 고르는 것"으로 원문의 함축을 명확하게 풀어씀
- 부정 조건문("only worth ... in very risk averse")을 긍정 결론 먼저 제시 후 예외 설명으로 재구성 — 의미 보존 우수

**왜 10점이 아닌지**:
- "having excited developers matters"의 "excited"가 "쓰고 싶어하는"으로 의역됨. 원문은 "흥분한/열정적인 개발자를 갖는 것"이라는 더 넓은 의미인데, 번역은 "도구 선택"으로 범위를 좁힘. 의미적으로 합리적인 해석이지만 원문과 1:1 대응은 아님

---

### 7점 예시: 뉘앙스 소실

**장르**: 튜토리얼/가이드 (Claude 스킬 가이드 2부)

**원문** (영어):
> Before writing any code, identify 2-3 specific use cases your skill will enable. Ask yourself: What is the user trying to accomplish? What multi-step workflow is needed? What tools are required (built-in or MCP)? What domain knowledge or best practices should be included?

**번역 (뉘앙스 소실 가공)**:
> 코드를 작성하기 전에 스킬이 가능하게 할 2-3개의 구체적인 사용 사례를 식별합니다. 스스로에게 물어보세요: 사용자가 무엇을 달성하려고 하나요? 다단계 워크플로우가 필요한가요? 도구가 필요한가요? 도메인 지식을 포함해야 하나요?

**점수**: 7/10

**근거 — 뉘앙스 소실 사례**:
- "What multi-step workflow is needed?" → "다단계 워크플로우가 필요한가요?"로 번역. 원문은 "어떤" 워크플로우가 필요한지 묻는 개방형 질문인데, 번역은 필요 여부를 묻는 폐쇄형 질문으로 바뀜 (의미 범위 축소)
- "What tools are required (built-in or MCP)?" → "도구가 필요한가요?"로 번역. "(built-in or MCP)"라는 구체적 힌트가 완전히 누락됨
- "What domain knowledge or best practices should be included?" → "도메인 지식을 포함해야 하나요?"로 번역. "best practices"가 누락되고, "should be"의 당위성이 "해야 하나요?"의 선택적 뉘앙스로 약화됨
- 원문에서 4개의 질문 모두 "What"으로 시작하여 구체적 내용을 묻는데, 번역은 2개를 Yes/No 질문으로 변환함

**왜 8점이 아닌지**:
- 구체적 정보("built-in or MCP", "best practices")의 누락은 단순 뉘앙스 차이가 아니라 정보 손실
- 질문의 성격 자체가 바뀌어 독자가 얻는 가이던스의 깊이가 달라짐

---

### 5점 예시: 의미 변경

**장르**: 기술 에세이 (콘텐츠 협상 — 의미 반전 가공)

**원문** (영어):
> For agents operating within token limits, smaller payloads mean they can read more content per request and spend their budget on actual information instead of markup. They run faster and hit limits less often.

**번역 (의미 변경 가공)**:
> 토큰 제한 없이 작동하는 에이전트에게 큰 페이로드란, 요청당 더 적은 콘텐츠를 읽고 마크업에 예산을 쓸 수 있다는 뜻입니다. 더 느리게 작동하고, 한계에 자주 부딪힙니다.

**점수**: 5/10

**근거 — 의미 변경 사례**:
- "operating within token limits" → "토큰 제한 없이 작동하는": "within"(~내에서)이 "없이"로 반전. 원문은 에이전트가 토큰 제한 안에서 작동한다는 전제인데, 번역은 제한이 없다는 뜻으로 바뀜
- "smaller payloads" → "큰 페이로드": "smaller"가 "큰"으로 반전
- "more content" → "더 적은 콘텐츠": "more"가 "적은"으로 반전
- "actual information instead of markup" → "마크업에 예산을 쓸 수 있다": "instead of"(~대신)가 누락되어 의미가 정반대
- "run faster" → "더 느리게 작동하고": 속도 방향 반전
- "hit limits less often" → "한계에 자주 부딪힙니다": "less often"이 "자주"로 반전
- 한 단락에서 6개의 의미 반전이 발생. 원문의 핵심 주장("작은 페이로드가 에이전트에게 유리하다")이 정반대("큰 페이로드가 불리하다"도 아닌, 완전히 뒤집힌 문맥)로 전달됨

**왜 6점이 아닌지**:
- 단순한 뉘앙스 소실이 아니라 핵심 의미의 반전
- 이 번역을 읽은 독자는 원문과 완전히 다른 정보를 얻게 됨
- "cannot" → "할 수 있다" 수준의 의미 반전이 한 단락에 집중적으로 발생

---

## 채점 시 자주 하는 실수

### 1. "전체적으로 괜찮으니까 8점"

번역투 패턴을 구체적으로 세지 않고 인상 평가하는 실수입니다.

- **잘못된 채점**: "문장이 자연스럽고 의미 전달이 잘 되니까 8점"
- **올바른 채점**: 28개 패턴 체크리스트를 대조하여 발견된 패턴 수를 세고, 그에 따라 점수를 매깁니다
- **기준**: 번역투 0건 = 9-10점, 1-2건 = 8점, 3-4건 = 7점, 5건 이상 = 6점 이하

### 2. "사소한 문제만 있으니까 9점"

한 차원에서 높은 점수가 다른 차원의 문제를 가리는 실수입니다.

- **잘못된 채점**: "의미 전달은 완벽하니까 번역투가 좀 있어도 9점"
- **올바른 채점**: 차원별로 따로 평가합니다. 의미 정확성이 9점이어도 자연스러움이 7점이면, 전체 점수는 7-8점 범위입니다
- **핵심**: 가장 낮은 차원의 점수가 전체 점수의 상한을 결정합니다

### 3. "의미는 맞으니까 OK"

미세한 단어 하나가 의미 범위를 바꾸는 것을 간과하는 실수입니다.

- **잘못된 채점**: "대략적인 의미가 같으니까 충실도 9점"
- **올바른 채점**: "only"가 빠지면 "~에서만 가치가 있다"가 "가치가 있다"로 바뀝니다. 범위 한정어 하나로 의미가 달라지면 충실도 -2점
- **위험한 단어들**: only, should, must, cannot, merely, just, even, still, already — 이 단어들이 번역에서 빠지거나 약화되면 반드시 감점

### 4. "원문이 모호하니까 의역해도 된다"

원문의 의도적 모호함을 번역자가 임의로 해석하는 실수입니다.

- **잘못된 채점**: "원문이 불명확해서 번역자가 의미를 명확히 한 것은 좋은 판단"
- **올바른 채점**: 원문이 의도적으로 모호하면 번역도 모호해야 합니다. 번역자가 의미를 추가했다면 그것은 창작이지 번역이 아닙니다. 단, 한국어 독자를 위한 명확화(격언체 풀어쓰기 등)는 의역 전략으로 인정합니다 — feedback-log의 승인된 의역 패턴을 참조하세요
