# 게시글 목록 번역/자작 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/posts` 게시글 목록을 전체·직접 쓴 글·번역 세 탭으로 분리하고, 모든 카드에 번역 배지를 단다.

**Architecture:** 번역글은 이미 `contents/blog/translation/` 디렉터리에 물리적으로 분리되어 있다. 이 디렉터리 여부를 판별하는 순수 함수 하나(`isTranslatedPost`)를 신호원으로 삼아, 기존 `paginate()` 패턴을 복제한 정적 라우트 2개(`/posts/authored`, `/posts/translated`)와 순수 링크 탭 컴포넌트를 추가한다. 스키마 변경·콘텐츠 파일 수정·클라이언트 JS가 전부 0이다.

**Tech Stack:** Astro 6 (SSG, `output: static`), Tailwind 4 (`@utility`), Playwright E2E, Node 스크립트 기반 회귀 가드.

## Global Constraints

- 런타임: pnpm 10, Node >= 22.
- **스키마 변경 금지**: `src/content.config.ts`를 건드리지 않는다.
- **콘텐츠 파일 45개 무수정**: `contents/blog/**/*.md`의 frontmatter·본문을 바꾸지 않는다. 번역글 제목의 `[번역]` 접두어는 유지한다.
- **기존 `/posts` URL 불변**: 기존 라우트의 내용·페이지네이션 URL(`/posts`, `/posts/2`…)이 그대로여야 한다. 탭 UI만 추가한다.
- **새 의존성 0**: vitest 등 테스트 러너를 추가하지 않는다. 검증은 기존 관례(`scripts/check-*.mjs` + Playwright)를 따른다.
- **View Transitions 안전**: 새 클라이언트 JavaScript를 추가하지 않는다. 탭은 순수 `<a>` 링크다. 따라서 `e2e/listener-leak.spec.ts`는 확장하지 않는다.
- **ESLint 룰 비활성화 금지**: 룰을 끄거나 파일을 ignore하지 않는다. 근본 원인을 고친다.
- **경로 별칭**: `@/*` → `./src/*` (tsconfig.json).
- **빌드 검증**: 최종 확인은 `pnpm build` 후 `dist/` 산출물을 본다. 이미지 최적화·pagefind·예약 발행 필터는 빌드 타임에만 일어난다.
- **커밋**: Conventional Commits. 태스크마다 커밋.
- **Windows CRLF 주의**: `pnpm format` 후 `git status`가 내용 변화 없이 M으로 뜰 수 있다. `git diff`로 판단하고 거짓 양성은 `git checkout`으로 복원한다.
- **DEV vs PROD 카운트 (중요 — 실측으로 정정됨)**: 로더 패턴 `**/[^_]*.md`는 **파일명**만 `_`로 거르고 **디렉터리는 거르지 않는다.** 따라서 `contents/blog/_samples/`의 17편(전부 `draft: true`)이 컬렉션에 포함된다. dev 서버(E2E가 도는 곳)는 draft를 노출하므로 자작 탭이 44편(27 + `_samples` 17, 6페이지)이고, 프로덕션 빌드는 draft를 제외해 26편(4페이지)이다. 번역글에는 draft가 없어 양쪽 모두 18편(3페이지)로 안정적이다.
  → **E2E는 draft 수에 의존하는 총 글 수·페이지 수를 단언하지 말 것.** 대신 환경과 무관하게 항상 참인 분류 불변식을 단언한다: 자작 탭에 `[번역]` 제목 카드가 0개, 번역 탭은 전부 `[번역]`, 그리고 "다음 페이지" 링크가 해당 탭 경로(`/posts/authored/2`)를 가리킬 것. 프로덕션 페이지 수 검증은 Task 6의 `dist/` 검사가 담당한다.

---

## File Structure

**신규 파일:**
- `src/utils/isTranslatedPost.ts` — 번역글 판별 순수 함수. 신호원.
- `src/pages/posts/authored/[...page].astro` — 자작글 페이지네이션 라우트.
- `src/pages/posts/translated/[...page].astro` — 번역글 페이지네이션 라우트.
- `src/features/blog/components/PostFilterTabs.astro` — 세 탭 링크. 세 라우트가 공유.
- `src/features/blog/components/TranslationBadge.astro` — 번역 배지. `DraftBadge.astro` 자매.
- `scripts/check-post-classification.mjs` — 디렉터리 ⟺ `[번역]` 접두어 동치 회귀 가드.
- `e2e/posts-tabs.spec.ts` — 탭 이동·카드 수·페이지네이션·breadcrumb·배지 E2E.

