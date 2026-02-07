import type { APIRoute } from "astro";
import { generateOgImageForSeriesList } from "@/utils/generateOgImages";

export const GET: APIRoute = async () => {
  const buffer = await generateOgImageForSeriesList();
  return new Response(buffer as BodyInit, {
    headers: { "Content-Type": "image/png" },
  });
};
