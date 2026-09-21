#!/usr/bin/env node

import {
  readFileSync,
  lstatSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { maskCodeRegions } from "../src/utils/markdownCodeRegions.ts";

const PLACEHOLDER = /\uE000(\d+)\uE000/g;
const INLINE_IMAGE =
  /!\[([^\]]*)\]\(\s*(<[^>\r\n]+>|[^\s)]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
const HTML_IMAGE = /<img\b/i;
const SUPPORTED_KINDS = new Set([
  "original",
  "localized-redraw",
  "source-copy",
]);

/**
 * 코드 영역을 가리되, 원문과 같은 줄 번호를 유지합니다.
 *
 * maskCodeRegions()는 코드 블록 전체를 하나의 자리표시자로 줄여 정규식이
 * 예시를 건드리지 않게 합니다. 여기서는 자리표시자를 원래 코드가 포함하던
 * 개행 수만큼 다시 늘려, 이미지 오류의 행 번호가 원문과 일치하도록 합니다.
 */
function maskCodeRegionsKeepingLines(markdown) {
  const { masked, restore } = maskCodeRegions(markdown);

  return masked.replace(PLACEHOLDER, token => {
    const original = restore(token);
    const lineBreaks = original.match(/\n/g)?.length ?? 0;
    return `${token}${"\n".repeat(lineBreaks)}`;
  });
}

function imageTarget(destination) {
  const trimmed = destination.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Markdown 본문에서 코드 영역 밖의 인라인 이미지 참조를 찾습니다.
 *
 * @returns {Array<{file: string, line: number, target: string}>}
 */
export function findTranslationImages(markdown, filePath) {
  const masked = maskCodeRegionsKeepingLines(markdown);
  const images = [];
  const lines = masked.split("\n");

  for (let index = 0; index < lines.length; index++) {
    INLINE_IMAGE.lastIndex = 0;
    for (const match of lines[index].matchAll(INLINE_IMAGE)) {
      images.push({
        file: filePath,
        line: index + 1,
        target: imageTarget(match[2]),
      });
    }
  }

  return images;
}

function collectMarkdownFiles(target, files = []) {
  const info = statSync(target);
  if (info.isFile()) {
    if (target.toLowerCase().endsWith(".md")) files.push(target);
    return files;
  }

  for (const entry of readdirSync(target, { withFileTypes: true })) {
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function isHttpUrl(value) {
  return (
    typeof value === "string" &&
    /^https?:\/\/[^\s]+$/i.test(value.trim())
  );
}

function isPullRequestUrl(value) {
  return (
    isHttpUrl(value) &&
    /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/\d+(?:[/?#]|$)/i.test(
      value.trim()
    )
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function postSlugForFile(filePath, translationDir) {
  const relative = path.relative(translationDir, filePath);
  return relative.split(path.sep)[0];
}

function registryFailure(registryPath, message) {
  return { file: registryPath, message };
}

function markdownFailure(image, message) {
  return { file: image.file, line: image.line, message };
}

function localFilename(target) {
  if (!target.startsWith("./")) return null;

  const filename = target.slice(2);
  if (
    filename.length === 0 ||
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return null;
  }

  return filename;
}

function classifyTarget(target) {
  if (/^https?:\/\//i.test(target)) return { kind: "external" };
  return { kind: "local", filename: localFilename(target) };
}

function unsupportedImageFailures(markdown, filePath) {
  const masked = maskCodeRegionsKeepingLines(markdown);
  const failures = [];
  const lines = masked.split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const supported = line.replace(INLINE_IMAGE, "");

    if (HTML_IMAGE.test(supported)) {
      failures.push({
        file: filePath,
        line: index + 1,
        message:
          "HTML <img> 이미지는 검사 대상에서 누락되지 않도록 Markdown 이미지 문법으로 바꾸세요",
      });
    }

    if (/!\s*\[/.test(supported)) {
      failures.push({
        file: filePath,
        line: index + 1,
        message:
          "지원하지 않는 이미지 문법입니다. 인라인 Markdown 이미지 ![alt](target)를 사용하세요",
      });
    }
  }

  return failures;
}

function validatePostMetadata(
  post,
  slug,
  registryPath,
  requiredSourceArticle,
  requirePullRequest = false
) {
  const failures = [];
  if (!post || typeof post !== "object" || Array.isArray(post)) {
    return [registryFailure(registryPath, `등록된 글 '${slug}'의 값이 객체가 아닙니다`)].concat(
      failures
    );
  }

  if (!isHttpUrl(post.provenanceUrl)) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'에는 제작 이력 provenanceUrl(HTTP 또는 HTTPS URL)이 필요합니다`
      )
    );
  } else if (requirePullRequest && !isPullRequestUrl(post.provenanceUrl)) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'의 provenanceUrl은 제작 PR URL(https://github.com/.../pull/<number>)이어야 합니다`
      )
    );
  }
  if (!isNonEmptyString(post.rationale)) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'에는 제작·로컬화 목적을 설명하는 rationale이 필요합니다`
      )
    );
  }
  if (requiredSourceArticle && !isHttpUrl(post.sourceArticleUrl)) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'에는 원문 sourceArticleUrl(HTTP 또는 HTTPS URL)이 필요합니다`
      )
    );
  } else if (
    post.sourceArticleUrl !== undefined &&
    !isHttpUrl(post.sourceArticleUrl)
  ) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'의 sourceArticleUrl은 HTTP 또는 HTTPS URL이어야 합니다`
      )
    );
  }

  return failures;
}

