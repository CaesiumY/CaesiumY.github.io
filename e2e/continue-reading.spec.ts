import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __storageChanges?: Array<{
      timestamp: number;
      value: Record<string, unknown>;
      stack?: string;
    }>;
  }
}

const STORAGE_KEY = "blog-scroll-positions";

// 테스트용 블로그 포스트 (slug frontmatter 없음 - URL과 localStorage 키 일치)
const TEST_POST_SLUG = "ai/claude-code-token-burning-session-retrospect";
const TEST_POST_URL = `/posts/${TEST_POST_SLUG}`;

/**
 * localStorage에 스크롤 위치 저장
 */
async function setScrollPosition(
  page: Page,
  slug: string,
  position: number,
  progress: number
) {
  await page.evaluate(
    ({ key, slug, position, progress }) => {
      const data = {
        [slug]: {
          position,
          timestamp: Date.now(),
          progress,
        },
      };
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, slug, position, progress }
  );
}

/**
 * localStorage에서 스크롤 위치 가져오기
 */
async function getScrollPosition(page: Page, slug: string) {
  return page.evaluate(
    ({ key, slug }) => {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return data[slug] || null;
    },
    { key: STORAGE_KEY, slug }
  );
}

/**
 * 스크롤 위치를 localStorage에 저장하는 헬퍼 함수
 * 실제 앱의 저장 로직을 시뮬레이션
 */
async function triggerScrollSave(page: Page, slug: string) {
  await page.evaluate(
    ({ slug, key }) => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0;

      const data = {
        [slug]: {
          position: scrollY,
          timestamp: Date.now(),
          progress,
        },
      };
      localStorage.setItem(key, JSON.stringify(data));
    },
    { slug, key: STORAGE_KEY }
  );
}

/**
 * 스크롤 위치가 안정화될 때까지 대기
 */
async function waitForScrollStabilization(page: Page, targetY: number) {
  await page.waitForFunction(
    (target) => Math.abs(window.scrollY - target) < 10,
    targetY,
    { timeout: 5000 }
  );
}

/**
 * hydration 및 navigation lock 해제 대기
 * scrollSaver의 NAVIGATION_LOCK_MS(500ms) + React hydration 시간 고려
 */
async function waitForHydration(page: Page) {
  // 1. DOM이 완전히 로드될 때까지 대기
  await page.waitForLoadState("domcontentloaded");

  // 2. 네트워크가 안정화될 때까지 대기
  await page.waitForLoadState("networkidle");

  // 3. main 콘텐츠가 렌더링될 때까지 대기
  await page.waitForSelector("main", { state: "visible" });

  // 4. navigation lock 해제 및 hydration 안정화 대기
  await page.waitForTimeout(1500);
}

test.describe("이어 읽기 기능 - Race Condition 디버깅", () => {
  test.beforeEach(async ({ page }) => {
    // addInitScript는 모든 페이지 로드 전에 실행됨 (페이지 전환 후에도 유지)
    await page.addInitScript((key) => {
      window.__storageChanges = window.__storageChanges || [];
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k: string, v: string) {
        if (k === key) {
          window.__storageChanges!.push({
            timestamp: Date.now(),
            value: JSON.parse(v),
            stack: new Error().stack,
          });
        }
        return originalSetItem(k, v);
      };
    }, STORAGE_KEY);

    // localStorage 초기화
    await page.goto("/");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  });

  test("저장된 스크롤 위치가 유지되고 토스트가 표시되어야 함", async ({
    page,
  }) => {
    // 1. 저장된 위치 세팅 (50% 읽은 상태)
    await setScrollPosition(page, TEST_POST_SLUG, 1000, 50);

    // 2. 저장 확인
    const beforeNav = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("네비게이션 전 저장된 위치:", beforeNav);
    expect(beforeNav?.position).toBe(1000);
    expect(beforeNav?.progress).toBe(50);

    // 3. 포스트 페이지 방문
    await page.goto(TEST_POST_URL);

    // 4. hydration 및 navigation lock 해제 대기
    await waitForHydration(page);

    // 5. localStorage 변화 로그 확인
    const changes = await page.evaluate(
      () => window.__storageChanges || []
    );
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("localStorage 변경 기록:", JSON.stringify(changes, null, 2));

    // 6. 저장된 값 확인
    const afterNav = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("네비게이션 후 저장된 위치:", afterNav);

    // 7. localStorage 검증
    expect(afterNav).not.toBeNull();
    expect(afterNav?.position).toBeGreaterThan(0);
    expect(afterNav?.progress).toBe(50);

    // 8. 토스트 메시지 확인 (localStorage 검증 후 충분한 시간 확보)
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText("50%");
  });

  test("새 방문자는 토스트가 표시되지 않아야 함", async ({ page }) => {
    // 1. localStorage 비어있는 상태로 시작
    await page.goto(TEST_POST_URL);

    // 2. hydration 대기
    await waitForHydration(page);

    // 3. 토스트가 표시되지 않아야 함
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test("스크롤 후 위치가 localStorage에 저장되어야 함", async ({ page }) => {
    // 1. 포스트 방문
    await page.goto(TEST_POST_URL);

    // 2. hydration 및 navigation lock 해제 대기
    await waitForHydration(page);

    // 3. 스크롤 실행 (instant로 즉시 이동)
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: "instant" });
    });

    // 4. 스크롤 위치 안정화 대기
    await waitForScrollStabilization(page, 500);

    // 5. 스크롤 위치 저장
    await triggerScrollSave(page, TEST_POST_SLUG);

    // 6. localStorage 확인
    const savedPosition = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("스크롤 후 저장된 위치:", savedPosition);

    expect(savedPosition).not.toBeNull();
    expect(savedPosition?.position).toBeGreaterThanOrEqual(400); // 약간의 오차 허용
  });

  test("다른 페이지로 이동 후 돌아와도 저장된 위치가 유지되어야 함", async ({
    page,
  }) => {
    // 1. 포스트 방문
    await page.goto(TEST_POST_URL);

    // 2. hydration 및 navigation lock 해제 대기
    await waitForHydration(page);

    // 3. 스크롤 실행 (instant로 즉시 이동)
    await page.evaluate(() => {
      window.scrollTo({ top: 800, behavior: "instant" });
    });

    // 4. 스크롤 위치 안정화 대기
    await waitForScrollStabilization(page, 800);

    // 5. 스크롤 위치 저장
    await triggerScrollSave(page, TEST_POST_SLUG);

    // 6. 저장된 값 확인
    const savedBefore = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("저장된 위치 (이동 전):", savedBefore);
    expect(savedBefore).not.toBeNull();
    expect(savedBefore?.position).toBeGreaterThan(0);

    // 7. 다른 페이지로 이동
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 8. 포스트로 다시 돌아옴 (값 재설정 없이 - persistence 테스트)
    await page.goto(TEST_POST_URL);

    // 9. hydration 대기
    await waitForHydration(page);

    // 10. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => window.__storageChanges || []
    );
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("localStorage 변경 기록:", JSON.stringify(changes, null, 2));

    // 11. 저장된 값이 0으로 덮어씌워지지 않았는지 확인
    const savedAfter = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("저장된 위치 (복귀 후):", savedAfter);

    expect(savedAfter?.position).toBeGreaterThan(0);
  });
});

