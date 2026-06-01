# Story 5.3 实验笔记

更新时间：2026-06-01 17:18 CST

## Notes（笔记）

- 启动时 `sprint-status.yaml` 显示 `epic-5: in-progress`，Story 5.1 与 5.2 为 `done`，Story 5.3 到 5.5 为 `ready-for-dev`；dev-story 启动后 Story 5.3 已进入 `in-progress`。
- Story 5.3 范围是 local tarball artifact hash、offline bundle artifact hash、local path snapshot allowlist、自引用阻断、staging/cache/temp path redaction、local source trustStatus 推导、local diagnostics 和 validate/status no-access boundary。
- Story 5.3 明确不负责 Story 5.4 Git source pinning、Story 5.5 full trust reporting、Post-MVP commands、完整 source lockfile lifecycle、enterprise policy、signatures 或 provenance verification。
- Story 5.1/5.2 已建立 source selection、explicit access confirmation、redaction、trust/evidence 和 validate local-only discipline；Story 5.3 必须复用，不重新定义私有 JSON shape 或私有 trust model。
- 当前工作树已有大量无关 dirty/untracked 文件；后续必须逐文件核对，不回滚、不清理。
- 已按 `/bmad-dev-story story 5-3` 激活流程启动本 fresh sub agent；裸 `python3` resolver 因缺 `tomllib` 失败后，已使用 `python3.12` 成功解析 workflow。
- `sprint-status.yaml` 已把 Story 5.3 置为 `in-progress`；dev-story 与 Round 1 reviewer/evaluator 已完成，后续不得越过 fixer 直接启动复检、finalizer 或提交。
- Task 1 preflight 确认：`src/source/source-selection.ts` 已有 MVP source type 和 external access intent；`src/source/registry-source-resolver.ts` 已有 registry-only resolver；`src/validation/rules/source-integrity.ts` 目前只处理 npm/private-registry，Story 5.3 需要扩展 local artifact/path descriptor shape checks，但不得访问 source origin。
- 当前 `src/commands/install.ts` 对非 registry custom source 仍直接返回 unsupported；Story 5.3 后续只能解除 `local-tarball`、`offline-bundle`、`local` 三类，不能触碰 Git pinning。
- 实现后：`src/commands/install.ts` 对所有 custom source 统一先做 external access confirmation；registry unconfirmed output 保持 Story 5.2 fixture wording，local source unconfirmed 使用 generic source wording。
- `src/source/local-source-resolver.ts` 不做 network、package-manager cache、external origin 访问；tarball/offline 只读用户确认后的 artifact raw bytes，local path 只读确认后的 source root allowlisted files。
- 当前 tarball/offline bundle 没有引入 extractor dependency；Story 5.3 只记录 artifact hash 并保持 staging/cache path 私有，不提前实现完整 extraction lifecycle 或 source lockfile lifecycle。
- `src/validation/issue-model.ts` 放行 `blockedRootKind: "cache"` 这类稳定枚举，避免把枚举值误判为 cache path；仍继续拦截 path-like cache/temp/node_modules 字符串。
- Round 1 reviewer 降级说明：当前 Codex 环境没有 skill 所需的 `Agent` 调度工具，无法并行启动 Blind Hunter、Edge Case Hunter、Acceptance Auditor；本轮在同一 fresh reviewer 上按三层视角串行审查，并在 summary 中标注。
- Round 1 关键结论：local tarball/offline/local source resolver 已记录 display-safe descriptor 与 content hash，但 confirmed local source 进入 install planning 后仍使用 `projectRoot` 的 bundled module discovery 和 bundled package copy。该行为会让 manifest 记录 local source evidence，而实际 installed skills 来自 bundled source。
- 对 AC5 的判断：不引入 extractor dependency、只记录 artifact raw-byte hash 本身可以符合 AC5 的 artifact hash 边界；但如果 tarball/offline bundle/local source 被允许进入写入阶段，就必须让 install planning 使用对应 canonical source tree，或在 extractor/source tree 不可用时 blocked。当前实现放行写入但继续安装 bundled tree，因此不符合 Story 5.3 的 install-source 语义。
- Round 1 evaluator 裁决：reviewer 唯一 patch 成立且必须修复。最小修复边界是 local path 可作为 canonical source tree 时，discovery、copy、package hash、files index 和 skill index 均使用该 root；tarball/offline bundle 若没有 extractor 或 canonical source tree handle，则必须以 stable `source-integrity` issue 阻塞写入，不能 fallback 到 bundled source。
- Round 1 fixer 修复：`resolveLocalSource` 对 `local` 返回非枚举 private `installSourceRoot`，public descriptor 仍只显示 `resolvedRoot: "local-source"`；install orchestration 只把 private root 传给 module discovery 与 write phase，不进入 JSON、manifest、human output 或 indexes。
- `writeIdeMirrors` / `applyInstallPlan` 现在支持 private `sourceRoot` 与 public-safe `sourceRefRoot`。local source 的 copied files、files index `sourceRef`、skill index `sourcePackagePath` 和 `canonicalPackageHash` 均来自 local canonical tree；public ref 使用 `local-source/...`，不暴露 absolute source root。
- `local-tarball` / `offline-bundle` 当前仍只记录 artifact raw bytes `contentHash`；因没有 extractor/source payload staging/canonical tree handle，confirmed resolution 后以 `source-integrity.unsupported-source` / `local-artifact-install-source-unavailable` 阻塞 module planning 与 write phase。
- Round 2 reviewer 复检边界：只核查 Round 1 P1 修复是否成立，不做 evaluator/fixer/finalizer，不提交；重点读取 `src/commands/install.ts`、`src/source/local-source-resolver.ts`、`src/installer/runtime-structure.ts`、`src/ide/target-writer.ts`、manifest/files/skill index 生成路径与 `test/local-source-integrity.test.ts`。
- Round 2 reviewer 结论：Round 1 P1 已修复。`local` source 的 private root 进入 module discovery 和 write phase；public descriptor / manifest / human output / files index / skill index 只使用 `local-source/...` display-safe ref；`local-tarball` 与 `offline-bundle` 在无 canonical tree handle 时阻塞于 write phase 前，artifact `contentHash` 仍为 raw bytes hash。
- Round 2 evaluator 裁决：reviewer 的“通过、四桶全 0”成立。独立复核确认 `src/source/local-source-resolver.ts` 的 private `installSourceRoot` 非枚举且仅用于 install 链路，`src/commands/install.ts` 将其贯穿 module discovery/write phase，`writeIdeMirrors` 基于 private root copy/hash、基于 `local-source/...` public ref 输出 indexes。tarball/offline bundle 无 extractor/canonical tree handle 时以 stable `source-integrity.unsupported-source` 阻塞写入，artifact `contentHash` 继续来自 raw bytes。
- Round 2 evaluator 验证：focused 4 files / 36 tests、全量 32 files / 236 tests、`npm run build`、定向 `git diff --check` 均通过。本步骤未修改源码、未运行 fixer/finalizer、未提交。
- 04 rules extractor 裁决：Round 1 P1 可沉淀为实现检查点 `Source evidence 必须驱动实际 install input，否则写入前阻塞`；硬性门槛全部通过，评分 10/12。因 `02-source-descriptor-contract.md`、`03-install-plan-contract.md` 与 `04-manifest-index-contract.md` 已覆盖总原则，本次不修改全局文档，只按默认推荐 record-only 写入 `cr-rules-summary.md` 为 `CR-API-23`。
- 04 未向 05 交接 TODO：Round 2 evaluator 明确 CR TODO 0，且本次规则提炼没有未解决的非阻塞改进项。
- 05 todo tracker 检查：`cr-todo-backlog.md` 现有 TODO-001/002/003 分别涉及 resolve parity fixture、generatedAt validator、默认 `npm test` timeout；均与 Story 5.3 文件清单和建议时机不匹配。本次不新增、不 resolve、不修改 backlog。
- 06 finalizer 状态收尾：最新 Round 2 evaluator 通过且需要修复 0 / 可忽略 0 / CR TODO 0；Story 文件状态与 `sprint-status.yaml` 中 Story 5.3 状态已同步为 `done`。`bmm-workflow-status.yaml` 不存在，按 finalizer 容错 skipped，未新建。
- Epic 5 状态保持 `in-progress`：5.1/5.2/5.3 已 done，但 5.4/5.5 仍为 `ready-for-dev`，不满足 Epic 自动收口条件。

## Risks（风险）

- Local source resolver 容易误读 project-external paths 或 staging/cache/temp 目录；必须在确认前 no read/no extract/no write，并且 public projection 只能展示 display-safe label。
- Self-reference guard 必须覆盖 installed state、IDE mirrors、workflow output、dependency/cache/temp/build 等 blocked root kinds，不能把目标项目产物当 canonical source root。
- Artifact hash 与 extracted tree hash 不得混用；local path snapshot hash 必须基于 allowlist 和 deterministic traversal。
- 后续若实现 tarball/offline extraction，必须新增独立 canonical tree handle 与 tree hash 语义，不能复用或覆盖 artifact `contentHash`。
