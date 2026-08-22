# CLAUDE.md

Guide for Claude Code (claude.ai/code) when working with code in this repository.

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

- The merge gate is the single `Code standards & build` job (audit → lint → format check → docs sync → asset lint → post classification → build → E2E). The `Claude Code Review` workflow is advisory — its failures do not block merges.
- Windows: after `pnpm format`, `git status` may list files as modified with no real content change (CRLF). Judge with `git diff` and restore false positives with `git checkout`. A fresh Windows checkout can also fail `pnpm format:check` on nearly every file (`endOfLine: "lf"` vs CRLF working copies) — trust the CI verdict and never mass-reformat to "fix" it.
- Playwright runs against the dev server (port 4321), not the build; CI uses 1 worker with 2 retries. Test fixtures reference real post slugs (`e2e/fixtures/test-posts.ts`) — renaming those posts breaks the suite.
- `CLAUDE.md` and `AGENTS.md` are mirrors — when editing one, mirror the change to the other. Only the title line, the intro line, and the `## Skills` section may differ; any other divergence fails CI (`node scripts/check-agent-docs-sync.mjs`).
- Skill/agent definitions are linted by `node scripts/check-claude-assets.mjs` (also in CI): skill frontmatter must have `name`/`description`/`allowed-tools` with `name` matching the directory; agent `model` must be an alias (haiku|sonnet|opus, never a concrete model ID); `subagent_type`/`agentType` references (SKILL.md + references/*.md) must name a defined agent (`general-purpose` is forbidden); referenced `.claude/...` paths must exist.

## Skills (Claude Code 스킬 시스템)

`.claude/skills/`에 정의된 스킬들입니다. `/스킬이름`으로 호출합니다.

- `/translate-writer` — 영어 → 한국어 번역 파이프라인 (에이전트 6개 · 오케스트레이터-워커)
- `/blog-writer` — 한국어 블로그 글 작성 (에이전트 4개)
- `/polish`, `/polish-file` — 개별 문장 / 파일 전체 다듬기
- `/agents-md-optimizer` — CLAUDE.md/AGENTS.md discoverability 최적화
- ⚠️ 이력서·포트폴리오·면접 준비는 이 레포에 없습니다 — `interview-agents` 플러그인을 사용하세요 (`/interview-agents:portfolio`, `/interview-agents:review-resume` 등 8개 커맨드). 레포판 `/portfolio-strategy`·`/resume-specialist`는 중복이라 삭제했습니다
- 커리어 데이터(인터뷰 노트·포트폴리오 드래프트)는 `contents/career/`에 있고 gitignore 대상입니다 — 옵시디언 볼트(`contents/`)에서 편집하되 커밋되지 않습니다
- ⚠️ 커리어 커맨드는 반드시 `contents/career/`를 cwd로 두고 실행하세요. 플러그인은 산출물을 **실행한 cwd 기준** `portfolio/`·`resumes/`·`assignments/`에 씁니다 — 레포 루트에서 실행하면 개인 데이터가 볼트 밖으로 흩어집니다(세 경로 모두 gitignore로 막아뒀지만 위치가 틀어집니다). 사용법 전체는 `contents/career/README.md` 참조
- 에이전트 정의: `.claude/agents/` · 번역 스타일 가이드/용어집: `.claude/skills/translate-writer/data/`
- 28개 번역투 패턴의 단일 정본: `.claude/skills/translate-writer/references/translation-patterns.md` — 패턴 번호를 다른 파일에 복사하지 말 것
- 번역 파이프라인은 오케스트레이터-워커 구조 — 메인 루프(Opus)는 조율 전용, 번역·검토·다듬기는 frontmatter 모델(haiku|sonnet|opus)의 전담 에이전트가 수행 (translate-writer SKILL.md '오케스트레이션 원칙' 섹션 참조)
- 재작성 단계(Phase 2 수정, Phase 3 polish, 외부 윤문 도구) 뒤에는 무결성 게이트 필수: `node .claude/skills/translate-writer/scripts/check-translation-integrity.mjs <before.md> <after.md>` (헤딩·이미지·코드·수치·커맨드 불변 검사, exit 1이면 GATE 2 진입 금지). polish로 바뀐 문장은 translation-verifier 델타 모드로 재검증 — 원문을 보지 않는 윤문이 verifier 수정을 되돌린 사례가 있음
- 사용자 게이트는 `✋ GATE N — AskUserQuestion` 표기로 통일 — 게이트에서 AskUserQuestion 없이 다음 Phase 진행 금지

## Environment

Optional env vars (schema in `astro.config.ts`): `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_GOOGLE_ANALYTICS_ID`.