function validateImageRecord({ record, filename, slug, post, registryPath }) {
  const failures = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return [
      registryFailure(
        registryPath,
        `글 '${slug}'의 이미지 '${filename}' 등록값이 객체가 아닙니다`
      ),
    ];
  }

  if (!SUPPORTED_KINDS.has(record.kind)) {
    failures.push(
      registryFailure(
        registryPath,
        `글 '${slug}'의 이미지 '${filename}' kind는 original, localized-redraw, source-copy 중 하나여야 합니다`
      )
    );
    return failures;
  }

  if (record.kind === "localized-redraw") {
    failures.push(
      ...validatePostMetadata(post, slug, registryPath, true, true),
    );
    if (!isHttpUrl(record.sourceImageUrl)) {
      failures.push(
        registryFailure(
          registryPath,
          `localized-redraw 이미지 '${filename}'에는 sourceImageUrl(HTTP 또는 HTTPS URL)이 필요합니다`
        )
      );
    }
  } else if (record.kind === "source-copy") {
    failures.push(
      ...validatePostMetadata(post, slug, registryPath, true),
    );
    if (!isHttpUrl(record.sourceImageUrl)) {
      failures.push(
        registryFailure(
          registryPath,
          `source-copy 이미지 '${filename}'에는 sourceImageUrl(HTTP 또는 HTTPS URL)이 필요합니다`
        )
      );
    }
    if (record.rightsBasis !== "license" && record.rightsBasis !== "permission") {
      failures.push(
        registryFailure(
          registryPath,
          `source-copy 이미지 '${filename}'에는 rightsBasis를 license 또는 permission으로 기록해야 합니다`
        )
      );
    }
    if (!isNonEmptyString(record.rightsEvidence)) {
      failures.push(
        registryFailure(
          registryPath,
          `source-copy 이미지 '${filename}'에는 rightsEvidence가 필요합니다`
        )
      );
    }
  } else {
    failures.push(
      ...validatePostMetadata(post, slug, registryPath, false),
    );
    if (
      record.sourceImageUrl !== undefined &&
      !isHttpUrl(record.sourceImageUrl)
    ) {
      failures.push(
        registryFailure(
          registryPath,
          `original 이미지 '${filename}'의 sourceImageUrl은 HTTP 또는 HTTPS URL이어야 합니다`
        )
      );
    }
  }

  return failures;
}

function safeRegistryFilename(filename) {
  return (
    typeof filename === "string" &&
    filename.length > 0 &&
    filename !== "." &&
    filename !== ".." &&
    !filename.includes("/") &&
    !filename.includes("\\") &&
    !filename.includes("\0")
  );
}

/**
 * 번역글의 로컬 이미지와 출처 등록부를 양방향으로 검증합니다.
 * 네트워크 요청은 하지 않으며, URL 형식과 파일·참조·등록 관계만 검사합니다.
 *
 * @returns {Array<{file: string, line?: number, message: string}>}
 */
