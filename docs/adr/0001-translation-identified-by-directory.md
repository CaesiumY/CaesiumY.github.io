# 번역글은 태그가 아니라 디렉터리로 식별한다

번역글인지는 글이 `contents/blog/translation/` 아래에 있는지로만 판정합니다(`isTranslatedPost()`). `translation` 태그는 신호로 쓰지 않습니다. 태그는 "번역한 글"이라는 종류와 "번역을 다룬 글"이라는 주제를 구분하지 못하기 때문입니다. 실제로 번역 오케스트레이션을 다룬 자작글(`ai-translation-orchestration`)이 태그 기준으로는 번역글로 분류됐습니다. 디렉터리 기준은 오탐 0건이고, 스키마나 frontmatter도 바꿀 필요가 없었습니다. 디렉터리와 제목의 `[번역]` 접두어가 늘 일치하도록 `scripts/check-post-classification.mjs`가 CI에서 검사합니다.

**Considered Options:** `translation` 태그(오탐 1건. 오탐을 없애려면 정당한 주제 태그를 떼야 합니다), 제목의 `[번역]` 접두어(적중률은 같지만 사람이 쓴 문자열이라 오타에 취약해서, 신호가 아니라 검사 대상으로 둡니다), 스키마의 `canonicalURL`(선언만 있고 쓰는 글이 없음).
