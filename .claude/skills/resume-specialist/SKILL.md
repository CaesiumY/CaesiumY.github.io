---
allowed-tools: [Read, Write, Glob, Grep, Task, AskUserQuestion]
argument-hint: "[작업 유형: 작성|검토|최적화] [대상 포지션]"
description: 이력서/CV 작성, 검토, ATS 최적화를 수행하는 스킬. about.md와 projects.ts에서 프로젝트 이력을 참조하여 맞춤형 이력서를 생성합니다. "이력서 작성", "이력서 검토", "resume 만들어줘", "ATS 최적화", "CV 개선", "포지션에 맞게 이력서 수정" 등의 요청에 사용하세요. 이력서/CV 관련 작업이면 반드시 이 스킬을 사용합니다.
---

# 이력서 전문가 스킬

프로젝트 이력과 사용자 정보를 기반으로 이력서를 작성, 검토, 최적화합니다.

## 데이터 소스

이력서 작성 시 다음 파일에서 프로젝트 이력과 경험을 참조합니다:
- `src/pages/about.md` — 경력 요약, AI-Native Development 이력
- `src/data/projects.ts` — 프로젝트 목록, 기술 스택, 기간

**주의**: 두 파일이 이중으로 관리되므로 반드시 양쪽을 읽어 최신 정보를 교차 확인하세요.

## 실행 단계

### Step 1: 요청 파악

사용자 요청을 분류:
- **작성**: 새 이력서/CV 생성 (포지션, 형식, 언어 확인)
- **검토**: 기존 이력서 개선점 분석
- **최적화**: ATS 통과율 향상, 키워드 최적화

### Step 2: 데이터 수집

1. `src/pages/about.md`와 `src/data/projects.ts` 읽기
2. 사용자가 제공한 추가 정보 (대상 포지션, JD 등) 확인
3. 필요 시 AskUserQuestion으로 누락 정보 질문

### Step 3: resume-specialist 에이전트 호출

Task 도구로 `resume-specialist` 에이전트를 호출하여 전문 분석/작성 수행:

```
역할: [작성|검토|최적화]
대상 포지션: [포지션명]
프로젝트 이력: [Step 2에서 수집한 데이터 요약]
추가 요구사항: [사용자 요청]
```

### Step 4: 결과 확인 및 적용

1. 에이전트 결과를 사용자에게 제시
2. AskUserQuestion으로 수정 방향 확인
3. 필요 시 반복 개선
