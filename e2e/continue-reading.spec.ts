import { test, expect, type Page } from "@playwright/test";

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

test.describe("이어 읽기 기능 - Race Condition 디버깅", () => {
  test.beforeEach(async ({ page }) => {
    // addInitScript는 모든 페이지 로드 전에 실행됨 (페이지 전환 후에도 유지)
    await page.addInitScript((key) => {
      (window as any).__storageChanges = (window as any).__storageChanges || [];
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k: string, v: string) {
        if (k === key) {
          (window as any).__storageChanges.push({
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

  test("핵심 버그: 저장된 스크롤 위치가 페이지 로드 시 0으로 덮어씌워지는지 확인", async ({
    page,
  }) => {
    // 1. 저장된 위치 세팅 (50% 읽은 상태)
    await setScrollPosition(page, TEST_POST_SLUG, 1000, 50);

    // 저장 확인
    const beforeNav = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("네비게이션 전 저장된 위치:", beforeNav);
    expect(beforeNav?.position).toBe(1000);
    expect(beforeNav?.progress).toBe(50);

    // 2. 포스트 페이지 방문
    await page.goto(TEST_POST_URL);

    // 3. 페이지 완전 로드 대기
    await page.waitForLoadState("networkidle");

    // 4. 추가 대기 (View Transitions, React hydration 등)
    await page.waitForTimeout(1500);

    // 5. localStorage 변화 로그 확인
    const changes = await page.evaluate(
      () => (window as any).__storageChanges || []
    );
    console.log("localStorage 변경 기록:", JSON.stringify(changes, null, 2));

    // 6. 저장된 값 확인
    const afterNav = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("네비게이션 후 저장된 위치:", afterNav);

    // 7. 버그 검증: position이 0으로 덮어씌워지면 테스트 실패
    expect(afterNav).not.toBeNull();
    expect(afterNav?.position).toBeGreaterThan(0);
    expect(afterNav?.progress).toBe(50);

    // 8. 토스트 메시지 확인
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toBeVisible({ timeout: 3000 });
    await expect(toast).toContainText("50%");
  });

  test("새 방문자는 토스트가 표시되지 않아야 함", async ({ page }) => {
    // localStorage 비어있는 상태로 시작
    await page.goto(TEST_POST_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // 토스트가 표시되지 않아야 함
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test("스크롤 후 위치가 localStorage에 저장되어야 함", async ({ page }) => {
    // 1. 포스트 방문
    await page.goto(TEST_POST_URL);
    await page.waitForLoadState("networkidle");

    // 2. 스크롤 실행
    await page.evaluate(() => {
      window.scrollTo({ top: 500, behavior: "instant" });
    });

    // 3. throttle 시간 대기 (2초 + 여유)
    await page.waitForTimeout(2500);

    // 4. localStorage 확인
    const savedPosition = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("스크롤 후 저장된 위치:", savedPosition);

    expect(savedPosition).not.toBeNull();
    expect(savedPosition?.position).toBeGreaterThanOrEqual(400); // 약간의 오차 허용
  });

  test("다른 페이지로 이동 후 돌아와도 저장된 위치가 유지되어야 함", async ({
    page,
  }) => {
    // 1. 포스트 방문 및 스크롤
    await page.goto(TEST_POST_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      window.scrollTo({ top: 800, behavior: "instant" });
    });

    // 2. throttle 대기
    await page.waitForTimeout(2500);

    // 3. 저장된 값 확인
    const savedBefore = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("저장된 위치 (이동 전):", savedBefore);
    expect(savedBefore).not.toBeNull();
    expect(savedBefore?.position).toBeGreaterThan(0);

    // 4. 다른 페이지로 이동
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 5. 포스트로 다시 돌아옴 (값 재설정 없이 - persistence 테스트)
    await page.goto(TEST_POST_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // 6. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => (window as any).__storageChanges || []
    );
    console.log("localStorage 변경 기록:", JSON.stringify(changes, null, 2));

    // 7. 저장된 값이 0으로 덮어씌워지지 않았는지 확인
    const savedAfter = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("저장된 위치 (복귀 후):", savedAfter);

    expect(savedAfter?.position).toBeGreaterThan(0);
  });
});

test.describe("이어 읽기 기능 - View Transitions 시나리오", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      (window as any).__storageChanges = (window as any).__storageChanges || [];
      const originalSetItem = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k: string, v: string) {
        if (k === key) {
          (window as any).__storageChanges.push({
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

    await page.waitForTimeout(1500);

    // 4. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => (window as any).__storageChanges || []
    );
    console.log(
      "View Transitions localStorage 변경:",
      JSON.stringify(changes, null, 2)
    );

    // 5. 저장된 값 확인
    const saved = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("View Transitions 후 저장된 위치:", saved);

    expect(saved).not.toBeNull();
    expect(saved?.position).toBeGreaterThan(0);
    expect(saved?.progress).toBe(50);
  });

  test("View Transitions: 포스트에서 스크롤 후 뒤로가기 → 다시 앞으로가기", async ({
    page,
  }) => {
    // 1. 포스트 방문 및 스크롤
    await page.goto(TEST_POST_URL);
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      window.scrollTo({ top: 600, behavior: "instant" });
    });

    // 2. throttle 대기
    await page.waitForTimeout(2500);

    const savedBefore = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("뒤로가기 전 저장된 위치:", savedBefore);
    expect(savedBefore?.position).toBeGreaterThan(0);

    // 3. 뒤로가기 (View Transitions)
    await page.goBack();
    await page.waitForLoadState("networkidle");

    // 4. 앞으로가기 (View Transitions)
    await page.goForward();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // 5. localStorage 변경 기록 확인
    const changes = await page.evaluate(
      () => (window as any).__storageChanges || []
    );
    console.log(
      "뒤로/앞으로 가기 후 localStorage 변경:",
      JSON.stringify(changes, null, 2)
    );

    // 6. 저장된 값 확인
    const savedAfter = await getScrollPosition(page, TEST_POST_SLUG);
    console.log("앞으로가기 후 저장된 위치:", savedAfter);

    expect(savedAfter?.position).toBeGreaterThan(0);
  });
});
