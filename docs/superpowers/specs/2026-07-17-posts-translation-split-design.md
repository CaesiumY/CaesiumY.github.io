# 게시글 목록의 번역글 / 자작글 분리

- 날짜: 2026-07-17
- 브랜치: `translated-untranslated-posts-2dad97`
- 상태: 설계 승인 대기

## 왜 하는가

블로그 주인이 직접 쓴 글은 방문자가 "이 사람이 누구인지" 알 수 있는 유일한 통로다. 그런데 번역글이 최근 구간에 몰려 있어서 최신순 목록이 사실상 번역글 벽이 된다.

조사로 확인한 수치(총 45편 발행 = 자작 27 + 번역 18):

| 화면 | 번역 | 자작 | 비고 |
| --- | --- | --- | --- |
| 홈 Recent Posts (6) | 4 | 2 | 최신 3편 연속 번역 |
| `/posts` 1페이지 (8) | 5 | 3 | 최신 3편 연속 번역 |
| Featured (5) | 2 | 3 | 균형 |

번역이 전체의 40%인데 `claude-skills-guide` 6부작 등이 최근에 몰려서, 최신순 정렬이 곧 `[번역]` 나열이 된다. 처음 온 방문자가 보는 최신 글 3편이 전부 번역이다.

## 무엇으로 번역글을 식별하는가

번역글은 이미 `contents/blog/translation/` 아래에 물리적으로 분리되어 있고, `src/utils/getPath.ts`가 파일 경로의 디렉터리로 URL을 만들기 때문에 이미 `/posts/translation/<slug>`에 존재한다. **구분은 이미 공개 URL에 반영되어 있고, 화면에서만 쓰이지 않고 있다.**

신호 후보 검증 결과:

| 신호 | translation/ 18편 적중 | 그 외 27편 오탐 |
| --- | --- | --- |
| 디렉터리 `contents/blog/translation/` | 18 / 18 | 0 |
| 제목 `[번역]` 접두어 | 18 / 18 | 0 |
| 본문 원문 출처 인용 | 18 / 18 | 0 |
| 태그 `translation` | 18 / 18 | **1** |

태그는 쓸 수 없다. `contents/blog/ai/ai-translation-orchestration/index.md`가 오탐으로 걸린다 — 번역글이 아니라 번역 오케스트레이션에 *관한* 자작글인데, 주제 태그라서 똑같이 붙는다. 주제 태그는 "이것은 번역이다"(종류)와 "이것은 번역에 관한 글이다"(주제)를 구분하지 못한다.

이 오탐은 "태그 있는 글을 번역으로 모으기"뿐 아니라 **여집합으로 자작글을 정의할 때도 그대로 나타난다.** `!tags.includes("translation")`으로 자작글을 뽑으면:

| | 태그 신호 (`!includes`) | 디렉터리 신호 (`!isTranslated`) | 진실 |
| --- | --- | --- | --- |
| 자작글 | 26편 | 27편 | 27 |
| 번역글 | 19편 | 18편 | 18 |

`ai-translation-orchestration`(자작글)이 `translation` 태그 때문에 번역 집합으로 새어나가, 자작 26 / 번역 19가 된다. 하필 자작글을 → 번역 쪽으로 밀어내므로, "자작글 부각"이라는 목표와 정반대 방향의 실수다. 여집합 접근 자체는 옳지만(그것이 `/posts/authored` = `filter(post => !isTranslated(post))`의 메커니즘이다), 여집합을 정의하는 **신호원**이 태그가 아니라 디렉터리여야 오탐이 0이 된다.

태그 신호로 오탐 0을 만들려면 `ai-translation-orchestration`에서 `translation` 태그를 떼야 하는데, 그 글은 번역을 주제로 다루므로 태그가 정당하고 떼면 `/tags/translation` 주제 검색에서 누락된다. 디렉터리 신호는 그 글을 건드리지 않고도 오탐이 0이다(그 글은 `ai/`에 있다).

스키마의 `canonicalURL` 필드(`src/content.config.ts:21`)는 선언만 되어 있고 45편 전부 미사용이므로 신호로 쓸 수 없다.

