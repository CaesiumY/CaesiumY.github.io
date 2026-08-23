# AGENTS.md

Guide for Codex (OpenAI Codex) when working with code in this repository.

## Project Overview

Caesiumy's personal blog at https://caesiumy.dev — Astro SSG, started from the AstroPaper template and customized since. Blog posts live in `contents/blog/` (not `src/content/`).

## Development Commands

```bash
pnpm install       # Install dependencies (pnpm 10, Node 22.22.3+ / 24.16+ / 26.3+)
pnpm dev           # Dev server (localhost:4321)
pnpm build         # astro check + astro build + pagefind index + copy to public/
pnpm preview       # Preview the production build
pnpm test          # Playwright E2E tests (auto-starts the dev server)
pnpm lint          # ESLint
pnpm format        # Prettier write (see the CI & platform gotchas)
pnpm sync          # Astro type sync
```

## Design Rules

- ⚠️ IMPORTANT: Blog post images live in the same folder as the post markdown (`contents/blog/<post>/image.png`, referenced as `./image.png`) — never in `public/`, which bypasses Astro image optimization. Use markdown image syntax, not HTML `<img>` tags.
- ⚠️ IMPORTANT: Translated posts may hotlink the source article's images instead. Hotlinking is the DEFAULT; localising (downloading into the post folder) is the exception that needs a reason. Localise only when the source's own licence or terms permit redistribution, or the author gave permission for it. A page being official, well-known, or freely readable is NOT permission — check what its terms actually say, and check that the specific image is the source's own work rather than third-party artwork the page merely embeds, since one page can carry images with different owners. When the answer is unclear for an image, hotlink that image. Record which images you localised and on what basis in the PR description. The rule above still applies to any image you do localise: post folder, `./` reference, never `public/`.
- Image `alt` and the visible caption should not repeat the same sentence — a screen reader would announce it twice. Prefer an empty `alt` (`![](url)`) when an adjacent caption already describes the image, which is the standard fix and invents nothing. Only differentiate the two when the source itself gives you distinct material to work with; never manufacture an interpretation to fill the gap, and keep every word traceable to the source (see the `alt` rule in `.claude/skills/translate-writer/data/style-guide.md`, which exists because invented `alt` text was once flagged as an accuracy defect). Clipper exports commonly produce `![x](url)` followed by a bare `x` paragraph — resolve it by emptying the `alt`, not by writing new prose.
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

- Posts are plain `.md` only — there is no MDX integration. Files whose **filename** starts with `_` are excluded from the blog collection (loader pattern `**/[^_]*.md`), a stronger exclusion than `draft: true`. ⚠️ `_`-prefixed **directories are NOT excluded**: `contents/blog/_samples/` (17 posts) does load into the collection and shows up in dev listings — they are all `draft: true`, so only production hides them. Count posts with the loader's rule, not by filtering `_samples` out of a `find`.
- Scheduled publishing is build-time only: a post with a future `pubDatetime` stays hidden until a build runs after that time (minus the 15-minute `SITE.scheduledPostMargin`). Without a redeploy it never appears. Dev mode shows drafts.
- Omitted `tags` defaults to `["others"]`.
- A `## 목차` heading inside a post triggers remark-toc auto-generation, collapsed under "목차 보기".
- Add remark/rehype plugins via `markdown.processor: unified({...})` in `astro.config.ts` (Astro 6.4+ style) — the legacy top-level `markdown.remarkPlugins`/`rehypePlugins`/`remarkRehype` keys are deprecated.
- The frontmatter schema lives in `src/content.config.ts` (`pubDatetime`, `modDatetime`, `ogImage`, `series`, ...) — read it before writing frontmatter; field names differ from upstream AstroPaper docs.
- Translated posts must live under `contents/blog/translation/` and have a title starting with `[번역]` — the two must always agree, and `scripts/check-post-classification.mjs` enforces this in CI.

### Build & search

- The build chain is `astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`. The copied `public/pagefind` is gitignored — search in dev mode only works after at least one local build.
- Dynamic OG images (satori) require three local font files in `src/assets/fonts/` (Pretendard Regular/Bold, NotoEmoji) — missing fonts throw and fail the build.

### CI & platform

