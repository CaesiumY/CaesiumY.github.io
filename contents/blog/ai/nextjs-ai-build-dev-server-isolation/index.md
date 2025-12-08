---
title: "AI가 빌드하면 개발 서버가 죽는다? 환경 변수 한 줄로 해결하기"
description: "Claude Code, Cursor 등 AI 코딩 도구가 빌드를 실행해도 개발 서버가 죽지 않도록 하는 환경 변수 기반 빌드 격리 패턴"
pubDatetime: 2025-11-25T00:00:00Z
modDatetime: 2025-11-25T00:00:00Z
slug: "nextjs-ai-build-dev-server-isolation"
featured: true
draft: false
tags: ["nextjs", "ai", "claude-code", "dx", "tips"]
---

## 목차

## 문제 상황: AI가 빌드하면 개발 서버가 죽는다?

요즘 Claude Code, Cursor, Codex 같은 AI 코딩 도구를 사용하면서 개발하는 분들이 많아졌다. 나 역시 오래 전부터 Claude Code를 적극 활용하고 있는데, 어느 날 황당한 상황을 마주했다.

분명 `pnpm dev`로 개발 서버를 띄워놓고 작업 중이었는데, Claude Code가 코드 검증을 위해 `pnpm build`를 실행하자마자 **HMR(Hot Module Replacement)이 오작동하기 시작**했다. 심지어 개발 서버가 완전히 죽어버리는 경우도 있었다.

```
[문제 시나리오]
개발자: pnpm dev 실행 중 (HMR 활성)
    ↓
AI 도구: pnpm build 실행
    ↓
충돌: .next/ 디렉토리 동시 접근
    ↓
결과: HMR 오작동, 캐시 손상, 개발 서버 재시작 필요
```

처음에는 "AI한테 빌드하지 말라고 하면 되지 않나?"라고 생각했지만, 때로는 타입 체크나 빌드 검증이 필요한 상황이 있다. 그렇다고 매번 개발 서버를 끄고 빌드할 수도 없는 노릇이었다.

## 왜 이런 충돌이 발생하는가

문제의 핵심은 **`.next/` 디렉토리를 두 프로세스가 동시에 사용**한다는 점이다.

### 1. 빌드 캐시 충돌

```
개발 서버: .next/cache/webpack 사용 중
    ↓
AI 빌드: 동일 경로에 프로덕션 캐시 생성
    ↓
결과: 캐시 불일치로 인한 빌드 오류
```

개발 서버는 `.next/cache/webpack`에 개발용 캐시를 저장하고, 프로덕션 빌드는 같은 경로에 다른 형태의 캐시를 생성한다. 둘이 충돌하면 예상치 못한 오류가 발생한다.

### 2. HMR 오작동

Next.js 개발 서버는 `.next/` 디렉토리의 변경을 실시간으로 감지한다. AI 빌드가 이 디렉토리를 수정하면:

- 불필요한 전체 페이지 리로드 발생
- 컴포넌트 상태 손실
- 개발 흐름 중단

### 3. 파일 잠금(Lock) 이슈

운영 체제에 따라 빌드 중인 파일에 대한 접근이 차단될 수 있다.

```
Windows: 파일 잠금으로 인한 EBUSY 오류
macOS/Linux: 파일 교체 시 race condition 발생 가능
```

### 기존 해결책의 한계

| 접근 방식                | 문제점                               |
| ------------------------ | ------------------------------------ |
| "AI에게 빌드 금지"       | 빌드 검증이 필요한 상황에서 비효율적 |
| "개발 서버 중단 후 빌드" | 개발 흐름 방해, 수동 개입 필요       |
| "별도 터미널에서 빌드"   | 여전히 동일 디렉토리 사용으로 충돌   |
| "Docker 컨테이너 사용"   | 오버헤드 과다, 설정 복잡             |

## 해결책: 환경 변수 기반 빌드 격리

해결책은 의외로 간단하다. **환경 변수 `AI=1`을 사용하여 AI 빌드의 출력 디렉토리를 분리**하면 된다.

