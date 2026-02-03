import type { GiscusProps } from "@giscus/react";

export const SITE = {
  website: "https://caesiumy.dev", // replace this with your deployed domain
  profile: "https://github.com/caesiumy",
  desc: "AI 도구와 워크플로우 자동화로 개발자 생산성을 높이는 프론트엔드 엔지니어의 블로그",
  title: "Caesiumy's BLOG",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showProjects: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false, // 수정 기능 비활성화
    text: "GitHub에서 수정하기",
    url: "https://github.com/CaesiumY/CaesiumY.github.io/edit/main/contents/blog/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ko", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Seoul", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

  // 저자 정보
  author: "윤창식",
  authorEn: "Chang-sik Yoon",
  authorDescription:
    "AI로 생산성을 혁신하고 지식을 연결하는 프론트엔드 엔지니어",
  social: {
    github: "https://github.com/caesiumy",
    linkedin: "https://www.linkedin.com/in/chang-sik-yoon/",
    email: "dbs2636@gmail.com",
  },
  keywords: [
    "AI",
    "Claude Code",
    "TypeScript",
    "Next.js",
    "React",
    "프론트엔드",
    "개발 생산성",
    "자동화",
  ],
} as const;

export const GISCUS: GiscusProps = {
  repo: "CaesiumY/CaesiumY.github.io",
  repoId: "MDEwOlJlcG9zaXRvcnkxMjcyNzg1NDk=",
  category: "General",
  categoryId: "DIC_kwDOB5Yd1c4Cy3Ow",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",
  lang: "ko",
  loading: "lazy",
};
