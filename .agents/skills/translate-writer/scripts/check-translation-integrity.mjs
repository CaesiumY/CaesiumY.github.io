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
 *   - 헤딩 순서·텍스트 불일치 — ATX(`# 제목`)와 setext(`제목` + `===`/`---` 밑줄)
 *     모두 인식, setext 는 `# 텍스트`/`## 텍스트`로 정규화해 비교
 *   - 이미지 경로 목록 불일치 — `![alt](dest "title")` 의 dest 는 균형 괄호를 허용
 *     (`./a_(1).png`), `<...>` 꺾쇠 목적지도 허용, 제목은 경로에서 제외
 *   - 펜스 코드 블록 내용·순서 불일치 — 닫는 펜스는 여는 펜스와 같은 문자(` 또는 ~)에
 *     같거나 긴 길이, 들여쓰기 0~3칸만 인정(4칸 이상 들여쓴 ``` 는 코드 내용)
 *   - 인라인 코드 스팬 다중집합 불일치 — 백틱 n개로 열면 정확히 n개짜리 런으로만
 *     닫힘(``foo`bar`` 지원), 닫히지 않은 런은 텍스트
 *   - 링크 목적지 다중집합 불일치 — 인라인 `[text](dest)`(상대 경로 포함) · 자동링크
 *     `<https://…>` · 맨 URL · 참조형 `[text][id]`(`[id]`로 기록) · 정의 `[id]: dest`
 *   - 숫자 토큰 다중집합 불일치 — 부호 · % · 단위 · 한국어 수량 접미 포함(아래 참조)
 *   - 슬래시 커맨드(/clear 등) · 환경변수(대문자_언더스코어) 토큰 다중집합 불일치
 *   - details · summary 태그 수 불일치
 *   - after에만 있는 HTML 주석 블록
 *   - 미종결 HTML 주석 — `<!--` 뒤에 `-->` 가 없음(라인 번호 보고, 인라인 코드 제외)
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
 * 숫자 토큰: `[-+]?숫자(.,)` + 선택적 접미. 부호는 숫자 바로 앞의 `-`/`+` 가 공백 ·
 * 줄 시작 · 여는 괄호 뒤에 올 때만 취한다(범위 `3-5`, 날짜 `2026-08-22`, 목록 `- `,
 * 표 `|---|` 는 부호가 아님). 접미는 한국어 조사와 섞이지 않게 화이트리스트만 인정한다:
 *   `%` · ASCII 단위 ms s x k K M KB MB GB px pt(뒤에 영숫자가 없을 때) ·
 *   한국어 수량 접미 만 천 억 배 자 턴 개 줄 분 초 시간 번 회 건 명 일 주 월 년
 * 예: "99.9%"→`99.9%`, "600ms"→`600ms`, "0.1배만"→`0.1배`, "3만 자"→`3만`,
 *     "40번째"→`40번`, "200토큰"→`200`, "v2.1.221"→`2.1.221`.
 *
 * 토큰 집계 범위: frontmatter 제외, 펜스 코드 블록은 별도 비교 후 본문에서 제외,
 * 인라인 코드 · 링크 목적지 · 이미지 경로도 각자 비교한 뒤 산문 토큰 집계에서 뺀다.
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
  if (files.length !== 2)
    usage("before.md 와 after.md 두 파일 경로가 필요합니다");
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
  const { fences, proseLines, proseLineIndex, unclosedAt } =
    extractFences(bodyLines);
  const prose = proseLines.join("\n");
  // 산문 문자열 오프셋 → 파일 라인 번호(1부터). 펜스를 뺀 산문이라 원래 줄로 되돌린다.
  const fileLineAt = offset => {
    const proseLine = prose.slice(0, offset).split("\n").length - 1;
    return bodyStart + proseLineIndex[proseLine] + 1;
  };
  const unterminatedAt = findUnterminatedComment(prose);

  return {
    text,
    hasFrontmatter,
    hasBody,
    frontmatter,
    blankAfterFrontmatter,
    fences,
    unclosedFenceLine: unclosedAt === null ? null : bodyStart + unclosedAt + 1,
    unterminatedCommentLine:
      unterminatedAt === null ? null : fileLineAt(unterminatedAt),
    headings: collectHeadings(proseLines),
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

// CommonMark 대로 펜스 앞 공백은 0~3칸만 허용한다. 여는 쪽은 4칸 이상이면 들여쓴
// 코드 블록이라 산문 취급, 닫는 쪽은 4칸 이상이면 코드 내용이지 닫는 펜스가 아니다.
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE_RE = /^ {0,3}(`{3,}|~{3,})\s*$/;

// 펜스 코드 블록(``` 또는 ~~~)을 순서대로 뽑아내고 본문에서 제거한다.
// proseLineIndex[i] 는 proseLines[i] 가 lines 의 몇 번째 줄인지(자리 표시 줄은 -1).
function extractFences(lines) {
  const fences = [];
  const proseLines = [];
  const proseLineIndex = [];
  const pushProse = (line, index) => {
    proseLines.push(line);
    proseLineIndex.push(index);
  };
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
        pushProse(line, i);
      }
      continue;
    }
    buffer.push(line);
    const closing = line.match(FENCE_CLOSE_RE);
    if (
      closing &&
      closing[1][0] === open[0] &&
      closing[1].length >= open.length
    ) {
      fences.push(buffer.join("\n"));
      // 펜스 자리에 빈 줄 하나를 남겨, 펜스 앞 산문과 펜스 뒤 `---` 가 붙어
      // setext 헤딩으로 오인되지 않게 한다.
      pushProse("", -1);
      open = null;
      openAt = null;
      buffer = [];
    }
  }
  // 닫히지 않은 펜스는 블록으로 접지 않는다. 나머지를 통째로 코드로 숨기면 그 뒤의
  // 산문 변경이 게이트를 그냥 통과하므로, 산문으로 돌려보내고 WARN 으로 알린다.
  if (open !== null) buffer.forEach((line, k) => pushProse(line, openAt + k));
  return {
    fences,
    proseLines,
    proseLineIndex,
    unclosedAt: open === null ? null : openAt,
  };
}

