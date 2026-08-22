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
 * URL → 콘텐츠 경로 역매핑이 가능한 근거: src/utils/getPath.ts가 디렉터리
 * 세그먼트만 슬러그로 쓴다. 여기서는 역방향 추측 대신 정방향으로 모든 글의
 * URL을 계산해 맵을 만든다 — getPath의 폴백 분기(디렉터리가 남지 않으면
 * 파일명이 슬러그)까지 포함해야 _samples/ 아래 글들이 누락되지 않는다.
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
// 핀 맵과 달리 손으로 적은 목록이라 runCheck가 실존 여부를 따로 검사한다.
const CONTENT_BASE_SPECS = ["e2e/posts-tabs.spec.ts", "e2e/og-image.spec.ts"];

// Astro 빌드 입력이 아니어서 렌더 결과를 바꿀 수 없는 경로. 에이전트 지침과
// 스킬 데이터가 여기 산다 — 번역 초안 PR은 글과 함께 이 경로들을 늘 같이
// 커밋하므로, 이게 없으면 초안 PR이 전부 ALL로 떨어진다.
//
// "빌드에 영향 없다"는 단정은 시간이 지나면 깨질 수 있다(스킬 목록을 렌더하는
// 페이지가 생기는 순간 거짓이 된다). runCheck가 빌드 입력에서 이 접두어들을
// 찾아 전제가 여전히 참인지 검사한다.
const NON_BUILD_PREFIXES = [".claude/", ".agents/"];

// 빌드 입력으로 취급하는 텍스트 파일. 위 전제를 검사할 대상이다.
const BUILD_INPUT_ROOTS = ["src"];
const BUILD_INPUT_FILES = ["astro.config.ts"];
const TEXT_SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs|astro|json|css)$/;

const toPosix = p => p.split(path.sep).join("/");
const abs = rel => path.join(repoRoot, rel);

/** 후행 슬래시를 떼어 맵 조회 키와 형태를 맞춘다. Astro는 두 형태를 다 서빙한다. */
const normalizeUrl = url => url.replace(/\/+$/, "");

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
 * 글 하나의 URL과 핀 경로.
 *
 * getPath.ts를 그대로 옮긴다. 순서가 중요하다 — _ 세그먼트를 먼저 걸러낸 뒤
 * 파일명을 버리므로, `_samples/foo.md`처럼 디렉터리가 하나도 남지 않는 글은
 * 폴백 분기를 타서 파일명이 슬러그가 된다(슬러그화하지 않는 것도 getPath와 같다).
 *
 * 핀 경로는 글이 자기 디렉터리를 소유할 때만 디렉터리로 잡는다. `foo/index.md`
 * 관례에서는 옆의 이미지를 갈아끼워도 렌더 결과가 바뀌므로 디렉터리째 걸어야
 * 하지만, `_samples/foo.md`처럼 한 디렉터리에 여러 글이 있으면 파일만 걸어야
 * 서로의 변경에 엉뚱하게 딸려 나오지 않는다.
 */
function postEntryFor(relFile) {
  const segments = relFile
    .slice(BLOG_DIR.length + 1)
    .split("/")
    .filter(segment => segment !== "")
    .filter(segment => !segment.startsWith("_"))
    .slice(0, -1) // 파일명 제거
    .map(segment => kebabCase(segment));

  const dir = path.posix.dirname(relFile);
  if (segments.length < 1) {
    // getPath 폴백: 디렉터리가 남지 않으면 id의 마지막 조각(=파일명)이 슬러그다
    return {
      url: `/posts/${path.posix.basename(relFile, ".md")}`,
      pin: relFile,
    };
  }

  const ownsDir = kebabCase(path.posix.basename(dir)) === segments.at(-1);
  return {
    url: `/posts/${segments.join("/")}`,
    pin: ownsDir ? `${dir}/` : relFile,
  };
}

/** 모든 글의 URL → 핀 경로 맵. */
function buildPostUrlMap() {
  const map = new Map();
  const files = walk(
    BLOG_DIR,
    name => name.endsWith(".md") && !name.startsWith("_")
  );
  for (const file of files) {
    const { url, pin } = postEntryFor(file);
    map.set(url, pin);
  }
  return map;
}

/**
 * /about, /portfolio 같은 단일 페이지의 URL → 파일 맵.
 *
 * basename이 아니라 PAGES_DIR 기준 상대 경로를 키로 쓴다 — walk가 재귀라
 * 하위 디렉터리의 동명 파일이 서로를 덮어쓰면 핀이 엉뚱한 파일을 가리킨다.
 */
