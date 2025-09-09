// Phosphor icon SVGs
const copyIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>`;

const checkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="m229.66,77.66-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>`;

/**
 * Create SVG element with custom attributes
 */
function createSvgIcon(svgString: string, customClasses: string, width = "16", height = "16"): string {
  return svgString
    .replace('<svg', `<svg width="${width}" height="${height}" class="${customClasses}"`);
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

    // Create copy icon using Phosphor SVG
    const copyIconHtml = createSvgIcon(
      copyIconSvg, 
      "copy-icon opacity-90 group-hover:opacity-100 transition-opacity duration-200"
    );

    // Create check icon using Phosphor SVG
    const checkIconHtml = createSvgIcon(
      checkIconSvg,
      "check-icon opacity-0 absolute top-1.5 left-1.5 transition-opacity duration-200 text-green-600"
    );

    copyButton.innerHTML = copyIconHtml + checkIconHtml;
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