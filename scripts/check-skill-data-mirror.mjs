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
 * This guard pairs every skill that has a `data/` directory on either side and
 * fails when one side is missing it, when nothing is compared at all, or on any
 * content difference except two, which are an explicit allow-list:
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
import { fileURLToPath } from "node:url";
import path from "node:path";

const SYMLINK = "120000";
const ROOTS = { claude: ".claude/skills", agents: ".agents/skills" };
const OUT_OF_SCOPE = /^style-history\//;

// `.claude/` or `.agents/` as a path segment of its own, so `foo.claude/` is
// left alone. A lookbehind, not a captured prefix: consuming the preceding
// character skipped the second segment of `.claude/.agents/`.
const SELF_REFERENCE = /(?<![\w.])\.(?:claude|agents)\//gm;

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
 * Decide which skills to compare. Both arguments are sets of skill names that
 * have a `data/` directory on that side.
 *
 * A skill on one side only is drift, not something to skip: pairing only the
 * common skills let a deleted or renamed `data/` fall out of the check while CI
 * stayed green. Comparing nothing at all fails for the same reason — a guard
 * that cannot find its target must not report success.
 */
export function pairSkills(claudeSkills, agentsSkills) {
  const problems = [];
  const all = [...new Set([...claudeSkills, ...agentsSkills])].sort();

  for (const skill of all) {
    if (!agentsSkills.has(skill)) {
      problems.push({ path: `${skill}/data`, reason: "only in .claude" });
    } else if (!claudeSkills.has(skill)) {
      problems.push({ path: `${skill}/data`, reason: "only in .agents" });
    }
  }

  const pairs = all.filter(
    (skill) => claudeSkills.has(skill) && agentsSkills.has(skill)
  );
  if (all.length === 0) {
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
      const [mode, sha, stage] = record.slice(0, tab).split(" ");
      const file = record.slice(tab + 1);
      if (stage !== "0") {
        throw new Error(`${file} is unmerged (stage ${stage}); resolve the merge first`);
      }
      return { mode, sha, rel: file.slice(prefix.length + 1) };
    });
}

function git(repoRoot, args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
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

/** Names of the skills with at least one indexed file under `<root>/<skill>/data/`. */
function skillsWithData(repoRoot, root) {
  return new Set(
    git(repoRoot, ["ls-files", "-z", "--", root], { encoding: "utf8" })
      .split("\0")
      .map((file) => file.slice(root.length + 1).split("/"))
      .filter((parts) => parts[1] === "data" && parts.length > 2)
      .map((parts) => parts[0])
  );
}

function main(argv) {
  const repoRoot = argv[0]
    ? path.resolve(argv[0])
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  const fail = (lines) => {
    process.stderr.write(
      `skill-data-mirror: ${ROOTS.claude}/ and ${ROOTS.agents}/ have drifted.\n` +
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
      skillsWithData(repoRoot, ROOTS.claude),
      skillsWithData(repoRoot, ROOTS.agents)
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
