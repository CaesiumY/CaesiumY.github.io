import type { APIRoute } from "astro";

// llms.txt는 robots.txt 표준 필드가 아니라 주석으로만 알린다. 실제 발견
// 경로는 Layout의 <link rel="alternate">와 사이트 내 링크다.
const getRobotsTxt = (sitemapURL: URL, llmsURL: URL) => `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}

# Agent-oriented site guide: ${llmsURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  const llmsURL = new URL("llms.txt", site);
  return new Response(getRobotsTxt(sitemapURL, llmsURL));
};
