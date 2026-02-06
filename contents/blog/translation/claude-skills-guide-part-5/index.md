---
title: "[번역] Claude 스킬 구축 완벽 가이드 - 5부: 패턴과 트러블슈팅"
description: "스킬 설계 패턴 5가지(순차 워크플로우, 멀티MCP, 반복 개선, 컨텍스트 기반, 도메인 지능)와 일반적인 문제 해결법을 알아봅니다."
pubDatetime: 2026-02-06T22:39:25Z
modDatetime: 2026-02-07T00:15:00Z
tags: ["translation", "claude", "skills", "patterns", "troubleshooting", "ai", "anthropic"]
series: "Claude 스킬 구축 완벽 가이드"
originalSource: "../../../temp-translation-source/05-patterns-and-troubleshooting.md"
featured: false
draft: true
---

> 이 글은 Anthropic의 [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) PDF 가이드 중 5부를 번역한 글입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 스킬 설계 패턴 5가지
- **순차 워크플로우 오케스트레이션**: 다단계 프로세스를 정해진 순서로 실행
- **멀티MCP 조정**: 여러 서비스를 연결하는 워크플로우
- **반복 개선**: 품질 향상을 위한 반복 작업
- **컨텍스트 기반 도구 선택**: 상황에 따라 적합한 도구 자동 선택
- **도메인별 지능**: 도구 접근을 넘어선 전문 지식 통합

### 트러블슈팅 핵심
- **업로드 실패**: SKILL.md 파일명 대소문자 확인, frontmatter YAML 형식 검증
- **트리거 문제**: description 필드 개선 (너무 일반적이거나 너무 자주 트리거)
- **지시사항 미준수**: 간결하게 작성, 핵심 지시사항을 상단에 배치, 코드로 검증 로직 구현

</details>

---

**원문 작성일**: 2025년 1월 29일

**작성자**: Anthropic Engineering Team

## 챕터 5: 패턴과 트러블슈팅

얼리어답터와 내부 팀이 만든 스킬에서 발견한 패턴입니다. 정해진 템플릿이 아니라, 실제로 잘 작동한 일반적인 접근법을 담고 있습니다.

### 접근법 선택하기: 문제 중심 vs 도구 중심

철물점을 생각해보세요. "주방 캐비닛을 고쳐야 해"라는 문제로 들어가면 직원이 적합한 도구를 보여줍니다. 또는 새 드릴을 골라서 "이걸 내 작업에 어떻게 쓰나요?"라고 물어볼 수도 있습니다.

스킬도 같은 방식으로 작동합니다:

- **문제 중심:** "프로젝트 작업 공간을 설정해야 해" → 스킬이 적절한 MCP 호출을 올바른 순서로 조율합니다. 사용자는 결과를 설명하면, 스킬이 나머지 도구 처리를 담당합니다.
- **도구 중심:** "Notion MCP가 연결되어 있어" → 스킬이 Claude에게 최적의 워크플로우와 모범 사례를 알려줍니다. 사용자는 접근 권한을 가지고 있고, 스킬이 전문성을 더해줍니다.

대부분의 스킬은 한쪽으로 치우쳐 있습니다. 자신의 사용 사례에 맞는 방식을 알면 아래에서 적합한 패턴을 쉽게 고를 수 있습니다.

### 패턴 1: 순차 워크플로우 오케스트레이션

**사용 시점:** 사용자가 정해진 순서대로 여러 단계를 거쳐야 할 때

**예시 구조:**

```markdown
## 워크플로우: 신규 고객 온보딩

### 1단계: 계정 생성
MCP 도구 호출: `create_customer`
파라미터: name, email, company

### 2단계: 결제 설정
MCP 도구 호출: `setup_payment_method`
대기: 결제 수단 확인

### 3단계: 구독 생성
MCP 도구 호출: `create_subscription`
파라미터: plan_id, customer_id (1단계에서 획득)

### 4단계: 환영 이메일 발송
MCP 도구 호출: `send_email`
템플릿: welcome_email_template
```

**핵심 기법:**

- 명확한 단계 순서
- 단계 간 의존성
- 각 단계에서 검증
- 실패 시 롤백 방법

### 패턴 2: 멀티MCP 조정

**사용 시점:** 워크플로우가 여러 서비스를 아우를 때

**예시: 디자인-개발 인수인계**

