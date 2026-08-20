import { test, expect } from "@playwright/test";

test("테마별 파비콘이 올바른 이미지와 연결되어야 함", async ({
  page,
  request,
}) => {
  await page.goto("/");

  const fallbackIcon = page.locator(
    'link[rel="icon"][href="/favicon.svg"]:not([media])'
  );
  const lightIcon = page.locator(
    'link[rel="icon"][media="(prefers-color-scheme: light)"]'
  );
  const darkIcon = page.locator(
    'link[rel="icon"][media="(prefers-color-scheme: dark)"]'
  );

  await expect(fallbackIcon).toHaveAttribute("type", "image/svg+xml");
  await expect(lightIcon).toHaveAttribute("href", "/favicon-light.png");
  await expect(darkIcon).toHaveAttribute("href", "/favicon-dark.png");

  const [lightResponse, darkResponse] = await Promise.all([
    request.get("/favicon-light.png"),
    request.get("/favicon-dark.png"),
  ]);

  expect(lightResponse.headers()["content-type"]).toContain("image/png");
  expect(darkResponse.headers()["content-type"]).toContain("image/png");
});
