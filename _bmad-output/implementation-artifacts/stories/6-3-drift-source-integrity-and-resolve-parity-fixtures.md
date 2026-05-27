# Story 6.3: Drift, Source Integrity And Resolve Parity Fixtures（Drift、来源完整性与 Resolve Parity Fixtures）

Status: ready-for-dev

<!-- Note: This file is ready-for-dev story context. It is not evidence that source implementation, fixture runner, schemas, tests, source-integrity sub-cases, ide-drift fixture, resolve-parity fixture, or release gates already exist. -->

## Story（故事）

作为 SpecLite 维护者，  
我希望 fixture suite 覆盖 IDE drift、source integrity 和 resolver parity，  
以便验证安装漂移、来源信任和配置解析这些高风险路径在变更后仍然稳定。

## Acceptance Criteria（验收标准）

1. **IDE drift validates canonical skill hash mismatch（IDE Drift 验证 Canonical Skill Hash Mismatch）**  
   **前提** `ide-drift` release gate fixture 人为修改某个 IDE mirror 中的 canonical skill package 文件；  
   **当** 运行 `speclite validate`；  
   **则** output 必须报告稳定的 `ide-mirror` 或 `file-integrity` issue，例如 `ide-mirror.hash-mismatch` 或 `file-integrity.hash-mismatch`；  
   **并且** expected output 必须包含 target、canonical skill id、hash mismatch details 和 suggested next step。

2. **IDE drift is diagnostic-only in validate（IDE Drift 在 Validate 中只诊断不修复）**  
   **前提** `ide-drift` fixture 已检测到 IDE mirror content drift；  
   **当** 运行普通 `speclite validate`；  
   **则** validate 必须保持 read-only，不自动修复、不写 `_speclite`、不写 IDE mirror、不更新 manifest/index；  
   **并且** human-readable output 和 `--json` 只通过 issue、affected path、component/details 与 next action 指向显式 repair。

3. **Source integrity is a fixture group with independent sub-cases（Source Integrity 是独立子用例 Fixture Group）**  
   **前提** `source-integrity` release gate fixture group 被执行；  
   **当** suite 运行；  
   **则** 必须分别运行 `bundled-packaging-trusted`、`bundled-packaging-missing-evidence-blocked`、`registry-lock-trusted`、`registry-unverified`、`git-floating-blocked`、`local-source-snapshot-unverified`、`local-source-path-redacted`、`local-source-installed-state-blocked`、`artifact-hash-mismatch-blocked` 和 `source-unreadable-blocked`；  
   **并且** 每个 sub-case 必须有独立 `input/`、expected command JSON、expected issues 和 redaction assertions，不得合并成一个大 fixture。

4. **Bundled source evidence gates trust（Bundled Source Evidence 决定信任）**  
   **前提** `bundled-packaging-trusted` 或 `bundled-packaging-missing-evidence-blocked` sub-case；  
   **当** 测试 bundled source 的 packaging evidence；  
   **则** packaging manifest、package hash 或 package lock match 可以产生 `trustStatus: "trusted"`；  
   **并且** missing packaging evidence 必须产生稳定 `source-integrity.missing-evidence` issue、`trustStatus: "blocked"`，并阻止 install/update write planning。

5. **Registry source trust distinguishes lock match and unverified evidence（Registry Source 区分 Lock Match 与未验证证据）**  
   **前提** `registry-lock-trusted` 或 `registry-unverified` sub-case；  
   **当** source resolver 处理 registry source；  
   **则** expected hash / lock match 才能产生 `trustStatus: "trusted"`；  
   **并且** 只有可复现 registry evidence、没有 trust anchor 且用户显式选择时，才可产生 `trustStatus: "unverified"` 并进入后续 write planning boundary。

6. **Floating Git and artifact hash mismatch are blocked（浮动 Git 与 Artifact Hash Mismatch 被阻断）**  
   **前提** `git-floating-blocked` 或 `artifact-hash-mismatch-blocked` sub-case；  
   **当** Git source 只有 branch/tag/remote URL，或 tarball/offline/local source 出现 hash/lock mismatch；  
   **则** source 必须被标记为 `trustStatus: "blocked"`；  
   **并且** blocked source 不得进入 `InstallPlan.plannedWrites`、`UpdatePlan.actions` 或任何写入步骤。

7. **Local source snapshot, redaction and self-reference are separated（Local Source Snapshot、脱敏与自引用分离）**  
   **前提** `local-source-snapshot-unverified`、`local-source-path-redacted` 或 `local-source-installed-state-blocked` sub-case；  
   **当** 测试 local source；  
   **则** snapshot hash 只覆盖 canonical source tree allowlist，且无 expected hash / lock match 时保持 `unverified`；  
   **并且** public JSON、fixture snapshot、manifest/index 和 `ValidationIssue.details` 不得泄露 absolute local path、home directory、drive letter、checkout root、cache、temporary 或 build output path；  
   **并且** local source 指向 `_speclite/`、IDE mirrors、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 时，必须产生 `source-integrity.local-source-self-reference`。

8. **Unreadable sources fail with stable source-integrity issues（不可读取来源以稳定 Source Integrity Issue 失败）**  
   **前提** `source-unreadable-blocked` sub-case；  
   **当** registry unreachable、authentication required、tarball unreadable 或 offline bundle unreadable 发生；  
   **则** expected issues 必须使用 taxonomy reserved `source-integrity` issue ids；  
   **并且** credentials、credential-bearing URLs、proxy secrets、cache paths、temporary paths、raw stderr 和 stack traces 必须 redacted。

9. **Resolve config parity covers merge and failure semantics（Resolve Config Parity 覆盖合并与失败语义）**  
   **前提** `resolve-parity` fixture 测试 `speclite resolve config`；  
   **当** fixture 执行 config resolver；  
   **则** expected outputs 必须覆盖 config four-layer merge order、missing key、repeated `--key`、required layer failure、optional layer warning diagnostic、stdout/stderr shape、exit code 和 non-ASCII JSON output；  
   **并且** merge semantics 与 legacy Python resolver baseline 保持一致。