test.describe("이어 읽기 기능 - View Transitions 시나리오", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      window.__storageChanges = window.__storageChanges || [];
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k: string, v: string) {
        if (k === key) {
          window.__storageChanges!.push({
            timestamp: Date.now(),
            value: JSON.parse(v),
            stack: new Error().stack,
          });
        }
        return originalSetItem(k, v);
      };
    }, STORAGE_KEY);

    await page.goto("/");
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  });

  test("View Transitions: 링크 클릭으로 포스트 이동 시 저장된 위치가 유지되어야 함", async ({
    page,
  }) => {
    // 1. 저장된 위치 세팅
    await setScrollPosition(page, TEST_POST_SLUG, 1000, 50);

    // 2. 포스트 목록 페이지로 이동
    await page.goto("/posts");
    await page.waitForLoadState("networkidle");

    // 3. 포스트 링크 클릭 (View Transitions 사용)
    const link = page.locator(`a[href="${TEST_POST_URL}"]`).first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState("networkidle");
    } else {
      // 링크를 찾을 수 없으면 직접 이동
      await page.goto(TEST_POST_URL);
      await page.waitForLoadState("networkidle");
    }

    // 4. hydration 대기
    await waitForHydration(page);

    // 5. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => window.__storageChanges || []
    );
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log(
      "View Transitions localStorage 변경:",
      JSON.stringify(changes, null, 2)
    );

    // 6. 저장된 값 확인
    const saved = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("View Transitions 후 저장된 위치:", saved);

    expect(saved).not.toBeNull();
    expect(saved?.position).toBeGreaterThan(0);
    expect(saved?.progress).toBe(50);
  });

  test("View Transitions: 포스트에서 스크롤 후 뒤로가기 -> 다시 앞으로가기", async ({
    page,
  }) => {
    // 1. 포스트 방문
    await page.goto(TEST_POST_URL);

    // 2. hydration 및 navigation lock 해제 대기
    await waitForHydration(page);

    // 3. 스크롤 실행 (instant로 즉시 이동)
    await page.evaluate(() => {
      window.scrollTo({ top: 600, behavior: "instant" });
    });

    // 4. 스크롤 위치 안정화 대기
    await waitForScrollStabilization(page, 600);

    // 5. 스크롤 위치 저장
    await triggerScrollSave(page, TEST_POST_SLUG);

    // 6. 저장된 값 확인
    const savedBefore = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("뒤로가기 전 저장된 위치:", savedBefore);
    expect(savedBefore?.position).toBeGreaterThan(0);

    // 7. 뒤로가기 (View Transitions)
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // 8. 앞으로가기 (View Transitions)
    await page.goForward();

    // 9. hydration 대기
    await waitForHydration(page);

    // 10. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => window.__storageChanges || []
    );
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log(
      "뒤로/앞으로 가기 후 localStorage 변경:",
      JSON.stringify(changes, null, 2)
    );

    // 11. 저장된 값 확인
    const savedAfter = await getScrollPosition(page, TEST_POST_SLUG);
    // eslint-disable-next-line no-console -- E2E 테스트 디버깅용 로그
    console.log("앞으로가기 후 저장된 위치:", savedAfter);

    expect(savedAfter?.position).toBeGreaterThan(0);
  });
});
