import type { GiscusProps } from "@giscus/react";

export const SITE = {
  website: "https://caesiumy.dev", // replace this with your deployed domain
  profile: "https://github.com/caesiumy",
  desc: "🌍영문과에서 출발해 💻컴퓨터공학으로 도착하는 혼종 👨‍💻개발자의 기술 블로그",
  title: "Caesiumy's BLOG",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false, // 수정 기능 비활성화
    text: "GitHub에서 수정하기",
    url: "https://github.com/CaesiumY/CaesiumY.github.io/edit/main/astro-paper/contents/blog/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "ko", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Seoul", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

  // 저자 정보
  author: "리누스 토발즈",
  authorEn: "Linus Torvalds",
  authorDescription:
    "AI로 생산성을 혁신하고 지식을 연결하는 프론트엔드 엔지니어",
  social: {
    github: "https://github.com/username",
    linkedin: "https://www.linkedin.com/in/username/",
    email: "example@email.com",
  },
  keywords: [
    "TypeScript",
    "Next.js",
    "React",
    "TailwindCSS",
    "프론트엔드",
    "개발 블로그",
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
