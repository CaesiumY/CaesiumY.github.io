---
title: "[번역] Claude 스킬 구축 완벽 가이드 - 2부: 계획과 설계"
description: "스킬 사용 사례 정의, 성공 기준 설정, YAML frontmatter 작성법, 효과적인 지시사항 작성 방법을 알아봅니다. Claude 스킬 구축을 위한 실전 설계 가이드."
pubDatetime: 2026-02-06T03:18:45Z
modDatetime: 2026-02-06T06:19:57Z
tags: ["translation", "claude", "skills", "mcp", "ai", "anthropic"]
series: "Claude 스킬 구축 완벽 가이드"
ogImage: "./chapter-2-cover.png"
featured: false
draft: false
---

> 이 글은 Anthropic의 [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) PDF 가이드 중 2부를 번역한 글입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- **사용 사례 먼저 정의**: 코드를 작성하기 전에 2-3개의 구체적인 사용 사례를 명확히 합니다
- **3가지 스킬 카테고리**: 문서/자산 생성, 워크플로우 자동화, MCP 기능 강화
- **성공 기준 설정**: 정량적(트리거율 90%, API 실패 0건) 및 정성적(사용자 개입 최소화) 지표를 정합니다
- **YAML frontmatter가 핵심**: `name`과 `description` 필드가 스킬 로드 여부를 결정합니다
- **효과적인 description**: "무엇을" + "언제 사용" + "주요 기능"을 명시하고, 사용자가 말할 구체적인 문구를 포함합니다

### 핵심 메시지
- **점진적 공개(Progressive Disclosure)**: description → SKILL.md → references/ 순서로 정보를 계층화합니다
- **파일 구조 규칙**: `SKILL.md`(정확한 대소문자), kebab-case 폴더명, README.md 금지
- **보안 제약**: frontmatter에 XML 태그(<>) 사용 금지, "claude"/"anthropic" 이름 예약

</details>

---

**원문 작성일**: 2025년 1월 29일

**작성자**: Anthropic Engineering Team

---

## 2장: 계획과 설계

### 사용 사례부터 시작하기

코드를 작성하기 전에 스킬이 가능하게 할 2-3개의 구체적인 사용 사례를 식별합니다.

**좋은 사용 사례 정의:**

```
사용 사례: 프로젝트 스프린트 계획
트리거: 사용자가 "이 스프린트 계획을 도와줘" 또는 "스프린트 작업 만들기"라고 말할 때
단계:
1. Linear에서 현재 프로젝트 상태 가져오기 (MCP 사용)
2. 팀의 속도와 용량 분석
3. 작업 우선순위 제안
4. Linear에서 적절한 레이블과 예상 시간으로 작업 생성
결과: 작업이 생성된 완전히 계획된 스프린트
```

**스스로에게 물어보세요:**

- 사용자가 무엇을 달성하려고 하나요?
- 어떤 다단계 워크플로우가 필요한가요?
- 어떤 도구가 필요한가요 (내장 도구 또는 MCP)?
- 어떤 도메인 지식이나 모범 사례를 포함해야 하나요?

### 일반적인 스킬 사용 사례 카테고리

Anthropic에서는 세 가지 일반적인 사용 사례를 관찰했습니다:

#### 카테고리 1: 문서 및 자산 생성

용도: 문서, 프레젠테이션, 앱, 디자인, 코드 등 일관되고 고품질의 결과물 생성

실제 예시: [frontend-design 스킬](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/frontend-design) (또한 [docx, pptx, xlsx, ppt 스킬](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills)도 참조)

"높은 디자인 품질로 독특하고 프로덕션 수준의 프론트엔드 인터페이스를 만듭니다. 웹 컴포넌트, 페이지, 아티팩트, 포스터, 애플리케이션을 구축할 때 사용합니다."

**주요 기법:**

- 내장된 스타일 가이드와 브랜드 표준
- 일관된 결과물을 위한 템플릿 구조
- 최종 작업 전 품질 체크리스트
- 외부 도구 불필요 - Claude의 내장 기능 사용

#### 카테고리 2: 워크플로우 자동화

용도: 여러 MCP 서버 간 조정을 포함하여 일관된 방법론이 필요한 다단계 프로세스

실제 예시: [skill-creator 스킬](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/skill-creator)

"새 스킬 생성을 위한 대화형 가이드입니다. 사용 사례 정의, frontmatter 생성, 지시사항 작성, 검증 과정을 안내합니다."

**주요 기법:**

- 검증 단계를 거치는 단계별 워크플로우
- 일반적인 구조를 위한 템플릿
- 내장된 검토 및 개선 제안
- 반복적인 개선 루프

#### 카테고리 3: MCP 기능 강화

용도: MCP 서버가 제공하는 도구 접근을 강화하는 워크플로우 안내

