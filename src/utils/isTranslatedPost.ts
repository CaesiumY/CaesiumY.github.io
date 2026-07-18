import { BLOG_PATH } from "@/content.config";

// 번역글은 이 디렉터리 아래에만 존재한다. getPath.ts가 이 경로를 URL로
// 변환하므로 디렉터리는 이미 공개 URL 구조의 일부다.
const TRANSLATION_DIR = `${BLOG_PATH}/translation/`;

/**
 * 포스트가 번역글인지 판별한다.
 * @param filePath - CollectionEntry의 filePath (상대 경로, undefined 가능)
 */
export function isTranslatedPost(filePath: string | undefined): boolean {
  return filePath?.startsWith(TRANSLATION_DIR) ?? false;
}
