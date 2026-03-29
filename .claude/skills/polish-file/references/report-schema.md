# polish-file JSON 리포트 스키마

**파일 경로**: `.claude/polish-reports/[slug]-[timestamp].json`

```json
{
  "metadata": {
    "file": "contents/blog/translation/.../index.md",
    "analyzed_at": "2026-01-16T10:30:00Z",
    "total_sentences": 145,
    "sentences_below_threshold": 12,
    "average_score": 9.2,
    "threshold": 9.5,
    "is_translation": true,
    "source_url": "https://example.com/original-article",
    "source_title": "Original Article Title"
  },
  "sentences": [
    {
      "id": 1,
      "line": 45,
      "original": "이 기능을 활용하면...",
      "source": "This feature can significantly improve...",
      "source_validation": {
        "meaning_preserved": false,
        "issues": [{"type": "missing", "description": "significantly 누락"}]
      },
      "score": 9.3,
      "patterns": ["#1", "#10"],
      "options": [],
      "status": "pending",
      "selected_option": null
    }
  ],
  "progress": {
    "completed": 0,
    "total": 12
  }
}
```
