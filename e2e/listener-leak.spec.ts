import { test, expect, type Page } from "@playwright/test";
import { TEST_POST_URL } from "./fixtures/test-posts";

declare global {
  interface Window {
    /** 테스트 스텁: (타겟:타입)별 현재 등록된 리스너 수 스냅샷 */
    __listenerCounts?: () => Record<string, number>;
    /** 테스트 스텁: astro:page-load 발생 횟수 (풀 로드마다 0으로 리셋) */
    __pageLoadCount?: number;
    /** waitForListenerCountsStable의 직전 폴링 샘플 */
    __lastCountsSample?: string;
  }
}

const STORAGE_KEY = "blog-scroll-positions";

/**
 * EventTarget.prototype을 래핑해 영속 타겟(document, MediaQueryList)의
 * 리스너를 Set으로 추적하는 스텁 + astro:page-load 카운터 주입.
 *
 * - getEventListeners는 CDP 전용이라 사용 불가 → window에 카운터 노출 방식
 * - AbortSignal 기반 해제(abort)와 removeEventListener 모두 추적
 * - Set.delete는 멱등이라 abort+remove 중복 해제에도 안전
 * - View Transitions 스왑에서는 window가 유지되므로 스텁과 카운터가 살아남음
 * - page-load 카운터는 고정 시간 대기 없이 "스왑 완료 + 동기 초기화 완료"를
 *   결정론적으로 감지하기 위한 신호 (디스패치가 동기라, 폴링이 증가를 관측한
 *   시점엔 모든 astro:page-load 핸들러 실행이 끝나 있음)
 */
async function installTestInstrumentation(page: Page) {
  await page.addInitScript(() => {
    window.__pageLoadCount = 0;
    document.addEventListener("astro:page-load", () => {
      window.__pageLoadCount = (window.__pageLoadCount ?? 0) + 1;
    });

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

/** 초기 풀 로드 후 첫 astro:page-load 발생(동기 초기화 완료)까지 대기 */
async function waitForInitialPageLoad(page: Page) {
  await page.waitForSelector("main", { state: "visible" });
  await page.waitForFunction(() => (window.__pageLoadCount ?? 0) >= 1);
}

/**
 * View Transitions 네비게이션을 트리거하고 다음 astro:page-load 완료까지 대기.
 * 풀 로드가 끼어들면 카운터가 리셋돼 조건이 성립하지 않으므로,
 * "VT 경로를 탔다"는 사실 자체도 함께 검증된다.
 */
async function withViewTransition(page: Page, action: () => Promise<void>) {
  const before = await page.evaluate(() => window.__pageLoadCount ?? 0);
  await action();
  await page.waitForFunction(
    prev => (window.__pageLoadCount ?? 0) > prev,
    before
  );
}

/**
 * 추적 카운트가 연속 두 폴링 샘플(150ms 간격)에서 동일해질 때까지 대기.
 * client:only 아일랜드(React)의 비동기 마운트가 등록하는 리스너까지
 * 측정 전에 흡수해, 측정 시점 차이로 인한 플레이키를 방지한다.
 */
async function waitForListenerCountsStable(page: Page) {
  await page.evaluate(() => {
    delete window.__lastCountsSample;
  });
  await page.waitForFunction(
    () => {
      // 스텁 누락 시 ?.()는 "{}"끼리 비교돼 조용히 통과하므로, 측정부와 동일하게
      // non-null 단언을 써서 시끄럽게 실패하도록 통일
      const current = JSON.stringify(window.__listenerCounts!());
      const previous = window.__lastCountsSample;
      window.__lastCountsSample = current;
      return previous === current;
    },
    undefined,
    { polling: 150 }
  );
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
  await withViewTransition(page, async () => {
    await navLink.click();
    await page.waitForURL(url => url.pathname !== postPath);
  });
  return { postPath, neighborPath: new URL(page.url()).pathname };
}

/** 히스토리 이동(뒤로/앞으로)을 VT 스왑으로 수행하고 도착 경로를 확인 */
async function historyNavigate(
  page: Page,
  direction: "back" | "forward",
  expectedPath: string
) {
  await withViewTransition(page, async () => {
    if (direction === "back") {
      await page.goBack();
    } else {
      await page.goForward();
    }
    await page.waitForURL(url => url.pathname === expectedPath);
  });
}

test.beforeEach(async ({ page }) => {
  await installTestInstrumentation(page);
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
    await waitForInitialPageLoad(page);

    // 워밍업 왕복: 베이스라인을 "스왑으로 도착한 테스트 포스트" 상태로 만들어
    // 본 측정과 동일 조건으로 맞추고, 첫 스왑에서만 발생하는 일회성 등록을 흡수
    const { postPath, neighborPath } = await gotoNeighborPost(page);
    await historyNavigate(page, "back", postPath);

    await waitForListenerCountsStable(page);
    const baseline = await page.evaluate(() => window.__listenerCounts!());

    // 글↔글 왕복 3회 — popstate도 ClientRouter가 가로채 View Transitions 스왑이 됨
    for (let round = 0; round < 3; round++) {
      await historyNavigate(page, "forward", neighborPath);
      await historyNavigate(page, "back", postPath);
    }

    // 베이스라인과 동일해야 함 (절대값이 아닌 불변량 비교 —
    // 다른 컴포넌트가 등록하는 리스너 수와 무관하게 누적만 검출)
    await waitForListenerCountsStable(page);
    const final = await page.evaluate(() => window.__listenerCounts!());
    expect(final).toEqual(baseline);
  });

  test("back-to-top: 30% 초과 스크롤 시 표시, 클릭 시 최상단 복귀", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForInitialPageLoad(page);

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
    await waitForInitialPageLoad(page);

    const { postPath } = await gotoNeighborPost(page);

    // 복귀 전 저장소 정리 — "이어 읽기" 토스트가 버튼을 가리지 않도록
    await clearScrollStorage(page);
    await historyNavigate(page, "back", postPath);

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
    await waitForInitialPageLoad(page);

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
    await waitForInitialPageLoad(page);

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
    await historyNavigate(page, "back", postPath);

    await menuBtn.click();
    await expect(menuItems).toHaveAttribute("data-state", "open");
    await page.keyboard.press("Escape");
    await expect(menuItems).toHaveAttribute("data-state", "closed");
  });
});
