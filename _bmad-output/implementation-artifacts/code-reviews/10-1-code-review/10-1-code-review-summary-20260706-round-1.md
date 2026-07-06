---
Story: 10-1
Round: 1
Date: 2026-07-06
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前 fresh sub-agent 环境不可用，已按 reviewer skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 均由当前模型按各自视角完成，未发生单层失败。

本轮在 Story 10.1 范围内发现 1 个 AC 覆盖缺口：interactive install 仍是一次性 exact module code 输入，没有实现 AC5 要求的 category -> ecosystem id 两级选择。建议结论：不通过，需 patch 后复审。

## 新发现

### 1. [中] Interactive install 未实现 category -> ecosystem id 的两级选择

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - Story 10.1 AC5 要求 interactive `speclite install` 先展示 ecosystem category selection，并在用户选择 category 后只显示该 category 下的 ecosystem ids：`_bmad-output/implementation-artifacts/stories/10-1-ecosystem-module-taxonomy-and-guided-selected-install-closure.md:47-54`。
  - CLI wiring 只有一个 module selection prompt：`src/bin/speclite.ts:367-370` 调用 `createModuleSelectionQuestion(...)` 后直接用 `parseModuleSelectionAnswer(...)` 解析一次输入。
  - 当前 prompt 只是把 category 和 id 展示在同一段文本中，并要求输入 exact module code：`src/bin/speclite.ts:455-507`。
  - 现有测试只验证 `ModuleSelectionPromptInput.ecosystemCategories` 数据结构和 programmatic selection，可见于 `test/install-module-selection.test.ts:231-255`、`test/install-module-selection.test.ts:270-284`；未覆盖真实 CLI category-first 交互。

- **影响**
  - interactive 用户不会经历 Story 要求的“前端 / 后端 / 其他 / skip”到具体 ecosystem id 的两级选择，实际 UX 与 AC5 不一致。
  - 后续新增 frontend / other ecosystem 后，用户仍必须知道 exact module code，降低引导选择价值，也无法证明“选择 category 后只能看到该 category 下 ecosystem ids”。

- **建议**
  - 在 CLI 交互层增加真正的两步选择：第一步选择 `frontend` / `backend` / `other` / `skip`，第二步只展示所选 category 下的 ecosystem ids，并映射为对应 `ecosystem-<category>-<id>` module code。
  - 保留 programmatic exact module code selection 和 invalid module id 诊断。
  - 增加 CLI 层测试，覆盖 category-first、skip、backend -> java-springboot、unknown/empty answer 等路径。

## 验证摘要

- `npm test` 未执行：本轮按用户约束仅做只读 CR reviewer；未运行可能产生临时写入或刷新产物的测试命令。Story Dev Agent Record 声称 `npm test -- --testTimeout 30000` 通过 56 个 test files / 404 个 tests，但本 reviewer 未复跑。
- `npm run lint` 未执行：项目未在 Story verification 中列为必跑项，本 reviewer 未复跑。
- `npm run build` 未执行：Story Dev Agent Record 声称通过，但本 reviewer 未复跑。
- `git diff --check` 已在 Story 10.1 File List 范围执行，通过，无输出。
- `node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` 已执行，返回 `status: "ok"`、`findings: []`。
- 定向复核：
  - 读取并审查 Story File List、Story AC、Story 范围 diff、核心实现文件和测试文件。
  - 已排除用户声明的 out-of-scope drift：`speclite-docs-intro-ppt-creator`、`speclite-html-ppt-generator`、`docs/reference/canonical-source-layout.md`、`.specskills/` 等未作为 Story 10.1 发现来源。

## 通过项

- `src/modules/module-metadata.ts` 已实现 top-level modules + bounded `ecosystems/<category>/<id>/module.yaml` discovery，并对 ecosystem metadata、code pattern、`required_dependencies: [sdlc]`、`default_selected: false`、`required: false` 做 fail-fast validation。
- 首批 backend ecosystem `module.yaml` / `module-help.csv` 已覆盖 `java-springboot`、`nodejs`、`python`，module code 与 Story 约定一致。
- `src/modules/module-selection.ts` 的 dependency closure 能让 selected ecosystem module 自动包含 `sdlc`，再包含 `core`。
- selected-only projection 有 focused tests 覆盖：选择 Java / Spring Boot ecosystem 时安装 Java Skill，Node.js / Python 不进入 IDE mirrors 和 installed state indexes。
- default no-ecosystem baseline 在 fixture / expected output 中保持 `core` + `sdlc`，未默认安装 ecosystem modules。
- `release/packaging-manifest.json` 包含 Story 10.1 的 nested backend ecosystem source files。
