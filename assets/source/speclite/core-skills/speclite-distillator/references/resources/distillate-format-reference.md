# Distillate Format Reference

This reference defines the expected structure for SpecLite distillates. A distillate is lossless compression for LLM consumption, not a human summary.

## Single Distillate Frontmatter

```yaml
---
type: speclite-distillate
sources:
  - "relative/path/to/source-1.md"
  - "relative/path/to/source-2.md"
downstream_consumer: "general"
created: "YYYY-MM-DD"
token_estimate: 1234
parts: 1
---
```

## Split Distillate Layout

```text
example-distillate/
  _index.md
  01-topic-slug.md
  02-topic-slug.md
```

`_index.md` contains orientation, a section manifest, cross-cutting items, and frontmatter with source paths relative to the distillate folder.

Each section file is independently loadable and begins with a one-line context header: `This section covers <topic>. Part N of M.`

## Content Rules

- Use bullets, tables, and structured records instead of prose paragraphs.
- Preserve facts, decisions, constraints, relationships, owners, dates, numbers, and rationale.
- Remove repetition, narrative padding, filler transitions, and decorative language.
- Each bullet must be self-contained; avoid unclear antecedents like `it`, `this`, or `the above`.
- Group by semantic topic, not arbitrary token count.
- Include enough context for downstream LLM workflows to operate without opening the original source.

## Validation Rules

- Every source heading that carries unique information appears directly or is represented by an equivalent semantic bullet.
- Every named entity returned by the compressor appears in the distillate unless intentionally excluded with reason.
- Source paths are relative to the distillate output location.
- The distillate contains no unsupported claims that cannot be traced to source material.