**수정 파일:**
- `src/features/blog/components/Card.astro` — 번역 배지 렌더 추가.
- `src/pages/posts/[...page].astro` — 전체 탭에 `PostFilterTabs` 부착.
- `src/layouts/components/Breadcrumb.astro` — posts 브랜치가 탭 세그먼트를 페이지 번호로 오인하지 않도록 수정.
- `.github/workflows/ci.yml` — `check-post-classification.mjs` 단계 추가.

---

## Task 1: 판별 함수 + 데이터 무결성 스크립트

**Files:**
- Create: `src/utils/isTranslatedPost.ts`
- Create: `scripts/check-post-classification.mjs`

**Interfaces:**
- Produces: `isTranslatedPost(filePath: string | undefined): boolean` — `filePath`가 `contents/blog/translation/`로 시작하면 `true`. 이후 모든 라우트와 Card가 소비한다.

- [ ] **Step 1: 판별 함수 작성**

`src/utils/isTranslatedPost.ts`:

```ts
import { BLOG_PATH } from "@/content.config";

// 번역글은 이 디렉터리 아래에만 존재한다. getPath.ts가 이 경로를 URL로
// 변환하므로 디렉터리는 이미 공개 URL 구조의 일부다.
const TRANSLATION_DIR = `${BLOG_PATH}/translation/`;

/**
 * 포스트가 번역글인지 판별한다.
 * @param filePath - CollectionEntry의 filePath (상대 경로, undefined 가능)
 */
export function isTranslatedPost(filePath: string | undefined): boolean {
  return filePath?.startsWith(TRANSLATION_DIR) ?? false;
}
```

- [ ] **Step 2: 회귀 가드 스크립트 작성**

`scripts/check-post-classification.mjs`:

```js
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
  console.error(`❌ 번역글 분류 신호 불일치 (${errors.length}건):`);
  console.error(errors.join("\n"));
  console.error(
    `\n디렉터리(contents/blog/translation/)와 제목 [번역] 접두어는 완전히 동치여야 합니다.`
  );
  process.exit(1);
}

const translationCount = allPosts.filter(f =>
  f.startsWith(TRANSLATION_DIR + path.sep)
).length;
console.log(
  `✅ 번역글 분류 신호 일관성 OK: translation/ 디렉터리 ${translationCount}편 == [번역] 접두어 ${translationCount}편`
);
```

- [ ] **Step 3: 스크립트를 실행해 현재 데이터가 통과하는지 확인**

Run: `node scripts/check-post-classification.mjs`
Expected: `✅ 번역글 분류 신호 일관성 OK: translation/ 디렉터리 18편 == [번역] 접두어 18편`

- [ ] **Step 4: 가드가 실제로 불일치를 잡는지 확인 (일시적 red 검증)**

번역글 하나의 제목에서 임시로 접두어를 떼어 검사가 실패하는지 본다.

Run:
```bash
node -e "const fs=require('fs');const p='contents/blog/translation/vibe-coder-vs-software-engineer/index.md';const s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace('[번역] ',''));"
node scripts/check-post-classification.mjs; echo "exit=$?"
git checkout contents/blog/translation/vibe-coder-vs-software-engineer/index.md
node scripts/check-post-classification.mjs; echo "exit=$?"
```
Expected: 첫 실행은 `exit=1`과 불일치 메시지, `git checkout` 복원 후 둘째 실행은 `exit=0`.

- [ ] **Step 5: Lint·format 확인**

Run: `git ls-files -m -o --exclude-standard -- src scripts | grep -E '\.(ts|mjs)$' | xargs pnpm exec eslint`
Expected: 에러 없음. (로컬 `pnpm lint`는 gitignore된 산출물 때문에 거짓 에러가 나므로 tracked 파일만 린트한다.)

