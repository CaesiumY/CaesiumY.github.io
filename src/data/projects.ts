export interface Project {
  title: string;
  description: string;
  githubUrl: string;
  liveUrl?: string;
  techStack: string[];
  date: Date;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "CaesiumY Blog",
    description: "Astro와 AstroPaper 템플릿으로 만든 개인 블로그입니다.",
    githubUrl: "https://github.com/CaesiumY/CaesiumY.github.io",
    liveUrl: "https://caesiumy.github.io",
    techStack: ["Astro", "TypeScript", "TailwindCSS"],
    date: new Date("2024-01-01"),
    featured: true,
  },
];
