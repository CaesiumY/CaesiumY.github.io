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

// Backtick runs must match in length, same as CommonMark code spans.
const CODE_SPAN = /(`+)[^`]*?\1/g;

/**
 * Decide whether `markdown` carries a live `@AGENTS.md` import.
 *
 * Exported for the regression suite. The ordering below is load-bearing and
 * each step exists because its absence produced a real bug:
 *
 *  - Code spans are masked FIRST. CommonMark binds them tighter than raw HTML,
 *    so a documented `` `<!--` `` is literal text. Stripping comments first made
 *    that example open a phantom comment that swallowed the rest of the file,
 *    hiding a perfectly good import.
 *  - HTML comments are removed next. Claude Code strips block-level comments
 *    before injecting a memory file, so `@AGENTS.md` inside `<!-- ... -->` is
 *    not an import — a maintainer note describing the import used to satisfy
 *    this check on its own and keep CI green after the real import was deleted.
 *    Removing them before the fence walk also stops a fence marker written
 *    inside a comment from opening a phantom code block.
 *  - Fences are tracked line by line rather than matched as whole blocks. A
 *    block regex needs a closing fence, so an unclosed fence left its body
 *    searchable and a stray example inside it satisfied the check.
 *
 * An unterminated comment swallows the rest of the file. That fails safe: the
 * guard reports a missing import instead of trusting text of unclear status.
 */
export function hasAgentsImport(markdown) {
  let inComment = false;
  let openFence = null;

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

    // Now that the line is known not to be a fence, mask code spans so that
    // backticked examples of comment syntax stay literal.
    line = line.replace(CODE_SPAN, (match) => " ".repeat(match.length));

    // Resolve any comments that open on this line, keeping the text around
    // them; a comment left open flips the flag and drops the remainder.
    for (;;) {
      const start = line.indexOf("<!--");
      if (start === -1) break;
      const end = line.indexOf("-->", start + 4);
      if (end === -1) {
        line = line.slice(0, start);
        inComment = true;
        break;
      }
      line = line.slice(0, start) + " " + line.slice(end + 3);
    }

    if (IMPORT.test(line)) return true;
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
