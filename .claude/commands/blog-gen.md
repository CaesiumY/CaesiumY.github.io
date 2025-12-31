---
allowed-tools: [Skill]
argument-hint: "[제목]"
description: AI 기반 블로그 포스트 자동 생성 (blog-writer 스킬 호출)
---

# /blog-gen

이 커맨드는 `/blog-writer` 스킬을 호출하여 블로그 글 작성을 수행합니다.

## 스킬이 제공하는 기능

- ✅ 기존 글 스타일 분석 및 스타일 가이드 참조
- ✅ 품질 자동 검토 (100점 만점, 80점 이상 통과)
- ✅ 자동 수정 루프 (80점 미만 시 최대 3회)
- ✅ 사용자 최종 승인 단계
- ✅ 피드백 학습 및 스타일 가이드 자동 업데이트

## 실행

Skill 도구를 사용하여 `blog-writer` 스킬을 호출하세요.

**사용자 입력**: $ARGUMENTS
