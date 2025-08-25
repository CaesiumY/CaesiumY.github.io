import type { CollectionEntry } from "astro:content";
import { isPostVisible } from "./postVisibility";

const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts
    .filter(isPostVisible)
    .sort(
      (a, b) =>
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
    );
};

export default getSortedPosts;
