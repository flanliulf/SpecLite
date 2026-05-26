# Story 2.4: Runtime Config And Customization Resolve（Runtime Config 与 Customization Resolve）

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story（故事）

作为 AI IDE 使用者，
我希望已激活的 SpecLite skill 能通过稳定命令读取项目配置和 customization 覆盖，
以便不同 IDE 中运行的同一 skill 使用一致的项目名称、语言、输出路径、persona 和 workflow 设置。

## Acceptance Criteria（验收标准）

1. **Config resolve merges the four project config layers（Config Resolve 合并四层项目配置）**
   **前提** 已安装项目包含 `_speclite` 配置层，且 Epic 1 的 config initialization、runtime structure、manifest/index、IDE mirror 和 Story 2.1-2.3 的 discovery / self-contained entry / activation boundary 已真实实现；
   **当** 已激活 skill 调用 `speclite resolve config --project-root <project>`；
   **则** 命令会按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 的顺序合并配置；
   **并且** 后面的 layer 覆盖前面的 layer；
   **并且** `_speclite/config.toml` 是 required layer，其他三层默认 optional；
   **并且** stdout 只输出 resolved JSON object，不包裹 `CommandResult` envelope，不混入 human-readable prose、ANSI escape、progress text 或 debug output。

2. **Customization resolve merges skill defaults with team and user custom layers（Customization Resolve 合并 Skill 默认、团队与用户定制层）**
   **前提** 已安装 skill 声明为 customization-capable，且对应 source package / installed entry 包含 `customize.toml`；
   **当** skill 调用 `speclite resolve customization --skill <skill-dir> --project-root <project>`；
   **则** 命令会按 `<skill-dir>/customize.toml`、`_speclite/custom/<skill-name>.toml`、`_speclite/custom/<skill-name>.user.toml` 的顺序合并 customization；
   **并且** `<skill-dir>/customize.toml` 是 required layer，project custom layers 是 optional；
   **并且** `<skill-name>` 必须来自 `--skill` 指向的 skill directory basename，不能来自 display name、menu label、phase label、IDE adapter alias 或 source package path；
   **并且** MVP 不引入第二个 customization lookup key，也不得为缺少 `customize.toml` 的 skill 隐式生成空 defaults。

3. **Missing dotted key defaults to empty success（缺失 dotted key 默认空对象成功）**
   **前提** 用户或 installed skill 请求一个不存在的 dotted key；
   **当** `speclite resolve config` 或 `speclite resolve customization` 执行成功；
   **则** 命令默认输出 `{}` 并返回 exit code 0；
   **并且** stderr 为空；
   **并且** strict missing-key validation 是 Post-MVP，除非未来通过显式 flag 更新 owning SPEC、parser/schema 和 fixtures。

4. **Repeated keys preserve original dotted key strings（重复 key 保留原 dotted key 字符串）**
   **前提** 用户重复传入多个 `--key`；
   **当** `speclite resolve` 输出结果；
   **则** 输出 object 使用原始 dotted key 字符串作为 top-level field name；
   **并且** existing keys 会被包含，missing keys 会被省略；
   **并且** key selection 不改变 merge semantics、layer failure semantics 或 stdout/stderr shape。

5. **Optional layer failures produce warning JSON Lines and continue（Optional Layer 失败输出 warning JSON Lines 并继续）**
   **前提** optional TOML layer 缺失、不可读或解析失败；
   **当** resolver 继续合并其余配置层；
   **则** 缺失 optional layer 默认视为 `{}` 且不产生 issue；
   **并且** 不可读或解析失败的 optional layer 会向 stderr 输出一行 `ValidationIssue` shape 的 warning JSON diagnostic；
   **并且** failed optional layer 被视为 `{}` 后继续 merge；
   **并且** 在没有 error 或 critical diagnostics 时命令仍返回 exit code 0。

6. **Required layer failures are blocking and keep output contract stable（Required Layer 失败阻断并保持输出契约稳定）**
   **前提** required TOML layer 缺失、不可读或解析失败；
   **当** resolver 无法继续安全解析；
   **则** 命令返回非 0 exit code；
   **并且** stderr 仍以 JSON Lines 输出 `ValidationIssue` shape diagnostics；
   **并且** stdout 不得输出 partial resolved config 伪装为成功结果；
   **并且** diagnostics details 不得包含 absolute path、home directory、temporary path、cache path、environment variable、credential、timestamp、random id、stack trace 或 raw exception object。

7. **Array merge preserves Python resolver parity（数组合并保持 Python Resolver Parity）**
   **前提** config 或 customization 包含数组字段；
   **当** resolver 合并 base 与 override arrays；
   **则** 只有所有 base 和 override elements 都是 tables，且所有元素共享同一个 `code` key 或同一个 `id` key 时才 keyed merge；
   **并且** 命中同 key 时 override item 整项替换 base item，不做 item-level deep merge；
   **并且** mixed `code` / `id`、部分元素缺 key 或出现 non-table element 时必须 append；
   **并且** MVP 没有 deletion mechanism，不能通过 `null`、`enabled=false`、`remove`、empty arrays 或特殊字段删除 base items。

