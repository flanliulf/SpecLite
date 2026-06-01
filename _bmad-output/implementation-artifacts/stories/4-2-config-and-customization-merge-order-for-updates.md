# Story 4.2: Config And Customization Merge Order For Updates（更新中的配置与定制化合并顺序）

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为项目维护者，  
我希望 update 和 repair 在规划前使用统一 resolver 读取项目配置和 customization 覆盖，  
以便更新行为尊重团队/个人配置，并且不会破坏 human-owned TOML 文件。

## Acceptance Criteria（验收标准）

1. **Update and repair use the canonical config resolver order（Update 与 Repair 使用规范 Config 解析顺序）**  
   **前提** `speclite update` 或 `speclite update --repair` 需要读取项目配置；  
   **当** 系统解析 config；  
   **则** 必须按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 的顺序合并；  
   **并且** 后面的 layer 覆盖前面的 layer，custom 层覆盖 installer user 层；  
   **并且** update/repair 必须调用或复用 `src/config/` 中的统一 resolver，不得在 `src/update/`、`src/commands/update.ts` 或 planner 中实现第二套私有 merge logic。

2. **Update and repair use the canonical customization resolver order（Update 与 Repair 使用规范 Customization 解析顺序）**  
   **前提** `speclite update` 或 `speclite update --repair` 需要读取 skill customization；  
   **当** 系统解析 customization；  
   **则** 必须按 skill `customize.toml` defaults、`_speclite/custom/{skill}.toml`、`_speclite/custom/{skill}.user.toml` 的顺序合并；  
   **并且** `{skill}` 必须使用 skill directory basename 作为 customization lookup key；  
   **并且** 不得从 display name、menu label、phase label、IDE adapter alias、target id、source package path 或 source checkout path 推导第二个 customization key。

3. **Human-owned TOML is read-only during update and repair（Human-Owned TOML 在更新修复中只读）**  
   **前提** human-owned TOML 文件存在；  
   **当** update 或 repair 完成 resolver 读取；  
   **则** 系统只能读取并保护这些文件；  
   **并且** 不得覆盖、重写、重排、格式化、normalize、删除或 create-if-present；  
   **并且** public output、diagnostics 和 fixtures 不得泄露这些 TOML 的敏感内容。

4. **Missing optional layers are empty and non-blocking（缺失 Optional Layer 为空且不阻断）**  
   **前提** optional custom layer 缺失；  
   **当** resolver 合并 config 或 customization；  
   **则** 缺失 layer 被视为 `{}` 并继续；  
   **并且** 缺失 optional layer 默认不产生阻断性 error，也不把 update/repair 误判为 unsafe drift。

5. **Unreadable or malformed optional layers emit warning diagnostics and allow conservative planning（不可读或解析失败的 Optional Layer 输出 Warning 并允许保守规划）**  
   **前提** optional custom layer 存在但无法读取或解析；  
   **当** update 或 repair 需要继续规划；  
   **则** 系统会输出 `ValidationIssue` shape 的 warning diagnostic；  
   **并且** failed optional layer 被视为 `{}` 后继续 merge；  
   **并且** 在没有 `error` 或 `critical` diagnostics 时仍可继续进入保守 planning；  
   **并且** diagnostic `details` 不得包含 absolute path、home directory、stack trace、environment variable、timestamp、random id、credential 或 raw parser error。

6. **Resolver behavior changes update parity fixtures and owning contracts together（Resolver 行为变更同步 Fixture 与契约）**  
   **前提** resolver 行为发生变更；  
   **当** 更新 config/customization 解析实现；  
   **则** 必须同步 `resolve-parity` fixture、owning SPEC、executable schema/parser 和 expected outputs；  
   **并且** update/repair 不得实现第二套私有 merge logic；  
   **并且** consumer/parser 必须容忍未来 additive reason code 或 diagnostic 扩展，producer 只能输出 owning SPEC 允许的稳定字段。

## Tasks / Subtasks（任务 / 子任务）

