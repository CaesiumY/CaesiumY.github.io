import type { CollectionEntry } from "astro:content";
import { getImage } from "astro:assets";
import { getPath } from "./getPath";
import { maskCodeRegions } from "./markdownCodeRegions";
import { SITE } from "@/config";

/**
 * 글의 원본 마크다운을 에이전트가 그대로 읽을 수 있는 형태로 만든다.
 *
 * 본문은 CollectionEntry.body를 쓴다. filePath로 파일을 직접 읽으면 상대
 * 경로의 기준(cwd)이 dev, build, CI에서 달라져 조용히 깨진다.
 */

// 글과 같은 폴더에 있는 이미지는 마크다운에 `./x.png`로 적혀 있지만, 빌드
// 후에는 해시가 붙은 에셋 URL로만 접근할 수 있다. 원본 경로에서 ImageMetadata로
// 가는 표를 미리 만들어 둔다. 키는 프로젝트 루트 기준 경로다.
// 여기서 import만 해서는 원본 파일이 배포에 실리지 않는다. 실제로 방출되는
// 것은 아래 getImage가 만드는 최적화본뿐이다.
const localImages = import.meta.glob<{ default: ImageMetadata }>(
  "/contents/blog/**/*.{png,jpg,jpeg,gif,webp,svg,avif}",
  { eager: true }
);

const dirnameOf = (filePath: string) =>
  filePath.slice(0, filePath.lastIndexOf("/"));

/** 마크다운의 상대 이미지 경로를 절대 에셋 URL로 바꾼다. */
const resolveLocalImages = async (body: string, filePath: string) => {
  const postDir = dirnameOf(filePath);
  const pattern = /(!?\[[^\]]*\]\()(\.\.?\/[^)\s]+)/g;

  // 치환값을 먼저 비동기로 모은 뒤 한 번에 바꾼다. String.replace는 비동기
  // 콜백을 기다리지 않는다.
  const replacements = new Map<string, string>();
  for (const [, , target] of body.matchAll(pattern)) {
    if (replacements.has(target)) continue;
    // URL.pathname은 한글 파일명을 퍼센트 인코딩한다. glob 키는 원래
    // 문자열이므로 되돌려야 매칭된다.
    const normalized = decodeURIComponent(
      new URL(target, `file:///${postDir}/`).pathname
    );
    const asset = localImages[normalized];
    if (!asset) continue;
    // 원본이 아니라 최적화본을 가리킨다. 원본을 그대로 참조하면 빌드가
    // 최적화 전 파일까지 배포에 실어야 해서 산출물이 두 배 가까이 커진다.
    const optimized = await getImage({ src: asset.default, format: "webp" });
    // getImage가 돌려주는 src는 이미 퍼센트 인코딩되어 있다. 여기서
    // 다시 인코딩하면 한글 파일명이 %25로 이중 인코딩되어 깨진다.
    replacements.set(target, `${SITE.website}${optimized.src}`);
  }

  return body.replace(pattern, (whole, prefix: string, target: string) => {
    const resolved = replacements.get(target);
    return resolved ? `${prefix}${resolved}` : whole;
  });
};

/** 링크의 사이트 내 절대 경로를 완전한 URL로 바꾼다. */
const absolutizeSiteLinks = (body: string) =>
  body.replace(
    /(!?\[[^\]]*\]\()(\/[^/)\s][^)\s]*)/g,
    (_, prefix, target) => `${prefix}${SITE.website}${target}`
  );

/** YAML 이중따옴표 스칼라. 따옴표, 백슬래시, 개행이 모두 안전해진다. */
const yaml = (value: string) => JSON.stringify(value);

export const buildPostMarkdown = async (post: CollectionEntry<"blog">) => {
  const { data, body = "", filePath = "" } = post;
  const canonical = `${SITE.website}${getPath(post.id, filePath)}`;

  // body에는 프론트매터가 없으므로 스키마 필드에서 최소 세트를 재구성한다.
  // 원본 YAML을 복원하지 않는 이유는 rawData가 비공개 API이기 때문이다.
  const frontmatter = [
    "---",
    `title: ${yaml(data.title)}`,
    `description: ${yaml(data.description)}`,
    `pubDatetime: ${new Date(data.pubDatetime).toISOString()}`,
    ...(data.modDatetime
      ? [`modDatetime: ${new Date(data.modDatetime).toISOString()}`]
      : []),
    `tags: ${JSON.stringify(data.tags)}`,
    ...(data.series ? [`series: ${yaml(data.series)}`] : []),
    `author: ${yaml(SITE.author)}`,
    `canonical: ${yaml(canonical)}`,
    "---",
    "",
  ].join("\n");

  // 코드 블록 안의 "보여주기용" 마크다운은 재작성 대상이 아니다. 예제가
  // 실제 URL로 바뀌면 독자가 그대로 따라 할 수 없다.
  const { masked, restore } = maskCodeRegions(body);
  const rewritten = absolutizeSiteLinks(
    await resolveLocalImages(masked, filePath)
  );
  const content = restore(rewritten);

  return `${frontmatter}${content.trimEnd()}\n`;
};
