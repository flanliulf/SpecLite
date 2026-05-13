---
name: speclite-brownfield-context-builder
description: "Analyze existing brownfield codebases for Speclite 1-analysis by extracting evidence, reconstructing as-is architecture, and generating planning-ready baseline context. Use when user mentions 'brownfield', 'existing project analysis', 'codebase analysis', 'system recovery', 'as-is architecture', 'project baseline', '棕地分析', '既有系统分析', '现有项目分析', '代码库分析', '系统现状', '现状重建', '基线生成', or wants to understand an existing system before PRD/architecture planning. Capable of repository classification, deterministic evidence extraction, baseline synthesis, targeted deep-dive, planning brief handoff, and golden regression validation."
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
metadata:
  version: "1.2.0"
  author: "fancyliu"
  catalog: "speclite"
---

[技能说明]
    Speclite Brownfield Context Builder 是 1-analysis 阶段的既有系统分析工作流。它把现有代码仓库恢复为可追溯、可复查、可供后续 PRD / Architecture / Epics / Stories 消费的 as-is 基线和规划前置上下文。

[核心能力]
    - **仓库分类与边界识别**：识别 monolith / monorepo / multi-part 结构，划分子系统边界与技术栈。
    - **确定性证据提取**：通过 `{skill-root}/scripts/` 下的脚本提取 API、数据模型、依赖图、配置面、测试面和历史文档候选事实。
    - **Evidence-First 基线合成**：先生成 evidence 与 baseline skeleton，再由 LLM 仅补受限叙述，避免无来源事实写入。
    - **历史文档交叉验证**：将历史 PRD / 技术方案作为候选事实，经过代码或当前文档验证后再进入基线。
    - **局部深潜分析**：对高风险或用户指定区域做 targeted deep dive，补充可复用能力、约束和变更风险。
    - **规划前置交接**：默认生成 brownfield-planning-brief、candidate-change-slices、feature-entry-points 等后续 Speclite 工作流输入，不替代 create-prd / create-architecture / create-epics-and-stories。
    - **状态持久化与恢复**：每阶段写盘并更新 project-scan-report.json，支持 resume 和 full rescan 归档。
    - **质量护栏**：执行 coverage contract、strict anchors、adversarial grounding check 和 golden regression。

[约定]
    裸路径相对于 `{skill-root}` 解析；`{project-root}` 是目标项目工作目录；`{speclite-runtime-root}` 是 `{project-root}/_speclite`；`{skill-name}` 是目录 basename。

    运行配置必须读取 `{project-root}/_speclite/config.toml`。推荐解析字段：
    - `{project_knowledge}` = `[modules.sdlc].project_knowledge`
    - `{planning_artifacts}` = `[modules.sdlc].planning_artifacts`
    - `{brownfield_output}` = `{project_knowledge}/brownfield`
    - `{history_sources}` 默认 `{project-root}/docs/history`，可由用户指定

[执行流程]
    本 Skill 采用 4 种运行模式和 6 个阶段，路由规则以 `references/workflow-router.md` 为准。

    1. 激活后解析三层 customize：`{skill-root}/customize.toml`、`{speclite-runtime-root}/custom/{skill-name}.toml`、`{speclite-runtime-root}/custom/{skill-name}.user.toml`。缺失覆盖文件时跳过；标量覆盖，表深度合并。
    2. 读取 `{project-root}/_speclite/config.toml`。配置缺失或 `project_knowledge`、`planning_artifacts` 为空时 HALT。
    3. Phase 0：检查 `{brownfield_output}/project-scan-report.json`，按 `initial_scan` / `full_rescan` / `targeted_deep_dive` / `planning_generation` / resume 判定执行路径。初始化状态时运行：`python {skill-root}/scripts/update_state.py init --project-root {project-root} --output-dir {brownfield_output}`。
    4. Phase 1：运行 `python {skill-root}/scripts/scan_repo.py {project-root} --output-dir {brownfield_output}`，并按 `references/repository-classifier.md` 划分仓库结构。
    5. Phase 2：按 `references/evidence-extractor.md` 执行证据提取脚本，所有脚本必须显式传入 `--output-dir {brownfield_output}`；历史文档摄取额外传入 `--history-dir {history_sources}`。完成后运行 `validate_outputs.py --phase evidence`。
    6. Phase 3：读取 `references/known-failure-patterns.md`，运行 `render_baseline_skeleton.py` 生成 skeleton，再按 `references/baseline-synthesizer.md` 补充受限叙述。完成后必须运行 `adversarial_grounding_check.py` 和 `validate_outputs.py --phase baseline --strict-anchors`。
    7. Phase 4：如用户指定目标区域，按 `references/deep-dive-analyzer.md` 生成 `deep-dives/deep-dive-{area}.md`，并将发现反馈到 baseline 或 planning brief。
    8. Phase 5：按 `references/planning-synthesizer.md` 生成规划前置产物。默认输出 `brownfield-planning-brief.md`、`candidate-change-slices.md`、`feature-entry-points.md` 到 `{planning_artifacts}` 或 `{brownfield_output}/planning/`，并明确后续应交给 Speclite `speclite-create-prd`、`speclite-create-architecture`、`speclite-create-epics-and-stories` 继续处理。

[输出目录结构]
    默认产物写入目标项目的 `{project_knowledge}/brownfield/`，规划前置交接文档可同步到 `{planning_artifacts}`：

    ```text
    {project_knowledge}/brownfield/
    ├── project-scan-report.json
    ├── evidence/
    ├── baseline/
    ├── deep-dives/
    ├── planning/
    └── validation/
    ```

[核心边界原则]
    1. **不伪造历史**：不反推研发历史，不虚构优先级、排期或验收过程。
    2. **历史文档是证据源，不是真相源**：历史资料必须经过候选事实、交叉验证、基线事实路径。
    3. **as-is 与 to-be 分离**：baseline 只写当前系统事实，planning 只写后续规划输入。
    4. **不吞并后续阶段**：本 Skill 可生成 planning brief 和候选切片，但默认不替代 Speclite PRD、Architecture、Epics/Stories 工作流。
    5. **强落盘、弱上下文**：阶段完成后立即写盘并更新状态，只在上下文中保留摘要。
    6. **证据优先于叙述**：每个关键结论必须有 evidence anchor；证据不足时标注不确定性，不补全事实。

[注意事项]
    - 所有脚本调用必须使用 `{skill-root}/scripts/...`，不得依赖源码仓库路径。
    - 所有运行输出必须使用 `{brownfield_output}` 或 `{planning_artifacts}`，不得把 `{project_knowledge}/brownfield` 写成当前运行依赖。
    - `config.toml.example` 仅作字段结构参考，不作为 runtime fallback。
    - 修改 `scripts/extract_*.py`、framework adapters 或 skeleton renderer 后，必须运行 `python {skill-root}/scripts/run_golden.py {skill-root}/golden`。
    - 事实冲突（`fact-conflicts.json`）必须提示用户确认，不得自动裁决。
    - 输出文档末尾必须追加 `*本文档由 speclite-brownfield-context-builder Skill 自动生成*` 标注。

[生成信息]
    本 Skill 由 brownfield-context-builder 迁移为 Speclite 1-analysis 工作流。运行语义保留 Evidence-First / LLM-Last 的质量护栏，并适配 Speclite runtime model。