- [x] Task 1: 验证前置实现、工作树与只读边界（AC: 1-6）
  - [x] 在实现前重新检查 root `package.json`、`src/`、`test/`、`tests/`、`fixtures/` 是否与当前 sprint/source 状态一致。截至 2026-05-29，Epic 3 提交 `395b017` 已提供 root TypeScript CLI scaffold、`src/commands/update.ts`、`CommandResult` / `ValidationIssue` anchors 和 validation/diagnostics tests；Story 4.1 anchors 与本 Story 所需 resolver integration 仍必须按当前源码验证。
  - [x] 确认 Story 2.4 的 resolver implementation anchors 已真实存在：`src/commands/resolve.ts`、`src/config/resolve-output-schema.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`、`src/config/merge-rules.ts`、`src/config/config-schema.ts`、`src/config/customization-schema.ts`。
  - [x] 确认 Story 4.1 的 ownership model / protected boundary anchors 已真实存在或已在当前 implementation sequence 中计划完成：`src/update/ownership-model.ts`、`src/manifest/manifest-generator.ts` / `src/manifest/manifest-schema.ts` 或等价 files-index helper、`src/diagnostics/command-result-schema.ts`、`src/validation/issue-model.ts`。
  - [x] 如果前置 implementation anchors 尚不存在，先完成前置 stories 或在本 Story 的范围内只补 resolver consumption 所需最小 integration；不得创建孤立的 update-only resolver copy。
  - [x] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、已有 story 文件、Story 4.1、源码或用户改动；不得格式化、重写、同步或回滚无关文件。
  - [x] 修改任何 UPDATE 文件前完整读取该文件，记录 current behavior、data shape、public output 和 tests；不得用本 Story 重构无关模块。

- [x] Task 2: 将 update/repair planning 接入 shared config resolver（AC: 1, 3-5）
  - [x] 在 `src/update/update-plan.ts`、`src/commands/update.ts` 或既有 update orchestration 中调用 `src/config/` resolver API，取得 resolved config、resolver diagnostics 和 layer status。
  - [x] Config merge order 固定为：
    1. `_speclite/config.toml`（required, installer-owned）
    2. `_speclite/config.user.toml`（optional, installer-owned）
    3. `_speclite/custom/config.toml`（optional, human-owned）
    4. `_speclite/custom/config.user.toml`（optional, human-owned）
  - [x] `_speclite/config.toml` required layer 缺失、不可读或解析失败必须阻断 update/repair planning，并生成稳定 diagnostic；不得输出 partial resolved config 伪装成功。
  - [x] Optional layers missing 时作为 `{}`；optional read/parse failure 时输出 warning diagnostic、该 layer 作为 `{}`，且无 error/critical 时继续 conservative planning。
  - [x] Human-owned `_speclite/custom/config*.toml` 只能被读取；即使为空、malformed、包含旧注释或顺序不同，也不得被 rewrite、sort、format、normalize 或删除。
  - [x] `--yes`、interactive confirmation 或 `update --repair` 不得改变 human-owned TOML 的只读保护语义。

- [x] Task 3: 将 update/repair planning 接入 shared customization resolver（AC: 2-5）
  - [x] 对每个需要 resolver context 的 installed skill，使用 installed self-contained skill directory 作为 `--skill` / API input，而不是 source checkout、archive planning docs 或 IDE adapter display label。
  - [x] Customization merge order 固定为：
    1. skill `customize.toml`（required defaults）
    2. `_speclite/custom/{skill}.toml`（optional, human-owned team custom）
    3. `_speclite/custom/{skill}.user.toml`（optional, human-owned user custom）
  - [x] `{skill}` lookup key 必须来自 skill directory basename。MVP 不支持第二个 customization key；未来若 IDE adapter 需要重命名 canonical skill directory，必须先更新 manifest/index SPEC、resolve command SPEC、schema/parser 和 fixtures。
  - [x] Required `customize.toml` 缺失、不可读或解析失败必须阻断该 skill 的 resolver result，并以稳定 diagnostic 表达；不得 fallback 到 source checkout 或 `config.toml.example`。
  - [x] Optional skill custom layer 缺失不产生 issue；optional layer 读取或解析失败只产生 warning，并在没有 error/critical 时允许 update/repair 继续生成保守 plan。
  - [x] 不得为缺失 skill-specific `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml` 自动创建 stub；这些文件默认由用户手工创建或未来显式 customization command 创建。

