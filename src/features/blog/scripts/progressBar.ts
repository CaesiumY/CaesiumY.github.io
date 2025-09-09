/**
 * Creates and manages a reading progress indicator at the top of the page
 */
export function initializeProgressBar(): void {
  createProgressBar();
  updateScrollProgress();
}

/**
 * Create a progress indicator at the top
 */
function createProgressBar(): void {
  // Avoid duplicate bars when navigating with client router
  if (document.getElementById("myBar")) return;

  // Create the main container div
  const progressContainer = document.createElement("div");
  progressContainer.className =
    "progress-container fixed top-0 z-10 h-1 w-full bg-background";
  progressContainer.id = "reading-progress-container";

  // Create the progress bar div
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar h-1 w-full bg-accent";
  progressBar.id = "myBar";
  // Use transform for GPU-accelerated updates
  progressBar.style.transformOrigin = "left center";
  progressBar.style.willChange = "transform";
  progressBar.style.transform = "scaleX(0)";

  // Append the progress bar to the progress container
  progressContainer.appendChild(progressBar);

  // Append the progress container to the document body
  document.body.appendChild(progressContainer);
}

/**
 * Update the progress bar when user scrolls
 */
function updateScrollProgress(): void {
  let ticking = false;
  let maxScrollable = 1;
  const controller = new AbortController();
  const { signal } = controller;

  function recalcScrollable(): void {
    const docEl = document.documentElement;
    maxScrollable = Math.max(1, docEl.scrollHeight - docEl.clientHeight);
  }

  function handle(): void {
    const docEl = document.documentElement;
    const winScroll = docEl.scrollTop || document.body.scrollTop || 0;
    const raw = (winScroll / maxScrollable) * 100;
    const scrolled = Math.max(0, Math.min(100, raw));

    const myBar = document.getElementById("myBar");
    if (myBar) {
      myBar.style.transform = `scaleX(${scrolled / 100})`;
    }
  }

  function onScroll(): void {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handle();
        ticking = false;
      });
      ticking = true;
    }
  }

  document.addEventListener("scroll", onScroll, { passive: true, signal });
  window.addEventListener("resize", () => {
    recalcScrollable();
    onScroll();
  }, { signal });
  window.addEventListener("load", () => {
    recalcScrollable();
    handle();
  }, { once: true, signal });

  document.addEventListener("astro:before-swap", () => {
    controller.abort();
    const container = document.getElementById("reading-progress-container");
    if (container) container.remove();
  }, { once: true });

  recalcScrollable();
  handle();
}