/**
 * E2E 스펙 공용 테스트 포스트.
 *
 * 선정 조건 (slug 교체 시에도 모두 만족해야 함):
 * - slug frontmatter 없음 → URL 경로와 localStorage 키가 일치 (continue-reading 요구)
 * - PostNavigation의 이전/다음 글 링크 존재 (listener-leak의 View Transitions 왕복 요구)
 * - 스크롤 가능 높이가 충분히 긴 글 (back-to-top 30% 가시성 임계 검증 요구)
 */
export const TEST_POST_SLUG = "ai/claude-code-token-burning-session-retrospect";
export const TEST_POST_URL = `/posts/${TEST_POST_SLUG}`;