**결론: 디렉터리를 신호로 쓴다.** 스키마 변경 없음, frontmatter 마이그레이션 없음, 45개 콘텐츠 파일 무수정.

## 확정된 결정

| 결정 | 선택 | 근거 |
| --- | --- | --- |
| 분리 방식 | 탭 (배지는 이후 철회) | 탭만으로는 "전체" 탭이 구분 없는 벽으로 남는다고 봤으나, 실제 화면에서 배지가 제목의 `[번역]` 접두어와 중복이라 제거했다 |
| 라우팅 | 정적 라우트 | 아래 "쿼리스트링을 쓰지 않는 이유" 참조 |
| URL | `/posts/authored`, `/posts/translated` | 아래 "URL 이름" 참조 |
| 제목 `[번역]` 접두어 | 유지 | `title`이 OG 이미지·RSS·`<title>`·`viewTransitionName`으로 전파되어 별개 작업 |
| 홈 글 순서 | 손대지 않음 | 이번 범위는 `/posts` |
| 배지 노출 | ~~모든 목록~~ → **없음** | 처음엔 일관성("번역글은 어디서든 번역글로 보인다")을 근거로 전역 적용했으나, 구현 후 실제 목록을 보니 제목이 이미 `[번역]`으로 시작해 배지가 같은 정보를 두 번 말했다. 제목 접두어를 유지하기로 한 이상 배지는 잉여여서 제거했다. `TranslationBadge.astro`도 삭제. |

### 쿼리스트링을 쓰지 않는 이유

`astro.config.ts`에 `output` 키가 없고(기본값 `static`), SSR 어댑터도 없고, GitHub Pages 배포다. 정적 파일 서버는 `/posts?filter=translated`에 그냥 `dist/posts/index.html`을 준다 — 쿼리스트링은 무시된다. 따라서 클라이언트 사이드 JS로만 구현 가능하다.

그런데 페이지네이션이 `src/pages/posts/[...page].astro:16`의 `paginate()`로 빌드 타임에 45편을 8개씩 잘라 6개의 HTML로 굳는다. 필터는 그 이후 각 파일 안에서 `<li>`를 숨길 뿐이라 "45편을 자른 뒤 남은 것"이 되지, "27편을 8개씩 자른 것"이 될 수 없다. 실제 결과:

```
현재 /posts 페이지네이션 (8개씩)
  1페이지: 자작 3 · 번역 5      4페이지: 자작 7 · 번역 1
  2페이지: 자작 1 · 번역 7      5페이지: 자작 8 · 번역 0
  3페이지: 자작 3 · 번역 5      6페이지: 자작 5 · 번역 0

?filter=translated 를 클라이언트에서 걸면
  1: 5편  2: 7편  3: 5편  4: 1편  5: 0편 ← 빈 페이지  6: 0편 ← 빈 페이지
```

푸터는 "6페이지 중 5"라고 말하는데 화면에 글이 없다. 쿼리스트링을 쓰려면 페이지네이션을 먼저 제거해야 하고, 이는 라우트 추가(순수 증분)보다 큰 변경이며 기존 기능을 없애는 쪽이다.

추가로 `?filter=authored`는 구글이 `/posts`와 같은 페이지로 취급해 독립 색인되지 않는다. 이 작업의 동기가 "다른 사람들이 나에 대해 알 수 있게"이므로 발견 가능성 손실은 목표와 정면 충돌한다.

| | 정적 라우트 | 쿼리스트링 |
| --- | --- | --- |
| 페이지네이션 | 탭별 정상 | 제거해야 함 |
| JavaScript | 0줄 | 필요 + 리스너 누수 대응 + E2E 확장 |
| 검색 색인 | 독립 색인 | `/posts`로 합쳐짐 |
| 첫 화면 | 즉시 정확 | 전체 뿌린 뒤 숨김 (깜빡임) |
| 롤백 | 파일 삭제 | 페이지네이션 복구 필요 |

### URL 이름