8. **Resolver parity is proven by focused tests and fixtures（Resolver Parity 由聚焦测试与 Fixture 证明）**
   **前提** Story 2.4 修改 `src/commands/resolve.ts`、`src/config/` resolver modules、diagnostics projection、TOML parser usage 或 fixture comparison；
   **当** 开发者完成实现；
   **则** 必须补充 unit、integration 和 `resolve-parity` fixture assertions，覆盖 config four-layer merge、customization three-layer merge、explicit `--project-root`、customization fallback search behavior、missing key default success、repeated `--key`、optional layer warning JSON Lines、required layer failure、keyed array replacement、append fallback、non-ASCII JSON output 和 no `CommandResult` envelope；
   **并且** tests 必须 local-only、deterministic、parse JSON semantically，不访问 npm registry、Git remote、private registry、offline bundle origin、package-manager cache 或外部网络。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: 验证前置 stories 与当前仓库实现状态（AC: 1-8）
  - [ ] 确认 Story 1.1-1.6 已真实实现，而不只是 story context 处于 `ready-for-dev`：至少需要存在 `package.json`、`src/`、`test/`、`src/bin/speclite.ts`、`src/commands/install.ts`、`src/commands/resolve.ts` 或命令注册 anchor、`src/config/resolve-output-schema.ts`、`src/config/config-reader.ts`、`src/config/customization-reader.ts`、`src/config/merge-rules.ts`、`src/config/config-schema.ts`、`src/config/customization-schema.ts`、`src/diagnostics/command-result-schema.ts`、`src/validation/issue-model.ts` 和 fixture harness。
  - [ ] 确认 Story 1.4 已真实提供 `_speclite/config.toml` / `_speclite/config.user.toml` planned config model 和 human-owned `_speclite/custom/config*.toml` 边界；Story 1.5 已真实写入 `_speclite` runtime structure；Story 1.6 已真实完成 ReadyCheck / ready summary gate。
  - [ ] 确认 Story 2.1 已真实生成 discovery metadata 与 phase coverage projection；Story 2.2 已真实生成 `.claude/skills/<canonicalSkillId>/` 和 `.agents/skills/<canonicalSkillId>/` self-contained entries；Story 2.3 已真实验证 activation target 指向 installed `SKILL.md`，并只保留 resolver access boundary。
  - [ ] 如果上述实现 anchors 仍不存在，停止 Story 2.4 实现，先完成前置 stories；不得在 Story 2.4 中重建 CLI scaffold、install pipeline、IDE target writer、manifest generator、phase coverage reader 或 workflow artifact writer。
  - [ ] 检查当前 worktree dirty 状态，保留与本 Story 无关的 planning artifacts、story 文件、sprint status 或用户改动；不得格式化、重写、同步或回滚无关文件。

- [ ] Task 2: 建立 resolver command orchestration 且保持 runtime support 边界（AC: 1, 2, 6）
  - [ ] 在 `src/commands/resolve.ts` 或现有 command registration module 中注册 `speclite resolve config` 与 `speclite resolve customization`。
  - [ ] `src/commands/resolve.ts` 只负责 argv parsing、mode dispatch、exit code 和 stdout/stderr 写入；merge、TOML read、schema validation 和 diagnostics 归属 `src/config/` 与 diagnostics/schema anchors。
  - [ ] `speclite resolve config` 必须要求显式 `--project-root`，缺失时返回 non-zero，并用 stable diagnostics / CLI usage error 处理；不要 fallback 到 cwd 作为 installed skill contract。
  - [ ] `speclite resolve customization` 必须支持显式 `--project-root`；当省略时，为 Python resolver parity 可以 fallback：先从 skill directory 向上查找 `_speclite` 或 `.git`，找不到再从 cwd 向上查找 `_speclite` 或 `.git`。
  - [ ] Resolve command 不使用 `CommandResult` envelope；不得把 `status`、`summary`、`issues`、`nextActions`、`data` 包到 stdout。
  - [ ] Human-readable guidance 如需存在，只能在非 machine contract 场景之外；machine mode stdout/stderr 必须遵守 SPEC。MVP 推荐保持 resolver 输出纯 machine-readable。