```markdown
### Phase 1: 디자인 내보내기 (Figma MCP)
1. Figma에서 디자인 에셋 내보내기
2. 디자인 명세서 생성
3. 에셋 매니페스트 작성

### Phase 2: 에셋 저장 (Drive MCP)
1. Drive에 프로젝트 폴더 생성
2. 모든 에셋 업로드
3. 공유 링크 생성

### Phase 3: 태스크 생성 (Linear MCP)
1. 개발 태스크 생성
2. 태스크에 에셋 링크 첨부
3. 엔지니어링 팀에 할당

### Phase 4: 알림 (Slack MCP)
1. #engineering에 인수인계 요약 게시
2. 에셋 링크와 태스크 참조 포함
```

**핵심 기법:**

- 명확한 단계 분리
- MCP 간 데이터 전달
- 다음 단계로 넘어가기 전 검증
- 중앙 집중식 에러 처리

### 패턴 3: 반복 개선

**사용 시점:** 결과물 품질이 반복을 통해 향상될 때

**예시: 보고서 생성**

```markdown
## 반복적 보고서 작성

### 초안 작성
1. MCP로 데이터 가져오기
2. 보고서 초안 생성
3. 임시 파일에 저장

### 품질 점검
1. 검증 스크립트 실행: `scripts/check_report.py`
2. 문제 식별:
   - 누락된 섹션
   - 일관되지 않은 서식
   - 데이터 검증 오류

### 개선 루프
1. 식별된 각 문제 해결
2. 문제가 있는 섹션 다시 생성
3. 재검증
4. 품질 기준 충족 시까지 반복

### 마무리
1. 최종 서식 적용
2. 요약 생성
3. 최종 버전 저장
```

**핵심 기법:**

- 명확한 품질 기준
- 반복적 개선
- 검증 스크립트
- 반복 중단 시점 판단

### 패턴 4: 컨텍스트 기반 도구 선택

**사용 시점:** 같은 결과지만 컨텍스트에 따라 다른 도구를 사용할 때

**예시: 파일 저장**

```markdown
## 스마트 파일 저장

### 의사결정 트리
1. 파일 타입과 크기 확인
2. 최적 저장 위치 결정:
   - 대용량 파일 (>10MB): 클라우드 스토리지 MCP 사용
   - 협업 문서: Notion/Docs MCP 사용
   - 코드 파일: GitHub MCP 사용
   - 임시 파일: 로컬 스토리지 사용

### 저장 실행
결정에 따라:
- 적절한 MCP 도구 호출
- 서비스별 메타데이터 적용
- 접근 링크 생성

### 사용자에게 컨텍스트 안내
저장소를 선택한 이유 설명
```

**핵심 기법:**

- 명확한 결정 기준
- 대체 옵션
- 선택에 대한 투명성

### 패턴 5: 도메인별 지능

**사용 시점:** 스킬이 도구 접근을 넘어선 전문 지식을 추가할 때

**예시: 금융 규정 준수**

```markdown
## 규정 준수를 포함한 결제 처리

### 처리 전 (규정 준수 검사)
1. MCP로 거래 상세 정보 가져오기
2. 규정 준수 규칙 적용:
   - 제재 목록 확인
   - 관할권 허용 여부 검증
   - 위험 수준 평가
3. 규정 준수 결정 문서화

### 처리
IF 규정 준수 통과:
  - 결제 처리 MCP 도구 호출
  - 적절한 사기 방지 검사 적용
  - 거래 처리
ELSE:
  - 검토 대상으로 플래그 지정
  - 규정 준수 케이스 생성

### 감사 추적
- 모든 규정 준수 검사 기록
- 처리 결정 기록
- 감사 보고서 생성
```

**핵심 기법:**

- 로직에 도메인 전문 지식 내장
- 작업 전 규정 준수
- 포괄적인 문서화
- 명확한 관리 체계

---

## 트러블슈팅

### 스킬 업로드 실패

**에러: "Could not find SKILL.md in uploaded folder"**

**원인:** 파일명이 정확히 SKILL.md가 아님

**해결책:**

- SKILL.md로 이름 변경 (대소문자 구분)
- 확인: `ls -la` 명령으로 SKILL.md가 보여야 함

**에러: "Invalid frontmatter"**

**원인:** YAML 형식 문제

일반적인 실수:

```yaml
# 잘못됨 - 구분자 누락
name: my-skill
description: Does things

# 잘못됨 - 따옴표 미닫힘
name: my-skill
description: "Does things

# 올바름
---
name: my-skill
description: Does things
---
```

**에러: "Invalid skill name"**

**원인:** 이름에 공백이나 대문자 포함

```yaml
# 잘못됨
name: My Cool Skill

# 올바름
name: my-cool-skill
```