- [x] Task 4: 复用 structural merge semantics 与 Python parity baseline（AC: 1, 2, 6）
  - [x] 复用 `src/config/merge-rules.ts` 或等价 shared module；不得在 update planner、repair planner、fixture helper 或 renderer 中复制 merge rules。
  - [x] Scalar 或 incompatible type：override wins。
  - [x] Table + table：递归 deep merge。
  - [x] Array + array：只有 base + override 的所有 elements 都是 tables，且全部共享同一个 `code` key 或全部共享同一个 `id` key 时 keyed merge。
  - [x] Keyed merge 命中相同 key 时，override item 替换整个 base item；不做 item-level deep merge，不保留 base item 中 override 未写的字段。
  - [x] Mixed `code`/`id`、部分元素缺 key、non-table element、空数组或 schema smell 均走 append fallback。
  - [x] MVP 没有 deletion mechanism；不得通过 `null`、`enabled=false`、`remove`、empty arrays 或特殊字段删除 base items。
  - [x] Legacy Python resolver 中的 `resolve_customization.py` 注释有“highest priority first”字样，但实际代码和 owning SPEC 都是 defaults -> team -> user merge。实现以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 和代码行为为准，不以误导性注释反向改变顺序。

- [x] Task 5: 诊断输出接入 `ValidationIssue` / `CommandResult` 边界（AC: 5, 6）
  - [x] `speclite resolve` 自身仍是 explicit exception：stdout 只输出 resolved JSON object，不包裹 `CommandResult`；stderr 以 JSON Lines 输出 `ValidationIssue` shape diagnostics。
  - [x] `speclite update` / `speclite update --repair` 内部消费 resolver 时，resolver warning 必须按 covered command reporter 的规则进入 `CommandResult` semantic source；不要让 warning 只出现在 human-readable prose。
  - [x] 使用 taxonomy 中已有 category / issue id。若确需新增 public issue id，必须先更新 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 和 fixtures；本 Story 没有授权时不得发明自由文本 issue id。
  - [x] Optional layer warning 的 `details` 只能包含 deterministic、redaction-safe 字段，例如 `layerRole`、`layerKind`、`component`、`readStatus` 或 `parseStatus`；不得包含 raw absolute path、home directory、stack trace、timestamp、random id、credential、hash 或 raw parser message。
  - [x] Public path fields 必须使用 project-relative POSIX path 或 display-safe component；project-root absolute path 只能存在于 private filesystem state。
  - [x] `data.conflicts.length > 0` 时仍只生成一个 command-level `update.conflicts` issue；optional resolver warning 不得把 path-level conflict 复制成多个 command-level issues。

- [x] Task 6: 将 resolved config/customization 纳入 update/repair plan-before-write flow（AC: 1-6）
  - [x] Update/repair 在生成 plan 前读取 installed state、source descriptor、files index、ownership 信息和 resolved config/customization；在 resolver 完成前不得写入任何 project file。
  - [x] Resolver diagnostics 必须能影响 conservative planning：存在 error/critical 时阻断；只有 warning 时可继续，但 plan/summary 应清楚展示仍有 warning 需要处理。
  - [x] `changedPaths` / `skippedPaths` 只表示 actual apply result；`writeAuthorized === false` 时必须为空。Resolved config/customization 只影响 planning，不得直接触发 writes。
  - [x] Ordinary `update` 不能因为 resolver 读取了 human-owned custom TOML 就把这些文件加入 overwrite plan。
  - [x] `update --repair` 仍只能 repair installer-owned paths；human-owned custom files 和 workflow-owned artifacts 不得作为 `RepairPlan.actions[]` 出现。
  - [x] Missing optional custom layer 不得产生 conflict；malformed optional layer 可以产生 warning，并继续生成保守 plan。若后续 planner 发现安全性无法证明，应使用 owning SPEC 的 conflict reason，而不是把 parser warning 当作 overwrite 授权。

- [x] Task 7: 编写 focused tests 与 `resolve-parity` / update fixture assertions（AC: 1-6）
  - [x] Unit tests 覆盖 update/repair 调用 shared config resolver：四层顺序、custom 覆盖 installer user、required config failure、optional missing、optional parse warning、human-owned content untouched。
  - [x] Unit tests 覆盖 update/repair 调用 shared customization resolver：skill defaults -> team custom -> user custom、basename lookup key、missing optional layers、malformed optional warning、missing required defaults failure。
  - [x] Unit tests 覆盖 merge rules reuse：scalar override、table deep merge、keyed array replacement、append fallback、mixed key fallback、non-table fallback、no deletion semantics。
  - [x] Integration tests 覆盖 `speclite update --json` 与 `speclite update --repair --json` 在 planning 前解析 config/customization，且在 warning-only resolver diagnostics 下仍输出 conservative unapplied plan。
  - [x] Fixture `test/fixtures/resolve-parity/` 必须覆盖 config four-layer merge、customization three-layer merge、optional layer warning diagnostic、required layer failure、keyed array replacement、append fallback、non-ASCII JSON output、explicit `--project-root` 和 customization fallback search behavior。
  - [x] Fixture `test/fixtures/existing-install-update/` 应增加 resolver-consumption case，断言 human-owned custom TOML content/order/comments unchanged，并断言 missing optional layer 不进入 conflicts。
  - [x] Fixture `test/fixtures/ide-drift/` 若 update/repair 需要 skill customization context，应断言 basename lookup key、resolved customization 不从 source checkout 读取。
  - [x] 所有 JSON assertions parse 后 semantic compare；stderr JSON Lines 逐行 parse 为 `ValidationIssue`；不得比较 absolute path、home directory、timestamp、random id、stack trace、terminal formatting 或具体 current time。
  - [x] Tests 必须 local-only、deterministic，不访问 npm registry、private registry、Git remote、offline bundle origin、package-manager cache 或外部网络。

