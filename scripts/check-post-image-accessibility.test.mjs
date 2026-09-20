import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { findDuplicateAltCaptions } from "./check-post-image-accessibility.mjs";

const scriptPath = fileURLToPath(
  new URL("./check-post-image-accessibility.mjs", import.meta.url)
);

test("reports an image whose visible caption repeats its alt text", () => {
  const markdown = [
    "![동일한 설명](https://example.com/image.png)",
    "",
    "동일한 설명",
  ].join("\n");

  assert.deepEqual(findDuplicateAltCaptions(markdown), [
    {
      imageLine: 1,
      captionLine: 3,
      text: "동일한 설명",
    },
  ]);
});

test("ignores image examples inside fenced code blocks", () => {
  const markdown = [
    "```markdown",
    "![예시](https://example.com/image.png)",
    "",
    "예시",
    "```",
  ].join("\n");

  assert.deepEqual(findDuplicateAltCaptions(markdown), []);
});

test("does not close a code fence when text follows the fence marker", () => {
  const markdown = [
    "````markdown",
    "````still code",
    "![예시](https://example.com/image.png)",
    "",
    "예시",
    "````",
  ].join("\n");

  assert.deepEqual(findDuplicateAltCaptions(markdown), []);
});

test("accepts empty alt text and captions with distinct wording", () => {
  const markdown = [
    "![](https://example.com/decorative.png)",
    "",
    "장식 이미지",
    "",
    "![이미지에 보이는 내용](https://example.com/context.png)",
    "",
    "이 이미지가 중요한 이유",
  ].join("\n");

  assert.deepEqual(findDuplicateAltCaptions(markdown), []);
});

test("CLI exits nonzero and reports the file and line for a duplicate", () => {
  const fixtureDir = mkdtempSync(path.join(tmpdir(), "post-image-a11y-"));
  const fixturePath = path.join(fixtureDir, "post.md");
  writeFileSync(
    fixturePath,
    "![동일한 설명](https://example.com/image.png)\n\n동일한 설명\n"
  );

  try {
    const result = spawnSync(process.execPath, [scriptPath, fixtureDir], {
      encoding: "utf8",
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /post\.md:1/);
    assert.match(result.stderr, /캡션 3행/);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
