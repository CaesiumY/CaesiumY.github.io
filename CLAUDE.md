# CLAUDE.md

Guide for Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Caesiumy's personal blog at https://caesiumy.dev — Astro SSG, started from the AstroPaper template and customized since. Blog posts live in `contents/blog/` (not `src/content/`).

## Development Commands

```bash
pnpm install       # Install dependencies (pnpm 10, Node >= 22)
pnpm dev           # Dev server (localhost:4321)
pnpm build         # astro check + astro build + pagefind index + copy to public/
pnpm preview       # Preview the production build
pnpm test          # Playwright E2E tests (auto-starts the dev server)
pnpm lint          # ESLint
pnpm format        # Prettier write (see Windows gotcha below)
pnpm sync          # Astro type sync
```

## Design Rules

- ⚠️ IMPORTANT: Blog post images live in the same folder as the post markdown (`contents/blog/<post>/image.png`, referenced as `./image.png`) — never in `public/`, which bypasses Astro image optimization. Use markdown image syntax, not HTML `<img>` tags.
- ⚠️ IMPORTANT: Never disable ESLint rules or ignore files without explicit user permission — fix the root cause instead. If disabling is truly unavoidable, write `// eslint-disable-next-line <rule> -- Reason: <detailed reason>` and report it as a "Confirmation Required" item in your final response.
- Verify changes with `pnpm build` and inspect `dist/`, not just the dev server — image optimization, pagefind indexing, and scheduled-post filtering happen only at build time, so dev-only verification can pass while the build is broken.
- Use Conventional Commits for all commit messages.

## Gotchas & Landmines

### View Transitions (ClientRouter)

Page navigations swap the DOM without a full reload. Three rules prevent the listener-leak class of bugs (fixed across PR #75/#76, guarded by `e2e/listener-leak.spec.ts`):

- An inline `<script>` without `data-astro-rerun` runs once per browser session — listeners attached directly to page elements go dead on revisit. Attach to `document` with event delegation plus a global guard flag instead (pattern: `ThemeToggle.astro`, `PdfDownloadButton.astro`).
- Never add listeners to persistent targets (`document`, `window`, `MediaQueryList`) on every swap — they accumulate. Sanctioned patterns: `data-astro-rerun` + AbortController aborted on `astro:before-swap` (`BackToTopButton.astro`, `progressBar.ts`), or hoist the listener to module top level and query the DOM fresh inside the handler (`Navigation.astro`).
- Never cache DOM element references in module scope — after a swap they point at a detached tree (this silently broke ShareLinks). Re-initialize on `astro:page-load` with an idempotency guard (`ShareLinks.astro`).
- When adding a new interactive script, extend `e2e/listener-leak.spec.ts` so the leak invariant covers it.

### Content pipeline

- Posts are plain `.md` only — there is no MDX integration. Files starting with `_` are excluded from the blog collection entirely (loader pattern `**/[^_]*.md`), a stronger exclusion than `draft: true`.
- Scheduled publishing is build-time only: a post with a future `pubDatetime` stays hidden until a build runs after that time (minus the 15-minute `SITE.scheduledPostMargin`). Without a redeploy it never appears. Dev mode shows drafts.
- Omitted `tags` defaults to `["others"]`.
- A `## 목차` heading inside a post triggers remark-toc auto-generation, collapsed under "목차 보기".
- Add remark/rehype plugins via `markdown.processor: unified({...})` in `astro.config.ts` (Astro 6.4+ style) — the legacy top-level `markdown.remarkPlugins`/`rehypePlugins`/`remarkRehype` keys are deprecated.
- The frontmatter schema lives in `src/content.config.ts` (`pubDatetime`, `modDatetime`, `ogImage`, `series`, ...) — read it before writing frontmatter; field names differ from upstream AstroPaper docs.

### Build & search

- The build chain is `astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`. The copied `public/pagefind` is gitignored — search in dev mode only works after at least one local build.
- Dynamic OG images (satori) require three local font files in `src/assets/fonts/` (Pretendard Regular/Bold, NotoEmoji) — missing fonts throw and fail the build.

### CI & platform

- The merge gate is the single `Code standards & build` job (audit → lint → format check → build → E2E). The `Claude Code Review` workflow is advisory — its failures do not block merges.
- Windows: after `pnpm format`, `git status` may list files as modified with no real content change (CRLF). Judge with `git diff` and restore false positives with `git checkout`.
- Playwright runs against the dev server (port 4321), not the build; CI uses 1 worker with 2 retries. Test fixtures reference real post slugs (`e2e/fixtures/test-posts.ts`) — renaming those posts breaks the suite.
- `CLAUDE.md` and `AGENTS.md` are manual mirrors (tool-name/path substitutions only, no sync tooling) — when editing one, mirror the change to the other.

## Skills (Claude Code 스킬 시스템)

`.claude/skills/`에 정의된 스킬들입니다. `/스킬이름`으로 호출합니다.

- `/translate-writer` — 영어 → 한국어 번역 파이프라인 (에이전트 6개)
- `/blog-writer` — 한국어 블로그 글 작성 (에이전트 4개)
- `/polish`, `/polish-file` — 개별 문장 / 파일 전체 다듬기
- `/resume-specialist` — 이력서 작성·검토·ATS 최적화
- `/portfolio-strategy` — 인터뷰형 포트폴리오 섹션 작성
- `/agents-md-optimizer` — CLAUDE.md/AGENTS.md discoverability 최적화
- 에이전트 정의: `.claude/agents/` · 번역 스타일 가이드/용어집: `.claude/skills/translate-writer/data/`

## Environment

Optional env vars (schema in `astro.config.ts`): `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_GOOGLE_ANALYTICS_ID`.
