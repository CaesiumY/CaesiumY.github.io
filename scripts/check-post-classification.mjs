#!/usr/bin/env node

/**
 * 번역글 분류 신호의 무결성 검사.
 *
 * 1) 규칙: "contents/blog/translation/ 디렉터리에 있음" ⟺ "제목이 [번역]로 시작함".
 *    두 신호가 완전히 동치여야 isTranslatedPost(디렉터리 기반)가 올바르게 동작한다.
 *    번역글을 다른 디렉터리에 두거나 접두어를 빠뜨리면 이 검사가 실패한다.
 * 2) 예약 디렉터리: contents/blog/ 아래에 /posts의 정적 라우트와 같은 이름의
 *    디렉터리를 만들면 그 글의 URL(getPath)이 목록 라우트와 겹쳐 도달 불가가 된다.
 *    Astro는 정적 세그먼트를 우선하므로 조용히 묻히기 때문에 여기서 막는다.
 *    예약어는 src/pages/posts/의 라우트 디렉터리에서 파생하므로 탭이 늘어도
 *    이 스크립트를 고칠 필요가 없다.
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
const POSTS_ROUTES = path.join(repoRoot, "src/pages/posts");

// 예약어를 상수로 적어두면 라우트가 늘 때 갱신을 잊는다. 예약의 원인 자체가
// "/posts 아래 정적 라우트 디렉터리의 존재"이므로 그 디렉터리에서 직접 파생한다.
// 대괄호로 시작하는 것([...page], [...slug])은 동적 라우트라 예약어가 아니다.
function reservedDirs() {
  return readdirSync(POSTS_ROUTES, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith("["))
    .map(entry => entry.name);
}

// 발행 대상 md만 수집한다: 파일명이 _로 시작하지 않고, 경로에 _로 시작하는
// 세그먼트(_samples 등)가 없는 .md. 주의: 로더와 다르다 — 로더 패턴
// (**/[^_]*.md)는 파일명만 거르고 디렉터리는 거르지 않으므로 _samples/의
// 글도 컬렉션에는 포함된다. 이 스크립트는 _로 시작하는 디렉터리까지 건너뛰어
// 발행 대상 트리만 본다.
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

const reserved = reservedDirs();

for (const name of reserved) {
  if (existsSync(path.join(BLOG, name))) {
    errors.push(
      `  예약된 이름의 글 디렉터리: contents/blog/${name}/ — /posts/${name} 목록 라우트와 URL이 충돌해 이 디렉터리의 글은 접근할 수 없게 된다`
    );
  }
}

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
  process.stderr.write(`❌ 게시글 분류 검사 실패 (${errors.length}건):\n`);
  process.stderr.write(errors.join("\n") + "\n");
  process.stderr.write(
    `\n번역글은 contents/blog/translation/ 아래에 두고 제목을 "${TITLE_PREFIX}"로 시작해야 합니다(두 신호는 동치).\n` +
      `/posts 아래 정적 라우트 이름(${reserved.join(", ")})은 글 디렉터리 이름으로 쓸 수 없습니다.\n`
  );
  process.exit(1);
}

const translationCount = allPosts.filter(f =>
  f.startsWith(TRANSLATION_DIR + path.sep)
).length;
process.stdout.write(
  `✅ 번역글 분류 신호 일관성 OK: translation/ 디렉터리 ${translationCount}편 == [번역] 접두어 ${translationCount}편\n`
);
