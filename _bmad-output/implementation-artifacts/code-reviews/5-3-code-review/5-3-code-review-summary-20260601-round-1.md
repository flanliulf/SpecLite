---
Story: 5-3
Round: 1
Date: 2026-06-01
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。`npm run build` 通过，`npx vitest run test/local-source-integrity.test.ts` 通过（1 file / 12 tests），`npm test` 通过（32 files / 234 tests）。项目未配置 `npm run lint` script。当前环境无 `Agent` 调度工具，本轮按 skill 降级策略由当前 reviewer 串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层视角。

结论：不通过。存在 1 个阻塞 `patch` 项：confirmed local source 会写入安装结果，但实际 module discovery 和 IDE mirror copy 仍读取 bundled source，导致 manifest/sourceDescriptor 记录 local evidence，而 installed files 来自 bundled tree。

## 新发现

### 1. [高] Confirmed local source 写入阶段仍安装 bundled source

- **来源**：blind+edge+auditor
- **分类**：patch

- **证据**
  - `src/commands/install.ts:320-365` 在 `local-tarball` / `offline-bundle` / `local` resolution 成功后直接调用 `continueInstallWithSourceDescriptor(...)`，将 local `sourceDescriptor` 带入后续安装。
  - `src/commands/install.ts:725` 的后续安装流程仍调用 `discoverModulesForInstall(projectRoot)`；`src/commands/install.ts:1195-1207` 进一步固定为 `discoverOfficialModules({ projectRoot })`。
  - `src/modules/module-metadata.ts:58-64` 在未传 `sourceRoot` 时固定读取 `path.join(projectRoot, "assets/source/speclite")`。
  - `src/commands/install.ts:893-899` 调用 `applyInstallPlan` 时仍传 `packageRoot: projectRoot`。
  - `src/installer/runtime-structure.ts:169-178` 把该 `packageRoot` 传给 `writeIdeMirrors`；`src/ide/target-writer.ts:55-63` 再固定拼接 `packageRoot/assets/source/speclite/...` 作为 copy source。
  - `test/local-source-integrity.test.ts:411-476` 只断言 confirmed local tarball 的 descriptor/status/validate，不断言 installed file contents 或 module discovery/copy 是否来自 local source。

- **影响**
  - 用户显式确认 local tarball/offline/local source 后，命令可进入写入阶段并生成成功结果，但安装内容仍来自当前 package bundled source。`manifest.sourceDescriptor.contentHash` 与 `integrityEvidence` 指向 local artifact/path，`skill-index` / files index / IDE mirror 实际内容却来自 bundled tree，破坏 source evidence 与 installed state 的一致性。
  - 这直接影响 AC1/AC2/AC3/AC5/AC7：artifact raw-byte hash 与 local snapshot hash 被记录了，但没有约束或驱动 actual install input；对 tarball/offline bundle，当前“未引入 extractor dependency、只记录 artifact hash”本身可符合 AC5 的 artifact hash 边界，但在允许写入时必须使用 extracted/canonical source tree 或阻塞，不能继续安装 bundled tree。

- **建议**
  - 为 local source resolution 返回一个 private install source root / canonical source tree handle，并让 module discovery、package copy、hash/index generation 使用该 root；public JSON 继续只投影 display-safe descriptor。
  - 对 tarball/offline bundle，在没有 extractor/source payload 支持时不要进入 install writing；返回 stable `source-integrity.unsupported-source` 或更具体 local source issue。若支持 extraction，则 extraction root 保持 private，并基于 canonical source tree allowlist 驱动 module discovery/copy；artifact `contentHash` 仍保持 raw bytes hash，不与 tree hash 混用。
  - 补充 focused tests：构造 local source 中带唯一 `SKILL.md` marker 的 source tree，confirmed install 后断言 `.claude/skills/.../SKILL.md`、files index hash、skill index `sourcePackagePath` 均来自 local source；对 tarball/offline bundle 缺少 extractor 的路径断言 blocked 而非成功写入 bundled content。

## 验证摘要

- `npm test` ✅ 通过（32 / 32 files，234 / 234 tests）
- `npm run lint` 未配置（`package.json` scripts 中没有 `lint`）
- `npm run build` ✅ 通过（tsup ESM 与 DTS build success）
- 定向复现
  - 静态追踪确认 local resolution 成功后安装阶段仍固定读取 bundled source。
  - 运行时临时复现尝试被工具环境限制阻断：`tsx --eval` top-level await/CJS 限制、`tsx` IPC pipe `EPERM`、Node strip-types 无法解析源码 `.js` extension TS imports；这些失败未作为项目行为证据使用。

## 通过项

- 未确认时 no read/no lock/no write 顺序成立：`src/commands/install.ts:216-267` 在缺少 `confirmSourceAccess` 时返回 blocked descriptor 和 unconfirmed issue，未调用 local resolver 或 apply/write 流程。
- Local tarball/offline bundle artifact hash 使用 raw bytes：`src/source/local-source-resolver.ts:81-106` 对 artifact file `readFile` 后 `sha256`，并写入 `contentHash` 与 `content-hash` evidence。
- Public descriptor 对 local path/tarball/bundle 使用 display-safe label：`src/source/source-selection.ts:213-229` 将 local source value 投影为 `local-tarball`、`offline-bundle`、`local-source`。
- Local path snapshot traversal deterministic 且包含 exclusion list：`src/source/local-source-resolver.ts:231-323` 使用 sorted traversal、POSIX relative path、raw bytes，并排除 `.git`、`node_modules`、workflow output、cache/temp/build/editor metadata。
- Self-reference guard 覆盖 Story 要求的主要 blocked kinds：`src/source/local-source-resolver.ts:326-367` 覆盖 installed state、IDE execution plane、workflow output、dependency/cache/temp/build output，并输出 stable `blockedRootKind`。
- `validateSourceIntegrity` 只检查 installed manifest descriptor/evidence shape，不重新读取 local source origin：`src/validation/rules/source-integrity.ts:10-67` 仅消费传入 manifest。
