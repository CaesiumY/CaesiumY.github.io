// src/utils/markdownCodeRegions.ts의 회귀 스위트.
//
// src 코드지만 여기 두는 이유는 이 레포에서 순수 함수를 돌리는 러너가
// `pnpm test:scripts`(scripts/**/*.test.mjs) 하나뿐이기 때문이다. Node 22.18+의
// 타입 스트리핑으로 .mjs에서 .ts를 그대로 import한다(engines가 ^22.22.3 이상).
//
// ⚠️ CRLF 케이스를 지우지 말 것. contents/의 마크다운은 CRLF이고, 닫는 펜스
// 판정이 캐리지 리턴을 허용하지 않으면 펜스가 하나도 닫히지 않아 문서 전체가
// 코드로 보호된다. 실제로 그렇게 깨졌고 LF 픽스처만으로는 잡히지 않았다.
import { test } from "node:test";
import assert from "node:assert/strict";

import { maskCodeRegions } from "../src/utils/markdownCodeRegions.ts";

// postMarkdown.ts가 하는 변환을 축약해 흉내 낸다. 마스킹이 보호하는 범위만
// 검증하면 되므로 URL 생성 규칙 자체는 단순화했다.
const rewrite = text =>
  text
    .replace(
      /(!?\[[^\]]*\]\()(\.\.?\/[^)\s]+)/g,
      (_, prefix, target) => `${prefix}https://x.dev${target.replace(/^\.+/, "")}`
    )
    .replace(
      /(!?\[[^\]]*\]\()(\/[^/)\s][^)\s]*)/g,
      (_, prefix, target) => `${prefix}https://x.dev${target}`
    );

const through = body => {
  const { masked, restore } = maskCodeRegions(body);
  return restore(rewrite(masked));
};

const crlf = text => text.replace(/\n/g, "\r\n");

test("코드 밖의 이미지와 링크는 재작성된다", () => {
  assert.equal(through("![a](./x.png)"), "![a](https://x.dev/x.png)");
  assert.equal(through("[b](/about)"), "[b](https://x.dev/about)");
});

test("펜스 블록 안의 예제는 그대로 남는다", () => {
  const out = through("앞\n\n```markdown\n![a](./x.png)\n```\n\n![b](./y.png)");
  assert.ok(out.includes("```markdown\n![a](./x.png)\n```"), out);
  assert.ok(out.includes("![b](https://x.dev/y.png)"), out);
});

test("CRLF 본문에서도 펜스가 닫히고 뒤의 이미지가 재작성된다", () => {
  const out = through(
    crlf("앞\n\n```js\nconst a = 1;\n```\n\n![b](./y.png)\n")
  );
  assert.ok(out.includes("![b](https://x.dev/y.png)"), out);
  assert.ok(out.includes("const a = 1;"), out);
});

test("CRLF 본문에서 펜스 안 예제는 보호된다", () => {
  const out = through(crlf("```markdown\n![a](./x.png)\n```\n\n![b](./y.png)\n"));
  assert.ok(out.includes("![a](./x.png)"), out);
  assert.ok(out.includes("![b](https://x.dev/y.png)"), out);
});

test("닫히지 않은 펜스는 파일 끝까지 보호된다", () => {
  assert.ok(through("앞\n\n```\n![a](./x.png)\n").includes("![a](./x.png)"));
});

test("긴 펜스는 짧은 펜스로 닫히지 않는다", () => {
  const out = through("````\n```\n![a](./x.png)\n```\n````\n\n![b](./y.png)");
  assert.ok(out.includes("![a](./x.png)"), out);
  assert.ok(out.includes("![b](https://x.dev/y.png)"), out);
});

test("물결표 펜스도 보호된다", () => {
  assert.ok(through("~~~\n![a](./x.png)\n~~~").includes("![a](./x.png)"));
});

test("인라인 코드는 보호되고 옆의 실제 이미지는 재작성된다", () => {
  const out = through("`![a](./x.png)` 그리고 ![b](./y.png)");
  assert.ok(out.includes("`![a](./x.png)`"), out);
  assert.ok(out.includes("![b](https://x.dev/y.png)"), out);
});

test("코드가 없으면 원문이 한 글자도 바뀌지 않는다", () => {
  const body = "제목\n\n평범한 문장 하나.";
  assert.equal(through(body), body);
});

test("변환 없이 마스킹만 하면 언제나 원문으로 복원된다", () => {
  for (const body of [
    "```\ncode\n```\n\n본문",
    crlf("```sh\nls -al\n```\n\n본문\n"),
    "`inline` 과 ``중첩 ` 백틱`` 섞임",
    "펜스 없음",
  ]) {
    const { masked, restore } = maskCodeRegions(body);
    assert.equal(restore(masked), body, JSON.stringify(body));
  }
});

test("자리표시자가 산출물에 새지 않는다", () => {
  const out = through(crlf("```\ncode\n```\n\n본문\n"));
  assert.ok(!out.includes("\uE000"), JSON.stringify(out));
});