실제 예시: [sentry-code-review 스킬 (Sentry 제공)](https://github.com/getsentry/sentry-mcp/tree/main/skills/sentry-code-review)

"Sentry의 MCP 서버를 통해 에러 모니터링 데이터를 사용하여 GitHub Pull Request에서 감지된 버그를 자동으로 분석하고 수정합니다."

**주요 기법:**

- 순차적으로 여러 MCP 호출 조정
- 도메인 전문성 내장
- 사용자가 따로 지정해야 할 컨텍스트를 자동으로 포함
- 일반적인 MCP 문제에 대한 에러 처리

### 성공 기준 정의

#### 스킬이 작동하는지 어떻게 알 수 있나요?

아래는 정확한 기준이 아닌 대략적 지표입니다. 엄격함을 추구하되, 주관적 판단이 필요함을 인정하세요. 더욱 견고한 측정 기준과 도구를 적극 개발 중입니다.

**정량적 지표:**

- 관련 쿼리의 90%에서 스킬 트리거
  - *측정 방법:* 스킬을 트리거해야 하는 10-20개의 테스트 쿼리를 실행합니다. 자동으로 로드되는 횟수와 명시적 호출이 필요한 횟수를 추적합니다.
- X번의 도구 호출로 워크플로우 완료
  - *측정 방법:* 스킬을 활성화한 경우와 비활성화한 경우에 동일한 작업을 비교합니다. 도구 호출 횟수와 총 토큰 사용량을 계산합니다.
- 워크플로우당 API 호출 실패 0건
  - *측정 방법:* 테스트 실행 중 MCP 서버 로그를 모니터링합니다. 재시도율과 에러 코드를 추적합니다.

**정성적 지표:**

- 사용자가 Claude에게 다음 단계를 프롬프트할 필요가 없음
  - *평가 방법:* 테스트 중 방향을 재설정하거나 명확히 해야 하는 빈도를 기록합니다. 베타 사용자에게 피드백을 요청합니다.
- 사용자 수정 없이 워크플로우 완료
  - *평가 방법:* 동일한 요청을 3-5회 실행합니다. 구조적 일관성과 품질을 비교합니다.
- 세션 간 일관된 결과
  - *평가 방법:* 새로운 사용자가 최소한의 안내로 첫 시도에 작업을 완료할 수 있나요?

### 기술 요구사항

#### 파일 구조

```
your-skill-name/
├── SKILL.md               # 필수 - 메인 스킬 파일
├── scripts/               # 선택 - 실행 가능한 코드
│   ├── process_data.py    # 예시
│   └── validate.sh        # 예시
├── references/            # 선택 - 문서
│   ├── api-guide.md       # 예시
│   └── examples/          # 예시
└── assets/                # 선택 - 템플릿 등
    └── report-template.md # 예시
```

#### 중요한 규칙

**SKILL.md 이름 규칙:**

- 정확히 `SKILL.md`여야 합니다 (대소문자 구분)
- 변형 불가 (SKILL.MD, skill.md 등)

**스킬 폴더 이름 규칙:**

- kebab-case 사용: `notion-project-setup` ✅
- 공백 금지: `Notion Project Setup` ❌
- 언더스코어 금지: `notion_project_setup` ❌
- 대문자 금지: `NotionProjectSetup` ❌

**README.md 금지:**

- 스킬 폴더 내에 README.md를 포함하지 마세요
- 모든 문서는 SKILL.md 또는 references/에 작성합니다
- 참고: GitHub을 통해 배포할 때는 사용자를 위해 저장소 수준의 README는 여전히 필요합니다 — 배포 및 공유를 참조하세요.

### YAML frontmatter: 가장 중요한 부분

YAML frontmatter는 Claude가 스킬을 로드할지 결정하는 방법입니다. 이 부분을 신경 써서 작성하세요.

**최소 필수 형식:**

```yaml
---
name: your-skill-name
description: What it does. Use when user asks to [specific phrases].
---
```

시작하기에 필요한 것은 이게 전부입니다.

#### 필드 요구사항

**name** (필수):

- kebab-case만 사용
- 공백이나 대문자 금지
- 폴더 이름과 일치해야 함

**description** (필수):

- **반드시 둘 다 포함:**
  - 스킬의 역할
  - 언제 사용하는지 (트리거 조건)
- 1024자 미만
- XML 태그 금지 (< 또는 >)
- 사용자가 말할 수 있는 구체적인 작업 포함
- 관련 있으면 파일 유형 언급

**license** (선택):

- 스킬을 오픈소스로 만들 때 사용
- 일반적: MIT, Apache-2.0

**compatibility** (선택):

- 1-500자
- 환경 요구사항을 나타냅니다: 예) 의도된 제품, 필요한 시스템 패키지, 네트워크 접근 요구사항 등

**metadata** (선택):

- 사용자 정의 키-값 쌍
- 제안: author, version, mcp-server
- 예시:
  ```yaml
  metadata:
    author: ProjectHub
    version: 1.0.0
    mcp-server: projecthub
  ```

#### 보안 제약

**frontmatter에서 금지:**

- XML 꺾쇠괄호 (< >)
- 이름에 "claude" 또는 "anthropic" 포함 (예약됨)

