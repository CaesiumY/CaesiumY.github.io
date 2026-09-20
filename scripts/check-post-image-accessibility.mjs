#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 이미지 바로 뒤의 가시 캡션이 alt 텍스트를 그대로 반복하는지 찾습니다.
 */
export function findDuplicateAltCaptions(markdown) {
  const lines = markdown.split(/\r?\n/);
  const duplicates = [];
  let fence = null;

  for (let index = 0; index < lines.length; index++) {
    if (fence) {
      const closingFence = lines[index].match(
        /^ {0,3}(`{3,}|~{3,})[ \t]*$/
      );
      if (
        closingFence?.[1][0] === fence.character &&
        closingFence[1].length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    const openingFence = lines[index].match(/^ {0,3}(`{3,}|~{3,})/);
    if (openingFence) {
      const marker = openingFence[1];
      fence = { character: marker[0], length: marker.length };
      continue;
    }

    const image = lines[index].match(/^!\[([^\]]*)\]\(.+\)\s*$/);
    if (!image?.[1]) continue;

    let captionIndex = index + 1;
    while (captionIndex < lines.length && lines[captionIndex].trim() === "") {
      captionIndex++;
    }

    if (lines[captionIndex]?.trim() === image[1].trim()) {
      duplicates.push({
        imageLine: index + 1,
        captionLine: captionIndex + 1,
        text: image[1].trim(),
      });
    }
  }

  return duplicates;
}

function collectMarkdownFiles(target, files = []) {
  if (statSync(target).isFile()) {
    if (target.endsWith(".md")) files.push(target);
    return files;
  }

  for (const entry of readdirSync(target, { withFileTypes: true })) {
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function run(targets) {
  const failures = [];

  for (const target of targets) {
    for (const file of collectMarkdownFiles(path.resolve(target))) {
      for (const duplicate of findDuplicateAltCaptions(
        readFileSync(file, "utf8")
      )) {
        failures.push({ file, ...duplicate });
      }
    }
  }

  if (failures.length > 0) {
    process.stderr.write(
      `❌ 이미지 alt/캡션 중복 검사 실패 (${failures.length}건):\n`
    );
    for (const failure of failures) {
      const relative = path.relative(process.cwd(), failure.file);
      process.stderr.write(
        `  ${relative}:${failure.imageLine} (캡션 ${failure.captionLine}행) ${failure.text}\n`
      );
    }
    process.stderr.write(
      "\n인접 캡션이 이미지를 설명하면 Markdown 이미지의 alt를 비우세요: ![](url)\n"
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write("✅ 이미지 alt/캡션 중복 없음\n");
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );
  const targets = process.argv.slice(2);
  run(targets.length > 0 ? targets : [path.join(repoRoot, "contents/blog")]);
}
