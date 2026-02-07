import sharp from "sharp";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import aboutOgImage from "./og-templates/about";
import seriesListOgImage from "./og-templates/series-list";
import seriesDetailOgImage from "./og-templates/series-detail";

async function svgBufferToPngBuffer(svg: string) {
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = (await postOgImage(post)) as string;
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = (await siteOgImage()) as string;
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForAbout() {
  const svg = (await aboutOgImage()) as string;
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSeriesList() {
  const svg = (await seriesListOgImage()) as string;
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSeriesDetail(seriesName: string) {
  const svg = (await seriesDetailOgImage(seriesName)) as string;
  return svgBufferToPngBuffer(svg);
}
