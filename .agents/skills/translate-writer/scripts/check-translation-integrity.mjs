#!/usr/bin/env node

/**
 * 번역 재작성 단계(Phase 2 수정, Phase 3 polish, 외부 윤문)의 무결성 게이트.
 *
 * 재작성 전후 스냅샷(before.md, after.md)을 비교해 "산문이 아닌 불변 요소"가
 * 보존됐는지 판정한다. 산문(문장) 차이는 보지 않는다 — 그건 translation-verifier
 * 델타 모드의 몫이다. 이 스크립트는 윤문 도구가 frontmatter 빈 줄을 떨어뜨리거나,
 * 요약 HTML 주석을 본문에 붙이거나, 숫자·커맨드를 바꿔 먹는 회귀를 잡는다.
 *
 * 사용:
 *   node check-translation-integrity.mjs <before.md> <after.md> [--json]
 *
 * 오류(FAIL):
 *   - frontmatter 키 집합 불일치
 *   - title · tags · series · pubDatetime 값 변경
 *     (WARN 목록에 없는 그 밖의 키 값 변경도 FAIL — 산문이 아니므로)
 *   - 헤딩 순서·텍스트 불일치
 *   - 이미지 경로 목록 불일치
 *   - 펜스 코드 블록 내용·순서 불일치
 *   - 인라인 코드 스팬 다중집합 불일치
 *   - 링크 URL 다중집합 불일치
 *   - 숫자 토큰 다중집합 불일치
 *   - 슬래시 커맨드(/clear 등) · 환경변수(대문자_언더스코어) 토큰 다중집합 불일치
 *   - details · summary 태그 수 불일치
 *   - after에만 있는 HTML 주석 블록
 *   - frontmatter 닫는 --- 뒤 빈 줄 없음
 *   - 파일 끝 개행 누락 또는 2개 이상
 *
 * 경고(WARN, 실패 아님):
 *   - 빈 줄 수 변화
 *   - 이미지 alt 텍스트 변경
 *   - modDatetime · draft · featured · description 값 변경
 *   - before에만 있는 HTML 주석 블록(주석 제거)
 *
 * 토큰 집계 범위: frontmatter 제외, 펜스 코드 블록은 별도 비교 후 본문에서 제외,
 * 인라인 코드 · 링크 URL · 이미지 경로도 각자 비교한 뒤 산문 토큰 집계에서 뺀다.
 * CRLF는 LF로 정규화해 비교한다(Windows 체크아웃 차이를 무시).
 *
 * 출력(stdout): 항목별 PASS/FAIL/WARN과 차이. --json 이면 {pass, errors, warnings}.
 * Exit codes: 0 = PASS, 1 = FAIL, 2 = 사용 오류.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const FAIL_KEYS = new Set(["title", "tags", "series", "pubDatetime"]);
const WARN_KEYS = new Set(["modDatetime", "draft", "featured", "description"]);

// ─── CLI ────────────────────────────────────────────────────────────────────

function usage(message) {
  if (message) process.stderr.write(`오류: ${message}\n\n`);
  process.stderr.write(
    "사용법: node check-translation-integrity.mjs <before.md> <after.md> [--json]\n"
  );
  process.exit(2);
}

function parseArgs(argv) {
  const files = [];
  let json = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else if (arg.startsWith("--")) usage(`알 수 없는 옵션: ${arg}`);
    else files.push(arg);
  }
  if (files.length !== 2) usage("before.md 와 after.md 두 파일 경로가 필요합니다");
  for (const file of files) {
    if (!existsSync(file)) usage(`파일을 찾을 수 없습니다: ${file}`);
  }
  return { before: files[0], after: files[1], json };
}

// ─── 파싱 ───────────────────────────────────────────────────────────────────

function parseDocument(raw) {
  const text = raw.replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  let frontmatter = new Map();
  let bodyStart = 0;
  let hasFrontmatter = false;
  let blankAfterFrontmatter = null;

  if (lines[0] === "---") {
    const closing = lines.indexOf("---", 1);
    if (closing > 0) {
      hasFrontmatter = true;
      frontmatter = parseFrontmatter(lines.slice(1, closing));
      bodyStart = closing + 1;
      blankAfterFrontmatter = lines[bodyStart] === "";
    }
  }

  const bodyLines = lines.slice(bodyStart);
  const { fences, proseLines } = extractFences(bodyLines);
  const prose = proseLines.join("\n");

  return {
    text,
    hasFrontmatter,
    frontmatter,
    blankAfterFrontmatter,
    fences,
    headings: proseLines.filter(line => /^#{1,6}\s+\S/.test(line)),
    images: collectImages(prose),
    inlineCode: multiset(collectInlineCode(prose)),
    links: multiset(collectLinks(prose)),
    comments: multiset(collectComments(prose)),
    detailsTags: countTags(prose),
    blankLines: bodyLines.filter(line => line.trim() === "").length,
    ...collectProseTokens(prose),
  };
}

// "key: value" 1단계만 읽는다. 들여쓴 연속 줄(YAML 리스트 등)은 직전 키의 값에
// 이어 붙여 값 변경 감지에만 쓴다 — 완전한 YAML 파서는 필요 없다.
function parseFrontmatter(lines) {
  const map = new Map();
  let lastKey = null;
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (match) {
      lastKey = match[1];
      map.set(lastKey, match[2].trim());
    } else if (lastKey !== null && line.trim() !== "") {
      map.set(lastKey, `${map.get(lastKey)}\n${line.trim()}`);
    }
  }
  return map;
}

// 펜스 코드 블록(``` 또는 ~~~)을 순서대로 뽑아내고 본문에서 제거한다.
function extractFences(lines) {
  const fences = [];
  const proseLines = [];
  let open = null;
  let buffer = [];
  for (const line of lines) {
    if (open === null) {
      const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (match) {
        open = match[1];
        buffer = [line];
      } else {
        proseLines.push(line);
      }
      continue;
    }
    buffer.push(line);
    const closing = line.match(/^\s*(`{3,}|~{3,})\s*$/);
    if (closing && closing[1][0] === open[0] && closing[1].length >= open.length) {
      fences.push(buffer.join("\n"));
      open = null;
      buffer = [];
    }
  }
  if (open !== null) fences.push(buffer.join("\n"));
  return { fences, proseLines };
}

const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const LINK_RE = /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const AUTOLINK_RE = /<(https?:\/\/[^>\s]+)>/g;
const BARE_URL_RE = /https?:\/\/[^\s<>)\]]+/g;
const INLINE_CODE_RE = /`+([^`\n]+?)`+/g;
const COMMENT_RE = /<!--[\s\S]*?-->/g;

function collectImages(prose) {
  return [...prose.matchAll(IMAGE_RE)].map(m => ({ alt: m[1], src: m[2] }));
}

function collectInlineCode(prose) {
  return [...prose.matchAll(INLINE_CODE_RE)].map(m => m[1]);
}

function collectLinks(prose) {
  const stripped = prose.replace(IMAGE_RE, "");
  const urls = [];
  const remaining = stripped
    .replace(LINK_RE, (_, _text, url) => {
      urls.push(url);
      return "";
    })
    .replace(AUTOLINK_RE, (_, url) => {
      urls.push(url);
      return "";
    });
  for (const m of remaining.matchAll(BARE_URL_RE)) urls.push(m[0]);
  return urls;
}

function collectComments(prose) {
  return [...prose.matchAll(COMMENT_RE)].map(m => m[0].trim());
}

function countTags(prose) {
  const count = re => (prose.match(re) ?? []).length;
  return {
    "<details>": count(/<details\b/gi),
    "</details>": count(/<\/details>/gi),
    "<summary>": count(/<summary\b/gi),
    "</summary>": count(/<\/summary>/gi),
  };
}

// 산문 토큰: 인라인 코드 · 링크 · 이미지 · 주석을 뺀 나머지에서 숫자와
// 슬래시 커맨드 · 환경변수를 센다. 링크 텍스트는 산문이므로 남긴다.
function collectProseTokens(prose) {
  const plain = prose
    .replace(COMMENT_RE, " ")
    .replace(INLINE_CODE_RE, " ")
    .replace(IMAGE_RE, " ")
    .replace(LINK_RE, (_, text) => ` ${text} `)
    .replace(AUTOLINK_RE, " ")
    .replace(BARE_URL_RE, " ");
  const numbers = plain.match(/\d+(?:[.,]\d+)*/g) ?? [];
  const commands = plain.match(/(?<![\w/.:])\/[a-z][\w-]*/g) ?? [];
  const envVars = plain.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g) ?? [];
  return {
    numbers: multiset(numbers),
    commands: multiset([...commands, ...envVars]),
  };
}

