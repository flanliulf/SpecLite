---
name: speclite-code-review-contract
description: "解析并验证 SpecLite CR v2 共享契约与审查产物。用于用户要求 CR contract、validate CR artifact、检查代码审查契约、验证 review/evaluation/fix/finalizer 绑定或手动编排 CR01–06。核心能力：统一身份与路径、校验 schema/verdict、验证 scope/round/hash/freshness，并提供独立于 runner 的只读契约入口。"
allowed-tools: Read, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Code Review Contract（代码审查共享契约）

## Overview（概述）

本 Skill 是 SpecLite CR01–06 与相关 runner 的共享契约 owner。它可在 fresh session 中独立解析并验证 CR v2 identity、路径、artifact schema、verdict、fingerprint、quorum、round binding、freshness 和 closeout 条件，不依赖任何 runner。

本 Skill 只读，不创建 review、evaluation、fix、TODO 或 finalizer artifact，也不修改源码、Story 或 tracker。

- Hard gate：只消费一次解析并冻结的 numeric Story identity、`reviewSeries` 与 `crDir`；禁止依据 Story title、name、slug、filename 或本地 candidate 重新推导目录。

## Core Capabilities（核心能力）

- **契约唯一来源**：以 `references/cr-contract.md` 作为 CR v2 唯一规范性定义。
- **独立运行**：支持人工按顺序单独调用 CR01–06，不要求先调用 Epic runner。
- **结构校验**：验证 schema、exact verdict、Story identity、series、round、scope 和 source hash。
- **时效校验**：检查 review、evaluation、fixRecord 与 Flow Gate 的 freshness 关系。
- **Closeout 校验**：验证 rules extraction、TODO result 与 finalizer durable report 的 canonical path、schema 和 binding。
- **CR 目录路由**：resolver 只判断 numeric identity、current candidate 归属与物理安全；production validator 在写前比较 frozen/consumer context，不承接审批或 tracker 规则。
- **只读诊断**：输出具体不一致项和下一步，不替代 reviewer、evaluator、fixer 或 finalizer。

## Workflow（工作流）

1. 完整读取 `references/cr-contract.md`；文件不可读时 HALT。
2. 运行 `speclite resolve config --project-root {project-root}`，解析 merged `planning_artifacts` 与 `implementation_artifacts`；失败时 HALT。
3. 根据输入建立唯一 `storyId -> storyKey -> storyFile`；使用 `scripts/resolve-cr-directory.mjs` 一次解析 verified `crDir`，再定位指定或 current CR artifact。
4. 按共享契约检查 artifact schema、identity、path、series、round、hash、scope、verdict、freshness 与 CR04–06 durable closeout binding。
5. 输出只读验证结论：`VALID | INVALID | INCOMPLETE`、逐项证据和精确下一步；不得修改被检查文件。

## Notes（注意事项）

- CR01–06 和 runner 都是本契约的 consumer，不得在各自 package 中复制契约定义。
- runner/manual 只描述 orchestration source；CR Skill 不得把 runner 当成 scope、authorization、convergence 或 freshness 的唯一 authority。
- 固定 artifact path 来自本 CR workflow contract；目标项目源码路径只有 owning SPEC 明确要求时才是 hard gate，否则接受有测试或 fixture 证据的 equivalent implementation。
- `SKILL.md` 与 `references/cr-contract.md` 是中文 canonical 内容；字段名、enum、schema id、hash 与命令保留英文。
- `Bash` 只可用于只读 resolver、hash 与状态检查，不得执行写入、删除、commit 或 push。
- 本 Skill 不推进 Story/Epic 状态，不执行 commit 或 push。

## Generation Metadata（生成信息）

本 Skill 由 speclite-skill-creator 体系维护。如需修改，必须同步更新 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md`、`references/` 与实际安装副本。
