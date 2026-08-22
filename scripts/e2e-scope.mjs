#!/usr/bin/env node

/**
 * E2E 실행 범위 판정.
 *
 * E2E는 CI 시간의 대부분을 차지하는데, 글 한 편만 추가하는 PR에는 대부분이
 * 무관하다. 그렇다고 "콘텐츠만 바뀌면 스킵"은 안전하지 않다 — 여러 스펙이
 * 실제 글을 슬러그로 고정 참조하고(fixtures/test-posts.ts, presentation-mode의
 * 번역글 2편), /about·/portfolio는 contents/pages/ 안에 있다.
 *
 * 그래서 트리거를 "번역글이냐"가 아니라 "E2E가 핀으로 걸어둔 콘텐츠를
 * 건드렸느냐"로 잡는다. 핀 목록은 손으로 관리하지 않고 e2e/의 문자열
 * 리터럴에서 도출하므로, 스펙이 참조 대상을 바꾸면 핀도 따라 움직인다.
 *
 * URL → 콘텐츠 경로 역매핑이 가능한 근거: src/utils/getPath.ts가 파일명을
 * .slice(0, -1)로 버리고 디렉터리 세그먼트만 슬러그로 쓴다. 여기서는 역방향
 * 추측 대신 정방향으로 모든 글의 URL을 계산해 맵을 만들어 정확도를 보장한다.
 *
 * 사용법:
 *   node scripts/e2e-scope.mjs --check                E2E 핀 무결성 검사 (CI 상시)
 *   node scripts/e2e-scope.mjs --changed-from <ref>   ref와의 merge-base 기준 판정
 *   node scripts/e2e-scope.mjs < files.txt            변경 파일 목록을 stdin으로
 *
 * 판정 출력(stdout): "ALL" 또는 공백으로 구분된 스펙 경로 목록.
 * Exit codes: 0 = 정상, 1 = 핀 무결성 위반(--check).
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { kebabCase } from "es-toolkit";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const BLOG_DIR = "contents/blog";
const PAGES_DIR = "contents/pages";
const E2E_DIR = "e2e";
const FIXTURES_DIR = "e2e/fixtures";
const POSTS_ROUTES = "src/pages/posts";

// 콘텐츠만 바뀐 PR에서도 항상 도는 스펙. 특정 글이 아니라 목록 전체의 분류·
// 페이지네이션 불변식을 보므로, 글이 늘거나 줄 때 깨질 수 있는 유일한 축이다.
const CONTENT_BASE_SPECS = ["e2e/posts-tabs.spec.ts", "e2e/og-image.spec.ts"];

const toPosix = p => p.split(path.sep).join("/");
const abs = rel => path.join(repoRoot, rel);

/** 디렉터리를 재귀 순회하며 조건에 맞는 파일의 레포 기준 상대 경로를 모은다. */
function walk(relDir, accept, acc = []) {
  const full = abs(relDir);
  if (!existsSync(full)) return acc;
  for (const entry of readdirSync(full, { withFileTypes: true })) {
    const rel = `${relDir}/${entry.name}`;
    if (entry.isDirectory()) walk(rel, accept, acc);
    else if (accept(entry.name)) acc.push(rel);
  }
  return acc;
}

/**
 * 모든 글의 URL → 글 디렉터리 맵.
 *
 * getPath와 동일한 규칙을 정방향으로 적용한다: 파일명을 버리고, _로 시작하는
 * 세그먼트를 걸러내고, 남은 디렉터리 세그먼트를 슬러그화해 잇는다. 로더
 * 패턴과 맞추기 위해 파일명이 _로 시작하는 md는 제외한다.
 */
function buildPostUrlMap() {
  const map = new Map();
  const files = walk(
    BLOG_DIR,
    name => name.endsWith(".md") && !name.startsWith("_")
  );

  for (const file of files) {
    const segments = file
      .slice(BLOG_DIR.length + 1)
      .split("/")
      .slice(0, -1) // 파일명 제거
      .filter(segment => !segment.startsWith("_"))
      .map(segment => kebabCase(segment));

    if (segments.length < 1) continue; // 최상위 .md는 핀 대상이 아니다

    // 글 디렉터리 전체가 핀 범위다 — 본문뿐 아니라 같은 폴더의 이미지 교체도
    // 렌더 결과를 바꾸므로 함께 트리거되어야 한다.
    map.set(`/posts/${segments.join("/")}`, `${path.posix.dirname(file)}/`);
  }
  return map;
}