10. **Resolve customization parity covers lookup key and array rules（Resolve Customization Parity 覆盖 Lookup Key 与数组规则）**  
    **前提** `resolve-parity` fixture 测试 `speclite resolve customization`；  
    **当** fixture 执行 customization resolver；  
    **则** expected outputs 必须覆盖 skill directory basename lookup key、customization three-layer merge order、explicit `--project-root`、fallback search compatibility、required/optional layer failure、keyed array replacement、append fallback 和 no deletion semantics；  
    **并且** adapter、installed skill helper、fixture helper 或 command module 不得实现第二套 merge logic。

11. **Fixture updates follow owning SPEC first（Fixture 更新遵循 Owning SPEC 优先）**  
    **前提** validation issue taxonomy、source descriptor、install plan、CommandResult、manifest/index、resolve contract 或 fixture comparison behavior 发生变化；  
    **当** 维护者更新 expected outputs；  
    **则** 必须同一变更中先更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 fixture assertions 和 snapshots；  
    **并且** 不得只改 snapshot 让测试通过。

12. **Repair outputs are explicit or handed off（Repair Output 必须显式或交接）**  
    **前提** 本 Story 触及 IDE drift 或 installer-owned drift 的 suggested next step；  
    **当** expected outputs 只覆盖 validate/source/resolve；  
    **则** 不得把 repair action 混入 normal update 或 validate fixture；  
    **并且** 若本 Story 不实现 explicit `update --repair` fixture，remaining repair expected outputs 必须 handoff 给 Story 6.4，且要求先更新 owning SPEC / executable schema/parser/comparator，再更新 snapshots。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 执行前置核对与契约阅读（AC: 1-12）
  - [ ] 重新检查 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/`、root `fixtures/` 和 `test/fixtures/` 是否已由前序 stories 实际实现。创建本 Story 时这些 implementation scaffold 在当前仓库根目录未发现；不得把 ready-for-dev story context 当作源码完成证据。
  - [ ] 按 `_bmad-output/planning-artifacts/specs/README.md` reading order 读取 owning SPEC：`01-command-result-json-contract.md`、`02-source-descriptor-contract.md`、`03-install-plan-contract.md`、`04-manifest-index-contract.md`、`06-resolve-command-contract.md`、`07-validation-issue-taxonomy.md` 和 `08-fixture-contract.md`。
  - [ ] 重新读取 Story 6.1、6.2、5.5、4.6 和 2.4，确认 fixture contract、normal update vs repair boundary、source trust/redaction 和 resolver parity 是否已真实落地。
  - [ ] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output、tests 和必须保留的 behavior。若前置 implementation 尚未存在，按前序 story 顺序补齐或记录 blocker，不得伪造 fixture pass。
  - [ ] 检查 dirty worktree，保留用户、父 agent 或其它 sub-agent 的改动；不得格式化、重写、同步或回滚无关 planning docs、Story 1-5、Story 6.1/6.2、其它 Epic 6 story、源码或 status 文件。

- [ ] Task 2: 建立 `ide-drift` release gate fixture（AC: 1-2, 11-12）
  - [ ] 在 `test/fixtures/ide-drift/` 或等价 fixture root 下创建 stable lower-kebab layout：`input/`、`expected/`、`README.md`。
  - [ ] Input state 必须包含已安装 manifest/index、files index、canonical skill package hash 和至少一个 IDE mirror target，例如 `.claude/skills/<canonicalSkillId>/` 或 `.agents/skills/<canonicalSkillId>/`。
  - [ ] 人为修改 IDE mirror 中 canonical skill package 文件，但不得修改 source-side `assets/source/speclite/`、manifest expected truth 或 files index expected baseline。
  - [ ] `speclite validate --json` expected output 必须使用 `CommandResult<ValidateCommandData>`，包含 `checkedCategories` canonical order、`checkedTargets` target order、`validatedPaths` project-relative POSIX paths 和 `issueCounts` 四个 severity keys。
  - [ ] Issue 可以归类为 `ide-mirror.hash-mismatch` 或 `file-integrity.hash-mismatch`，但不得重复报告同一个 finding。Target、canonical skill id 和 hash mismatch details 应放在 `affectedPath`、`component` 或 deterministic `details` 中；`issueId` 和 `suggestedNextStep` 不得嵌入 path、hash、target 或随机值。
  - [ ] Human-readable Evidence profile 必须展示 Summary、Checked、Target、Issue List 和 Next Actions；Compact / Structured representative assertions 继承 Story 6.1 output profile policy。
  - [ ] Validate 不得写文件或自动 repair。Suggested next step 可以稳定指向 explicit `speclite update --repair`，但本 fixture 不得输出 `RepairCommandData`，除非另建 explicit repair fixture。

- [ ] Task 3: 建立 `source-integrity` fixture group registry and layout（AC: 3, 11）
  - [ ] 在 fixture registry 中把 `source-integrity` 标记为 release-gate fixture group，而不是 fixture project case。
  - [ ] 为 10 个 required sub-cases 创建 `test/fixtures/source-integrity/<sub-case>/input/`、`expected/` 和 `README.md`。
  - [ ] 每个 sub-case 的 README 必须说明 source type、trustStatus expectation、expected issues、write planning eligibility、redaction assertions 和 owning SPEC references。
  - [ ] 每个 sub-case 的 expected command JSON 必须 parse 后 semantic comparison；不得只比较 pretty-printed JSON bytes。
  - [ ] 每个 sub-case 都必须有独立 expected issues；无 issue 的 trusted case 也要显式断言 `issues: []` 或 expected empty issue set。
  - [ ] 每个 sub-case 都必须有 redaction assertions，扫描 public JSON、manifest/index projection、human-readable output、stderr diagnostics 和 fixture snapshots。

- [ ] Task 4: 实现 source-integrity sub-case expected outputs（AC: 3-8）
  - [ ] `bundled-packaging-trusted`：input 使用 bundled source 和 matching packaging manifest / package hash / package lock evidence；expected JSON 断言 `sourceType: "bundled"`、`resolvedRoot` 为 display-safe label（例如 `assets/source/speclite`）、至少一项 verified evidence、`trustStatus: "trusted"`、无 blocking `source-integrity` issue。
  - [ ] `bundled-packaging-missing-evidence-blocked`：input 删除或破坏 bundled packaging evidence；expected JSON 断言 `trustStatus: "blocked"`、issue `source-integrity.missing-evidence`、failure status / no writes、无 package cache 或 build extraction path 泄露。
  - [ ] `registry-lock-trusted`：input 使用 registry package/version 与 expected hash 或 lock match；expected JSON 断言 registry evidence / version-lock evidence verified、`trustStatus: "trusted"`、registry URL/token/proxy detail 不进入 public fields。
  - [ ] `registry-unverified`：input 只提供可复现 registry evidence，且明确模拟用户显式选择 unverified source；expected JSON 断言 `trustStatus: "unverified"`、evidence `verified: false` 不表示失败、source 不被标记为 trusted。
  - [ ] `git-floating-blocked`：input 只提供 Git remote、branch 或 tag，不提供 resolved commit SHA；expected issue 使用 `source-integrity.floating-git-source` 或 owning taxonomy 中更具体 source-integrity id，`trustStatus: "blocked"`，不进入 write planning。
  - [ ] `local-source-snapshot-unverified`：input 使用 project-external local source snapshot hash，hash scope 只覆盖 canonical source tree allowlist；expected JSON 断言 `trustStatus: "unverified"`、`content-hash` evidence、无 `.git`、`node_modules`、cache、build output 或 editor/OS metadata 影响。
  - [ ] `local-source-path-redacted`：input 包含本机 absolute local path / home-like path / platform-specific separator；expected outputs 只出现 display-safe label 或 normalized redacted diagnostic object，stable snapshots 不包含原始 absolute path、home directory、drive letter 或 OS separator。
  - [ ] `local-source-installed-state-blocked`：input 指向 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output 中至少一种 blocked root；expected issue 必须是 `source-integrity.local-source-self-reference`，details 至少包含 `reason: "local-source-self-reference"` 和 stable `blockedRootKind`。
  - [ ] `artifact-hash-mismatch-blocked`：input 使用 tarball/offline bundle/local snapshot 与 expected hash 或 lock mismatch；expected issue 使用 `source-integrity.hash-mismatch` 或 `source-integrity.lock-mismatch`，`trustStatus: "blocked"`，不输出 raw artifact path、cache path 或 extraction path。
  - [ ] `source-unreadable-blocked`：input 覆盖 registry unreachable、authentication required、tarball unreadable 或 offline bundle unreadable 的 controlled failure；expected issues 使用 `source-integrity.registry-unreachable`、`source-integrity.authentication-required`、`source-integrity.tarball-unreadable` 或 `source-integrity.offline-bundle-unreadable`，并 redacted credentials、credential-bearing URLs、cache/temp paths、raw stderr 和 stack traces。

- [ ] Task 5: 建立 `resolve-parity` release gate fixture（AC: 9-11）
  - [ ] 在 `test/fixtures/resolve-parity/` 或等价 fixture root 下创建 stable layout，分别组织 `config` 和 `customization` input/expected groups。
  - [ ] Expected stdout 必须只包含 resolved JSON object，不得包裹 `CommandResult`，不得混入 human-readable prose、ANSI、icons、progress text、spinner output 或 debug lines。
  - [ ] Expected stderr 必须是 JSON Lines，每行 parse 为 `ValidationIssue` shape。Optional layer read/parse failure 输出 warning diagnostic 并 exit 0；required layer read/parse failure 输出 error/critical diagnostic、non-zero exit，并不得输出 partial resolved config 伪装成功。
  - [ ] Missing key 默认不是 failure：stdout `{}`，exit code 0，stderr 为空，除非同时存在 layer diagnostic。
  - [ ] Repeated `--key` must be allowed。Output object 使用原始 dotted key string 作为 top-level field name，existing keys included，missing keys omitted。
  - [ ] Non-ASCII JSON output 必须保留非 ASCII 字符不转义，2-space indentation 和 trailing newline 只是 formatting preference；fixture comparison 以 parsed JSON semantics 为准。

- [ ] Task 6: 覆盖 config/customization merge parity（AC: 9-10）
  - [ ] `speclite resolve config` merge order 必须是 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml`，后者覆盖前者；`_speclite/config.toml` 是 required。
  - [ ] `speclite resolve customization` merge order 必须是 skill `customize.toml`、`_speclite/custom/{skill}.toml`、`_speclite/custom/{skill}.user.toml`，后者覆盖前者；skill `customize.toml` 是 required。
  - [ ] `--skill` 必须使用 skill directory basename 作为 customization lookup key。不得从 display name、menu label、phase label、IDE-specific alias、target id、source checkout path 或 installed target path 推导第二个 key。
  - [ ] `resolve config` 必须要求 explicit `--project-root`。`resolve customization` 支持 explicit `--project-root`，省略时可保留 Python parity fallback：先从 skill directory 向上搜索 `_speclite` 或 `.git`，再从 cwd 搜索。
  - [ ] Arrays 遵守 Python parity：只有 base + override 全部 elements 是 tables 且共享同一个 `code` 或同一个 `id` 时 keyed merge；命中 key 时 override item 整项替换 base item，不做 item-level deep merge。
  - [ ] Mixed `code`/`id`、缺 key、non-table element 或其它 non-keyed arrays 必须 append；MVP 没有 deletion mechanism，不得通过 `null`、`enabled=false`、`remove`、empty arrays 或特殊字段删除 base items。
  - [ ] Unit tests 必须对照 legacy Python baseline 的 structural merge behavior，但产品 runtime 不得继续依赖 Python resolver path。