- [x] Task 8: 本地验证与范围控制（AC: 1-6）
  - [x] 运行 `npm run build`。
  - [x] 运行 `npm test`，或至少运行 config resolver、customization resolver、update planning resolver consumption、repair planning resolver consumption、diagnostics projection 和 affected fixture focused Vitest tests。
  - [x] 如果前置 implementation 尚未完成，保留失败为有效前置信号；不要伪造 fixture pass、不要绕过 shared resolver、不要创建 update-private merge implementation。
  - [x] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、已有 Story 1-3 文件、Story 4.1、无关源码或用户改动。
  - [x] 检查 diff，确认没有实现 Story 4.3 的完整 update plan UX、Story 4.4 operation lock/safe write、Story 4.5 full conflict detector、Story 4.6 full repair apply、Epic 5 source channel 扩展、Epic 6 release fixture matrix 或 Post-MVP `doctor` / `sync` / `uninstall` / top-level `repair` / backup-restore。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 截至 2026-05-29 的 Epic 3 提交 `395b017`，仓库根目录已有 root `package.json`、`src/`、`test/` 以及 status/validate/update command anchors、`CommandResult` / `ValidationIssue` schema、diagnostics/output 和 validation issue/order anchors。root `fixtures/`、Epic 4 ownership/files-index anchors 和本 Story 的 update resolver integration 仍需按当前源码逐项确认。
- Epic 3 / Story 3.5 已完成：`src/commands/update.ts` 是 non-write placeholder 与 public contract seam。Story 4.1 的 actual implementation 仍需按 sprint 状态和源码重新确认；本 Story 4.2 的 ready-for-dev context 不是其自身实现完成证据。
- 当前 worktree 已有与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1-4 story 文件。实现 Story 4.2 时不得格式化、重写、同步或回滚这些无关改动。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。
- 本 create-story run 复现了 skill activation runtime 行为：裸 `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow` 因 stdlib `tomllib` 缺失失败；`python3.12` 成功解析 workflow。这支持 ADR 0002 的短期 fallback 与长期 Node parity 方向。

### Scope Boundary（范围边界）

- 本 Story 只负责让 update/repair 在 planning 前复用统一 config/customization resolver，保持 merge order、layer failure semantics、human-owned TOML read-only protection、diagnostic projection 和 parity fixtures。
- 本 Story 可以扩展或连接已有 `src/config/`、`src/commands/update.ts`、`src/update/`、`src/diagnostics/`、`src/validation/`、`src/manifest/`、`src/fs/` 和 fixture anchors；实际命名应贴合已有实现。
- 本 Story 不负责：
  - Story 2.4 的初始 `speclite resolve` command 全量实现，除非前置仍缺失且当前实现顺序需要补齐 shared resolver anchors。
  - Story 4.1 ownership model 的完整分类器和 files index ownership projection。
  - Story 4.3 update plan UX、write authorization display 和 human-readable impact summary 全量实现。
  - Story 4.4 project operation lock 和 safe write implementation。
  - Story 4.5 full conflict detection / default non-overwrite behavior。
  - Story 4.6 explicit repair apply / restore-canonical / regenerate 全量流程。
  - Epic 5 distribution source expansion、Epic 6 full release gate matrix 或 Post-MVP governance commands。

### Architecture Requirements（架构要求）