- [ ] **Step 6: Commit**

```bash
git add src/utils/isTranslatedPost.ts scripts/check-post-classification.mjs
git commit -m "feat(posts): 번역글 판별 함수와 분류 무결성 검사 추가"
```

---

## Task 2: 자작·번역 정적 라우트

**Files:**
- Create: `src/pages/posts/authored/[...page].astro`
- Create: `src/pages/posts/translated/[...page].astro`
- Create: `e2e/posts-tabs.spec.ts`

**Interfaces:**
- Consumes: `isTranslatedPost(filePath)` (Task 1), `getSortedPosts(posts)`, `SITE.postPerPage`.
- Produces: 정적 경로 `/posts/authored`, `/posts/authored/N`, `/posts/translated`, `/posts/translated/N`.

- [ ] **Step 1: E2E 스펙 작성 (탭별 카드 수·페이지네이션)**

`e2e/posts-tabs.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

test.describe("게시글 번역/자작 탭 분리", () => {
  const cards = (page: Page) => page.locator("#main-content ul > li");
  const nextLink = (page: Page) =>
    page.getByLabel("Pagination").getByRole("link", { name: "다음 페이지" });

  test("authored 탭에는 번역글이 섞이지 않는다", async ({ page }) => {
    await page.goto("/posts/authored");
    await expect(cards(page)).toHaveCount(8);
    await expect(cards(page).filter({ hasText: "[번역]" })).toHaveCount(0);
    await expect(nextLink(page)).toHaveAttribute("href", "/posts/authored/2");
  });

  test("translated 탭에는 번역글만 있다", async ({ page }) => {
    await page.goto("/posts/translated");
    await expect(cards(page)).toHaveCount(8);
    await expect(cards(page).filter({ hasText: "[번역]" })).toHaveCount(8);
    // 번역글엔 draft가 없어 DEV/PROD 모두 3페이지로 안정적
    await expect(page.getByLabel("Pagination")).toContainText(/1\s*\/\s*3/);
    await expect(nextLink(page)).toHaveAttribute("href", "/posts/translated/2");
  });
});
```

> 총 글 수·자작 페이지 수를 단언하지 않는 이유는 Global Constraints의 "DEV vs PROD 카운트" 참조 — dev 서버에는 `_samples`의 draft 17편이 섞여 자작 탭이 6페이지가 된다.

- [ ] **Step 2: 테스트를 실행해 실패하는지 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts`
Expected: FAIL — `/posts/authored`가 404라 카드가 0개.

- [ ] **Step 3: 자작 라우트 구현**

`src/pages/posts/authored/[...page].astro`:

```astro
---
import type { GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/layouts/components/Header.astro";
import Footer from "@/layouts/components/Footer.astro";
import Card from "@/features/blog/components/Card.astro";
import Pagination from "@/features/blog/components/Pagination.astro";
import PostFilterTabs from "@/features/blog/components/PostFilterTabs.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { isTranslatedPost } from "@/utils/isTranslatedPost";
import { SITE } from "@/config";

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getCollection("blog");
  const authored = getSortedPosts(posts).filter(
    post => !isTranslatedPost(post.filePath)
  );
  return paginate(authored, { pageSize: SITE.postPerPage });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
---

<Layout
  title={`직접 쓴 글 | ${SITE.title}`}
  description="직접 작성한 글만 모았습니다. 프론트엔드 개발, AI 도구, 회고 등."
  pageType="website"
>
  <Header />
  <Main pageTitle="Posts" pageDesc="직접 쓴 글만 모았습니다.">
    <PostFilterTabs activeTab="authored" />
    <ul>
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>

  <Pagination {page} />

  <Footer noMarginTop={page.lastPage > 1} />
</Layout>
```

- [ ] **Step 4: 번역 라우트 구현**

`src/pages/posts/translated/[...page].astro`:

```astro
---
import type { GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import Main from "@/layouts/Main.astro";
import Layout from "@/layouts/Layout.astro";
import Header from "@/layouts/components/Header.astro";
import Footer from "@/layouts/components/Footer.astro";
import Card from "@/features/blog/components/Card.astro";
import Pagination from "@/features/blog/components/Pagination.astro";
import PostFilterTabs from "@/features/blog/components/PostFilterTabs.astro";
import getSortedPosts from "@/utils/getSortedPosts";
import { isTranslatedPost } from "@/utils/isTranslatedPost";
import { SITE } from "@/config";

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getCollection("blog");
  const translated = getSortedPosts(posts).filter(post =>
    isTranslatedPost(post.filePath)
  );
  return paginate(translated, { pageSize: SITE.postPerPage });
}) satisfies GetStaticPaths;

