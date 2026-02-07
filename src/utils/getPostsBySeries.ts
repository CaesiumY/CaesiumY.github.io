import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { isPostVisible } from "./postVisibility";

const getPostsBySeries = (
  posts: CollectionEntry<"blog">[],
  series: string
): CollectionEntry<"blog">[] =>
  posts
    .filter(
      post =>
        isPostVisible(post) &&
        post.data.series !== undefined &&
        slugifyStr(post.data.series) === series
    )
    .sort(
      (a, b) =>
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000)
    );

export default getPostsBySeries;
