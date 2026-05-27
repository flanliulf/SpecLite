# Story 6.4: Path Portability And Runtime Matrix Evidence（路径可移植性与运行时矩阵证据）

Status: ready-for-dev

<!-- Note: This file is ready-for-dev story context. It is not evidence that source implementation, fixture runner, path-portability fixtures, runtime matrix jobs, packaging checks, release/performance evidence, schemas, tests, or release gates already exist. -->

## Story（故事）

作为 SpecLite 维护者，
我希望 fixture gates 覆盖 Node 22/24、macOS/Windows 和关键路径可移植性场景，
以便证明 MVP 在声明支持的运行时与平台上可重复安装、验证、更新、解析和发布。

## Acceptance Criteria（验收标准）

1. **Node runtime matrix is release evidence（Node 运行时矩阵成为发布证据）**
   **前提** release gate fixture suite 在 CI 或本地 release 验证中运行；
   **当** 执行 MVP fixture gates；
   **则** 必须覆盖 Node 22 minimum 和 Node 24 recommended runtime；
   **并且** 不得使用 Node 24-only API，除非同一变更提供 Node 22-compatible path 或先更新 runtime policy、Architecture、fixtures 和 release matrix。

2. **Runtime p95 measurements are non-stable evidence（Runtime p95 只进入非稳定证据）**
   **前提** release gate fixture suite 记录 command runtime / p95 baseline；
   **当** 维护者比较 command runtime regression；
   **则** p95 duration、regression percentage 和 profiling sample 必须写入 release/performance evidence；
   **并且** stable `CommandResult` JSON snapshots、stable fixture snapshots、manifest/index snapshots 不比较具体 wall-clock values、duration、elapsed time 或 profiling samples。

3. **Public path fields are portable across supported OS（公开路径字段跨支持平台可移植）**
   **前提** `path-portability` release gate fixture 运行在 macOS 13+ 和 Windows 11；
   **当** 执行 `install`、`status`、`validate`、`update` 和 `resolve` 相关路径；
   **则** all public path fields 必须使用 project-relative POSIX-style path；
   **并且** fixture snapshots 不依赖 OS-specific separators、drive letters、home directory、checkout root、cache path、temporary extraction path 或 fixture output absolute path。

4. **Canonical text line endings remain LF（Canonical 文本换行保持 LF）**
   **前提** fixture 覆盖 canonical source text files；
   **当** installer 复制 canonical source 内容到 `_speclite`、IDE mirrors 或 runtime assets；
   **则** canonical text line endings 保持 LF；
   **并且** installer 不按平台改写 canonical text line endings，不通过 hash normalization 隐式吞掉 LF/CRLF 差异。

5. **Executable intent is explicit and Windows-compatible（可执行意图显式且兼容 Windows）**
   **前提** fixture 覆盖 generated scripts 或 runtime scripts；
   **当** files index 记录这些脚本；
   **则** 必须记录 `executable` intent；
   **并且** Windows fixture 不要求 POSIX chmod semantics，但必须验证 supported script entry points 可通过 Windows 支持的 invocation path 使用。

6. **Case and escape hazards are blocked deterministically（大小写与逃逸风险确定性阻断）**
   **前提** fixture 覆盖 case conflict、symlink escape 或 path escape；
   **当** install、update、repair planning、safe write 或 validation 处理目标路径；
   **则** case conflict、symlink escape、path escape 和 unsafe overwrite 必须被阻断或由 validate 报告稳定 issue / conflict reason；
   **并且** 不得把项目外路径写入 public JSON、manifest/index、files index 或 fixture snapshot。

7. **Shell invocation semantics are stable（Shell 调用语义稳定）**
   **前提** fixture 覆盖 macOS 与 Windows shell invocation 差异；
   **当** 命令在支持平台上执行；
   **则** command id、path normalization、exit code 和 JSON output semantics 保持稳定；
   **并且** 不依赖 shell-specific path separators、别名行为、current checkout root 或本机 shell profile。

8. **Terminal width and no-color behavior remain readable（终端宽度与无颜色行为保持可读）**
   **前提** fixture 覆盖 human-readable output；
   **当** terminal width 为 `<80`、`80-119`、`>=120`，或环境为 `NO_COLOR`、non-TTY、CI、copy-paste review；
   **则** Compact 与 Evidence output 的关键字段仍可读、顺序稳定且有文本等价表达；
   **并且** 输出不得包含 ANSI escape，表格 fallback 不得丢失 path、issue id、target id、next action、planned effect、conflict reason、status、severity、empty state、checked categories 或 artifact metadata。

