/**
 * Presentation Mode: 블로그 포스트를 풀스크린 슬라이드쇼로 전환.
 *
 * 슬라이드 순서: [타이틀] → [목차] (있으면) → [H2 섹션들]
 * - 슬라이드 분할: article > h2 직계 자식 기준
 * - 목차: summary="목차 보기"를 가진 <details>를 두 번째 슬라이드로 승격
 * - 접근성: <body>.inert로 포커스 트랩·스크린리더 차단 일괄 처리
 * - View Transitions: astro:before-swap에서 오버레이 강제 정리
 */

/**
 * remark-collapse가 생성하는 `<summary>` 태그의 텍스트.
 *
 * ⚠️ 이 상수는 astro.config.ts의 `remarkCollapse` 플러그인 `summary` 옵션과
 * **반드시 일치**해야 함. 양쪽이 어긋나면 `<details>` 블록을 찾지 못해 목차 슬라이드가
 * 조용히 누락됨(에러 없이 H2 섹션들만 렌더). astro.config.ts 수정 시 여기도 함께 갱신 필요.
 *
 * 참고 경로: astro.config.ts → markdown.remarkPlugins → remarkCollapse의 `summary` 필드
 */
const AGENDA_SUMMARY_TEXT = "목차 보기";
/**
 * remark-collapse가 유지한 원본 `<h2>목차</h2>`를 섹션 슬라이드에서 제외하기 위한 패턴.
 * astro.config.ts의 remark-collapse `test` 정규식과 의미 일치.
 */
const AGENDA_H2_PATTERN = /^(table of contents|목차)$/i;
// 정확히 "핵심 요약"인 H2만 분리 대상으로 삼는다. 이모지나 부제목이 붙으면 일반 섹션으로 둔다.
const SUMMARY_H2_PATTERN = /^핵심 요약$/;
const TLDR_SUMMARY_PATTERN = /TL;DR/i;
const MIN_SLIDES = 2;

interface PresentationState {
  overlay: HTMLElement;
  slides: HTMLElement[];
  currentIndex: number;
  triggerButton: HTMLButtonElement;
  inertedElements: Element[];
  controller: AbortController;
}

let state: PresentationState | null = null;

/**
 * 페이지 초기화. 버튼을 찾고 슬라이드 가능 여부를 판단해 버튼 노출 결정.
 * 중복 호출에 안전(View Transitions 페이지 로드마다 호출됨).
 */
export function initializePresentationMode(): () => void {
  // 멱등성 가드
  if (document.body.dataset.presentationInitialized === "true") {
    return () => {};
  }

  const button = document.querySelector<HTMLButtonElement>(
    '[data-button="presentation-start"]'
  );
  if (!button) return () => {};

  const slideCount = countPotentialSlides();
  if (slideCount < MIN_SLIDES) {
    // 슬라이드 부족: 버튼 숨김 유지
    return () => {};
  }

  // 버튼 노출 + 클릭 핸들러
  button.hidden = false;

  const controller = new AbortController();
  const { signal } = controller;

  button.addEventListener("click", () => openOverlay(button), { signal });

  // 단축키 진입(Shift+P)
  document.addEventListener(
    "keydown",
    event => {
      if (event.shiftKey && event.key === "P" && !state) {
        // input·textarea 포커스 중이면 무시
        const active = document.activeElement;
        const tag = active?.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          (active as HTMLElement)?.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        openOverlay(button);
      }
    },
    { signal }
  );

  // View Transitions 전 오버레이 강제 종료
  document.addEventListener(
    "astro:before-swap",
    () => {
      if (state) closeOverlay();
      document.body.dataset.presentationInitialized = "";
      controller.abort();
    },
    { once: true }
  );

  document.body.dataset.presentationInitialized = "true";

  // cleanup 함수 반환
  return () => {
    controller.abort();
    if (state) closeOverlay();
    document.body.dataset.presentationInitialized = "";
  };
}

/**
 * 실제 조립 가능한 슬라이드 개수를 미리 계산.
 * 타이틀(1) + 목차(0 or 1) + H2 개수.
 */
function countPotentialSlides(): number {
  const article = document.getElementById("article");
  if (!article) return 0;

  const hasH1 = !!document.querySelector("main h1");
  const hasAgenda = !!findAgendaDetails(article);
  const h2Count = article.querySelectorAll(":scope > h2").length;

  return (hasH1 ? 1 : 0) + (hasAgenda ? 1 : 0) + h2Count;
}