- The merge gate is the single `Code standards & build` job (audit → lint → format check → docs sync → asset lint → post classification → E2E pins → integrity self-test → build → E2E scope → E2E). The `Claude Code Review` workflow is advisory — its failures do not block merges.
- Windows: after `pnpm format`, `git status` may list files as modified with no real content change (CRLF). Judge with `git diff` and restore false positives with `git checkout`. A fresh Windows checkout can also fail `pnpm format:check` on nearly every file (`endOfLine: "lf"` vs CRLF working copies) — trust the CI verdict and never mass-reformat to "fix" it.
- Playwright runs against the dev server (port 4321), not the build; CI uses 1 worker with 2 retries. Specs pin real posts by slug — `e2e/fixtures/test-posts.ts`, plus `presentation-mode.spec.ts` which pins two translation posts by slug *and* by their heading/`## 목차`/핵심 요약 structure. Renaming, moving, or restructuring a pinned post breaks the suite; `node scripts/e2e-scope.mjs --check` (in CI) fails first and names the offending literal.
- CI scopes which E2E specs run by changed paths (`node scripts/e2e-scope.mjs --changed-from <base-sha>`): changes confined to `contents/`, `.claude/`, `.agents/`, or a root-level `*.md` run `posts-tabs` + `og-image` plus every spec whose pinned content was touched; anything else runs the full suite. Those three non-content entries are in the list because the Astro build never reads them, and `--check` enforces that premise against `src/**` and `astro.config.ts` so a page that renders skill data cannot silently turn E2E off. ⚠️ The two premise checks are deliberately different: directory names (`.claude`, `.agents`) are matched as bare substrings so that `path.join(root, ".agents", …)` is still caught, but root doc *filenames* are matched only when a whole string literal is a path to them — `CLAUDE.md` legitimately appears in prose (`src/data/projects.ts`), so a substring match there would fail CI on day one. This is what keeps translation *draft* PRs cheap: the `/translate-writer` pipeline commits skill data alongside the post, and without it every draft PR falls back to the full suite. Pins are derived from URL literals in `e2e/**` (not hand-maintained), so a spec that starts referencing a post is picked up automatically. Anything undecidable falls back to the full suite — the scoping never fails toward less coverage. ⚠️ `/about` and `/portfolio` live in `contents/pages/`, so "content-only" does not mean "no page tests".
- ⚠️ IMPORTANT: `AGENTS.md` is the SINGLE SOURCE for shared agent guidance — edit it, not `CLAUDE.md`. `CLAUDE.md` is a thin wrapper that pulls this file in with Claude Code's `@AGENTS.md` import and then adds Claude-only content (the `## Skills` list) below it. Put anything both tools should follow in `AGENTS.md`; put Claude-only content under the separator in `CLAUDE.md`. CI (`node scripts/check-agent-docs-sync.mjs`) only verifies the import line still exists — drop it and Claude Code sessions silently load none of this file. A symlink would work on macOS and Linux but needs Administrator rights or Developer Mode on Windows, which is why this repo uses the import.
- ⚠️ Skill data IS still mirrored, and nothing checks it: skill data under `.claude/skills/<skill>/data/` and `.agents/skills/<skill>/data/` is mirrored too (style guides, glossaries, approved posts, samples symlinks, feedback logs). Only path self-references (`.claude/...` vs `.agents/...`) and timestamps may differ. `check-agent-docs-sync.mjs` does NOT cover these directories, so a drift here stays green in CI — when a skill writes learnings to one side, update the other in the same commit.
- Skill/agent definitions are linted by `node scripts/check-claude-assets.mjs` (also in CI): skill frontmatter must have `name`/`description`/`allowed-tools` with `name` matching the directory; agent `model` must be an alias (haiku|sonnet|opus, never a concrete model ID); `subagent_type`/`agentType` references (SKILL.md + references/*.md) must name a defined agent (`general-purpose` is forbidden); referenced `.claude/...` paths must exist.

## Skills (Codex 스킬 시스템)

`.agents/skills/`에 정의된 스킬들입니다. `/스킬이름`으로 호출합니다. Claude Code 전용 스킬(`/agents-md-optimizer`)은 `.claude/skills/`에만 존재합니다 — 아래 목록과 CLAUDE.md의 차이는 의도된 것입니다.

- `/translate-writer` — 영어 → 한국어 번역 파이프라인 (에이전트 6개)
- `/blog-writer` — 한국어 블로그 글 작성 (에이전트 4개)
- `/polish`, `/polish-file` — 개별 문장 / 파일 전체 다듬기
- 역할 프롬프트 정의: `.agents/agents/` · 번역 스타일 가이드/용어집: `.agents/skills/translate-writer/data/`
- ⚠️ 이력서·포트폴리오·면접 준비 스킬은 이 레포에서 삭제되었습니다 — Claude Code의 `interview-agents` 플러그인으로 통합했습니다. Codex에는 대응물이 없습니다
- 커리어 데이터(인터뷰 노트·포트폴리오 드래프트)는 `contents/career/`에 있고 gitignore 대상입니다
- ⚠️ 커리어 도구 산출물 경로(`portfolio/`·`resumes/`·`assignments/`)는 실행한 cwd 기준으로 생성되며 세 경로 모두 루트에 한정해 gitignore 처리했습니다. 사용법 전체는 `contents/career/README.md` 참조

## Environment

Optional env vars (schema in `astro.config.ts`): `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_GOOGLE_ANALYTICS_ID`.