- Runtime baseline 保持 Node.js 22 minimum 和 Node.js 24 recommended。Node.js official releases 在 2026-05-26 显示 Node 22 与 Node 24 为 LTS、Node 26 为 Current；不要把 MVP baseline 提升到 Node 26，也不要使用 Node 24-only API，除非提供 Node 22-compatible path 并更新 runtime policy / fixtures。Source: https://nodejs.org/en/about/previous-releases
- CLI foundation 保持 TypeScript + commander。不要为本 Story 引入 oclif/yargs/cac/clipanion。
- Runtime schema validation 如前序 stories 使用 `zod@4.4.3`，继续复用同一 dependency 和 style。不要为了 resolver update integration 引入新的 schema/runtime validation library。
- TOML parser 继续使用 architecture-pinned `toml@4.1.1` 或既有 resolver parser；不要新增第二个 TOML parser。
- Storage model 是 local-first filesystem。不要引入 database、web service、daemon、REST API、GraphQL、desktop UI、persistent cache server 或 background process。
- `src/commands/update.ts` 只做 command mode normalization 和 orchestration；resolver reading/merge 属于 `src/config/`，ownership/hash 属于 `src/update/` 与 `src/manifest/`，path normalization 属于 `src/fs/`，public projection 属于 `src/diagnostics/`。
- `src/config/` 是唯一 Config/Customization Merge Implementation。Skills、IDE adapters、renderers、fixtures、update planner 和 repair planner 都不得手写第二套 merge behavior。

### Implementation Anchors（实现锚点）

需要创建或扩展的 implementation anchors，实际命名应贴合已有实现：

- `src/config/merge-rules.ts`：shared structural merge rules，供 config 与 customization resolver 共享。
- `src/config/config-reader.ts`：project config layer read/parse/status，四层 config merge order。
- `src/config/customization-reader.ts`：skill defaults、team custom、user custom layer read/parse/status，basename lookup key。
- `src/config/resolve-output-schema.ts`：resolve stdout JSON、stderr JSON Lines diagnostic 和 merge-result parser executable anchor。
- `src/config/config-schema.ts` 与 `src/config/customization-schema.ts`：field shape / parser guardrails。
- `src/commands/resolve.ts`：runtime support command；本 Story 不应改变其 no `CommandResult` exception。
- `src/commands/update.ts`：update/update.repair orchestration，必须在 planning 前调用 shared resolver。
- `src/update/update-plan.ts`：normal update plan consumption of resolved config/customization。
- `src/update/repair-plan.ts` 或等价 repair planner：repair planning consumption of resolved config/customization。
- `src/update/ownership-model.ts`：保护 human-owned TOML 和 workflow-owned artifacts 的 ownership source；不要在 resolver 中重新定义 ownership truth。
- `src/diagnostics/command-result-schema.ts`、`src/diagnostics/command-result.ts`、`src/diagnostics/output.ts`：covered command warning/error projection、single `update.conflicts` issue 和 rendering。
- `src/validation/issue-model.ts`：`ValidationIssue` construction helpers、taxonomy guards 和 redaction-safe details policy。
- `src/fs/path-normalizer.ts`：project-relative POSIX path normalization、absolute path rejection 和 project boundary checks。
- `test/fixtures/resolve-parity/`、`test/fixtures/existing-install-update/`、`test/fixtures/ide-drift/`：resolver parity 与 update/repair resolver-consumption assertions。

如果这些文件已经由前置 stories 创建，修改前必须完整读取并保留既有 behavior。如果这些文件尚不存在，按前置 story implementation 顺序补齐，不要绕过 manifest/diagnostics/contracts 创建私有实现。

### Config Merge Requirements（Config 合并要求）

`speclite resolve config` 和 update/repair 的 shared resolver consumption 必须保持同一顺序：

1. `_speclite/config.toml`
2. `_speclite/config.user.toml`
3. `_speclite/custom/config.toml`
4. `_speclite/custom/config.user.toml`

Rules：

- `_speclite/config.toml` is required。
- 其他三层默认 optional，除非未来 schema 明确标记 required。
- 后面的 layer 覆盖前面的 layer。
- Missing optional layer means `{}` and should not produce a diagnostic。
- Optional layer read/parse failure produces warning diagnostic, treats layer as `{}`, and continues。
- Required layer failure blocks with non-zero resolver result or update/repair planning blocker。
- Human-owned `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` 只读；resolver 可读取它们，update/repair 不得 rewrite、normalize、sort、format、delete 或 create-if-present。
- Full merge must happen before key selection；missing key default behavior remains `{}` success for `resolve` command。

### Customization Merge Requirements（Customization 合并要求）

