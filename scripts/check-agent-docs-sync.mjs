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
 * Usage: node scripts/check-agent-docs-sync.mjs [claude-md agents-md]
 * Exit codes: 0 = wired correctly, 1 = import missing or file absent.
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const [claudeArg, agentsArg] = process.argv.slice(2);
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

// Claude Code strips block-level HTML comments before injecting a memory file
// into context, so a `@AGENTS.md` mentioned inside `<!-- ... -->` is NOT an
// import. Strip comments FIRST: a maintainer note explaining the import would
// otherwise satisfy this check on its own and keep CI green after the real
// import was deleted. Doing it before the fence walk also stops a fence marker
// written inside a comment from opening a phantom code block.
// An unterminated `<!--` swallows the rest of the file, which fails safe: the
// guard reports a missing import rather than trusting text of unclear status.
const source = readFileSync(claudePath, "utf8")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<!--[\s\S]*$/, " ");

const lines = source.split(/\r?\n/);

// Walk the file tracking fenced-code state instead of regex-matching whole
// blocks. A block regex needs a CLOSING fence to match, so an unclosed fence
// would leave its body searchable and a stray `@AGENTS.md` example inside it
// would satisfy this check even after the real import was deleted. CommonMark
// also lets a fence be indented up to three spaces, which a `^`-anchored regex
// misses. Either case makes the guard pass exactly when it must fail.
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const prose = [];
let openFence = null;

for (const line of lines) {
  const match = FENCE.exec(line);
  if (openFence) {
    // A closer repeats the opener's character at least as many times.
    if (
      match &&
      match[1][0] === openFence[0] &&
      match[1].length >= openFence.length
    ) {
      openFence = null;
    }
    continue; // fenced body and both fence lines are never import sites
  }
  if (match) {
    openFence = match[1];
    continue;
  }
  // Inline code spans are excluded too, so a documented `@AGENTS.md` example
  // stays literal. Backtick runs must match in length, same as CommonMark.
  prose.push(line.replace(/(`+)[^`]*?\1/g, " "));
}

// Claude Code resolves `@path` imports anywhere in the prose, including inside
// a sentence or a list item, so match the token by its boundaries rather than
// demanding that it own the whole line.
const IMPORT = /(?:^|\s)@AGENTS\.md(?=\s|$)/;

if (!prose.some((line) => IMPORT.test(line))) {
  fail(
    "CLAUDE.md no longer imports AGENTS.md.\n" +
      "  Add `@AGENTS.md` on its own line, or inline in a sentence.\n" +
      "  It must sit outside code fences and backticks to count as an import.\n" +
      "  Without it, Claude Code sessions load none of the shared guidance."
  );
}

const agentsLines = readFileSync(agentsPath, "utf8").split(/\r?\n/).length;
process.stdout.write(
  `agent-docs-sync: CLAUDE.md imports AGENTS.md (${agentsLines} lines, single source).\n`
);
