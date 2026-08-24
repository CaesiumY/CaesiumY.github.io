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
  /**
   * 실제 변경 시각을 알 수 없으면 비운다. sitemap 프로토콜에서 lastmod는
   * 선택 항목이고, 틀린 값은 없는 값보다 나쁘다.
   *
   * 빌드 시각으로 채우면 안 된다. 글 하나만 올려도 배포가 일어나므로 내용이
   * 그대로인 /about, /privacy 같은 페이지까지 "방금 수정됨"이 되고, 크롤러가
   * 사이트맵 타임스탬프 전체를 신뢰하지 않게 된다. 파일 mtime도 못 쓴다.
   * CI 체크아웃이 모든 파일을 같은 시각으로 새로 찍기 때문이다. git 커밋
   * 날짜는 배포 워크플로가 얕은 체크아웃이라 조회할 수 없다.
   */
  lastmod?: Date;
}

/** 글의 최종 변경 시각. modDatetime이 없으면 발행 시각이 곧 최종 변경이다. */
const postUpdatedAt = (post: CollectionEntry<"blog">) =>
  new Date(post.data.modDatetime ?? post.data.pubDatetime);

/** 글 묶음의 최종 변경 시각. 글이 없으면 알 수 없으므로 비운다. */
const latestOf = (posts: CollectionEntry<"blog">[]) =>
  posts.length === 0
    ? undefined
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

const renderUrl = ({ path, lastmod }: SitemapEntry) => {
  const loc = escapeXml(encodeURI(`${SITE.website}${path}`));
  const modified = lastmod
    ? `\n    <lastmod>${lastmod.toISOString()}</lastmod>`
    : "";
  return `  <url>\n    <loc>${loc}</loc>${modified}\n  </url>`;
};

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog");
  const sortedPosts = getSortedPosts(allPosts);

  const authored = sortedPosts.filter(post => !isTranslatedPost(post.filePath));
  const translated = sortedPosts.filter(post =>
    isTranslatedPost(post.filePath)
  );

  const tags = getUniqueTags(allPosts);
  const series = getUniqueSeries(allPosts);

  // 콘텐츠 페이지의 lastmod는 frontmatter의 modDatetime에서만 온다. 적혀
  // 있지 않으면 lastmod 없이 URL만 싣는다.
  const pages = await getCollection("pages");
  const pageUpdatedAt = (id: string) =>
    pages.find(page => page.id === id)?.data.modDatetime;

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

    { path: "/about/", lastmod: pageUpdatedAt("about") },
    { path: "/contact/", lastmod: pageUpdatedAt("contact") },
    { path: "/privacy/", lastmod: pageUpdatedAt("privacy") },
    // 코드로만 이루어진 페이지라 변경 시각을 알 방법이 없다.
    { path: "/search/" },
    // /portfolio는 noindex, /drafts는 dev 전용이므로 싣지 않는다.
    ...(SITE.showProjects ? [{ path: "/projects/" }] : []),
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