`speclite resolve customization` 和 update/repair 的 shared resolver consumption 必须保持同一顺序：

1. skill `customize.toml`
2. `_speclite/custom/{skill}.toml`
3. `_speclite/custom/{skill}.user.toml`

Rules：

- skill `customize.toml` is required。
- Project custom layers are optional。
- `{skill}` is the basename of the skill directory supplied to resolver / internal API。
- Installed skill instructions should pass explicit `--project-root`。For Python parity, omitted `--project-root` may fallback by searching upward from skill directory for `_speclite` or `.git`, then from cwd。
- Adapter aliases、display labels、menu labels、phase labels、target ids 和 source checkout paths cannot become customization keys。
- MVP does not support a second customization key。Future renaming requires manifest/index and resolve SPEC updates first。
- Missing skill-specific custom layers do not trigger stub generation。Fresh install also must not auto-create `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`。

### Structural Merge Requirements（结构化合并要求）

- Scalar or incompatible type: override wins。
- Table + table: deep merge。
- Array + array:
  - keyed merge only when all base + override elements are tables and all share the same `code` key, or all share the same `id` key。
  - matching key means override item replaces the entire base item。
  - no item-level deep merge。
  - new key appends item。
  - mixed `code`/`id`, missing key, non-table element or other schema smell falls back to append。
- No deletion mechanism in MVP。
- Do not treat `null`, `enabled=false`, `remove`, empty arrays or special fields as deletion。
- If a default must be disabled, use same-key no-op replacement or wait for future deletion schema。

### Diagnostics And Output Requirements（诊断与输出要求）

- `speclite resolve` stdout 只输出 resolved JSON object，2-space indentation preferred，trailing newline preferred，non-ASCII characters not escaped，no `CommandResult` envelope，no human-readable prose、ANSI、icons、progress text、spinner output 或 debug lines。
- `speclite resolve` stderr 是 JSON Lines，每行一个 `ValidationIssue` shape diagnostic。
- `update` / `update.repair` 是 covered commands，必须继续使用 `CommandResult<UpdateCommandData>` / `CommandResult<RepairCommandData>`；resolver warnings 必须进入 shared semantic model，而不是只出现在 summary prose。
- `ValidationIssue.issueId` 必须使用 `<category>.<stable-code>`，不得包含 path、skill id、target id、hash、count、timestamp、random id 或 parser message。
- `ValidationIssue.details` 必须 deterministic、redaction-safe、fixture-stable，不包含 absolute path、home directory、drive letter、environment variable、credential、stack trace、raw exception、timestamp、random id、temporary/cache path 或 hash value。
- Ordinary `update` 与 explicit `update --repair` 必须清晰区分。`--yes` 只能授权无 conflict 的 planned writes，不能隐式 repair drift，也不能授权 human-owned TOML mutation。
- Path display 必须使用 project-relative POSIX path 或 display-safe component，帮助用户理解 `_speclite`、IDE execution plane、`_speclite-output` 和 project knowledge 的空间角色。

### Previous Story Intelligence（前序 Story 情报）

- Story 4.1 明确 `_speclite/custom/*.toml` 与 `_speclite/custom/*.user.toml` 默认是 `human-owned`，install/update/repair 不得覆盖、重写、重排、格式化、normalize 或删除。Story 4.2 只能读取这些 TOML 以解析 resolver context。
- Story 4.1 将完整 config/customization resolver merge order 明确留给 Story 4.2 与 `06-resolve-command-contract.md`；本 Story 不应反向扩大 Story 4.1 ownership classifier 范围。
- Story 1.4 明确 project-level human-owned stubs 只允许 create-if-absent：`_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`。Existing stubs 即使为空、malformed、保留旧注释或顺序不同，也不得覆盖、重写、重排或格式化。
- Story 2.4 明确 `speclite resolve config` / `speclite resolve customization` 是 runtime support command；stdout 不包裹 `CommandResult`，stderr 使用 `ValidationIssue` JSON Lines，merge logic 集中在 `src/config/`。
- Story 2.4 明确 legacy Python resolvers 只作为 parity baseline 和诊断参照；产品实现应收敛到 Node/TypeScript `speclite resolve`，installed skills 不应绑定裸 `python3`、`node dist/...` 或 source checkout scripts。
- Story 3.5 明确 `update` / `update.repair` conflicts 只生成一个 command-level `update.conflicts` issue，path-level conflicts 留在 `data.conflicts`；`operation-lock.project-locked` 是 command-level blocker，不放入 `data.conflicts`。
- Story 3.5 还要求 human-readable output 与 `--json` output 共享同一 semantic source，command modules 不得自行拼接 public JSON、status text、issue layout 或 next action order。

