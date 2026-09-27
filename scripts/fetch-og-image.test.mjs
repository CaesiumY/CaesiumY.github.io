// src/utils/fetchOgImage.ts의 fetchProjectOgImage 회귀 스위트.
//
// src 코드지만 여기 두는 이유는 이 레포에서 순수 함수를 돌리는 러너가
// `pnpm test:scripts`(scripts/**/*.test.mjs) 하나뿐이기 때문이다. Node 22.18+의
// 타입 스트리핑으로 .mjs에서 .ts를 그대로 import한다(engines가 ^22.22.3 이상).
//
// 네트워크는 globalThis.fetch를 목으로 바꿔 고정한다. 수동 ogImage가 200에
// text/html을 돌려주는 URL이었을 때 카드에 깨진 이미지가 박힌 적이 있어서
// (#142), 판정 기준은 상태 코드가 아니라 content-type이다.
import { afterEach, mock, test } from "node:test";
import assert from "node:assert/strict";

import { fetchProjectOgImage } from "../src/utils/fetchOgImage.ts";

const LIVE_OG = "https://live.example/og.png";
const GITHUB_OG = "https://opengraph.githubassets.com/x/repo";

const htmlWithOg = image =>
  `<html><head><meta property="og:image" content="${image}"></head></html>`;

const response = (body, contentType, status = 200) =>
  new Response(body, { status, headers: { "content-type": contentType } });

/**
 * URL별 응답을 정해 둔 fetch 목. 등록되지 않은 URL은 네트워크 실패로 취급한다.
 * 값이 Error면 throw해서 타임아웃·DNS 실패를 흉내 낸다.
 */
const stubFetch = routes =>
  mock.method(globalThis, "fetch", async input => {
    const url = String(input);
    const route = routes[url];
    if (!route) throw new TypeError(`unexpected fetch: ${url}`);
    if (route instanceof Error) throw route;
    return route();
  });

const project = overrides => ({
  title: "t",
  description: "d",
  techStack: [],
  date: new Date("2026-01-01"),
  ...overrides,
});

afterEach(() => mock.restoreAll());

test("수동 ogImage가 image/*면 그대로 쓴다", async () => {
  const ogImage = "https://cdn.example/hero.png";
  stubFetch({ [ogImage]: () => response("PNG", "image/png") });

  assert.equal(await fetchProjectOgImage(project({ ogImage })), ogImage);
});

test("content-type 파라미터가 붙어도 image/*로 인정한다", async () => {
  const ogImage = "https://cdn.example/hero.webp";
  stubFetch({ [ogImage]: () => response("x", "image/webp; charset=binary") });

  assert.equal(await fetchProjectOgImage(project({ ogImage })), ogImage);
});

test("수동 ogImage가 text/html이면 liveUrl의 og:image로 폴백한다", async () => {
  const ogImage = "https://cdn.example/moved.png";
  const liveUrl = "https://live.example/";
  stubFetch({
    [ogImage]: () => response("<html>moved</html>", "text/html"),
    [liveUrl]: () => response(htmlWithOg(LIVE_OG), "text/html"),
  });

  assert.equal(await fetchProjectOgImage(project({ ogImage, liveUrl })), LIVE_OG);
});

test("liveUrl도 실패하면 githubUrl까지 내려간다", async () => {
  const ogImage = "https://cdn.example/moved.png";
  const liveUrl = "https://live.example/";
  const githubUrl = "https://github.com/x/repo";
  stubFetch({
    [ogImage]: () => response("<html></html>", "text/html"),
    [liveUrl]: () => response("", "text/html", 500),
    [githubUrl]: () => response(htmlWithOg(GITHUB_OG), "text/html"),
  });

  assert.equal(
    await fetchProjectOgImage(project({ ogImage, liveUrl, githubUrl })),
    GITHUB_OG
  );
});

test("text/html이고 폴백 대상이 없으면 null(플레이스홀더)이다", async () => {
  const ogImage = "https://cdn.example/moved.png";
  stubFetch({ [ogImage]: () => response("<html></html>", "text/html") });

  assert.equal(await fetchProjectOgImage(project({ ogImage })), null);
});

test("상태 코드가 아니라 content-type으로 판정한다", async () => {
  const ogImage = "https://cdn.example/hero.png";
  stubFetch({ [ogImage]: () => response("PNG", "image/png", 404) });

  assert.equal(await fetchProjectOgImage(project({ ogImage })), ogImage);
});

test("수동 ogImage 요청이 실패하면 폴백 사슬로 넘어간다", async () => {
  const ogImage = "https://cdn.example/hero.png";
  const liveUrl = "https://live.example/";
  stubFetch({
    [ogImage]: new TypeError("fetch failed"),
    [liveUrl]: () => response(htmlWithOg(LIVE_OG), "text/html"),
  });

  assert.equal(await fetchProjectOgImage(project({ ogImage, liveUrl })), LIVE_OG);
});

test("루트 상대 ogImage는 요청하지 않고 그대로 쓴다", async () => {
  const fetchMock = stubFetch({});
  const ogImage = "/projects/chungbooke.webp";

  assert.equal(
    await fetchProjectOgImage(
      project({ ogImage, liveUrl: "https://live.example/" })
    ),
    ogImage
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});
