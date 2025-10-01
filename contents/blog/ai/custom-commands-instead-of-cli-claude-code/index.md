---
title: "블로그 글 초안을 생성하는 CLI 대신 Custom Commands 만들기(feat. Claude Code)"
description: "Claude Code의 Custom Commands 기능을 활용해 블로그 글 초안 생성을 자동화하는 실용적 가이드"
pubDatetime: 2025-09-27T12:00:00Z
modDatetime: 2025-09-27T12:00:00Z
slug: "custom-commands-instead-of-cli-claude-code"
featured: false
draft: true
tags: ["claude-code", "ai"]
---

## 목차

## 개요
마크다운 기반 블로그를 직접 만들고 나면 떠오르는 문제점은 바로 **마크다운 파일을 어떻게 관리할 것인가**라고 생각한다. 관리자 대시보드가 있는 것도 아니고, 그저 코드 에디터로 파일을 관리하기 때문이다. 특히 '프론트 매터(Frontmatter)' 와 같이 매번 마크다운 글 생성 때마다 규칙을 지켜 작성해야 하는 것이 꽤나 번거롭다.

## CLI 방식의 글 생성 방법
그래서 떠올린 게 바로 마크다운 파일 생성기이다. CLI 라고 하면 거창하지만, 그저 스크립트 파일을 만들고 명령어를 입력하면(`npm run gen:blog`) CLI 툴처럼 여러 선택지를 거쳐 마크다운 파일을 생성할 수 있는 것이다. 
하나 예시를 들자면 `npm create vite` 정도가 있겠다. 해당 명령어 입력 시에는 프로젝트 명, 사용할 프레임워크와 언어, 번들러를 고를 수 있는 것처럼 말이다.

이런 툴을 만들어야지! 하고 생각하니 신나서 CLI용 프레임워크도 찾아보고, npm 패키지로 배포할 생각도 해보았**었**다.

## CLI 방식의 한계점

[작성할 내용을 여기에 입력하세요]

기존 CLI 도구의 문제점:
- 복잡한 설정과 환경 구성
- 제한적인 커스터마이징
- AI 기반 동적 콘텐츠 생성의 어려움

## Claude Code Custom Commands 소개

[작성할 내용을 여기에 입력하세요]

Claude Code의 Custom Commands 기능:
- 마크다운 기반 명령어 정의
- AI와의 자연스러운 통합
- 프로젝트별 맞춤형 워크플로우

## Custom Commands 기본 구조

[작성할 내용을 여기에 입력하세요]

명령어 작성의 핵심 요소:
- 마크다운 문서 구조
- 매개변수와 플래그 정의
- 실행 프로세스 설계

## 블로그 생성 명령어 구현

[작성할 내용을 여기에 입력하세요]

/blog-gen 명령어 구현:
- 제목 분석 알고리즘
- 슬러그 자동 생성
- 메타데이터 처리

## AI 기반 동적 콘텐츠 생성

[작성할 내용을 여기에 입력하세요]

AI가 제공하는 가치:
- 제목 의도 파악
- 섹션 구조 자동 설계
- 태그 추천 시스템

## CLI vs Custom Commands 비교

[작성할 내용을 여기에 입력하세요]

실제 사용 경험 비교:
- 설정의 용이성
- 사용자 경험
- 유지보수성

## 활용 팁과 베스트 프랙티스

[작성할 내용을 여기에 입력하세요]

효율적인 활용 방법:
- 명령어 설계 원칙
- 프로젝트별 맞춤화
- 협업 환경에서의 활용

## 마무리

[작성할 내용을 여기에 입력하세요]

Custom Commands의 미래 가능성과 개발자 생산성 향상에 대한 전망

## 참고 자료

- [Claude Code Slash Commands 공식 문서](https://docs.claude.com/ko/docs/claude-code/slash-commands#%EC%82%AC%EC%9A%A9%EC%9E%90-%EC%A0%95%EC%9D%98-%EC%8A%AC%EB%9E%98%EC%8B%9C-%EB%AA%85%EB%A0%B9%EC%96%B4)
- 