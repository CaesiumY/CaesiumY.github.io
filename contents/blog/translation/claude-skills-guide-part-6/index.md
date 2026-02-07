---
title: "[번역] Claude 스킬 구축 완벽 가이드 - 6부: 리소스와 레퍼런스"
description: "공식 문서, 예제 스킬, 도구/유틸리티, 지원 채널, 퀵 체크리스트, YAML frontmatter 레퍼런스 등 스킬 개발에 필요한 모든 리소스를 정리합니다."
pubDatetime: 2026-02-06T23:19:39Z
modDatetime: 2026-02-07T00:40:00Z
ogImage: "./chapter-6-cover.png"
featured: false
draft: false
tags: ["translation", "claude", "skills", "resources", "references", "ai", "anthropic"]
series: "Claude 스킬 구축 완벽 가이드"
---

> 이 문서는 Anthropic의 ["The Complete Guide to Building Skills for Claude"](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf) 중 Part 6의 한글 번역입니다. 원본 PDF를 6부로 나누어 번역하며, 이번 글은 마지막 파트로, 리소스와 레퍼런스를 정리합니다.

## 목차

## 핵심 요약

<details>
<summary><strong>📌 TL;DR (클릭하여 펼치기)</strong></summary>

### 주요 내용
- **공식 문서**: 모범 사례 가이드, API 레퍼런스, MCP 문서 등 핵심 리소스
- **예제 스킬**: Anthropic이 제공하는 프로덕션용 스킬 레포지토리
- **skill-creator**: Claude에 내장된 스킬 생성/검증 도구
- **퀵 체크리스트**: 개발 시작 전부터 업로드 후까지 전 단계 검증 항목
- **YAML frontmatter 레퍼런스**: 필수/선택 필드 및 보안 주의사항
- **완전한 예제**: PDF, DOCX, PPTX, XLSX 생성 등 실전 스킬 코드

### 핵심 메시지
- 첫 스킬을 만든다면 모범 사례 가이드로 시작하세요
- skill-creator를 쓰면 빠르게 초안을 만들 수 있습니다
- 체크리스트를 따라 누락 사항을 방지하세요

</details>

---

**원문 작성일**: 2024년

**작성자**: Anthropic

## Chapter 6: 리소스와 레퍼런스

첫 번째 스킬을 만든다면 모범 사례 가이드로 시작한 뒤, 필요하면 API 문서를 확인하세요.

### 공식 문서

**Anthropic 리소스:**