function multiset(items) {
  const map = new Map();
  for (const item of items) map.set(item, (map.get(item) ?? 0) + 1);
  return map;
}

// ─── 비교 ───────────────────────────────────────────────────────────────────

function diffMultiset(a, b) {
  const onlyA = [];
  const onlyB = [];
  for (const [key, count] of a) {
    const other = b.get(key) ?? 0;
    if (count > other) onlyA.push(`'${key}'×${count - other}`);
  }
  for (const [key, count] of b) {
    const other = a.get(key) ?? 0;
    if (count > other) onlyB.push(`'${key}'×${count - other}`);
  }
  if (onlyA.length === 0 && onlyB.length === 0) return null;
  const parts = [];
  if (onlyA.length) parts.push(`before에만 ${onlyA.join(", ")}`);
  if (onlyB.length) parts.push(`after에만 ${onlyB.join(", ")}`);
  return parts.join(", ");
}

function diffSequence(a, b) {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      const left = a[i] === undefined ? "(없음)" : `'${a[i]}'`;
      const right = b[i] === undefined ? "(없음)" : `'${b[i]}'`;
      return `${i + 1}번째: before ${left} / after ${right} (개수 ${a.length} → ${b.length})`;
    }
  }
  return null;
}

function compare(before, after) {
  const results = [];
  const add = (name, status, detail) => results.push({ name, status, detail });
  const check = (name, detail, level = "FAIL") =>
    add(name, detail ? level : "PASS", detail);

  // frontmatter
  if (!after.hasFrontmatter) {
    add("frontmatter", "FAIL", "after에 frontmatter(--- 블록)가 없음");
  } else {
    const keysA = [...before.frontmatter.keys()];
    const keysB = [...after.frontmatter.keys()];
    const missing = keysA.filter(k => !after.frontmatter.has(k));
    const added = keysB.filter(k => !before.frontmatter.has(k));
    const keyDiff = [];
    if (missing.length) keyDiff.push(`after에서 사라진 키 ${missing.join(", ")}`);
    if (added.length) keyDiff.push(`after에만 있는 키 ${added.join(", ")}`);
    check("frontmatter 키 집합", keyDiff.join(", ") || null);

    for (const key of keysA) {
      if (!after.frontmatter.has(key)) continue;
      const a = before.frontmatter.get(key);
      const b = after.frontmatter.get(key);
      if (a === b) continue;
      const level = WARN_KEYS.has(key) ? "WARN" : "FAIL";
      const label = FAIL_KEYS.has(key) || WARN_KEYS.has(key) ? "" : " (보호 키 외)";
      add(`frontmatter ${key}${label}`, level, `'${a}' → '${b}'`);
    }
    check(
      "frontmatter 뒤 빈 줄",
      after.blankAfterFrontmatter ? null : "닫는 --- 바로 뒤에 빈 줄이 없음"
    );
  }

  // 구조
  check("헤딩 순서·텍스트", diffSequence(before.headings, after.headings));
  check(
    "이미지 경로",
    diffSequence(
      before.images.map(i => i.src),
      after.images.map(i => i.src)
    )
  );
  check(
    "이미지 alt 텍스트",
    diffSequence(
      before.images.map(i => i.alt),
      after.images.map(i => i.alt)
    ),
    "WARN"
  );
  check(
    "펜스 코드 블록",
    diffSequence(
      before.fences.map(summarizeFence),
      after.fences.map(summarizeFence)
    )
  );

  // 다중집합
  check("인라인 코드 스팬", diffMultiset(before.inlineCode, after.inlineCode));
  check("링크 URL", diffMultiset(before.links, after.links));
  check("숫자 토큰", diffMultiset(before.numbers, after.numbers));
  check("슬래시 커맨드·환경변수 토큰", diffMultiset(before.commands, after.commands));

  // 태그·주석
  const tagDiff = Object.keys(before.detailsTags)
    .filter(tag => before.detailsTags[tag] !== after.detailsTags[tag])
    .map(tag => `${tag} ${before.detailsTags[tag]} → ${after.detailsTags[tag]}`);
  check("details·summary 태그 수", tagDiff.join(", ") || null);

  const addedComments = [];
  const removedComments = [];
  for (const [comment, count] of after.comments) {
    const other = before.comments.get(comment) ?? 0;
    if (count > other) addedComments.push(`${truncate(comment)}×${count - other}`);
  }
  for (const [comment, count] of before.comments) {
    const other = after.comments.get(comment) ?? 0;
    if (count > other) removedComments.push(`${truncate(comment)}×${count - other}`);
  }
  check(
    "HTML 주석 블록(after 추가)",
    addedComments.length ? `after에만 ${addedComments.join(", ")}` : null
  );
  check(
    "HTML 주석 블록(before 제거)",
    removedComments.length ? `before에만 ${removedComments.join(", ")}` : null,
    "WARN"
  );

  // 파일 끝·빈 줄
  let eofDetail = null;
  if (!after.text.endsWith("\n")) eofDetail = "파일 끝 개행 누락";
  else if (after.text.endsWith("\n\n")) eofDetail = "파일 끝 개행이 2개 이상";
  check("파일 끝 개행", eofDetail);
  check(
    "빈 줄 수",
    before.blankLines === after.blankLines
      ? null
      : `${before.blankLines} → ${after.blankLines}`,
    "WARN"
  );

  return results;
}