- [ ] Task 7: 收口 repair fixture handoff（AC: 2, 12）
  - [ ] 本 Story 默认不实现 `update --repair` execution fixture。`ide-drift` 只验证 validate diagnostic 和 next action；`source-integrity` 只验证 source trust/blocking/redaction；`resolve-parity` 只验证 resolver stdout/stderr。
  - [ ] 如果实现期间必须覆盖 repair expected outputs，必须创建 explicit `update --repair` fixture 或 sub-scenario，command id 必须是 `update.repair`，data 必须是 `RepairCommandData`，repair actions 只能覆盖 installer-owned paths，且 expected outputs 不得混入 normal `update`。
  - [ ] Repair expected outputs 必须承接 Story 4.6：`repairPlan.actions[]` 只能包含 installer-owned `restore-canonical` / `regenerate` / `skip`，`restore-canonical` / `regenerate` 必须有 `expectedHash`，human-owned 和 workflow-owned paths 不得进入 repair actions。
  - [ ] 若本 Story 不实现 explicit repair fixture，则把 remaining repair expected outputs handoff 给 Story 6.4：IDE mirror drift repair、missing source evidence conflict、protected human/workflow paths、`RepairCommandData` snapshots、human-readable repair plan block 和 post-repair validate guidance。
  - [ ] 无论由 6.3 还是 6.4 实现 repair fixture，都必须先更新 owning SPEC / executable schema/parser/comparator，再更新 snapshots。

