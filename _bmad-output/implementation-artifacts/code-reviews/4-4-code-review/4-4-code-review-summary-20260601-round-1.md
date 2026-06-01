---
Story: 4-4
Round: 1
Date: 2026-06-01
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前环境没有可调用的 `Agent` 子代理工具，本轮按 skill 降级为当前上下文内串行三层审查：blind、edge、auditor 均已完成但未形成独立子代理隔离。Reviewer 边界禁止修改源码/Story/status，且为避免生成构建产物，本轮未重跑 `npm test`、`npm run lint`、`npm run build`；验证摘要引用 Story Dev Agent Record 中的已记录结果，并补充静态代码证据审查。

总体结论：不通过。当前实现已覆盖 `_speclite/.lock` acquisition/contention/release、`update --yes` / `update --repair --yes` lock-before-planning、`install` apply-phase lock、same-directory `.speclite-tmp-` rename、基础 path/symlink/case blockers、validate stale lock warning 和 public JSON volatile redaction；但仍有 4 个需要修复的 patch 项。计数：decision_needed=0，patch=4，defer=0。

## 新发现

### 1. [高] Partial failure diagnostics 不记录已成功写入路径，失败后无法满足 changed paths / completed steps 可诊断要求

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/installer/runtime-structure.ts:109-127` 在 install apply 中可能先成功写入 `_speclite/config.toml` / `_speclite/config.user.toml` 并把 `fileEntries` 追加到内存；后续 IDE mirror 或 manifest/index 任一步失败时，`createApplyFailure` 只返回 coarse `completedSteps` / `pendingSteps`。
  - `src/installer/runtime-structure.ts:258-267` 的 failure shape 没有携带已完成 mutation 的 `changedPaths`。
  - `src/fs/safe-write.ts:86-99` 对 safe-write failure 固定输出 `completedSteps: []`、`failedStep: "temp-write-rename"`、`pendingSteps: ["rename-target"]`、`changedPaths: []`，无法反映本命令此前已经 rename 成功的路径。

- **影响**
  - 违反 AC7。若 config 写入成功但后续 manifest/index 或 IDE mirror 失败，public diagnostics 会声称没有 changed paths，用户无法知道哪些文件已经落盘，也无法安全执行 manual action。

- **建议**
  - 在 install/update/repair apply orchestration 层维护 operation-local `changedPaths`，每次 `safeWriteFile` rename 成功后追加；失败时把已完成路径、失败阶段、pending steps 和 manual action 一起投影到 stable `issues[].details` 或已有 command data 契约允许的位置。
  - 补充测试：构造第二个或后续 write 失败，断言前一个已成功路径出现在 diagnostics，且未完成路径不进入 changed paths。

### 2. [中] Validate 只扫描 `_speclite` 顶层 stale temp，漏报 safe-write 在目标同目录产生的嵌套 `.speclite-tmp-*`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `src/fs/safe-write.ts:65-69` 明确将 temp file 创建在 target file 的同一目录；例如 `_speclite/_config/manifest.yaml` 的 temp 会位于 `_speclite/_config/.speclite-tmp-*`，IDE mirror temp 会位于 `.claude/skills/.../.speclite-tmp-*` 或 `.agents/skills/.../.speclite-tmp-*`。
  - `src/validation/rules/file-integrity.ts:152-171` 的 `discoverStaleTempFiles` 只 `readdir(projectRoot/_speclite)`，且只返回 `_speclite/${entry.name}`，不会递归检查 `_speclite/_config`、IDE mirror、artifact root 或其他 installer-owned target 目录。
  - `test/validate-command.test.ts:85-135` 只覆盖 `_speclite/.speclite-tmp-leftover` 顶层 temp。

- **影响**
  - 违反 AC5/AC8 的 stale temp exclusion/diagnostics 要求。实际 safe-write 失败最可能留下的是目标同目录 temp；validate 会漏报这些文件，后续 safe mutation 被阻断或 fixture snapshot 漂移时缺少稳定 warning/error。

- **建议**
  - 按 installed files index、installer-owned roots 或受控目录集合递归发现 `.speclite-tmp-*`，至少覆盖 `_speclite/_config/**`、`.claude/skills/**`、`.agents/skills/**` 和 configured installer-owned roots，同时仍输出 project-relative POSIX path。
  - 补充 nested stale temp、directory-shaped blocking temp、IDE mirror temp 的 validate tests。

### 3. [中] Safe-write cleanup failure 不是 best-effort；清理失败会抛出 raw error 而不是稳定 issue

- **来源**：blind+edge
- **分类**：patch

- **证据**
  - `src/fs/safe-write.ts:81-84` 在任何 temp-write / rename 异常后执行 `await rm(tempPath, { force: true })`，但没有捕获 cleanup 自身失败。
  - 如果 `rm` 因权限、目录型 temp、并发占用或平台差异失败，函数会直接抛出底层异常，绕过 `file-integrity.stale-temp-file` 的稳定 issue 和 partial failure details。

- **影响**
  - 违反 AC5/AC7。受控失败应保持可诊断，cleanup failure 只应影响 stale temp warning/error，不应让 public command 泄露不稳定 Node error 或中断 stable CommandResult projection。

- **建议**
  - 把 cleanup 放入独立 `try/catch`，失败时返回稳定 `file-integrity.stale-temp-file` error，details 中区分 `cleanup-failed` / `safe-write-failed`，并保留 manual action。
  - 补充 cleanup failure 测试，例如预置目录型 `.speclite-tmp-*` 或 mock filesystem failure，断言不会抛 raw error。

### 4. [中] `safeWriteFile(...allowExisting=true)` 缺少 ownership/hash baseline preflight，未来 apply 可直接覆盖不安全目标

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - `src/fs/safe-write.ts:48-62` 的 API 只接收 `allowExisting?: boolean`，没有接收 expected ownership、expected hash、current baseline 或 files-index entry。
  - `src/fs/safe-write.ts:159-184` 对现有目标的判断只有 directory/type 和 `allowExistingFile`：当 `allowExisting=true` 且目标是普通文件时，会继续执行 rename 覆盖。
  - `src/update/update-plan.ts:360-407` 在 planning 阶段有 ownership/drift conflict 判断，但 Story 4.4 要求 write path 在 apply 前再次阻断 unsafe overwrite；当前 shared write primitive 本身无法证明目标仍是 installer-owned 且 hash/type/baseline 未漂移。

- **影响**
  - 违反 AC6 的 write-preflight safety。虽然 Story 4.5 负责 full conflict detector，Story 4.4 仍要求 apply 前阻断 ownership unknown、human/workflow-owned、hash baseline mismatch、unsafe overwrite 等风险；当前 primitive 一旦被 update/repair apply 使用，TOCTOU 漂移或错误调用会导致覆盖受保护文件。

- **建议**
  - 为 safe-write apply path 增加明确的 expected baseline 参数或专门的 installer-owned mutation wrapper：在 rename 前重新 lstat/read/hash/classify，并拒绝 human-owned/workflow-owned/unknown、hash mismatch、file/directory mismatch、symlink target 和 stale temp blocker。
  - 补充 `allowExisting=true` 覆盖 human-owned/workflow-owned/unknown 和 baseline drift 的负向测试。

## 验证摘要

- `npm test` 未由本 reviewer 重跑；Story Dev Agent Record 记录全量 `npm test` passed，29 files / 185 tests passed。
- `npm run lint` 未由本 reviewer 重跑；当前项目未在 Story Dev Agent Record 中记录 lint 执行结果。
- `npm run build` 未由本 reviewer 重跑；Story Dev Agent Record 记录 `npm run build` passed。
- 静态审查：
  - 已读取 Story 4.4 AC/Tasks、Dev Agent Record/File List。
  - 已读取 `src/fs/operation-lock.ts`、`src/fs/safe-write.ts`、`src/commands/update.ts`、`src/commands/install.ts`、`src/installer/runtime-structure.ts`、`src/validation/rules/file-integrity.ts`、`src/validation/rules/operation-lock.ts`、`src/validation/validate-project.ts`、`src/manifest/manifest-generator.ts`、`src/update/update-plan.ts`、`src/update/ownership-model.ts`。
  - 已读取 focused tests：`test/operation-lock-safe-write.test.ts`、`test/validate-command.test.ts`、`test/update-command.test.ts`、`test/runtime-structure.test.ts` 的相关片段。

## 通过项

- `_speclite/.lock` 使用 `O_CREAT | O_EXCL` 获取，竞争失败映射到 `operation-lock.project-locked`，且 issue 不泄露 pid、createdAt、absolute path 或 projectRootHash。
- `update --yes` 和 `update --repair --yes` 在 planning 前获取 operation lock；锁竞争时返回 failure、非 0 exit code、空 plan/changed/skipped/conflicts。
- `install --yes` 的 apply phase 已在写入前获取 operation lock；锁竞争测试覆盖未写入 `_speclite/config.toml`。
- `validate` 对 stale lock 保守输出 `operation-lock.stale-lock` warning，且不自动删除 lock file。
- `createFilesIndex` 已过滤 `_speclite/.lock` 和顶层 `_speclite/.speclite-tmp-*` volatile entries；public JSON schema 也有 unsafe value redaction guard。
- Story 4.4 没有提前实现 top-level `repair`、`sync`、daemon、backup/restore 或 Story 4.6 full repair apply。
