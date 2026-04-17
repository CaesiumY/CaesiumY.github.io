import { test, expect, type Page } from "@playwright/test";

// 목차(## 목차)가 있는 번역 포스트 - Agenda 슬라이드 검증 가능
const TEST_POST_SLUG = "translation/claude-skills-guide-part-4";
const TEST_POST_URL = `/posts/${TEST_POST_SLUG}`;

/**
 * 프레젠테이션 버튼이 런타임에 노출될 때까지 대기.
 * initializePresentationMode가 H2 개수를 계산해 button.hidden = false 처리하는 타이밍.
 */
async function waitForPresentationButton(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("article#article", { state: "visible" });
  // 버튼의 hidden 속성이 해제될 때까지 대기 (런타임 슬라이드 개수 판정 완료 신호)
  await page.waitForFunction(() => {
    const btn = document.querySelector<HTMLButtonElement>(
      '[data-button="presentation-start"]'
    );
    return btn !== null && !btn.hidden;
  });
}

test.describe("프레젠테이션 모드 - 기본 동작", () => {
  test("H2가 충분한 포스트에서 버튼이 노출되어야 함", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);

    const button = page.locator('[data-button="presentation-start"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-label", "프레젠테이션 모드 시작");
    await expect(button).toHaveAttribute("aria-keyshortcuts", "Shift+P");
  });

  test("버튼 클릭 시 풀스크린 오버레이가 열려야 함", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);

    await page.locator('[data-button="presentation-start"]').click();

    // 오버레이 존재 + ARIA 속성 확인
    const overlay = page.locator(".presentation-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toHaveAttribute("role", "dialog");
    await expect(overlay).toHaveAttribute("aria-modal", "true");
    await expect(overlay).toHaveAttribute("aria-label", "프레젠테이션 모드");

    // body에 presentation-active 클래스 적용
    await expect(page.locator("body")).toHaveClass(/presentation-active/);

    // 카운터가 "1 / N" 형식
    const counter = page.locator(".presentation-counter");
    await expect(counter).toHaveText(/^1 \/ \d+$/);
  });

  test("슬라이드 구조: [타이틀] → [목차] → [H2 섹션들] 순으로 조립", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();

    const structure = await page.evaluate(() => {
      const slides = Array.from(
        document.querySelectorAll(".presentation-slide")
      );
      return slides.map((s, i) => ({
        index: i,
        isTitle: s.classList.contains("presentation-slide-title"),
        isAgenda: s.classList.contains("presentation-slide-agenda"),
        isSection: s.classList.contains("presentation-slide-section"),
        isActive: s.classList.contains("is-active"),
        firstH2Text:
          s.querySelector(":scope > h2")?.textContent?.trim() ?? null,
      }));
    });

    expect(structure.length).toBeGreaterThanOrEqual(3); // title + agenda + 최소 1개 H2
    expect(structure[0]).toMatchObject({ isTitle: true, isActive: true });
    expect(structure[1]).toMatchObject({ isAgenda: true, isActive: false });
    // 나머지는 모두 섹션 슬라이드 + "목차" 텍스트가 섹션 h2로 오염되지 않음
    for (let i = 2; i < structure.length; i++) {
      expect(structure[i].isSection).toBe(true);
      expect(structure[i].firstH2Text).not.toBe("목차");
      expect(structure[i].firstH2Text?.toLowerCase()).not.toBe(
        "table of contents"
      );
    }
  });

  test("목차 슬라이드의 링크는 agenda-link 클래스를 가지고 클릭 비활성이어야 함", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();

    const agendaStats = await page.evaluate(() => {
      const agenda = document.querySelector(".presentation-slide-agenda");
      if (!agenda) return null;
      const links = Array.from(agenda.querySelectorAll("a"));
      return {
        linkCount: links.length,
        allHaveAgendaClass: links.every(a =>
          a.classList.contains("agenda-link")
        ),
        allPointerEventsNone: links.every(
          a => getComputedStyle(a).pointerEvents === "none"
        ),
        detailsOpen:
          (agenda.querySelector("details") as HTMLDetailsElement | null)
            ?.open === true,
      };
    });

    expect(agendaStats).not.toBeNull();
    expect(agendaStats!.linkCount).toBeGreaterThan(0);
    expect(agendaStats!.allHaveAgendaClass).toBe(true);
    expect(agendaStats!.allPointerEventsNone).toBe(true);
    expect(agendaStats!.detailsOpen).toBe(true);
  });

  test("이슈1 회귀 방지: 원본 <h2>목차</h2>가 섹션 슬라이드로 중복 생성되지 않아야 함", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();

    const sectionH2Texts = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(".presentation-slide-section > h2")
      ).map(h => h.textContent?.trim() ?? "")
    );

    expect(sectionH2Texts.length).toBeGreaterThan(0);
    expect(sectionH2Texts).not.toContain("목차");
    expect(sectionH2Texts.map(t => t.toLowerCase())).not.toContain(
      "table of contents"
    );
  });

  test("총 슬라이드가 MIN_SLIDES 미만이면 버튼을 눌러도 오버레이가 열리지 않아야 함", async ({
    page,
  }) => {
    // 짧은 포스트 시나리오의 가드 로직 검증.
    // 페이지 초기화 시점에는 이미 h2가 존재하므로 버튼이 노출되지만,
    // 이후 DOM이 변형돼 실제 슬라이드 조립 시 개수가 MIN_SLIDES 미만이 되면
    // openOverlay()의 `if (slides.length < MIN_SLIDES) return` 가드가 동작해야 함.
    // "버튼 hidden 유지"는 초기 렌더 시점 판단이라 테스트로 재현하기 어렵지만,
    // 이 가드는 사용자가 겪을 실질적 결과(오버레이 열리지 않음)를 동일하게 보장한다.
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);

    // 버튼 클릭 직전에 h2·agenda details 제거 → buildSlides 결과 <MIN_SLIDES
    await page.evaluate(() => {
      const article = document.getElementById("article");
      if (!article) return;
      article.querySelectorAll(":scope > h2").forEach(h => h.remove());
      article.querySelectorAll(":scope > details").forEach(d => d.remove());
    });

    await page.locator('[data-button="presentation-start"]').click();
    // 오버레이는 DOM에 삽입조차 되지 않아야 함
    await page.waitForTimeout(300);
    await expect(page.locator(".presentation-overlay")).toHaveCount(0);
    // presentation-active 클래스도 붙지 않아야 함
    await expect(page.locator("body")).not.toHaveClass(/presentation-active/);
  });
});