- [ ] Task 3: 实现 shared TOML reader、schema anchor 和 redaction-safe diagnostics（AC: 1, 2, 5, 6）
  - [ ] 在 `src/config/resolve-output-schema.ts` 中提供 resolver stdout JSON、stderr JSON Lines diagnostic 和 merge-result parser 的 executable schema/parser anchor。
  - [ ] 在 `src/config/config-reader.ts` 与 `src/config/customization-reader.ts` 或等价 modules 中集中读取 TOML layers；不要在 command module、IDE adapter、installed skill helper、renderer 或 tests 中手写第二套 resolver。
  - [ ] 使用 Architecture-pinned TOML parser dependency（当前 planning docs 指向 `toml@4.1.1`），并通过 tests 覆盖 parse success、parse failure、non-ASCII strings 和 nested tables。
  - [ ] 对 required layer 的 missing/read/parse failure 生成 error 或 critical diagnostic，并返回 non-zero。
  - [ ] 对 optional layer 的 read/parse failure 生成 warning diagnostic JSON Lines，并继续 merge；optional layer missing 视为 `{}`，默认不产生 issue。
  - [ ] Diagnostics 必须复用 `ValidationIssue` shape；category 优先使用 `runtime-path` 或 `manifest-schema` 等 owning taxonomy 中已有类别。若确需新增 issue id，先更新 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 与 fixture assertions。
  - [ ] Diagnostics `details` 只能包含 deterministic、redaction-safe、fixture-stable fields，例如 layer kind、layer role、parse status、normalized component；不得包含 raw local path、stack trace、timestamp 或 raw parser message 中的环境路径。

- [ ] Task 4: 实现 config four-layer merge order（AC: 1, 3, 4, 5, 6, 7）
  - [ ] 按固定顺序读取并合并：
    1. `_speclite/config.toml`（required, installer-owned）
    2. `_speclite/config.user.toml`（optional, installer-owned）
    3. `_speclite/custom/config.toml`（optional, human-owned）
    4. `_speclite/custom/config.user.toml`（optional, human-owned）
  - [ ] 后面的 layer 覆盖前面的 layer；scalar override wins，table deep merge，array 使用 Story 2.4 的 Python parity merge rules。
  - [ ] `--project-root` 的 public behavior 只接受 target project root；public output 不得回显 absolute project root。
  - [ ] 对 key selection 先完整 merge，再按 `--key` 提取；缺失 key 默认省略，所有 key 都缺失时输出 `{}`。
  - [ ] repeated `--key` 输出 object 使用原始 dotted key string 作为字段名，例如 `"core.project_name"` 或 `"modules.sdlc.planning_artifacts"`。
  - [ ] stdout JSON 使用 2-space indentation、trailing newline，并保留非 ASCII 字符不转义；fixture 比较 parsed JSON semantics，不要求 byte-for-byte。

- [ ] Task 5: 实现 customization three-layer merge order 与 lookup key（AC: 2, 3, 4, 5, 6, 7）
  - [ ] `--skill` 必须指向 installed self-contained skill directory；customization success path 只适用于声明 customization-capable 且 installed entry 包含 `<skill-dir>/customize.toml` 的 skill。
  - [ ] Fixture success path 必须选择 source package 已包含 `customize.toml` 的 canonical skill，例如 `speclite-create-prd` 或 `speclite-create-story`；不得任意选择缺少 defaults 的 skill。
  - [ ] 使用 `Path.basename(skillDir)` 或等价 project-safe helper 得到 `<skill-name>`；该 basename 是 customization lookup key。
  - [ ] 按固定顺序读取并合并：
    1. `<skill-dir>/customize.toml`（required, skill defaults）
    2. `_speclite/custom/<skill-name>.toml`（optional, team custom）
    3. `_speclite/custom/<skill-name>.user.toml`（optional, user custom）
  - [ ] 不从 source checkout、archive planning docs、display name、menu label、IDE-specific alias、target id 或 source package path 反推 customization key。
  - [ ] 如果 future adapter 需要重命名 canonical skill directory，必须先更新 manifest/index SPEC、resolve command SPEC 和 executable schema；Story 2.4 MVP 不支持第二 key。
  - [ ] `config.toml.example` 只作为字段结构参考，不作为 runtime fallback；对 customization-capable skill，missing required `customize.toml` 是 blocking failure。
  - [ ] 对未声明 customization-capable 或 source package 缺少 `customize.toml` 的 skill，不得创建 synthetic defaults；如果用户显式调用 customization resolve，返回 layer-correct diagnostic / non-success result，而不是假装合并成功。

- [ ] Task 6: 实现 structural merge rules 并集中到 `src/config/merge-rules.ts`（AC: 1, 2, 7）
  - [ ] 将 merge 规则集中在 `src/config/merge-rules.ts` 或等价 module，供 config 与 customization resolver 共享。
  - [ ] Scalar / non-compatible type：override wins。
  - [ ] Table + table：递归 deep merge。
  - [ ] Array + array：先检查 base + override 全部 elements；只有全部是 tables 且全部拥有同一个 `code` 或全部拥有同一个 `id` 时 keyed merge。
  - [ ] Keyed merge 时，override item 以相同 key 整项替换 base item；不做 item-level deep merge，也不保留 base item 中 override 未写的字段。
  - [ ] Mixed `code` and `id`、部分 item 缺 key、non-table item、空数组或 schema smell 都走 append fallback。
  - [ ] 不实现 deletion。若用户需要禁用默认项，应通过同 key no-op replacement 表达，或等待未来 deletion schema。
  - [ ] Unit tests 必须覆盖 Python baseline 的 `_detect_keyed_merge_field`、`_merge_by_key`、append fallback、override replacement、nested tables 和 non-ASCII values。

