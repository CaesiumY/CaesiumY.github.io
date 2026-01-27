import type { Project } from "@/data/projects";

/**
 * 이미지 URL이 유효한 http/https URL인지 검증합니다.
 * javascript:, data: 등 위험한 프로토콜을 차단합니다.
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://example.com");
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * URL에서 OG 이미지를 추출합니다.
 * 캐싱 없이 항상 새로 fetch합니다.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AstroBot/1.0; +https://astro.build)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // og:image 메타 태그 파싱 (ReDoS 방지를 위해 길이 제한)
    const ogImageMatch = html.match(
      /<meta[^>]{0,500}property=["']og:image["'][^>]{0,500}content=["']([^"']+)["']/i
    );
    if (ogImageMatch?.[1]) {
      const imageUrl = ogImageMatch[1];
      return isValidImageUrl(imageUrl) ? imageUrl : null;
    }

    // content가 먼저 오는 경우도 처리
    const ogImageMatchAlt = html.match(
      /<meta[^>]{0,500}content=["']([^"']+)["'][^>]{0,500}property=["']og:image["']/i
    );
    if (ogImageMatchAlt?.[1]) {
      const imageUrl = ogImageMatchAlt[1];
      return isValidImageUrl(imageUrl) ? imageUrl : null;
    }

    // Twitter 카드 이미지 fallback (twitter:image)
    const twitterImageMatch = html.match(
      /<meta[^>]{0,500}(?:name|property)=["']twitter:image["'][^>]{0,500}content=["']([^"']+)["']/i
    );
    if (twitterImageMatch?.[1]) {
      const imageUrl = twitterImageMatch[1];
      return isValidImageUrl(imageUrl) ? imageUrl : null;
    }

    // Twitter 카드 이미지 fallback (content 먼저)
    const twitterImageMatchAlt = html.match(
      /<meta[^>]{0,500}content=["']([^"']+)["'][^>]{0,500}(?:name|property)=["']twitter:image["']/i
    );
    if (twitterImageMatchAlt?.[1]) {
      const imageUrl = twitterImageMatchAlt[1];
      return isValidImageUrl(imageUrl) ? imageUrl : null;
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
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
