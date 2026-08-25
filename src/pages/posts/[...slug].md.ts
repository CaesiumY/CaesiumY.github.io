import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";
import { isPostVisible } from "@/utils/postVisibility";
import { buildPostMarkdown } from "@/utils/postMarkdown";

/**
 * 글 URL 뒤에 `.md`를 붙이면 원본 마크다운을 준다.
 *
 * GitHub Pages는 Accept 헤더 기반 콘텐츠 협상을 할 수 없다. 대신 고정 URL로
 * 마크다운 표현을 하나 더 두어, 에이전트가 HTML을 파싱하지 않고도 본문을
 * 얻게 한다.
 *
 * getStaticPaths는 posts/[...slug]/index.astro와 같은 집합이어야 한다.
 * 어긋나면 HTML은 있는데 .md는 404이거나 그 반대가 된다.
 */
export async function getStaticPaths() {
  const allPosts = await getCollection("blog");
  const posts = import.meta.env.PROD
    ? allPosts.filter(isPostVisible)
    : allPosts;

  return posts.map(post => ({
    params: { slug: getPath(post.id, post.filePath, false) },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const body = await buildPostMarkdown(props.post as CollectionEntry<"blog">);
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