- [ ] Task 7: 接入 skill activation protocol 与 runtime path validation boundary（AC: 1, 2, 5, 6, 8）
  - [ ] Installed skill instructions 应调用 `speclite resolve config --project-root <project>` 与 `speclite resolve customization --skill <skill-dir> --project-root <project>`；不要绑定 `node dist/...`、legacy Python script path、source checkout path 或 package cache path。
  - [ ] 如果 validation 发现 installed skill 仍引用 `_bmad`、legacy runtime namespace、`assets/source/speclite/scripts/resolve_*.py` 或 old `python3 resolve_customization.py` runtime dependency，应使用 `runtime-path.legacy-resolver-path` 或 owning taxonomy 中更具体 issue id。
  - [ ] Story 2.4 可提供 resolver runtime entry 和 validation hooks；不得修改 every source skill instruction，除非实现 Story 明确把 installed skill template update 纳入同一 AC 并保持范围可审查。
  - [ ] Resolver access 是 `skill-artifact-loop` release gate 的一部分，但 Story 2.4 不负责 Story 2.5 的 artifact metadata write / validation。
  - [ ] Output 和 diagnostics 不得泄露 installed project absolute path；paths 应使用 project-relative POSIX path 或 redacted/display-safe component。

- [ ] Task 8: 编写 focused unit tests、integration tests 和 `resolve-parity` fixture（AC: 1-8）
  - [ ] Unit tests 覆盖 `src/config/merge-rules.ts`：scalar override、table deep merge、keyed array replacement、append fallback、mixed key fallback、non-table fallback、no deletion。
  - [ ] Unit tests 覆盖 config reader：four-layer order、required `_speclite/config.toml` failure、optional read/parse warning、project-relative / redaction-safe diagnostics、non-ASCII JSON output。
  - [ ] Unit tests 覆盖 customization reader：customization-capable skill required `<skill-dir>/customize.toml` failure、non-capable skill no synthetic defaults、basename lookup key、team/user override order、explicit `--project-root`、fallback search behavior。
  - [ ] Integration tests 覆盖 `speclite resolve config --project-root <fixture>`、`speclite resolve customization --skill <installed-skill-dir> --project-root <fixture>`、missing key success、repeated key output、stderr JSON Lines parse 和 exit codes。
  - [ ] Fixture `test/fixtures/resolve-parity/` 必须覆盖 config four-layer merge、customization three-layer merge、missing key、repeated key、optional layer warning、required layer failure、keyed array replacement、append fallback、non-ASCII JSON output、explicit project root 和 customization fallback search。
  - [ ] `resolve-parity` 与 `skill-artifact-loop` fixture 的 customization success case 必须使用带 `customize.toml` 的 canonical skill；`skill-artifact-loop` 至少验证 installed IDE entry 可以调用 resolver runtime entry 并读取 config/customization，不验证完整 workflow artifact 内容质量。
  - [ ] Tests 必须 parse stdout JSON semantically，逐行 parse stderr JSON Lines 为 `ValidationIssue` objects；不得比较 local absolute paths、具体 current time、random ids 或 raw stack trace。
  - [ ] 运行 `npm run build`、`npm test`，或至少运行 Story 2.4 touched modules 的 focused Vitest tests 与相关 fixture tests。

- [ ] Task 9: 本地验证与范围控制（AC: 1-8）
  - [ ] 如新增或改变 public stdout/stderr field、resolver exit code、issue id、fixture comparison behavior、parser/schema 或 merge semantics，确认同一变更中先更新 owning SPEC、executable schema/parser 和 fixture expected outputs。
  - [ ] 检查 diff，确认没有修改 `_bmad-output/planning-artifacts/`、其他 story 文件或无关用户改动。
  - [ ] 检查 diff，确认没有实现 Story 2.5 workflow artifact writing / metadata validation、Epic 3 full `status` / `validate` installed-state validation、Epic 4 update/repair behavior、Post-MVP strict missing flag、Post-MVP deletion schema、Post-MVP config init/list commands、branded Copilot/Cursor adapters 或 command pointer artifacts。
  - [ ] 检查 resolver output，确认 stdout 没有 `CommandResult` envelope、stderr machine diagnostics 为 JSON Lines、warning 不阻断、error/critical 阻断并产生 non-zero exit。

## Dev Notes（开发备注）

### Current Repository State（当前仓库状态）

