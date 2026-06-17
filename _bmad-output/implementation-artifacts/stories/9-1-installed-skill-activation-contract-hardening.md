# Story 9.1: Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）

Status: ready-for-dev

<!-- Corrective Story: Node-only 默认 runtime support 已决策；本 Story 收口 installed skill activation protocol、CLI availability preflight 和 full corpus regression gate。 -->

## Story（故事）

作为 SpecLite 维护者和 AI IDE 使用者，
我希望所有已安装 Skill 的激活协议都通过 `speclite resolve` 读取 merged runtime config 和 customization，并在 `speclite` CLI 不可用时明确阻断，
以便 Agent / Workflow 在目标项目中使用一致的配置合并结果，不再误读单个 `_speclite/config.toml` 或回退 legacy Python resolver。

## Acceptance Criteria（验收标准）

1. **Default activation uses only Node CLI resolver（默认激活只使用 Node CLI Resolver）**
   **前提** canonical Agent 或 Workflow 需要读取 runtime config / customization；
   **当** 用户在 `.claude/skills`、`.agents/skills` 或等价 installed execution plane 中激活该 Skill；
   **则** activation protocol 必须调用 `speclite resolve config --project-root {project-root}` 与 `speclite resolve customization --skill {skill-root} --project-root {project-root}`；
   **并且** `--project-root` 必须显式传入；
   **并且** 默认 activation 不得调用 `_speclite/scripts/resolve_config.py`、`_speclite/scripts/resolve_customization.py`、`assets/source/speclite/scripts/resolve_*.py`、`python3 resolve_*.py`、`node dist/...` internal path、source checkout path 或 package cache path。

2. **CLI availability preflight is explicit（CLI 可用性预检明确）**
   **前提** Skill activation 即将调用 `speclite resolve`；
   **当** 当前 AI 会话 shell 中 `speclite` command 不可用；
   **则** Skill 必须 halt，并报告 `SpecLite CLI command speclite is not available in this AI session PATH` 或等价明确错误；
   **并且** next action 必须指向暴露或安装 Node CLI；
   **并且** 不得回退 Python resolver、手写 TOML merge 或误报 runtime config 缺字段。

3. **Merged config fields are honored by Agent activation（Agent 激活尊重合并后配置字段）**
   **前提** target project 的 `core.user_name`、`core.communication_language` 或 `core.document_output_language` 位于 `_speclite/config.user.toml`、`_speclite/custom/config.toml` 或 `_speclite/custom/config.user.toml`；
   **当** Agent activation 读取 runtime config；
   **则** 必须以 `speclite resolve config` 的 merged output 为准；
   **并且** 不得只读取 `_speclite/config.toml` 后要求用户补齐已存在于 merged config 的字段；
   **并且** `config.toml.example` 只能作为字段结构参考，不得作为 runtime fallback。

4. **Alice / NOI regression is covered（Alice / NOI 回归被覆盖）**
   **前提** fixture 或 integration setup 模拟 `/Users/fancyliu/Repos/noi` 的安装形态：`_speclite/config.toml` 不含 `core.user_name` / `core.communication_language`，但 `_speclite/config.user.toml` 包含这些字段；
   **当** `speclite-agent-analyst` activation protocol 执行 config preflight；
   **则** activation 读取到 merged values，并继续渲染 Alice menu；
   **并且** `persistent_facts` 指向的 `**/project-context.md` 缺失只记录为无可加载事实，不阻断菜单。

5. **Full canonical corpus rejects legacy resolver dependency（全量 Canonical Corpus 拒绝 Legacy Resolver 依赖）**
   **前提** release gate 扫描 canonical source skills 和 fresh install expected installed skills；
   **当** corpus test / agent lint 检查 activation protocol；
   **则** canonical persona Agent inventory 中所有 `assets/source/speclite/sdlc-skills/**/speclite-agent-*` 的 `SKILL*.md`、customization-capable workflow skills 和 `workflow.on_complete` references 必须使用 `speclite resolve`；
   **并且** installed mirror 中对应的 `.claude/skills/**/SKILL*.md`、`.agents/skills/**/SKILL*.md`、activation references 与 workflow terminal step files 必须满足同一 contract；
   **并且** support-side `assets/source/speclite/support-skills/speclite-agent-*` 必须进入 corpus inventory 和负向扫描，但除非其文档声明 persona activation block，否则不得被误判为 persona Agent 迁移对象；
   **并且** 出现 `resolve_customization.py`、`resolve_config.py`、`_speclite/config.toml` 单文件 runtime config 读取、`{speclite-runtime-root}/scripts` 默认调用或 source checkout resolver fallback 时测试失败。

