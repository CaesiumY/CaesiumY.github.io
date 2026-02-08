/**
 * Attaches links to headings in the document,
 * allowing sharing of sections easily
 */
export function addHeadingLinks(): void {
  // 이미 링크가 추가된 헤딩은 제외 (중복 방지)
  const headings = Array.from(
    document.querySelectorAll(
      "h2:not([data-heading-linked]):not([data-no-heading-link]), h3:not([data-heading-linked]):not([data-no-heading-link]), h4:not([data-heading-linked]):not([data-no-heading-link]), h5:not([data-heading-linked]):not([data-no-heading-link]), h6:not([data-heading-linked]):not([data-no-heading-link])"
    )
  );

  for (const heading of headings) {
    heading.setAttribute("data-heading-linked", "true");
    heading.classList.add("group");
    const link = document.createElement("a");
    link.className =
      "heading-link ms-2 no-underline opacity-75 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100";
    link.href = "#" + heading.id;

    const span = document.createElement("span");
    span.ariaHidden = "true";
    span.innerText = "#";
    link.appendChild(span);
    heading.appendChild(link);
  }
}