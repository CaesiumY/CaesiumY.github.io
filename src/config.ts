export const SITE = {
  website: "https://caesiumy.github.io/", // replace this with your deployed domain
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
} as const;
