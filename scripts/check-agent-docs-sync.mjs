#!/usr/bin/env node

/**
 * Guideline single-source check.
 *
 * AGENTS.md is the single source of truth for this repo's agent guidance.
 * CLAUDE.md is a thin wrapper that pulls it in with Claude Code's `@AGENTS.md`
 * import syntax, then adds Claude-only content below it.
 *
 * Why an import and not a symlink: Claude Code reads CLAUDE.md, not AGENTS.md,
 * and creating a symlink on Windows needs Administrator rights or Developer
 * Mode, so the official docs recommend the import for cross-platform repos.
 *
 * This check guards the one thing that silently breaks the setup: someone
 * editing CLAUDE.md and dropping the import line, which would strip every
 * shared rule from Claude Code sessions with no visible error.
 *
 * Regression suite: scripts/check-agent-docs-sync.test.mjs (`pnpm test:scripts`).
 * This guard has been silently defeated more than once, so every fix here ships
 * with a case in that file.
 *
 * Usage: node scripts/check-agent-docs-sync.mjs [claude-md agents-md]
 * Exit codes: 0 = wired correctly, 1 = import missing or file absent.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// A fence opener may be indented up to three spaces (CommonMark); its closer
// repeats the same character at least as many times.
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

// Claude Code resolves `@path` imports anywhere in the prose, including inside
// a sentence or a list item, so match the token by its boundaries rather than
// demanding that it own the whole line. The lookahead keeps `@AGENTS.md.bak`
// and similar neighbours from counting.
const IMPORT = /(?:^|\s)@AGENTS\.md(?=\s|$)/;


/**
 * Decide whether `markdown` carries a live `@AGENTS.md` import.
 *
 * Exported for the regression suite. Every rule below exists because its
 * absence produced a real bug in this file:
 *
 *  - Fences are tracked line by line, not matched as whole blocks. A block
 *    regex needs a closing fence, so an unclosed fence left its body
 *    searchable and a stray example inside it satisfied the check.
 *  - Fence openers are read before the line is rewritten. Masking code spans
 *    first ate the leading pair of a ``` fence and destroyed the marker.
 *  - Code spans and HTML comments are resolved in DOCUMENT ORDER, because
 *    CommonMark gives them the same precedence. Handling either one first
 *    unconditionally breaks the other: `` `<!--` `` must read as code, while
 *    `<!-- ```js -->` must read as a comment.
 *  - Both carry state across lines, like fences. A code span may close on a
 *    later line, and masking each line alone left a token inside such a span
 *    looking like a live import.
 *  - Skipped regions leave NOTHING behind. Substituting a space invented a
 *    word boundary and made a decorative comment look like an import.
 *
 * HTML comments are skipped at all because Claude Code strips block-level
 * comments before injecting a memory file, so a `@AGENTS.md` written inside
 * one is not an import — the note describing the import used to satisfy this
 * check by itself and keep CI green after the real import was deleted.
 *
 * An unterminated comment or code span swallows the rest of its region. That
 * fails safe: the guard reports a missing import instead of trusting text of
 * unclear status.
 */
export function hasAgentsImport(markdown) {
  let inComment = false;
  let openFence = null;
  let openSpan = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    let line = rawLine;

    if (inComment) {
      const end = line.indexOf("-->");
      if (end === -1) continue;
      line = line.slice(end + 3);
      inComment = false;
    }

    if (openFence) {
      const closer = FENCE.exec(line);
      if (
        closer &&
        closer[1][0] === openFence[0] &&
        closer[1].length >= openFence.length
      ) {
        openFence = null;
      }
      continue; // fenced body and both fence lines are never import sites
    }

    // Fence openers are read from the RAW line. Masking code spans first would
    // eat the leading pair of a ``` fence as an empty span and destroy the
    // marker, so this check has to come before any rewriting of the line.
    const opener = FENCE.exec(line);
    if (opener) {
      openFence = opener[1];
      continue;
    }

    // A blank line ends the paragraph, so a code span left hanging dies here.
    if (openSpan && line.trim() === "") openSpan = null;

    // Scan the line left to right, letting whichever delimiter appears FIRST
    // win. CommonMark gives code spans and raw HTML the same precedence and
    // resolves them in document order, so a fixed order here is wrong in one
    // direction or the other: `` `<!--` `` must read as code, while
    // `<!-- ```js -->` must read as a comment.
    // Skipped regions contribute NOTHING to `prose`. Substituting a space
    // would invent a word boundary — `prefix<!-- note -->@AGENTS.md` would
    // become `prefix @AGENTS.md` and satisfy IMPORT, even though the text
    // Claude Code sees is `prefix@AGENTS.md`, which is not an import.
    let prose = "";
    let rest = line;

    for (;;) {
      if (openSpan) {
        const closer = new RegExp("`{" + openSpan.length + "}(?!`)");
        const hit = closer.exec(rest);
        if (!hit) {
          rest = "";
          break;
        }
        rest = rest.slice(hit.index + hit[0].length);
        openSpan = null;
      }

      const tick = /`+/.exec(rest);
      const note = rest.indexOf("<!--");

      if (!tick && note === -1) break;
      const tickFirst = tick && (note === -1 || tick.index < note);

      if (tickFirst) {
        prose += rest.slice(0, tick.index);
        openSpan = tick[0];
        rest = rest.slice(tick.index + tick[0].length);
        continue;
      }

      prose += rest.slice(0, note);
      const end = rest.indexOf("-->", note + 4);
      if (end === -1) {
        inComment = true;
        rest = "";
        break;
      }
      rest = rest.slice(end + 3);
    }

    if (IMPORT.test(prose + rest)) return true;
  }

  return false;
}

function main(argv) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );

  const [claudeArg, agentsArg] = argv;
  const claudePath = claudeArg
    ? path.resolve(claudeArg)
    : path.join(repoRoot, "CLAUDE.md");
  const agentsPath = agentsArg
    ? path.resolve(agentsArg)
    : path.join(repoRoot, "AGENTS.md");

  const fail = (msg) => {
    process.stderr.write(`agent-docs-sync: ${msg}\n`);
    process.exit(1);
  };

  for (const p of [claudePath, agentsPath]) {
    if (!existsSync(p)) fail(`missing ${path.relative(repoRoot, p)}`);
  }

  if (!hasAgentsImport(readFileSync(claudePath, "utf8"))) {
    fail(
      "CLAUDE.md no longer imports AGENTS.md.\n" +
        "  Add `@AGENTS.md` on its own line, or inline in a sentence.\n" +
        "  It must sit outside code fences, backticks, and HTML comments.\n" +
        "  Without it, Claude Code sessions load none of the shared guidance."
    );
  }

  const agentsLines = readFileSync(agentsPath, "utf8").split(/\r?\n/).length;
  process.stdout.write(
    `agent-docs-sync: CLAUDE.md imports AGENTS.md (${agentsLines} lines, single source).\n`
  );
}

// Stay importable from the test file without running the check.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