const { page } = Astro.props;
---

<Layout
  title={`번역 | ${SITE.title}`}
  description="영어 기술 글을 한국어로 옮긴 번역 글 모음입니다."
  pageType="website"
>
  <Header />
  <Main pageTitle="Posts" pageDesc="번역한 글만 모았습니다.">
    <PostFilterTabs activeTab="translated" />
    <ul>
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>

  <Pagination {page} />

  <Footer noMarginTop={page.lastPage > 1} />
</Layout>
```

> 참고: 이 두 라우트는 `PostFilterTabs`(Task 3에서 생성)를 import한다. Task 3 완료 전에는 컴포넌트가 없어 dev/build가 실패하므로, Task 2와 3은 한 흐름으로 이어서 진행하고 Step 5 검증은 Task 3 완료 후 수행한다. (라우트 로직 자체는 이 태스크에서 완결된다.)

- [ ] **Step 5: 테스트 통과 확인 (Task 3 완료 후)**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts`
Expected: PASS — 두 테스트 모두 통과.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/posts/authored/[...page].astro" "src/pages/posts/translated/[...page].astro" e2e/posts-tabs.spec.ts
git commit -m "feat(posts): 자작/번역 정적 라우트 추가"
```

---

## Task 3: 탭 컴포넌트

**Files:**
- Create: `src/features/blog/components/PostFilterTabs.astro`
- Modify: `src/pages/posts/[...page].astro`

**Interfaces:**
- Consumes: `active-nav` 유틸리티(`src/styles/global.css:80`).
- Produces: `<PostFilterTabs activeTab="all" | "authored" | "translated" />`. Task 2의 두 라우트와 전체 라우트가 소비.

- [ ] **Step 1: E2E 스펙에 탭 이동 테스트 추가**

`e2e/posts-tabs.spec.ts`의 `describe` 블록 안에 추가:

```ts
  test("전체 탭에서 세 탭 링크가 보이고 이동된다", async ({ page }) => {
    await page.goto("/posts");
    const tabs = page.getByRole("navigation", { name: "게시글 분류" });
    await expect(tabs.getByRole("link", { name: "전체" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "직접 쓴 글" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "번역" })).toBeVisible();

    await tabs.getByRole("link", { name: "직접 쓴 글" }).click();
    await expect(page).toHaveURL(/\/posts\/authored\/?$/);

    await page
      .getByRole("navigation", { name: "게시글 분류" })
      .getByRole("link", { name: "번역" })
      .click();
    await expect(page).toHaveURL(/\/posts\/translated\/?$/);
  });
```

- [ ] **Step 2: 테스트를 실행해 실패하는지 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts -g "세 탭 링크"`
Expected: FAIL — "게시글 분류" 네비게이션이 없음.

- [ ] **Step 3: 탭 컴포넌트 구현**

`src/features/blog/components/PostFilterTabs.astro`:

```astro
---
interface Props {
  activeTab: "all" | "authored" | "translated";
}

const { activeTab } = Astro.props;

const tabs = [
  { key: "all", label: "전체", href: "/posts" },
  { key: "authored", label: "직접 쓴 글", href: "/posts/authored" },
  { key: "translated", label: "번역", href: "/posts/translated" },
] as const;
---

<nav class="mb-6 flex gap-4 border-b border-border" aria-label="게시글 분류">
  {
    tabs.map(tab => (
      <a
        href={tab.href}
        aria-current={tab.key === activeTab ? "page" : undefined}
        class:list={[
          "px-1 pb-2 font-medium transition-colors",
          tab.key === activeTab
            ? "active-nav border-b-2 border-accent"
            : "text-foreground/60 hover:text-accent",
        ]}
      >
        {tab.label}
      </a>
    ))
  }
</nav>
```