/**
 * 오버레이를 생성·마운트하고 활성 상태로 전환.
 */
function openOverlay(triggerButton: HTMLButtonElement): void {
  if (state) return; // 이미 열림

  const slides = buildSlides();
  if (slides.length < MIN_SLIDES) return;

  const overlay = document.createElement("div");
  overlay.className = "presentation-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "프레젠테이션 모드");
  overlay.tabIndex = -1;

  slides.forEach(slide => {
    // section은 기본 focusable이 아니므로 tabIndex=-1로 programmatic focus만 허용.
    // 슬라이드 전환 시 navigateTo()의 focus() 호출과 쌍을 이뤄 스크린리더 친화 구현.
    slide.tabIndex = -1;
    overlay.appendChild(slide);
  });

  const counter = document.createElement("div");
  counter.className = "presentation-counter";
  counter.setAttribute("aria-live", "off");
  counter.textContent = `1 / ${slides.length}`;
  overlay.appendChild(counter);

  // body 자식에 inert 적용 (포커스 트랩 + 스크린리더 차단)
  const inertedElements: Element[] = [];
  for (const child of Array.from(document.body.children)) {
    if (!child.hasAttribute("inert")) {
      child.setAttribute("inert", "");
      inertedElements.push(child);
    }
  }

  document.body.appendChild(overlay);
  document.body.classList.add("presentation-active");

  // 첫 슬라이드 활성화
  slides[0].classList.add("is-active");

  // 오버레이에 포커스 이동
  overlay.focus();

  // 이벤트 리스너: 키보드 네비
  // document 레벨에 부착 — overlay 내부에서 <details>를 펼치면 포커스가 summary로 이동하고,
  // 슬라이드 이동 후 이전 슬라이드가 display:none되면 포커스가 <body>로 탈출해버림.
  // 그 이후 keydown은 body → document로만 버블링되어 overlay까지 도달하지 못함.
  // document에 부착하면 포커스 위치와 무관하게 키 이벤트를 받을 수 있고,
  // `if (!state) return` 가드가 오버레이 닫힌 상태에서 오작동을 방지함.
  const controller = new AbortController();
  const { signal } = controller;

  document.addEventListener(
    "keydown",
    event => {
      if (!state) return;
      handleKeydown(event);
    },
    { signal }
  );

  // 오버레이 바깥 클릭(빈 공간)은 무시. 하단 카운터 영역 클릭 무시.
  // 사용자가 실수로 닫지 않도록 ESC만 닫기 트리거로 유지.

  state = {
    overlay,
    slides,
    currentIndex: 0,
    triggerButton,
    inertedElements,
    controller,
  };

  updateCounter();
}

/**
 * 오버레이 제거 + inert 해제 + 원래 버튼으로 포커스 복귀.
 */
function closeOverlay(): void {
  if (!state) return;

  const {
    overlay,
    triggerButton,
    inertedElements,
    controller,
    currentIndex,
    slides,
  } = state;

  controller.abort();

  // 원래 페이지에서 해당 H2로 스크롤 복귀
  // (타이틀=0, 목차=1?, 첫 H2 = 1 or 2)
  const article = document.getElementById("article");
  if (article) {
    const h2s = article.querySelectorAll<HTMLHeadingElement>(":scope > h2");
    // slides 순서: title + (agenda?) + h2들. currentIndex가 H2 섹션인 경우 스크롤.
    const sectionStartIndex = slides.findIndex(s =>
      s.classList.contains("presentation-slide-section")
    );
    if (sectionStartIndex !== -1 && currentIndex >= sectionStartIndex) {
      const h2Index = currentIndex - sectionStartIndex;
      const targetH2 = h2s[h2Index];
      if (targetH2) {
        // 스크롤은 overlay 제거 후 다음 tick에 실행 (layout 안정화)
        requestAnimationFrame(() => {
          targetH2.scrollIntoView({ block: "start", behavior: "instant" });
        });
      }
    }
  }

  overlay.remove();
  document.body.classList.remove("presentation-active");

  inertedElements.forEach(el => el.removeAttribute("inert"));

  // 포커스 복귀
  triggerButton.focus();

  state = null;
}

/**
 * 키보드 네비게이션 핸들러.
 */