- [ ] Task 8: 编写 focused tests 与 deterministic fixture checks（AC: 1-12）
  - [ ] Unit tests 覆盖 fixture registry：`ide-drift`、`source-integrity` group 10 sub-cases 和 `resolve-parity` 均为 release gates；`source-integrity` 不是 single case。
  - [ ] Validation tests 覆盖 IDE mirror hash mismatch issue category/id、canonical skill id projection、target projection、hash mismatch details、issue ordering、validate read-only 和 no repair side effect。
  - [ ] Source tests 覆盖 trustStatus matrix、evidence ordering、blocked write planning、local self-reference guard、source unreadable controlled failures、redaction helpers 和 validate no-network boundary。
  - [ ] Resolve tests 覆盖 config four-layer merge、customization three-layer merge、required/optional layer failures、missing key、repeated key、array merge rules、non-ASCII output、stdout/stderr shape 和 Python parity baseline。
  - [ ] JSON tests 必须 parse 后断言 semantic fields、ordering、path normalization、timestamp policy 和 redaction policy。
  - [ ] Human-readable tests 必须覆盖 Evidence profile、Compact/Structured representative assertions、`NO_COLOR`、non-TTY、CI、terminal width `<80` / `80-119` / `>=120`、no ANSI、text equivalents 和 key-value fallback。
  - [ ] Negative tests 覆盖 absolute path leak、home directory leak、Windows drive letter leak、OS separator leak、credential leak、cache/temp path leak、timestamp leak、random id leak、process id leak、environment value leak、raw stderr/stack trace leak、source-integrity/file-integrity category mix-up、resolver `CommandResult` envelope leak 和 normal update accidentally repairing drift。
  - [ ] Tests 必须 deterministic、local-only，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或外部网络。使用 injected clients、local fixture metadata、temporary target projects 和 fixture source packages。

- [ ] Task 9: 本地验证与交付边界（AC: 1-12）
  - [ ] 运行 `npm run build`。
  - [ ] 运行 `npm test`，或至少运行 fixture registry、ide mirror validation、source descriptor/trust/redaction、resolve parity、CommandResult parser、resolve output parser、manifest/files-index parser、diagnostics output profile、path normalization 和 affected fixture tests。
  - [ ] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass，不要跳过 source/redaction/resolve parity tests，不要创建 private JSON shape。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-5、Story 6.1/6.2、其它 Epic 6 story、Epic 7、无关源码或用户改动。
  - [ ] 检查 diff，确认没有提前实现 Story 6.4 path portability/runtime matrix full evidence、Story 6.5 skill-artifact-loop、packaging acceptance completion、Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair` / enterprise dashboard。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，`sprint-status.yaml` 中 `epic-6` 为 `in-progress`，`6.1` 与 `6.2` 为 `ready-for-dev`，`6.3` 为 `backlog`。本 Story 创建后只应将 `6.3` 改为 `ready-for-dev`。
- 创建本 Story 前，目标 story file `_bmad-output/implementation-artifacts/6-3-drift-source-integrity-and-resolve-parity-fixtures.md` 不存在。
- 创建本 Story 时，仓库根目录未发现 root `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` implementation scaffold。后续 dev agent 必须重新确认当前实现状态；如果前序 stories 尚未落地，不得把本 Story 当作源码已完成证据。
- 当前 worktree 已有用户或其它流程产生的 dirty planning artifacts、`sprint-status.yaml` 改动和大量未跟踪 implementation story files。实现本 Story 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是 initialized placeholder，没有补充新的 implementation guardrails。实际 implementation guardrails 以 live PRD、Architecture、UX、owning SPEC、readiness report 和本 Story 为准。
- 最近 5 个 commit 均为 docs/context/source/glossary/specs 方向，没有可复用的 TypeScript implementation commit pattern。Dev agent 必须读取实际源码与 tests，不得从 docs commits 推断实现已经存在。
- 本 create-story run 使用 `python3.12 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 成功解析 workflow；裸 `python3` 在本机可能指向不含 `tomllib` 的旧 runtime。
- 本 Story 是 ready-for-dev story context。它描述 dev agent 应如何实现、验证和守住边界；它不是 `ide-drift`、`source-integrity` sub-cases、`resolve-parity` fixture、fixture runner、expected outputs、schemas 或 tests 已存在的证明。

### Scope Boundary（范围边界）

