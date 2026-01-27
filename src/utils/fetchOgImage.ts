import type { Project } from "@/data/projects";

/**
 * URL에서 OG 이미지를 추출합니다.
 * 캐싱 없이 항상 새로 fetch합니다.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AstroBot/1.0; +https://astro.build)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // og:image 메타 태그 파싱
    const ogImageMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (ogImageMatch?.[1]) {
      return ogImageMatch[1];
    }

    // content가 먼저 오는 경우도 처리
    const ogImageMatchAlt = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );
    if (ogImageMatchAlt?.[1]) {
      return ogImageMatchAlt[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 프로젝트의 OG 이미지를 가져옵니다.
 * liveUrl → githubUrl 순서로 시도합니다.
 */
export async function fetchProjectOgImage(
  project: Project
): Promise<string | null> {
  // liveUrl이 있으면 먼저 시도
  if (project.liveUrl) {
    const ogImage = await fetchOgImage(project.liveUrl);
    if (ogImage) {
      return ogImage;
    }
  }

  // liveUrl에서 못 찾았거나 없으면 GitHub에서 시도
  return fetchOgImage(project.githubUrl);
}
