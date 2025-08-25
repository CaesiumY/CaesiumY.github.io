<div align="center">

# Caesiumy's Blog

개발자 Caesiumy의 개인 블로그 웹사이트

---

## https://caesiumy.github.io/

**기술 스택**: Astro v5 + AstroPaper 템플릿  
**호스팅**: GitHub Pages  
**검색**: Pagefind (정적 검색)

<sub><sup>Template by <a href="https://github.com/satnaing/astro-paper">AstroPaper</a></sup></sub>

</div>

## 프로젝트 구조

```
CaesiumY.github.io/
├── astro-paper/           # 메인 블로그 (AstroPaper 기반)
│   ├── contents/blog/     # 블로그 포스트 (Markdown)
│   ├── src/               # 소스 코드
│   └── public/            # 정적 자산
├── README.md
└── CLAUDE.md
```

## 개발 시작하기

```bash
cd astro-paper/
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버 (localhost:4321)
pnpm build        # 프로덕션 빌드
pnpm preview      # 빌드 미리보기
```

## 주요 기능

- ✅ 반응형 디자인 (모바일 ~ 데스크톱)
- ✅ 접근성 지원 (VoiceOver, TalkBack 테스트 완료)
- ✅ SEO 최적화 (Sitemap, RSS, OG 이미지)
- ✅ 다크/라이트 모드
- ✅ 퍼지 검색 (Pagefind)
- ✅ Draft 포스트 기능
- ✅ 한글 현지화

## 마이그레이션 히스토리

- **2020~2021**: Gatsby v2 기반 블로그
- **2024**: Astro v5로 마이그레이션
- **2025**: AstroPaper 템플릿 적용 및 정리 완료
