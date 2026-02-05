# 번역 시리즈 목록

> 이 파일은 번역 시리즈 데이터를 관리합니다.
> 새 시리즈 추가 시 아래 표에 행을 추가하세요.

---

## 시리즈 목록

| URL 패턴 | 시리즈명 | 설명 |
|----------|----------|------|
| `claude.com/blog/*` | Claude 공식 블로그 번역 | Anthropic Claude 공식 블로그 글 |

---

## 새 시리즈 추가 방법

1. 위 표에 새 행 추가
2. URL 패턴: 감지할 URL 패턴 (예: `example.com/blog/*`)
3. 시리즈명: Frontmatter의 `series` 필드에 들어갈 값
4. 설명: 시리즈에 대한 간단한 설명

---

## 예시

새 시리즈를 추가하려면:

```markdown
| `vercel.com/blog/*` | Vercel 공식 블로그 번역 | Vercel 공식 블로그 글 |
```

이렇게 추가하면 `vercel.com/blog/` URL 번역 시 자동으로 시리즈가 적용됩니다.
