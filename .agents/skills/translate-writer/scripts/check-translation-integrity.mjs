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
 *   node check-translation-integrity.mjs --self-test
 *     내장 픽스처를 임시 디렉터리(os.tmpdir)에 써서 회귀 케이스를 돌리고 결과를
 *     표로 출력한다. 하나라도 기대와 다르면 exit 1. 임시 파일은 종료 시 정리한다.
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
 *   - after에 본문이 없음(frontmatter만 있는 파일이라 빈 줄 검사를 생략)
 *   - 닫히지 않은 펜스 코드 블록(여는 줄부터 끝까지를 산문으로 취급해 집계)
 *
 * 토큰 집계 범위: frontmatter 제외, 펜스 코드 블록은 별도 비교 후 본문에서 제외,
 * 인라인 코드 · 링크 URL · 이미지 경로도 각자 비교한 뒤 산문 토큰 집계에서 뺀다.
 * CRLF는 LF로 정규화해 비교한다(Windows 체크아웃 차이를 무시).
 *
 * 출력(stdout): 항목별 PASS/FAIL/WARN과 차이. --json 이면 {pass, errors, warnings}.
 * Exit codes: 0 = PASS, 1 = FAIL, 2 = 사용 오류.
 *   --self-test: 0 = 전 케이스 기대 일치, 1 = 불일치 있음.
 */

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const FAIL_KEYS = new Set(["title", "tags", "series", "pubDatetime"]);
const WARN_KEYS = new Set(["modDatetime", "draft", "featured", "description"]);

// ─── CLI ────────────────────────────────────────────────────────────────────

function usage(message) {
  if (message) process.stderr.write(`오류: ${message}\n\n`);
  process.stderr.write(
    "사용법: node check-translation-integrity.mjs <before.md> <after.md> [--json]\n" +
      "        node check-translation-integrity.mjs --self-test\n"
  );
  process.exit(2);
}

function parseArgs(argv) {
  const files = [];
  let json = false;
  let selfTest = false;
  for (const arg of argv) {
    if (arg === "--json") json = true;
    else if (arg === "--self-test") selfTest = true;
    else if (arg.startsWith("--")) usage(`알 수 없는 옵션: ${arg}`);
    else files.push(arg);
  }
  if (selfTest) {
    if (files.length) usage("--self-test 는 파일 인자를 받지 않습니다");
    if (json) usage("--self-test 는 --json 과 함께 쓸 수 없습니다");
    return { selfTest: true };
  }
  if (files.length !== 2) usage("before.md 와 after.md 두 파일 경로가 필요합니다");
  for (const file of files) {
    if (!existsSync(file)) usage(`파일을 찾을 수 없습니다: ${file}`);
  }
  return { selfTest: false, before: files[0], after: files[1], json };
}

// ─── 파싱 ───────────────────────────────────────────────────────────────────

