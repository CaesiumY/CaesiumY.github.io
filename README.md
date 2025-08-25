# Caesiumy's Blog

개발자 Caesiumy의 개인 블로그 웹사이트

---

## 🌐 https://caesiumy.github.io/

**기술 스택**: Astro v5 + AstroPaper 템플릿  
**호스팅**: GitHub Pages  
**검색**: Pagefind (정적 검색)

<sub><sup>Template by <a href="https://github.com/satnaing/astro-paper">AstroPaper</a></sup></sub>

## 🚀 개발 시작하기

```bash
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버 (localhost:4321)
pnpm build        # 프로덕션 빌드
pnpm preview      # 빌드 미리보기
pnpm format       # 코드 포맷팅
pnpm lint         # ESLint 검사
```

## 📁 프로젝트 구조

```
CaesiumY.github.io/
├── contents/blog/       # 블로그 포스트 (Markdown)
├── src/                 # 소스 코드
│   ├── components/      # 재사용 컴포넌트
│   ├── layouts/         # 페이지 레이아웃
│   ├── pages/           # 라우팅 페이지
│   └── styles/          # 전역 스타일
├── public/              # 정적 자산
└── dist/                # 빌드 결과물
```

## ✨ 주요 기능

- ✅ 반응형 디자인 (모바일 ~ 데스크톱)
- ✅ 접근성 지원 (VoiceOver, TalkBack 테스트 완료)
- ✅ SEO 최적화 (사이트맵, RSS, OG 이미지)
- ✅ 다크/라이트 모드
- ✅ 퍼지 검색 (Pagefind)
- ✅ Draft 포스트 기능
- ✅ 태그 시스템
- ✅ 한글 현지화

## 🎨 기술 세부사항

- **프레임워크**: Astro v5.12.0 (SSG)
- **스타일링**: TailwindCSS v4.1.11
- **타입 검사**: TypeScript v5.8.3
- **검색 엔진**: Pagefind (정적 검색)
- **이미지 최적화**: Sharp (WebP 변환, 압축)
- **성능 목표**: Lighthouse 100점

## 📝 콘텐츠 작성

### 블로그 포스트

- **위치**: `contents/blog/`
- **형식**: Markdown/MDX
- **이미지**: 포스트와 같은 디렉토리에 배치 (Astro 이미지 최적화 활용)

### Frontmatter 예시

```yaml
title: "포스트 제목"
description: "포스트 설명"
pubDate: 2025-01-01
updatedDate: 2025-01-02 # 선택사항
heroImage: "./hero.jpg" # 선택사항
draft: false # 기본값: false
tags: ["개발", "블로그"] # 선택사항
```

## 🚀 배포

이 블로그는 GitHub Pages를 통해 자동 배포됩니다:

- **메인 브랜치**: `main` (소스 코드)
- **배포 브랜치**: `gh-pages` (빌드 결과물)
- **URL**: https://caesiumy.github.io/

## 📄 라이센스

이 프로젝트는 [MIT 라이센스](LICENSE)를 따릅니다.

---

<div align="center">
  <p>Built with ❤️ using <a href="https://astro.build">Astro</a> and <a href="https://github.com/satnaing/astro-paper">AstroPaper</a></p>
</div>