9. **Packaging acceptance is a release checklist gate（Packaging Acceptance 是发布清单门禁）**
   **前提** release packaging acceptance 运行；
   **当** 维护者构建 npm package、local tarball 或 offline bundle；
   **则** 必须通过 `npm run release:packaging-check` 生成 `dist/packaging-manifest.json`，列出 package file inventory；
   **并且** 断言 package file inventory 包含 `package.json` bin mapping、`dist/bin/speclite.js`、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates 和安装执行所需 runtime assets；
   **并且** `test/fixtures/` 与 root `fixtures/` 默认不得进入 package，除非明确标记为 packaged documentation example；packaged examples 不等同于 release gate fixtures。

10. **Explicit repair remains separated from normal update（显式 Repair 仍与普通 Update 分离）**
    **前提** 6.4 承接 6.3 的 explicit repair handoff；
    **当** 断言 repair output；
    **则** 只能使用 explicit `speclite update --repair --json` fixture，`CommandResult.command` 必须是 `update.repair`，`data` 必须是 `RepairCommandData`；
    **并且** repair assertions 不得混入 normal `update`、`ide-drift` validate expected output、source-integrity sub-cases 或 path-portability non-repair scenarios。

11. **6.5 scope remains deferred（6.5 范围保持后置）**
    **前提** dev agent 实现本 Story；
    **当** 需要 documentation examples 或 installed skill artifact loop；
    **则** 不得提前实现 Story 6.5 `skill-artifact-loop` release gate、documentation examples rewrite、多 skill workflow quality 或人工评审结论；
    **并且** runtime matrix 只为 `skill-artifact-loop` 预留 typed pending/skip slot 与 skip reason，不要求 6.4 在 6.5 前创建 gate；
    **并且** 只允许为 packaging acceptance 明确标记 packaged documentation example 的 package inventory 排除/包含规则。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置实现、工作树和 story context 边界（AC: 1-11）
  - [ ] 重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/`、`test/fixtures/` 和 `dist/` 是否已经由前序 stories 实际实现。创建本 Story 时这些 implementation scaffold 在仓库根目录未发现；不得把 ready-for-dev story context 当作源码完成证据。
  - [ ] 重新读取 Story 6.1、6.2、6.3、5.5、4.6 和 2.4，确认 fixture contract、normal update vs repair boundary、source trust/redaction、explicit repair、resolver parity 和 Node 22/24 policy 是否真实落地。
  - [ ] 检查 dirty worktree，保留用户、父 agent 或其它 sub-agent 的改动；不得格式化、重写、同步或回滚无关 planning docs、Story 1-5、Story 6.1/6.2/6.3、Story 6.5、源码或 status 文件。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的 behavior。若前置 implementation 尚未存在，按前置 story 顺序补齐或记录 blocker，不得伪造 release evidence。

- [ ] Task 2: 建立 runtime matrix release gate wiring（AC: 1）
  - [ ] 在 CI / release fixture runner 中配置 Node matrix，显式使用 project policy `[22, 24]`；不要复制通用示例中的 Node 20，也不要把 Node 26 Current 加入 MVP baseline。
  - [ ] `engines.node`、runtime/platform guard、fixture runner 和 release checklist 必须表达 Node 22 minimum + Node 24 recommended。Unsupported runtime failure 使用 `environment.unsupported-node`，并在读取或写入项目文件前停止。
  - [ ] 对新增或修改的 runtime code 执行 Node 22 compatibility review。不得使用 Node 24-only API；如必须使用，先更新 runtime policy、Architecture、owning SPEC/fixtures 和 CI matrix。
  - [ ] Runtime matrix 必须覆盖 release gate fixtures：`fresh-install-empty-project`、`existing-install-update`、`ide-drift`、`source-integrity` required sub-cases、`resolve-parity` 和 `path-portability`；对 6.5 才创建的 `skill-artifact-loop`，本 Story 只定义 typed pending/skip slot、stable skip reason 和后续 inclusion hook，不提前实现 6.5 gate 行为。

- [ ] Task 3: 建立 runtime / p95 release-performance evidence（AC: 2）
  - [ ] 定义 release/performance evidence artifact 或 release checklist section，记录 command name、fixture case、Node version、OS family、sample count、p95 duration、accepted baseline、regression percentage、profiling sample location 和 pass/fail conclusion。
  - [ ] Evidence 可以记录具体 p95/wall-clock 值；stable fixture snapshots 只能断言 evidence 存在、测量口径、关联 fixture case、baseline id 和 pass/fail conclusion，不比较具体 wall-clock values。
  - [ ] `status` 在常规 fixture 项目中继续以 p95 baseline 验证轻量性；`validate`、`install`、`update` 和 `resolve` 的 regression checks 不得把 timing 混入 `completedSteps`、`pendingSteps`、summary、issues、nextActions 或 stable `data` fields。
  - [ ] 若使用 profiling samples，raw profiler output、absolute temp path、home directory、process id、timestamp 和 environment values 不得进入 stable snapshots。

- [ ] Task 4: 实现 `path-portability` fixture case matrix（AC: 3-8）
  - [ ] 创建或扩展 `test/fixtures/path-portability/` release gate case，使用 stable lower-kebab naming、`input/`、`expected/` 和 `README.md` layout。
  - [ ] Fixture input 不得使用当前 repo `_bmad`、`_bmad-output`、home directory、checkout root、cache、temporary path、external network 或 package-manager cache 作为 truth。
  - [ ] Expected outputs 至少覆盖 `install --json`、`status --json`、`validate --json`、`update --json`、`speclite resolve config`、`speclite resolve customization` 和代表性 human-readable Compact / Evidence outputs。
  - [ ] Public path fields 包含 `data.paths.*`、`validatedPaths`、`changedPaths`、`skippedPaths`、`issues[].affectedPath`、`updatePlan.actions[].affectedPath`、manifest/index paths、files index paths、IDE target paths、source `resolvedRoot` 和 artifact paths；`repairPlan.actions[].affectedPath` 只在本 Story 承接的 explicit `speclite update --repair --json` fixture sub-scenario 中覆盖，并必须绑定 `CommandResult.command: "update.repair"` 与 `RepairCommandData`。
  - [ ] All public project paths 必须是 project-relative POSIX-style；`data.paths.projectRoot` 必须是 `"."`。Stable snapshots 必须 fail on absolute path、home directory、drive letter、backslash separator、checkout root、cache path、temporary path、fixture output absolute path、credential-bearing source locator 和 environment-derived path。

- [ ] Task 5: 覆盖 LF、executable intent、case conflict 与 escape hazards（AC: 4-6）
  - [ ] Add fixture assertions for canonical source text LF preservation。File hashes 基于 raw bytes；line endings 不得被 normalize 掩盖。
  - [ ] 对 generated scripts/runtime scripts 断言 files index `executable: true` 或明确的 executable intent；Windows 上不要求 POSIX chmod，但要验证受支持脚本入口可用。
  - [ ] 覆盖 case-insensitive conflict：例如两个 planned writes 规范化后在大小写不敏感文件系统上冲突，必须产生 stable `file-integrity.case-conflict` 或 owning SPEC 指定的 conflict reason，并阻断写入。
  - [ ] 覆盖 symlink escape 和 path escape：safe write / validation 必须阻断项目外写入，或产生 stable `runtime-path.symlink-escape`、`artifact-path.symlink-escape`、`artifact-path.escapes-project`、`file-integrity.unsafe-overwrite-risk` 或 owning taxonomy 中更具体 issue。
  - [ ] 不得把 escaped absolute path 写入 public JSON、manifest/index、files index、fixture snapshots 或 `ValidationIssue.details`。

- [ ] Task 6: 覆盖 shell invocation 与 resolve path semantics（AC: 3, 7）
  - [ ] macOS 与 Windows fixture invocation 必须通过显式 command path 或 package bin mapping 运行，不依赖 shell aliases、profile、checkout root、PATH side effects 或 OS-specific separators。
  - [ ] `CommandResult.command` 必须稳定为 `install`、`status`、`validate`、`update` 或 `update.repair`；`speclite resolve` 不使用 `CommandResult` envelope。
  - [ ] `speclite resolve` stdout 只输出 pure resolve-result JSON；stderr 使用 `ValidationIssue` JSON Lines diagnostics。Resolve parity comparison parse JSON semantics，不比较 byte-for-byte formatting。
  - [ ] `resolve customization --skill` 使用 skill directory basename 作为 lookup key；不得从 IDE target path、display name、menu label、phase label 或 checkout path 推导第二个 key。

- [ ] Task 7: 覆盖 terminal width / no-color / CI / copy-paste output（AC: 8）
  - [ ] Human-readable output tests 覆盖 Compact width `<80`、Standard width `80-119`、Wide width `>=120`；断点只影响 presentation，不影响 `CommandResult` data、issue ordering、path normalization、exit code 或 fixture comparison。
  - [ ] `NO_COLOR`、non-TTY、CI 和 copy-paste review 场景必须无 ANSI escape、无图标唯一语义、无动态覆盖行唯一进度；status、severity、issueId、category、path、targetId、next action、planned effect、conflict reason 和 empty state 都有文本等价表达。
  - [ ] 窄终端表格降级为 key-value block 时，不得丢失 automation-relevant field；automation 仍必须依赖 structured JSON 或 file contract，而不是 human prose。
  - [ ] Documentation-facing examples 如被 packaging acceptance 标记为 packaged documentation example，必须使用无颜色文本并来源于 fixture expected outputs 或同一 semantic model。

- [ ] Task 8: 实现 packaging acceptance release checklist gate（AC: 9）
  - [ ] 实现或完成 `npm run release:packaging-check`，生成 stable `dist/packaging-manifest.json`。
  - [ ] Packaging manifest 至少列出 package file inventory、package hash 或等价 package evidence、bin mapping、included runtime assets、excluded fixture directories、generated timestamp normalization/exclusion policy 和 pass/fail assertions。
  - [ ] 断言 package 包含 `package.json` bin mapping、`dist/bin/speclite.js`、`assets/source/speclite/`、installer/runtime schemas、runtime scripts/templates、安装执行所需 runtime assets。
  - [ ] 断言 package 默认不包含 `test/fixtures/` 和 root `fixtures/`。只有被显式标记为 packaged documentation example 的路径可以进入 package，且这些 examples 不等同于 release gate fixtures。
  - [ ] `npm pack --dry-run --json` 可以作为 package file inventory evidence 的输入，但 SpecLite 的 release checklist truth 是 `dist/packaging-manifest.json` 与 `npm run release:packaging-check` 的 assertions。

- [ ] Task 9: 承接 explicit repair fixture（AC: 10）
  - [ ] 先检查 Story 6.3 是否已经实现 explicit repair fixture。如果尚未实现，本 Story 必须承接 explicit repair fixture ownership，不得继续 handoff 到未定义的 subsequent scope。
  - [ ] Explicit repair fixture 只能使用 `speclite update --repair --json`，`command: "update.repair"`，`data: RepairCommandData`。不得把 repair output 放进 normal `update`、`ide-drift` validate expected output 或 source-integrity sub-case。
  - [ ] Repair expected outputs 至少覆盖 IDE mirror drift repair、missing-source-evidence conflict、human/workflow protected paths、`RepairCommandData` snapshots、human-readable repair plan block 和 post-repair validate guidance。
  - [ ] Repair fixture 必须遵守 Story 4.6：`RepairPlan.actions[]` 只能包含 installer-owned entries；`restore-canonical` / `regenerate` 必须有 `expectedHash`；human-owned、workflow-owned、unknown ownership、missing source evidence 和 unsupported repair 进入 conflicts 或 protected skip projection。
  - [ ] Repair expected outputs 更新顺序必须是 owning SPEC / executable schema-parser-comparator first，fixture snapshots last。不得先改 snapshots 再反推 repair contract。

- [ ] Task 10: 本地验证与范围控制（AC: 1-11）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 runtime guard、Node matrix config, path normalizer, fixture contract, path-portability fixture, explicit `update --repair` fixture, diagnostics output profiles, CommandResult parser, resolve output parser, manifest/files-index parser, packaging-check 和 affected update/repair tests。
  - [ ] Tests 必须 deterministic、local-only；不得访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 release evidence、fixture pass、package inventory 或 performance baseline。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-5、Story 6.1/6.2/6.3、Story 6.5、Epic 7、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 6.5 skill-artifact-loop、documentation examples rewrite、Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、enterprise dashboard、coverage trend report 或 full source lockfile lifecycle。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`sprint-status.yaml` 中 `epic-6` 为 `in-progress`，`6.1`、`6.2`、`6.3` 为 `ready-for-dev`，`6.4` 为 `backlog`，`6.5` 为 `backlog`。本 Story 创建后只应将 `6.4` 改为 `ready-for-dev`，保持 `epic-6` 为 `in-progress`，并保持 6.1/6.2/6.3 状态不变。
- 创建本 Story 前，目标 story file `_bmad-output/implementation-artifacts/6-4-path-portability-and-runtime-matrix-evidence.md` 不存在。
- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 或 `dist/` implementation scaffold。`assets/source/speclite/` 下存在 source skill assets / module metadata / legacy resolver scripts 的可能性不等同于 MVP TypeScript CLI implementation。
- 当前 worktree 已有用户或其它流程产生的 dirty planning artifacts、`sprint-status.yaml` 改动和大量未跟踪 implementation story files。实现本 Story 时不得格式化、重写、同步或回滚无关改动。
- `_bmad-output/project-context.md` 当前仍是 initialized placeholder，没有补充新的 implementation guardrails。实际 implementation guardrails 以 live PRD、Architecture、UX、readiness report、owning SPEC artifacts、previous story contexts 和本 Story 为准。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能指向不含 `tomllib` 的旧 runtime。
- 本 Story 是 ready-for-dev story context。它描述 dev agent 应如何实现、验证和守住边界；它不是 `path-portability` fixture、runtime matrix、packaging check、release/performance evidence、schemas、tests 或 release gate 已存在的证明。

### Scope Boundary（范围边界）

- 本 Story 负责：`path-portability` release gate fixture、Node 22/24 runtime matrix evidence、macOS 13+ / Windows 11 path portability evidence、runtime/p95 release-performance evidence policy、LF line ending assertions、files index `executable` intent assertions、case conflict / symlink escape / path escape / shell invocation differences、terminal width / `NO_COLOR` / non-TTY / CI / copy-paste output coverage、packaging acceptance release checklist gate，以及 6.3 repair handoff 的 explicit repair boundary。
- 本 Story 消费：Story 6.1 的 fixture contract foundation；Story 6.2 的 fresh install / existing update normal fixture gates 和 repair handoff；Story 6.3 的 ide-drift / source-integrity / resolve-parity fixtures 和 repair handoff；Story 5.5 的 source descriptor trust/redaction closure；Story 4.6 的 explicit repair semantics；Story 2.4 的 resolve parity baseline。
- 本 Story 不负责：Story 6.5 `skill-artifact-loop` end-to-end、documentation examples rewrite、多 skill scenarios、workflow narrative quality validation、人工评审结论；Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、enterprise dashboard、coverage trend report、full source lockfile lifecycle、signatures、provenance policy 或 hosted service。
- 本 Story 不修改 owning SPEC。若 implementation 发现 public JSON、fixture layout、manifest/index, install plan, taxonomy, resolve behavior, runtime policy 或 packaging contract 需要变更，必须先提出并更新 owning SPEC / Architecture，再更新 executable schema/parser/comparator，最后更新 fixture expected outputs。
- Packaging acceptance 是 release checklist gate，不是 `test/fixtures/<case>/` fixture project case。`path-portability` 是 fixture project release gate。不要把两者合并。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node 26 Current 不进入 MVP baseline。不要使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 runtime policy、fixtures 和 release matrix。
- CLI foundation 保持 TypeScript + commander；不要为 matrix、packaging check、renderer 或 fixture runner 引入新的 CLI framework。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。新增 dependency 前必须证明 Node 22 support、offline determinism、cross-platform path behavior、redaction behavior 和 CI failure semantics。
- `src/fs/path-normalizer.ts` 是 project-relative POSIX path、redacted external path diagnostic、Windows separator / drive-letter leak rejection、path escape、symlink escape、case conflict 和 redaction-safe path display 的共享边界。Fixture helper 不得复制第二套路劲逻辑。
- `src/diagnostics/output.ts` 拥有 Compact、Evidence、Structured profiles。Terminal width、`NO_COLOR`、non-TTY、CI 和 copy-paste review coverage 必须驱动 shared renderer，而不是允许各 command 手写 status text、issue layout、path display、next action order 或 profile-specific private fields。
- `src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper 与 `src/manifest/hash.ts` 必须保持 raw-byte hash semantics。Line endings、executable bit、file mode、symlink handling 和 case conflict 是独立 validation dimensions，不得通过 hash normalization 隐式吸收。
- `src/commands/resolve.ts` / `src/config/resolve-output-schema.ts` 必须保持 `speclite resolve` 的 CommandResult exception：stdout pure JSON，stderr JSON Lines diagnostics，不使用 `CommandResult` envelope。
- `npm run release:packaging-check` 与 `dist/packaging-manifest.json` 属于 release checklist implementation。它可以消费 npm package inventory evidence，但 package inclusion/exclusion assertions 由 project contract 管理。

