/**
 * Get icon SVG from hidden template
 */
function getIconFromTemplate(iconName: "copy" | "check"): SVGElement | null {
  const template = document.getElementById(
    "copy-button-icons"
  ) as HTMLTemplateElement | null;
  if (!template) {
    console.warn("Copy button icons template not found");
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
  const codeBlocks = Array.from(document.querySelectorAll("pre"));

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
        "transition-opacity",
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
    }, 700);
  }
}