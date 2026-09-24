# translate-writer는 Task 기반 오케스트레이터-워커로 돌린다

`/translate-writer`의 메인 루프는 조율만 맡습니다(Task 호출, 점수 판정, `✋ GATE`, 사용자가 고른 수정 적용). 번역·검토·다듬기는 `.claude/agents/` frontmatter의 모델 별칭(haiku|sonnet|opus)을 쓰는 전담 에이전트가 하고, 서로 독립인 Task는 병렬로 호출합니다. Workflow 도구를 오케스트레이터로 두고 모드별로 모델을 바꾸던 이원 구조는 걷어냈습니다. 이 스킬이 실제로 실행되는 곳은 Opus 메인 루프이고, 그 설계가 기대던 Fable 5는 사용 기한이 있었기 때문입니다.