function summarizeFence(fence) {
  const firstLine = fence.split("\n")[0];
  return `${firstLine} (${fence.length}자, 해시 ${hash(fence)})`;
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}

function truncate(text, max = 60) {
  const oneLine = text.replace(/\s+/g, " ");
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

// ─── 실행 ───────────────────────────────────────────────────────────────────

const { before, after, json } = parseArgs(process.argv.slice(2));
const results = compare(
  parseDocument(readFileSync(before, "utf8")),
  parseDocument(readFileSync(after, "utf8"))
);

const errors = results.filter(r => r.status === "FAIL");
const warnings = results.filter(r => r.status === "WARN");
const pass = errors.length === 0;
const format = r => `${r.name}: ${r.detail}`;

const out = text => process.stdout.write(`${text}
`);

if (json) {
  out(
    JSON.stringify(
      { pass, errors: errors.map(format), warnings: warnings.map(format) },
      null,
      2
    )
  );
} else {
  out(`무결성 게이트: ${path.basename(before)} → ${path.basename(after)}`);
  const icon = { PASS: "✅", FAIL: "❌", WARN: "⚠️" };
  for (const r of results) {
    out(`  ${icon[r.status]} ${r.status} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  out(
    pass
      ? `
✅ PASS (경고 ${warnings.length}건)`
      : `
❌ FAIL (오류 ${errors.length}건, 경고 ${warnings.length}건)`
  );
}

process.exit(pass ? 0 : 1);
