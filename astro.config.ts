import { defineConfig, envField } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import icon from "astro-icon";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

// 사이트맵에서 제외할 페이지. /portfolio는 noindex이고, /projects는
// SITE.showProjects가 꺼지면 404로 리다이렉트된다.
const EXCLUDED_FROM_SITEMAP = new Set(
  [
    `${SITE.website}/portfolio`,
    ...(SITE.showProjects ? [] : [`${SITE.website}/projects`]),
  ].map(url => url.replace(/\/+$/, ""))
);

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  // Astro 7부터 기본값이 'jsx'로 바뀌어 인라인 요소 사이 공백을 더 공격적으로
  // 제거한다. 이 사이트는 .astro 템플릿에서 "텍스트 다음 줄에 인라인 요소"
  // 패턴을 쓰는 곳이 있어 실제로 렌더 공백이 사라진다(예: "만나보세요. 더 자세한").
  // Astro 6과 동일한 렌더를 유지하려고 명시적으로 true로 둔다.
  compressHTML: true,
  integrations: [
    react(),
    // include(사전 빌드된 @iconify-json/* 패키지 로드)만 쓰는 한 astro-icon은
    // @iconify/tools를 import하지 않는다. 여기에 로컬/커스텀 아이콘 컬렉션
    // 로딩(예: dir 옵션)을 추가하면 loadLocalCollection.js 경로가 활성화되며
    // extract-zip(GHSA-jmr9-qjv8-65gv, package.json의 ignoreGhsas로 억제 중)이
    // 실제로 실행 가능해진다 — 그 경우 audit 예외를 재검토할 것. 근거: PR #138
    icon({
      include: {
        ph: ["*"], // Include all Phosphor icons
      },
    }),
    sitemap({
      // endsWith로 걸러내면 /tags/portfolio 같은 태그 페이지까지 같이
      // 빠진다(실제로 빠져 있었다). 제외 대상은 정확히 그 URL 하나뿐이므로
      // 후행 슬래시만 정규화해 완전 일치로 판정한다.
      filter: page => !EXCLUDED_FROM_SITEMAP.has(page.replace(/\/+$/, "")),
    }),
  ],
  markdown: {
    // remark/rehype 플러그인은 Astro 6.4부터 unified() 프로세서로 전달해야 함.
    // (markdown.remarkPlugins/rehypePlugins/remarkRehype는 deprecated)
    processor: unified({
      remarkPlugins: [
        [remarkToc, { heading: "(table[ -]of[ -])?contents?|toc|목차" }],
        [
          remarkCollapse,
          {
            test: /^(Table of contents|목차)$/,
            summary: "목차 보기",
          },
        ],
      ],
    }),
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_GOOGLE_ANALYTICS_ID: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});
