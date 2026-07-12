# translate-writer 오케스트레이터-워커 개선 설계 (rev.2)

- **작성일**: 2026-07-12
- **대상 파일**: `.claude/skills/translate-writer/SKILL.md` · `.claude/agents/translation-learner.md` ·
  `.claude/skills/polish-file/SKILL.md` · `scripts/check-claude-assets.mjs` · `CLAUDE.md`/`AGENTS.md`
- **유형**: 스킬 오케스트레이션 구조 개선 + 회귀 방지 린트 확장

## 요구사항 정정 히스토리

1차 설계(같은 파일의 이전 버전)는 "Fable 5의 Workflow 도구를 오케스트레이터로, 하위 모델 서브
에이전트를 워커로 쓰고 Fable 5는 오케스트레이션만 담당한다"를 **스킬 자체의 실행 방식**으로
오독했다. 이 설계는 Workflow 정본 문서(`references/workflow-orchestration.md`)와 SKILL.md의
Workflow 우선 경로·Task 폴백 이원 구조로 구현됐었다.

사용자 정정(2026-07-12): 위 요구사항은 **이번 개선 작업 자체를 수행하는 방식**에 대한 지시였다 —
개선 작업을 담당하는 Fable 5가 콘텐츠 작업까지 직접 하지 말고 하위 모델 서브 에이전트에 위임하며,
Fable 5 자신은 조율만 하라는 뜻. `/translate-writer` 스킬이 **미래에 실행되는 환경**은 Fable
Workflow가 아니라 **Opus 메인 루프**다. 또한 Fable 5는 2026-07-12까지만 사용 가능해, Workflow
도구에 의존한 설계는 애초에 존속 조건이 없었다. 이에 따라 Workflow 경로 전체를 걷어내고 스킬을
Task 기반 오케스트레이터-워커 구조로 다시 세운다.

## 최종 설계

### Task 기반 오케스트레이터-워커 3원칙 (SKILL.md `오케스트레이션 원칙` 섹션)

1. **메인 루프는 조율 전용** — 인자 파싱, Task 호출, 점수 판정(에이전트가 보고한 차원 점수에
   하드 임계값 규칙 적용), 게이트(AskUserQuestion), 사용자가 선택한 개선안의 Edit 적용, 결과
   보고만 수행한다. 번역·검토·다듬기 결과물을 직접 생성하거나 채점하지 않는다.
2. **콘텐츠 작업은 frontmatter 모델 전담 에이전트** — 각 에이전트의 모델은 `.claude/agents/`
   frontmatter의 별칭(haiku|sonnet|opus)을 그대로 따른다. 모드별(quick/perfect) 모델 오버라이드는
   두지 않는다 — Workflow 스크립트가 사라져 오버라이드를 결정적으로 적용할 실행 지점이 없다.
3. **독립 Task는 병렬 호출** — Phase 2의 reviewer·verifier처럼 서로 의존하지 않는 Task는 한
   메시지에서 동시에 호출한다.

### 게이트 표기 통일

3회 미달 시 사용자 결정(조건부), Phase 3 다듬기 진행 여부, Phase 4 최종 승인을 각각
`✋ GATE 0 — AskUserQuestion (조건부)` / `✋ GATE 1` / `✋ GATE 2`로 번호를 통일했다. 모든 게이트는
Task 호출과 마찬가지로 메인 루프에서만 실행되며, AskUserQuestion 없이 다음 Phase로 진행하지
않는다.

### Phase 3 batch 옵션 재사용

`/polish-file`의 Step 1(batch 분석)이 문장별 점수·패턴·개선 옵션을 한 번에 반환하므로, Phase 3의
순차 개선(Step 4)은 이 batch 결과를 그대로 재사용해 옵션을 제시한다. 파일이 그 사이 수정됐거나
사용자가 재분석을 요청한 문장에 한해서만 polish-agent를 다시 호출한다 — 이전에는 문장마다
polish-agent를 재호출했던 비용을 없앤다.

## 유지된 부수 개선

- `scripts/check-claude-assets.mjs` 검사 4(에이전트 배선)를 확장: `subagent_type`(Task)에 더해
  `agentType`(향후 오케스트레이션 스크립트를 대비한 참조 패턴)도 검사하고, 스캔 범위를 SKILL.md +
  `skills/<x>/references/*.md`로 넓혔다. Workflow 경로는 사라졌지만 이 검사 자체는 참조 문서의
  에이전트 배선 오류를 잡아내는 일반 회귀 방지 장치로 남긴다.
- `.claude/agents/translation-learner.md`에 `samples/` 심링크 절차를 명시(`ln -s`), Windows에서
  실패·복사본 생성 시 `git update-index --add --cacheinfo 120000,...`로 git 심링크를 직접
  등록하고 `git ls-files -s`로 mode 120000을 검증하는 폴백을 추가했다.
- `.claude/skills/polish-file/SKILL.md`의 `argument-hint`에 `--report-only`를 추가했다.
- `CLAUDE.md`/`AGENTS.md`는 위 린트 확장 설명 라인을 미러로 갱신했고, CLAUDE.md의 Skills 섹션에
  `/translate-writer`가 오케스트레이터-워커 구조임을 한 줄 추가했다(AGENTS.md는 Skills 섹션이
  갈라지는 지점이라 미러 대상 아님).

## 제거된 것

- Workflow 스크립트 정본 문서 `.claude/skills/translate-writer/references/workflow-orchestration.md`
  삭제.
- SKILL.md에서 Workflow 우선 경로(Phase 1+2/Phase 3의 `translate-verify`·`polish-batch` Workflow
  호출과 Task 폴백의 이원 구조), 모드별 모델 오버라이드 라우팅 표, `allowed-tools`의 `Workflow`
  항목을 모두 제거했다. 모델은 Task 호출 시 에이전트 frontmatter 별칭으로 고정된다.

## 검증

- `node scripts/check-claude-assets.mjs` — 스킬/에이전트 배선·모델 별칭·경로 참조 검사 통과
- `node scripts/check-agent-docs-sync.mjs` — CLAUDE.md/AGENTS.md 미러 동기화 통과
- 변경 파일 대상 prettier(전체 재포맷 금지 — Windows CRLF 거짓 양성)

`.agents/`(Codex 트리)는 Fable/Workflow 전용 개념을 담고 있지 않아 이번 변경 대상이 아니다.
