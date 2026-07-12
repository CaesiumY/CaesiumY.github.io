#!/usr/bin/env node

/**
 * .claude/ skill & agent asset lint.
 *
 * Guards the invariants of the skill/agent system so they cannot silently
 * regress (standardized in the claude-skills-standardization refactor):
 *   1. Skill frontmatter: every .claude/skills/<dir>/SKILL.md must have
 *      `name`, `description`, `allowed-tools`, and `name` must equal <dir>.
 *   2. Agent frontmatter: every .claude/agents/*.md must have `name`,
 *      `description`, `model`, and `name` must equal the file basename.
 *   3. Model routing: agent `model` must be one of haiku|sonnet|opus.
 *      Pinning to alias names (never `fable`, `claude-*`, or dated IDs)
 *      keeps the definitions valid across model generations.
 *   4. Agent wiring: every `subagent_type` (Task) or `agentType` (Workflow)
 *      reference in a SKILL.md or skills/<x>/references/*.md must match a
 *      defined agent name — `general-purpose` is forbidden because it
 *      bypasses the dedicated agent's model/tools frontmatter.
 *   5. Path references: every `.claude/...` path mentioned in skill/agent
 *      bodies must exist on disk (placeholders like [slug] are ignored).
 *
 * Scope notes: .claude/agents/backup/ is frozen history and skills/<x>/data/
 * is runtime content — both are excluded from all checks.
 *
 * Usage: node scripts/check-claude-assets.mjs
 * Exit codes: 0 = clean, 1 = violations found.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const skillsDir = path.join(repoRoot, ".claude", "skills");
const agentsDir = path.join(repoRoot, ".claude", "agents");

const ALLOWED_MODELS = new Set(["haiku", "sonnet", "opus"]);

const problems = [];

function rel(p) {
  return path.relative(repoRoot, p).replaceAll("\\", "/");
}

// Minimal frontmatter parser: top-level `key: value` pairs between the
// leading `---` fence pair. Multi-line values keep only their first line,
// which is enough for key presence and scalar checks done here.
function parseFrontmatter(filePath) {
  const text = readFileSync(filePath, "utf8");
  const lines = text.replace(/\r?\n$/, "").split(/\r?\n/);
  if (lines[0] !== "---") return { keys: {}, body: text };
  const keys = {};
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
    const m = lines[i].match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m) {
      let value = m[2].trim();
      // Strip one pair of matching surrounding quotes (YAML scalar quoting).
      const q = value[0];
      if ((q === '"' || q === "'") && value.length >= 2 && value.endsWith(q)) {
        value = value.slice(1, -1);
      }
      keys[m[1]] = value;
    }
  }
  return { keys, body: lines.slice(end + 1).join("\n") };
}

// 1) + wiring/path source: collect skills.
let skillDirs = [];
try {
  skillDirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
} catch (err) {
  process.stderr.write(`claude-assets: cannot read ${rel(skillsDir)}: ${err.message}\n`);
  process.exit(1);
}

const skillFiles = [];
for (const dir of skillDirs) {
  const skillPath = path.join(skillsDir, dir, "SKILL.md");
  if (!existsSync(skillPath)) {
    problems.push(`${rel(path.join(skillsDir, dir))} — SKILL.md is missing.`);
    continue;
  }
  skillFiles.push(skillPath);
  const { keys } = parseFrontmatter(skillPath);
  for (const required of ["name", "description", "allowed-tools"]) {
    if (!(required in keys)) {
      problems.push(`${rel(skillPath)} — frontmatter is missing \`${required}\`.`);
    }
  }
  if (keys.name && keys.name !== dir) {
    problems.push(
      `${rel(skillPath)} — frontmatter name "${keys.name}" does not match its directory "${dir}".`
    );
  }
}

// 2) + 3) Agents: frontmatter completeness and model whitelist.
const agentNames = new Set();
let agentFiles = [];
try {
  agentFiles = readdirSync(agentsDir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith(".md"))
    .map(e => path.join(agentsDir, e.name));
} catch (err) {
  process.stderr.write(`claude-assets: cannot read ${rel(agentsDir)}: ${err.message}\n`);
  process.exit(1);
}

for (const agentPath of agentFiles) {
  const base = path.basename(agentPath, ".md");
  const { keys } = parseFrontmatter(agentPath);
  for (const required of ["name", "description", "model"]) {
    if (!(required in keys)) {
      problems.push(`${rel(agentPath)} — frontmatter is missing \`${required}\`.`);
    }
  }
  if (keys.name) {
    agentNames.add(keys.name);
    if (keys.name !== base) {
      problems.push(
        `${rel(agentPath)} — frontmatter name "${keys.name}" does not match its filename "${base}".`
      );
    }
  }
  if (keys.model && !ALLOWED_MODELS.has(keys.model)) {
    problems.push(
      `${rel(agentPath)} — model "${keys.model}" is not an allowed alias (haiku|sonnet|opus). ` +
        `Never pin concrete model IDs (fable, claude-*) — aliases survive model-generation changes.`
    );
  }
}

// Reference files are the canonical sources other files point to — a broken
// agent reference or path link inside one would otherwise silently pass.
// Scanned by checks 4 and 5 alike.
const referenceFiles = skillDirs.flatMap(dir => {
  const refDir = path.join(skillsDir, dir, "references");
  if (!existsSync(refDir)) return [];
  return readdirSync(refDir, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith(".md"))
    .map(e => path.join(refDir, e.name));
});

// 4) Agent wiring: every `subagent_type` (Task) or `agentType` (Workflow
//    script) reference must name a defined agent. Matches
//    `subagent_type: "x"`, `Task(subagent_type="x")`, `agentType: 'x'`,
//    and unquoted forms, across SKILL.md and references/*.md files.
const SUBAGENT_RE =
  /(?:subagent_type|agentType)["']?\s*[:=]\s*["'`]?([A-Za-z0-9_-]+)["'`]?/g;
for (const srcPath of [...skillFiles, ...referenceFiles]) {
  const body = readFileSync(srcPath, "utf8");
  for (const match of body.matchAll(SUBAGENT_RE)) {
    const name = match[1];
    if (name === "general-purpose") {
      problems.push(
        `${rel(srcPath)} — agent reference "general-purpose" is forbidden: it bypasses the ` +
          `dedicated agent's model/tools frontmatter. Name the agent directly.`
      );
    } else if (!agentNames.has(name)) {
      problems.push(
        `${rel(srcPath)} — agent reference "${name}" has no matching agent in .claude/agents/.`
      );
    }
  }
}

// 5) Path references: `.claude/...` mentions must exist. The char class stops
//    at placeholders ([slug], <파일명>, {x}), so templated tails degrade to
//    their existing parent directory. Trailing punctuation is stripped.
const PATH_RE = /\.claude\/[A-Za-z0-9_./-]+/g;
const pathSources = [...skillFiles, ...agentFiles, ...referenceFiles];
for (const src of pathSources) {
  const body = readFileSync(src, "utf8");
  const seen = new Set();
  for (const match of body.matchAll(PATH_RE)) {
    let ref = match[0].replace(/[.,]+$/, ""); // strip sentence punctuation
    if (seen.has(ref)) continue;
    seen.add(ref);
    // Date/time template placeholders pass the char class — not real paths.
    if (/YYYY|MMDD|HHMMSS/.test(ref)) continue;
    const target = path.join(repoRoot, ...ref.split("/"));
    if (!existsSync(target)) {
      problems.push(`${rel(src)} — referenced path does not exist: ${ref}`);
    } else if (ref.endsWith("/") && !statSync(target).isDirectory()) {
      problems.push(`${rel(src)} — referenced path is not a directory: ${ref}`);
    }
  }
}

if (problems.length > 0) {
  process.stderr.write(
    `claude-assets: ${problems.length} violation(s) found.\n\n` +
      problems.map(p => `* ${p}`).join("\n") +
      `\n`
  );
  process.exit(1);
}

process.stdout.write(
  `claude-assets: OK — ${skillFiles.length} skills, ${agentFiles.length} agents checked.\n`
);