function parseDocument(raw) {
  const text = raw.replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  let frontmatter = new Map();
  let bodyStart = 0;
  let hasFrontmatter = false;

  if (lines[0] === "---") {
    const closing = lines.indexOf("---", 1);
    if (closing > 0) {
      hasFrontmatter = true;
      frontmatter = parseFrontmatter(lines.slice(1, closing));
      bodyStart = closing + 1;
    }
  }

  const bodyLines = lines.slice(bodyStart);
  // 닫는 --- 가 파일 마지막 줄이면 lines[bodyStart] 가 undefined 라 빈 줄 검사가
  // 거짓 FAIL 나므로, 본문이 아예 없는 파일은 검사 대상에서 뺀다(null).
  const hasBody = bodyLines.some(line => line.trim() !== "");
  const blankAfterFrontmatter =
    hasFrontmatter && hasBody ? lines[bodyStart] === "" : null;
  const { fences, proseLines, unclosedAt } = extractFences(bodyLines);
  const prose = proseLines.join("\n");

  return {
    text,
    hasFrontmatter,
    hasBody,
    frontmatter,
    blankAfterFrontmatter,
    fences,
    unclosedFenceLine: unclosedAt === null ? null : bodyStart + unclosedAt + 1,
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

// CommonMark 대로 펜스 앞 공백은 0~3칸만 허용한다(4칸 이상은 들여쓴 코드 블록이라 산문 취급).
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE_RE = /^ {0,3}(`{3,}|~{3,})\s*$/;

// 펜스 코드 블록(``` 또는 ~~~)을 순서대로 뽑아내고 본문에서 제거한다.
function extractFences(lines) {
  const fences = [];
  const proseLines = [];
  let open = null;
  let openAt = null;
  let buffer = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (open === null) {
      const match = line.match(FENCE_OPEN_RE);
      if (match) {
        open = match[1];
        openAt = i;
        buffer = [line];
      } else {
        proseLines.push(line);
      }
      continue;
    }
    buffer.push(line);
    const closing = line.match(FENCE_CLOSE_RE);
    if (closing && closing[1][0] === open[0] && closing[1].length >= open.length) {
      fences.push(buffer.join("\n"));
      open = null;
      openAt = null;
      buffer = [];
    }
  }
  // 닫히지 않은 펜스는 블록으로 접지 않는다. 나머지를 통째로 코드로 숨기면 그 뒤의
  // 산문 변경이 게이트를 그냥 통과하므로, 산문으로 돌려보내고 WARN 으로 알린다.
  if (open !== null) proseLines.push(...buffer);
  return { fences, proseLines, unclosedAt: open === null ? null : openAt };
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
    if (after.hasBody) {
      check(
        "frontmatter 뒤 빈 줄",
        after.blankAfterFrontmatter ? null : "닫는 --- 바로 뒤에 빈 줄이 없음"
      );
    } else {
      add("frontmatter 뒤 빈 줄", "WARN", "본문이 없어 검사 생략");
    }
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
  const unclosed = [];
  if (before.unclosedFenceLine !== null)
    unclosed.push(`before 라인 ${before.unclosedFenceLine}`);
  if (after.unclosedFenceLine !== null)
    unclosed.push(`after 라인 ${after.unclosedFenceLine}`);
  check("닫히지 않은 펜스 코드 블록", unclosed.join(", ") || null, "WARN");

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

function compareFiles(beforePath, afterPath) {
  return compare(
    parseDocument(readFileSync(beforePath, "utf8")),
    parseDocument(readFileSync(afterPath, "utf8"))
  );
}

const out = text => process.stdout.write(`${text}\n`);

// ─── 셀프 테스트 ─────────────────────────────────────────────────────────────
// 인라인 픽스처를 임시 디렉터리에 써서 실제 파일 경로로 게이트를 돌린다.
// 기대값은 {판정, FAIL 항목 이름, WARN 항목 이름}이며 순서는 무시한다.

const doc = (...lines) => `${lines.join("\n")}\n`;

const FIXTURE_FRONTMATTER = [
  "---",
  'title: "[번역] 무결성 게이트 픽스처"',
  "pubDatetime: 2026-08-22T00:00:00Z",
  "modDatetime: 2026-08-22T00:00:00Z",
  "draft: true",
  "tags:",
  "  - claude-code",
  "---",
];
const FIXTURE_BODY = [
  "<!-- 요약: 픽스처 -->",
  "",
  "# 제목",
  "",
  "버전 0.1 에서 `pnpm build` 를 실행합니다. [문서](https://example.com/docs)",
  "",
  "## 둘째 절",
  "",
  "```bash",
  "pnpm dev",
  "```",
  "",
  "![그림](./image.png)",
  "",
  "마지막으로 /clear 커맨드와 MY_ENV 변수를 확인합니다.",
];
const FIXTURE = doc(...FIXTURE_FRONTMATTER, "", ...FIXTURE_BODY);
const FIXTURE_NO_BODY = doc(
  "---",
  "title: 본문 없음",
  "pubDatetime: 2026-08-22T00:00:00Z",
  "---"
);
const FIXTURE_FENCE = doc(
  "---",
  "title: 펜스",
  "pubDatetime: 2026-08-22T00:00:00Z",
  "---",
  "",
  "# 제목",
  "",
  "```bash",
  "echo hi",
  "```",
  "",
  "답은 42 입니다."
);

const SELF_TEST_CASES = [
  {
    id: "a",
    name: "동일 파일",
    before: FIXTURE,
    after: FIXTURE,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    id: "b",
    name: "modDatetime, draft 만 변경",
    before: FIXTURE,
    after: FIXTURE.replace(
      "modDatetime: 2026-08-22T00:00:00Z",
      "modDatetime: 2026-08-23T00:00:00Z"
    ).replace("draft: true", "draft: false"),
    expect: {
      pass: true,
      errors: [],
      warnings: ["frontmatter modDatetime", "frontmatter draft"],
    },
  },
  {
    id: "c",
    name: "숫자 0.1→0.2, 헤딩 변경, 끝에 HTML 주석 추가",
    before: FIXTURE,
    after: `${FIXTURE.replace("버전 0.1", "버전 0.2").replace("# 제목", "# 바뀐 제목")}<!-- X -->\n`,
    expect: {
      pass: false,
      errors: ["숫자 토큰", "헤딩 순서·텍스트", "HTML 주석 블록(after 추가)"],
      warnings: [],
    },
  },
  {
    id: "d",
    name: "frontmatter 뒤 빈 줄 제거",
    before: FIXTURE,
    after: doc(...FIXTURE_FRONTMATTER, ...FIXTURE_BODY),
    expect: {
      pass: false,
      errors: ["frontmatter 뒤 빈 줄"],
      warnings: ["빈 줄 수"],
    },
  },
  {
    id: "e",
    name: "본문 없는 frontmatter 전용 파일 쌍",
    before: FIXTURE_NO_BODY,
    after: FIXTURE_NO_BODY,
    expect: { pass: true, errors: [], warnings: ["frontmatter 뒤 빈 줄"] },
  },
  {
    // 닫는 펜스가 사라지면 여는 줄 이후를 산문으로 되돌리므로 숫자 42 는 그대로 PASS,
    // 펜스 개수 1 → 0 만 FAIL 이고 닫히지 않은 펜스는 WARN 으로 라인을 알린다.
    id: "f",
    name: "after 의 닫는 펜스 삭제(닫히지 않은 펜스)",
    before: FIXTURE_FENCE,
    after: FIXTURE_FENCE.replace("echo hi\n```\n", "echo hi\n"),
    expect: {
      pass: false,
      errors: ["펜스 코드 블록"],
      warnings: ["닫히지 않은 펜스 코드 블록"],
      details: [["닫히지 않은 펜스 코드 블록", "after 라인 8"]],
    },
  },
];

function summarize(results) {
  const names = status =>
    results
      .filter(r => r.status === status)
      .map(r => r.name)
      .sort();
  const errors = names("FAIL");
  return { pass: errors.length === 0, errors, warnings: names("WARN") };
}

function checkExpectation(expect, results) {
  const actual = summarize(results);
  const problems = [];
  const verdict = pass => (pass ? "PASS" : "FAIL");
  if (expect.pass !== actual.pass)
    problems.push(`판정 기대 ${verdict(expect.pass)} / 실제 ${verdict(actual.pass)}`);
  for (const [kind, label] of [
    ["errors", "오류"],
    ["warnings", "경고"],
  ]) {
    const want = [...expect[kind]].sort();
    if (JSON.stringify(want) !== JSON.stringify(actual[kind]))
      problems.push(
        `${label} 기대 [${want.join(", ")}] / 실제 [${actual[kind].join(", ")}]`
      );
  }
  for (const [name, needle] of expect.details ?? []) {
    const hit = results.find(r => r.name === name);
    if (!hit || !String(hit.detail).includes(needle))
      problems.push(
        `'${name}' 상세에 '${needle}' 없음 (실제: ${hit ? hit.detail : "(항목 없음)"})`
      );
  }
  return { actual, problems };
}

function runSelfTest() {
  const dir = mkdtempSync(path.join(tmpdir(), "translation-integrity-"));
  const rows = [];
  try {
    for (const tc of SELF_TEST_CASES) {
      const beforePath = path.join(dir, `${tc.id}-before.md`);
      const afterPath = path.join(dir, `${tc.id}-after.md`);
      writeFileSync(beforePath, tc.before, "utf8");
      writeFileSync(afterPath, tc.after, "utf8");
      const results = compareFiles(beforePath, afterPath);
      rows.push({ tc, ...checkExpectation(tc.expect, results) });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  const fmt = s =>
    `${s.pass ? "PASS" : "FAIL"} 오류 ${s.errors.length} 경고 ${s.warnings.length}`;
  out(`셀프 테스트 (${rows.length}건, 임시 디렉터리 ${dir})`);
  out("| 케이스 | 기대 | 실제 | 결과 |");
  out("|---|---|---|---|");
  for (const { tc, actual, problems } of rows) {
    const mark = problems.length ? "❌" : "✅";
    out(`| (${tc.id}) ${tc.name} | ${fmt(tc.expect)} | ${fmt(actual)} | ${mark} |`);
  }
  const failed = rows.filter(r => r.problems.length);
  for (const { tc, problems } of failed) {
    out(`\n(${tc.id}) ${tc.name} 불일치:`);
    for (const problem of problems) out(`  - ${problem}`);
  }
  out(
    failed.length
      ? `\n❌ 셀프 테스트 실패 (${failed.length}/${rows.length})`
      : `\n✅ 셀프 테스트 통과 (${rows.length}/${rows.length})`
  );
  return failed.length ? 1 : 0;
}

// ─── 실행 ───────────────────────────────────────────────────────────────────

function runGate({ before, after, json }) {
  const results = compareFiles(before, after);
  const errors = results.filter(r => r.status === "FAIL");
  const warnings = results.filter(r => r.status === "WARN");
  const pass = errors.length === 0;
  const format = r => `${r.name}: ${r.detail}`;

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
        ? `\n✅ PASS (경고 ${warnings.length}건)`
        : `\n❌ FAIL (오류 ${errors.length}건, 경고 ${warnings.length}건)`
    );
  }
  return pass ? 0 : 1;
}

const args = parseArgs(process.argv.slice(2));
process.exitCode = args.selfTest ? runSelfTest() : runGate(args);
