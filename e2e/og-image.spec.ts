import { test, expect } from "@playwright/test";

test.describe("OG 이미지 - 메타 태그 및 엔드포인트 검증", () => {
  test("블로그 포스트의 og:image가 og.png 패턴을 사용해야 함", async ({
    page,
  }) => {
    await page.goto("/posts/ai/claude-code-token-burning-session-retrospect");

    const ogImageContent = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogImageContent).not.toBeNull();
    expect(ogImageContent).toMatch(/\/og\.png$/);
    expect(ogImageContent).toContain("/posts/");
  });

  test("홈페이지의 og:image가 사이트 기본 og.png을 사용해야 함", async ({
    page,
  }) => {
    await page.goto("/");

    const ogImageContent = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogImageContent).not.toBeNull();
    expect(ogImageContent).toMatch(/\/og\.png$/);
  });

  test("About 페이지의 og:image가 /about/og.png을 사용해야 함", async ({
    page,
  }) => {
    await page.goto("/about");

    const ogImageContent = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogImageContent).not.toBeNull();
    expect(ogImageContent).toContain("/about/og.png");
  });

  test("시리즈 목록 페이지의 og:image가 /series/og.png을 사용해야 함", async ({
    page,
  }) => {
    await page.goto("/series");

    const ogImageContent = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogImageContent).not.toBeNull();
    expect(ogImageContent).toContain("/series/og.png");
  });

  test("블로그 포스트의 OG 이미지 엔드포인트가 유효한 PNG를 반환해야 함", async ({
    page,
    request,
  }) => {
    await page.goto("/posts/ai/claude-code-token-burning-session-retrospect");

    const ogImageContent = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(ogImageContent).not.toBeNull();

    const ogImageUrl = new URL(ogImageContent!);
    const response = await request.get(ogImageUrl.pathname);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("사이트 기본 OG 이미지 엔드포인트가 유효한 PNG를 반환해야 함", async ({
    request,
  }) => {
    const response = await request.get("/og.png");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});
