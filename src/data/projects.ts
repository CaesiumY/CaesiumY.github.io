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
    ogImage: "https://www.chungbook-e.com/opengraph-image.jpg?e993f9fb9b0e04a9",
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
    date: new Date("2025-12-01"),
    featured: true,
    category: "personal",
  },
  {
    title: "dding-dong",
    description:
      "Claude Code 알림 플러그인. 작업 완료·에러·입력 요청 시 사운드 및 OS 알림 제공. AI 음성 합성(TTS) 커스텀 팩 지원.",
    githubUrl: "https://github.com/CaesiumY/dding-dong",
    liveUrl: "https://caesiumy.dev/dding-dong/",
    techStack: ["Claude Code", "Plugin", "Astro", "TTS"],
    date: new Date("2026-02-28"),
    featured: true,
    category: "personal",
  },
  {
    title: "agents-md-optimizer",
    description:
      "AI 에이전트 컨텍스트 파일(CLAUDE.md 등)을 agents-md 방법론으로 최적화하는 스킬. 발견 가능성 필터와 8가지 Gotcha 마이닝으로 에이전트 성능 향상.",
    githubUrl: "https://github.com/CaesiumY/agents-md-optimizer",
    techStack: ["JavaScript", "Claude Code", "Skill"],
    date: new Date("2026-03-01"),
    featured: true,
    category: "personal",
  },
  {
    title: "harness-optimizer",
    description:
      "Anthropic의 하네스 설계 원칙 8가지를 기반으로 멀티 에이전트 아키텍처를 평가·개선하는 Claude Code 스킬. 0~100점 건강도 진단 제공.",
    githubUrl: "https://github.com/CaesiumY/harness-optimizer",
    techStack: ["JavaScript", "Claude Code", "Skill"],
    date: new Date("2026-03-01"),
    featured: true,
    category: "personal",
  },
  {
    title: "cc-youtube-sub",
    description:
      "YouTube 영상 자막을 Claude Code CLI로 실시간 번역해 영상 위에 한국어 오버레이로 보여주는 Tauri 데스크톱 앱. 청크 단위 사전 버퍼링과 SQLite 캐시로 긴 영상도 매끄럽게 처리.",
    githubUrl: "https://github.com/CaesiumY/cc-youtube-sub",
    ogImage:
      "https://raw.githubusercontent.com/CaesiumY/cc-youtube-sub/main/docs/assets/readme/hero.png",
    techStack: ["Tauri", "Rust", "React", "TypeScript", "Claude Code"],
    date: new Date("2026-04-07"),
    featured: true,
    category: "personal",
  },
  {
    title: "rocky-skills",
    description:
      "Andy Weir 소설 『Project Hail Mary』의 외계 생명체 Rocky 화법을 LLM 출력 스타일로 패키징한 스킬 모음. 결과 우선·단편적·군더더기 없는 응답으로 출력 토큰을 평균 54% 절감하며, Claude Code·Cursor·Windsurf·Cline·Codex·Gemini CLI 등 6개 플랫폼을 지원한다.",
    githubUrl: "https://github.com/CaesiumY/rocky-skills",
    techStack: ["Claude Code", "AI Skills", "Python", "Shell", "PowerShell"],
    date: new Date("2026-05-05"),
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