6. **Existing resolver contract remains unchanged（现有 Resolver 契约保持不变）**
   **前提** 实现本 Story；
   **当** 修改 activation text、lint、fixtures 或 tests；
   **则** 不得改变 `speclite resolve` 默认 stdout pure JSON、stderr JSON Lines、missing key `{}` / exit 0、optional layer warning、required layer failure、merge order 或 `--human` opt-in behavior；
   **并且** 不得新增第二套 TOML merge implementation。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Preflight and contract review（AC: 1-6）
  - [ ] 读取 `06-resolve-command-contract.md`、ADR `0002-replace-python-resolvers-with-node-parity.md`、Story 2.3、2.4、6.5、8.5 和 Epic 9。
  - [ ] 读取 current implementation anchors：`src/commands/resolve.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`、`test/skill-artifact-loop.test.ts`、`assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py`。
  - [ ] 读取当前 dirty worktree，保留用户或其他流程的无关改动，不回滚、不格式化无关文件。

- [ ] Task 2: Add failing activation contract tests（AC: 1-5）
  - [ ] 新增或扩展 full corpus test，扫描 `assets/source/speclite/**/SKILL*.md`、`assets/source/speclite/**/references/**/*.md`、workflow terminal step files 和 fresh install mirrored `SKILL*.md` / reference files。
  - [ ] RED 断言 legacy resolver strings 失败：`resolve_customization.py`、`resolve_config.py`、`{speclite-runtime-root}/scripts/resolve_*.py`。
  - [ ] RED 断言 direct single-file runtime config 读取失败：`read {project-root}/_speclite/config.toml`、`从 {project-root}/_speclite/config.toml 加载配置` 或等价默认 activation 文案。
  - [ ] 新增 Alice regression fixture：`core.user_name` 与 `core.communication_language` 只在 `_speclite/config.user.toml`，activation protocol 必须通过 `speclite resolve config` 读取。
  - [ ] 新增 CLI unavailable negative test：模拟 `command -v speclite` 失败时 activation 文案要求 halt，且不得 fallback Python。
  - [ ] 新增 support-side inventory negative assertion：`assets/source/speclite/support-skills/speclite-agent-creator/**` 与 `assets/source/speclite/support-skills/speclite-agent-lint/**` 不得包含 legacy resolver / single-file config 默认 activation 文案，且不被当作 persona Agent positive migration target。