- [ ] **Step 4: 전체 라우트에 탭 부착**

`src/pages/posts/[...page].astro`를 수정한다. import에 추가:

```astro
import PostFilterTabs from "@/features/blog/components/PostFilterTabs.astro";
```

`<Main ...>`의 여는 태그 바로 다음, `<ul>` 앞에 삽입:

```astro
  <Main pageTitle="Posts" pageDesc="작성한 모든 글을 확인하세요.">
    <PostFilterTabs activeTab="all" />
    <ul>
      {page.data.map(data => <Card {...data} />)}
    </ul>
  </Main>
```

- [ ] **Step 5: Task 2·3 테스트 전체 통과 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts`
Expected: PASS — 카드 수·페이지네이션·탭 이동 모두 통과.

- [ ] **Step 6: Commit**

```bash
git add src/features/blog/components/PostFilterTabs.astro "src/pages/posts/[...page].astro"
git commit -m "feat(posts): 전체/자작/번역 탭 컴포넌트 추가"
```

---

## Task 4: Breadcrumb 수정

**Files:**
- Modify: `src/layouts/components/Breadcrumb.astro`

**Interfaces:**
- Consumes: `Astro.url.pathname`.
- Produces: `/posts/authored`·`/posts/translated`(및 페이지네이션)에서 올바른 breadcrumb 라벨.

- [ ] **Step 1: E2E 스펙에 breadcrumb 테스트 추가**

`e2e/posts-tabs.spec.ts`의 `describe` 블록 안에 추가:

```ts
  test("authored breadcrumb은 '직접 쓴 글'이고 'authored'가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/posts/authored");
    const crumb = page.getByLabel("breadcrumb");
    await expect(crumb).toContainText("직접 쓴 글");
    await expect(crumb).not.toContainText("authored");
  });

  test("translated 2페이지 breadcrumb은 '번역 (2페이지)'", async ({ page }) => {
    await page.goto("/posts/translated/2");
    const crumb = page.getByLabel("breadcrumb");
    await expect(crumb).toContainText("번역");
    await expect(crumb).toContainText("2페이지");
    await expect(crumb).not.toContainText("translated");
  });
```

- [ ] **Step 2: 테스트를 실행해 실패하는지 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts -g "breadcrumb"`
Expected: FAIL — 현재는 "Posts (authored페이지)"로 렌더되어 "authored"가 노출되고 "직접 쓴 글"이 없음.

- [ ] **Step 3: Breadcrumb의 posts 브랜치 수정**

`src/layouts/components/Breadcrumb.astro`에서 다음 블록을 찾는다:

```js
// if breadcrumb is Home > Posts > 1 <etc>
// replace Posts with Posts (page number)
if (breadcrumbList[0] === "posts") {
  breadcrumbList.splice(0, 2, `Posts (${breadcrumbList[1] || 1}페이지)`);
}
```

이 블록을 아래로 교체한다:

```js
// 게시글 탭 라벨 (URL 세그먼트 → 표시 이름)
const POST_TAB_LABELS = {
  authored: "직접 쓴 글",
  translated: "번역",
};

// if breadcrumb is Home > Posts > <tab> > <page?> or Home > Posts > <page?>
if (breadcrumbList[0] === "posts") {
  const maybeTab = breadcrumbList[1];
  if (maybeTab && maybeTab in POST_TAB_LABELS) {
    // /posts/authored, /posts/authored/2 → "Posts > 직접 쓴 글 (2페이지)"
    const tabLabel = POST_TAB_LABELS[maybeTab];
    const pageNum = breadcrumbList[2];
    const suffix =
      pageNum && Number(pageNum) > 1 ? ` (${pageNum}페이지)` : "";
    // 'posts'는 /posts 링크로 남기고, 탭 세그먼트 이후를 라벨 하나로 합친다
    breadcrumbList.splice(1, breadcrumbList.length - 1, `${tabLabel}${suffix}`);
  } else {
    // /posts, /posts/2 → "Posts (2페이지)" (기존 동작)
    breadcrumbList.splice(0, 2, `Posts (${breadcrumbList[1] || 1}페이지)`);
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts -g "breadcrumb"`
Expected: PASS — 두 breadcrumb 테스트 통과.