- 创建本 Story 时，仓库根目录未发现 `package.json`、`package-lock.json`、`src/`、`test/`、`tests/` 或 root `fixtures/` 实现目录。Story 2.4 的开发必须在 Epic 1、Story 2.1、Story 2.2 和 Story 2.3 实际代码完成后进行。
- `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md` 到 `1-6-install-progress-and-ready-summary.md`、`2-1-methodology-discovery-metadata-generation.md`、`2-2-ide-skill-entry-mapping.md` 和 `2-3-skill-activation-and-phase-capability-coverage.md` 当前是 `ready-for-dev` story context，不是完成后的代码证据。
- 当前 worktree 已存在与本 Story 创建无关的 dirty planning artifacts、`sprint-status.yaml` 改动和未跟踪 Epic 1 / Story 2.1 / Story 2.2 / Story 2.3 story 文件。实现 Story 2.4 时不得格式化、重写、同步或回滚这些无关改动。
- `assets/source/speclite/` 已存在，并包含 bundled source assets、module metadata、custom stubs、legacy Python resolver scripts 和 canonical skill packages。
- 当前 legacy resolver baseline 可见：
  - `assets/source/speclite/scripts/resolve_config.py`
  - `assets/source/speclite/scripts/resolve_customization.py`
  - `_bmad/scripts/resolve_config.py`
  - `_bmad/scripts/resolve_customization.py`
- Legacy Python resolvers 依赖 Python 3.11+ `tomllib`。本机运行 `python3` 时已复现 `tomllib` 缺失问题；人工执行 skill resolver 时可用 `python3.12` 作为短期 fallback，但产品实现必须收敛到 Node/TypeScript `speclite resolve`。
- `_bmad-output/project-context.md` 当前仍是初始化占位内容；实际 implementation guardrails 以 live PRD、Architecture、UX、ADR 和 owning SPEC artifacts 为准。

### Scope Boundary（范围边界）

- 本 Story 只负责 `speclite resolve config` 与 `speclite resolve customization` runtime support command、TOML read/parse、config/customization merge semantics、stdout/stderr contract、layer failure semantics、key selection、Python parity tests 和 `resolve-parity` fixture。
- 本 Story 可以扩展 Epic 1 已存在的 `src/commands/`、`src/config/`、`src/diagnostics/`、`src/validation/`、`src/fs/` 和 fixture anchors；不得创建平行 config resolver、第二套 customization lookup key、第二套 diagnostics shape 或 second public JSON contract。
- 本 Story 不负责：
  - Story 2.1 discovery metadata generation、phase coverage generator 或 artifactContract extraction。
  - Story 2.2 self-contained entry copy/write behavior、canonical package hash generation 或 target writer implementation。
  - Story 2.3 phase coverage evidence UX、activation target uniqueness 或 menu-target diagnostics beyond resolver access boundary。
  - Story 2.5 workflow artifact writing、frontmatter / sidecar metadata 或 artifact validation。
  - Epic 3 lightweight status summary、full validate category coverage、status health aggregation 或 installed-state validation command UX。
  - Epic 4 update/repair merge order for updates、ownership conflict repair 或 safe mutation behavior beyond read-only resolver access。
  - Post-MVP strict missing-key flag、delete semantics、config init/list commands、top-level repair/sync/doctor/uninstall、command pointer artifacts、branded Copilot/Cursor adapters、coverage dashboard、trend report 或 multi-project governance rollup。

### Architecture Requirements（架构要求）

- Runtime baseline remains Node.js 22 minimum and Node.js 24 recommended. Do not use Node 24-only APIs unless a Node 22-compatible path exists and runtime policy / fixtures are updated.
- CLI foundation remains TypeScript + commander. Do not introduce oclif/yargs/cac/clipanion for this Story.
- Storage model is local-first filesystem. Do not introduce database, web service, daemon, REST API, GraphQL, desktop UI, persistent cache server or background process.
- `src/commands/resolve.ts` should orchestrate only. Config/customization reading, schema validation and merge logic belong in `src/config/`; public diagnostic shapes belong in `src/diagnostics/` / `src/validation/`; path normalization belongs in `src/fs/`.
- `src/config/` is the only Config/Customization Merge Implementation location. Skills, IDE adapters, renderers, fixtures and command modules must not hand-roll merge behavior.
- `speclite resolve` is a runtime support command. It is part of MVP API surface for installed skills, but not a primary user journey command to promote as ordinary user workflow.
- All public paths in output, issues, fixtures and tests must use project-relative POSIX-style paths or display-safe labels unless an owning SPEC explicitly marks a redacted external path shape.

### Resolve Command Contract（Resolve 命令契约）

