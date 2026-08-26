import { test, expect } from "@playwright/test";

import { TEST_POST_URL } from "./fixtures/test-posts";

/**
 * JSON-LD의 저자 엔티티 통합을 지키는 스펙.
 *
 * 홈페이지, 글, 프로필이 저자를 같은 @id로 가리켜야 크롤러와 에이전트가 셋을
 * 한 사람으로 묶는다. Layout.astro를 리팩터링하다 이 연결이 끊어져도 빌드는
 * 통과하므로, 여기서 잡지 않으면 조용히 깨진다.
 */

const PERSON_ID_SUFFIX = "/about#person";

/** 페이지의 JSON-LD를 파싱한다. @graph면 노드 배열을, 아니면 단일 노드를 편다. */
async function readJsonLd(page: import("@playwright/test").Page) {
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(raw, "JSON-LD 블록이 있어야 함").toBeTruthy();
  const parsed = JSON.parse(raw as string);
  return {
    nodes: (parsed["@graph"] ?? [parsed]) as Record<string, unknown>[],
    root: parsed as Record<string, unknown>,
  };
}

const findByType = (nodes: Record<string, unknown>[], type: string) =>
  nodes.find(node => node["@type"] === type);

test.describe("JSON-LD 구조화 데이터", () => {
  test("홈페이지가 WebSite와 Person을 같은 @id로 묶어야 함", async ({ page }) => {
    await page.goto("/");
    const { nodes } = await readJsonLd(page);

    const website = findByType(nodes, "WebSite");
    const person = findByType(nodes, "Person");
    expect(website, "WebSite 노드가 있어야 함").toBeTruthy();
    expect(person, "Person 노드가 있어야 함").toBeTruthy();

    const personId = person!["@id"] as string;
    expect(personId).toContain(PERSON_ID_SUFFIX);
    expect(website!.author).toEqual({ "@id": personId });
    expect(website!.publisher).toEqual({ "@id": personId });
  });

  test("홈페이지 Person이 url·sameAs·jobTitle을 갖춰야 함", async ({ page }) => {
    await page.goto("/");
    const { nodes } = await readJsonLd(page);
    const person = findByType(nodes, "Person")!;

    // is-agentic의 json-ld 체크가 요구하는 최소 항목이다.
    expect(person.url, "url").toBeTruthy();
    expect(person.jobTitle, "jobTitle").toBeTruthy();
    expect(Array.isArray(person.sameAs) && person.sameAs.length > 0).toBe(true);
  });

  test("글 페이지가 BlogPosting과 저자를 같은 @id로 묶어야 함", async ({ page }) => {
    await page.goto(TEST_POST_URL);
    const { nodes } = await readJsonLd(page);

    const posting = findByType(nodes, "BlogPosting");
    const person = findByType(nodes, "Person");
    expect(posting, "BlogPosting 노드가 있어야 함").toBeTruthy();
    expect(person, "Person 노드가 함께 실려야 함").toBeTruthy();

    const personId = person!["@id"] as string;
    expect(posting!.author).toEqual({ "@id": personId });
    expect(posting!.publisher).toEqual({ "@id": personId });
  });

  test("프로필 페이지 Person이 홈페이지와 같은 @id여야 함", async ({ page }) => {
    await page.goto("/");
    const homeId = (findByType((await readJsonLd(page)).nodes, "Person")!)["@id"];

    await page.goto("/about");
    const { root } = await readJsonLd(page);
    expect(root["@type"]).toBe("Person");
    expect(root["@id"]).toBe(homeId);
  });

  test("noindex 페이지에는 구조화 데이터가 없어야 함", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  });
});
