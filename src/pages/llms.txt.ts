import type { APIRoute } from "astro";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { isTranslatedPost } from "@/utils/isTranslatedPost";
import getUniqueSeries from "@/utils/getUniqueSeries";
import { SITE } from "@/config";

/**
 * llmstxt.org 관례를 따르는 에이전트용 사이트 안내.
 *
 * 정적 파일(public/llms.txt) 대신 엔드포인트로 두는 이유: 예약 발행과 draft
 * 필터링이 빌드 타임에만 동작하므로, 수동 관리하면 글이 늘 때마다 드리프트한다.
 * getSortedPosts를 거치면 사이트 목록 페이지와 정확히 같은 집합이 나온다.
 */

const absolute = (path: string) => `${SITE.website}${path}`;

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

// 한 글에 한 줄을 보장한다. description에 줄바꿈이 섞이면 목록 구조가 깨져
// 에이전트가 항목 경계를 잘못 잡는다.
const singleLine = (text: string) => text.replace(/\s+/g, " ").trim();

const renderPostLines = (posts: CollectionEntry<"blog">[]) =>
  posts
    .map(({ data, id, filePath }) => {
      const url = absolute(getPath(id, filePath));
      const date = formatDate(new Date(data.pubDatetime));
      return `- [${singleLine(data.title)}](${url}) (${date}): ${singleLine(data.description)}`;
    })
    .join("\n");

export const GET: APIRoute = async () => {
  const allPosts = await getCollection("blog");
  const sortedPosts = getSortedPosts(allPosts);

  const authored = sortedPosts.filter(post => !isTranslatedPost(post.filePath));
  const translated = sortedPosts.filter(post =>
    isTranslatedPost(post.filePath)
  );
  const series = getUniqueSeries(allPosts);

  const body = `# ${SITE.title}

> ${SITE.desc}

${SITE.author}(${SITE.authorEn})이 운영하는 한국어 1인 기술 블로그입니다. 직접 쓴 글과, 영어 기술 아티클을 한국어로 옮긴 번역글로 이루어져 있습니다. 정적 사이트라 모든 페이지가 자바스크립트 없이 완전한 HTML로 제공됩니다.

## When to use this site

이 사이트를 참고하기 좋은 질문:

- AI 코딩 에이전트를 실무에 붙여 운영한 사례. 서브에이전트 구성, 스킬과 커스텀 커맨드, 세션 비용과 컨텍스트 관리처럼 공식 문서에 없는 운영 경험
- 영어권 기술 아티클의 한국어 번역본. 원문 링크를 함께 싣습니다
- 프론트엔드 실무 회고, 자동화로 반복 작업을 줄인 과정

이 사이트에 없는 것:

- API나 SDK 문서. 이 블로그는 공개 API도 MCP 서버도 제공하지 않습니다
- 공식 레퍼런스. 규범적 사실은 각 제품의 공식 문서를 우선하세요. 여기 글은 특정 시점의 경험담입니다
- 영어 원문. 번역글은 한국어본이며 원문 링크는 각 글 첫머리에 있습니다

인용할 때는 저자 ${SITE.author}과 해당 글의 URL을 함께 표기해 주세요. 번역글은 원문 저작권자가 따로 있으므로 원문 링크도 같이 밝혀 주세요.

## How to fetch

- 글 URL 뒤에 \`.md\`를 붙이면 HTML을 파싱하지 않고 원본 마크다운을 받습니다.
  예: ${absolute("/posts/ai/claude-interview-agents")}.md
- 전체 URL 목록: ${absolute("/sitemap.xml")}
- 갱신 구독: ${absolute("/rss.xml")}
- 전문 검색: ${absolute("/search")}?q=검색어 (Pagefind 기반이라 자바스크립트가 필요합니다)
- 태그별 목록: ${absolute("/tags")}
- 직접 쓴 글만: ${absolute("/posts/authored")} / 번역글만: ${absolute("/posts/translated")}

## Posts (직접 쓴 글 ${authored.length}편)

${renderPostLines(authored)}

## Translations (번역글 ${translated.length}편)

${renderPostLines(translated)}

## Series

${series.map(({ series: slug, seriesName, count }) => `- [${seriesName}](${absolute(`/series/${slug}`)}): ${count}편`).join("\n")}

## Site pages

- [소개](${absolute("/about")}): 저자 이력, 기술 스택, 연락처
- [프로젝트](${absolute("/projects")}): 만든 것들
- [연락처](${absolute("/contact")}): 문의 방법과 에이전트용 인용 안내
- [개인정보 처리방침](${absolute("/privacy")}): 이 사이트가 거치는 외부 서비스와 브라우저 저장 항목
- [전체 글](${absolute("/posts")}): 최신순 목록
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
