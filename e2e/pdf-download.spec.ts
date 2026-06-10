import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __printCalls?: Array<{
      dataThemeAtPrint: string | null;
      titleAtPrint: string;
    }>;
    /** PdfDownloadButton 위임 리스너 중복 등록 방지 플래그 */
    __pdfPrintDelegated?: boolean;
  }
}

const ABOUT_URL = "/about";
const PDF_BUTTON = "#pdf-download-btn";
const THEME_BUTTON = "#theme-btn";
// 아래 기대값은 의도적인 하드코딩(회귀 가드): 소스의 prop 값이 바뀌면
// 이 테스트가 깨져서 변경을 인지하도록 한다. 변경 시 함께 업데이트할 것.
// - RESUME_FILE_NAME: PdfDownloadButton.astro의 기본 fileName prop
//   (AboutLayout은 prop 없이 사용)
const RESUME_FILE_NAME = "윤창식_Resume";
// - PORTFOLIO_FILE_NAME: PortfolioLayout.astro가 명시적으로 넘기는 fileName prop
const PORTFOLIO_FILE_NAME = "윤창식_Portfolio";

/**
 * window.print를 기록용 스텁으로 교체.
 *
 * Chrome의 동기 동작 모방: print() 호출이 beforeprint를 동기 디스패치하고,
 * 호출 시점의 테마/타이틀을 기록한 뒤 afterprint를 디스패치한다(다이얼로그
 * 즉시 닫힘으로 간주). 컴포넌트의 beforeprint 기반 지원 감지가 항상
 * 성공하므로 미지원 안내 alert 경로는 타지 않는다.
 *
 * addInitScript는 전체 로드(새 document)마다 재실행되지만, View Transitions
 * 스왑은 같은 window(JS realm)를 유지하므로 스텁과 __printCalls 배열이
 * 스왑을 건너 그대로 살아있다.
 */
async function installPrintStub(page: Page) {
  await page.addInitScript(() => {
    window.__printCalls = [];
    window.print = () => {
      window.dispatchEvent(new Event("beforeprint"));
      window.__printCalls!.push({
        dataThemeAtPrint: document.documentElement.getAttribute("data-theme"),
        titleAtPrint: document.title,
      });
      window.dispatchEvent(new Event("afterprint"));
    };
  });
}

/**
 * 누적된 print 호출 기록을 가져옴
 */
function getPrintCalls(page: Page) {
  return page.evaluate(() => window.__printCalls ?? []);
}

/**
 * /about 전체 로드 후 PDF 버튼이 보일 때까지 대기
 * (networkidle은 dev 서버 백그라운드 활동으로 플레이키해서 요소 기반 대기 사용)
 */
async function gotoAboutFullLoad(page: Page) {
  await page.goto(ABOUT_URL);
  await expect(page.locator(PDF_BUTTON)).toBeVisible();
}

/**
 * 헤더 링크 클릭으로 클라이언트 사이드 네비게이션(View Transitions) 수행.
 *
 * page.goto는 전체 로드라서 ClientRouter의 swap 경로를 타지 않는다.
 * 버그 재현에는 반드시 실제 링크 클릭이 필요하다.
 * 홈은 SiteTitle 링크(a[href="/"]), About은 Navigation 메뉴 링크.
 */
async function clientNavigate(
  page: Page,
  href: string,
  expectedUrl: string | RegExp
) {
  const link = page.locator(`header a[href="${href}"]`).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(expectedUrl);
  // 스왑 완료 신호로 본문 가시성 대기 (networkidle은 dev 서버의
  // 백그라운드 네트워크 활동 때문에 반복 네비게이션 시 플레이키함)
  await expect(page.locator("main#main-content")).toBeVisible();
}