- 本 Story 负责：`ide-drift` release gate fixture、`source-integrity` fixture group 10 个 required sub-cases、`resolve-parity` release gate fixture、expected command JSON、expected issues、stderr JSON Lines diagnostics、redaction assertions、semantic comparison、local-only deterministic tests、resolver Python parity baseline 和 repair fixture handoff。
- 本 Story 消费：Story 6.1 的 fixture layout、expected output class registry、semantic comparison、human-readable profile assertions、release gate classification；Story 6.2 的 normal update vs repair handoff；Story 5.5 的 source descriptor trust/redaction closure；Story 4.6 的 explicit repair boundary；Story 2.4 的 config/customization resolver parity。
- 本 Story 不负责：Story 6.4 path portability full OS/runtime matrix、runtime/p95 performance evidence、packaging acceptance completion；Story 6.5 skill-artifact-loop and documentation examples；Post-MVP `doctor` / `sync` / `uninstall`、top-level `repair`、backup/restore、enterprise dashboard、coverage trend report、full source lockfile lifecycle 或 provenance/signature policy。
- 本 Story 不修改 owning SPEC。若 implementation 发现 public JSON、source descriptor、install plan、manifest/index、resolve behavior、issue taxonomy 或 fixture contract 需要变更，必须先提出并更新 owning SPEC，再更新 executable schema/parser/comparator，最后更新 fixture expected outputs。
- Normal `update` 不属于本 Story。不得把 repair behavior 混入 normal update、validate 或 source-integrity fixtures。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node 26 当前为 Current，不进入 MVP baseline。不要使用 Node 24-only API，除非提供 Node 22-compatible path 并同步 runtime policy、fixtures 和 release matrix。
- CLI foundation 仍是 TypeScript + commander。不要为 fixture runner、source-integrity helper、resolve parity harness 或 output snapshots 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 继续使用 architecture-pinned `zod@4.4.3` 与 executable schema/parser anchors。不要为 source descriptor、resolve output、CommandResult、redaction 或 fixture comparison 引入新的 schema/runtime validation library，除非先证明 Node 22 support、offline determinism、cross-platform behavior 和 fixture stability。
- Storage model 是 filesystem-first/local-first。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent fixture cache server 或 background process。
- `src/fixtures/fixture-contract.ts` 或等价 anchor 负责 fixture manifest parsing、layout validation、expected output classes、comparison policy 和 release gate classification。它不得重新定义 CommandResult、SourceDescriptor、manifest/index、ValidationIssue、resolve output 或 install plan semantics。
- `src/source/` 是 source/channel abstraction 唯一领域边界。Source-specific resolvers 可以产生 source descriptor 或 stable source-integrity failure，但 trustStatus 必须由 centralized trust evaluator 推导。
- `src/config/` 是唯一 Config/Customization Merge Implementation 位置。Command modules、IDE adapters、installed skill helpers、fixtures 和 renderers 不得 hand-roll merge behavior。
- `validation/` 只读取 installed state 并产生 issues，不修复。`speclite validate` local-only，不访问 npm registry、Git remotes、offline bundle origins、private registry endpoints 或 remote provenance services。
- `src/diagnostics/output.ts` 拥有 Compact、Evidence、Structured profiles。Fixture assertions 应驱动 shared renderer，而不是允许各 command 手写 status text、issue layout、path display、next action order 或 private output fields。
- `src/fs/path-normalizer.ts` 是 project-relative POSIX path、path escape、symlink escape、case conflict 和 redaction-safe path display 的共享边界。Fixture helper 不得复制第二套路劲逻辑。

### Implementation Anchors（实现锚点）

实际文件名应贴合已经落地的实现。如果文件尚不存在，应按架构边界创建；如果文件已经存在，修改前必须完整读取并保留既有 behavior。

