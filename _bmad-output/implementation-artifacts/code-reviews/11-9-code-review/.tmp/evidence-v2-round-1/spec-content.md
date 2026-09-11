# Story 11.9 Acceptance Input（Story 11.9 验收输入）

- Story identity：`11-9` / `11-9-normalize-code-review-artifact-directories-by-story-id`。
- AC1–3：新 CR run 只使用 `{implementation_artifacts}/code-reviews/{storyId}-code-review/`；`storyId` 仅由规范数字编号归一，title/name/slug/filename/中文/空格/标点均不得参与目录名。
- AC4–7：orchestrator 每个 Story 只解析一次 canonical `crDir`，并将同一 verified `crDir` 传播给 CR01–06、review/evaluation/fix/rules/TODO/finalizer、`.tmp/`、goal records、help、metadata、scripts、fixtures 与 docs。
- AC8–9：existing title-bearing CR directories 不迁移；唯一 unfinished legacy-only run 原位恢复；canonical 与 unfinished legacy、多个 unfinished legacy或 unsafe/ambiguous evidence 必须 stable diagnostic + stop-before-write。
- AC10–11：active title-bearing pattern negative scan 为零；测试覆盖 numeric-only、任意 title、single propagation、goal records、legacy-only、dual-dir ambiguity 与 traversal safety。
- AC12：不得改变 report basenames、CR algorithm、round numbering 或 approval rules。

## Anchor Contract Map（锚点契约映射）

- Contract Anchor：shared `speclite-code-review-contract/references/cr-contract.md` 的 numeric identity、canonical path、resolver CLI/module input matrix、recovery matrix 与 stable diagnostic。
- Functional Anchor：单次解析/全链传播、legacy no-migration、single-directory continuation、ambiguity fail-close 和 zero progress mutation。
- Evidence Anchor：`test/code-review-contract.test.ts`、`test/fixtures/code-review-contract/title-bearing-path-ledger.json`、当前 resolver bytes、focused test 与 negative scan assertions。
- Guidance Anchor：Skill/help/docs/changelog 的路径传播面；只有与 owning contract/functional behavior 不一致时才构成阻塞。
