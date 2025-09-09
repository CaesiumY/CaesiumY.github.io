/**
 * Attaches links to headings in the document,
 * allowing sharing of sections easily
 */
export function addHeadingLinks(): void {
  const headings = Array.from(
    document.querySelectorAll("h2, h3, h4, h5, h6")
  );
  
  for (const heading of headings) {
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