**이유:** frontmatter는 Claude의 시스템 프롬프트에 나타납니다. 악의적인 콘텐츠가 지시사항을 주입할 수 있습니다.

### 효과적인 스킬 작성하기

#### description 필드

Anthropic의 [엔지니어링 블로그](https://www.anthropic.com/engineering/building-effective-agents)에 따르면: "이 메타데이터는...각 스킬을 언제 사용할지 모든 정보를 컨텍스트에 로드하지 않고도 알 수 있는 정도의 정보를 담습니다." 즉, frontmatter는 컨텍스트에 가장 먼저 포함되는 정보입니다.

**구조:**

```
[무엇을 하는지] + [언제 사용하는지] + [주요 기능]
```

**좋은 description 예시:**

```
# 좋음 - 구체적이고 실행 가능함
description: Figma 디자인 파일을 분석하고 개발자 핸드오프 문서를 생성합니다.
사용자가 .fig 파일을 업로드하거나, "디자인 스펙", "컴포넌트 문서",
"디자인-코드 핸드오프"를 요청할 때 사용합니다.
```

```
# 좋음 - 트리거 문구 포함
description: 스프린트 계획, 작업 생성, 상태 추적을 포함한 Linear 프로젝트
워크플로우를 관리합니다. 사용자가 "스프린트", "Linear 작업",
"프로젝트 계획"을 언급하거나 "티켓 만들기"를 요청할 때 사용합니다.
```

```
# 좋음 - 명확한 가치 제안
description: PayFlow의 엔드투엔드 고객 온보딩 워크플로우입니다. 계정 생성,
결제 설정, 구독 관리를 처리합니다. 사용자가 "신규 고객 온보딩",
"구독 설정", "PayFlow 계정 만들기"라고 말할 때 사용합니다.
```

**나쁜 description 예시:**

```
# 너무 모호함
description: 프로젝트를 도와줍니다.

# 트리거 누락
description: 정교한 다중 페이지 문서 시스템을 만듭니다.

# 너무 기술적, 사용자 트리거 없음
description: 계층적 관계를 가진 프로젝트 엔티티 모델을 구현합니다.
```

### 메인 지시사항 작성하기

frontmatter 다음에 Markdown으로 실제 지시사항을 작성합니다.

**권장 구조:**

*이 템플릿을 스킬에 맞게 조정하세요. 대괄호로 표시된 섹션을 구체적인 내용으로 교체하세요.*

```yaml
---
name: your-skill
description: [...]
---

# Your Skill Name

## Instructions

### Step 1: [First Major Step]
Clear explanation of what happens.
```

예시:

```bash
python scripts/fetch_data.py --project-id PROJECT_ID
Expected output: [describe what success looks like]
```

(필요에 따라 단계 추가)

#### 예시

**예시 1: [일반적인 시나리오]**

사용자 입력: "새 마케팅 캠페인 설정"

작업:

1. MCP를 통해 기존 캠페인 가져오기
2. 입력된 파라미터로 새 캠페인 생성

결과: 확인 링크가 포함된 캠페인 생성 완료

(필요에 따라 예시 추가)

#### 문제 해결

**에러: [일반적인 에러 메시지]**

**원인:** [발생 이유]

**해결 방법:** [수정 방법]

(필요에 따라 에러 사례 추가)

### 지시사항 모범 사례

#### 구체적이고 실행 가능하게

✅ **좋음:**

```
`python scripts/validate.py --input {filename}`을 실행하여 데이터 형식을 확인합니다.
검증이 실패하면 일반적인 문제는 다음과 같습니다:
- 필수 필드 누락 (CSV에 추가)
- 잘못된 날짜 형식 (YYYY-MM-DD 사용)
```

❌ **나쁨:**

```
진행하기 전에 데이터를 검증합니다.
```

#### 에러 처리 포함

```
## 일반적인 문제

### MCP 연결 실패
"Connection refused"가 표시되면:
1. MCP 서버가 실행 중인지 확인: Settings > Extensions 확인
2. API 키가 유효한지 확인
3. 재연결 시도: Settings > Extensions > [Your Service] > Reconnect
```

#### 번들 리소스를 명확하게 참조

```
쿼리를 작성하기 전에 `references/api-patterns.md`에서 다음을 참조하세요:
- 속도 제한 가이드
- 페이지네이션 패턴
- 에러 코드와 처리
```

#### 점진적 공개 사용

SKILL.md는 핵심 지시사항에 집중하고, 상세한 문서는 `references/`로 이동하여 링크합니다. (세 단계 시스템이 작동하는 방법은 [핵심 설계 원칙](#핵심-설계-원칙)을 참조하세요.)

---

## 참고 자료

- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) - 원문 PDF
- [Claude 스킬 구축 완벽 가이드 - 시리즈 전체 보기](/series/claude-스킬-구축-완벽-가이드/)
- [Anthropic Cookbook - Skills](https://github.com/anthropics/anthropic-cookbook/tree/main/skills) - 스킬 예시 모음
- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) - Anthropic 엔지니어링 블로그