자작글 탭 이름으로 `original`·`written`·`mine`을 모두 기각했다. 셋 다 같은 이유로 깨진다 — 글의 **속성이나 소유권**으로 구분하려 했기 때문이다. 소유권으로는 안 갈린다(45편 전부 그의 것 — 번역도 그의 작업이다). 속성으로도 안 갈린다(45편 전부 한국어로 쓰여 있다). 특히 `original`은 번역글을 다루는 블로그에서 "번역의 원본 글(원문)"로 읽히는 게 가장 자연스러운 독해라 정반대 의미가 된다.

실제로 갈리는 축은 **그가 그 글을 만들 때 한 행위**다. 27편은 저술했고(authored), 18편은 번역했다(translated). 둘 다 그의 작업이지만 행위가 다르다.

`authored` / `translated`는 대칭이라는 부수 효과도 있다. 둘 다 대응 디렉터리가 없는 가상 필터이므로 양쪽 탭 모두 글을 클릭하면 섹션을 벗어난다(`/posts/authored` → `/posts/ai/xxx`, `/posts/translated` → `/posts/translation/xxx`). `original` + `translation` 조합이었다면 번역 탭만 섹션 안에 머물러 두 탭의 동작이 달랐을 것이다.

## 설계

### 라우트

| 경로 | 글 | 페이지 수 | 파일 |
| --- | --- | --- | --- |
| `/posts` | 45 (전체) | 6 | `src/pages/posts/[...page].astro` (기존, 탭만 추가) |
| `/posts/authored` | 27 | 4 | `src/pages/posts/authored/[...page].astro` (신규) |
| `/posts/translated` | 18 | 3 | `src/pages/posts/translated/[...page].astro` (신규) |

기존 `/posts`의 의미와 URL은 그대로 유지된다. 외부 링크·북마크가 깨지지 않는다. 신규 라우트는 순수 증분이다.

**라우트 충돌 없음**: `src/pages/posts/[...slug]/index.astro`는 실제 글 파일 경로에서 파생된 2세그먼트 경로(`translation/vibe-coder-vs-software-engineer`, `ai/xxx`)만 `getStaticPaths`로 생성한다. `authored`/`translated` 디렉터리는 `contents/blog/`에 존재하지 않으므로 겹치는 출력이 없다. 개발 서버에서도 정적 세그먼트가 rest 파라미터보다 우선한다.

### 컴포넌트

**`src/utils/isTranslatedPost.ts`** (신규)

`filePath`가 `contents/blog/translation/`으로 시작하는지 판별하는 순수 함수. `content.config.ts`의 `BLOG_PATH` 상수를 재사용한다. `filePath`는 `CollectionEntry`에서 optional이므로 `undefined`면 `false`를 반환해야 한다.

`filePath`가 상대 경로(`contents/blog/...`)라는 것은 기존 동작에서 증명된다 — 절대 경로였다면 `getPath.ts:15`의 `.replace(BLOG_PATH, "")`가 접두사를 남겨 URL이 깨졌을 텐데, `e2e/fixtures/test-posts.ts`가 `/posts/ai/claude-code-token-burning-session-retrospect`를 실제로 통과시키고 있다.

**`src/features/blog/components/PostFilterTabs.astro`** (신규)

`<a>` 3개. JavaScript 0줄. `Navigation.astro:16`의 `isActive` 패턴을 재사용해 현재 탭을 표시한다. 세 라우트가 공유한다.

정적 라우트를 고른 결정적 이유가 여기 있다. 클라이언트 사이드 토글이었다면 CLAUDE.md가 경고하는 View Transitions 리스너 누수 함정에 걸려 `e2e/listener-leak.spec.ts` 확장이 필요했을 것이다. JS가 없으므로 이 비용이 0이다.

**`src/features/blog/components/TranslationBadge.astro`** (신규)

`DraftBadge.astro`를 본뜨되 `import.meta.env.DEV` 게이트는 제거한다(프로덕션에 보여야 한다). `size` prop과 클래스 구성은 `DraftBadge`와 동일하게 맞춘다.

**`src/features/blog/components/Card.astro`** (수정)

`isTranslatedPost(filePath)`로 판별해 `draft && <DraftBadge/>` 옆에 배지를 렌더한다. Card는 이미 `filePath`를 props로 받고 있으므로 호출부 변경이 필요 없다.