- `test/fixtures/ide-drift/`：IDE mirror drift release gate fixture input、expected validate command JSON、expected validation issues、human-readable output assertions 和 README。
- `test/fixtures/source-integrity/<sub-case>/`：source-integrity required sub-case input、expected command JSON、expected issues、redaction assertions 和 README。
- `test/fixtures/resolve-parity/`：config/customization resolver parity fixture input、expected stdout JSON、stderr JSON Lines、exit code expectations 和 README。
- `fixtures/sources/`：reusable source packages for bundled/local/tarball/offline/source-integrity cases, if already established by Story 6.1/6.2.
- `src/fixtures/fixture-contract.ts`：fixture manifest parsing、layout validation、expected output classes、release gate classification。
- `src/fixtures/fixture-runner.ts` 或 `test/fixtures/fixture-runner.ts`：执行 fixture case/sub-case、收集 actual outputs、调用 comparators；不得拥有 field-level contract truth。
- `src/fixtures/comparators/json.ts` 或等价 helper：CommandResult and resolve stdout semantic comparison、non-stable field normalization、stable ordering checks。
- `src/fixtures/comparators/stderr-jsonl.ts` 或等价 helper：resolve stderr JSON Lines parse and ValidationIssue comparison。
- `src/fixtures/comparators/file-tree.ts` 或等价 helper：raw-byte hash、installer-owned hash assertion、human/workflow-owned unchanged checks。
- `src/fixtures/comparators/human-output.ts` 或等价 helper：Compact/Evidence/Structured profile assertions、no ANSI、terminal width fallback、text equivalent checks。
- `src/source/source-descriptor-schema.ts`：`SourceDescriptor`、`SourceIntegrityEvidence`、source type、evidence kind、trustStatus executable schema/parser anchor。
- `src/source/source-integrity.ts` 或 `src/source/source-trust.ts`：central trust evaluator、source-integrity issue helpers、hash/lock/evidence failure helpers、redaction-safe details builder。
- `src/source/source-resolver.ts`、`src/source/source-discovery.ts`：bundled/registry/tarball/offline/Git/local source resolution boundaries。
- `src/validation/rules/source-integrity.ts`：validate local recorded source descriptor/evidence shape、manifest/index projection 和 installed state consistency；不得访问 remote source 或 project-external source origins。
- `src/validation/rules/ide-mirror.ts`、`src/ide/mirror-validator.ts`：IDE mirror drift facts, canonical skill id / target projection, hash mismatch issue creation。
- `src/validation/rules/file-integrity.ts`：generic installed file / files index hash mismatch facts when drift is not target-specific.
- `src/config/resolve-output-schema.ts`：resolve stdout JSON、stderr JSON Lines diagnostic 和 merge-result parser anchor。
- `src/config/merge-rules.ts`：shared Python parity structural merge rules。
- `src/config/config-reader.ts`、`src/config/customization-reader.ts`：config/customization layer reading and diagnostics。
- `src/commands/resolve.ts`：`speclite resolve config` / `speclite resolve customization` argv parsing、mode dispatch、stdout/stderr write 和 exit code。
- `src/commands/validate.ts`：validate orchestration and local-only rule execution。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`：public JSON envelope, status/exit code, issue ordering, human-readable profiles。
- `src/manifest/manifest-schema.ts`、`src/manifest/files-index.ts`、`src/manifest/hash.ts`、`src/manifest/skill-index.ts`：manifest/index projection, file-level hashes, canonical package hash and ownership metadata。
- `src/ide/adapter-registry.ts`：canonical target order `claude`, `agents` and target id validation。
- `src/fs/path-normalizer.ts`：project-relative POSIX paths, redacted external source labels, Windows drive/separator leak rejection。

### IDE Drift Fixture Requirements（IDE Drift Fixture 要求）

- Fixture id 必须是 `ide-drift`，release gate classification 为 fixture project gate。
- Input installed state 必须包含 readable manifest/index、files index、skill index、canonical package hash、selected IDE targets 和 installed target mirror entries。
- Drift 操作必须只改变 IDE execution plane mirror 中的 canonical skill package file，例如 `.claude/skills/<canonicalSkillId>/...` 或 `.agents/skills/<canonicalSkillId>/...`；不得修改 source canonical package 或 expected baseline。
- Validate expected JSON 必须使用 `CommandResult<ValidateCommandData>`。`checkedCategories` 按 canonical issue category order，至少包含实际执行到的 `ide-mirror` 或 `file-integrity`；`checkedTargets` 使用 adapter registry order `claude`、`agents`。
- Issue id 使用 taxonomy reserved id：target-specific mirror drift 优先 `ide-mirror.hash-mismatch`；generic files index hash mismatch 使用 `file-integrity.hash-mismatch`。不要对同一 drift 同时输出两个 finding。
- Expected issue 必须稳定包含：
  - target id：放在 `details.targetId` 或等价 deterministic field。
  - canonical skill id：放在 `component`、`details.canonicalSkillId` 或 equivalent deterministic field。
  - hash mismatch：`currentHash` / `expectedHash` 可放在 deterministic `details`；不得拼入 `issueId`、`impact` 或 `suggestedNextStep`。
  - affected path：project-relative POSIX path。
  - suggested next step：stable short sentence，指向 explicit repair 或 manual verification，不包含 path、hash、target、timestamp 或 random value。
- Human-readable output 必须按 Evidence profile 展示 Issue List 和 Next Actions；narrow terminal fallback 不得丢失 severity、issueId、affectedPath、targetId、canonicalSkillId、hash mismatch presence 和 suggested next step。
- Validate 是 read-only。Fixture 必须断言 `_speclite/`、IDE mirror、manifest/index、files index、source assets 和 workflow artifacts 在 validate 后 unchanged。
- 如果需要覆盖 repair output，必须创建独立的 explicit repair fixture。不得把 `RepairCommandData` 放进 `ide-drift` validate expected output。

### Source Integrity Fixture Requirements（Source Integrity Fixture 要求）

`source-integrity` 是 fixture group，不是 single fixture。每个 required sub-case 必须具备独立 input、expected command JSON、expected issues 和 redaction assertions。

| Sub-case（子用例） | Input（输入） | Expected command JSON（期望命令 JSON） | Expected issues（期望问题） | Redaction assertions（脱敏断言） |
| --- | --- | --- | --- | --- |
| `bundled-packaging-trusted` | Bundled source 携带 matching packaging manifest、package hash 或 package lock evidence。 | `sourceDescriptor.sourceType: "bundled"`；`resolvedRoot` 使用 display-safe label；`integrityEvidence[]` 包含 verified packaging evidence；`trustStatus: "trusted"`；没有 planned write blocker。 | `source-integrity` issue set 为空。 | 不出现 package cache、global npm path、build extraction path、checkout root 或 absolute path。 |
| `bundled-packaging-missing-evidence-blocked` | Bundled source 缺少 reproducible packaging evidence。 | `trustStatus: "blocked"`；write planning 前 failure；没有 changed paths 或 writes。 | `source-integrity.missing-evidence`，severity 为 `error`。 | 不出现 package cache、dist temp path、global install path、raw stack trace 或 build path。 |
| `registry-lock-trusted` | Registry package/version 命中 expected hash 或 version lock。 | `sourceType: "npm"` 或 `"private-registry"`；`registry-integrity` 或 `version-lock` evidence verified；`trustStatus: "trusted"`。 | `source-integrity` issue set 为空。 | 不出现 registry token、credential-bearing URL、proxy secret 或 private query string。 |
| `registry-unverified` | Registry evidence 存在，但没有 expected hash/lock trust anchor；fixture 模拟用户显式选择 unverified source。 | Evidence 记录为 `verified: false`；`trustStatus: "unverified"`；source 不因为 source type 自动升级为 trusted。 | 如果 explicit unverified selection 已表示，则不产生 blocking issue；warning/next action 只有在 owning SPEC/schema 定义时才断言。 | Registry host label 必须 display-safe；auth fields 和 query strings 不出现。 |
| `git-floating-blocked` | Git source 只有 remote URL、branch 或 tag，没有 resolved commit SHA。 | `sourceType: "git"`；`trustStatus: "blocked"`；没有 install/update write planning。 | `source-integrity.floating-git-source` 或 owning taxonomy 中更具体的 source-integrity id。 | 不出现 credential-bearing remote URL、temporary checkout path、Git object DB path 或 raw stderr。 |
| `local-source-snapshot-unverified` | Local source snapshot hash 只覆盖 canonical source tree allowlist，且没有 expected hash/lock match。 | `sourceType: "local"`；`content-hash` evidence 为 `verified: false`；只有 explicit selection 已表示时才允许 `trustStatus: "unverified"`。 | 如果没有 self-reference 与 mismatch，则不产生 blocking issue。 | Snapshot 中不出现 absolute local path、home directory、drive letter、checkout root、`.git`、`node_modules`、cache 或 build output。 |
| `local-source-path-redacted` | Local source locator 包含 machine-specific absolute path。 | Public `resolvedRoot` 使用 display-safe label 或 redacted external diagnostic shape；stable fields 保持 project-relative 或 redacted。 | 只有 owning schema 定义 redaction-related diagnostic 时才断言；否则 source 按 trustStatus evidence 继续。 | JSON/human/stderr/manifest snapshots 均不出现 original absolute path、home directory、drive letter、OS-specific separator 和 checkout root。 |
| `local-source-installed-state-blocked` | Local source 指向 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 或 build output。 | `trustStatus: "blocked"`；source 不进入 `InstallPlan` 或 write planning。 | `source-integrity.local-source-self-reference`；details 包含 `reason: "local-source-self-reference"` 和 stable `blockedRootKind`。 | Details 只能包含 `blockedRootKind` enum，不包含 raw blocked absolute path。 |
| `artifact-hash-mismatch-blocked` | Tarball/offline bundle/local snapshot hash 或 lock mismatch。 | `sourceType` 匹配 input；`trustStatus: "blocked"`；没有 write planning。 | `source-integrity.hash-mismatch` 或 `source-integrity.lock-mismatch`。 | 不出现 raw artifact path、unpack temp directory、cache path、drive letter、stack trace 或 checksum command stderr。 |
| `source-unreadable-blocked` | 受控 registry unreachable、auth required、tarball unreadable 或 offline bundle unreadable failure。 | Write planning 前 failure；descriptor projection 可用时 `trustStatus: "blocked"`；没有 changed paths。 | `source-integrity.registry-unreachable`、`source-integrity.authentication-required`、`source-integrity.tarball-unreadable` 或 `source-integrity.offline-bundle-unreadable`。 | Credentials、credential-bearing URLs、proxy secrets、cache paths、temporary extraction paths、raw stderr 和 stack traces 必须 redacted。 |

补充约束：

- `source-integrity` issues 属于 source resolver / install planning trust boundary。Installed file drift 属于 `file-integrity` 或 `ide-mirror`，不得报告为 `source-integrity`。
- `validate` 的 source-integrity checks 必须 local-only：只检查 recorded source descriptor/evidence shape 和 installed projection；不得调用 npm registry、Git remote、private registry、tarball origin、offline bundle origin 或 remote provenance service。
- `verified: false` 表示 evidence 可复现但没有匹配 trust anchor，不表示 failed verification。Failed verification 必须产生 `source-integrity` issue 和 `trustStatus: "blocked"`。
- `trusted` 只能来自 expected hash / lock match，或 bundled source packaging manifest / package hash / package lock match。Source type alone 不能让 source trusted。

### Resolve Parity Fixture Requirements（Resolve Parity Fixture 要求）

- Fixture id 必须是 `resolve-parity`，release gate classification 为 fixture project gate。
- `speclite resolve` 位于 `CommandResult` 之外。Expected stdout 必须是 pure JSON object；expected stderr 必须是 `ValidationIssue` JSON Lines。
- `speclite resolve config` command cases：
  - four-layer merge order：`_speclite/config.toml` -> `_speclite/config.user.toml` -> `_speclite/custom/config.toml` -> `_speclite/custom/config.user.toml`。
  - `_speclite/config.toml` required layer failure：non-zero exit，diagnostic 写入 stderr，不输出 partial success JSON。
  - optional layer missing：按 `{}` 处理，不产生 diagnostic。
  - optional layer read/parse failure：输出 warning JSON Line，failed layer 按 `{}` 处理；如果没有 error/critical diagnostic，则 exit 0。
  - missing key：stdout `{}`、exit 0；除非存在 layer diagnostic，否则 stderr empty。
  - repeated `--key`：output object 使用原始 dotted key string；existing keys included，missing keys omitted。
  - explicit `--project-root` required。
- `speclite resolve customization` command cases：
  - three-layer merge order：skill `customize.toml` -> `_speclite/custom/{skill}.toml` -> `_speclite/custom/{skill}.user.toml`。
  - `--skill` basename 是唯一 customization lookup key。
  - required skill `customize.toml` failure：non-zero exit，不输出 partial success JSON。
  - optional custom layer warning diagnostics 和 exit behavior 必须匹配 resolve SPEC。
  - explicit `--project-root` preferred；fallback search behavior 可为了 Python parity compatibility 覆盖。
- Array merge cases：
  - shared `code` keyed replacement。
  - shared `id` keyed replacement。
  - 不做 item-level deep merge；override item 整项替换 base item。
  - mixed `code`/`id`、missing key、non-table element 或 non-keyed arrays 使用 append fallback。
  - no deletion mechanism：`null`、`enabled=false`、`remove`、empty arrays 或 special fields 不得删除 base items。
- Formatting policy（格式策略）：
  - 2-space indentation、trailing newline、non-ASCII not escaped 只是 preferences。
  - Fixture comparator 必须 parse stdout JSON 并比较 semantics。
  - stderr comparator 必须把每个 JSON Line parse 为 `ValidationIssue`。
  - Machine stdout/stderr 不得出现 human-readable prose、ANSI escape、spinner output 或 debug line。

### Repair Fixture Handoff（Repair Fixture 交接）

- 本 Story 默认不实现 repair execution fixture。可以断言指向 explicit repair 的 `suggestedNextStep`，但不得在 validate/source/resolve expected outputs 中产生 `RepairCommandData`。
- 如果 implementation 在本 Story 中选择补充 repair coverage，必须使用独立 explicit fixture，command 为 `speclite update --repair --json`，输出 `command: "update.repair"` 和 `data: RepairCommandData`。
- Explicit repair fixture 必须遵守 Story 4.6：
  - Repair actions 只能覆盖 installer-owned paths。
  - `restore-canonical` 需要 resolved canonical source，或可证明 expected hash 的 installed canonical package baseline。
  - `regenerate` 需要 dry-run candidate content 和 required `expectedHash`。
  - Human-owned custom files 与 workflow-owned artifacts 永远不得进入 `RepairPlan.actions[]`。
  - Missing source evidence 必须成为 conflict `missing-source-evidence`，不得变成 repair action。
  - Normal `update` confirmation 或 `--yes` 永远不授权 repair。
- 如果 6.3 不实现 repair fixture，必须将 remaining expected outputs handoff 给 Story 6.4：
  - IDE mirror drift `update --repair` expected JSON.
  - Human-readable repair plan block 和 protected boundaries。
  - `RepairPlan.actions[]` / `conflicts[]` stable ordering。
  - Missing source evidence conflict。
  - Post-repair `speclite validate` guidance。
  - Contract-first update order：owning SPEC -> executable schema/parser/comparator -> fixture snapshots。

### Testing Requirements（测试要求）

- 使用 Vitest。
- Fixture tests 必须 deterministic and local-only。不得访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache、remote provenance service 或 external network。
- 使用 injected registry/Git/filesystem clients、temporary target projects、fixture source packages 和 local fixture metadata。不得把当前 repo 的 `_bmad` 或 `_bmad-output` 当作 installed target state。
- JSON tests 必须 parse and compare semantic fields。除非 formatting 本身是测试目标，否则不得比较 raw pretty-printed JSON bytes。
- Human-readable output tests 必须覆盖 Evidence profile、Compact/Structured representative assertions、`NO_COLOR`、non-TTY、CI、terminal width `<80` / `80-119` / `>=120`、no ANSI 和 text equivalent fields。
- IDE drift tests 必须通过检查 relevant fixture files 与 manifest/index 在 validate 后保持 unchanged，证明 validate read-only behavior。
- Source-integrity tests 必须覆盖 trustStatus matrix、evidence ordering、blocked write planning、redaction assertions、source-integrity vs file-integrity category separation 和 validate no-network boundary。
- Resolve parity tests 必须覆盖 stdout pure JSON、stderr JSON Lines、exit codes、config merge、customization merge、missing/repeated keys、optional/required layer failure、array merge 和 Python parity baseline。
- Redaction tests 必须覆盖 credentials、credential-bearing URLs、private query strings、home directory、drive letter、OS-specific separator、cache path、temporary extraction path、staging path、temporary Git checkout/object DB、raw stderr/stdout error 和 stack trace。
- Fixture snapshots 必须 normalize 或 exclude allowed generated timestamps 和 non-stable diagnostics。Unknown timestamp-like、random-like、environment-specific 或 absolute path fields 必须 fail。
- CI 不得 update snapshots。Local snapshot update 只能在 owning SPEC 和 executable schema/parser/comparator 更新后发生。
- MVP release 前需要 Node 22 和 Node 24 release gate evidence。本 Story 不得把 Node 26 加入 MVP baseline。

### Previous Story Intelligence（前序 Story 情报）

- Story 6.2 明确 normal `existing-install-update` fixture 不覆盖 `update --repair` execution。Repair expected outputs 必须通过 explicit `update --repair` fixture 或后续 Story 承接；不得把 repair assertions 塞进 normal update fixture。
- Story 6.2 的 repair handoff 要求先稳定 normal update conflict expected outputs，再在 explicit repair fixture 中验证 repair eligibility、expectedHash、restore-canonical/regenerate、missing-source-evidence 和 protected human/workflow paths。
- Story 6.1 已建立 fixture contract foundation：stable lower-kebab layout、single case vs group sub-case layout、expected output classes、semantic comparison、path/timestamp/randomness policy、Compact/Evidence/Structured output profiles、release gate vs regression asset classification。
- Story 6.1 已把 `source-integrity` required sub-cases 固化为 release-gate group sub-cases。6.3 必须实现这个 group matrix，而不是重新命名或合并 sub-cases。
- Story 5.5 收口 `SourceDescriptor` trust matrix：`trusted` 只能来自 expected hash / lock match 或 bundled packaging evidence match；`unverified` 需要 explicit selection and reproducible evidence；`blocked` 用于 missing/mismatch/self-reference/floating Git/source failure。
- Story 5.5 强调 redaction everywhere：credential、credential-bearing URL、private query string、home directory、absolute local path、drive letter、cache path、temporary extraction path、temporary Git checkout、raw stderr/stdout error 和 stack trace 不得进入 public JSON、manifest/index、human output 或 fixture snapshots。
- Story 4.6 明确 explicit repair boundary：ordinary `speclite update` 不修复 drift；只有 `speclite update --repair` 可以把可证明 repairable 的 installer-owned drift 转成 repair actions。
- Story 4.6 的 `RepairCommandData` 要求：`command: "update.repair"`、`repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized`；`restore-canonical` / `regenerate` 必须有 `expectedHash`。
- Story 2.4 明确 `speclite resolve` 是 runtime support command，不使用 `CommandResult` envelope；stdout pure JSON，stderr JSON Lines diagnostics，merge logic 集中在 `src/config/`，Python resolver 是 parity baseline 而不是长期 runtime。
- Story 2.4 的 resolver parity 已定义 config four-layer merge、customization three-layer merge、basename lookup key、missing/repeated keys、optional/required layer failure、array keyed replacement、append fallback、no deletion semantics 和 legacy Python resolver runtime instability。
- Readiness report 2026-05-26 的 watch item 指出 Story 6.2 repair 表述可能导致测试责任漂移；6.3 必须明确 repair fixture ownership，不得让 expected outputs 漂移到 normal update 或 validate。
- Readiness report 2026-05-26 的 recommended next step 要求 implementation agent 先读 owning SPEC reading order，再读 PRD / Architecture 摘要和 Story，避免 public JSON、manifest、fixture 与 ownership 规则漂移。

### Latest Technical Information（最新技术信息）

- Git 官方 `git ls-remote` 文档确认输出格式为 `<oid> TAB <ref> LF`，并用 commit ID 关联 ref。它可作为 Git source concrete ref evidence 的语义参考，同时 credential-bearing remotes 必须 redacted。来源：https://git-scm.com/docs/git-ls-remote
- Git 官方 `git rev-parse` 文档说明 `--verify`，对不可信名称建议使用 `--end-of-options`，并给出 `git rev-parse --verify --end-of-options $REV^{commit}` 作为验证 commit-ish object 的方式。它可作为 pinned Git commit validation 的语义参考；不得把 branch/tag/remote-only source 当作 installable source。来源：https://git-scm.com/docs/git-rev-parse
- Node.js 官方 releases 页面在 2026-05-26 核对时列出 Node 24 为 LTS、Node 22 为 LTS、Node 26 为 Current，并说明生产应用应使用 Active LTS 或 Maintenance LTS releases。SpecLite MVP 保持 Node 22 minimum + Node 24 recommended，不升级到 Node 26。来源：https://nodejs.org/en/about/previous-releases
- 默认不需要新增 third-party dependency。如果 fixture runner、source evidence helper、resolve comparator 或 snapshot tool 看起来必要，新增前必须基于 Architecture、Node 22 compatibility、offline determinism、redaction behavior、cross-platform path behavior 和 CI failure semantics 说明理由。

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- Project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/09-epic-6-maintainer-fixture-and-release-confidence维护者-fixture-与发布信心.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/architecture/index.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/implementation-artifacts/6-2-fresh-install-and-existing-update-fixture-gates.md`
- `_bmad-output/implementation-artifacts/6-1-fixture-case-layout-and-expected-output-contract.md`
- `_bmad-output/implementation-artifacts/5-5-sourcedescriptor-trust-status-and-redacted-reporting.md`
- `_bmad-output/implementation-artifacts/4-6-explicit-repair-for-recoverable-installer-owned-drift.md`
- `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
- `https://git-scm.com/docs/git-ls-remote`
- `https://git-scm.com/docs/git-rev-parse`
- `https://nodejs.org/en/about/previous-releases`

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

TBD by dev-story agent.

### Debug Log References（调试日志引用）

TBD by dev-story agent.

### Completion Notes List（完成备注）

- Story context created by independent `bmad-create-story` sub-agent for Epic 6 / Story 6.3.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List（文件列表）

- TBD by dev-story agent.