test.describe("프레젠테이션 모드 - 키보드 네비게이션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();
    await expect(page.locator(".presentation-overlay")).toBeVisible();
  });

  test("ArrowRight로 다음 슬라이드 이동", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".presentation-counter")).toHaveText(/^2 \/ /);
  });

  test("Space로도 다음 슬라이드 이동", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.locator(".presentation-counter")).toHaveText(/^2 \/ /);
  });

  test("ArrowLeft로 이전 슬라이드 (경계: 첫 슬라이드에서는 이동 없음)", async ({
    page,
  }) => {
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".presentation-counter")).toHaveText(/^1 \/ /);

    // 한 번 다음 → 다시 이전 = 첫 슬라이드
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".presentation-counter")).toHaveText(/^2 \/ /);
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".presentation-counter")).toHaveText(/^1 \/ /);
  });

  test("End로 마지막, Home으로 처음", async ({ page }) => {
    const total = await page.evaluate(
      () => document.querySelectorAll(".presentation-slide").length
    );

    await page.keyboard.press("End");
    await expect(page.locator(".presentation-counter")).toHaveText(
      new RegExp(`^${total} / ${total}$`)
    );

    await page.keyboard.press("Home");
    await expect(page.locator(".presentation-counter")).toHaveText(
      new RegExp(`^1 / ${total}$`)
    );
  });

  test("Escape로 오버레이 닫힘 + 트리거 버튼으로 포커스 복귀", async ({
    page,
  }) => {
    await page.keyboard.press("Escape");
    await expect(page.locator(".presentation-overlay")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/presentation-active/);

    // 원래 버튼으로 포커스 복귀
    const activeIsButton = await page.evaluate(
      () =>
        document.activeElement?.getAttribute("data-button") ===
        "presentation-start"
    );
    expect(activeIsButton).toBe(true);
  });

  test("이슈2 회귀 방지: 섹션 내 <details>를 펼친 후에도 키보드 네비가 계속 동작해야 함", async ({
    page,
  }) => {
    // 타이틀(1) → Agenda(2) → 첫 섹션(3)
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".presentation-counter")).toHaveText(/^3 \/ /);

    // 활성 섹션 슬라이드 내 <details>를 펼치고 summary에 포커스 (사용자 클릭 시뮬레이션)
    const setupResult = await page.evaluate(() => {
      const active = document.querySelector(".presentation-slide.is-active");
      if (!active) return { hasDetails: false, focused: false };
      const details = active.querySelector("details");
      if (!details) return { hasDetails: false, focused: false };
      details.open = true;
      const summary = details.querySelector("summary") as HTMLElement | null;
      summary?.focus();
      return {
        hasDetails: true,
        focused: document.activeElement === summary,
      };
    });

    // details가 없는 포스트면 테스트 skip (타 포스트로 변경돼도 안전)
    if (!setupResult.hasDetails) {
      test.skip(true, "테스트 포스트에 섹션 내 <details> 없음");
      return;
    }
    expect(setupResult.focused).toBe(true);

    // 이 상태에서 ArrowRight → document 레벨 리스너 덕에 카운터 4/N
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".presentation-counter")).toHaveText(/^4 \/ /);

    // 연속 동작 확인
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".presentation-counter")).toHaveText(/^5 \/ /);
  });
});

test.describe("프레젠테이션 모드 - 접근성", () => {
  test("오버레이 열린 상태에서 body 자식에 inert 속성 적용", async ({
    page,
  }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();

    const stats = await page.evaluate(() => {
      const children = Array.from(document.body.children);
      const overlay = document.querySelector(".presentation-overlay");
      return {
        totalChildren: children.length,
        inertedCount: children.filter(c => c.hasAttribute("inert")).length,
        overlayHasInert: overlay?.hasAttribute("inert") ?? false,
      };
    });

    // 오버레이 자체는 inert 없음, 나머지는 모두 inert
    expect(stats.overlayHasInert).toBe(false);
    expect(stats.inertedCount).toBe(stats.totalChildren - 1);
  });

  test("오버레이 닫으면 inert 해제", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);
    await page.locator('[data-button="presentation-start"]').click();
    await page.keyboard.press("Escape");

    const inertedCount = await page.evaluate(
      () =>
        Array.from(document.body.children).filter(c =>
          c.hasAttribute("inert")
        ).length
    );
    expect(inertedCount).toBe(0);
  });
});

test.describe("프레젠테이션 모드 - 단축키", () => {
  test("Shift+P로 오버레이 진입", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    await waitForPresentationButton(page);

    // body에 포커스 맞추고 단축키 발동
    await page.locator("body").click();
    await page.keyboard.press("Shift+P");

    await expect(page.locator(".presentation-overlay")).toBeVisible();
  });
});