### Contract Requirements（契约要求）

- `CommandResult` public JSON shape、`UpdatePlan`、`RepairPlan`、`UpdateConflict`、reason code registry、path/order policy 和 `resolve` exception 由 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 拥有。
- Install/update/repair pre-write planning、`writeAuthorized`、operation lock、safe write、repair source policy 和 human-owned TOML stub 规则由 `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 拥有。
- Manifest/index/files index fields、ownership projection、raw-byte hash、volatile file exclusion 和 deterministic fixtures 由 `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 拥有。
- `speclite resolve config` / `speclite resolve customization` stdout/stderr、merge order、fallback、layer failure、array merge 和 parity fixtures 由 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 拥有。
- Issue categories、reserved issue ids 和 severity guidance 由 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 拥有。
- Fixture layout、release gate classification、expected output classes、semantic JSON comparison、stderr JSON Lines comparison 和 preservation assertions 由 `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 拥有。
- ADR 只能解释决策背景，不重新定义 field-level schema、issue taxonomy、fixture layout、command payload 或 implementation anchor。若 ADR 与 owning SPEC 冲突，以 owning SPEC 为准。

### Python Parity Notes（Python Parity 备注）

- `assets/source/speclite/scripts/resolve_config.py` 当前代码按 `_speclite/config.toml` -> `_speclite/config.user.toml` -> `_speclite/custom/config.toml` -> `_speclite/custom/config.user.toml` 合并。
- `assets/source/speclite/scripts/resolve_customization.py` 当前代码按 skill `customize.toml` -> team custom -> user custom 合并，skill name 来自 `Path(args.skill).resolve().name`。
- 两个 legacy Python resolver 都依赖 Python 3.11+ `tomllib`；裸 `python3` 在这台机器上会失败，说明 installed runtime 不应长期绑定 Python script。
- Python baseline 的 array merge 通过 `_detect_keyed_merge_field(items)` 选择 `code` 或 `id`，且只有所有 items 都是 table 并共享同一 key 时 keyed merge；否则 append。
- `_merge_by_key` 对相同 key 使用 override item 整项替换 base item；不是 deep merge。
- Legacy Python resolver 的 stderr 目前是简化文本，MVP Node resolver 必须按 `06-resolve-command-contract.md` 升级为 `ValidationIssue` JSON Lines diagnostics，同时保持 merge/output parity。

### Testing Requirements（测试要求）

- 使用 Vitest。
- Tests 必须 deterministic、local-only，不访问 npm registry、Git remote、private registry、offline bundle origin、package-manager cache 或外部网络。
- 使用 temporary directories 构造 installed-state cases；不要依赖当前 repo 的 `_bmad` 或 `_bmad-output` 作为目标项目 installed state。
- Cross-platform tests 使用 `node:path` 的 `posix` / `win32` test data 和 shared path normalization helper，不要让 host OS filesystem behavior 成为唯一断言依据。
- JSON tests parse output 并断言 semantic fields。不要比较 raw pretty-printed JSON bytes，除非 formatting 本身是测试对象。
- stderr JSON Lines 必须逐行 parse 为 `ValidationIssue` objects。
- Fixture snapshots 必须 normalize 或 exclude owning SPEC 标记为 non-stable 的 timestamp、operation-lock volatile fields、temporary paths、projectRootHash、duration 或 environment-specific paths。
- Human-owned TOML preservation 必须通过 content/order/comment unchanged checks 断言；installer-owned 文件使用 hash comparison。

### Git Intelligence Summary（Git 历史摘要）

- 最近 5 个 commit 均为 docs/context/source/spec cleanup 类变更：`style(docs): 清理参考文档尾随空白`、`docs(context): 初始化项目上下文文档`、`docs(source): 同步内置源资产路径说明`、`docs(glossary): 整理术语目录与文档索引`、`docs(specs): 收敛 MVP 契约与实现锚点`。
- 当前可引用的实现模式主要来自 live planning artifacts、owning SPECs、ADR、legacy Python parity scripts 和 previous story contexts，而不是已提交 TypeScript implementation。dev agent 不得从这些 docs commits 推断源码已经存在。

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story。Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`、`yaml@2.9.0`、`toml@4.1.1`、`csv-parse@6.2.1`、`fs-extra@11.3.5`、`zod@4.4.3`、`typescript@6.0.3`、`tsx@4.21.0`、`tsup@8.5.1`、`vitest@4.1.6` and `@types/node@22`。
- Use Node.js 22-compatible `node:fs/promises`、`node:path` and stable ECMAScript APIs。Do not introduce Node 24-only behavior。
- External web check was limited to Node.js official release status. The resolver merge behavior itself is governed by project-owned live PRD, Architecture, ADR 0002, legacy Python baseline and owning SPEC contracts; no dependency upgrade is part of this Story.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- `_bmad-output/planning-artifacts/epics/07-epic-4-safe-update-and-repair安全更新与修复.md`
- `_bmad-output/implementation-artifacts/4-1-ownership-model-and-protected-file-boundaries.md`
- `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
- `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`
- `_bmad-output/implementation-artifacts/3-5-commandresult-and-validationissue-json-contract.md`
- `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md`
- `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md`
- `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md`
- `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md`
- `_bmad-output/planning-artifacts/architecture/06-architecture-validation-results架构验证结果.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-26.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/specs/README.md`
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md`
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md`
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md`
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md`
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md`
- `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md`
- `assets/source/speclite/scripts/resolve_config.py`
- `assets/source/speclite/scripts/resolve_customization.py`
- Node.js official releases: https://nodejs.org/en/about/previous-releases

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）

