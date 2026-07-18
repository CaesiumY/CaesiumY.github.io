import { test, expect, type Page } from "@playwright/test";

/**
 * 게시글 목록의 번역/자작 분리 검증.
 *
 * 주의: 이 스펙은 dev 서버(DEV 모드)에서 돈다. DEV에서는 draft 글이 목록에
 * 노출되므로(postVisibility.ts) 탭별 총 글 수·페이지 수가 프로덕션 빌드와
 * 다르다 — contents/blog/_samples/의 17편은 전부 draft이지만 로더 패턴이
 * 파일명만 거르고 디렉터리는 거르지 않아 DEV 목록에 포함된다. 그래서 총
 * 글 수에 의존하는 단언 대신, draft 수와 무관하게 항상 참인 분류 불변식을
 * 검증한다.
 */
test.describe("게시글 번역/자작 탭 분리", () => {
  const cards = (page: Page) => page.locator("#main-content ul > li");
  const nextLink = (page: Page) =>
    page.getByLabel("Pagination").getByRole("link", { name: "다음 페이지" });

  test("authored 탭에는 번역글이 섞이지 않는다", async ({ page }) => {
    await page.goto("/posts/authored");

    // 첫 페이지는 항상 postPerPage(8)만큼 채워진다
    await expect(cards(page)).toHaveCount(8);

    // 자작 탭에 [번역] 제목이 단 하나도 없어야 한다 (분류의 핵심 불변식)
    await expect(cards(page).filter({ hasText: "[번역]" })).toHaveCount(0);

    // 페이지네이션이 전체 목록이 아니라 이 탭 기준으로 동작한다
    await expect(nextLink(page)).toHaveAttribute("href", "/posts/authored/2");
  });

  test("translated 탭에는 번역글만 있다", async ({ page }) => {
    await page.goto("/posts/translated");

    await expect(cards(page)).toHaveCount(8);

    // 번역 탭의 모든 카드가 [번역] 제목이어야 한다
    await expect(cards(page).filter({ hasText: "[번역]" })).toHaveCount(8);

    // 페이지네이션이 전체 목록이 아니라 이 탭 기준으로 동작한다
    await expect(nextLink(page)).toHaveAttribute("href", "/posts/translated/2");
  });

  test("전체 탭에서 세 탭 링크가 보이고 이동된다", async ({ page }) => {
    await page.goto("/posts");
    const tabs = page.getByRole("navigation", { name: "게시글 분류" });
    await expect(tabs.getByRole("link", { name: "전체" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "직접 쓴 글" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "번역" })).toBeVisible();

    await tabs.getByRole("link", { name: "직접 쓴 글" }).click();
    await expect(page).toHaveURL(/\/posts\/authored\/?$/);

    await page
      .getByRole("navigation", { name: "게시글 분류" })
      .getByRole("link", { name: "번역" })
      .click();
    await expect(page).toHaveURL(/\/posts\/translated\/?$/);
  });

  test("authored breadcrumb은 '직접 쓴 글'이고 'authored'가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/posts/authored");
    const crumb = page.getByLabel("breadcrumb");
    await expect(crumb).toContainText("직접 쓴 글");
    await expect(crumb).not.toContainText("authored");
  });

  test("translated 2페이지 breadcrumb은 '번역 (2페이지)'", async ({ page }) => {
    await page.goto("/posts/translated/2");
    const crumb = page.getByLabel("breadcrumb");
    await expect(crumb).toContainText("번역");
    await expect(crumb).toContainText("2페이지");
    await expect(crumb).not.toContainText("translated");
  });

  test("translated 탭 첫 카드에 번역 배지가 있다", async ({ page }) => {
    await page.goto("/posts/translated");
    const firstCard = page.locator("#main-content ul > li").first();
    await expect(
      firstCard.getByText("번역", { exact: true })
    ).toBeVisible();
  });

  test("authored 탭 카드에는 번역 배지가 없다", async ({ page }) => {
    await page.goto("/posts/authored");
    const cards = page.locator("#main-content ul > li");
    await expect(cards.getByText("번역", { exact: true })).toHaveCount(0);
  });

  // 홈 Featured 섹션은 Card가 아니라 FeaturedCard를 쓰므로 배지 적용이 별개 경로다.
  // 콘텐츠 의존: featured 번역글이 최소 1편 있어야 한다(현재 claude-skills-guide-part-1,
  // harness-design-long-running-apps). 둘 다 featured를 떼면 이 테스트는 실패한다.
  test("홈 Featured의 번역글에도 배지가 있다", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator("#featured");
    await expect(
      featured.getByText("번역", { exact: true }).first()
    ).toBeVisible();
  });
});