- [ ] **Step 5: 기존 posts breadcrumb 회귀 없는지 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts`
Expected: PASS — 전체 스펙 통과. (`/posts`, `/posts/2`의 기존 "Posts (N페이지)" 동작은 else 브랜치로 보존됨.)

- [ ] **Step 6: Commit**

```bash
git add src/layouts/components/Breadcrumb.astro
git commit -m "fix(breadcrumb): posts 탭 세그먼트를 페이지 번호로 오인하지 않도록 수정"
```

---

## Task 5: 번역 배지

**Files:**
- Create: `src/features/blog/components/TranslationBadge.astro`
- Modify: `src/features/blog/components/Card.astro`

**Interfaces:**
- Consumes: `isTranslatedPost(filePath)` (Task 1).
- Produces: 모든 목록의 카드에서 번역글에 "번역" 배지 표시.

- [ ] **Step 1: E2E 스펙에 배지 테스트 추가**

`e2e/posts-tabs.spec.ts`의 `describe` 블록 안에 추가:

```ts
  test("translated 탭 첫 카드에 번역 배지가 있다", async ({ page }) => {
    await page.goto("/posts/translated");
    const firstCard = page.locator("#main-content ul > li").first();
    await expect(
      firstCard.getByText("번역", { exact: true })
    ).toBeVisible();
  });

  test("authored 탭 카드에는 번역 배지가 없다", async ({ page }) => {
    await page.goto("/posts/authored");
    const cards = page.locator("#main-content ul > li");
    await expect(cards.getByText("번역", { exact: true })).toHaveCount(0);
  });
```

- [ ] **Step 2: 테스트를 실행해 실패하는지 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts -g "배지"`
Expected: FAIL — 배지가 아직 없어 translated 첫 카드에서 "번역" 텍스트를 못 찾음.

- [ ] **Step 3: 배지 컴포넌트 구현**

`src/features/blog/components/TranslationBadge.astro` (`DraftBadge.astro` 구조를 따르되 DEV 게이트 없이 프로덕션에서도 렌더, 중립 톤으로 DRAFT와 구분):

```astro
---
export interface Props {
  size?: "sm" | "md" | "lg";
  class?: string;
}

const { size = "sm", class: className } = Astro.props;

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};
---

<span
  class:list={[
    "inline-block rounded font-semibold",
    "border border-foreground/25 bg-foreground/5 text-foreground/70",
    sizeClasses[size],
    className,
  ]}
>
  번역
</span>
```

- [ ] **Step 4: Card에 배지 통합**

`src/features/blog/components/Card.astro`를 수정한다. import 블록에 추가:

```astro
import { isTranslatedPost } from "@/utils/isTranslatedPost";
import TranslationBadge from "./TranslationBadge.astro";
```

구조 분해 다음 줄(`const { title, ... } = data;` 아래)에 추가:

```astro
const isTranslated = isTranslatedPost(filePath);
```

`h2`·`h3` 두 변형 각각에서 `{draft && <DraftBadge class="me-2" />}` 다음에 배지를 추가한다. 두 곳 모두:

```astro
        <h2 {...headerProps}>
          {draft && <DraftBadge class="me-2" />}
          {isTranslated && <TranslationBadge class="me-2" />}
          <span>{title}</span>
        </h2>
```

```astro
        <h3 {...headerProps}>
          {draft && <DraftBadge class="me-2" />}
          {isTranslated && <TranslationBadge class="me-2" />}
          <span>{title}</span>
        </h3>
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `pnpm exec playwright test e2e/posts-tabs.spec.ts`
Expected: PASS — 배지 2개 테스트 포함 전체 통과.

- [ ] **Step 6: Commit**

```bash
git add src/features/blog/components/TranslationBadge.astro src/features/blog/components/Card.astro
git commit -m "feat(posts): 목록 카드에 번역 배지 추가"
```

---

## Task 6: CI 배선 + 전체 빌드 검증

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `scripts/check-post-classification.mjs` (Task 1).

- [ ] **Step 1: CI에 분류 검사 단계 추가**

`.github/workflows/ci.yml`에서 다음 단계를 찾는다:

```yaml
      - name: "🤖 Check Claude skill/agent assets"
        run: node scripts/check-claude-assets.mjs
