import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { isTranslatedPost } from "@/utils/isTranslatedPost";
import getUniqueTags from "@/utils/getUniqueTags";
import getPostsByTag from "@/utils/getPostsByTag";
import getUniqueSeries from "@/utils/getUniqueSeries";
import getPostsBySeries from "@/utils/getPostsBySeries";
import { SITE } from "@/config";

/**
 * @astrojs/sitemap이 내는 sitemap-index.xml은 파일명을 바꿀 수 없고 URL별
 * <lastmod>도 싣지 않는다. 관례 경로인 /sitemap.xml에서 lastmod를 포함한
 * urlset을 직접 만든다. 두 사이트맵은 공존하며, 자동 생성분은 라우트가
 * 늘어나도 따라오는 안전망으로 남긴다.
 *
 * URL 형태는 각 페이지의 canonical과 똑같이 맞춘다(후행 슬래시 포함).
 * 어긋나면 크롤러에게 같은 문서가 둘로 보인다.
 */

interface SitemapEntry {
  path: string;
  lastmod: Date;
}

const BUILT_AT = new Date();

/** 글의 최종 변경 시각. modDatetime이 없으면 발행 시각이 곧 최종 변경이다. */
const postUpdatedAt = (post: CollectionEntry<"blog">) =>
  new Date(post.data.modDatetime ?? post.data.pubDatetime);

/**
 * 글 묶음의 최종 변경 시각. 글이 없으면 빌드 시각으로 대체한다. 비어 있을 때
 * epoch(1970)를 내보내면 크롤러에게 죽은 페이지로 읽힌다.
 */
const latestOf = (posts: CollectionEntry<"blog">[]) =>
  posts.length === 0
    ? BUILT_AT
    : posts.reduce<Date>((latest, post) => {
        const updated = postUpdatedAt(post);
        return updated > latest ? updated : latest;
      }, new Date(0));

/**
 * 목록 라우트의 페이지네이션 URL을 만든다. paginate()와 같은 규칙이어야
 * 하므로 pageSize는 SITE.postPerPage 하나로 통일한다.
 * 1페이지는 base 그대로, 2페이지부터 `${base}${n}/`.
 */
const paginatedEntries = (
  base: string,
  posts: CollectionEntry<"blog">[]
): SitemapEntry[] => {
  // 글이 0편이어도 1페이지는 만든다. Astro의 paginate가 lastPage를
  // Math.max(1, ...)로 잡아 빈 목록에도 페이지를 생성하기 때문이다. 여기서
  // 빈 배열을 돌려주면 살아 있는 라우트가 사이트맵에서 빠진다.
  const pageSize = SITE.postPerPage;
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));

  return Array.from({ length: pageCount }, (_, index) => {
    const pagePosts = posts.slice(index * pageSize, (index + 1) * pageSize);
    return {
      path: index === 0 ? base : `${base}${index + 1}/`,
      lastmod: latestOf(pagePosts),
    };
  });
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const renderUrl = ({ path, lastmod }: SitemapEntry) =>
  `  <url>\n    <loc>${escapeXml(encodeURI(`${SITE.website}${path}`))}</loc>\n    <lastmod>${lastmod.toISOString()}</lastmod>\n  </url>`;

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog");
  const sortedPosts = getSortedPosts(allPosts);

  const authored = sortedPosts.filter(post => !isTranslatedPost(post.filePath));
  const translated = sortedPosts.filter(post =>
    isTranslatedPost(post.filePath)
  );

  const tags = getUniqueTags(allPosts);
  const series = getUniqueSeries(allPosts);

  const entries: SitemapEntry[] = [
    { path: "/", lastmod: latestOf(sortedPosts) },

    ...paginatedEntries("/posts/", sortedPosts),
    ...paginatedEntries("/posts/authored/", authored),
    ...paginatedEntries("/posts/translated/", translated),

    ...sortedPosts.map(post => ({
      path: `${getPath(post.id, post.filePath)}/`,
      lastmod: postUpdatedAt(post),
    })),

    { path: "/tags/", lastmod: latestOf(sortedPosts) },
    ...tags.flatMap(({ tag }) =>
      paginatedEntries(`/tags/${tag}/`, getPostsByTag(allPosts, tag))
    ),

    { path: "/series/", lastmod: latestOf(sortedPosts) },
    ...series.flatMap(({ series: slug }) =>
      paginatedEntries(`/series/${slug}/`, getPostsBySeries(allPosts, slug))
    ),

    // 정적 문서. 내용이 바뀌면 배포가 일어나므로 빌드 시각이 곧 최종 변경이다.
    { path: "/about/", lastmod: BUILT_AT },
    { path: "/contact/", lastmod: BUILT_AT },
    { path: "/privacy/", lastmod: BUILT_AT },
    { path: "/search/", lastmod: BUILT_AT },
    // /portfolio는 noindex, /drafts는 dev 전용이므로 싣지 않는다.
    ...(SITE.showProjects ? [{ path: "/projects/", lastmod: BUILT_AT }] : []),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(renderUrl).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
