---
title: "[번역] Claude 스킬 구축 완벽 가이드 - 4부: 배포와 공유"
description: "스킬 배포 모델(개인/조직), Skills API 사용법, GitHub 호스팅 전략, 스킬 포지셔닝 방법을 알아봅니다."
pubDatetime: 2026-02-06T21:54:17Z
modDatetime: 2026-02-06T22:28:31Z
tags: ["translation", "claude", "skills", "distribution", "ai", "anthropic"]
series: "Claude 스킬 구축 완벽 가이드"
originalSource: "../../../temp-translation-source/04-distribution-and-sharing.md"
ogImage: "./chapter-4-cover.png"
featured: false
draft: true
---

> 이 글은 Anthropic의 [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) PDF 가이드 중 4부를 번역한 글입니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- 개인 사용자는 스킬 폴더를 다운로드하여 Claude.ai/Claude Code에 업로드하거나 스킬 디렉터리에 배치
- 조직 관리자는 워크스페이스 전체에 스킬을 배포하고 자동 업데이트 및 중앙 관리 가능 (2025년 12월 18일 출시)
- Agent Skills는 오픈 표준으로, 다양한 AI 플랫폼에서 호환되도록 설계
- Skills API로 프로그래밍 방식의 스킬 관리와 실행이 가능하며, 프로덕션 배포와 자동화된 파이프라인에 적합
- GitHub 호스팅 + MCP 문서화가 현재 권장되는 배포 전략
- 스킬 설명은 기능 나열이 아닌 성과(outcome) 중심으로 작성하고, MCP와의 시너지를 강조

### 핵심 메시지
- Claude.ai/Claude Code는 최종 사용자와 수동 테스트에, API는 프로덕션 애플리케이션과 자동화 시스템에 사용하세요
- 스킬을 MCP 서버와 함께 사용하면 더 큰 가치를 제공할 수 있습니다

</details>

---

**원문 작성일**: 2025년 1월 29일

**작성자**: Anthropic Engineering Team

## 챕터 4: 배포와 공유

스킬은 MCP 통합을 더욱 완전하게 만듭니다. 사용자가 커넥터를 비교할 때, 스킬도 함께 갖춘 서비스는 더 빠르게 가치를 전달하며 MCP만 지원하는 대안보다 우위를 점합니다.

### 현재 배포 모델 (2026년 1월 기준)

#### 개인 사용자가 스킬을 받는 방법:

1. 스킬 폴더를 다운로드합니다
2. 필요하면 폴더를 압축합니다
3. Claude.ai의 Settings > Capabilities > Skills를 통해 업로드합니다
4. 또는 Claude Code 스킬 디렉터리에 배치합니다

#### 조직 수준 스킬:

- 관리자가 워크스페이스 전체에 스킬을 배포할 수 있습니다 (2025년 12월 18일 출시)
- 자동 업데이트
- 중앙 집중식 관리

#### 오픈 표준

