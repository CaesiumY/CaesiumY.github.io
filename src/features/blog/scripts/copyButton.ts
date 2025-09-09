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

    // Create copy icon
    const copyIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon opacity-90 group-hover:opacity-100 transition-opacity duration-200"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>`;

    // Create check icon
    const checkIconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon opacity-0 absolute top-1.5 left-1.5 transition-opacity duration-200 text-green-600"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>`;

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