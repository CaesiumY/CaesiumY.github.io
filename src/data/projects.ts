export interface Project {
  title: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  ogImage?: string;
  techStack: string[];
  date: Date;
  featured?: boolean;
  category?: "outsourced" | "side" | "personal";
}

export const projects: Project[] = [
  // 외주 프로젝트
  {
    title: "교육 지원 플랫폼",
    description:
      "AI-Native 워크플로우 기반 교육 지원 서비스. MSW를 활용한 선제적 인터페이스 설계로 개발 기간 50% 단축.",
    liveUrl: "https://www.chungbook-e.com/",
    ogImage:
      "https://www.chungbook-e.com/opengraph-image.jpg?e993f9fb9b0e04a9",
    techStack: ["Next.js", "TypeScript", "MSW", "AI Agents"],
    date: new Date("2025-05-01"),
    featured: true,
    category: "outsourced",
  },
  {
    title: "한국 기술 마켓",
    description:
      "Turborepo 기반 모노레포로 다중 브랜드 서비스 운영. FSD 아키텍처와 Suspense/ErrorBoundary로 선언적 UI 구현.",
    liveUrl: "https://kotechmarket.com/",
    techStack: ["Next.js", "TypeScript", "Turborepo", "FSD", "Suspense"],
    date: new Date("2024-05-01"),
    featured: true,
    category: "outsourced",
  },
  // 개인 블로그
  {
    title: "CaesiumY Blog",
    description: "Astro와 AstroPaper 템플릿으로 만든 개인 블로그입니다.",
    githubUrl: "https://github.com/CaesiumY/CaesiumY.github.io",
    liveUrl: "https://caesiumy.github.io",
    techStack: ["Astro", "TypeScript", "TailwindCSS"],
    date: new Date("2024-01-01"),
    featured: true,
    category: "personal",
  },
  // 사이드 프로젝트
  {
    title: "Notion API 블로그",
    description:
      "Next.js App Router와 ISR을 활용한 노션 연동 블로그. 페이지 로딩 속도 최적화.",
    githubUrl: "https://github.com/CaesiumY/notion-blog-v2",
    liveUrl: "https://notion-blog-v2-dusky.vercel.app/",
    techStack: ["Next.js", "TypeScript", "Notion API", "ISR"],
    date: new Date("2023-05-01"),
    category: "side",
  },
  {
    title: "마치 무비 나잇",
    description:
      "Firebase Realtime Database를 활용한 실시간 좌석 예매 시스템. 풀스택 1인 개발.",
    liveUrl: "https://mrch-movie-night.vercel.app/",
    techStack: ["Next.js", "Firebase", "Realtime Database"],
    date: new Date("2023-02-01"),
    category: "side",
  },
  {
    title: "마헤 뮤지컬 사이트",
    description:
      "웹 폰트 최적화를 통한 Lighthouse 성능 점수 100점(All Green) 달성.",
    githubUrl: "https://github.com/CaesiumY/mahe-musical",
    liveUrl: "https://musical-ticketing.vercel.app/",
    techStack: ["Next.js", "TypeScript"],
    date: new Date("2022-04-01"),
    category: "side",
  },
];