function buildPageUrlMap() {
  const map = new Map();
  for (const file of walk(PAGES_DIR, name => name.endsWith(".md"))) {
    map.set(`/${file.slice(PAGES_DIR.length + 1).replace(/\.md$/, "")}`, file);
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

/**
 * 파일에서 보간 없는 문자열 리터럴을 모두 뽑는다.
 *
 * 이스케이프된 따옴표(`"foo\"bar"`)에서 경계를 잘못 잡지 않도록 escape 시퀀스를
 * 한 토큰으로 소비한다. 파서가 아니므로 주석 안의 아포스트로피 같은 가짜
 * 리터럴은 여전히 섞이지만, 글 URL로 해석되지 않으면 그대로 버려진다.
 */
function extractLiterals(relFile) {
  const source = readFileSync(abs(relFile), "utf8");
  const literals = new Set();
  const patterns = [
    /"((?:[^"\\\n]|\\.)*)"/g,
    /'((?:[^'\\\n]|\\.)*)'/g,
    /`((?:[^`\\$\n]|\\.)*)`/g,
  ];
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
 * 스펙 → (소스 파일 → 리터럴 집합).
 *
 * 핀 계산과 무결성 검사가 같은 파일을 각자 다시 읽지 않도록 한 번만 파싱하고,
 * 소스별로 나눠 담아 오류 메시지가 위반 리터럴의 출처를 지목할 수 있게 한다.
 */
function collectSpecSources() {
  const parsed = new Map();
  const literalsOf = file => {
    if (!parsed.has(file)) parsed.set(file, extractLiterals(file));
    return parsed.get(file);
  };

  const specs = new Map();
  for (const spec of walk(E2E_DIR, name => name.endsWith(".spec.ts"))) {
    const sources = [spec, ...importedFixtures(spec)];
    specs.set(spec, new Map(sources.map(file => [file, literalsOf(file)])));
  }
  return specs;
}

/**
 * 스펙별 핀 계산.
 *
 * 리터럴을 그대로도 보고 "/posts/" 접두어를 붙여서도 본다 — fixture는
 * TEST_POST_SLUG처럼 접두어 없는 슬러그로 글을 지목하기 때문이다.
 */
function buildPinMap(specSources, postUrls, pageUrls) {
  const pins = new Map();

  for (const [spec, sources] of specSources) {
    const paths = new Set();
    for (const literals of sources.values()) {
      for (const literal of literals) {
        for (const url of [literal, `/posts/${literal}`]) {
          const key = normalizeUrl(url);
          if (postUrls.has(key)) paths.add(postUrls.get(key));
          if (pageUrls.has(key)) paths.add(pageUrls.get(key));
        }
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
  const normalized = normalizeUrl(literal);
  const asUrl = normalized.match(/^\/posts\/(.+)$/);
  if (asUrl) {
    const [first] = asUrl[1].split("/");
    if (reserved.has(first) || /^\d+$/.test(first)) return null;
    return asUrl[1];
  }
  const segments = normalized.split("/");
  if (segments.length < 2 || !postFirstSegments.has(segments[0])) return null;
  return normalized;
}

/** 전제 검사 대상이 되는 빌드 입력 텍스트 파일. */
function buildInputFiles() {
  const fromRoots = BUILD_INPUT_ROOTS.flatMap(root =>
    walk(root, name => TEXT_SOURCE.test(name))
  );
  return [...fromRoots, ...BUILD_INPUT_FILES.filter(f => existsSync(abs(f)))];
}

/**
 * 핀 무결성 검사.
 *
 * 1) 글을 지목하려는 리터럴은 반드시 실존하는 글로 해석되어야 한다. 글 이름을
 *    바꾸면 여기서 먼저 터진다.
 * 2) fixture 파일은 글을 지목하려고 존재하므로 최소 1개의 핀을 내야 한다.
 * 3) CONTENT_BASE_SPECS는 유일하게 손으로 적은 목록이라 실존 여부를 검사한다.
 *    이게 없으면 스펙 rename이 콘텐츠 티어를 조용히 축소시킨다.
 * 4) NON_BUILD_PREFIXES가 "빌드가 읽지 않는 경로"라는 전제를 검사한다. 빌드
 *    입력이 그 경로를 참조하기 시작하면 전제가 깨지고, 스코핑이 렌더 결과를
 *    바꾸는 변경에 E2E를 건너뛰게 된다.
 *
 * 이 검사가 없으면 글 이름 변경이 스코핑을 조용히 무력화한다(핀이 하나도
 * 안 걸려 항상 최소 셋만 도는 상태로 퇴화).
 */
function runCheck(specSources, postUrls, pins) {
  const reserved = new Set(reservedRouteSegments());
  const postFirstSegments = new Set(
    [...postUrls.keys()].map(url => url.split("/")[2])
  );
  // fixture는 여러 스펙이 공유하므로 같은 위반이 스펙 수만큼 중복된다
  const errors = new Set();

  for (const sources of specSources.values()) {
    for (const [source, literals] of sources) {
      for (const literal of literals) {
        const slug = postSlugIntent(literal, reserved, postFirstSegments);
        if (slug === null || postUrls.has(`/posts/${slug}`)) continue;
        errors.add(
          `  ${source}: "${literal}" — 이 URL에 해당하는 글이 없습니다 (이름이 바뀌었거나 삭제됨)`
        );
      }
    }
  }

  for (const fixture of walk(FIXTURES_DIR, name => name.endsWith(".ts"))) {
    const users = [...specSources]
      .filter(([, sources]) => sources.has(fixture))
      .map(([spec]) => spec);
    if (users.length > 0 && !users.some(spec => pins.get(spec)?.size > 0)) {
      errors.add(
        `  ${fixture}: 어떤 글도 지목하지 못합니다 — 고정 참조 글이 사라졌거나 이름이 바뀌었습니다`
      );
    }
  }

  for (const spec of CONTENT_BASE_SPECS) {
    if (!existsSync(abs(spec))) {
      errors.add(
        `  ${spec}: CONTENT_BASE_SPECS에 있으나 파일이 없습니다 — 스펙을 옮겼다면 상수도 함께 갱신하세요`
      );
    }
  }

  for (const file of buildInputFiles()) {
    const source = readFileSync(abs(file), "utf8");
    for (const prefix of NON_BUILD_PREFIXES) {
      if (!source.includes(prefix)) continue;
      errors.add(
        `  ${file}: "${prefix}"를 참조합니다 — 이 경로는 빌드에 영향을 주지 않는다는 전제로 E2E 스코핑 안전 목록에 있습니다. 빌드가 실제로 읽는다면 NON_BUILD_PREFIXES에서 빼세요`
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

/** merge-base 기준 변경 파일 목록. 판정할 수 없으면 null. */
function changedFilesFrom(ref) {
  // PR 컨텍스트가 없는 호출(workflow_call 등)에서는 base sha가 빈 문자열로 온다
  if (!ref) return null;
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

/**
 * 이 파일 하나만 바뀌었을 때 전체 스위트가 필요 없다고 말할 수 있는가.
 *
 * 글(contents/)이거나, 빌드가 읽지 않는 경로다. 그 외에는 전부 모른다고 보고
 * ALL로 떨어진다 — 판단 근거가 없는 경로를 안전하다고 우기지 않는다.
 */
function isScopeSafe(file) {
  const p = toPosix(file);
  return (
    p.startsWith("contents/") ||
    NON_BUILD_PREFIXES.some(prefix => p.startsWith(prefix))
  );
}

/** 변경 파일 목록 → 실행할 스펙 목록(또는 ALL). */
function resolveScope(changed, pins) {
  // 판정 불가·근거 없는 경로 변경은 전부 돌린다 (fail-safe)
  if (!changed) return "ALL";
  if (changed.some(file => !isScopeSafe(file))) return "ALL";

  // 실존 여부로 거르지 않는다 — 목록이 낡았으면 runCheck가 CI에서 먼저 실패하고,
  // 그래도 새어 나오면 playwright가 "no tests found"로 시끄럽게 죽는 편이
  // 커버리지가 조용히 줄어드는 것보다 낫다.
  const selected = new Set(CONTENT_BASE_SPECS);
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
const specSources = collectSpecSources();
const postUrls = buildPostUrlMap();
const pins = buildPinMap(specSources, postUrls, buildPageUrlMap());

if (args.includes("--check")) {
  runCheck(specSources, postUrls, pins);
} else {
  const refIndex = args.indexOf("--changed-from");
  const changed =
    refIndex === -1
      ? readStdin()
      : changedFilesFrom(args[refIndex + 1]);
  process.stdout.write(`${resolveScope(changed, pins)}\n`);
}