```bash
# 개발자 빌드 → .next/
pnpm build

# AI 빌드 → .next-ai/
AI=1 pnpm build
```

핵심 원리는 Next.js의 `distDir` 설정을 조건부로 변경하는 것이다.

```javascript
// next.config.mjs
distDir: process.env.AI ? ".next-ai" : undefined
```

이렇게 하면:
- `AI` 환경 변수가 있으면 → 빌드 출력을 `.next-ai/`로
- 없으면 → 기본값 `.next/` 사용

### 이 방식의 장점

| 이점            | 설명                                |
| --------------- | ----------------------------------- |
| **완전한 격리** | 파일 시스템 레벨에서 빌드 출력 분리 |
| **캐시 독립성** | Turborepo 캐시 키에 AI 변수 포함    |
| **개발 연속성** | HMR 및 개발 서버 중단 없음          |
| **단순한 구현** | 한 줄의 설정 변경으로 적용 가능     |

## 구현 방법

### Step 1: Next.js 설정 수정

`next.config.mjs` (또는 `next.config.js`)에 다음 한 줄을 추가한다.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 기타 설정

  // AI 빌드 격리: AI 환경 변수가 있으면 별도 디렉토리 사용
  distDir: process.env.AI ? ".next-ai" : undefined,
};

export default nextConfig;
```

`undefined`를 반환하면 Next.js는 기본값인 `.next/`를 사용한다.

### Step 2: Turborepo 설정 (모노레포 사용 시)

Turborepo를 사용한다면 `turbo.json`의 `env` 배열에 `AI`를 추가해야 캐시가 올바르게 분리된다.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV", "AI", "BASE_PATH"]
    }
  }
}
```

`env` 배열에 `AI`를 추가하면 캐시 키 계산에 포함되어, `AI=1` 빌드와 일반 빌드가 서로 다른 캐시를 사용하게 된다.

```
AI=undefined + NODE_ENV=production → 캐시 키 A
AI=1 + NODE_ENV=production         → 캐시 키 B

캐시 키 A ≠ 캐시 키 B → 서로 독립적인 캐시
```

### Step 3: .gitignore 업데이트

AI 빌드 출력 디렉토리를 버전 관리에서 제외한다.

```gitignore
# Build Outputs
.next/
.next-ai/
out/
build
dist
```

### Step 4: AI 도구 규칙 설정 (선택)

AI 도구에 빌드 규칙을 명시하면 일관성을 보장할 수 있다.

**Claude Code 예시** (`CLAUDE.md`):

```markdown
## Build Policy

| Command           | Usage       | When               |
| ----------------- | ----------- | ------------------ |
| `AI=1 pnpm build` | AI Build    | Only on request    |
| `pnpm build`      | ❌ Forbidden | Never use directly |
```

**Cursor 예시** (`.cursorrules`):

```
When running build commands, always prefix with AI=1:
- Correct: AI=1 pnpm build
- Incorrect: pnpm build
```

## 실제 사용 예시

### 동시 작업 시나리오

이제 개발 서버와 AI 빌드를 동시에 실행해도 충돌이 발생하지 않는다.

```
개발자                AI 도구                파일 시스템
   │                    │                       │
   │ pnpm dev           │                       │
   ├───────────────────────────────────────────→│ .next/
   │                    │                       │ (개발 서버 실행 중)
   │                    │                       │
   │ 코드 수정          │                       │
   ├───────────────────────────────────────────→│ .next/ HMR
   │                    │                       │
   │                    │ AI=1 pnpm build       │
   │                    ├──────────────────────→│ .next-ai/
   │                    │                       │ (별도 디렉토리)
   │                    │                       │
   │ (영향 없음)        │                       │
   │ HMR 계속 동작      │ 빌드 완료             │
   │                    │                       │
```

### 명령어 요약

| 실행 주체 | 목적      | 명령어            | 출력              |
| --------- | --------- | ----------------- | ----------------- |
| 개발자    | 개발      | `pnpm dev`        | `.next/` (런타임) |
| 개발자    | 빌드      | `pnpm build`      | `.next/`          |
| AI        | 빌드 검증 | `AI=1 pnpm build` | `.next-ai/`       |
| CI/CD     | 배포      | `pnpm build`      | `.next/`          |