// ─── 헤딩 ───────────────────────────────────────────────────────────────────

const ATX_HEADING_RE = /^#{1,6}\s+\S/;
const SETEXT_UNDERLINE_RE = /^ {0,3}(=+|-+)\s*$/;
// setext 밑줄 위 줄이 이런 모양이면 문단이 아니므로 헤딩이 아니다
// (ATX 헤딩 · 표 · 인용 · 목록 마커 · 4칸 들여쓴 코드).
const NOT_PARAGRAPH_RE = /^(?: {0,3}(?:#|\||>|[-*+]\s|\d{1,9}[.)]\s)| {4,})/;

// ATX 헤딩은 줄 그대로, setext 헤딩(문단 줄 + `===`/`---`)은 `# 텍스트`/`## 텍스트`로
// 정규화해 한 시퀀스로 모은다. 빈 줄 뒤의 `---` 는 수평선이라 헤딩이 아니다.
function collectHeadings(proseLines) {
  const headings = [];
  for (let i = 0; i < proseLines.length; i++) {
    const line = proseLines[i];
    if (ATX_HEADING_RE.test(line)) {
      headings.push(line);
      continue;
    }
    const underline = line.match(SETEXT_UNDERLINE_RE);
    if (!underline || i === 0) continue;
    const above = proseLines[i - 1];
    if (
      above.trim() === "" ||
      NOT_PARAGRAPH_RE.test(above) ||
      SETEXT_UNDERLINE_RE.test(above) ||
      FENCE_OPEN_RE.test(above)
    )
      continue;
    const level = underline[1][0] === "=" ? 1 : 2;
    headings.push(`${"#".repeat(level)} ${above.trim()}`);
  }
  return headings;
}

// ─── 인라인 구문 스캔 ────────────────────────────────────────────────────────
// 링크 · 이미지 · 코드 스팬은 정규식 대신 스캔 파서로 읽는다. 정규식은 첫 `)` 나
// 첫 백틱에서 끊겨 `./a_(1).png` 나 ``foo`bar`` 를 잘라 먹기 때문이다.

const AUTOLINK_RE = /<(https?:\/\/[^>\s]+)>/g;
const BARE_URL_RE = /https?:\/\/[^\s<>)\]]+/g;
const COMMENT_RE = /<!--[\s\S]*?-->/g;
// 참조 링크 정의 `[id]: dest` — 한국어 산문의 `[역주]: 설명…` 과 섞이지 않게
// dest 가 `<…>` 이거나 경로·URL 꼴(`/` `.` `#` 포함)일 때만 정의로 본다.
const LINK_DEFINITION_RE =
  /^ {0,3}\[((?:[^\]\\\n]|\\.)+)\]:[ \t]*(<[^>\n]*>|\S*[/.#]\S*)(?=\s|$)/gm;

// [start, end) 구간들을 replacer 결과로 바꾼다. ranges 는 시작 오프셋 오름차순이어야 한다.
function replaceRanges(text, ranges, replacer) {
  let out = "";
  let last = 0;
  for (const range of ranges) {
    out += text.slice(last, range.start) + replacer(range);
    last = range.end;
  }
  return out + text.slice(last);
}

function skipSpaces(text, from) {
  let p = from;
  while (p < text.length && /[ \t\n]/.test(text[p])) p++;
  return p;
}

// `(` 바로 뒤(from)부터 목적지 · 선택적 제목 · `)` 를 읽는다.
// 목적지는 균형 괄호를 허용하고 공백에서 끝나며, `<…>` 꺾쇠 목적지는 공백도 허용한다.
// 반환 {value, end(닫는 `)` 다음 오프셋)}, 구문이 아니면 null.
function readDestination(text, from) {
  let p = skipSpaces(text, from);
  let value;
  if (text[p] === "<") {
    const close = text.indexOf(">", p + 1);
    if (close === -1 || text.slice(p, close).includes("\n")) return null;
    value = text.slice(p + 1, close);
    p = close + 1;
  } else {
    const start = p;
    let depth = 0;
    for (; p < text.length; p++) {
      const ch = text[p];
      if (ch === "\\") {
        p++;
        continue;
      }
      if (/\s/.test(ch)) break;
      if (ch === "(") depth++;
      else if (ch === ")") {
        if (depth === 0) break;
        depth--;
      }
    }
    if (depth !== 0) return null;
    value = text.slice(start, p);
  }
  p = skipSpaces(text, p);
  const quote = text[p];
  if (quote === '"' || quote === "'" || quote === "(") {
    const close = text.indexOf(quote === "(" ? ")" : quote, p + 1);
    if (close === -1) return null;
    p = skipSpaces(text, close + 1);
  }
  return text[p] === ")" ? { value, end: p + 1 } : null;
}

// start 의 `[` 에서 시작하는 인라인 링크 `[label](dest)` 또는 참조 링크
// `[label][id]` / `[label][]` 를 읽는다. label 안의 대괄호는 중첩을 센다.
function readBracketLink(text, start) {
  let depth = 0;
  let j = start;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (ch === "\\") {
      j++;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) break;
    else if (ch === "\n" && text[j + 1] === "\n") return null;
  }
  if (j >= text.length) return null;
  const label = text.slice(start + 1, j);
  if (text[j + 1] === "(") {
    const dest = readDestination(text, j + 2);
    return dest && { kind: "inline", label, dest: dest.value, end: dest.end };
  }
  if (text[j + 1] === "[") {
    const close = text.indexOf("]", j + 2);
    if (close === -1) return null;
    const ref = text.slice(j + 2, close);
    if (ref.includes("[") || ref.includes("\n\n")) return null;
    return {
      kind: "reference",
      label,
      ref: normalizeLabel(ref.trim() === "" ? label : ref),
      end: close + 1,
    };
  }
  return null;
}

// CommonMark 참조 레이블 정규화(공백 접기 · 대소문자 무시).
function normalizeLabel(label) {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

// kind === "image" 면 `![` 로 시작하는 구문만, "link" 면 `!` 없는 `[` 구문만 찾는다.
// 반환 [{start, end, kind, label, dest|ref}] (시작 오프셋 오름차순, 겹침 없음).
function findLinkLike(text, kind) {
  const found = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "[") {
      const bang = i > 0 && text[i - 1] === "!" && text[i - 2] !== "\\";
      const hit = (kind === "image") === bang && readBracketLink(text, i);
      if (hit) {
        found.push({ ...hit, start: bang ? i - 1 : i });
        i = hit.end;
        continue;
      }
    }
    i++;
  }
  return found;
}