### 스킬이 트리거되지 않음

**증상:** 스킬이 자동으로 로드되지 않음

**해결책:**

description 필드를 수정하세요. 좋은 예시와 나쁜 예시는 [2부의 description 필드](/posts/claude-skills-guide-part-2/#description-필드) 섹션을 확인하세요.

**빠른 체크리스트:**

- 너무 일반적인가요? ("Helps with projects"는 작동하지 않습니다)
- 사용자가 실제로 말할 법한 트리거 문구를 포함하나요?
- 관련 파일 타입을 언급하나요? (해당하는 경우)

**디버깅 방법:**

Claude에게 "[skill name] 스킬은 언제 사용하나요?"라고 물어보세요. Claude가 description을 그대로 반복합니다. 빠진 부분을 기반으로 조정하세요.

### 스킬이 너무 자주 트리거됨

**증상:** 관련 없는 쿼리에도 스킬이 로드됨

**해결책:**

1. **부정 트리거 추가**

```
description: Advanced data analysis for CSV files. Use for statistical modeling, regression, clustering. Do NOT use for simple data exploration (use data-viz skill instead).
```

2. **더 구체적으로 작성**

```yaml
# 너무 광범위함
description: Processes documents

# 더 구체적임
description: Processes PDF legal documents for contract review
```

3. **범위 명확히 하기**

```
description: PayFlow payment processing for e-commerce. Use specifically for online payment workflows, not for general financial queries.
```

### MCP 연결 문제

**증상:** 스킬은 로드되지만 MCP 호출이 실패함

**체크리스트:**

1. **MCP 서버 연결 확인**
   - Claude.ai: Settings > Extensions > [Your Service]
   - "Connected" 상태가 표시되어야 함

2. **인증 확인**
   - API 키가 유효하고 만료되지 않았는지
   - 적절한 권한/스코프가 부여되었는지
   - OAuth 토큰이 갱신되었는지

3. **MCP 독립적으로 테스트**
   - Claude에게 (스킬 없이) MCP를 직접 호출하도록 요청
   - "Use [Service] MCP to fetch my projects"
   - 이것이 실패하면 스킬이 아니라 MCP 문제

4. **도구 이름 확인**
   - 스킬이 올바른 MCP 도구 이름을 참조하는지
   - MCP 서버 문서 확인
   - 도구 이름은 대소문자를 구분합니다

### 지시사항이 지켜지지 않음

**증상:** 스킬은 로드되지만 Claude가 지시사항을 따르지 않음

**일반적인 원인:**

1. **지시사항이 너무 장황함**
   - 지시사항을 간결하게 유지
   - 글머리 기호와 번호 목록 사용
   - 상세한 참조는 별도 파일로 이동

2. **지시사항이 묻혀 있음**
   - 중요한 지시사항을 상단에 배치
   - `## Important` 또는 `## Critical` 헤더 사용
   - 필요하면 핵심 사항 반복

3. **모호한 표현**

```
# 나쁨
Make sure to validate things properly

# 좋음
CRITICAL: Before calling create_project, verify:
- Project name is non-empty
- At least one team member assigned
- Start date is not in the past
```

**고급 기법:** 중요한 검증이 필요하면 언어 지시사항보다는 검사 스크립트를 번들링하는 방식을 추천합니다. 코드는 결정적이지만 언어 해석은 그렇지 않기 때문입니다. [Office skills](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills)에서 이 패턴의 예시를 확인하세요.

4. **모델 '게으름'** 명시적인 격려를 추가하세요:

```markdown
## Performance Notes
- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps
```

참고: SKILL.md보다 사용자 프롬프트에 넣는 것이 더 효과적입니다

### 큰 컨텍스트 문제

**증상:** 스킬이 느려 보이거나 응답 품질이 저하됨

**원인:**

- 스킬 콘텐츠가 너무 큼
- 동시에 활성화된 스킬이 너무 많음
- 점진적 공개가 아닌 모든 콘텐츠를 한꺼번에 로드하는 방식

**해결책:**

1. **SKILL.md 크기 최적화**
   - 상세한 문서를 references/로 이동
   - 인라인 대신 참조로 링크
   - SKILL.md를 5,000단어 미만으로 유지

2. **활성화된 스킬 줄이기**
   - 20-50개 이상의 스킬이 동시에 활성화되어 있는지 평가
   - 선택적 활성화 권장
   - 관련 기능을 위한 스킬 묶음 고려

## 참고 자료

- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) - 원문 PDF
- [Anthropic Cookbook - Skills](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills)