Anthropic은 [Agent Skills](https://github.com/anthropics/agent-skills-spec)를 오픈 표준으로 발표했습니다. MCP처럼 스킬도 도구와 플랫폼을 넘나들며 작동해야 한다고 생각합니다. Claude든 다른 AI 플랫폼이든 동일한 스킬이 작동해야 합니다. 다만 일부 스킬은 특정 플랫폼의 기능을 최대한 활용하도록 설계되어 있으며, 작성자는 스킬의 `compatibility` 필드에 이를 명확히 표시할 수 있습니다. Anthropic은 생태계의 여러 구성원과 이 표준을 함께 개발해왔으며, 초기 도입 사례가 매우 긍정적입니다.

### API를 통한 스킬 사용

애플리케이션, 에이전트, 스킬을 활용하는 자동화된 워크플로우 구축과 같은 프로그래밍 방식의 사용 사례에서는 API가 스킬 관리와 실행을 직접 제어합니다.

**주요 기능:**

- `/v1/skills` 엔드포인트로 스킬을 나열하고 관리합니다
- `container.skills` 파라미터를 통해 Messages API 요청에 스킬을 추가합니다
- Claude Console을 통한 버전 관리
- 커스텀 에이전트 구축을 위한 Claude Agent SDK와 호환됩니다

**API와 Claude.ai 중 언제 무엇을 사용할지:**

| 사용 사례 | 최적 환경 |
|---|---|
| 최종 사용자가 스킬과 직접 상호작용 | Claude.ai / Claude Code |
| 개발 중 수동 테스트 및 반복 작업 | Claude.ai / Claude Code |
| 개인적이고 임시적인 워크플로우 | Claude.ai / Claude Code |
| 프로그래밍 방식으로 스킬을 사용하는 애플리케이션 | API |
| 대규모 프로덕션 배포 | API |
| 자동화된 파이프라인 및 에이전트 시스템 | API |

**참고:** API에서 스킬을 사용하려면 Code Execution Tool 베타가 필요합니다. 이 도구는 스킬을 실행할 수 있는 안전한 환경을 제공합니다.

구현 세부사항은 다음 문서를 참고하세요:

- [Skills API Quickstart](https://docs.anthropic.com/en/docs/agents-and-tools/skills/quickstart)
- [Create Custom skills](https://docs.anthropic.com/en/docs/agents-and-tools/skills/build-skills)
- [Skills in the Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

### 현재 권장하는 배포 방식

GitHub에 공개 저장소를 만들어 스킬을 호스팅합니다. 명확한 README, 스크린샷이 있는 사용 예시를 포함하세요. README는 사람을 위한 것이므로 스킬 폴더에 넣지 않습니다. 그런 다음 MCP 문서에 스킬 링크를 추가하고, 둘을 함께 쓸 때의 이점을 설명하는 빠른 시작 가이드를 담습니다.

#### 1. GitHub에 호스팅

- 오픈소스 스킬을 위한 공개 저장소
- 설치 방법이 담긴 명확한 README
- 사용 예시와 스크린샷

#### 2. MCP 저장소에 문서화

- MCP 문서에서 스킬로 링크 연결
- 함께 사용할 때의 이점 설명
- 빠른 시작 가이드 포함

#### 3. 설치 가이드 작성

```markdown
## [Your Service] 스킬 설치하기

1. 스킬 다운로드:
   - 저장소 클론: `git clone https://github.com/yourcompany/skills`
   - 또는 Releases에서 ZIP 다운로드

2. Claude에 설치:
   - Claude.ai > Settings > skills 열기
   - "Upload skill" 클릭
   - 스킬 폴더 선택 (압축된 상태)

3. 스킬 활성화:
   - [Your Service] 스킬 토글 켜기
   - MCP 서버가 연결되어 있는지 확인

4. 테스트:
   - Claude에게 질문: "Set up a new project in [Your Service]"
```

### 스킬 포지셔닝

스킬을 어떻게 설명하는지가 사용자의 이해와 참여를 좌우합니다. README, 문서, 마케팅 자료 등을 작성할 때 다음 원칙을 기억하세요.

**기능이 아닌 성과에 집중하세요:**

✅ **좋은 예:**

```
"ProjectHub 스킬을 사용하면 팀이 완전한 프로젝트 워크스페이스를 몇 초 만에 설정할 수 있습니다. 페이지, 데이터베이스, 템플릿이 포함되어 있어 수동으로 설정하는 30분을 아낄 수 있습니다."
```

❌ **나쁜 예:**

```
"ProjectHub 스킬은 YAML frontmatter와 Markdown 지시사항이 담긴 폴더로, MCP 서버 도구를 호출합니다."
```

**MCP + 스킬 스토리를 강조하세요:**

```
"우리 MCP 서버는 Claude가 Linear 프로젝트에 접근할 수 있게 합니다. 우리 스킬은 Claude에게 팀 스프린트 계획 워크플로우를 가르칩니다. 두 가지를 함께 사용하면 AI 기반 프로젝트 관리가 가능해집니다."
```

## 참고 자료

- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) - 원문 PDF
- [Agent Skills Specification](https://github.com/anthropics/agent-skills-spec)
- [Skills API Quickstart](https://docs.anthropic.com/en/docs/agents-and-tools/skills/quickstart)
- [Create Custom Skills](https://docs.anthropic.com/en/docs/agents-and-tools/skills/build-skills)
- [Skills in the Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)