// from 부터 길이가 정확히 n 인 백틱 런의 시작 오프셋. 줄이 끝나면 포기(-1).
function findBacktickRun(text, from, n) {
  let j = from;
  while (j < text.length) {
    if (text[j] === "\n") return -1;
    if (text[j] !== "`") {
      j++;
      continue;
    }
    let m = 0;
    while (text[j + m] === "`") m++;
    if (m === n) return j;
    j += m;
  }
  return -1;
}

// 코드 스팬: 백틱 n개로 열면 정확히 n개짜리 런으로만 닫힌다(CommonMark).
// 닫는 런이 없는 백틱 런은 텍스트로 두고 그 뒤부터 계속 찾는다. 스팬 안에서는
// 역슬래시 이스케이프가 통하지 않는다.
function findInlineCode(text) {
  const spans = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (text[i] !== "`") {
      i++;
      continue;
    }
    let n = 0;
    while (text[i + n] === "`") n++;
    const close = findBacktickRun(text, i + n, n);
    if (close === -1) {
      i += n;
      continue;
    }
    spans.push({ start: i, end: close + n, content: text.slice(i + n, close) });
    i = close + n;
  }
  return spans;
}

function stripAngles(dest) {
  return dest.startsWith("<") && dest.endsWith(">") ? dest.slice(1, -1) : dest;
}

