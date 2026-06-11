#!/usr/bin/env node

/**
 * CLAUDE.md ↔ AGENTS.md mirror sync check.
 *
 * The two files are manual mirrors. Only these differences are allowed:
 *   1. Title line:  "# CLAUDE.md" vs "# AGENTS.md"
 *   2. Intro line:  the "Guide for ..." sentence (tool name differs)
 *   3. The Skills section: heading suffix and body are tool-specific by
 *      design (skill lists and .claude/ vs .agents/ paths differ)
 * Everything else must match line for line.
 *
 * If you intentionally reword the title/intro/Skills heading, update the
 * pinned constants below — the check pins exact strings on purpose so that
 * accidental edits to one file cannot pass as "allowed" differences.
 *
 * Usage: node scripts/check-agent-docs-sync.mjs [claude-md agents-md]
 * Exit codes: 0 = in sync, 1 = drift or structural mismatch.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Resolve against the repo root (script location), not cwd — the check must
// behave identically no matter where it is invoked from.
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const claudePath = process.argv[2] ?? path.join(repoRoot, "CLAUDE.md");
const agentsPath = process.argv[3] ?? path.join(repoRoot, "AGENTS.md");

const TITLE_PAIR = ["# CLAUDE.md", "# AGENTS.md"];
const INTRO_PAIR = [
  "Guide for Claude Code (claude.ai/code) when working with code in this repository.",
  "Guide for Codex (OpenAI Codex) when working with code in this repository.",
];
const SKILLS_HEADING_PAIR = [
  "## Skills (Claude Code 스킬 시스템)",
  "## Skills (Codex 스킬 시스템)",
];

const problems = [];

function readSections(filePath) {
  // CRLF-safe split; drop the final newline so the last element is a real line.
  const lines = readFileSync(filePath, "utf8")
    .replace(/\r?\n$/, "")
    .split(/\r?\n/);
  const sections = [{ heading: "(preamble)", lines: [] }];
  for (const line of lines) {
    if (line.startsWith("## ")) {
      sections.push({ heading: line, lines: [] });
    } else {
      sections.at(-1).lines.push(line);
    }
  }
  return sections;
}

function compareLines(label, expected, actual) {
  // Positional comparison (no LCS): one inserted line marks the rest of the
  // section as differing. The cap below keeps such reports readable.
  const max = Math.max(expected.length, actual.length);
  const mismatches = [];
  for (let i = 0; i < max; i++) {
    if (expected[i] !== actual[i]) mismatches.push(i);
  }
  for (const i of mismatches.slice(0, 3)) {
    problems.push(
      `${label} — line ${i + 1} of the section differs:\n` +
        `  CLAUDE.md (expected mirror): ${expected[i] ?? "<missing>"}\n` +
        `  AGENTS.md (actual)         : ${actual[i] ?? "<missing>"}`
    );
  }
  if (mismatches.length > 3) {
    problems.push(
      `${label} — ${mismatches.length - 3} more differing line(s) in this section (showing first 3).`
    );
  }
}

let claude, agents;
try {
  claude = readSections(claudePath);
  agents = readSections(agentsPath);
} catch (err) {
  process.stderr.write(`agent-docs-sync: cannot read input: ${err.message}\n`);
  process.exit(1);
}

// 1) Preamble: title and intro lines map pairwise, the rest must be identical.
const expectedPreamble = claude[0].lines.map(line => {
  if (line === TITLE_PAIR[0]) return TITLE_PAIR[1];
  if (line === INTRO_PAIR[0]) return INTRO_PAIR[1];
  return line;
});
compareLines("(preamble)", expectedPreamble, agents[0].lines);
if (!claude[0].lines.includes(TITLE_PAIR[0])) {
  problems.push(
    `CLAUDE.md title line "${TITLE_PAIR[0]}" not found — update TITLE_PAIR if it was renamed intentionally.`
  );
}
if (!claude[0].lines.includes(INTRO_PAIR[0])) {
  problems.push(
    `CLAUDE.md intro line not found — update INTRO_PAIR if it was reworded intentionally.`
  );
}

// 2) Sections: same count and order; Skills heading maps pairwise and its
//    body is exempt; every other section must be identical.
if (claude.length !== agents.length) {
  problems.push(
    `Section count differs: CLAUDE.md has ${claude.length - 1} "## " sections, AGENTS.md has ${agents.length - 1}.`
  );
} else {
  for (let i = 1; i < claude.length; i++) {
    const c = claude[i];
    const a = agents[i];
    if (c.heading === SKILLS_HEADING_PAIR[0]) {
      if (a.heading !== SKILLS_HEADING_PAIR[1]) {
        problems.push(
          `Skills heading mismatch: expected "${SKILLS_HEADING_PAIR[1]}", found "${a.heading}".`
        );
      }
      // Skills body is tool-specific by design: the skill list, the intro
      // sentence, and .claude/ vs .agents/ paths may all differ here. Keep
      // the exemption confined to this one section — do not widen it.
      continue;
    }
    if (c.heading !== a.heading) {
      problems.push(
        `Section order/heading mismatch at position ${i}: "${c.heading}" vs "${a.heading}".`
      );
      continue;
    }
    compareLines(c.heading, c.lines, a.lines);
  }
}

if (problems.length > 0) {
  process.stderr.write(
    `agent-docs-sync: CLAUDE.md and AGENTS.md have drifted (${problems.length} problem(s)).\n` +
      `Allowed differences are only the title line, the intro line, and the Skills section.\n\n` +
      problems.map(p => `* ${p}`).join("\n\n") +
      `\n\nFix: mirror the edit to both files (see the "manual mirrors" note in CLAUDE.md).\n`
  );
  process.exit(1);
}

process.stdout.write("agent-docs-sync: CLAUDE.md and AGENTS.md are in sync.\n");
