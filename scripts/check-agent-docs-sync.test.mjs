/**
 * Regression suite for the CLAUDE.md -> AGENTS.md import guard.
 *
 * Run with `pnpm test:scripts` (node:test, no extra dependencies).
 *
 * This guard exists to fail when CLAUDE.md stops importing AGENTS.md, because
 * that breakage is otherwise silent: sessions simply load none of the shared
 * guidance. It has been defeated three times by markdown constructs that looked
 * like an import but were not (or the reverse), so every case below maps to a
 * bug that actually shipped or was caught in review.
 *
 * When changing the detection logic, add the case here first.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { hasAgentsImport } from "./check-agent-docs-sync.mjs";

const md = (...lines) => lines.join("\n");

test("accepts the shapes Claude Code treats as an import", async (t) => {
  const accepted = {
    "on its own line": md("# X", "", "@AGENTS.md"),
    // The docs show imports embedded in prose and list items; requiring the
    // token to own the whole line blocked the merge gate on valid files.
    "inline in a sentence": md("# X", "", "See @AGENTS.md for guidance."),
    "in a list item": md("# X", "", "- guidance @AGENTS.md"),
    "after a maintainer note": md("# X", "", "<!-- note -->", "@AGENTS.md"),
    "after a comment containing a fence marker": md(
      "# X",
      "",
      "<!-- ```js -->",
      "@AGENTS.md"
    ),
    // Code spans bind tighter than raw HTML, so this is literal text and must
    // not open a comment that swallows the import below it.
    "after a backticked comment delimiter": md(
      "# X",
      "",
      "`<!--` opens a comment.",
      "",
      "@AGENTS.md"
    ),
    "after a backticked complete comment": md(
      "# X",
      "",
      "`<!-- example -->` explained",
      "",
      "@AGENTS.md"
    ),
    // A fenced example may show an opener with no closer; the fence walk must
    // skip it rather than let it swallow the import underneath.
    "after a fenced comment delimiter": md(
      "# X",
      "",
      "```md",
      "<!--",
      "```",
      "",
      "@AGENTS.md"
    ),
    "with a comment sitting beside it": md(
      "# X",
      "",
      "prefix <!-- note --> @AGENTS.md"
    ),
    // A blank line ends the paragraph, so the span above cannot reach down here.
    "after a code span left open above a blank line": md(
      "# X",
      "",
      "unclosed `span",
      "",
      "@AGENTS.md"
    ),
  };

  for (const [name, source] of Object.entries(accepted)) {
    await t.test(name, () => {
      assert.equal(hasAgentsImport(source), true);
    });
  }
});

test("rejects tokens that only look like an import", async (t) => {
  const rejected = {
    // A block regex needs a closing fence, so an unclosed one used to leave its
    // body searchable and pass the guard after the real import was deleted.
    "inside an unclosed fence": md("# X", "", "```md", "@AGENTS.md"),
    "inside an indented fence": md(
      "# X",
      "",
      "   ```md",
      "   @AGENTS.md",
      "   ```"
    ),
    "inside a tilde fence": md("# X", "", "~~~", "@AGENTS.md", "~~~"),
    "inside a nested fence": md("# X", "", "````", "```", "@AGENTS.md", "````"),
    "inside a code span": md("# X", "", "`@AGENTS.md`"),
    // The comment explaining the import used to satisfy the guard by itself.
    "inside a one-line comment": md("# X", "", "<!-- see @AGENTS.md -->"),
    "inside a multi-line comment": md(
      "# X",
      "",
      "<!-- multi",
      "@AGENTS.md",
      "line -->"
    ),
    "inside an unterminated comment": md("# X", "", "<!-- @AGENTS.md"),
    "as part of a longer path": md("# X", "", "@AGENTS.md.bak"),
    // Splicing a space in place of the comment would invent the word boundary
    // IMPORT needs; Claude Code sees `prefix@AGENTS.md`, which is not an import.
    "glued to a comment with no boundary": md(
      "# X",
      "",
      "prefix<!-- note -->@AGENTS.md"
    ),
    // A code span may close on a later line. Masking each line in isolation
    // left the token inside such a span looking like a live import.
    "inside a code span that wraps a line break": md(
      "line one `text",
      "@AGENTS.md text` end"
    ),
    "nowhere at all": md("# X", "", "no import here"),
  };

  for (const [name, source] of Object.entries(rejected)) {
    await t.test(name, () => {
      assert.equal(hasAgentsImport(source), false);
    });
  }
});

test("the repo's own CLAUDE.md wires the import", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const path = (await import("node:path")).default;

  const claudeMd = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "CLAUDE.md"
  );
  assert.equal(hasAgentsImport(readFileSync(claudeMd, "utf8")), true);
});
