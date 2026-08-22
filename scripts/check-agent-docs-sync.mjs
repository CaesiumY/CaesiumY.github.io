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
 * Import parsing skips code spans and fenced code blocks, matching Claude
 * Code's own behaviour — a backticked `@AGENTS.md` is literal text, not an
 * import, so it must not satisfy this check.
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
  console.error(`agent-docs-sync: ${msg}`);
  process.exit(1);
};

for (const p of [claudePath, agentsPath]) {
  if (!existsSync(p)) fail(`missing ${path.relative(repoRoot, p)}`);
}

const raw = readFileSync(claudePath, "utf8");

// Strip fenced blocks and inline code spans before looking for the import,
// so a documented `@AGENTS.md` example never counts as the real import.
const stripped = raw
  .replace(/^```[\s\S]*?^```/gm, "")
  .replace(/^~~~[\s\S]*?^~~~/gm, "")
  .replace(/`[^`\n]*`/g, "");

// The import must stand alone on its line; trailing text would make Claude
// Code treat the rest of the line as prose, not as part of the path.
const hasImport = stripped
  .split(/\r?\n/)
  .some((line) => line.trim() === "@AGENTS.md");

if (!hasImport) {
  fail(
    "CLAUDE.md no longer imports AGENTS.md.\n" +
      "  Add a line containing exactly `@AGENTS.md` (outside code blocks).\n" +
      "  Without it, Claude Code sessions load none of the shared guidance."
  );
}

const agentsLines = readFileSync(agentsPath, "utf8").split(/\r?\n/).length;
console.log(
  `agent-docs-sync: CLAUDE.md imports AGENTS.md (${agentsLines} lines, single source).`
);