/** /about, /portfolio 같은 단일 페이지의 URL → 파일 맵. */
function buildPageUrlMap() {
  const map = new Map();
  for (const file of walk(PAGES_DIR, name => name.endsWith(".md"))) {
    map.set(`/${path.posix.basename(file, ".md")}`, file);
  }
  return map;
}

/**
 * /posts 아래 정적 라우트 이름. check-post-classification.mjs와 같은 이유로
 * 상수를 적지 않고 디렉터리에서 파생한다 — 탭이 늘어도 고칠 필요가 없다.
 */
function reservedRouteSegments() {
  const full = abs(POSTS_ROUTES);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith("["))
    .map(entry => entry.name);
}

/** 파일에서 보간 없는 문자열 리터럴을 모두 뽑는다. */
function extractLiterals(relFile) {
  const source = readFileSync(abs(relFile), "utf8");
  const literals = new Set();
  const patterns = [/"([^"\n]*)"/g, /'([^'\n]*)'/g, /`([^`$\n]*)`/g];
  for (const pattern of patterns) {
    for (const [, value] of source.matchAll(pattern)) literals.add(value);
  }
  return literals;
}

/** 스펙이 참조하는 fixture 파일 경로 목록. */
function importedFixtures(relSpec) {
  const source = readFileSync(abs(relSpec), "utf8");
  const files = [];
  for (const [, name] of source.matchAll(/from\s+"\.\/fixtures\/([\w.-]+)"/g)) {
    const candidate = `${FIXTURES_DIR}/${name}.ts`;
    if (existsSync(abs(candidate))) files.push(candidate);
  }
  return files;
}

/**
 * 스펙별 핀 계산.
 *
 * 리터럴을 그대로도 보고 "/posts/" 접두어를 붙여서도 본다 — fixture는
 * TEST_POST_SLUG처럼 접두어 없는 슬러그로 글을 지목하기 때문이다.
 */
function buildPinMap(postUrls, pageUrls) {
  const pins = new Map();

  for (const spec of walk(E2E_DIR, name => name.endsWith(".spec.ts"))) {
    const literals = new Set(extractLiterals(spec));
    for (const fixture of importedFixtures(spec)) {
      for (const literal of extractLiterals(fixture)) literals.add(literal);
    }

    const paths = new Set();
    for (const literal of literals) {
      for (const url of [literal, `/posts/${literal}`]) {
        if (postUrls.has(url)) paths.add(postUrls.get(url));
        if (pageUrls.has(url)) paths.add(pageUrls.get(url));
      }
    }
    pins.set(spec, paths);
  }
  return pins;
}

/**
 * 리터럴이 "글을 지목하려는 의도"인지 판별해 슬러그를 돌려준다. 아니면 null.
 *
 * 두 형태를 모두 받는다. 스펙마다 관용이 다르기 때문이다:
 *   "/posts/translation/foo"  — 완성된 URL (og-image, presentation-mode)
 *   "translation/foo"         — 맨슬러그 상수 (fixtures, heading-links)
 *
 * 맨슬러그는 "image/png" 같은 무관한 리터럴과 구분해야 하므로, 첫 세그먼트가
 * 실제 글 URL의 첫 세그먼트 집합에 있는 경우만 글 참조로 본다. 단일 세그먼트는
 * 카테고리 이름("ai")과 구분되지 않으므로 제외한다.
 */
function postSlugIntent(literal, reserved, postFirstSegments) {
  const asUrl = literal.match(/^\/posts\/(.+)$/);
  if (asUrl) {
    const [first] = asUrl[1].split("/");
    if (reserved.has(first) || /^\d+$/.test(first)) return null;
    return asUrl[1];
  }
  const segments = literal.split("/");
  if (segments.length < 2 || !postFirstSegments.has(segments[0])) return null;
  return literal;
}

