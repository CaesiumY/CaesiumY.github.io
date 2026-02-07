import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import getUniqueSeries from "@/utils/getUniqueSeries";
import { generateOgImageForSeriesDetail } from "@/utils/generateOgImages";
import { SITE } from "@/config";

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("blog");
  const allSeries = getUniqueSeries(posts);

  return allSeries.map(({ series, seriesName }) => ({
    params: { series },
    props: { seriesName },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const { seriesName } = props as { seriesName: string };
  const buffer = await generateOgImageForSeriesDetail(seriesName);
  return new Response(buffer as BodyInit, {
    headers: { "Content-Type": "image/png" },
  });
};
