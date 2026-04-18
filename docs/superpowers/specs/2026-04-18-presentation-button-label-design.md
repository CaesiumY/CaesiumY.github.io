# 프레젠테이션 모드 버튼 텍스트 라벨 추가

- **작성일**: 2026-04-18
- **대상 파일**: `src/features/blog/components/PresentationModeButton.astro`
- **유형**: UI 개선 (시각적 가시성 향상)

## 배경

포스트 상세 페이지(`PostDetails` 레이아웃, `PostMetadata` 컴포넌트)에는 프로젝터 아이콘(`ph:projector-screen`)만 표시되는 프레젠테이션 모드 트리거 버튼이 있다. 이 버튼은 런타임에 H2 ≥ 2개인 포스트에서만 `hidden = false`로 노출된다.

현재는 아이콘 단독 노출이라 **기능이 무엇인지 시각적으로 식별하기 어렵다**. 호버 시 `title` 속성으로 "프레젠테이션 모드 (Shift+P)"가 보이지만, 호버 이전에는 발견 자체가 어렵다. 특히 같은 줄에 있던 `EditPost` 버튼이 현재 설정(`SITE.editPost.enabled`)상 비활성 상태라 이 버튼이 포스트 메타 영역의 유일한 액션 버튼으로 기능하므로, 가시성 확보가 더욱 중요하다.

## 목표

아이콘 옆에 `"프레젠테이션 모드"` 텍스트 라벨을 추가해 버튼의 기능을 즉시 식별 가능하게 한다.

## 범위 (In Scope)

- `PresentationModeButton.astro` 단일 파일에 `<span>프레젠테이션 모드</span>` 추가
- 기존 동작(런타임 `hidden` 토글, 모바일 숨김, 단축키, 접근성 속성, 스타일)은 그대로 유지

## 범위 외 (Out of Scope)

- 단축키(`Shift+P`)의 시각적 노출 — 현재처럼 `title` 툴팁과 `aria-keyshortcuts`로만 유지
- `EditPost` 버튼 스타일 변경 — 비활성 상태이므로 건드릴 필요 없음
- 모바일에서의 버튼 노출 — 프레젠테이션 모드는 데스크탑 전용이라 `max-sm:hidden` 유지
- 아이콘 교체나 컬러/사이즈 변경

## 결정 사항

### D1. 라벨 문구: `"프레젠테이션 모드"`

- `aria-label="프레젠테이션 모드 시작"` 및 `title="프레젠테이션 모드 (Shift+P)"`와 일관된 표현
- E2E 테스트(`e2e/presentation-mode.spec.ts`)의 `aria-label` 단언과 충돌 없음

### D2. 단축키는 시각적으로 노출하지 않음

- 주 목적은 "기능 식별 가능성 확보"이지 "단축키 홍보"가 아님
- 단축키 정보는 `title` 툴팁으로 이미 제공 중

### D3. 스타일은 현재 값 그대로 유지

- 클래스: `flex items-center gap-1.5 p-2 opacity-80 transition-all duration-200 hover:text-accent max-sm:hidden sm:p-1`
- 이유: 옆 `EditPost`가 비활성 상태라 스타일 통일 필요 없음. 기존 패딩/트랜지션은 터치/호버 UX에 기여하므로 유지.

## 구현 변경점

`src/features/blog/components/PresentationModeButton.astro`:

```diff
   <Icon name="ph:projector-screen" size={20} />
+  <span>프레젠테이션 모드</span>
 </button>
```

전체 파일 예상 상태:

```astro
---
import { Icon } from "astro-icon/components";
---

<!--
  프레젠테이션 모드 트리거 버튼.
  - 초기에는 `hidden` 속성으로 렌더되지만 비표시.
  - src/features/blog/scripts/presentationMode.ts가 슬라이드 가능 여부(H2 ≥ 2개 등)를
    런타임에 판정해 `button.hidden = false`로 노출한다.
  - 모바일에서는 `max-sm:hidden`으로 완전히 숨김.
-->
<button
  type="button"
  data-button="presentation-start"
  class="flex items-center gap-1.5 p-2 opacity-80 transition-all duration-200 hover:text-accent max-sm:hidden sm:p-1"
  aria-label="프레젠테이션 모드 시작"
  title="프레젠테이션 모드 (Shift+P)"
  aria-keyshortcuts="Shift+P"
  hidden
>
  <Icon name="ph:projector-screen" size={20} />
  <span>프레젠테이션 모드</span>
</button>
```

## 영향 분석

| 영역 | 영향 여부 | 비고 |
|------|----------|------|
| `presentationMode.ts` 런타임 로직 | ❌ 없음 | `[data-button="presentation-start"]` 셀렉터 및 `.hidden` 토글만 사용 |
| E2E 테스트 (`e2e/presentation-mode.spec.ts`) | ❌ 없음 | `data-button` attribute, `aria-label`, `aria-keyshortcuts`만 검증 |
| 접근성 (SR 사용자) | ➖ 중립 | `aria-label`이 이미 완전한 문장이라 추가 `<span>`은 중복 낭독되지 않음 (label 우선) |
| 모바일 | ❌ 없음 | `max-sm:hidden`으로 계속 숨김 |
| 다크 모드 | ❌ 없음 | 텍스트 색상은 부모로부터 상속 (`hover:text-accent`가 이미 적용 중) |

## 검증 방법

1. **로컬 개발 서버**: `pnpm dev` → H2 ≥ 2개인 포스트(예: 번역 글) 접속 → 버튼에 "프레젠테이션 모드" 텍스트 노출 확인
2. **빌드 산출물 검증** (CLAUDE.md 가이드라인): `pnpm build` → `dist/posts/<slug>/index.html`에서 버튼 렌더링 확인
3. **E2E 테스트**: `pnpm test:e2e` (또는 해당 스크립트)로 `presentation-mode.spec.ts` 전체 통과 확인
4. **H2가 부족한 포스트**: 버튼이 여전히 `hidden` 상태로 유지되는지 확인 (기존 동작 회귀 없음 검증)
5. **모바일 뷰포트**: `max-sm` 이하 해상도에서 버튼이 보이지 않음 확인

## 리스크 및 완화

- **리스크**: 텍스트 추가로 버튼 너비가 커져 좁은 데스크탑 폭에서 메타 영역이 줄바꿈될 가능성
- **완화**: 부모 컨테이너가 이미 `flex flex-wrap items-center gap-2`를 사용하므로 자연스럽게 다음 줄로 넘어감. 시각적 문제 없음.

- **리스크**: 스크린 리더가 `aria-label`과 `<span>` 텍스트를 중복 낭독
- **완화**: WAI-ARIA 사양상 `aria-label`이 있으면 내부 텍스트는 무시됨. 실제 중복 낭독 없음.