test.describe("PDF 다운로드 버튼 - 기본 동작", () => {
  test.beforeEach(async ({ page }) => {
    await installPrintStub(page);
  });

  test("전체 로드된 /about에서 클릭 시 라이트 테마 + 파일명으로 인쇄 후 원상 복구되어야 함", async ({
    page,
  }) => {
    // 미지원 브라우저 안내 alert가 떠서는 안 됨 (스텁이 beforeprint를 동기
    // 디스패치하므로 supported 감지가 항상 성공해야 정상)
    const dialogs: string[] = [];
    page.on("dialog", dialog => {
      dialogs.push(dialog.message());
      dialog.dismiss().catch(() => {});
    });

    await gotoAboutFullLoad(page);
    const originalTitle = await page.title();

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].dataThemeAtPrint).toBe("light");
    expect(calls[0].titleAtPrint).toBe(RESUME_FILE_NAME);

    // afterprint가 동기 디스패치되므로 클릭 직후 이미 복구 완료 상태
    await expect(page).toHaveTitle(originalTitle);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(dialogs).toHaveLength(0);
  });

  test("다크 모드에서 클릭 시 인쇄 중에는 라이트, 종료 후 다크로 복원되어야 함", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await gotoAboutFullLoad(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].dataThemeAtPrint).toBe("light");
    // 인쇄 종료 후 원래 다크 테마로 복원
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("연속 두 번 클릭 시 정확히 두 번 인쇄되어야 함 (리스너 중복/유실 없음)", async ({
    page,
  }) => {
    await gotoAboutFullLoad(page);
    const originalTitle = await page.title();

    await page.locator(PDF_BUTTON).click();
    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(2);
    expect(calls.every(call => call.titleAtPrint === RESUME_FILE_NAME)).toBe(
      true
    );
    await expect(page).toHaveTitle(originalTitle);
  });

  test("포트폴리오 페이지에서는 포트폴리오 파일명으로 인쇄되어야 함", async ({
    page,
  }) => {
    // 회귀 가드: About/Portfolio가 스크립트를 공유하더라도 파일명은
    // 페이지별 버튼에서 읽어야 한다 (About 기본값으로 하드코딩 방지)
    await page.goto("/portfolio");
    await expect(page.locator(PDF_BUTTON)).toBeVisible();

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].titleAtPrint).toBe(PORTFOLIO_FILE_NAME);
  });
});

test.describe("PDF 다운로드 버튼 - 테마 전환 시나리오 (버그 리포트 1)", () => {
  test.beforeEach(async ({ page }) => {
    await installPrintStub(page);
  });

  test("다크 진입 → /about 전체 로드 → 라이트 전환 → 클릭 시 인쇄되어야 함", async ({
    page,
  }) => {
    // 대조군: 테마 토글은 data-theme 속성만 바꾸므로 버튼 리스너를
    // 떼어낼 수 없다. 이 테스트는 "테마 전환 단독"이 버그 원인이 아님을
    // 입증한다 (원인은 View Transitions 재방문 여부).
    await page.emulateMedia({ colorScheme: "dark" });
    await gotoAboutFullLoad(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.locator(THEME_BUTTON).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].dataThemeAtPrint).toBe("light");
  });

  test("다크 진입(홈) → 라이트 전환 → 링크로 /about 첫 진입 → 클릭 시 인쇄되어야 함", async ({
    page,
  }) => {
    // 버그 리포트 1 재현 시나리오: 다크로 진입해 라이트로 바꾼 뒤
    // 클라이언트 사이드 네비게이션으로 About에 처음 도착한 경우
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.locator(THEME_BUTTON).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await clientNavigate(page, ABOUT_URL, /\/about\/?$/);
    await expect(page.locator(PDF_BUTTON)).toBeVisible();

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].dataThemeAtPrint).toBe("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("PDF 다운로드 버튼 - View Transitions 재방문 (버그 리포트 2)", () => {
  test.beforeEach(async ({ page }) => {
    await installPrintStub(page);
  });

  test("about → home → about 재방문 후에도 클릭 시 인쇄되어야 함 (회귀 테스트)", async ({
    page,
  }) => {
    // 핵심 회귀 테스트: 스왑으로 버튼 DOM은 새 요소로 교체되지만 동일 내용
    // 인라인 스크립트는 재실행되지 않는다. 버튼 요소에 직접 리스너를 붙이는
    // 방식이면 재방문 시 죽은 버튼이 된다.
    await gotoAboutFullLoad(page);

    await clientNavigate(page, "/", "/");
    await clientNavigate(page, ABOUT_URL, /\/about\/?$/);
    await expect(page.locator(PDF_BUTTON)).toBeVisible();

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0].titleAtPrint).toBe(RESUME_FILE_NAME);
    expect(calls[0].dataThemeAtPrint).toBe("light");
  });

  test("여러 번 왕복 후 클릭 시 정확히 한 번만 인쇄되어야 함 (리스너 유실/중복 방지)", async ({
    page,
  }) => {
    // 0회(리스너 유실)와 2회 이상(위임 리스너 중복 등록)을 모두 잡는 가드
    await gotoAboutFullLoad(page);

    for (let i = 0; i < 2; i++) {
      await clientNavigate(page, "/", "/");
      await clientNavigate(page, ABOUT_URL, /\/about\/?$/);
    }
    await expect(page.locator(PDF_BUTTON)).toBeVisible();

    await page.locator(PDF_BUTTON).click();

    const calls = await getPrintCalls(page);
    expect(calls).toHaveLength(1);
  });
});
