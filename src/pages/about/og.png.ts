import type { APIRoute } from "astro";
import { generateOgImageForAbout } from "@/utils/generateOgImages";

export const GET: APIRoute = async () => {
  const buffer = await generateOgImageForAbout();
  return new Response(buffer as BodyInit, {
    headers: { "Content-Type": "image/png" },
  });
};