// ─── 수집 ───────────────────────────────────────────────────────────────────

function collectImages(prose) {
  return findLinkLike(prose, "image").map(m => ({
    alt: m.label,
    src: m.kind === "inline" ? m.dest : `[${m.ref}]`,
  }));
}

function collectInlineCode(prose) {
  return findInlineCode(prose).map(span => span.content);
}

// 링크 목적지 다중집합: 인라인 링크 dest(상대 경로 포함) · 참조 링크 `[id]` ·
// 정의 `[id]: dest` 의 dest · 자동링크 · 맨 URL. 이미지는 먼저 지워 중복 집계를 막는다.
function collectLinks(prose) {
  const urls = [];
  let rest = replaceRanges(prose, findLinkLike(prose, "image"), () => " ");
  rest = rest.replace(LINK_DEFINITION_RE, (_, _label, dest) => {
    urls.push(stripAngles(dest));
    return " ";
  });
  rest = replaceRanges(rest, findLinkLike(rest, "link"), hit => {
    urls.push(hit.kind === "inline" ? hit.dest : `[${hit.ref}]`);
    return " ";
  }).replace(AUTOLINK_RE, (_, url) => {
    urls.push(url);
    return " ";
  });
  for (const m of rest.matchAll(BARE_URL_RE)) urls.push(m[0]);
  return urls;
}

function collectComments(prose) {
  return [...prose.matchAll(COMMENT_RE)].map(m => m[0].trim());
}