Card는 6곳(`index.astro`, `posts/[...page].astro`, `tags/[tag]/[...page].astro`, `series/[series]/[...page].astro`, `drafts.astro`, `drafts/[...page].astro`)에서 공유되므로 배지는 홈·태그·시리즈에도 자동으로 나타난다. 이는 의도된 선택이다.

`/posts/translated` 탭에서는 18편 전부에 배지가 붙어 중복이지만, 예외를 두면 "어디서든 번역글로 보인다"는 규칙이 깨지므로 **항상 표시**한다. 받아들인 트레이드오프다.

**`src/layouts/components/Breadcrumb.astro`** (수정, 필수)

현재 `Breadcrumb.astro:11`이 `/posts/` 다음 세그먼트를 무조건 페이지 번호로 가정한다:

```js
if (breadcrumbList[0] === "posts") {
  breadcrumbList.splice(0, 2, `Posts (${breadcrumbList[1] || 1}페이지)`);
}
```

고치지 않으면 `/posts/authored`가 **"Home » Posts (authored페이지)"** 로 렌더된다. 같은 파일의 tags/series 브랜치는 이미 `!isNaN(Number(breadcrumbList[2]))` 가드를 쓰고 있으므로 그 패턴을 posts에 적용한다. `astro check`도 ESLint도 잡지 못하는 순수 논리 버그이므로 E2E로 검증해야 한다.

기존 글 상세 페이지는 영향 없다 — `PostDetails.astro`는 `Main.astro`/`Breadcrumb`을 사용하지 않는다.

### 검증

**`scripts/check-post-classification.mjs`** (신규) + `.github/workflows/ci.yml` 단계 추가

`contents/blog/translation/` 글 수와 `[번역]` 제목 접두어 수가 어긋나면 실패한다. 번역글을 엉뚱한 디렉터리에 넣으면 CI가 잡는다. 이 저장소엔 단위 테스트 인프라가 없고(`pnpm test`는 Playwright뿐), `scripts/check-*.mjs` + CI 단계라는 기존 관례(`check-agent-docs-sync.mjs`, `check-claude-assets.mjs`)가 있으므로 그것을 따른다. 새 의존성 0.

**`e2e/posts-tabs.spec.ts`** (신규)

- 세 탭 사이 이동과 활성 탭 표시
- 탭별 글 수와 페이지네이션 (`/posts/authored` 4페이지, `/posts/translated` 3페이지)
- `/posts/authored`의 브레드크럼이 "Posts (authored페이지)"가 아닐 것
- `/posts/translated` 목록의 모든 카드에 배지가 있을 것

`e2e/listener-leak.spec.ts`는 확장 불필요 — 새 JavaScript가 없다.

## 영향 범위

| 영역 | 영향 |
| --- | --- |
| 기존 `/posts` URL | 없음 (내용·페이지네이션 불변, 탭 UI만 추가) |
| 글 상세 URL | 없음 |
| RSS | 없음 (제목 유지 결정) |
| OG 이미지 | 없음 (제목 유지 결정) |
| pagefind 검색 | 없음 — `data-pagefind-body`가 `PostDetails.astro:84`에만 있어 목록 페이지는 원래 색인 대상이 아니다 |
| 홈 | 배지만 추가, 글 순서 불변 |
| 태그 / 시리즈 / 드래프트 | 배지만 추가 |
| 브레드크럼 | 수정 필요 (신규 라우트가 기존 가정을 깨뜨림) |
| 콘텐츠 파일 45개 | 없음 |

## 범위 밖

- 홈 Recent Posts 재편 (별도 판단 — 조사상 홈이 문제가 더 크지만 이번엔 제외)
- 번역글 18편의 제목/description에서 `[번역]` 접두어 제거
- `canonicalURL` 필드 활용 또는 스키마 정리
- `ai-translation-orchestration`의 `translation` 태그 정리 (태그를 신호로 쓰지 않으므로 무해)
- 태그 기반 분리 (기존 `/tags/translation` 재사용, 전용 마커 태그 도입) — 위 "무엇으로 번역글을 식별하는가"에서 오탐/비대칭으로 기각

## 열린 질문

없음.