- [ ] Task 3: Migrate canonical Agent activation protocol（AC: 1-4）
  - [ ] 更新 canonical persona Agent inventory：`assets/source/speclite/sdlc-skills/**/speclite-agent-*/SKILL.md` 与 `SKILL.en.md`。
  - [ ] 明确排除 support tooling inventory：`assets/source/speclite/support-skills/speclite-agent-creator/**` 与 `assets/source/speclite/support-skills/speclite-agent-lint/**` 只做 negative corpus scan / packaging inventory check；除非它们新增 persona activation block，否则不迁移为 persona Agent。
  - [ ] 每个 Agent activation 必须先确认 `{skill-root}`、`{project-root}`、`{skill-name}`，再执行 `command -v speclite` preflight。
  - [ ] Agent block 读取使用 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key agent`。
  - [ ] Runtime config 读取使用 `speclite resolve config --project-root {project-root}` 或 focused required keys。
  - [ ] Required config field validation 基于 merged JSON output；`persistent_facts` file glob 缺失只作为 non-blocking fact gap。

- [ ] Task 4: Migrate workflow activation and terminal hooks（AC: 1, 5）
  - [ ] 更新 customization-capable workflow `SKILL.md`、`SKILL.en.md`、`references/activation.md`、`references/workflow-details.md` 和 terminal step files。
  - [ ] `workflow.on_complete` 解析统一使用 `speclite resolve customization --skill {skill-root} --project-root {project-root} --key workflow.on_complete`。
  - [ ] 不使用 `--human` 作为 machine activation input。
  - [ ] 不把 `resolve customization` 省略 `--project-root` 的 fallback 当推荐 installed contract。

- [ ] Task 5: Update agent lint and release gate corpus coverage（AC: 5）
  - [ ] 更新 `check_agent_skill.py` 的 activation markers：正向 marker 改为 `speclite resolve customization`、`speclite resolve config`、`--key agent`、`agent.persistent_facts`、`agent.menu`。
  - [ ] lint 负向检查 legacy Python resolver、single-file runtime config、source checkout resolver path。
  - [ ] 增加 full corpus test，覆盖 canonical source `SKILL*.md` / references / terminal step files 与 installed mirror 两侧。
  - [ ] 增加 canonical corpus inventory fixture，逐项标记 `sdlc-skills/**/speclite-agent-*` 为 persona Agent positive target，`support-skills/speclite-agent-creator` 与 `support-skills/speclite-agent-lint` 为 support tooling negative-scan target。
  - [ ] 保留 support tooling 边界，不把 support tool 自身误判为 persona Agent；若 support-side skill 未来新增 persona activation block，inventory test 必须先失败并要求显式分类。

- [ ] Task 6: Refresh generated artifacts and docs references（AC: 1-6）
  - [ ] 更新 fresh install expected installed-state snapshots、hash snapshots 和 `release/packaging-manifest.json`，因为 canonical skill bytes 会变化。
  - [ ] 更新 `docs/how-to/use-installed-skills.md`、`docs/reference/cli.md`、`README.md` 或等价 docs 中关于 installed skill activation 的 Node CLI availability 前提。
  - [ ] 不更新 unrelated docs、persona names、module metadata 或 workflow business content。

- [ ] Task 7: Verification（AC: 1-6）
  - [ ] 运行 `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`。
  - [ ] 运行 support-side inventory negative scan，覆盖 `assets/source/speclite/support-skills/speclite-agent-creator` 与 `assets/source/speclite/support-skills/speclite-agent-lint`。
  - [ ] 运行 full corpus activation contract tests。
  - [ ] 运行 `npm test -- test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts`。
  - [ ] 运行 `npm test -- --testTimeout 30000`。
  - [ ] 运行 `npm run release:packaging-check`。
  - [ ] 运行 `git diff --check`。

## Dev Notes（开发备注）

### Source Requirements（需求来源）

- Epic source: `_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`
- Resolve contract: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- ADR: `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md`
- Existing scope boundary: Story 2.4 明确 resolver runtime entry 已实现，但不负责 every source skill instruction migration。
- Existing fixture boundary: Story 6.5 只证明最小 installed activation / artifact loop，不证明 full canonical installed set coverage。

### Current Verified Gap（当前已验证缺口）

- `speclite-agent-analyst` 当前仍存在只读取 `_speclite/config.toml` 与 Python resolver 文案的风险，导致 `/Users/fancyliu/Repos/noi` 中已存在于 `_speclite/config.user.toml` 的 user fields 被误判缺失。
- `test/skill-artifact-loop.test.ts` 主要覆盖 `speclite-dev-story`，没有覆盖 Alice 或全量 canonical agent corpus。
- `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py` 仍把 `resolve_customization.py` 和 `_speclite/config.toml` 作为 activation markers。
- 当前 shell 中 bare `speclite` command 可能不在 `PATH`；activation contract 必须把 CLI availability 作为 explicit preflight。

### Canonical Corpus Inventory Rules（Canonical Corpus 清单规则）

| Inventory Class | Included Paths | Required Handling |
| --- | --- | --- |
| Persona Agent positive target | `assets/source/speclite/sdlc-skills/**/speclite-agent-*/SKILL.md` and `SKILL.en.md` | 必须迁移 activation protocol 到 `speclite resolve`，并通过 agent lint positive markers。 |
| Workflow activation target | `assets/source/speclite/**/SKILL*.md`、`references/**/*.md`、workflow terminal step files | 若读取 customization 或 `workflow.on_complete`，必须使用 `speclite resolve customization --project-root`。 |
| Support tooling negative-scan target | `assets/source/speclite/support-skills/speclite-agent-creator/**`、`assets/source/speclite/support-skills/speclite-agent-lint/**` | 不作为 persona Agent positive target；必须进入 legacy resolver / single-file config / source checkout resolver negative scan 和 packaging inventory check。 |
| Installed mirror target | `test/fixtures/fresh-install-empty-project/expected/installed-state/**/SKILL*.md` and mirrored references | 必须证明安装后的 `SKILL*.md` 与 references 没有重新引入 legacy activation dependency。 |

### Scope Boundary（范围边界）

- 本 Story 只迁移 activation protocol、lint、tests、fixtures 和 docs references。
- 不改 resolver implementation semantics。
- 不引入 Python fallback。
- 不新增 command pointer artifact、daemon、wrapper binary 或 IDE-specific activation target。
- 不修改 Skill persona 名称、菜单项、workflow domain logic 或 artifact quality requirements。

## Dependency Gate（依赖门禁）

- Story 2.4、6.5、8.5 必须保持已完成 contract：`speclite resolve` 默认 machine output 不变。
- Story 9.2 可在本 Story 后执行；即使 Python compat scripts 存在，Story 9.1 的 activation corpus tests 也必须拒绝引用它们。

## Anchor Contract Map（锚点契约映射）

| Anchor Type | Anchor | Requirement |
| --- | --- | --- |
| Contract Anchor | `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` | `speclite resolve` stdout/stderr、merge order、missing key、fallback behavior 不变。 |
| Decision Anchor | `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md` | Node resolver 是长期 runtime entry；Python resolver 是 baseline / diagnostics。 |
| Functional Anchor | `assets/source/speclite/sdlc-skills/**/SKILL*.md` | Canonical persona Agent activation protocol source。 |
| Functional Anchor | `assets/source/speclite/sdlc-skills/**/references/**/*.md` | Workflow activation / terminal hook references。 |
| Functional Anchor | `assets/source/speclite/support-skills/speclite-agent-creator/**` / `assets/source/speclite/support-skills/speclite-agent-lint/**` | Support-side `speclite-agent-*` inventory negative-scan target，不默认作为 persona Agent。 |
| Functional Anchor | `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py` | Agent lint marker 和 negative check。 |
| Evidence Anchor | `test/skill-artifact-loop.test.ts` | Existing minimal activation fixture，需补充 Alice / corpus coverage 或新建 focused test。 |
| Evidence Anchor | `test/fixtures/fresh-install-empty-project/expected/installed-state/` | Canonical skill byte changes require fixture/hash refresh。 |
| Evidence Anchor | `release/packaging-manifest.json` | Canonical source and packaged asset inventory must stay aligned。 |

## Equivalent Implementation Policy（等价实现策略）

可以通过集中 shared activation snippet、批量文本迁移脚本或手工编辑完成迁移；只要最终 source skills、installed mirrors、lint 和 tests 全部满足 AC，即视为等价。不得通过在 tests 中豁免 Alice、豁免 legacy string 或跳过 installed mirror 来取得假绿。

## Evidence Plan（证据计划）

- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills`
- support-side `speclite-agent-*` inventory negative scan
- `npm test -- test/skill-artifact-loop.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts`
- full corpus activation contract focused test covering `SKILL*.md`、references、terminal step files and installed mirror
- Alice / NOI merged config regression test
- `npm test -- --testTimeout 30000`
- `npm run release:packaging-check`
- `git diff --check`

## Anchor Evidence Summary（锚点证据摘要）

待实现后填写。必须记录 Alice regression、legacy resolver negative test、CLI unavailable negative test 和 full corpus scan 的通过证据。

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

待实现后填写。

### Debug Log References（调试日志引用）

待实现后填写。

### Completion Notes（完成说明）

待实现后填写。

### File List（文件清单）

待实现后填写。

## Change Log（变更记录）

| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-06-17 | 0.1 | 创建 Story 9.1，收口 Node-only installed skill activation contract、CLI availability preflight、Alice regression 和 full corpus release gate。 | John / Codex |
