import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    /** 테스트 스텁: (타겟:타입)별 현재 등록된 리스너 수 스냅샷 */
    __listenerCounts?: () => Record<string, number>;
  }
}

const STORAGE_KEY = "blog-scroll-positions";

// 테스트용 블로그 포스트 (continue-reading.spec.ts와 동일 — 이전/다음 글이 있는 긴 글)
const TEST_POST_SLUG = "ai/claude-code-token-burning-session-retrospect";
const TEST_POST_URL = `/posts/${TEST_POST_SLUG}`;

/**
 * EventTarget.prototype을 래핑해 영속 타겟(document, MediaQueryList)의
 * 리스너를 Set으로 추적하는 스텁 주입.
 *
 * - getEventListeners는 CDP 전용이라 사용 불가 → window에 카운터 노출 방식
 * - AbortSignal 기반 해제(abort)와 removeEventListener 모두 추적
 * - Set.delete는 멱등이라 abort+remove 중복 해제에도 안전
 * - View Transitions 스왑에서는 window가 유지되므로 스텁과 카운터가 살아남음
 */
async function installListenerTracker(page: Page) {
  await page.addInitScript(() => {
    const counts = new Map<string, Set<unknown>>();

    const keyFor = (target: EventTarget, type: string): string | null => {
      if (
        target === document &&
        (type === "scroll" || type === "click" || type === "keydown")
      ) {
        return `document:${type}`;
      }
      if (
        typeof MediaQueryList !== "undefined" &&
        target instanceof MediaQueryList &&
        type === "change"
      ) {
        return "mql:change";
      }
      return null;
    };

    window.__listenerCounts = () => {
      const snapshot: Record<string, number> = {};
      for (const [key, set] of counts) snapshot[key] = set.size;
      return snapshot;
    };

    const origAdd = EventTarget.prototype.addEventListener;
    const origRemove = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions
    ) {
      const key = listener ? keyFor(this, type) : null;
      if (key && listener) {
        let set = counts.get(key);
        if (!set) {
          set = new Set();
          counts.set(key, set);
        }
        const trackedSet = set;
        trackedSet.add(listener);

        const signal =
          options && typeof options === "object" ? options.signal : undefined;
        if (signal?.aborted) {
          trackedSet.delete(listener);
        } else {
          // AbortSignal도 EventTarget이지만 keyFor가 null을 반환해 무한 재귀 없음
          signal?.addEventListener("abort", () => trackedSet.delete(listener), {
            once: true,
          });
        }
      }
      return origAdd.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions
    ) {
      const key = listener ? keyFor(this, type) : null;
      if (key && listener) counts.get(key)?.delete(listener);
      return origRemove.call(this, type, listener, options);
    };
  });
}

/**
 * View Transitions 스왑 후 astro:page-load 초기화까지 대기.
 * VT 스왑은 Playwright load state와 무관하므로 고정 대기를 사용.
 */
async function waitForPageSettled(page: Page) {
  await page.waitForSelector("main", { state: "visible" });
  await page.waitForTimeout(800);
}

/** 스크롤 가능 높이의 50% 지점으로 즉시 스크롤 (back-to-top 가시성 임계 30% 초과) */
async function scrollToHalf(page: Page) {
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * 0.5, behavior: "instant" });
  });
}

/** "이어 읽기" 토스트/스크롤 복원 간섭 차단용 저장소 정리 */
async function clearScrollStorage(page: Page) {
  await page.evaluate(key => localStorage.removeItem(key), STORAGE_KEY);
}

/**
 * PostNavigation 링크 클릭으로 이웃 글로 View Transitions 스왑.
 * page.goto는 풀 페이지 로드라 VT 경로를 타지 않으므로 링크 클릭 필수.
 */
async function gotoNeighborPost(
  page: Page
): Promise<{ postPath: string; neighborPath: string }> {
  const postPath = new URL(page.url()).pathname;
  const navLink = page.locator("a", { hasText: /이전 글|다음 글/ }).first();
  await expect(navLink).toBeVisible();
  await navLink.click();
  await page.waitForURL(url => url.pathname !== postPath);
  await waitForPageSettled(page);
  return { postPath, neighborPath: new URL(page.url()).pathname };
}

test.beforeEach(async ({ page }) => {
  await installListenerTracker(page);
  // 풀 로드마다 "이어 읽기" 저장소 초기화 (토스트/스크롤 복원 간섭 차단)
  await page.addInitScript(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* localStorage 접근 불가 환경은 무시 */
    }
  }, STORAGE_KEY);
});