- [Best Practices Guide](https://docs.anthropic.com/en/docs/agents-and-tools/skills/best-practices)
- [Skills Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/skills)
- [API Reference](https://docs.anthropic.com/en/api/skills)
- [MCP Documentation](https://modelcontextprotocol.io/)

**블로그 포스트:**

- [Introducing Agent Skills](https://www.anthropic.com/news/agent-skills)
- [Engineering Blog: Equipping Agents for the Real World](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world)
- [Skills Explained](https://www.anthropic.com/news/skills-explained)
- [How to Create Skills for Claude](https://www.anthropic.com/news/how-to-create-skills-for-claude)
- [Building Skills for Claude Code](https://www.anthropic.com/news/building-skills-for-claude-code)
- [Improving Frontend Design through Skills](https://www.anthropic.com/news/improving-frontend-design-through-skills)

### 예제 스킬

**공개 스킬 레포지토리:**

- GitHub: [anthropics/skills](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills)
- Anthropic 제공 스킬을 자유롭게 수정해서 쓸 수 있습니다

### 도구와 유틸리티

**skill-creator 스킬:**

- Claude.ai와 Claude Code에 내장되어 있습니다
- 스킬 설명을 입력하면 자동으로 스킬을 생성합니다
- 검토 의견과 개선안도 제시합니다
- 사용법: "skill-creator를 사용해서 스킬을 만들어줘"

**검증:**

- skill-creator로 스킬 품질을 평가할 수 있습니다
- 요청 예시: "이 스킬을 검토하고 개선점을 제안해줘"

### 지원받기

**기술 질문:**

- 일반 질문: [Claude Developers Discord](https://discord.gg/anthropic) 커뮤니티 포럼

**버그 리포트:**

- GitHub Issues: [anthropics/skills/issues](https://github.com/anthropics/anthropic-cookbook/issues)
- 포함할 내용: 스킬 이름, 에러 메시지, 재현 단계

---

## 레퍼런스 A: 퀵 체크리스트

스킬을 업로드하기 전후에 이 체크리스트로 검증하세요. 빠르게 시작하려면 skill-creator 스킬로 초안을 만든 뒤, 이 체크리스트로 빠진 부분이 없는지 확인하세요.

### 시작하기 전

- [ ] 구체적인 사용 사례 2-3개 정리
- [ ] 필요한 도구 파악 (내장 또는 MCP)
- [ ] 이 가이드와 예제 스킬 검토
- [ ] 폴더 구조 설계

### 개발 중

- [ ] 폴더명이 kebab-case
- [ ] SKILL.md 파일 존재 (정확한 철자)
- [ ] YAML frontmatter에 --- 구분자 있음
- [ ] name 필드: kebab-case, 공백 없음, 대문자 없음
- [ ] description에 WHAT과 WHEN 포함
- [ ] XML 태그(< >)가 어디에도 없음
- [ ] 지시사항이 명확하고 실행 가능함
- [ ] 에러 핸들링 포함
- [ ] 예제 제공
- [ ] 레퍼런스가 명확하게 링크됨

### 업로드 전

- [ ] 명확한 작업에서 트리거 테스트 완료
- [ ] 다른 표현으로 바꾼 요청에서 트리거 테스트 완료
- [ ] 관련 없는 주제에서 트리거되지 않는지 확인
- [ ] 기능 테스트 통과
- [ ] 도구 통합 작동 확인 (해당하는 경우)
- [ ] .zip 파일로 압축 완료

### 업로드 후

- [ ] 실제 대화에서 테스트
- [ ] 과소/과대 트리거 모니터링
- [ ] 사용자 피드백 수집
- [ ] description과 지시사항 계속 개선
- [ ] 메타데이터의 버전 업데이트

---

## 레퍼런스 B: YAML frontmatter

### 필수 필드

```yaml
---
name: skill-name-in-kebab-case
description: 스킬이 하는 일과 사용 시점. 구체적인 트리거 문구를 포함하세요.
---
```

### 모든 선택 필드

```yaml
name: skill-name
description: [필수 description]
license: MIT # 선택: 오픈소스 라이선스
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch" # 선택: 도구 접근 제한
metadata: # 선택: 커스텀 필드
  author: Company Name
  version: 1.0.0
  mcp-server: server-name
  category: productivity
  tags: [project-management, automation]
  documentation: https://example.com/docs
  support: support@example.com
```

### 보안 주의사항

**허용:**

- 모든 표준 YAML 타입 (문자열, 숫자, 불리언, 리스트, 객체)
- 커스텀 메타데이터 필드
- 긴 description (최대 1024자)

**금지:**

- XML 꺾쇠 괄호(< >) - 보안 제한
- YAML 내 코드 실행 (안전한 YAML 파싱 사용)
- "claude" 또는 "anthropic" 접두사가 붙은 스킬명 (예약어)

---

## 레퍼런스 C: 완전한 스킬 예제

이 가이드의 패턴을 완전히 구현한 프로덕션 수준의 스킬:

- Document Skills - [PDF](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/pdf), [DOCX](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/docx), [PPTX](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/pptx), [XLSX](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills/xlsx) 생성
- [Example Skills](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/skills) - 다양한 워크플로우 패턴
- [Partner Skills Directory](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/partner-skills) - Asana, Atlassian, Canva, Figma, Sentry, Zapier 등 다양한 파트너의 스킬

이 저장소들은 계속 업데이트되며, 가이드보다 많은 예제를 담고 있습니다. 복제해 자신의 상황에 맞게 수정하고 템플릿으로 사용하세요.

## 참고 자료

- [The Complete Guide to Building Skills for Claude - 원문 PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- [Claude 스킬 구축 완벽 가이드 - 1부: 소개와 기본 구조](/posts/claude-skills-guide-part-1/)
- [Claude 스킬 구축 완벽 가이드 - 2부: description 필드 작성법](/posts/claude-skills-guide-part-2/)
- [Claude 스킬 구축 완벽 가이드 - 3부: 지시사항 작성 기법](/posts/claude-skills-guide-part-3/)
- [Claude 스킬 구축 완벽 가이드 - 4부: 도구, 테스트, 배포](/posts/claude-skills-guide-part-4/)
- [Claude 스킬 구축 완벽 가이드 - 5부: 패턴과 트러블슈팅](/posts/claude-skills-guide-part-5/)
- [Anthropic Skills 공식 문서](https://docs.anthropic.com/en/docs/agents-and-tools/skills)
- [Anthropic Skills API Reference](https://docs.anthropic.com/en/api/skills)
- [Anthropic Skills GitHub Repository](https://github.com/anthropics/anthropic-cookbook/tree/main/skills)