// `<!--` 뒤에 `-->` 가 없는 첫 위치(산문 오프셋). 인라인 코드 안의 `<!--` 는 텍스트라
// 길이를 유지한 채 공백으로 가린다(오프셋 보존). 없으면 null.
function findUnterminatedComment(prose) {
  const masked = replaceRanges(prose, findInlineCode(prose), span =>
    " ".repeat(span.end - span.start)
  );
  let from = 0;
  for (;;) {
    const open = masked.indexOf("<!--", from);
    if (open === -1) return null;
    const close = masked.indexOf("-->", open + 4);
    if (close === -1) return open;
    from = close + 3;
  }
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

// 숫자 토큰 = [부호]숫자(.,)[접미]. 부호는 공백 · 문자열 시작 · 여는 괄호 뒤의 `-`/`+` 만
// (범위 `3-5`, 날짜 `2026-08-22`, 목록 `- `, 표 `|---|` 는 부호가 아님). 접미는 한국어
// 조사와 섞이지 않게 화이트리스트만: % · ASCII 단위(뒤에 영숫자가 없을 때) · 수량 접미.
const NUMBER_SUFFIX = [
  "%",
  "(?:ms|px|pt|KB|MB|GB|[skxKM])(?![A-Za-z0-9])",
  "시간",
  "[만천억배자턴개줄분초번회건명일주월년]",
].join("|");
const NUMBER_RE = new RegExp(
  String.raw`(?:(?<=^|[\s(\[{])[-+])?\d+(?:[.,]\d+)*(?:${NUMBER_SUFFIX})?`,
  "g"
);

// 산문 토큰: 주석 · 인라인 코드 · 이미지 · 링크 정의 · 링크 목적지 · URL 을 뺀 나머지에서
// 숫자와 슬래시 커맨드 · 환경변수를 센다. 링크 텍스트는 산문이므로 남긴다.
function collectProseTokens(prose) {
  let plain = prose.replace(COMMENT_RE, " ");
  plain = replaceRanges(plain, findInlineCode(plain), () => " ");
  plain = replaceRanges(plain, findLinkLike(plain, "image"), () => " ");
  plain = plain.replace(LINK_DEFINITION_RE, " ");
  plain = replaceRanges(
    plain,
    findLinkLike(plain, "link"),
    hit => ` ${hit.label} `
  )
    .replace(AUTOLINK_RE, " ")
    .replace(BARE_URL_RE, " ");
  const numbers = plain.match(NUMBER_RE) ?? [];
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
    if (missing.length)
      keyDiff.push(`after에서 사라진 키 ${missing.join(", ")}`);
    if (added.length) keyDiff.push(`after에만 있는 키 ${added.join(", ")}`);
    check("frontmatter 키 집합", keyDiff.join(", ") || null);

    for (const key of keysA) {
      if (!after.frontmatter.has(key)) continue;
      const a = before.frontmatter.get(key);
      const b = after.frontmatter.get(key);
      if (a === b) continue;
      const level = WARN_KEYS.has(key) ? "WARN" : "FAIL";
      const label =
        FAIL_KEYS.has(key) || WARN_KEYS.has(key) ? "" : " (보호 키 외)";
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
  check(
    "슬래시 커맨드·환경변수 토큰",
    diffMultiset(before.commands, after.commands)
  );

  // 태그·주석
  const tagDiff = Object.keys(before.detailsTags)
    .filter(tag => before.detailsTags[tag] !== after.detailsTags[tag])
    .map(
      tag => `${tag} ${before.detailsTags[tag]} → ${after.detailsTags[tag]}`
    );
  check("details·summary 태그 수", tagDiff.join(", ") || null);

  const addedComments = [];
  const removedComments = [];
  for (const [comment, count] of after.comments) {
    const other = before.comments.get(comment) ?? 0;
    if (count > other)
      addedComments.push(`${truncate(comment)}×${count - other}`);
  }
  for (const [comment, count] of before.comments) {
    const other = after.comments.get(comment) ?? 0;
    if (count > other)
      removedComments.push(`${truncate(comment)}×${count - other}`);
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
  const unterminated = [];
  if (before.unterminatedCommentLine !== null)
    unterminated.push(`before 라인 ${before.unterminatedCommentLine}`);
  if (after.unterminatedCommentLine !== null)
    unterminated.push(`after 라인 ${after.unterminatedCommentLine}`);
  check("미종결 HTML 주석", unterminated.join(", ") || null);

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
// details 는 [항목 이름, 상세에 들어 있어야 하는 문자열] 쌍으로 차이 내용까지 고정한다.
// 각 회귀 케이스는 "정상 입력은 PASS" 와 "수정 전이라면 통과했을 변조는 FAIL" 을 짝으로 둔다.

const doc = (...lines) => `${lines.join("\n")}\n`;
const fixture = (title, ...body) =>
  doc(
    "---",
    `title: ${title}`,
    "pubDatetime: 2026-08-22T00:00:00Z",
    "---",
    "",
    ...body
  );

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
const FIXTURE_FENCE = fixture(
  "펜스",
  "# 제목",
  "",
  "```bash",
  "echo hi",
  "```",
  "",
  "답은 42 입니다."
);
// 1: alt · 제목 · 경로 모두에 괄호, 2: 꺾쇠 목적지(공백 포함 경로).
const FIXTURE_PAREN_IMAGE = fixture(
  "괄호 이미지",
  "# 제목",
  "",
  '![스크린샷 (1)](./shot_(1).png "캡처 (첫째)")',
  "",
  "![둘째](<./my shot (2).png>)",
  "",
  "본문입니다."
);
// 부호 · % · 단위 · 수량 접미 · 버전 · 날짜 · 범위 · 목록 대시 · 표 구분선을 한 번에.
const FIXTURE_NUMBERS = fixture(
  "숫자 접미",
  "# 제목",
  "",
  "가동률 99.9%, 지연 600ms, 증분 -1, 상한 +5 입니다.",
  "",
  "컨텍스트의 0.1배만 들어갑니다. 3만 자, 40번째, 200토큰, v2.1.221, 2026-08-22, 범위 3-5개.",
  "",
  "- 1번 항목",
  "",
  "| 항목 | 값 |",
  "|---|---|",
  "| 온도 | -5 |"
);
// setext H1 · 빈 줄 뒤 `---`(수평선) · setext H2 · 펜스 바로 뒤 `---`(수평선).
const FIXTURE_SETEXT = fixture(
  "setext 헤딩",
  "제목",
  "===",
  "",
  "첫 문단입니다.",
  "",
  "---",
  "",
  "둘째 절",
  "---",
  "",
  "```bash",
  "echo hi",
  "```",
  "---",
  "",
  "끝 문단입니다."
);
const FIXTURE_BACKTICK = fixture(
  "다중 백틱",
  "# 제목",
  "",
  "``foo`bar`` 와 `baz` 를 씁니다. 홀로 남은 ` 백틱은 텍스트입니다."
);
// 4중 백틱 펜스 안에 4칸 들여쓴 ``` · 다른 문자 ~~~ · 짧은 ``` 가 모두 코드 내용.
const FIXTURE_FENCE_INDENT = fixture(
  "닫는 펜스 들여쓰기",
  "# 제목",
  "",
  "````md",
  "예시:",
  "    ```",
  "    echo inner",
  "    ```",
  "~~~",
  "```",
  "echo after",
  "````",
  "",
  "블록 뒤 문장 42."
);
const FIXTURE_COMMENT_CODE = fixture(
  "인라인 코드 속 주석 기호",
  "# 제목",
  "",
  "`<!--` 는 HTML 주석의 시작 기호입니다."
);
const FIXTURE_REFLINK = fixture(
  "참조 링크",
  "# 제목",
  "",
  "[문서][docs] 와 [가이드](../guide) 와 [홈][] 을 보세요.",
  "",
  "[docs]: ./docs/guide.md",
  '[홈]: https://example.com/ "홈"'
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
  {
    id: "g",
    name: "괄호 포함 이미지 경로 동일",
    before: FIXTURE_PAREN_IMAGE,
    after: FIXTURE_PAREN_IMAGE,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 첫 `)` 에서 끊던 정규식은 `./shot_(1` 까지만 경로로 봐서 확장자 변조를 놓쳤다.
    id: "h",
    name: "괄호 뒤 확장자 변조 ./shot_(1).png → .jpg",
    before: FIXTURE_PAREN_IMAGE,
    after: FIXTURE_PAREN_IMAGE.replace("./shot_(1).png", "./shot_(1).jpg"),
    expect: {
      pass: false,
      errors: ["이미지 경로"],
      warnings: [],
      details: [
        ["이미지 경로", "before './shot_(1).png' / after './shot_(1).jpg'"],
      ],
    },
  },
  {
    // 조사만 바뀐 변화(배만→배가, 자→자를, 째→째로, 토큰,→토큰으로, 3-5→3~5)는 PASS.
    id: "i",
    name: "숫자 뒤 조사만 변경",
    before: FIXTURE_NUMBERS,
    after: FIXTURE_NUMBERS.replace("0.1배만 들어갑니다", "0.1배가 들어갑니다")
      .replace("3만 자,", "3만 자를,")
      .replace("40번째,", "40번째로,")
      .replace("200토큰,", "200토큰으로,")
      .replace("범위 3-5개", "범위 3~5개"),
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 숫자만 세던 때는 99.9%→99.9, -1→1, 600ms→600s 가 전부 통과했다.
    id: "j",
    name: "% · 부호 · 단위 탈락",
    before: FIXTURE_NUMBERS,
    after: FIXTURE_NUMBERS.replace("99.9%", "99.9")
      .replace("증분 -1", "증분 1")
      .replace("600ms", "600s"),
    expect: {
      pass: false,
      errors: ["숫자 토큰"],
      warnings: [],
      details: [
        ["숫자 토큰", "'99.9%'×1"],
        ["숫자 토큰", "'-1'×1"],
        ["숫자 토큰", "'600ms'×1"],
        ["숫자 토큰", "after에만 '99.9'×1, '600s'×1, '1'×1"],
      ],
    },
  },
  {
    id: "k",
    name: "setext 헤딩 · 수평선 동일",
    before: FIXTURE_SETEXT,
    after: FIXTURE_SETEXT,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 수평선 앞 문단 변경은 헤딩이 아니라 무시되고, setext H2 텍스트 변경만 잡혀야 한다
    // (수평선을 헤딩으로 오인하면 첫 불일치가 '## 첫 문단…' 으로 나와 details 가 깨진다).
    id: "l",
    name: "setext H2 텍스트 변조",
    before: FIXTURE_SETEXT,
    after: FIXTURE_SETEXT.replace(
      "첫 문단입니다.",
      "첫 문단을 고쳤습니다."
    ).replace("둘째 절\n---", "둘째 절 수정\n---"),
    expect: {
      pass: false,
      errors: ["헤딩 순서·텍스트"],
      warnings: [],
      details: [
        [
          "헤딩 순서·텍스트",
          "2번째: before '## 둘째 절' / after '## 둘째 절 수정'",
        ],
      ],
    },
  },
  {
    id: "m",
    name: "다중 백틱 코드 스팬 동일",
    before: FIXTURE_BACKTICK,
    after: FIXTURE_BACKTICK,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 첫 백틱에서 닫던 정규식은 ``foo`bar`` 를 'foo' 로 읽어 bar→baz 를 놓쳤다.
    id: "n",
    name: "``foo`bar`` → ``foo`baz``",
    before: FIXTURE_BACKTICK,
    after: FIXTURE_BACKTICK.replace("``foo`bar``", "``foo`baz``"),
    expect: {
      pass: false,
      errors: ["인라인 코드 스팬"],
      warnings: [],
      details: [
        ["인라인 코드 스팬", "before에만 'foo`bar'×1, after에만 'foo`baz'×1"],
      ],
    },
  },
  {
    id: "o",
    name: "4칸 들여쓴 ``` 를 품은 펜스 동일",
    before: FIXTURE_FENCE_INDENT,
    after: FIXTURE_FENCE_INDENT,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 들여쓴 ``` · ~~~ · 짧은 ``` 중 하나라도 닫는 펜스로 오인하면 'echo after' 가 산문이 되어
    // 변조가 통과하거나 두 번째 펜스가 열린 채 남아 WARN 이 생긴다.
    id: "p",
    name: "펜스 끝자락 코드 변조",
    before: FIXTURE_FENCE_INDENT,
    after: FIXTURE_FENCE_INDENT.replace("echo after", "echo changed"),
    expect: { pass: false, errors: ["펜스 코드 블록"], warnings: [] },
  },
  {
    id: "q",
    name: "인라인 코드 속 `<!--` 는 미종결 주석이 아님",
    before: FIXTURE_COMMENT_CODE,
    after: FIXTURE_COMMENT_CODE,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // 닫는 --> 가 잘리면 주석 블록 비교에서는 '제거' WARN 만 나와 통과했다.
    id: "r",
    name: "요약 주석의 닫는 --> 삭제",
    before: FIXTURE,
    after: FIXTURE.replace("<!-- 요약: 픽스처 -->", "<!-- 요약: 픽스처"),
    expect: {
      pass: false,
      errors: ["미종결 HTML 주석"],
      warnings: ["HTML 주석 블록(before 제거)"],
      details: [["미종결 HTML 주석", "after 라인 10"]],
    },
  },
  {
    id: "s",
    name: "참조 링크 · 정의 · 상대 경로 동일",
    before: FIXTURE_REFLINK,
    after: FIXTURE_REFLINK,
    expect: { pass: true, errors: [], warnings: [] },
  },
  {
    // http 가 아닌 정의 dest 와 [text][id] 참조는 예전 수집기에 잡히지 않아 통과했다.
    id: "t",
    name: "정의 dest 변조 + 참조 링크 삭제",
    before: FIXTURE_REFLINK,
    after: FIXTURE_REFLINK.replace(
      "./docs/guide.md",
      "./docs/intro.md"
    ).replace("[문서][docs]", "문서"),
    expect: {
      pass: false,
      errors: ["링크 URL"],
      warnings: [],
      details: [
        ["링크 URL", "'./docs/guide.md'×1"],
        ["링크 URL", "'[docs]'×1"],
        ["링크 URL", "after에만 './docs/intro.md'×1"],
      ],
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
    problems.push(
      `판정 기대 ${verdict(expect.pass)} / 실제 ${verdict(actual.pass)}`
    );
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
    out(
      `| (${tc.id}) ${tc.name} | ${fmt(tc.expect)} | ${fmt(actual)} | ${mark} |`
    );
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
      out(
        `  ${icon[r.status]} ${r.status} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`
      );
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