### Windows에서 사용하기

Windows에서는 환경 변수 문법이 다르다.

**PowerShell**:
```powershell
$env:AI="1"; pnpm build
```

**CMD**:
```cmd
set AI=1 && pnpm build
```

**Cross-platform (cross-env)**:
```bash
npx cross-env AI=1 pnpm build
```

## 다른 프레임워크에도 적용하기

이 패턴은 Next.js 외에도 다른 빌드 도구에 적용할 수 있다.

### Vite 프로젝트

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: process.env.AI ? 'dist-ai' : 'dist',
  },
});
```

**.gitignore :**
```gitignore
dist/
dist-ai/
```

## 마무리

AI 코딩 도구와 함께 개발하는 시대가 오면서, 기존에는 생각하지 못했던 새로운 문제들이 등장하고 있다. 개발 서버와 AI 빌드의 충돌도 그중 하나다.

다행히 환경 변수 기반 빌드 격리라는 간단한 패턴으로 이 문제를 해결할 수 있다. 핵심은 단 한 줄이다.

```javascript
distDir: process.env.AI ? ".next-ai" : undefined
```

이제 `pnpm dev`로 개발 서버를 띄워놓고, Claude Code가 `AI=1 pnpm build`로 빌드 검증을 해도 개발 서버는 영향을 받지 않는다. AI와 인간이 서로의 작업을 방해하지 않고 협업할 수 있게 된 것이다.

AI 코딩 도구를 사용하는 개발자라면 한 번 적용해 보길 권한다. 설정은 5분이면 끝나지만, 개발 경험은 확실히 달라질 것이다.

## AI Agent에게 전달할 프롬프트

아래 프롬프트를 Claude Code, Cursor, 또는 다른 AI 코딩 도구에 복사해서 붙여넣으면, AI가 자동으로 빌드 격리 패턴을 프로젝트에 적용해준다. 물론 아래 프롬프트도 AI가 만들어줬다:)

````
이 Next.js 프로젝트에 AI 빌드 격리 패턴을 적용해줘.

## 문제
AI 코딩 도구(너)가 `pnpm build`를 실행하면 개발자의 개발 서버와 충돌이 발생해.
둘 다 `.next/` 디렉토리를 사용하기 때문에 HMR 오작동, 캐시 손상, 개발 서버 크래시가 일어나.

## 해결책
환경 변수 `AI=1`을 사용해서 AI 빌드의 출력 디렉토리를 `.next-ai/`로 분리해.

## 적용해야 할 변경사항

### 1. next.config.mjs (또는 next.config.js)
`distDir` 설정 추가:
```javascript
distDir: process.env.AI ? ".next-ai" : undefined,
```

### 2. .gitignore
다음 라인 추가:
```
.next-ai/
```

### 3. turbo.json (Turborepo 사용 시)
`build` 태스크의 `env` 배열에 `"AI"` 추가:
```json
"env": ["NODE_ENV", "AI"]
```

### 4. CLAUDE.md 또는 .cursorrules (선택)
AI 도구 규칙 파일에 다음 빌드 정책 추가:
```markdown
## Build Policy

| Command           | When             |
| ----------------- | ---------------- |
| `AI=1 pnpm build` | 빌드 검증 필요시 |
| `pnpm build`      | ❌ 사용 금지      |

빌드 명령 실행 시 반드시 `AI=1` prefix 사용.
```

## 완료 후 확인
1. `AI=1 pnpm build` 실행해서 `.next-ai/` 디렉토리가 생성되는지 확인
2. `.next/` 디렉토리는 건드리지 않았는지 확인

이제 적용해줘.
````

위 프롬프트를 AI에게 전달하면, 프로젝트 구조를 분석하고 필요한 파일들을 자동으로 수정해준다.

## 참고 자료

- [Next.js Configuration: distDir](https://nextjs.org/docs/app/api-reference/next-config-js/distDir)
- [Turborepo: Environment Variables](https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables)