export function validateTranslationImageProvenance({
  translationDir,
  registryPath,
}) {
  const resolvedTranslationDir = path.resolve(translationDir);
  const resolvedRegistryPath = path.resolve(registryPath);
  const failures = [];
  let registry;

  try {
    registry = JSON.parse(readFileSync(resolvedRegistryPath, "utf8"));
  } catch (error) {
    failures.push(
      registryFailure(
        resolvedRegistryPath,
        `출처 등록부를 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    return failures;
  }

  if (registry?.version !== 1) {
    failures.push(
      registryFailure(resolvedRegistryPath, "출처 등록부 version은 1이어야 합니다")
    );
  }
  if (
    !registry?.posts ||
    typeof registry.posts !== "object" ||
    Array.isArray(registry.posts)
  ) {
    failures.push(
      registryFailure(resolvedRegistryPath, "출처 등록부 posts는 객체여야 합니다")
    );
    return failures;
  }

  let markdownFiles;
  try {
    markdownFiles = collectMarkdownFiles(resolvedTranslationDir);
  } catch (error) {
    failures.push(
      registryFailure(
        resolvedTranslationDir,
        `번역 디렉터리를 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    return failures;
  }

  const referencesByPost = new Map();
  const markdownByPost = new Map();

  for (const markdownPath of markdownFiles) {
    const slug = postSlugForFile(markdownPath, resolvedTranslationDir);
    if (!markdownByPost.has(slug)) markdownByPost.set(slug, []);
    markdownByPost.get(slug).push(markdownPath);

    let markdown;
    try {
      markdown = readFileSync(markdownPath, "utf8");
    } catch (error) {
      failures.push(
        registryFailure(
          markdownPath,
          `Markdown를 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`
        )
      );
      continue;
    }

    failures.push(...unsupportedImageFailures(markdown, markdownPath));
    const images = findTranslationImages(markdown, markdownPath);
    const postReferences = referencesByPost.get(slug) ?? new Map();

    for (const image of images) {
      const classified = classifyTarget(image.target);
      if (classified.kind === "external") continue;

      if (!classified.filename) {
        failures.push(
          markdownFailure(
            image,
            `로컬 이미지 경로 '${image.target}'는 글 폴더의 './파일명' 형식이어야 합니다 (../, public 루트, 하위 폴더 참조 금지)`
          )
        );
        continue;
      }

      if (!postReferences.has(classified.filename)) {
        postReferences.set(classified.filename, image);
      }

      const post = registry.posts[slug];
      const record = post?.images?.[classified.filename];
      if (!post || !post.images || !record) {
        failures.push(
          markdownFailure(
            image,
            `로컬 이미지 '${classified.filename}'의 출처 등록이 없습니다. image-provenance.json에 등록하세요`
          )
        );
        continue;
      }

      const imagePath = path.join(resolvedTranslationDir, slug, classified.filename);
      if (!isLocalFile(imagePath)) {
        failures.push(
          markdownFailure(
            image,
            `등록된 로컬 이미지 파일 '${classified.filename}'이 글 폴더에 존재하지 않습니다`
          )
        );
      }

      failures.push(
        ...validateImageRecord({
          record,
          filename: classified.filename,
          slug,
          post,
          registryPath: resolvedRegistryPath,
        })
      );
    }

    referencesByPost.set(slug, postReferences);
  }

  for (const [slug, post] of Object.entries(registry.posts)) {
    const postFiles = markdownByPost.get(slug) ?? [];
    if (postFiles.length === 0) {
      failures.push(
        registryFailure(
          resolvedRegistryPath,
          `등록된 글 '${slug}'을 번역 Markdown에서 찾을 수 없습니다`
        )
      );
    }

    if (!post || typeof post !== "object" || Array.isArray(post)) continue;
    if (!post.images || typeof post.images !== "object" || Array.isArray(post.images)) {
      failures.push(
        registryFailure(resolvedRegistryPath, `글 '${slug}'의 images는 객체여야 합니다`)
      );
      continue;
    }

    const references = referencesByPost.get(slug) ?? new Map();
    for (const [filename, record] of Object.entries(post.images)) {
      if (!safeRegistryFilename(filename)) {
        failures.push(
          registryFailure(
            resolvedRegistryPath,
            `글 '${slug}'의 등록 파일명 '${filename}'은 글 폴더의 단일 파일명이어야 합니다`
          )
        );
        continue;
      }

      if (!references.has(filename)) {
        failures.push(
          registryFailure(
            resolvedRegistryPath,
            `등록된 이미지 '${slug}/${filename}'이 Markdown에서 참조되지 않습니다`
          )
        );
      }

      const imagePath = path.join(resolvedTranslationDir, slug, filename);
      if (!isLocalFile(imagePath)) {
        failures.push(
          registryFailure(
            resolvedRegistryPath,
            `등록된 이미지 '${slug}/${filename}' 파일이 글 폴더에 존재하지 않습니다`
          )
        );
      }

      failures.push(
        ...validateImageRecord({
          record,
          filename,
          slug,
          post,
          registryPath: resolvedRegistryPath,
        })
      );
    }
  }

  return deduplicateFailures(failures);
}

function isLocalFile(filePath) {
  try {
    return lstatSync(filePath).isFile();
  } catch {
    return false;
  }
}

function deduplicateFailures(failures) {
  const seen = new Set();
  return failures.filter(failure => {
    const key = `${failure.file}\0${failure.line ?? ""}\0${failure.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatFailure(failure) {
  const relative = path.relative(process.cwd(), failure.file) || failure.file;
  return `  ${relative}${failure.line === undefined ? "" : `:${failure.line}`} ${failure.message}`;
}

function runCli() {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
  );
  const translationDir = path.resolve(
    process.argv[2] ?? path.join(repoRoot, "contents/blog/translation")
  );
  const registryPath = path.resolve(
    process.argv[3] ?? path.join(translationDir, "image-provenance.json")
  );
  const failures = validateTranslationImageProvenance({
    translationDir,
    registryPath,
  });

  if (failures.length > 0) {
    process.stderr.write(
      `❌ 번역 이미지 출처 검사 실패 (${failures.length}건):\n${failures
        .map(formatFailure)
        .join("\n")}\n`
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write("✅ 번역 이미지 출처 검사 통과\n");
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) runCli();
