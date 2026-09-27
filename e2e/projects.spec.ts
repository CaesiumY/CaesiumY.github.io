import { test, expect, type Page } from "@playwright/test";

/**
 * /projects 카드 썸네일 검증.
 *
 * 카드 이미지는 loading="lazy"라 뷰포트 밖이면 요청조차 하지 않는다. 뷰포트를
 * 페이지 전체가 들어갈 만큼 키워 모든 이미지의 로드를 한 번에 트리거한다.
 *
 * ⚠️ 스모크는 실네트워크에 의존한다. dev 서버가 요청 시점에 liveUrl/githubUrl의
 * og:image를 가져오고, 브라우저가 그 외부 이미지를 직접 받는다. 여기서 실패하면
 * 대개 외부 이미지가 실제로 깨진 것이다 (src/data/projects.ts 점검).
 */

const PROJECTS_URL = "/projects";
const CARD = "main article";
const IMAGE = '[data-project-thumb="image"]';
const PLACEHOLDER = '[data-project-thumb="placeholder"]';

async function revealAllCards(page: Page) {
  // 카드가 그려진 뒤에 높이를 잰다 (dev 서버 리로드 중 빈 DOM을 세지 않도록)
  await expect(page.locator(CARD).first()).toBeVisible();
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  await page.setViewportSize({ width: 1280, height });
}

test("모든 카드 썸네일이 실제로 로드된다 (스모크)", async ({ page }) => {
  await page.goto(PROJECTS_URL);
  await revealAllCards(page);

  const images = page.locator(`${IMAGE} img`);
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    await expect
      .poll(
        () =>
          img.evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0
          ),
        {
          message: `썸네일이 로드되지 않음: ${await img.getAttribute("src")}`,
          timeout: 20_000,
        }
      )
      .toBe(true);
  }

  // 빌드 타임에 이미지를 못 구했거나 런타임에 폴백된 카드가 없어야 한다
  await expect(page.locator(PLACEHOLDER)).toHaveCount(0);
});

test("이미지 로드가 실패하면 카드가 플레이스홀더로 바뀐다", async ({
  page,
}) => {
  // 특정 프로젝트 URL에 기대지 않도록 모든 이미지 요청을 끊는다
  await page.route("**/*", route =>
    route.request().resourceType() === "image"
      ? route.abort()
      : route.continue()
  );

  await page.goto(PROJECTS_URL);
  await revealAllCards(page);

  const cardCount = await page.locator(CARD).count();
  expect(cardCount).toBeGreaterThan(0);

  await expect(page.locator(IMAGE)).toHaveCount(0);
  await expect(page.locator(PLACEHOLDER)).toHaveCount(cardCount);
  // 교체된 플레이스홀더도 아이콘을 그린다 (astro-icon symbol/use 함정 회귀 방지)
  await expect(page.locator(`${PLACEHOLDER} svg path`)).toHaveCount(cardCount);
});

test("깨진 카드만 플레이스홀더로 바뀌고 나머지는 이미지를 유지한다", async ({
  page,
}) => {
  await page.goto(PROJECTS_URL);
  await revealAllCards(page);

  const cardCount = await page.locator(CARD).count();
  const firstCard = page.locator(CARD).first();
  const brokenSrc = await firstCard
    .locator(`${IMAGE} img`)
    .evaluate((el: HTMLImageElement) => el.src);

  // 첫 카드의 이미지 URL 하나만 끊고 다시 로드 (라우팅 중엔 HTTP 캐시가 꺼진다)
  await page.route(
    url => url.href === brokenSrc,
    route => route.abort()
  );
  await page.reload();
  await revealAllCards(page);

  await expect(firstCard.locator(PLACEHOLDER)).toHaveCount(1);
  await expect(firstCard.locator(IMAGE)).toHaveCount(0);
  await expect(page.locator(IMAGE)).toHaveCount(cardCount - 1);
});