```

그 바로 다음에 삽입:

```yaml
      - name: "🏷️ Check post classification"
        run: node scripts/check-post-classification.mjs
```

- [ ] **Step 2: 전체 빌드가 통과하고 정적 라우트가 생성되는지 확인**

Run: `pnpm build`
Expected: `astro check` 타입 에러 0, 빌드 성공. (Windows에서 마지막 `cp` 단계가 cmd에서 exit 1이어도 astro check·build·pagefind가 성공했으면 빌드 성공으로 판단한다.)

- [ ] **Step 3: dist에 탭 라우트와 페이지네이션이 생성됐는지 확인**

Run:
```bash
ls dist/posts/authored/index.html dist/posts/authored/2/index.html dist/posts/authored/4/index.html
ls dist/posts/translated/index.html dist/posts/translated/3/index.html
ls dist/posts/2/index.html
```
Expected: 모든 파일 존재 (자작 4페이지, 번역 3페이지, 기존 전체 페이지네이션 보존). `dist/posts/authored/5` 및 `dist/posts/translated/4`는 존재하지 않아야 한다.

- [ ] **Step 4: 분류 검사와 전체 E2E 최종 통과 확인**

Run:
```bash
node scripts/check-post-classification.mjs
pnpm exec playwright test e2e/posts-tabs.spec.ts e2e/listener-leak.spec.ts
```
Expected: 검사 `exit=0`, E2E 전부 PASS. (`listener-leak`은 새 JS가 없으므로 기존대로 통과해야 한다 — 회귀 없음 확인.)

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: 번역글 분류 무결성 검사 단계 추가"
```

---

## Self-Review

**1. Spec coverage** (스펙 각 요소 → 태스크 대응)

- 신호 = `contents/blog/translation/` 디렉터리 → Task 1 (`isTranslatedPost`)
- 라우트 `/posts/authored`·`/posts/translated`, 정적 페이지네이션 → Task 2
- 기존 `/posts` 불변 → Task 3 (탭만 추가), Task 6 Step 3 (dist/posts/2 보존 확인)
- 탭 UI, JS 0줄 → Task 3 (순수 `<a>`)
- 배지 전역, 제목 접두어 유지 → Task 5 (Card 6곳 공유), Global Constraints
- Breadcrumb 수정 필수 → Task 4
- 회귀 가드 `check-post-classification.mjs` + CI → Task 1, Task 6
- E2E `posts-tabs.spec.ts` → Task 2~5, `listener-leak` 확장 불필요 → Task 6 Step 4
- pagefind 영향 없음 → 별도 작업 없음 (목록은 원래 `data-pagefind-body` 없음)
- 홈 손대지 않음 → 배지는 Card 공유로 홈에도 자동 노출되나 글 순서 불변 (스펙의 배지 전역 결정과 일치)

갭 없음.

**2. Placeholder scan**: "TBD"·"적절히"·"추후" 없음. 모든 코드 블록은 실제 내용. 검증 명령마다 기대 출력 명시.

**3. Type consistency**: `isTranslatedPost(filePath: string | undefined): boolean`가 Task 1에서 정의되고 Task 2(라우트)·Task 5(Card)에서 동일 시그니처로 소비됨. `PostFilterTabs`의 `activeTab: "all" | "authored" | "translated"`가 Task 3에서 정의되고 Task 2 라우트에서 `"authored"`·`"translated"`, 전체 라우트에서 `"all"`로 사용됨 — 일치. `POST_TAB_LABELS` 키(`authored`·`translated`)가 URL 세그먼트와 일치.

**주의 사항 (실행자에게):**
- Task 2가 Task 3의 `PostFilterTabs`를 import하므로, Task 2 Step 5 검증은 Task 3 완료 후 수행한다. 두 태스크를 이어서 진행할 것.
- E2E는 dev 서버(`pnpm dev`, DEV 모드)로 돈다. draft 글 1편이 authored 탭에 포함되지만 "첫 페이지 8개"·"4페이지" 단언에는 영향 없다.
