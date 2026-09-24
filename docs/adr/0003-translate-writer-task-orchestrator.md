# translate-writer는 Task 기반 오케스트레이터-워커로 돌린다

`/translate-writer`의 메인 루프는 조율만 맡습니다: 인자 파싱, Task 호출, 점수 임계값 판정, `✋ GATE` AskUserQuestion, 사용자가 고른 수정안 적용. 번역·검토·다듬기는 `.claude/agents/` frontmatter에 적힌 모델 별칭(haiku|sonnet|opus)을 쓰는 전담 에이전트가 수행하고, 서로 의존하지 않는 Task는 병렬로 호출합니다. 한때 Workflow 도구를 오케스트레이터로 쓰고 모드별로 모델을 바꾸는 이원 구조를 만들었지만 걷어냈습니다. 이 스킬이 실제로 실행되는 곳은 Opus 메인 루프이고, 그 설계가 기대던 모델(Fable 5)은 사용 기한이 있었기 때문입니다. 모드별 모델 오버라이드는 그것을 결정적으로 적용할 실행 지점이 사라져서 두지 않습니다.
