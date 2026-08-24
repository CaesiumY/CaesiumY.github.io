import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const BLOG_PATH = "contents/blog";
export const PAGES_PATH = "contents/pages";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      series: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `./${PAGES_PATH}` }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    robots: z.string().optional(),
    // 사이트맵의 lastmod로 쓴다. 빌드 시각을 대신 쓰면 글 하나만 올려도
    // 이 페이지들이 "방금 수정됨"으로 바뀌어 lastmod 자체가 무의미해진다.
    // 적지 않으면 사이트맵에서 lastmod를 생략한다.
    modDatetime: z.date().optional(),
  }),
});

export const collections = { blog, pages };