test.describe("View Transitions 리스너 수명", () => {
  test("글↔글 왕복 후 영속 타겟 리스너 수가 늘지 않는다", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPageSettled(page);
    const baseline = await page.evaluate(() => window.__listenerCounts!());

    const { postPath, neighborPath } = await gotoNeighborPost(page);

    // 글↔글 왕복 — popstate도 ClientRouter가 가로채 View Transitions 스왑이 됨
    for (let round = 0; round < 3; round++) {
      await page.goBack();
      await page.waitForURL(url => url.pathname === postPath);
      await waitForPageSettled(page);

      if (round < 2) {
        await page.goForward();
        await page.waitForURL(url => url.pathname === neighborPath);
        await waitForPageSettled(page);
      }
    }

    // 첫 진입 시점과 동일해야 함 (절대값이 아닌 불변량 비교 —
    // 다른 컴포넌트가 등록하는 리스너 수와 무관하게 누적만 검출)
    const final = await page.evaluate(() => window.__listenerCounts!());
    expect(final).toEqual(baseline);
  });

  test("back-to-top: 30% 초과 스크롤 시 표시, 클릭 시 최상단 복귀", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPageSettled(page);

    const container = page.locator("#btt-btn-container");
    await expect(container).toHaveClass(/opacity-0/);

    await scrollToHalf(page);
    await expect(container).toHaveClass(/opacity-100/);

    // 진행률 인디케이터 — 데스크톱 뷰포트에선 md:hidden이라 inline style로 검증
    const backgroundImage = await page
      .locator("#progress-indicator")
      .evaluate(el => el.style.backgroundImage);
    expect(backgroundImage).toContain("conic-gradient");

    await page.locator("[data-button='back-to-top']").click();
    // html scroll-smooth 가능성 대응 — 최상단 도달까지 대기
    await page.waitForFunction(() => window.scrollY < 10);
    await expect(container).toHaveClass(/opacity-0/);
  });

  test("왕복 네비게이션 후에도 back-to-top·진행률 바가 정상 동작", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPageSettled(page);

    const { postPath } = await gotoNeighborPost(page);

    // 복귀 전 저장소 정리 — "이어 읽기" 토스트가 버튼을 가리지 않도록
    await clearScrollStorage(page);
    await page.goBack();
    await page.waitForURL(url => url.pathname === postPath);
    await waitForPageSettled(page);

    // 진행률 바 재초기화 확인 (멱등 가드의 리셋 누락 회귀 방지)
    await expect(page.locator("#myBar")).toHaveCount(1);

    // back-to-top이 새 DOM에 재바인딩됐는지 (과잉 정리 회귀 방지)
    const container = page.locator("#btt-btn-container");
    await scrollToHalf(page);
    await expect(container).toHaveClass(/opacity-100/);

    await page.locator("[data-button='back-to-top']").click();
    await page.waitForFunction(() => window.scrollY < 10);
    await expect(container).toHaveClass(/opacity-0/);
  });

  test("공유 URL 복사 버튼이 View Transitions 스왑 후에도 동작", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(TEST_POST_URL);
    await waitForPageSettled(page);

    // 첫 글: 버튼 동작 확인 (성공/실패 어느 경로든 피드백 opacity=1)
    const feedback = page.locator("#copy-feedback");
    await page.locator("#copy-url-btn").click();
    await expect(feedback).toHaveCSS("opacity", "1");

    // 이웃 글로 스왑 — 모듈 스크립트는 세션당 1회만 실행되므로
    // page-load 재초기화가 없으면 새 페이지의 버튼이 무반응이 됨
    await gotoNeighborPost(page);

    await page.locator("#copy-url-btn").click();
    await expect(page.locator("#copy-feedback")).toHaveCSS("opacity", "1");
  });
});

test.describe("모바일 메뉴 (Navigation 리스너 검증)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("토글·외부 클릭·Escape 닫기가 왕복 후에도 정상", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPageSettled(page);

    const menuBtn = page.locator("[data-menu-btn]");
    const menuItems = page.locator("[data-menu-items]");

    await menuBtn.click();
    await expect(menuItems).toHaveAttribute("data-state", "open");

    // 외부 클릭 → 닫힘 (모바일 시트가 상단 콘텐츠를 덮으므로 body 직접 클릭)
    await page.evaluate(() => document.body.click());
    await expect(menuItems).toHaveAttribute("data-state", "closed");

    await menuBtn.click();
    await expect(menuItems).toHaveAttribute("data-state", "open");
    await page.keyboard.press("Escape");
    await expect(menuItems).toHaveAttribute("data-state", "closed");

    // 왕복 후에도 동일 동작 (재바인딩 회귀 방지)
    const { postPath } = await gotoNeighborPost(page);
    await page.goBack();
    await page.waitForURL(url => url.pathname === postPath);
    await waitForPageSettled(page);

    await menuBtn.click();
    await expect(menuItems).toHaveAttribute("data-state", "open");
    await page.keyboard.press("Escape");
    await expect(menuItems).toHaveAttribute("data-state", "closed");
  });
});
