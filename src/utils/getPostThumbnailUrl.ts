import type { CollectionEntry } from "astro:content";
import { getPath } from "./getPath";
import { SITE } from "@/config";

/**
 * Resolve the thumbnail URL for a blog post.
 * Priority: ogImage (string) > ogImage (ImageMetadata) > dynamic OG image > undefined
 * Logic extracted from PostDetails.astro:42-54
 */
export function getPostThumbnailUrl(
  post: CollectionEntry<"blog">
): string | undefined {
  const { ogImage } = post.data;

  if (typeof ogImage === "string") {
    return ogImage;
  }

  if (ogImage?.src) {
    return ogImage.src;
  }

  if (SITE.dynamicOgImage) {
    return `${getPath(post.id, post.filePath)}/og.png`;
  }

  return undefined;
}