function handleKeydown(event: KeyboardEvent): void {
  if (!state) return;

  switch (event.key) {
    case "ArrowLeft":
    case "PageUp":
      event.preventDefault();
      navigate(-1);
      break;
    case "ArrowRight":
    case "PageDown":
      event.preventDefault();
      navigate(1);
      break;
    case " ":
      event.preventDefault();
      navigate(1);
      break;
    case "Home":
      event.preventDefault();
      navigateTo(0);
      break;
    case "End":
      event.preventDefault();
      navigateTo(state.slides.length - 1);
      break;
    case "Escape":
      event.preventDefault();
      closeOverlay();
      break;
  }
}

function navigate(delta: number): void {
  if (!state) return;
  const next = state.currentIndex + delta;
  if (next < 0 || next >= state.slides.length) return;
  navigateTo(next);
}

function navigateTo(index: number): void {
  if (!state) return;
  const { slides, currentIndex } = state;
  if (index === currentIndex || index < 0 || index >= slides.length) return;

  slides[currentIndex].classList.remove("is-active");
  slides[index].classList.add("is-active");
  state.currentIndex = index;

  // 활성 슬라이드 스크롤 최상단 초기화 + 포커스 이동
  // focus()는 접근성(스크린리더 즉시 새 슬라이드 읽음) + 이슈2 근본 해결(details 내부
  // 포커스가 매 전환마다 활성 슬라이드로 리셋돼 키 이벤트 경로가 항상 일관됨).
  slides[index].scrollTop = 0;
  slides[index].focus();

  updateCounter();
}

function updateCounter(): void {
  if (!state) return;
  const counter = state.overlay.querySelector<HTMLElement>(
    ".presentation-counter"
  );
  if (counter) {
    counter.textContent = `${state.currentIndex + 1} / ${state.slides.length}`;
  }
}

/**
 * 슬라이드 배열 조립.
 */
function buildSlides(): HTMLElement[] {
  const slides: HTMLElement[] = [];

  const titleSlide = buildTitleSlide();
  if (titleSlide) slides.push(titleSlide);

  const article = document.getElementById("article");
  if (!article) return slides;

  const agendaDetails = findAgendaDetails(article);
  if (agendaDetails) {
    slides.push(buildAgendaSlide(agendaDetails));
  }

  // remark-collapse는 `<h2>목차</h2>`를 DOM에 그대로 둠. Agenda 슬라이드로 이미
  // 승격됐으므로 여기서는 같은 h2가 섹션 슬라이드로 중복되지 않도록 필터링.
  // 주의: headingLinks.ts가 각 h2에 `.heading-link` 자식(#)을 이미 붙인 상태라
  // h2.textContent는 "목차#"처럼 나옴. 순수 heading 텍스트만 추출해야 함.
  const h2s = Array.from(
    article.querySelectorAll<HTMLHeadingElement>(":scope > h2")
  ).filter(h2 => !AGENDA_H2_PATTERN.test(getHeadingText(h2)));
  for (const h2 of h2s) {
    slides.push(...buildSectionSlides(h2));
  }

  return slides;
}

/**
 * 타이틀 슬라이드: <h1> + pubDatetime + description을 명시 조립.
 * 본문 article은 건드리지 않아 SeriesList·OG 이미지 혼입 방지.
 */
function buildTitleSlide(): HTMLElement | null {
  const h1 = document.querySelector<HTMLHeadingElement>("main h1");
  if (!h1) return null;

  const slide = document.createElement("section");
  slide.className = "presentation-slide presentation-slide-title";

  const titleClone = document.createElement("h1");
  titleClone.textContent = h1.textContent ?? "";
  slide.appendChild(titleClone);

  // pubDatetime 추출 (Datetime.astro 출력의 <time> 요소)
  const timeEl = document.querySelector<HTMLTimeElement>("main time");
  if (timeEl) {
    const meta = document.createElement("div");
    meta.className = "presentation-meta";
    meta.textContent = timeEl.textContent?.trim() ?? "";
    slide.appendChild(meta);
  }

  // description은 meta[name='description']에서 추출
  const description = document
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.content?.trim();
  if (description) {
    const descEl = document.createElement("p");
    descEl.className = "presentation-description";
    descEl.textContent = description;
    slide.appendChild(descEl);
  }

  return slide;
}

