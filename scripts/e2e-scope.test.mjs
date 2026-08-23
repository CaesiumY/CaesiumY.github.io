/**
 * Regression suite for the E2E scope resolver's premise checks.
 *
 * Run with `pnpm test:scripts` (node:test, no extra dependencies).
 *
 * Both functions here decide whether a changed file can skip most of the E2E
 * suite, so a wrong answer either wastes CI time (harmless) or silently drops
 * coverage (the failure this whole script exists to prevent). Every case below
 * maps to a hole that was actually found in review rather than imagined.
 *
 * When changing the detection logic, add the case here first.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { isScopeSafe, literalPointsToDoc } from "./e2e-scope.mjs";

test("literalPointsToDoc treats a whole-literal path as a reference", async t => {
  const referencing = {
    "the bare filename": "README.md",
    "a relative path": "../README.md",
    "a deeply relative path": "../../README.md",
    "an absolute-looking path": "/repo/README.md",
    // Vite serves `?raw`/`?url` imports; the suffix is not part of the path.
    // Missing these was a real hole — a README-only change would have been
    // called scope-safe while the build actually inlined the file.
    "a Vite raw import": "../README.md?raw",
    "a Vite url import": "./README.md?url",
    "a fragment suffix": "../README.md#intro",
    "both suffixes": "../README.md?raw#top",
  };

  for (const [label, literal] of Object.entries(referencing)) {
    await t.test(label, () => {
      assert.equal(literalPointsToDoc(literal, "README.md"), true);
    });
  }
});

test("literalPointsToDoc ignores prose that merely mentions a doc", async t => {
  const notReferencing = {
    // The case that forced this design: src/data/projects.ts describes a skill
    // in a sentence containing "CLAUDE.md". A substring check would have failed
    // CI on the very first run.
    "a Korean sentence containing the name":
      "AI 에이전트 컨텍스트 파일(CLAUDE.md 등)을 최적화하는 스킬",
    "an English sentence containing the name": "see CLAUDE.md for details",
    "a different file that ends with the same word":
      "../docs/NOT-CLAUDE.md-notes.txt",
    "a same-named file without a path boundary": "MYCLAUDE.md",
    "an unrelated markdown file": "../docs/GUIDE.md",
  };

  for (const [label, literal] of Object.entries(notReferencing)) {
    await t.test(label, () => {
      assert.equal(literalPointsToDoc(literal, "CLAUDE.md"), false);
    });
  }
});

test("isScopeSafe admits paths the Astro build never renders", async t => {
  const safe = {
    "a blog post": "contents/blog/translation/foo/index.md",
    "an image beside a post": "contents/blog/translation/foo/hero.png",
    "a standalone page": "contents/pages/about.md",
    // Translation draft PRs always carry these alongside the post; without
    // them every draft PR fell back to the full suite.
    "Claude skill data": ".claude/skills/translate-writer/data/glossary.md",
    "the Codex mirror": ".agents/skills/translate-writer/data/style-guide.md",
    "a polish report": ".claude/polish-reports/x.json",
    "a root doc": "AGENTS.md",
    "another root doc": "README.md",
  };

  for (const [label, file] of Object.entries(safe)) {
    await t.test(label, () => {
      assert.equal(isScopeSafe(file), true);
    });
  }
});

test("isScopeSafe rejects anything that can reach the rendered site", async t => {
  const unsafe = {
    "a component": "src/components/Card.astro",
    "a route": "src/pages/about.astro",
    "the Astro config": "astro.config.ts",
    "the package manifest": "package.json",
    "the lockfile": "pnpm-lock.yaml",
    // The scoping logic itself must never scope its own change.
    "the scope script": "scripts/e2e-scope.mjs",
    "an E2E spec": "e2e/posts-tabs.spec.ts",
    "the workflow": ".github/workflows/ci.yml",
    // Only root-level markdown is exempt; nested docs are not.
    "a nested markdown file": "docs/DESIGN.md",
    "a doc inside src": "src/README.md",
    // Prefix matching must respect the directory boundary.
    "a directory that merely starts with a safe name":
      ".claude-backup/notes.md",
    "a sibling of contents/": "contents-old/blog/foo.md",
  };

  for (const [label, file] of Object.entries(unsafe)) {
    await t.test(label, () => {
      assert.equal(isScopeSafe(file), false);
    });
  }
});
