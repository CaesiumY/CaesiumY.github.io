import { test, expect, type Page } from "@playwright/test";

// 테스트용 블로그 포스트 (기존 테스트와 동일한 포스트 사용)
const TEST_POST_SLUG = "ai/claude-code-token-burning-session-retrospect";
const TEST_POST_URL = `/posts/${TEST_POST_SLUG}`;

/**
 * hydration 및 스크립트 실행 완료 대기
 */
async function waitForPostFeatures(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("article", { state: "visible" });
  // heading-link가 나타날 때까지 대기 (스크립트 실행 완료 신호)
  await page.waitForSelector(".heading-link", { state: "attached" });
  // 이중 호출이 발생할 수 있는 시간 충분히 대기
  await page.waitForTimeout(500);
}

/**
 * 페이지의 모든 헤딩에 대해 .heading-link가 정확히 1개인지 검증
 */
async function verifyNoHeadingLinkDuplicates(page: Page) {
  const result = await page.evaluate(() => {
    const article = document.querySelector("article");
    if (!article) return { error: "article not found" };

    const headings = Array.from(
      article.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]")
    );

    const duplicates: string[] = [];
    let totalHeadings = 0;
    let totalLinks = 0;

    for (const heading of headings) {
      totalHeadings++;
      const links = heading.querySelectorAll(".heading-link");
      totalLinks += links.length;
      if (links.length !== 1) {
        duplicates.push(
          `${heading.tagName}#${heading.id}: ${links.length}개 링크`
        );
      }
    }

    return { totalHeadings, totalLinks, duplicates };
  });

  expect(result).not.toHaveProperty("error");
  expect(result.totalHeadings).toBeGreaterThan(0);
  expect(result.duplicates).toEqual([]);
  expect(result.totalLinks).toBe(result.totalHeadings);
}

test.describe("헤딩 앵커 링크 - 중복 방지", () => {
  test("직접 URL 접근 시 각 헤딩에 # 링크가 정확히 1개만 존재해야 함", async ({
    page,
  }) => {
    // 직접 URL 접근 (새로고침과 동일한 시나리오)
    await page.goto(TEST_POST_URL);
    await waitForPostFeatures(page);

    await verifyNoHeadingLinkDuplicates(page);
  });

  test("View Transitions 네비게이션 후에도 # 링크가 1개만 존재해야 함", async ({
    page,
  }) => {
    // 포스트 목록 페이지 방문
    await page.goto("/posts");
    await page.waitForLoadState("networkidle");

    // 테스트 포스트 링크 클릭 (View Transitions 발동)
    const link = page.locator(`a[href="${TEST_POST_URL}"]`).first();
    if (await link.isVisible()) {
      await link.click();
    } else {
      // 페이지네이션 등으로 링크가 보이지 않으면 직접 이동
      await page.goto(TEST_POST_URL);
    }

    await waitForPostFeatures(page);
    await verifyNoHeadingLinkDuplicates(page);
  });

  test("뒤로가기/앞으로가기 후에도 중복 없어야 함", async ({ page }) => {
    // 포스트 목록 방문 → 포스트 진입
    await page.goto("/posts");
    await page.waitForLoadState("networkidle");

    await page.goto(TEST_POST_URL);
    await waitForPostFeatures(page);

    // 뒤로가기
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // 앞으로가기
    await page.goForward();
    await waitForPostFeatures(page);

    await verifyNoHeadingLinkDuplicates(page);
  });

  test("# 링크의 href가 올바른 heading id를 가리켜야 함", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPostFeatures(page);

    const result = await page.evaluate(() => {
      const article = document.querySelector("article");
      if (!article) return { error: "article not found" };

      const headings = Array.from(
        article.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]")
      );

      const mismatches: string[] = [];

      for (const heading of headings) {
        const link = heading.querySelector(".heading-link");
        if (!link) {
          mismatches.push(`${heading.tagName}#${heading.id}: 링크 없음`);
          continue;
        }

        const expectedHref = `#${heading.id}`;
        const actualHref = link.getAttribute("href");

        if (actualHref !== expectedHref) {
          mismatches.push(
            `${heading.tagName}#${heading.id}: expected="${expectedHref}", actual="${actualHref}"`
          );
        }

        if (!heading.id) {
          mismatches.push(`${heading.tagName}: id가 비어있음`);
        }
      }

      return { totalChecked: headings.length, mismatches };
    });

    expect(result).not.toHaveProperty("error");
    expect(result.totalChecked).toBeGreaterThan(0);
    expect(result.mismatches).toEqual([]);
  });

  test("# 링크의 접근성 속성이 올바르게 설정되어야 함", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPostFeatures(page);

    const result = await page.evaluate(() => {
      const article = document.querySelector("article");
      if (!article) return { error: "article not found" };

      const links = Array.from(article.querySelectorAll(".heading-link"));
      const issues: string[] = [];

      for (const link of links) {
        const span = link.querySelector("span");
        if (!span) {
          issues.push("span 요소 없음");
          continue;
        }

        if (span.getAttribute("aria-hidden") !== "true") {
          issues.push(
            `aria-hidden="${span.getAttribute("aria-hidden")}" (expected "true")`
          );
        }

        if (span.textContent !== "#") {
          issues.push(
            `textContent="${span.textContent}" (expected "#")`
          );
        }
      }

      return { totalChecked: links.length, issues };
    });

    expect(result).not.toHaveProperty("error");
    expect(result.totalChecked).toBeGreaterThan(0);
    expect(result.issues).toEqual([]);
  });
});
