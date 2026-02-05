import type { CollectionEntry } from "astro:content";
import { isPostVisible } from "./postVisibility";

/**
 * Get all posts in the same series, sorted by pubDatetime ascending (oldest first)
 */
const getSeriesPosts = (
  posts: CollectionEntry<"blog">[],
  seriesName: string
): CollectionEntry<"blog">[] => {
  return posts
    .filter(post => isPostVisible(post) && post.data.series === seriesName)
    .sort(
      (a, b) =>
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000)
    );
};

export default getSeriesPosts;
