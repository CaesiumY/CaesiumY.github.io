#!/usr/bin/env node

/**
 * Skill data mirror check.
 *
 * Claude Code reads `.claude/skills/<skill>/data/` and Codex reads
 * `.agents/skills/<skill>/data/`. The two trees are copies of each other (style
 * guides, glossaries, approved posts, samples symlinks, feedback logs), and the
 * learning steps of each pipeline write to one side only. Nothing compared them,
 * so the Codex copy went six months without an update while CI stayed green
 * (issue #153).
 *
 * A skill is mirrored when its SKILL.md exists on both sides; Claude-only skills
 * (e.g. agents-md-optimizer) live in .claude/skills/ alone by design and are
 * skipped. For every mirrored skill this guard fails when only one side has a
 * `data/` directory, when nothing is compared at all, or on any content
 * difference except two, which are an explicit allow-list:
 *
 *  - path self-references: `.claude/...` vs `.agents/...`
 *  - the date on the two "마지막 업데이트" header forms the style analyzers write
 *
 * Anything broader (masking every date, fuzzy matching) would hide real drift,
 * so widen the allow-list only with a matching case in the test file.
 * `style-history/` holds backup snapshots and is out of scope.
 *
 * It reads the git INDEX, not the working tree. `samples/` entries must be git
 * symlinks (mode 120000), which only the index can tell reliably — a Windows
 * checkout without symlink support turns them into plain files on disk. The
 * catch: unstaged edits are invisible, so run it after `git add`. CI checks the
 * committed tree, where this makes no difference.
 *
 * Regression suite: scripts/check-skill-data-mirror.test.mjs (`pnpm test:scripts`).
 *
 * Usage: node scripts/check-skill-data-mirror.mjs [repo-root]
 * Exit codes: 0 = mirrors match, 1 = drift (each offending path is printed).
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SYMLINK = "120000";
const ROOTS = { claude: ".claude/skills", agents: ".agents/skills" };
const OUT_OF_SCOPE = /^style-history\//;

// `.claude/` or `.agents/` as a path segment of its own, so `foo.claude/` is
// left alone. A lookbehind, not a captured prefix: consuming the preceding
// character skipped the second segment of `.claude/.agents/`.
const SELF_REFERENCE = /(?<![\w.])\.(?:claude|agents)\//g;

// The only two date stamps the style analyzers write into a mirrored file.
const DATE_STAMPS = [
  /^(> 마지막 업데이트: )\d{4}-\d{2}-\d{2}/gm,
  /^(✅ \*\*마지막 업데이트\*\*: )\d{4}-\d{2}-\d{2}/gm,
];

/**
 * Apply the allow-list. Every replacement stays on its own line, so line numbers
 * in the normalized text match the original.
 */
export function normalize(content) {
  let out = content.replace(SELF_REFERENCE, "<AGENT_ROOT>/");
  for (const stamp of DATE_STAMPS) out = out.replace(stamp, "$1<DATE>");
  return out;
}

function firstDifferentLine(a, b) {
  const left = a.split("\n");
  const right = b.split("\n");
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    if (left[i] !== right[i]) return i + 1;
  }
  return length;
}

/**
 * Compare two data trees.
 *
 * Both arguments are `Map<relativePath, {mode, content}>` where `content` is the
 * file text, or the link target for a symlink. Returns `[{path, reason}]`,
 * sorted by path; an empty array means the mirror is in sync.
 */
export function diffMirror(claude, agents) {
  const problems = [];
  const all = new Set([...claude.keys(), ...agents.keys()]);

  for (const rel of [...all].sort()) {
    if (OUT_OF_SCOPE.test(rel)) continue;

    const left = claude.get(rel);
    const right = agents.get(rel);
    if (!right) {
      problems.push({ path: rel, reason: "only in .claude" });
      continue;
    }
    if (!left) {
      problems.push({ path: rel, reason: "only in .agents" });
      continue;
    }

    if (rel.startsWith("samples/")) {
      const plain = [
        left.mode !== SYMLINK && ".claude",
        right.mode !== SYMLINK && ".agents",
      ].filter(Boolean);
      if (plain.length > 0) {
        problems.push({
          path: rel,
          reason: `not a symlink in git on ${plain.join(" and ")} (mode must be ${SYMLINK})`,
        });
        continue;
      }
    }

    if (left.mode !== right.mode) {
      problems.push({
        path: rel,
        reason: `mode differs (${left.mode} vs ${right.mode})`,
      });
      continue;
    }

    if (left.mode === SYMLINK) {
      if (left.content !== right.content) {
        problems.push({
          path: rel,
          reason: `link target differs (${left.content} vs ${right.content})`,
        });
      }
      continue;
    }

    const claudeText = normalize(left.content);
    const agentsText = normalize(right.content);
    if (claudeText !== agentsText) {
      problems.push({
        path: rel,
        reason: `content differs from line ${firstDifferentLine(claudeText, agentsText)}`,
      });
    }
  }

  return problems;
}

/**
 * Decide which skills to compare. Each argument describes one side:
 * `{skills, data}`, the names with a SKILL.md and the names with a `data/`
 * directory.
 *
 * Only skills present on BOTH sides are mirrored; a Claude-only skill is out of
 * scope even when it has data. For a mirrored skill, `data/` on one side only is
 * drift, not something to skip: pairing only the skills whose data exists on
 * both sides let a deleted or renamed `data/` fall out of the check while CI
 * stayed green. Comparing nothing at all fails for the same reason — a guard
 * that cannot find its target must not report success.
 */
