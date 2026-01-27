/** 피드백 표시 시간 상수 */
const FEEDBACK_DURATION_SUCCESS_MS = 700;
const FEEDBACK_DURATION_ERROR_MS = 2000;

/**
 * Get icon SVG from hidden template
 */
function getIconFromTemplate(iconName: "copy" | "check"): SVGElement | null {
  const template = document.getElementById(
    "copy-button-icons"
  ) as HTMLTemplateElement | null;
  if (!template) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- DEV 모드 전용 디버깅 경고
      console.warn(
        "Copy button icons template not found. " +
          "Ensure <template id='copy-button-icons'> exists in the DOM " +
          "with data-icon='copy' and data-icon='check' SVGs."
      );
    }
    return null;
  }

  const icon = template.content.querySelector(`[data-icon="${iconName}"]`);
  return icon?.cloneNode(true) as SVGElement | null;
}

/**
 * Attaches copy buttons to code blocks in the document,
 * allowing users to copy code easily.
 */
export function attachCopyButtons(): void {
  // 이미 초기화된 코드 블록은 제외 (중복 이벤트 리스너 방지)
  const codeBlocks = Array.from(
    document.querySelectorAll("pre:not([data-copy-initialized])")
  );

  for (const codeBlock of codeBlocks) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    // Check if --file-name-offset custom property exists
    const computedStyle = getComputedStyle(codeBlock);
    const hasFileNameOffset =
      computedStyle.getPropertyValue("--file-name-offset").trim() !== "";

    // Determine the top positioning class
    const topClass = hasFileNameOffset
      ? "top-(--file-name-offset)"
      : "-top-3";

    const copyButton = document.createElement("button");
    copyButton.className = `copy-code absolute end-3 ${topClass} rounded bg-muted border border-muted p-1.5 text-foreground hover:bg-accent/10 focus:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200 group`;
    copyButton.setAttribute("aria-label", "코드 복사");
    copyButton.setAttribute("title", "코드를 클립보드에 복사");

    // Get icons from hidden template
    const copyIcon = getIconFromTemplate("copy");
    const checkIcon = getIconFromTemplate("check");

    if (copyIcon && checkIcon) {
      // Apply styles to copy icon
      copyIcon.setAttribute("width", "16");
      copyIcon.setAttribute("height", "16");
      copyIcon.classList.add(
        "copy-icon",
        "opacity-90",
        "group-hover:opacity-100",
        "transition-all",
        "duration-200"
      );

      // Apply styles to check icon
      checkIcon.setAttribute("width", "16");
      checkIcon.setAttribute("height", "16");
      checkIcon.classList.add(
        "check-icon",
        "opacity-0",
        "absolute",
        "top-1.5",
        "left-1.5",
        "transition-opacity",
        "duration-200",
        "text-green-600"
      );

      copyButton.appendChild(copyIcon);
      copyButton.appendChild(checkIcon);
    }
    codeBlock.setAttribute("tabindex", "0");
    codeBlock.setAttribute("data-copy-initialized", "true");
    codeBlock.appendChild(copyButton);

    // wrap codebock with relative parent element
    codeBlock?.parentNode?.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);

    copyButton.addEventListener("click", async () => {
      await copyCode(codeBlock, copyButton);
    });
  }
}

/**
 * Copy code from a code block to clipboard
 */
async function copyCode(block: Element, button: HTMLButtonElement): Promise<void> {
  const code = block.querySelector("code");
  const text = code?.textContent || "";

  try {
    await navigator.clipboard.writeText(text);

    // visual feedback that task is completed
    const copyIcon = button.querySelector(".copy-icon") as HTMLElement;
    const checkIcon = button.querySelector(".check-icon") as HTMLElement;

    if (copyIcon && checkIcon) {
      copyIcon.style.opacity = "0";
      checkIcon.style.opacity = "1";

      setTimeout(() => {
        copyIcon.style.opacity = "0.9";
        checkIcon.style.opacity = "0";
      }, FEEDBACK_DURATION_SUCCESS_MS);
    } else {
      // 아이콘이 없을 때 fallback 피드백
      button.setAttribute("aria-label", "복사됨!");
      setTimeout(() => {
        button.setAttribute("aria-label", "코드 복사");
      }, FEEDBACK_DURATION_SUCCESS_MS);
    }
  } catch {
    // 클립보드 접근 실패 시 (권한 거부, 비보안 컨텍스트 등)
    button.setAttribute("aria-label", "복사 실패");

    // 시각적 피드백 - 아이콘 색상 변경
    const copyIcon = button.querySelector(".copy-icon") as HTMLElement;
    if (copyIcon) {
      copyIcon.classList.add("text-red-500");
    }

    // 단일 타임아웃으로 상태 복원 (경쟁 조건 방지)
    setTimeout(() => {
      if (copyIcon) {
        copyIcon.classList.remove("text-red-500");
      }
      button.setAttribute("aria-label", "코드 복사");
    }, FEEDBACK_DURATION_ERROR_MS);
  }
}
