# 번역 완료 출력 템플릿

작업 완료 시 아래 형식으로 출력하세요.

```
📝 번역 완료
─────────────────────────────────────

✅ 원문: [원문 제목]
✅ 번역 제목: [한글 제목]
✅ 파일: contents/blog/translation/[slug]/index.md
✅ 모드: [quick|thorough|perfect]
✅ 한국어 품질 점수: X/10
✅ 원문 충실도 점수: X/10
✅ 상태: draft: true

📊 검토 히스토리:
- 1차: 품질 X점 / 충실도 X점 → 수정
- 2차: 품질 X점 / 충실도 X점 → 통과

📝 Polish (thorough/perfect만):
- 분석 문장: N개
- 개선 완료: M개
- 평균 점수 변화: X.X → Y.Y

📚 학습된 내용:
- [피드백 요약]

📖 용어집 업데이트:
- [새 용어 (있으면)]

─────────────────────────────────────
💡 발행하려면: frontmatter의 draft: false로 변경
📄 Polish 리포트: .claude/polish-reports/[slug]-[timestamp].json
```
