---
Story: 2-2
Round: 1
Date: 2026-05-27
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具在当前执行环境不可用，已按 skill 降级为串行三层审查模式；Blind Hunter、Edge Case Hunter、Acceptance Auditor 逻辑均在当前上下文中完成，未记录失败审查层。`npm run build` 通过，`npm test` 通过，`git diff --check` 通过。当前存在 1 个中优先级阻塞问题：`canonicalPackageHash` 与实际 installed self-contained entry 内容脱节，建议本轮 CR 不通过，进入 evaluator。

## 新发现

### 1. [中] `canonicalPackageHash` 覆盖 source 全目录，但 installed entry 只复制白名单文件

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `_bmad-output/implementation-artifacts/stories/2-2-ide-skill-entry-mapping.md:45-50` 要求同一 canonical skill 映射到多个 IDE targets 时，package-level hash 只覆盖 canonical package content，并与 files-index file-level hash 分层。
  - `src/fs/copy-tree.ts:7-9` 定义 Story 2.2 的 installed self-contained entry 白名单，未包含 `SKILL.en.md`；`src/fs/copy-tree.ts:44-56` 只复制过滤后的 `copiedSourceFiles`。
  - `src/ide/target-writer.ts:55` 仍用 `hashPackageDirectory(sourcePackageRoot)` 计算 `canonicalPackageHash`；`src/manifest/hash.ts:17-32` 的 `hashPackageDirectory()` 会遍历目录内所有文件。
  - 当前 source package `assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/` 包含 `SKILL.en.md`，但 Story 2.2 测试明确断言 `.claude/skills/speclite-dev-story/SKILL.en.md` 与 `.agents/skills/speclite-dev-story/SKILL.en.md` 不存在。
  - 定向复现结果：安装后 `speclite-dev-story` 的 source hash 为 `sha256:ee9617e3915f6dcd116b01d105b71f6938476ac4e028ff6285a90c327d93b53c`，`.claude/skills` 与 `.agents/skills` entry 目录 hash 均为 `sha256:266f783ee45543a079052d1829c1e2fa6a8ffbd5138c5d1990747815594fdf65`；两个 target 彼此一致，但 manifest 记录的是 source 全目录 hash，不等于实际 installed entry 内容 hash。

- **影响**
  - `skill-index.json` 中的 `canonicalPackageHash` 无法证明 installed targets 中的 canonical package content；它会包含未安装的 source-only 文件变化。后续 drift/update protection 或 reverse validation 如果依赖该字段，会把 source package 全目录与 installed entry surface 混为一谈。
  - 这直接削弱 AC5 的 package-level hash 语义，也会让 fixture 对 canonical package hash stability 的断言只证明 source snapshot 稳定，而不是证明 `.claude/skills` 与 `.agents/skills` 映射出的 canonical entry 内容稳定。

- **建议**
  - 将 package-level hash 的输入与 Story 2.2 installed canonical entry surface 对齐：复用同一份 installable file predicate 计算 canonical package hash，或在复制后基于 installed target entry 目录计算并校验所有 mapped targets 的 package hash 一致。
  - 补充测试：对包含 `SKILL.en.md` 的 fixture package，断言 `skill-index.entries[].canonicalPackageHash` 等于 installed `.claude/skills/<id>/` 与 `.agents/skills/<id>/` 的 canonical package hash，且不受未安装文件影响。

## 验证摘要

- ✅ `npm run build` 通过。
- ✅ `npm test` 通过（12 / 12 test files，71 / 71 tests）。
- ✅ `git diff --check` 通过。
- ✅ 定向复现完成：确认 source 全目录 hash 与 installed entry 目录 hash 不一致，而两个 installed targets 之间 hash 一致。

## 通过项

- Adapter registry 保持 MVP target order：`claude`、`agents`，未新增 `copilot` / `cursor` branded target。
- Explicit unsupported target selection 会在 write planning 前返回 `ide-mirror.unsupported-target`，且不写入 target mirror。
- `copyCanonicalPackage()` 已阻止缺少 `SKILL.md` 的 source package 生成空 installed entry。
- Installed entry 复制面已限制为 Story 2.2 允许的 `SKILL.md`、`CHANGELOG.md`、`references/`、`assets/`、`scripts/`、`config.toml.example`、`customize.toml`。
- Phase coverage target projection 使用 project-relative POSIX paths，并保持 `mapped` status 与 target order。
