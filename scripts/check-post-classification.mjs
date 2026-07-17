#!/usr/bin/env node

/**
 * 번역글 분류 신호의 무결성 검사.
 *
 * 규칙: "contents/blog/translation/ 디렉터리에 있음" ⟺ "제목이 [번역]로 시작함".
 * 두 신호가 완전히 동치여야 isTranslatedPost(디렉터리 기반)가 올바르게 동작한다.
 * 번역글을 다른 디렉터리에 두거나 접두어를 빠뜨리면 이 검사가 실패한다.
 *
 * Exit codes: 0 = 일관됨, 1 = 불일치.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const BLOG = path.join(repoRoot, "contents/blog");
const TRANSLATION_DIR = path.join(BLOG, "translation");
const TITLE_PREFIX = "[번역]";

// 발행 대상 md만 수집한다: 파일명이 _로 시작하지 않고, 경로에 _로 시작하는
// 세그먼트(_samples 등)가 없는 .md. content.config.ts의 로더 규칙과 동일하다.
function collectPosts(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPosts(full, acc);
    } else if (entry.name.endsWith(".md")) {
      acc.push(full);
    }
  }
  return acc;
}

function titleStartsWithPrefix(file) {
  const content = readFileSync(file, "utf8");
  const match = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const title = match ? match[1] : "";
  return title.startsWith(TITLE_PREFIX);
}

const allPosts = collectPosts(BLOG);
const errors = [];

for (const file of allPosts) {
  const rel = path.relative(BLOG, file).split(path.sep).join("/");
  const inTranslationDir =
    existsSync(TRANSLATION_DIR) &&
    file.startsWith(TRANSLATION_DIR + path.sep) &&
    statSync(file).isFile();
  const hasPrefix = titleStartsWithPrefix(file);

  if (inTranslationDir && !hasPrefix) {
    errors.push(`  translation/ 디렉터리인데 제목에 "${TITLE_PREFIX}" 없음: ${rel}`);
  }
  if (!inTranslationDir && hasPrefix) {
    errors.push(`  제목이 "${TITLE_PREFIX}"인데 translation/ 밖에 있음: ${rel}`);
  }
}

if (errors.length > 0) {
  // eslint-disable-next-line no-console -- CLI tool: must report errors to stderr
  console.error(`❌ 번역글 분류 신호 불일치 (${errors.length}건):`);
  // eslint-disable-next-line no-console -- CLI tool: must report errors to stderr
  console.error(errors.join("\n"));
  // eslint-disable-next-line no-console -- CLI tool: must report errors to stderr
  console.error(
    `\n디렉터리(contents/blog/translation/)와 제목 [번역] 접두어는 완전히 동치여야 합니다.`
  );
  process.exit(1);
}

const translationCount = allPosts.filter(f =>
  f.startsWith(TRANSLATION_DIR + path.sep)
).length;
// eslint-disable-next-line no-console -- CLI tool: must report results to stdout
console.log(
  `✅ 번역글 분류 신호 일관성 OK: translation/ 디렉터리 ${translationCount}편 == [번역] 접두어 ${translationCount}편`
);
