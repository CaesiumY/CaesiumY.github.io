import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  findTranslationImages,
  validateTranslationImageProvenance,
} from "./check-translation-image-provenance.mjs";

const scriptPath = fileURLToPath(
  new URL("./check-translation-image-provenance.mjs", import.meta.url)
);

const postMetadata = (overrides = {}) => ({
  sourceArticleUrl: "https://source.example/article",
  provenanceUrl: "https://github.com/example/repo/pull/1",
  rationale: "한국어 독자가 도식 안 정보를 읽도록 재제작",
  ...overrides,
});

const localizedImage = (overrides = {}) => ({
  kind: "localized-redraw",
  sourceImageUrl: "https://source.example/diagram.png",
  ...overrides,
});

function createFixture({ markdown = "", registry, files = [] }) {
  const root = mkdtempSync(path.join(tmpdir(), "translation-provenance-"));
  const translationDir = path.join(root, "translation");
  const postDir = path.join(translationDir, "post");
  mkdirSync(postDir, { recursive: true });
  const markdownPath = path.join(postDir, "index.md");
  writeFileSync(markdownPath, markdown, "utf8");

  for (const file of files) {
    const filePath = path.join(postDir, file);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, "fixture", "utf8");
  }

  const registryPath = path.join(translationDir, "image-provenance.json");
  writeFileSync(
    registryPath,
    JSON.stringify(registry ?? { version: 1, posts: {} }, null, 2),
    "utf8"
  );

  return { root, translationDir, registryPath, markdownPath };
}

function validateFixture(options) {
  const fixture = createFixture(options);
  try {
    return {
      fixture,
      failures: validateTranslationImageProvenance({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
      }),
    };
  } catch (error) {
    rmSync(fixture.root, { recursive: true, force: true });
    throw error;
  }
}

function localizedRegistry(image = {}, post = {}) {
  return {
    version: 1,
    posts: {
      post: {
        ...postMetadata(post),
        ...post,
        images: {
          "diagram.png": localizedImage(image),
        },
      },
    },
  };
}

function messages(failures) {
  return failures.map(failure => failure.message).join("\n");
}