/**
 * article 직계 자식 <details> 중 summary 텍스트가 "목차 보기"인 것을 반환.
 */
function findAgendaDetails(article: HTMLElement): HTMLDetailsElement | null {
  const detailsList =
    article.querySelectorAll<HTMLDetailsElement>(":scope > details");
  for (const details of Array.from(detailsList)) {
    const summaryText = details.querySelector("summary")?.textContent?.trim();
    if (summaryText === AGENDA_SUMMARY_TEXT) {
      return details;
    }
  }
  return null;
}

/**
 * 목차 슬라이드: <details> 복제 → open=true → 링크 비활성 → id 제거.
 */
function buildAgendaSlide(sourceDetails: HTMLDetailsElement): HTMLElement {
  const slide = document.createElement("section");
  slide.className = "presentation-slide presentation-slide-agenda";

  const clone = sourceDetails.cloneNode(true) as HTMLDetailsElement;
  clone.open = true; // 펼친 상태 강제

  // 내부 링크에 agenda-link 클래스 부여 (CSS가 정적 텍스트로 스타일링)
  clone.querySelectorAll("a").forEach(a => {
    a.classList.add("agenda-link");
    a.setAttribute("tabindex", "-1");
  });

  // 중복 id 제거
  clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));

  slide.appendChild(clone);
  return slide;
}

/**
 * H2 섹션 슬라이드들: 기본적으로 해당 h2와 "다음 h2 직전까지의 형제 노드"를 복제.
 * 번역 글의 `핵심 요약 → details → hr → 도입 본문` 패턴은 원문 구조를 바꾸지 않고
 * 프레젠테이션 전용 제목 없는 슬라이드로 분리한다. 도입 본문이 비어 있으면 구분선 뒤를
 * 버리고 요약 슬라이드만 만든다.
 */
function buildSectionSlides(h2: HTMLHeadingElement): HTMLElement[] {
  const summaryIntroSplit = findSummaryIntroSplit(h2);
  if (!summaryIntroSplit) {
    return [buildSectionSlide(h2)];
  }

  // separator(hr)는 요약과 도입을 나누는 경계일 뿐, 요약 슬라이드에는 포함하지 않는다.
  const summarySlide = buildSectionSlide(h2, {
    stopBefore: summaryIntroSplit.separator,
  });
  openSummaryDetails(summarySlide);

  if (!summaryIntroSplit.firstIntroElement) {
    return [summarySlide];
  }

  const introSlide = buildSyntheticSectionSlide(
    summaryIntroSplit.firstIntroElement
  );
  if (!introSlide) {
    return [summarySlide];
  }

  return [summarySlide, introSlide];
}

/**
 * H2 섹션 슬라이드: 해당 h2와 "다음 h2 직전까지의 형제 노드"를 복제.
 */
function buildSectionSlide(
  h2: HTMLHeadingElement,
  options: { stopBefore?: Element } = {}
): HTMLElement {
  const slide = document.createElement("section");
  slide.className = "presentation-slide presentation-slide-section";

  // h2 복제
  const h2Clone = h2.cloneNode(true) as HTMLHeadingElement;
  slide.appendChild(h2Clone);

  appendSiblingClones(slide, h2.nextElementSibling, {
    stopBefore: options.stopBefore,
  });

  sanitizeSlide(slide);
  return slide;
}

/**
 * 제목 없는 도입 본문 슬라이드. 실질 콘텐츠가 없으면 호출부에서 도입 슬라이드를
 * 생략할 수 있도록 null을 반환한다.
 */
function buildSyntheticSectionSlide(startElement: Element): HTMLElement | null {
  const slide = document.createElement("section");
  slide.className = "presentation-slide presentation-slide-section";

  const hasContent = appendSiblingClones(slide, startElement);
  if (!hasContent) return null;

  sanitizeSlide(slide);
  return slide;
}

function appendSiblingClones(
  slide: HTMLElement,
  startElement: Element | null,
  options: { stopBefore?: Element } = {}
): boolean {
  let hasContent = false;
  let sibling = startElement;

  // H2는 프레젠테이션 섹션의 경계이므로 합성 슬라이드도 다음 H2 앞에서 멈춘다.
  while (
    sibling &&
    sibling.tagName !== "H2" &&
    sibling !== options.stopBefore
  ) {
    if (isAgendaBlock(sibling)) {
      sibling = sibling.nextElementSibling;
      continue;
    }

    const clone = sibling.cloneNode(true) as Element;
    slide.appendChild(clone);
    hasContent ||= hasMeaningfulSlideContent(sibling);
    sibling = sibling.nextElementSibling;
  }

  return hasContent;
}

