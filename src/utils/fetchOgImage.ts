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
 * 외부 절대 URL(http/https)인지 판정합니다.
 * base 없이 파싱하므로 `/projects/x.webp` 같은 루트 상대 경로는 false입니다.
 */
function isExternalUrl(url: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

/**
 * URL이 실제로 이미지를 돌려주는지 확인합니다.
 * 상태 코드가 아니라 content-type으로 판정합니다 — 200에 text/html을 주는
 * URL(이동된 파일, 로그인 페이지 등)이 카드에 깨진 이미지로 박히는 것을 막기
 * 위해서입니다. HEAD를 거부하는 호스트가 있어 GET을 쓰고, 본문은 읽지 않습니다.
 */
async function isImageUrl(url: string): Promise<boolean> {
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
    const contentType = response.headers.get("content-type") ?? "";
    // 판정에 본문은 필요 없으므로 다운로드를 끊는다 (실패해도 판정과 무관)
    await response.body?.cancel().catch(() => {});
    return contentType.toLowerCase().startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 프로젝트의 OG 이미지를 가져옵니다.
 * ogImage(수동) → liveUrl → githubUrl 순서로 시도합니다.
 */
export async function fetchProjectOgImage(
  project: Project
): Promise<string | null> {
  // 수동 ogImage: 로컬 경로는 그대로, 외부 URL은 이미지일 때만 사용
  if (project.ogImage) {
    if (!isExternalUrl(project.ogImage)) {
      return project.ogImage;
    }
    if (await isImageUrl(project.ogImage)) {
      return project.ogImage;
    }
  }

  // liveUrl이 있으면 시도
  if (project.liveUrl) {
    const ogImage = await fetchOgImage(project.liveUrl);
    if (ogImage) {
      return ogImage;
    }
  }

  // liveUrl에서 못 찾았거나 없으면 GitHub에서 시도
  if (project.githubUrl) {
    return fetchOgImage(project.githubUrl);
  }

  return null;
}
