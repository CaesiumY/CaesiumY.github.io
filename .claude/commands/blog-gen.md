# /blog-gen - AI 기반 블로그 포스트 생성

## Purpose
AI가 제목을 분석하여 최적화된 블로그 포스트 구조를 자동 생성합니다. 한글 제목을 영문 슬러그로 변환하고, 관련 태그를 추천하며, 제목의 의미에 맞는 동적 섹션 구조를 생성합니다.

## Usage
```
/blog-gen "[제목]" [--category <카테고리>] [--tags <태그>] [--featured] [--draft] [--template <경로>]
```

## Arguments
- **title** (필수) - 블로그 글 제목
- **--category** - 카테고리 지정 (기본값: technical)  
  - 기존 카테고리 사용을 권장하나, 콘텐츠 특성에 따라 새 카테고리 생성 가능
  - **새 카테고리**: 필요시 새 카테고리명 지정 가능 (자동으로 디렉토리 생성)
- **--tags** - 태그 목록 (쉼표로 구분하여 수동 지정)
- **--featured** - 주요 글로 설정 (기본값: false)
- **--draft** - 초안 상태로 생성 (기본값: true)
- **--template** - 참조할 기존 포스트 경로

## Execution Process

### 1. 제목 AI 분석
- 제목의 의도와 주제 파악
- 글의 성격 분석 (튜토리얼, 회고, 가이드, 분석 등)
- 대상 독자층 예측
- 적절한 글의 구조와 흐름 설계

### 2. 자동 슬러그 생성
- 한글 제목을 의미있는 영문으로 번역
- URL-friendly 형식 변환
- 특수문자 제거, 소문자 변환, 공백을 하이픈으로 변경
- 예시:
  ```
  "React 성능 최적화 완벽 가이드" → "react-performance-optimization-guide"
  "2024년 개발 회고" → "2024-dev-retrospective" 
  "스타트업에서 배운 5가지" → "5-lessons-from-startup"
  ```

### 3. AI 기반 태그 추천
- 제목에서 핵심 키워드 추출
- 기존 블로그 포스트의 태그 패턴 학습
- 카테고리와 제목을 고려한 관련 태그 5-7개 자동 추천
- 사용자 지정 태그가 있으면 추천 태그 대신 사용

### 4. 동적 섹션 구조 생성
AI가 제목을 분석하여 완전 맞춤형 섹션 헤더를 생성합니다:

#### 기술 튜토리얼 예시: "Next.js 14 서버 컴포넌트 완벽 가이드"
```markdown
## 목차
## 서버 컴포넌트란 무엇인가?
## 기존 방식과의 차이점
## 서버 컴포넌트 기본 사용법
## 클라이언트 컴포넌트와의 조합
## 성능 최적화 전략
## 실전 예제로 배우기
## 주의사항과 베스트 프랙티스
## 마무리
```

#### 회고 글 예시: "토스 면접 후기와 합격 전략"
```markdown
## 목차
## 지원 계기와 준비 과정
## 서류 전형 통과 비결
## 기술 면접 경험담
## 컬쳐 핏 면접 후기
## 합격을 위한 핵심 포인트
## 면접에서 배운 것들
## 예비 지원자들을 위한 조언
## 마무리
```

#### 프로젝트 글 예시: "실시간 채팅 앱 개발기"
```markdown
## 목차
## 프로젝트 개요와 목표
## 기술 스택 선정 이유
## 아키텍처 설계 과정
## 핵심 기능 구현
## 실시간 통신 최적화
## 배포와 운영 경험
## 회고와 개선점
## 마무리
```

### 5. 파일 생성
- 폴더 구조: `contents/blog/[category]/[slug]/`
- `index.md` 파일 생성
- 이미지 디렉토리 준비
- 프론트매터 자동 구성

## Generated File Structure

```markdown
---
title: "[입력된 제목]"
description: "[AI가 생성한 한 줄 설명]"
pubDatetime: [현재 시간]
modDatetime: [현재 시간]
slug: "[자동 생성된 영문 슬러그]"
featured: false
draft: true
tags: ["ai추천태그1", "ai추천태그2", "ai추천태그3", "ai추천태그4", "ai추천태그5"]
ogImage: "./hero-image.png"
---

## 목차

## [AI가 생성한 섹션 1]

[작성할 내용을 여기에 입력하세요]

## [AI가 생성한 섹션 2]

[작성할 내용을 여기에 입력하세요]

## [AI가 생성한 섹션 3]

[작성할 내용을 여기에 입력하세요]

...

## 마무리

[작성할 내용을 여기에 입력하세요]

## 참고 자료

- 
```

## Usage Examples

```bash
# 기본 사용 - AI가 모든 것을 자동 생성
/blog-gen "TypeScript 제네릭 마스터하기"

# 카테고리 지정 (기존 카테고리)
/blog-gen "토스 면접 후기와 합격 전략" --category career

# 새 카테고리 생성
/blog-gen "블록체인 기초 이해하기" --category blockchain

# 주요 글로 생성
/blog-gen "2024년 프론트엔드 트렌드 총정리" --featured

# 태그 수동 지정 (AI 추천 대신 사용)
/blog-gen "Docker 컨테이너 최적화 가이드" --tags "docker,devops,optimization,container"

# 초안이 아닌 발행 상태로 생성
/blog-gen "React 19 새로운 기능 살펴보기" --no-draft

# 기존 포스트를 템플릿으로 사용
/blog-gen "Vue 3 성능 최적화" --template "contents/blog/technical/react-optimization"
```

## Tool Orchestration

### Primary Tools
- **Read**: 기존 블로그 포스트 구조 분석, 태그 패턴 학습
- **Write**: 새 블로그 포스트 파일 생성
- **Bash**: 폴더 생성 및 파일 시스템 작업

### Process Flow
1. **Analysis Phase**: Read로 기존 포스트들의 메타데이터와 구조 분석
2. **AI Processing**: 제목 분석 → 슬러그 생성 → 태그 추천 → 섹션 구조 설계
3. **Generation Phase**: Write로 완성된 마크다운 파일 생성
4. **Validation Phase**: 생성된 파일의 프론트매터와 구조 검증

## Quality Assurance
- 프론트매터가 Astro content schema와 호환되는지 검증
- 생성된 슬러그의 유일성 확인
- 이미지 디렉토리와 파일 경로 유효성 검사
- 마크다운 문법 준수 여부 확인

## Advanced Features
- **시리즈 연결**: 관련 포스트들을 시리즈로 연결
- **SEO 최적화**: description 자동 생성
- **이미지 최적화**: hero-image 플레이스홀더 준비
- **태그 일관성**: 기존 태그 체계와의 일관성 유지