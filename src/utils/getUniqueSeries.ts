import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { isPostVisible } from "./postVisibility";

interface Series {
  series: string;
  seriesName: string;
  count: number;
}

const getUniqueSeries = (posts: CollectionEntry<"blog">[]): Series[] => {
  const seriesMap = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    if (!isPostVisible(post)) continue;
    if (!post.data.series) continue;

    const slug = slugifyStr(post.data.series);
    const existing = seriesMap.get(slug);
    if (existing) {
      existing.count++;
    } else {
      seriesMap.set(slug, { name: post.data.series, count: 1 });
    }
  }

  return Array.from(seriesMap.entries())
    .filter(([, { count }]) => count >= 2)
    .map(([series, { name, count }]) => ({ series, seriesName: name, count }))
    .sort((a, b) => a.series.localeCompare(b.series));
};

export default getUniqueSeries;