/**
 * 핀 무결성 검사.
 *
 * 1) 글을 지목하려는 리터럴은 반드시 실존하는 글로 해석되어야 한다. 글 이름을
 *    바꾸면 여기서 먼저 터진다.
 * 2) fixture 파일은 글을 지목하려고 존재하므로 최소 1개의 핀을 내야 한다.
 *
 * 이 검사가 없으면 글 이름 변경이 스코핑을 조용히 무력화한다(핀이 하나도
 * 안 걸려 항상 최소 셋만 도는 상태로 퇴화).
 */
function runCheck(postUrls, pins) {
  const reserved = new Set(reservedRouteSegments());
  const postFirstSegments = new Set(
    [...postUrls.keys()].map(url => url.split("/")[2])
  );
  const specs = walk(E2E_DIR, name => name.endsWith(".spec.ts"));
  // fixture는 여러 스펙이 공유하므로 같은 위반이 스펙 수만큼 중복된다
  const errors = new Set();

  for (const spec of specs) {
    for (const source of [spec, ...importedFixtures(spec)]) {
      for (const literal of extractLiterals(source)) {
        const slug = postSlugIntent(literal, reserved, postFirstSegments);
        if (slug === null || postUrls.has(`/posts/${slug}`)) continue;
        errors.add(
          `  ${source}: "${literal}" — 이 URL에 해당하는 글이 없습니다 (이름이 바뀌었거나 삭제됨)`
        );
      }
    }
  }

  for (const fixture of walk(FIXTURES_DIR, name => name.endsWith(".ts"))) {
    const users = specs.filter(spec =>
      importedFixtures(spec).includes(fixture)
    );
    if (users.length > 0 && !users.some(spec => pins.get(spec)?.size > 0)) {
      errors.add(
        `  ${fixture}: 어떤 글도 지목하지 못합니다 — 고정 참조 글이 사라졌거나 이름이 바뀌었습니다`
      );
    }
  }

  if (errors.size > 0) {
    process.stderr.write(`❌ E2E 핀 무결성 검사 실패 (${errors.size}건):\n`);
    process.stderr.write(`${[...errors].join("\n")}\n\n`);
    process.stderr.write(
      "E2E 스펙이 슬러그로 고정 참조하는 글을 옮기거나 이름을 바꿨다면 스펙도 함께 갱신하세요.\n"
    );
    process.exit(1);
  }

  const pinned = [...pins].filter(([, paths]) => paths.size > 0);
  process.stdout.write(`✅ E2E 핀 무결성 OK (${pinned.length}개 스펙):\n`);
  for (const [spec, paths] of pinned) {
    process.stdout.write(`   ${spec} → ${[...paths].sort().join(", ")}\n`);
  }
}

/** merge-base 기준 변경 파일 목록. 실패하면 null(= 판정 불가). */
function changedFilesFrom(ref) {
  try {
    const base = execFileSync("git", ["merge-base", ref, "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const diff = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    return diff.split("\n").filter(Boolean);
  } catch {
    return null;
  }
}

function readStdin() {
  try {
    if (process.stdin.isTTY) return null;
    const files = readFileSync(0, "utf8").split("\n").filter(Boolean);
    return files.length > 0 ? files : null;
  } catch {
    return null;
  }
}

/** 변경 파일 목록 → 실행할 스펙 목록(또는 ALL). */
function resolveScope(changed, pins) {
  // 판정 불가·콘텐츠 밖 변경은 전부 돌린다 (fail-safe)
  if (!changed) return "ALL";
  if (changed.some(file => !toPosix(file).startsWith("contents/"))) return "ALL";

  const selected = new Set(
    CONTENT_BASE_SPECS.filter(spec => existsSync(abs(spec)))
  );
  for (const [spec, paths] of pins) {
    const touched = [...paths].some(pinned =>
      changed.some(file =>
        pinned.endsWith("/")
          ? toPosix(file).startsWith(pinned)
          : toPosix(file) === pinned
      )
    );
    if (touched) selected.add(spec);
  }
  return [...selected].sort().join(" ");
}

const args = process.argv.slice(2);
const postUrls = buildPostUrlMap();
const pins = buildPinMap(postUrls, buildPageUrlMap());

if (args.includes("--check")) {
  runCheck(postUrls, pins);
} else {
  const refIndex = args.indexOf("--changed-from");
  const ref = refIndex === -1 ? null : args[refIndex + 1];
  const changed = ref ? changedFilesFrom(ref) : readStdin();
  process.stdout.write(`${resolveScope(changed, pins)}\n`);
}
