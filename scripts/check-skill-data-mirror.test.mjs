/**
 * Regression suite for the .claude <-> .agents skill data mirror guard.
 *
 * Run with `pnpm test:scripts` (node:test, no extra dependencies).
 *
 * The mirror drifted for six months with CI green (issue #153), so every case
 * below pins either a drift the guard must catch or a known, allowed difference
 * it must let through. The allow-list is deliberately narrow: if a case here
 * starts passing when it should fail, the normalization grew too broad.
 *
 * There is intentionally no smoke test against the real repo. The dedicated CI
 * step already checks the live tree, and running it here too would turn one
 * drift into two red steps with the same cause.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { diffMirror, normalize } from "./check-skill-data-mirror.mjs";

const FILE = "100644";
const LINK = "120000";

const tree = (entries) =>
  new Map(
    Object.entries(entries).map(([p, v]) =>
      typeof v === "string" ? [p, { mode: FILE, content: v }] : [p, v]
    )
  );

const link = (target) => ({ mode: LINK, content: target });

const paths = (problems) => problems.map((p) => p.path);

test("identical trees have no problems", () => {
  const entries = {
    "style-guide.md": "# Guide\n\nbody\n",
    "approved-posts/01.md": "post\n",
    "samples/01.md": link("../approved-posts/01.md"),
  };
  assert.deepEqual(diffMirror(tree(entries), tree(entries)), []);
});

test("a file on only one side fails and names the path", async (t) => {
  await t.test("only in .claude", () => {
    const problems = diffMirror(
      tree({ "a.md": "x", "approved-posts/new.md": "y" }),
      tree({ "a.md": "x" })
    );
    assert.deepEqual(paths(problems), ["approved-posts/new.md"]);
    assert.match(problems[0].reason, /only in \.claude/);
  });

  await t.test("only in .agents", () => {
    const problems = diffMirror(
      tree({ "a.md": "x" }),
      tree({ "a.md": "x", "feedback-log.md": "y" })
    );
    assert.deepEqual(paths(problems), ["feedback-log.md"]);
    assert.match(problems[0].reason, /only in \.agents/);
  });
});

test("a single changed line fails and reports where", () => {
  const problems = diffMirror(
    tree({ "glossary.md": "a\nb\nc\n" }),
    tree({ "glossary.md": "a\nB\nc\n" })
  );
  assert.deepEqual(paths(problems), ["glossary.md"]);
  assert.match(problems[0].reason, /line 2/);
});

test("path self-references are an allowed difference", () => {
  const problems = diffMirror(
    tree({
      "feedback-log.md":
        "저장 경로: `.claude/skills/translate-writer/data/approved-posts/x.md`\n",
    }),
    tree({
      "feedback-log.md":
        "저장 경로: `.agents/skills/translate-writer/data/approved-posts/x.md`\n",
    })
  );
  assert.deepEqual(problems, []);
});

test("a look-alike path segment is not a self-reference", () => {
  // `foo.claude/` is not the repo's .claude directory; masking it would hide a
  // real content change.
  const problems = diffMirror(
    tree({ "a.md": "see foo.claude/x\n" }),
    tree({ "a.md": "see foo.agents/x\n" })
  );
  assert.deepEqual(paths(problems), ["a.md"]);
});

test("the two known date-stamp headers are an allowed difference", async (t) => {
  await t.test("blockquote header", () => {
    const problems = diffMirror(
      tree({ "style-guide.md": "# G\n> 마지막 업데이트: 2026-09-23\n" }),
      tree({ "style-guide.md": "# G\n> 마지막 업데이트: 2026-02-20\n" })
    );
    assert.deepEqual(problems, []);
  });

  await t.test("footer with KST suffix", () => {
    const problems = diffMirror(
      tree({ "style-guide.md": "✅ **마지막 업데이트**: 2026-09-23 KST\n" }),
      tree({ "style-guide.md": "✅ **마지막 업데이트**: 2026-02-20 KST\n" })
    );
    assert.deepEqual(problems, []);
  });
});

test("a date anywhere else is real content and fails", () => {
  const problems = diffMirror(
    tree({ "feedback-log.md": "## 2026-09-21 피드백\n업데이트 날짜 2026-09-21\n" }),
    tree({ "feedback-log.md": "## 2026-09-21 피드백\n업데이트 날짜 2026-08-22\n" })
  );
  assert.deepEqual(paths(problems), ["feedback-log.md"]);
});

test("samples must be symlinks in git", async (t) => {
  await t.test("a regular file under samples/ fails", () => {
    const problems = diffMirror(
      tree({ "samples/01.md": link("../approved-posts/01.md") }),
      tree({ "samples/01.md": "../approved-posts/01.md" })
    );
    assert.deepEqual(paths(problems), ["samples/01.md"]);
    assert.match(problems[0].reason, /not a symlink/);
  });

  await t.test("a different link target fails", () => {
    const problems = diffMirror(
      tree({ "samples/01.md": link("../approved-posts/01.md") }),
      tree({ "samples/01.md": link("../approved-posts/02.md") })
    );
    assert.deepEqual(paths(problems), ["samples/01.md"]);
  });
});

test("style-history/ is out of scope", () => {
  const problems = diffMirror(
    tree({ "style-history/glossary-20260614.md": "old", "a.md": "x" }),
    tree({ "a.md": "x" })
  );
  assert.deepEqual(problems, []);
});

test("normalize never changes the line count", () => {
  const source =
    "> 마지막 업데이트: 2026-09-23\n`.claude/skills/x`\n✅ **마지막 업데이트**: 2026-09-23 KST\n";
  assert.equal(
    normalize(source).split("\n").length,
    source.split("\n").length
  );
});