function openSummaryDetails(slide: HTMLElement): void {
  const detailsElements = Array.from(
    slide.querySelectorAll<HTMLDetailsElement>(":scope > details")
  );
  const details =
    detailsElements.find(details =>
      TLDR_SUMMARY_PATTERN.test(
        details.querySelector(":scope > summary")?.textContent ?? ""
      )
    ) ?? detailsElements[0];
  if (details) details.open = true;
}

function findSummaryIntroSplit(
  h2: HTMLHeadingElement
): { separator: Element; firstIntroElement: Element | null } | null {
  if (!SUMMARY_H2_PATTERN.test(getHeadingText(h2))) return null;

  // details 요소 자체가 아니라, 이후 등장하는 hr을 분리 경계로 인정하기 위한 상태만 추적한다.
  let sawDetails = false;
  let sibling = h2.nextElementSibling;
  while (sibling && sibling.tagName !== "H2") {
    if (isAgendaBlock(sibling)) {
      sibling = sibling.nextElementSibling;
      continue;
    }

    if (sibling.tagName === "DETAILS") {
      sawDetails = true;
    }

    // details 없이 등장하는 hr은 일반 구분선일 수 있으므로 분리 기준으로 쓰지 않는다.
    if (sawDetails && sibling.tagName === "HR") {
      const firstIntroElement = findFirstIntroElement(
        sibling.nextElementSibling
      );
      return { separator: sibling, firstIntroElement };
    }

    sibling = sibling.nextElementSibling;
  }

  return null;
}

function findFirstIntroElement(startElement: Element | null): Element | null {
  let sibling = startElement;
  while (sibling && sibling.tagName !== "H2") {
    // 연속된 hr은 도입 본문이 아니라 구분선으로 보고, H2는 다음 섹션의 경계로 본다.
    if (
      sibling.tagName !== "HR" &&
      !isAgendaBlock(sibling) &&
      hasMeaningfulSlideContent(sibling)
    ) {
      return sibling;
    }
    sibling = sibling.nextElementSibling;
  }
  return null;
}

function hasMeaningfulSlideContent(element: Element): boolean {
  if (element.textContent?.trim()) return true;
  return !!element.querySelector(
    "img, picture, video, audio, canvas, svg, iframe, table, pre"
  );
}

/**
 * 슬라이드 내부 DOM 정리:
 * - 중복 id 제거
 * - 코드 복사 버튼·헤딩 앵커 제거 (이벤트 리스너 손실된 상태로 남으면 UX 혼란)
 * - lazy-load 이미지를 eager로 전환
 */
function sanitizeSlide(slide: HTMLElement): void {
  // 1. id 제거 (:target / getElementById 중복 방지)
  slide.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));

  // 2. 코드 복사 버튼 제거
  slide.querySelectorAll(".copy-code").forEach(btn => btn.remove());

  // 3. heading 앵커 링크 제거 (headingLinks.ts가 붙인 #)
  slide.querySelectorAll(".heading-link").forEach(a => a.remove());

  // 4. lazy-load 이미지는 eager로 전환하여 즉시 로드
  slide
    .querySelectorAll<HTMLImageElement>("img[loading='lazy']")
    .forEach(img => {
      img.loading = "eager";
    });
}

/**
 * 목차 <details> 블록 식별 (중복 방지).
 */
function isAgendaBlock(el: Element): boolean {
  if (el.tagName !== "DETAILS") return false;
  const summaryText = el.querySelector("summary")?.textContent?.trim();
  return summaryText === AGENDA_SUMMARY_TEXT;
}

/**
 * heading의 순수 텍스트만 추출 (headingLinks.ts가 붙인 `.heading-link` 자식 제외).
 * 이 블로그는 초기화 순서상 addHeadingLinks가 initializePresentationMode보다
 * 먼저 실행되므로 h2.textContent에 "#"이 이미 포함돼 있다.
 */
function getHeadingText(heading: HTMLHeadingElement): string {
  const clone = heading.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".heading-link").forEach(el => el.remove());
  return clone.textContent?.trim() ?? "";
}