export function pairSkills(claude, agents) {
  const problems = [];
  const pairs = [];
  const mirrored = [...claude.skills].filter((s) => agents.skills.has(s)).sort();

  for (const skill of mirrored) {
    const inClaude = claude.data.has(skill);
    const inAgents = agents.data.has(skill);
    if (inClaude && inAgents) pairs.push(skill);
    else if (inClaude) problems.push({ path: `${skill}/data`, reason: "only in .claude" });
    else if (inAgents) problems.push({ path: `${skill}/data`, reason: "only in .agents" });
  }

  if (pairs.length === 0) {
    problems.push({
      path: `${ROOTS.claude}, ${ROOTS.agents}`,
      reason: "no skill data found to compare",
    });
  }

  return { pairs, problems };
}

/**
 * Parse `git ls-files -s -z -- <prefix>` into `[{mode, sha, rel}]`, where `rel`
 * is relative to `prefix`.
 *
 * Each record is `<mode> <sha> <stage>\t<path>`. Split on the FIRST tab only,
 * since a path may itself contain one. A non-zero stage means an unresolved
 * merge, where one path has several entries; refuse it rather than let one
 * stage silently overwrite another.
 */
export function parseIndexListing(listing, prefix) {
  return listing
    .split("\0")
    .filter(Boolean)
    .map((record) => {
      const tab = record.indexOf("\t");
      if (tab === -1) throw new Error(`unexpected ls-files record: ${record}`);
      const [mode, sha, stage] = record.slice(0, tab).split(" ");
      const file = record.slice(tab + 1);
      if (stage !== "0") {
        throw new Error(`${file} is unmerged (stage ${stage}); resolve the merge first`);
      }
      return { mode, sha, rel: file.slice(prefix.length + 1) };
    });
}

function git(repoRoot, args, options = {}) {
  // stderr is captured, not inherited: on failure it is already part of
  // error.message, which main reports once.
  return execFileSync("git", args, {
    cwd: repoRoot,
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 256 * 1024 * 1024,
    ...options,
  });
}

/**
 * Read every indexed file under `prefix` as `Map<relativePath, {mode, content}>`.
 */
function loadEntries(repoRoot, prefix) {
  const indexed = parseIndexListing(
    git(repoRoot, ["ls-files", "-s", "-z", "--", prefix], { encoding: "utf8" }),
    prefix
  );

  const entries = new Map();
  if (indexed.length === 0) return entries;

  // One `cat-file --batch` for the whole tree. Each reply is
  // `<sha> <type> <size>\n<size bytes>\n`, so read by byte count: a blob may
  // contain newlines or end without one.
  const batch = git(repoRoot, ["cat-file", "--batch"], {
    input: indexed.map((e) => e.sha).join("\n") + "\n",
  });

  let offset = 0;
  for (const entry of indexed) {
    const headerEnd = batch.indexOf(0x0a, offset);
    const header = batch.toString("utf8", offset, headerEnd).split(" ");
    // `<sha> missing` has no size; without this check the offsets turn NaN.
    if (header[1] === "missing") {
      throw new Error(`${prefix}/${entry.rel}: blob ${entry.sha} is missing`);
    }
    const size = Number(header[2]);
    const start = headerEnd + 1;
    entries.set(entry.rel, {
      mode: entry.mode,
      content: batch.toString("utf8", start, start + size),
    });
    offset = start + size + 1;
  }

  return entries;
}

/** `{skills, data}` for one side: the names with a SKILL.md and with a `data/`. */
function readSide(repoRoot, root) {
  const skills = new Set();
  const data = new Set();
  const files = git(repoRoot, ["ls-files", "-z", "--", root], { encoding: "utf8" });

  for (const file of files.split("\0").filter(Boolean)) {
    const [skill, ...rest] = file.slice(root.length + 1).split("/");
    if (rest.length === 1 && rest[0] === "SKILL.md") skills.add(skill);
    if (rest.length > 1 && rest[0] === "data") data.add(skill);
  }

  return { skills, data };
}

function main(argv) {
  const repoRoot = argv[0]
    ? path.resolve(argv[0])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  if (!existsSync(repoRoot)) {
    process.stderr.write(`skill-data-mirror: repo root ${repoRoot} does not exist.\n`);
    process.exit(1);
  }

  const fail = (lines) => {
    process.stderr.write(
      `skill-data-mirror: ${ROOTS.claude}/ and ${ROOTS.agents}/ are not mirrored.\n` +
        lines.join("\n") +
        "\n" +
        "  Apply the same change to both sides. Only path self-references\n" +
        "  (.claude/ vs .agents/) and the '마지막 업데이트' date may differ.\n" +
        "  This reads the git index, so `git add` before re-running.\n"
    );
    process.exit(1);
  };

  let pairs;
  const failures = [];
  try {
    const paired = pairSkills(
      readSide(repoRoot, ROOTS.claude),
      readSide(repoRoot, ROOTS.agents)
    );
    pairs = paired.pairs;
    for (const { path: rel, reason } of paired.problems) {
      failures.push(`  ${rel}: ${reason}`);
    }

    for (const skill of pairs) {
      const problems = diffMirror(
        loadEntries(repoRoot, `${ROOTS.claude}/${skill}/data`),
        loadEntries(repoRoot, `${ROOTS.agents}/${skill}/data`)
      );
      for (const { path: rel, reason } of problems) {
        failures.push(`  ${skill}/data/${rel}: ${reason}`);
      }
    }
  } catch (error) {
    process.stderr.write(`skill-data-mirror: cannot read the git index.\n  ${error.message}\n`);
    process.exit(1);
  }

  if (failures.length > 0) fail(failures);

  process.stdout.write(
    `skill-data-mirror: ${pairs.join(", ")} data mirrored between .claude and .agents.\n`
  );
}

// Stay importable from the test file without running the check.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
