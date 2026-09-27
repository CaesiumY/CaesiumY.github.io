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
 * The CLI cases run against a throwaway `git init` repo, never the real one.
 * The dedicated CI step already checks the live tree, and running it here too
 * would turn one drift into two red steps with the same cause.
 */

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  diffMirror,
  normalize,
  pairSkills,
  parseIndexListing,
} from "./check-skill-data-mirror.mjs";

const scriptPath = fileURLToPath(
  new URL("./check-skill-data-mirror.mjs", import.meta.url)
);

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

test("back-to-back self-references are all normalized", () => {
  // The first version consumed the character before each match, so the second
  // segment of `.claude/.agents/` was never rewritten.
  assert.equal(normalize("x .claude/.agents/y"), normalize("x .agents/.claude/y"));
});

test("a skill with data/ on only one side fails", () => {
  // Pairing only the skills present on both sides let a deleted or renamed
  // data/ directory drop out of the check and stay green.
  const { pairs, problems } = pairSkills(
    new Set(["blog-writer", "translate-writer"]),
    new Set(["blog-writer"])
  );
  assert.deepEqual(pairs, ["blog-writer"]);
  assert.deepEqual(paths(problems), ["translate-writer/data"]);
  assert.match(problems[0].reason, /only in \.claude/);
});

test("comparing no skills at all fails", () => {
  const { problems } = pairSkills(new Set(), new Set());
  assert.equal(problems.length, 1);
  assert.match(problems[0].reason, /no skill data/);
});

test("index listing parsing", async (t) => {
  await t.test("a tab inside the path is kept", () => {
    const [entry] = parseIndexListing(
      "100644 abc 0\tdir/with\ttab.md\u0000",
      "dir"
    );
    assert.equal(entry.rel, "with\ttab.md");
  });

  await t.test("unmerged entries are refused, not overwritten", () => {
    assert.throws(
      () =>
        parseIndexListing(
          "100644 aaa 2\tdir/a.md\u0000100644 bbb 3\tdir/a.md\u0000",
          "dir"
        ),
      /unmerged/
    );
  });
});

// ---- CLI contract, against a throwaway repo ----

function fixtureRepo(t) {
  const root = mkdtempSync(path.join(tmpdir(), "skill-data-mirror-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "-q"], { cwd: root });

  const git = (...args) => execFileSync("git", args, { cwd: root });
  return {
    root,
    file(rel, content) {
      mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      writeFileSync(path.join(root, rel), content);
      git("add", "-f", rel);
    },
    // Registered straight in the index so the fixture needs no OS symlink
    // support (the same trick the skills document for Windows).
    link(rel, target) {
      const sha = execFileSync("git", ["hash-object", "-w", "--stdin"], {
        cwd: root,
        input: target,
        encoding: "utf8",
      }).trim();
      git("update-index", "--add", "--cacheinfo", `120000,${sha},${rel}`);
    },
  };
}

const run = (root) =>
  spawnSync(process.execPath, [scriptPath, root], { encoding: "utf8" });

function seedMirror(repo) {
  for (const side of [".claude", ".agents"]) {
    repo.file(`${side}/skills/demo/data/style-guide.md`, "# Guide\n");
    repo.file(`${side}/skills/demo/data/approved-posts/01.md`, "post\n");
    repo.link(`${side}/skills/demo/data/samples/01.md`, "../approved-posts/01.md");
  }
}

test("CLI exits 0 on a mirrored tree", (t) => {
  const repo = fixtureRepo(t);
  seedMirror(repo);
  const result = run(repo.root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /demo/);
});

test("CLI exits 1 and names each drifted path", (t) => {
  const repo = fixtureRepo(t);
  seedMirror(repo);
  repo.file(".claude/skills/demo/data/approved-posts/02.md", "new\n");
  repo.file(".agents/skills/demo/data/style-guide.md", "# Guide\nextra\n");

  const result = run(repo.root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /demo\/data\/approved-posts\/02\.md: only in \.claude/);
  assert.match(result.stderr, /demo\/data\/style-guide\.md: content differs/);
});

test("CLI exits 1 when one side lost its whole data/ directory", (t) => {
  const repo = fixtureRepo(t);
  repo.file(".claude/skills/demo/data/style-guide.md", "# Guide\n");
  repo.file(".agents/skills/demo/SKILL.md", "---\nname: demo\n---\n");

  const result = run(repo.root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /demo\/data: only in \.claude/);
});

test("CLI exits 1 when there is nothing to compare", (t) => {
  const repo = fixtureRepo(t);
  repo.file("README.md", "empty\n");

  const result = run(repo.root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no skill data/);
});
