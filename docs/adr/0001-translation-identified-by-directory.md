# 번역글은 태그가 아니라 디렉터리로 식별한다

번역글 여부는 글이 `contents/blog/translation/` 아래에 있는지로 판정합니다(`isTranslatedPost()`). 이 구분은 이미 `/posts/translation/<slug>` URL에 반영돼 있어서 스키마를 바꾸거나 frontmatter를 마이그레이션할 필요가 없습니다. `translation` 태그는 신호로 쓰지 않습니다. 태그는 번역을 다룬 자작글(`ai-translation-orchestration`)까지 번역글로 잡아 버리기 때문입니다.

**Considered Options:** `translation` 태그(오탐 1건. 이 글에서 태그를 떼면 `/tags/translation` 주제 검색에서 빠집니다), 제목 `[번역]` 접두어(결정 당시 디렉터리와 똑같이 18/18 적중. 신호로는 디렉터리를 쓰고, 둘이 서로 맞는지는 `scripts/check-post-classification.mjs`가 CI에서 검사합니다), 스키마의 `canonicalURL`(발행된 글 중에는 설정한 글이 없음).