### Implementation Anchors（实现锚点）

实际 dev agent 必须先检查这些 anchors 是否已经存在；若不存在，按前置 story 顺序创建或记录 blocker，不得绕过 owning SPECs 创建私有实现：

- `src/bin/speclite.ts`、`src/commands/install.ts`、`src/commands/status.ts`、`src/commands/validate.ts`、`src/commands/update.ts`、`src/commands/resolve.ts`：command entrypoints and normalized command ids。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`：`CommandResult` / `ValidationIssue` schema, status / exit-code derivation, output profiles, no-color / terminal width rendering。
- `src/config/resolve-output-schema.ts`、`src/config/merge-rules.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`：resolve parity, pure stdout JSON, stderr JSON Lines diagnostics。
- `src/fs/path-normalizer.ts`、`src/fs/safe-write.ts`、`src/fs/permissions.ts`、`src/fs/copy-tree.ts`：project-relative POSIX paths, LF preservation, symlink/path escape, case conflict, executable intent, safe writes。
- `src/manifest/manifest-schema.ts`、`src/manifest/manifest-generator.ts` 或等价 files/skill/help index helper、`src/manifest/hash.ts`：manifest/index projection, raw-byte hashes, files index `executable`, target order, source refs。
- `src/installer/install-plan-schema.ts`、`src/installer/install-runner.ts`、`src/installer/progress-events.ts`、`src/installer/ready-summary.ts`：install planning, runtime guard, progress, ReadyCheck and stable path output。
- `src/update/update-plan.ts`、`src/update/conflict-detector.ts`、`src/update/repair-plan.ts`、`src/update/apply-update.ts`、`src/update/ownership-model.ts`：normal update vs explicit repair, conflicts, repair handoff and path ordering。
- `src/validation/rules/runtime-path.ts`、`src/validation/rules/artifact-path.ts`、`src/validation/rules/file-integrity.ts`、`src/validation/rules/operation-lock.ts`：path escape, symlink escape, case conflict, executable-bit mismatch, stale temp and lock diagnostics。
- `src/fixtures/fixture-contract.ts` 或 equivalent：fixture manifest parsing, expected output comparison, release gate classification, performance evidence presence assertions。
- `test/fixtures/path-portability/`：primary release gate fixture for this Story。
- `test/unit/fs/`、`test/unit/diagnostics/`、`test/unit/manifest/`、`test/integration/install.test.ts`、`test/integration/status.test.ts`、`test/integration/validate.test.ts`、`test/integration/update.test.ts`、`test/integration/resolve.test.ts`：focused tests。
- `.github/workflows/ci.yml` 或 release workflow equivalent：Node matrix and OS matrix wiring。
- `scripts/release/packaging-check.*` 或 package script equivalent：`npm run release:packaging-check` implementation。
- `dist/packaging-manifest.json`：stable packaging acceptance artifact generated by release packaging check。

### Path Portability Fixture Requirements（路径可移植性 Fixture 要求）

- Fixture case name is `path-portability`; it is a release gate fixture project case, not a documentation example and not packaging acceptance.
- OS release evidence must include macOS 13+ and Windows 11. Local developer runs may narrow the matrix, but MVP release evidence must include both supported OS families.
- Commands covered: `install`, `status`, `validate`, `update`, `resolve config`, `resolve customization`, and a separate explicit `update --repair` sub-scenario for the 6.3 repair handoff.
- Public project path fields must always be project-relative POSIX-style. Covered examples: `data.paths.*`, `targetPath`, `validatedPaths`, `changedPaths`, `skippedPaths`, `issues[].affectedPath`, `updatePlan.actions[].affectedPath`, manifest/index path fields, files index `path`, phase coverage `entryPath`, artifact paths and source `resolvedRoot` when it references project-internal paths. `repairPlan.actions[].affectedPath` is covered only inside the explicit `update --repair` sub-scenario and must not appear in normal update/path-portability non-repair snapshots.
- Stable snapshots must reject absolute local paths, home directory fragments, drive letters, backslashes, checkout root, cache paths, temporary extraction paths, temporary Git checkout paths, fixture output absolute path, process ids, environment variable values, timestamps, random ids, stack traces and credentials.
- Canonical source text files must remain LF. Installer must not convert LF to CRLF on Windows or normalize CRLF back to LF silently in expected hash calculation.
- Runtime scripts / generated scripts must set files index `executable` intent. Windows assertions verify supported script invocation, not POSIX chmod.
- Case conflict coverage must prove write planning cannot produce different install results on case-sensitive vs case-insensitive filesystems.
- Symlink/path escape coverage must prove project boundary checks run before write/apply and before public projection.
- Shell invocation coverage must avoid shell aliases and platform-specific separators; command ids, exit codes and JSON semantics remain stable.

### Runtime Matrix Evidence Requirements（运行时矩阵证据要求）

- Node matrix: exactly MVP baseline `[22, 24]` unless runtime policy is changed first. Node 22 is minimum; Node 24 is recommended; Node 26 Current is not an MVP baseline.
- CI should use explicit `node-version`, such as `node-version: ${{ matrix.node }}`, and a project-scoped matrix containing `[22, 24]`.
- Runtime guard must fail before reading/writing project files on unsupported Node and use `environment.unsupported-node` with deterministic details containing `detectedVersion` and `requiredRange`.
- Release evidence must associate each gate run with Node version, OS family, fixture case, command set, pass/fail conclusion and artifact locations.
- Runtime/p95 evidence must record p95 duration, regression percentage and profiling sample reference outside stable snapshots. Stable snapshots assert evidence metadata and pass/fail conclusion only.
- If CI uses OS matrix, `path-portability` release evidence must include both macOS and Windows. Linux can be used for additional confidence, but it does not replace macOS 13+ / Windows 11 evidence required by this Story.

### Packaging Acceptance Requirements（Packaging Acceptance 要求）

- `packaging-acceptance` is a release checklist gate. Do not create `test/fixtures/packaging-acceptance/` as a fixture project case unless a future SPEC explicitly changes this boundary.
- `npm run release:packaging-check` must generate `dist/packaging-manifest.json`.
- Packaging manifest must list package file inventory and stable assertions. It should be usable for bundled source trust evidence by Story 5.5 / 6.3 semantics, but it is not itself a source descriptor replacement.
- Required included inventory:
  - `package.json` with bin mapping for the CLI.
  - `dist/bin/speclite.js`.
  - `assets/source/speclite/`.
  - installer/runtime schemas and executable parser anchors required at runtime.
  - runtime scripts/templates.
  - installation-time runtime assets required by bundled source, resolver, manifest/index generation, diagnostics and adapters.
- Required excluded inventory:
  - `test/fixtures/` by default.
  - root `fixtures/` by default.
  - fixture output, cache, temporary, local checkout-only, development-only or source-test-only assets.
- Exception: a path may be packaged only if it is explicitly marked as packaged documentation example. Such examples must not be treated as release gate fixtures and must not define a second schema truth.
- `npm pack --dry-run --json` can be used to produce raw package inventory evidence. The project-level acceptance remains `npm run release:packaging-check` and `dist/packaging-manifest.json`.

### Repair Fixture Handoff（Repair Fixture 交接）

- Story 6.2 explicitly kept normal `existing-install-update` separate from `update --repair`; Story 6.3 defaulted repair execution fixture out of its scope and handed remaining repair expected outputs to 6.4 if still uncovered.
- This Story owns the remaining explicit repair fixture scope. Create a separate explicit repair fixture or sub-scenario using `speclite update --repair --json`, `command: "update.repair"` and `RepairCommandData`.
- Explicit repair coverage must include IDE mirror drift repair, missing source evidence conflicts, protected human/workflow paths, `RepairCommandData` snapshots, human-readable repair plan block and post-repair validate guidance.
- Do not mix repair into normal `update`, `ide-drift` validate output, source-integrity source trust sub-cases, resolve-parity or packaging acceptance.
- Repair actions can only be installer-owned. Human-owned custom files and workflow-owned artifacts must never enter `RepairPlan.actions[]`.
- `restore-canonical` / `regenerate` require `expectedHash`. Missing source evidence or missing canonical baseline must remain conflict with stable reason code such as `missing-source-evidence`.
- Contract-first order remains mandatory: owning SPEC / executable schema-parser-comparator first, fixture snapshots last.

### Testing Requirements（测试要求）

- Use Vitest and project-established fixture runner/comparator if present.
- Tests must be deterministic and local-only. Do not access npm registry, private registry, Git remote, offline bundle origin, package-manager cache, remote provenance service or external network.
- JSON tests must parse and compare semantic fields, not raw pretty-printed bytes, unless formatting itself is the contract under test.
- Required test groups:
  - Runtime guard tests: Node 22/24 accepted, unsupported runtime produces `environment.unsupported-node`.
  - Matrix wiring tests: CI/release config includes `[22, 24]`, not Node 20 or Node 26 as MVP baseline.
  - Path normalizer tests: POSIX output, Windows separator normalization, drive letter leak rejection, home directory leak rejection, checkout-root-independent comparison, redacted external path diagnostic shape.
  - Path escape tests: symlink escape, `..` escape, project boundary violation and artifact root escape.
  - Case conflict tests: case-insensitive collision blocked deterministically.
  - LF tests: canonical source text file bytes remain LF across platforms.
  - Executable intent tests: files index records `executable` and Windows script entry point works without POSIX chmod assumption.
  - Shell invocation tests: command id, exit code, JSON output stable across macOS / Windows invocation paths.
  - Human-readable renderer tests: `<80`, `80-119`, `>=120`, `NO_COLOR`, non-TTY, CI and copy-paste review.
  - Packaging-check tests: inventory includes required runtime assets, excludes fixtures by default, emits `dist/packaging-manifest.json`.
  - Performance evidence tests: evidence artifact exists and contains measurement metadata; stable snapshots do not compare wall-clock values.
  - Explicit repair tests: must use `update.repair` and `RepairCommandData`; must cover `repairPlan.actions[].affectedPath` only in the explicit repair fixture sub-scenario.
- Negative tests must fail on absolute path leak, home directory leak, Windows drive letter leak, OS separator leak, credential leak, cache/temp path leak, timestamp leak, random id leak, process id leak, environment value leak, raw stderr/stack trace leak, duration leak into stable snapshots, Node 24-only API usage without compatibility path, and normal update accidentally repairing drift.

### Previous Story Intelligence（前序 Story 情报）

- Story 6.1 established fixture contract foundation: stable lower-kebab layout, single case vs group sub-case layout, expected output classes, semantic JSON comparison, path/timestamp/randomness policy, Compact/Evidence/Structured profiles, release gate vs regression asset classification, and packaging acceptance as non-fixture release checklist gate.
- Story 6.1 already identified `path-portability` as a release gate fixture and required Node 22/24 plus macOS/Windows path portability release evidence. 6.4 is the focused implementation story for that matrix.
- Story 6.2 implemented the story context for `fresh-install-empty-project` and normal `existing-install-update`; it explicitly kept `update --repair` out of normal update and handed explicit repair fixture ownership to later Story 6.3 / 6.4.
- Story 6.3 implemented the story context for `ide-drift`, `source-integrity` required sub-cases and `resolve-parity`; it defaulted repair execution fixture out of scope unless separately created, and handed remaining repair expected outputs to Story 6.4.
- Story 6.3 also warned not to treat source-integrity redaction or resolve parity as path-portability full OS/runtime evidence. 6.4 must provide the matrix and packaging release evidence without renaming 6.3 sub-cases.
- Story 5.5 closed `SourceDescriptor` trust and redaction: `trusted` only from expected hash / lock match or bundled packaging evidence; `unverified` requires explicit selection and reproducible evidence; `blocked` covers missing/mismatch/self-reference/floating Git/source failure. Path portability must preserve those redaction rules across OSes.
- Story 4.6 defined explicit repair: ordinary `speclite update` never repairs drift; only `speclite update --repair` can produce `command: "update.repair"` and `RepairCommandData`; `restore-canonical` / `regenerate` require `expectedHash`; human-owned and workflow-owned paths remain protected.
- Story 2.4 defined `speclite resolve` as runtime support command outside `CommandResult`: stdout pure JSON, stderr JSON Lines diagnostics, merge logic centralized in `src/config/`, Python resolver only parity baseline.
- Readiness report 2026-05-26 requires implementation agents to read owning SPECs first, then PRD / Architecture summaries and Story, and flags Story 6.2 repair ownership as a watch item. 6.4 must explicitly prevent repair responsibility drifting into normal update or validate outputs.
- Recent git history is documentation/context/spec cleanup. It does not prove TypeScript implementation exists. Dev agent must re-check actual source tree before coding.

### Latest Technical Information（最新技术信息）

- Node.js official releases page checked on 2026-05-26 lists Node 24 as LTS, Node 22 as LTS, Node 26 as Current, and states production applications should use Active LTS or Maintenance LTS releases. SpecLite MVP remains Node 22 minimum + Node 24 recommended; do not upgrade MVP baseline to Node 26. Source: https://nodejs.org/en/about/previous-releases
- `actions/setup-node` documentation supports explicit `node-version` and matrix testing. Its README shows major version examples including `22` and `24`, and a sample matrix using `node: [ 20, 22, 24 ]`; SpecLite must narrow project CI to `[22, 24]` because Node 20 is excluded by Architecture and Node 26 is Current, not MVP baseline. Source: https://github.com/actions/setup-node
- npm CLI v11 `npm pack` docs support `dry-run` and `json` configuration. `npm pack --dry-run --json` can supply package file inventory evidence for `npm run release:packaging-check`, but the project acceptance artifact must remain `dist/packaging-manifest.json`. Source: https://docs.npmjs.com/cli/v11/commands/npm-pack
- No new third-party dependency is required by default. If fixture runner, package inventory helper, table renderer, snapshot serializer or performance profiler dependency looks necessary, first prove Node 22 support, offline determinism, cross-platform path behavior, redaction behavior, fixture stability and CI failure semantics.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, readiness report, owning SPEC artifacts and this Story.
- Project language rule remains: all generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/architecture/index.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/implementation-artifacts/6-1-fixture-case-layout-and-expected-output-contract.md`
- `_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md`
- `_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md`
- `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- Node.js releases: https://nodejs.org/en/about/previous-releases
- actions/setup-node: https://github.com/actions/setup-node
- npm pack docs: https://docs.npmjs.com/cli/v11/commands/npm-pack

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

TBD by dev-story agent.

### Debug Log References（调试日志引用）

TBD by dev-story agent.

### Completion Notes List（完成备注）

- Story context created by independent `bmad-create-story` sub-agent for Epic 6 / Story 6.4.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- This story is ready-for-dev context, not implementation completion evidence.

### File List（文件列表）

TBD by dev-story agent.