test("외부 http와 https 이미지는 등록 없이 허용한다", () => {
  const { fixture, failures } = validateFixture({
    markdown:
      "![http](http://example.com/image.png)\n![https](https://example.com/image.png)",
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("등록되지 않은 로컬 이미지는 파일과 행 번호를 포함해 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![로컬](./unregistered.png)",
    files: ["unregistered.png"],
  });

  assert.equal(failures.length, 1);
  assert.equal(failures[0].file, fixture.markdownPath);
  assert.equal(failures[0].line, 1);
  assert.match(failures[0].message, /등록/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("필수 출처가 있는 localized-redraw를 허용한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![번안](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry(),
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("sourceImageUrl이 없는 localized-redraw를 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![번안](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry({ sourceImageUrl: undefined }),
  });

  assert.match(messages(failures), /sourceImageUrl/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("localized-redraw provenanceUrl은 제작 PR이어야 한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![번안](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry({}, {
      provenanceUrl: "https://example.com/editorial-record",
    }),
  });

  assert.match(messages(failures), /제작 PR/);
  rmSync(fixture.root, { recursive: true, force: true });
});
test("제작 이력이 없는 localized-redraw를 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![번안](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry({}, { provenanceUrl: undefined }),
  });

  assert.match(messages(failures), /provenanceUrl/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("근거가 있는 source-copy를 허용한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![복제](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry({
      kind: "source-copy",
      rightsBasis: "license",
      rightsEvidence: "https://source.example/license",
    }),
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("rightsBasis 또는 rightsEvidence가 없는 source-copy를 거부한다", () => {
  for (const missing of ["rightsBasis", "rightsEvidence"]) {
    const image = {
      kind: "source-copy",
      rightsBasis: "license",
      rightsEvidence: "https://source.example/license",
    };
    delete image[missing];
    const { fixture, failures } = validateFixture({
      markdown: "![복제](./diagram.png)",
      files: ["diagram.png"],
      registry: localizedRegistry(image),
    });

    assert.match(messages(failures), new RegExp(missing));
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("sourceImageUrl이 없는 original 이미지를 허용한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![직접 제작](./diagram.png)",
    files: ["diagram.png"],
    registry: localizedRegistry(
      { kind: "original", sourceImageUrl: undefined },
      { sourceArticleUrl: undefined }
    ),
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("존재하지 않는 로컬 파일을 등록하면 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "![누락](./diagram.png)",
    registry: localizedRegistry(),
  });

  assert.match(messages(failures), /파일.*존재하지 않/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("Markdown에서 참조되지 않는 오래된 등록을 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: "본문만 있습니다.",
    files: ["diagram.png"],
    registry: localizedRegistry(),
  });

  assert.match(messages(failures), /참조되지 않/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("../ 및 public 루트 경로를 거부한다", () => {
  const { fixture, failures } = validateFixture({
    markdown:
      "![상위](../outside.png)\n![public](/public/image.png)",
  });

  assert.equal(failures.length, 2);
  assert.match(messages(failures), /로컬 이미지 경로/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("HTML img와 지원하지 않는 이미지 문법을 조용히 누락하지 않는다", () => {
  const { fixture, failures } = validateFixture({
    markdown:
      '<img src="./html.png" alt="HTML">\n![참조][diagram]\n[diagram]: ./diagram.png',
  });

  assert.ok(failures.length >= 2);
  assert.match(messages(failures), /HTML|지원하지 않/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("코드 펜스와 인라인 코드의 이미지 예시는 무시한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: [
      "```markdown",
      "![펜스 예시](./fenced.png)",
      "```",
      "",
      "`![인라인 예시](./inline.png)`",
    ].join("\n"),
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("글 폴더 밖을 가리키는 심볼릭 링크를 거부한다", t => {
  const fixture = createFixture({
    markdown: "![링크](./diagram.png)",
    registry: localizedRegistry(),
  });
  const outsidePath = path.join(fixture.root, "outside.png");
  const linkPath = path.join(
    fixture.translationDir,
    "post",
    "diagram.png"
  );
  writeFileSync(outsidePath, "outside", "utf8");

  try {
    symlinkSync(outsidePath, linkPath, "file");
  } catch (error) {
    rmSync(fixture.root, { recursive: true, force: true });
    t.skip(`심볼릭 링크를 만들 수 없는 환경: ${error.message}`);
    return;
  }

  try {
    const failures = validateTranslationImageProvenance({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
    });
    assert.match(messages(failures), /존재하지 않/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});
test("CLI가 위반 위치를 출력하고 exit 1로 종료한다", () => {
  const fixture = createFixture({
    markdown: "![등록 누락](./unregistered.png)",
    files: ["unregistered.png"],
  });

  try {
    const result = spawnSync(
      process.execPath,
      [scriptPath, fixture.translationDir, fixture.registryPath],
      { encoding: "utf8" }
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /index\.md:1/);
    assert.match(result.stderr, /등록/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("findTranslationImages는 코드 밖의 Markdown 이미지와 행을 찾는다", () => {
  const filePath = "contents/blog/translation/post/index.md";
  const images = findTranslationImages(
    [
      "```markdown",
      "![무시](./ignored.png)",
      "```",
      "",
      "![실제](./actual.png)",
    ].join("\n"),
    filePath
  );

  assert.deepEqual(images, [
    { file: filePath, line: 5, target: "./actual.png" },
  ]);
});

test("findTranslationImages는 균형 괄호가 있는 로컬 이미지 파일명을 보존한다", () => {
  const images = findTranslationImages(
    "![도식](./diagram(1).png)",
    "contents/blog/translation/post/index.md"
  );

  assert.deepEqual(images, [
    {
      file: "contents/blog/translation/post/index.md",
      line: 1,
      target: "./diagram(1).png",
    },
  ]);
});

test("frontmatter의 로컬 ogImage도 출처 등록을 요구한다", () => {
  const { fixture, failures } = validateFixture({
    markdown: [
      "---",
      "ogImage: ./cover.png",
      "---",
      "본문입니다.",
    ].join("\n"),
    files: ["cover.png"],
  });

  assert.match(messages(failures), /cover\.png.*등록/);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("frontmatter의 로컬 ogImage를 original로 등록할 수 있다", () => {
  const { fixture, failures } = validateFixture({
    markdown: [
      "---",
      'ogImage: "./cover.png"',
      "---",
      "본문입니다.",
    ].join("\n"),
    files: ["cover.png"],
    registry: {
      version: 1,
      posts: {
        post: {
          provenanceUrl:
            "https://github.com/example/repo/commit/0123456789abcdef",
          rationale: "번역 시리즈의 직접 제작 커버 이미지",
          images: {
            "cover.png": {
              kind: "original",
            },
          },
        },
      },
    },
  });

  assert.deepEqual(failures, []);
  rmSync(fixture.root, { recursive: true, force: true });
});

test("findTranslationImages는 중첩 및 escape 괄호 파일명을 보존한다", () => {
  const filePath = "contents/blog/translation/post/index.md";
  const images = findTranslationImages(
    [
      "![중첩](./diagram(foo(1)).png)",
      "![escape](./diagram\\(1\\).png)",
    ].join("\n"),
    filePath
  );

  assert.deepEqual(images, [
    { file: filePath, line: 1, target: "./diagram(foo(1)).png" },
    { file: filePath, line: 2, target: "./diagram(1).png" },
  ]);
});
