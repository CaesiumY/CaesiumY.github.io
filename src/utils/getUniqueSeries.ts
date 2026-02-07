import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { isPostVisible } from "./postVisibility";
import { getPath } from "./getPath";

interface Series {
  series: string;
  seriesName: string;
  count: number;
}

interface SeriesWithMeta {
  series: string;
  seriesName: string;
  count: number;
  latestUpdate: Date;
  previewPosts: {
    title: string;
    href: string;
  }[];
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

export const getUniqueSeriesWithMeta = (
  posts: CollectionEntry<"blog">[]
): SeriesWithMeta[] => {
  const seriesMap = new Map<
    string,
    { name: string; posts: CollectionEntry<"blog">[] }
  >();

  for (const post of posts) {
    if (!isPostVisible(post)) continue;
    if (!post.data.series) continue;

    const slug = slugifyStr(post.data.series);
    const existing = seriesMap.get(slug);
    if (existing) {
      existing.posts.push(post);
    } else {
      seriesMap.set(slug, { name: post.data.series, posts: [post] });
    }
  }

  return Array.from(seriesMap.entries())
    .filter(([, { posts }]) => posts.length >= 2)
    .map(([series, { name, posts: seriesPosts }]) => {
      const sortedAsc = [...seriesPosts].sort(
        (a, b) =>
          new Date(a.data.pubDatetime).getTime() -
          new Date(b.data.pubDatetime).getTime()
      );

      const latestUpdate = sortedAsc.reduce((latest, post) => {
        const postDate = new Date(
          post.data.modDatetime ?? post.data.pubDatetime
        );
        return postDate > latest ? postDate : latest;
      }, new Date(0));

      const previewPosts = sortedAsc.slice(0, 3).map(post => ({
        title: post.data.title,
        href: getPath(post.id, post.filePath),
      }));

      return {
        series,
        seriesName: name,
        count: seriesPosts.length,
        latestUpdate,
        previewPosts,
      };
    })
    .sort((a, b) => b.latestUpdate.getTime() - a.latestUpdate.getTime());
};

export default getUniqueSeries;