GPT-5.5

### Debug Log References（调试日志引用）

- 2026-05-31 17:55 CST: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-dev-story --key workflow` failed because the available `python3` lacks stdlib `tomllib`; followed skill fallback by manually reading base/team/user customization files. No team/user override files existed.
- 2026-05-31 17:55 CST: Loaded full Story 4.2, full `sprint-status.yaml`, `_bmad-output/project-context.md`, and checked dirty worktree before implementation.
- 2026-05-31 18:05 CST: Red phase ran `npm test -- test/update-planning.test.ts`; new resolver-consumption tests failed as expected because update/repair did not yet consume config/customization resolver diagnostics.
- 2026-05-31 18:06 CST: Green phase ran `npm test -- test/update-planning.test.ts`; 7 tests passed after integrating shared resolver consumption.
- 2026-05-31 18:06 CST: Ran `npm test -- test/update-command.test.ts test/resolve-readers.test.ts test/config-merge-rules.test.ts`; fixed CLI fixture expectations for required config resolution, then 13 tests passed.
- 2026-05-31 18:07 CST: Ran `npm run build`; tsup ESM and DTS builds passed.
- 2026-05-31 18:07 CST: Ran full `npm test`; 28 test files and 174 tests passed.
- 2026-05-31 18:08 CST: Ran scoped `git diff --check`; no whitespace errors in Story 4.2 touched files.
- 2026-05-31 18:10 CST: Final `workflow.on_complete` resolution via `python3.12` returned an empty value; no terminal follow-up instruction was required.

### Completion Notes List（完成备注）

- Story context created by bmad-create-story sub-agent #2.
- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented update/repair pre-planning resolver consumption through shared `src/config/` readers, with required config/customization errors blocking planning and warning-only optional layer diagnostics preserving conservative dry-run planning.
- Preserved `speclite resolve` as the explicit non-`CommandResult` exception; update and repair now project resolver diagnostics through covered command `CommandResult` issues.
- Ensured installed skill customization lookup uses installed skill directory basename from files-index skill paths; no source checkout, display label, target id, or alias fallback was introduced.
- Added focused deterministic tests for required config failure, optional config/customization warning propagation, human-owned TOML preservation, basename customization lookup, CLI JSON projection, merge-rule reuse, and resolver reader parity.
- Added minimal fixture metadata anchors for `existing-install-update` and `ide-drift`; no `_bmad-output/planning-artifacts/`, Story 4.1, or unrelated source cleanup was performed.

### File List（文件列表）

- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/4-2-config-and-customization-merge-order-for-updates.md`
- `src/commands/update.ts`
- `src/update/update-plan.ts`
- `test/update-command.test.ts`
- `test/update-planning.test.ts`
- `test/fixtures/existing-install-update/fixture-case.json`
- `test/fixtures/ide-drift/fixture-case.json`

### Change Log（变更日志）

- 2026-05-31: Story 4.2 dev implementation complete; update/repair now consume shared config/customization resolvers before planning, preserve human-owned TOML read-only semantics, project resolver diagnostics through `CommandResult`, and include focused tests plus fixture anchors.
