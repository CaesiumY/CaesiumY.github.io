import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { isPostVisible } from "./postVisibility";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]): Tag[] => {
  // Map을 사용하여 단일 순회로 중복 제거 및 태그 수집 (O(n) 시간복잡도)
  const tagMap = new Map<string, string>();

  // 가시적인 포스트만 필터링하고 태그를 Map에 저장
  for (const post of posts) {
    if (!isPostVisible(post)) continue;

    for (const tag of post.data.tags) {
      const slug = slugifyStr(tag);
      // Map은 중복 키를 자동으로 처리하므로 O(1) 시간에 중복 제거
      if (!tagMap.has(slug)) {
        tagMap.set(slug, tag);
      }
    }
  }

  // Map을 Tag[] 형태로 변환하고 정렬 (O(n log n))
  return Array.from(tagMap.entries())
    .map(([tag, tagName]) => ({ tag, tagName }))
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
};

export default getUniqueTags;
