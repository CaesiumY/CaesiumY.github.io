# CLAUDE.md

Guide for Claude Code (claude.ai/code) when working with code in this repository.

<!-- 이 저장소의 지침 정본은 AGENTS.md 하나입니다. 공통 내용은 AGENTS.md만 고치세요. -->
<!-- 아래 @AGENTS.md 는 Claude Code의 import 문법으로, 세션 시작 시 AGENTS.md 전문을 이 자리에 펼쳐 읽습니다. -->
<!-- Windows에서는 심링크에 관리자 권한이 필요해 공식 문서가 import 방식을 권장합니다. -->

@AGENTS.md

---

아래는 Claude Code 전용 내용입니다. Codex에는 해당하지 않으므로 AGENTS.md에는 넣지 마세요.

## Skills (Claude Code 스킬 시스템)

`.claude/skills/`에 정의된 스킬들입니다. `/스킬이름`으로 호출합니다.

- `/translate-writer` — 영어 → 한국어 번역 파이프라인 (에이전트 6개 · 오케스트레이터-워커)
- `/blog-writer` — 한국어 블로그 글 작성 (에이전트 4개)
- `/polish`, `/polish-file` — 개별 문장 / 파일 전체 다듬기
- `/agents-md-optimizer` — CLAUDE.md/AGENTS.md discoverability 최적화
- ⚠️ 이력서·포트폴리오·면접 준비는 이 레포에 없습니다 — `interview-agents` 플러그인을 사용하세요 (`/interview-agents:portfolio`, `/interview-agents:review-resume` 등 8개 커맨드). 레포판 `/portfolio-strategy`·`/resume-specialist`는 중복이라 삭제했습니다
- 커리어 데이터(인터뷰 노트·포트폴리오 드래프트)는 `contents/career/`에 있고 gitignore 대상입니다 — 옵시디언 볼트(`contents/`)에서 편집하되 커밋되지 않습니다
- ⚠️ 커리어 커맨드는 반드시 `contents/career/`를 cwd로 두고 실행하세요. 플러그인은 산출물을 **실행한 cwd 기준** `portfolio/`·`resumes/`·`assignments/`에 씁니다 — 레포 루트에서 실행하면 개인 데이터가 볼트 밖으로 흩어집니다(세 경로 모두 gitignore로 막아뒀지만 위치가 틀어집니다). 사용법 전체는 `contents/career/README.md` 참조
- 에이전트 정의: `.claude/agents/` · 번역 스타일 가이드/용어집: `.claude/skills/translate-writer/data/`
- 28개 번역투 패턴의 단일 정본: `.claude/skills/translate-writer/references/translation-patterns.md` — 패턴 번호를 다른 파일에 복사하지 말 것
- 번역 파이프라인은 오케스트레이터-워커 구조 — 메인 루프(Opus)는 조율 전용, 번역·검토·다듬기는 frontmatter 모델(haiku|sonnet|opus)의 전담 에이전트가 수행 (translate-writer SKILL.md '오케스트레이션 원칙' 섹션 참조)
- 사용자 게이트는 `✋ GATE N — AskUserQuestion` 표기로 통일 — 게이트에서 AskUserQuestion 없이 다음 Phase 진행 금지
