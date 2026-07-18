/**
 * 게시글 목록 탭의 단일 정의.
 *
 * 탭 UI(PostFilterTabs)와 breadcrumb 라벨이 같은 출처를 쓰도록 여기서만 정의한다.
 * URL 세그먼트(`key`)는 `src/pages/posts/<key>/[...page].astro` 라우트 경로와
 * 일치해야 하며, `contents/blog/` 아래에 같은 이름의 디렉터리를 만들면 글 URL과
 * 충돌한다 — `scripts/check-post-classification.mjs`가 이를 CI에서 막는다.
 */

export interface PostTab {
  key: "all" | "authored" | "translated";
  label: string;
  href: string;
}

export const POST_TABS: readonly PostTab[] = [
  { key: "all", label: "전체", href: "/posts" },
  { key: "authored", label: "직접 쓴 글", href: "/posts/authored" },
  { key: "translated", label: "번역", href: "/posts/translated" },
];

/**
 * breadcrumb용 라벨 맵. `/posts` 아래 하위 경로를 갖는 탭만 담는다
 * ("all"은 `/posts` 자신이라 세그먼트가 없다).
 */
export const POST_TAB_LABELS: Record<string, string> = Object.fromEntries(
  POST_TABS.filter(tab => tab.key !== "all").map(tab => [tab.key, tab.label])
);
