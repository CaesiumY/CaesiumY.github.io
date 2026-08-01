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
    icon({
      include: {
        ph: ["*"], // Include all Phosphor icons
      },
    }),
    sitemap({
      filter: page =>
        (SITE.showProjects || !page.endsWith("/projects")) &&
        !page.endsWith("/portfolio") &&
        !page.endsWith("/portfolio/"),
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