- Owning SPEC: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`.
- Implementation anchor: `src/config/resolve-output-schema.ts`.
- Covered commands:
  - `speclite resolve config`
  - `speclite resolve customization`
- stdout:
  - only resolved JSON object
  - 2-space indentation preferred
  - trailing newline preferred
  - non-ASCII characters not escaped
  - no `CommandResult` envelope
  - no human-readable prose, ANSI, icons, progress text, spinner output or debug lines
- stderr:
  - diagnostics as JSON Lines
  - one JSON object per line
  - each line uses `ValidationIssue` shape from CommandResult SPEC
  - no raw parser stack trace or local absolute path leakage
- exit code:
  - 0 when parsing succeeds and there are no error / critical diagnostics
  - 0 when parsing succeeds with warning diagnostics only
  - non-zero for required layer read/parse failure
  - non-zero for error or critical diagnostics

### Config Merge Requirements（Config 合并要求）

`speclite resolve config` merge order:

1. `_speclite/config.toml`
2. `_speclite/config.user.toml`
3. `_speclite/custom/config.toml`
4. `_speclite/custom/config.user.toml`

Rules:

- `_speclite/config.toml` is required.
- Other layers are optional unless future schema explicitly marks them required.
- Later layers override earlier layers.
- `--project-root` is required for config resolve.
- Missing optional layer means `{}` and should not produce a diagnostic.
- Optional layer read/parse failure produces warning JSON Lines diagnostic, treats layer as `{}`, and continues.
- Required layer failure blocks with non-zero exit.
- Human-owned TOML files are read-only for this Story; resolver must not rewrite, normalize, sort, format or create them.

### Customization Merge Requirements（Customization 合并要求）

`speclite resolve customization` merge order:

1. `<skill-dir>/customize.toml`
2. `_speclite/custom/<skill-name>.toml`
3. `_speclite/custom/<skill-name>.user.toml`

Rules:

- `<skill-dir>/customize.toml` is required for customization-capable installed entries.
- Required defaults apply only when the installed entry is customization-capable: the source package and installed copy both contain `customize.toml`. Story 2.2 marks that capability by copying the file from the canonical package.
- Skills without source `customize.toml` are not customization success candidates in MVP. Resolver implementation must not generate empty defaults, copy defaults from another skill, or infer capability from display text, phase, menu label, target id, or directory group.
- If `speclite resolve customization` is explicitly invoked for a skill with no customization contract, it must return a deterministic diagnostic / non-success result rather than silently manufacturing an empty merge result.
- Project custom layers are optional.
- `<skill-name>` is the basename of `--skill` directory.
- Installed skill instructions should pass explicit `--project-root`.
- For Python parity, omitted `--project-root` may fallback by searching upward from skill directory for `_speclite` or `.git`, then from cwd.
- Adapter-specific aliases, display labels, menu labels, phase labels and source checkout paths cannot become customization keys.
- MVP does not support a second customization key. Future renaming requires manifest/index and resolve SPEC updates first.

### Key Selection Requirements（Key 选择要求）

- `--key` accepts dotted key strings.
- Full merge must happen before key selection.
- Missing key is not failure by default.
- If all requested keys are missing, stdout is `{}` and exit code is 0.
- stderr is empty for missing keys unless a separate layer diagnostic exists.
- Repeated `--key` is allowed.
- Output object uses the original dotted key string as top-level field name.
- Existing keys are included; missing keys are omitted.
- Strict missing-key validation is Post-MVP and must use a future explicit flag.

### Structural Merge Requirements（结构化合并要求）

- Scalar or incompatible type: override wins.
- Table + table: deep merge.
- Array + array:
  - keyed merge only when all base + override elements are tables and all share the same `code` key, or all share the same `id` key.
  - matching key means override item replaces the entire base item.
  - no item-level deep merge.
  - new key appends item.
  - mixed `code`/`id`, missing key, non-table element or other schema smell falls back to append.
- No deletion mechanism in MVP.
- Do not treat `null`, `enabled=false`, `remove`, empty arrays or special fields as deletion.
- If a default must be disabled, use same-key no-op replacement or wait for future deletion schema.

### Diagnostics And Redaction Requirements（Diagnostics 与脱敏要求）

- Use `ValidationIssue` shape for stderr JSON Lines diagnostics.
- Reuse existing categories and issue ids where applicable:
  - `runtime-path.missing-entry`
  - `runtime-path.invalid-script-path`
  - `runtime-path.legacy-resolver-path`
  - `runtime-path.symlink-escape`
  - `manifest-schema.malformed-field`
  - `manifest-schema.schema-corruption`
  - `artifact-path.escapes-project`
  - `artifact-path.symlink-escape`
  - `operation-lock.*` only if future write-capable interaction actually checks lock; resolver itself should be read-only.
- Do not invent free-form issue ids. If a genuinely new public diagnostic is required, update taxonomy SPEC and fixtures in the same implementation change.
- `issueId` must not include paths、target ids、skill ids、hashes、timestamps、random ids or parser messages.
- `details` must be deterministic and redaction-safe.
- Do not leak absolute path、home directory、drive letter、cache path、temporary extraction path、environment variable、credential、stack trace、raw exception object、timestamp or random id.

### Runtime Path And Python Parity Notes（Runtime Path 与 Python Parity 备注）

- ADR 0002 states that Node/TypeScript resolver is the long-term runtime entry; Python resolvers remain parity baseline and diagnostic reference.
- Legacy Python scripts currently show the intended merge semantics, key selection and layer ordering, but their direct `python3` runtime binding is unstable on this machine because bare `python3` can resolve to Python 3.9 without `tomllib`.
- Installed skills should call:
  - `speclite resolve config --project-root <project>`
  - `speclite resolve customization --skill <skill-dir> --project-root <project>`
- Installed skills should not call:
  - `python3 _speclite/scripts/resolve_config.py`
  - `python3 _speclite/scripts/resolve_customization.py`
  - `node dist/...` internal build artifacts
  - source checkout scripts under `assets/source/speclite/scripts`
  - legacy `_bmad` runtime paths
- If legacy resolver paths remain in installed skill instructions, validation should report `runtime-path.legacy-resolver-path` or another existing taxonomy issue.

### File Structure Requirements（文件结构要求）

Expected Story 2.4 implementation anchors, adjusted to existing code if equivalent modules already exist:

```text
src/commands/resolve.ts
src/config/resolve-output-schema.ts
src/config/config-reader.ts
src/config/customization-reader.ts
src/config/merge-rules.ts
src/config/config-schema.ts
src/config/customization-schema.ts
src/validation/issue-model.ts
test/unit/config/merge-rules.test.ts
test/unit/config/config-reader.test.ts
test/unit/config/customization-reader.test.ts
test/integration/resolve.test.ts
test/fixtures/resolve-parity/
test/fixtures/skill-artifact-loop/
```

- This list is Story-scoped. Add helper files only when they directly support resolver contract and align with Architecture naming conventions.
- Do not add workflow artifact writer modules for Story 2.5.
- Do not add status/validate/update command implementations for Epic 3 / Epic 4 inside this Story.

### Testing Requirements（测试要求）

- Use Vitest and fixture assertions.
- Tests must be deterministic and local-only.
- Tests must not access npm registry、Git remote、private registry、offline bundle origin、package-manager cache or external network.
- Parse stdout JSON semantically.
- Parse stderr JSON Lines line-by-line as `ValidationIssue` objects.
- Fixture snapshots must not contain absolute paths、home directories、OS-specific separators、timestamps、random ids、process ids、environment variables、credentials or stack traces.
- Non-ASCII output must round trip without escaping assumptions; semantic JSON parse is the assertion source.
- Any public resolver behavior change must update owning SPEC, executable schema/parser and fixture expected outputs in the same change.

### Previous Story Intelligence（前序 Story 情报）

- Story 2.1 establishes discovery metadata as canonical capability input. Story 2.4 must not redefine skill identity, phase metadata or artifact contract semantics.
- Story 2.1 requires `canonicalSkillId` to come from source skill package or source module metadata, not IDE adapter、menu label、directory traversal order or display name.
- Story 2.2 establishes self-contained IDE entries under `.claude/skills/<canonicalSkillId>/` and `.agents/skills/<canonicalSkillId>/`. Story 2.4 must assume runtime `--skill` points at installed entry directory, not source checkout.
- Story 2.2 preserves target order `claude` then `agents`, generic `agents` semantics, no branded Copilot/Cursor target id, no command pointer artifact and canonical package hash stability. Story 2.4 must not weaken those boundaries.
- Story 2.3 establishes installed `SKILL.md` activation target and resolver access boundary. Story 2.4 implements the runtime support command that Story 2.3 intentionally deferred.
- Story 2.4 owns the resolver-success portion of reverse validation for config/customization access. Story 2.2 and Story 2.3 only prove entry layout, activation target, and resolver invocation boundary; full artifact loop success remains Story 2.5.
- Story 2.3 requires activation to use installed self-contained package resources and not source checkout. Resolver implementation must keep that installed runtime model.
- Story 1.4 establishes config initialization and human-owned TOML stub guardrails. Story 2.4 reads config/customization; it must not rewrite human-owned TOML or invent config init commands.
- Story 1.5 establishes `_speclite` metadata/control hub, `_speclite/custom/`, runtime scripts/templates, manifest/index projection, IDE mirrors and ownership/hash rules. Story 2.4 should reuse those installed runtime paths and not regenerate mirrors.
- Story 1.6 establishes ready summary and ReadyCheck. Story 2.4 must not mark installation ready or modify ready summary behavior; it only supplies resolver runtime support.

### Git Intelligence（Git 情报）

- Recent commits are documentation/context/spec oriented, not implementation scaffold:
  - `a0b08ef style(docs): 清理参考文档尾随空白`
  - `1ab545f docs(context): 初始化项目上下文文档`
  - `a4f8ab9 docs(source): 同步内置源资产路径说明`
  - `6e3d4e4 docs(glossary): 整理术语目录与文档索引`
  - `5b2c7a4 docs(specs): 收敛 MVP 契约与实现锚点`
- `5b2c7a4` updated live SPEC contracts for CommandResult, SourceDescriptor, InstallPlan, manifest/index, IDE adapter registry, validation taxonomy and fixtures; treat live sharded docs and owning SPECs as current implementation truth.
- Do not use `_bmad-output/planning-artifacts/archive/` whole documents as live contract sources.
- Worktree was already dirty when this Story was created; implementation agents must preserve unrelated user changes.

### Latest Technical Information（最新技术信息）

- No new third-party dependency is required for this Story. Use project-pinned libraries from Architecture and previous stories: `commander@14.0.3`、`yaml@2.9.0`、`toml@4.1.1`、`csv-parse@6.2.1`、`fs-extra@11.3.5`、`zod@4.4.3`、`typescript@6.0.3`、`tsx@4.21.0`、`tsup@8.5.1`、`vitest@4.1.6` and `@types/node@22`.
- Use Node.js 22-compatible `node:fs/promises`、`node:path` and stable ECMAScript APIs. Do not introduce Node 24-only behavior.
- Do not add prompt、terminal UI、globbing、validation、filesystem、hashing or config dependencies silently. If a new dependency seems necessary, justify it against Architecture, update package/test fixtures and keep Node 22 compatibility.
- External web research was not required for this Story because the implementation surface is governed by project-owned live PRD, Architecture, UX, ADR 0002 and owning SPEC contracts, and no dependency upgrade is part of the acceptance scope.

### Project Context Reference（项目上下文引用）

- `_bmad-output/project-context.md` currently contains initialized metadata and placeholder sections only; it does not add implementation rules beyond live PRD, Architecture, UX, ADR and owning SPEC artifacts.
- The project-level language rule remains: conversation and generated docs in Chinese, section headings in `English（中文）` form, technical identifiers in English.

### References（参考）

- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Story 2.4`]
- [Source: `_bmad-output/planning-artifacts/epics/05-epic-2-methodology-discovery-and-skill-execution方法论发现与-skill-执行.md#Epic 2`]
- [Source: `_bmad-output/implementation-artifacts/2-1-methodology-discovery-metadata-generation.md`]
- [Source: `_bmad-output/implementation-artifacts/2-2-ide-skill-entry-mapping.md`]
- [Source: `_bmad-output/implementation-artifacts/2-3-skill-activation-and-phase-capability-coverage.md`]
- [Source: `_bmad-output/implementation-artifacts/1-1-cli-install-entry-and-runtime-guard.md`]
- [Source: `_bmad-output/implementation-artifacts/1-4-project-config-initialization.md`]
- [Source: `_bmad-output/implementation-artifacts/1-5-runtime-structure-artifact-directory-and-ide-mirror-creation.md`]
- [Source: `_bmad-output/implementation-artifacts/1-6-install-progress-and-ready-summary.md`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 2`]
- [Source: `_bmad-output/planning-artifacts/prd/05-user-journeys用户旅程.md#Journey 5`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#Technical Architecture Considerations`]
- [Source: `_bmad-output/planning-artifacts/prd/08-developer-tool-specific-requirements开发者工具特定需求.md#API Surface`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Configuration & Customization`]
- [Source: `_bmad-output/planning-artifacts/prd/10-functional-requirements功能需求.md#Methodology Discovery & Execution`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Reliability & Determinism`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Security & Safety`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Compatibility & Portability`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Integration Quality`]
- [Source: `_bmad-output/planning-artifacts/prd/11-non-functional-requirements非功能需求.md#Diagnostics & Observability`]
- [Source: `_bmad-output/planning-artifacts/architecture/03-core-architectural-decisions核心架构决策.md#API & Communication Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Structure Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/04-implementation-patterns-consistency-rules实现模式与一致性规则.md#Format Patterns`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Architectural Boundaries`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Requirements to Structure Mapping`]
- [Source: `_bmad-output/planning-artifacts/architecture/05-project-structure-boundaries项目结构与边界.md#Integration Points`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Journey 3: Phase-Based Skill Use & Artifact Evidence`]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy`]
- [Source: `_bmad-output/planning-artifacts/specs/README.md#Reading Order`]
- [Source: `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md#Resolve Exception`]
- [Source: `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md`]
- [Source: `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md#runtime-path`]
- [Source: `_bmad-output/planning-artifacts/specs/08-fixture-contract.md#Fixture Classes`]
- [Source: `_bmad-output/planning-artifacts/adr/0002-replace-python-resolvers-with-node-parity.md`]
- [Source: `assets/source/speclite/README.md#运行模型`]
- [Source: `assets/source/speclite/scripts/resolve_config.py`]
- [Source: `assets/source/speclite/scripts/resolve_customization.py`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用的代理模型）

GPT-5 Codex

### Debug Log References（调试日志引用）

- `python3 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` failed because local `python3` lacks stdlib `tomllib`.
- `python3.12 /Users/fancyliu/Repos/SpecLite/_bmad/scripts/resolve_customization.py --skill /Users/fancyliu/Repos/SpecLite/.agents/skills/bmad-create-story --key workflow` resolved workflow successfully; `workflow.on_complete` is empty.
- Full `sprint-status.yaml` was read before creation; `2-4-runtime-config-and-customization-resolve` was `backlog`, and `epic-2` was `in-progress`.

### Completion Notes List（完成备注清单）

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 2.4 created with `Status: ready-for-dev`.
- Scope respected: this create-story run should not modify planning artifacts、Story 2.1/2.2/2.3、Epic 1 story files、source code or unrelated files.

### File List（文件清单）

- `_bmad-output/implementation-artifacts/2-4-runtime-config-and-customization-resolve.md`
