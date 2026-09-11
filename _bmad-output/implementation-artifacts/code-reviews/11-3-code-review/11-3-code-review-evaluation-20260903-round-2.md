---
Story: 11-3
Round: 2
Date: 2026-09-03
Model Used: GPT-5.5 (gpt-5.5)
Review Source: 11-3-code-review-summary-20260903-round-2.md
Review Model: GPT-5.5 (gpt-5.5)
Type: Code Review Evaluation
---

## 评估总结

对 Story 11-3 的第 2 轮 CR 代码审查结果（复审）进行逐条评估。Review Source 确认 Round 1 的 4 个 P1 finding 已闭环，并新增 1 个 legacy `sprint-status.story_location` 目录噪声导致 `actualConsumedPath` false positive 的 finding。

独立代码核验、owner contract 对照与临时 production 复现均确认新 finding 有效。评估结论：不通过。需要启动 Fixer Round 2，但 fixer 必须严格限制在 legacy story actual artifact discovery/filtering；不得实现 Story 11.5 whole/sharded precedence、新 workflow routing、artifact migration、tracker/gate 推进、canonical docs 改写或 resolver-level protected namespace rejection。

Owner decision：当前 P1 bounded fix 不需要 owner 介入；`SPEC 09`、sprint-status key contract、Create Story / Dev Story / Flow Gate discovery 语义足以定义 directory `story_location` 下的最小合法 Story artifact 过滤。若后续要把 single-file `story_location` 或仅靠 metadata 的 `legacy.md` 定义为合法 legacy Story 输入，则需要 owner 决策并先更新 `SPEC 09` / consumer contract；本轮 fixer 不得自行扩大。

---

## 上轮问题回顾确认

### Round 1 / Finding #1：malformed/invalid existing config 被错误降级为 healthy status：Closed

当前代码已闭环。`src/status/installed-state.ts:113-165` 在 blocking root resolution issue 存在时把 `highLevelHealth` 置为 `"failed"`，并在 `src/status/installed-state.ts:153-165` 剥离 manifest-derived `artifactRoots`，避免 fresh defaults 冒充 current state。`src/commands/status.ts:43-58` 改为根据 top-level `issues` 推导 command `status` 和 exit code。

当前测试证据也覆盖该修复：`test/existing-install-compatibility.test.ts:91-135` 断言 malformed required config 下 `exitCode=1`、`status="failure"`、`highLevelHealth="failed"`、top-level `manifest-schema.malformed-field` 存在、`paths.artifactRoots` 不展示，human output 不含 `mode=fresh-default`。

独立验证命令 `npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot` 通过：6 files / 90 tests。

### Round 1 / Finding #2：production validate 未真实消费 legacy `sprint-status.story_location`：Core Closed, New Edge Open

核心 plumbing 已闭环，但本轮新增 filtering 缺口不被 recovery record 覆盖。`src/validation/validate-project.ts:160-197` 会读取 top-level `story_location` 并把它作为 story `ActualOutputPathEvidence` 传入 `validateArtifactPaths()`；`src/validation/artifact-paths.ts:59-70` 会把 actual output path 下发现的 artifact 纳入 contract validation；`src/validation/rules/artifact-path.ts:76-92` 与 `:238-258` 会输出 `artifact-path.config-artifact-mismatch` 及 `actualConsumedPath`。

测试 `test/existing-install-compatibility.test.ts:205-285` 证明合法 legacy story path 能进入 mismatch path。但该测试只有一个 `legacy.md`，未覆盖同目录 `README.md`、`notes.md`、`notes.txt` 噪声；因此 Round 1 修复执行记录只能证明 core path，不证明 directory filtering。

### Round 1 / Finding #3：artifact root overlap 把 installer-owned managed files 误判为 workflow-owned：Closed

当前 `src/update/ownership-model.ts:41-67` 的顺序是 human-owned custom path 优先，其后 `isInstallerOwnedPath()`，最后才匹配 configured/default artifact roots；`src/update/ownership-model.ts:109-120` 明确 `_speclite/_config/*`、`_speclite/hooks/*`、`.claude/skills/*`、`.agents/skills/*`、`.claude/settings.json`、`.codex/hooks.json` 为 installer-owned namespace。

测试证据：`test/ownership-model.test.ts:46-68` 覆盖 artifact roots overlap 下 installer-owned namespace 仍为 installer-owned；`test/existing-install-compatibility.test.ts:359-443` 覆盖 `_speclite` 作为 configured artifact root 时，update 报 installer-owned conflict，repair 计划 regenerate，不再 `workflow-owned skip`。

Resolver-level protected namespace rejection 仍未实现；独立 ad-hoc 复现确认 `implementation_artifacts = "_speclite"` 仍被 `resolveArtifactRootsFromProjectConfig({ lifecycle: "existing" })` 接受且 `issues=[]`。这与 Round 1 evaluator 的 future / owner decision 边界一致，不是当前 Story 11.3 P1 blocker。

### Round 1 / Finding #4：metadata passthrough 可能放宽 required/value/sourceSkill 严格性：Closed

当前 `src/manifest/manifest-schema.ts:89-101` 的 `WorkflowArtifactMetadataSchema` 使用 `.passthrough()`，只允许 unknown future keys；`workflowType`、`sourceSkill`、`generatedAt` 的 regex / ISO 校验仍保留。`src/manifest/manifest-schema.ts:153-159` 仍要求 artifact contract 包含 `workflowType`、`sourceSkill`、`generatedAt`。`src/validation/rules/artifact-path.ts:292-355` 继续拒绝 missing required metadata、invalid values 和 wrong canonical `sourceSkill`。

测试证据：`test/artifact-path-validation.test.ts:36-121` 覆盖 frontmatter、sidecar、directory metadata unknown future keys；`test/artifact-path-validation.test.ts:398-464` 覆盖缺失 required keys 与 wrong canonical `sourceSkill` 仍失败。

### Recovery Record（恢复记录）审计

`11-3-code-review-evaluation-20260903-round-1.md:225-317` 后半段追加了 Fixer recovery record，记录 4 个 Fix Items 与后续验证。本评估没有把该 record 当作代码完成证据，而是以当前源码、tests 与 ad-hoc reproduction 独立复核。结论是：该 record 不掩盖 Round 2 新发现；它仅能证明 Round 1 四项 bounded repair 的恢复意图与历史验证记录。

---

## 发现 #1 评估

### 审查原文

> **[中][新] legacy `story_location` 目录会把非 story 文件当作 story artifact 产生 mismatch**
> - 来源：blind+edge+auditor
> - 分类：patch

### 评估结论：✅ 确认有效 — 需要修复（P1 优先级）

### 评估分析

**问题描述准确性：准确**

当前 production path 确实会把 legacy `story_location` 目录中的普通文件当成 story artifact：

- `src/validation/validate-project.ts:166-197` 只把 artifact contract 限制为 `artifactType === "story"`，但传入的 `actualOutputPath` 是整个 `story_location` 目录。
- `src/validation/artifact-paths.ts:55-70` 对 `actualOutputPath` 调用通用 `discoverArtifacts()`，并把返回值加入同一 `contractArtifacts` 集合。
- `src/validation/artifact-paths.ts:187-217` 对 directory artifact root 调用 `listArtifactEntities()`；`src/validation/artifact-paths.ts:220-237` 递归收集所有普通文件，只排除 `metadata.json` 与 `*.metadata.json`。
- `src/validation/artifact-paths.ts:268-301` 只是尝试读取 `.md` frontmatter 或 sidecar metadata；缺少 metadata 不会把文件从 discovery 集合中移除。
- `src/validation/rules/artifact-path.ts:76-92` 会对每个 discovered `actualArtifactPath` 做 configured-root mismatch 检查；因此 README/notes 也会被输出为 `artifact-path.config-artifact-mismatch`。

独立 production 复现使用真实 `runInstallCommand({ yes: true })` 生成 installed state，然后写入 legacy `_speclite-output/implementation-artifacts/sprint-status.yaml`：

```yaml
story_location: _speclite-output/implementation-artifacts/stories

development_status:
  11-3-existing-install-compatibility-and-diagnostics: review
```

同一 legacy story directory 放置：

- `11-3-existing-install-compatibility-and-diagnostics.md`
- `README.md`
- `notes.md`
- `notes.txt`

随后运行 `runValidateCommand()`，结果为 `validateExitCode=1`、`validateStatus="failure"`，`artifact-path.config-artifact-mismatch` 的 `actualConsumedPath` 同时包含：

- `_speclite-output/implementation-artifacts/stories/11-3-existing-install-compatibility-and-diagnostics.md`
- `_speclite-output/implementation-artifacts/stories/README.md`
- `_speclite-output/implementation-artifacts/stories/notes.md`
- `_speclite-output/implementation-artifacts/stories/notes.txt`

这比 reviewer 的 `notes.txt` 示例更强：当前实现不只收进非 markdown 噪声，也收进无 story key 的 markdown 噪声。

**Owner contract 判定：可唯一决定 directory `story_location` 的最小过滤**

现有 owner contract 足以定义 directory `story_location` 下哪些文件可被当成 Story artifact：

- `SPEC 09` 声明自己是 `story_location`、`story_root`、`default_output_file` 与 `development_status{story_key}` 的 field-level contract owner（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:21-58`）。
- `SPEC 09` 明确 `story_location` 是 Story 文件所在目录，`story_root` 是 `story_location` 或 fallback `{implementation_artifacts}/stories`，`default_output_file` 是 `{story_root}/{story_key}.md`（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:101-113`）。
- `SPEC 09` 定义 Story state key form 为 `{epic}-{story}-{slug}`，并排除 `epic-{n}` 与 `epic-{n}-retrospective` 这类非 Story key（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:115-133`）。
- `SPEC 09` 要求 `speclite-create-story` 默认写 `{implementation_artifacts}/stories/{story_key}.md`，`speclite-dev-story` 优先从 `sprint_status.story_location` 发现 Story，fallback 到 `{implementation_artifacts}/stories`（`_bmad-output/planning-artifacts/specs/09-sdlc-workflow-lifecycle-contract.md:241-245`）。
- `speclite-create-story` canonical workflow 定义 `story_root = {implementation_artifacts}/stories`、`default_output_file = {story_root}/{story_key}.md`，并在创建时确保 `{story_root}` 目录存在、初始化 `{default_output_file}`（`assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story/references/workflow-details.md:60-69`、`:247-252`）。
- `speclite-dev-story` canonical workflow 在有 sprint status 时先按 `development_status` 顺序选择 `数字-数字-名称` story key，再在 `{story_root}` 中按 `{story_key}.md` 匹配并完整读取 Story 文件；无 sprint status 时才搜索 `*-*-*.md` 候选（`assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/references/workflow-steps.md:34-39`、`:64-67`、`:83-87`）。
- Flow Gate hook 的 bare story key expansion 只读取 direct `.md` entries 并按 story key exact/prefix 过滤（`assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs:101-116`）。

因此，bounded fixer 的最小可证明过滤是：对于由 `sprint-status.yaml` 的 `story_location` 提供的 directory actual output evidence，只把 direct child `.md` 文件中 basename 精确匹配同一 `development_status` 内合法 Story key 的文件视为 legacy Story artifact；不得把 `README.md`、`notes.md`、`notes.txt`、metadata sidecar、hidden/temp file 或任意 recursive child 自动纳入 `actualConsumedPath`。

Reviewer 示例中的 `legacy.md` 不应作为 owner-contract 证明的“合法 legacy story”样例：它可以是一个 markdown artifact，但不是 `development_status` story key，也不符合 `{story_root}/{story_key}.md` 合同。若要把仅靠 metadata/frontmatter 的 `legacy.md` 定义为合法 Story artifact，需要 owner 决策；不能由 Round 2 fixer 发明。

**严重性判断：偏低**

Reviewer 原始标注 `[中]` 适合作为人读风险描述，但 CR 优先级应定为 P1。原因是 Story 11.3 AC4/AC5 要求 config/artifact mismatch diagnostics 区分 `configuredRoot`、`resolvedRoot`、`actualConsumedPath`，并让旧 `sprint-status.story_location` 继续可发现、可消费。当前实现把目录噪声提升为 workflow-owned story evidence，导致 validation false positive 和 `actualConsumedPath` 污染，直接破坏该 Story 的 deterministic diagnostics 质量门禁。

**修复建议：可行，且必须收窄**

授权 fixer 做 bounded patch：

1. 在 legacy `story_location` actual discovery path 上增加 story-specific filtering。推荐在 `discoverLegacyActualOutputPaths()` / `readLegacyStoryLocation()` 一侧解析同一 `sprint-status.yaml` 的 `development_status` story keys，并把这些 keys 作为过滤依据传给 artifact discovery；不要把通用 `discoverArtifacts()` 的行为全局改窄，以免影响 report/directory artifact metadata 合同。
2. 对 directory `story_location`：只纳入 direct child `.md`，且 basename 必须精确匹配 `development_status` 中合法 Story key（`^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$`），同时排除 `epic-*`、`epic-*-retrospective`、README、notes、metadata sidecars、hidden/temp entries 和 recursive children。
3. 对 single-file `story_location`：现有 `SPEC 09` 把 `story_location` 定义为目录，因此本轮 bounded fix 不应默默把 single-file path 纳入合法 legacy root。最小测试应断言 single-file `story_location` 不会把 arbitrary file 变成 story `actualConsumedPath`。如 maintainer 要正式支持 single-file legacy story path，必须先走 owner decision 更新 `SPEC 09` 与 consumer discovery contract。
4. 保持 existing mismatch diagnostic shape 不变：合法 legacy story file 仍输出 `artifact-path.config-artifact-mismatch`，details 至少包含 `field`、`configuredRoot`、`resolvedRoot`、`actualConsumedPath`、`resolutionMode` 和 `reason: "config-artifact-mismatch"`，且只使用 project-relative POSIX path（`_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md:269-280`）。
5. 不得在本 fix 中实现 Story 11.5 whole/sharded precedence、新 workflow routing、artifact migration、canonical docs rewrite、Story/tracker/gate 状态推进或 resolver-level protected namespace rejection。

建议 tests：

- `runValidateCommand()` production regression：真实 `runInstallCommand({ yes: true })` installed state + legacy directory `story_location` + `development_status["11-3-existing-install-compatibility-and-diagnostics"] = review`，目录中同时存在合法 `11-3-existing-install-compatibility-and-diagnostics.md`、`README.md`、`notes.md`、`notes.txt`；断言 mismatch 只包含合法 story path，`validatedPaths` 不包含 README/notes noise。
- `validateArtifactPaths()` / helper-level regression：directory actual output evidence 中 mixed files 只发现 story-key `.md`，不发现 metadata sidecars、recursive noise 或 non-key markdown。
- single-file boundary regression：`story_location` 指向 `notes.txt`、`README.md` 或任何不符合 directory contract 的 file 时，不产生 story `actualConsumedPath` mismatch；若 fixer 认为必须支持 `story_location: .../{story_key}.md`，必须 HALT 请求 owner decision，而不是自行实现。
- Legal legacy story regression：使用 story-key filename，而不是 `legacy.md`，证明合法 legacy Story 仍可产生 `artifact-path.config-artifact-mismatch`。

**误报评估：非误报**

不是误报。独立 production 复现确认当前 validate 会把 `README.md`、`notes.md`、`notes.txt` 全部作为 story `actualConsumedPath` mismatch 输出。现有 owner contract 也明确 Story artifact discovery 应绑定 story key 和 `.md` file，不支持任意目录文件。

---

## 整体评估结论

### 需要修复（阻塞交付）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| 1 | legacy `story_location` 目录把非 story 文件作为 story `actualConsumedPath` mismatch | [中] | **P1** | 破坏 Story 11.3 AC4/AC5 的 deterministic mismatch diagnostics；production validate 已复现 README/notes 噪声 false positive。 |

### 建议纳入 CR TODO 跟踪（非阻塞）

| # | 发现 | 原始严重性 | 评估后优先级 | 说明 |
|---|------|----------|-----------|------|
| R1-3-follow-up | config resolver 层拒绝 artifact root 指向 `_speclite` / `.claude` / `.agents` installer namespace | [中] | **decision_needed / future** | 当前 Story 11.3 已通过 ownership precedence 解决 update/repair overlap；resolver-level rejection 仍需 owner contract 与 stable diagnostic 决策，不属于 Round 2 fixer。 |
| R2-future | 是否正式支持 single-file `story_location` 或 metadata-only `legacy.md` 作为 legacy Story 输入 | [中] | **decision_needed / future** | `SPEC 09` 当前定义 `story_location` 为目录，Story 文件为 `{story_root}/{story_key}.md`；若要扩展兼容输入，必须先更新 owner contract。 |

### 可忽略（误报）

| # | 发现 | 原始严重性 | 忽略理由 |
|---|------|----------|---------|
| 无 | 无 | - | Round 2 finding 被独立核验为真实问题。 |

### 评估决定

- **整体结论**：不通过。需要启动 Fixer Round 2；修复后必须再进入 Reviewer Round 3 / Evaluator Round 3，不得直接 CR04/CR05/CR06 或 Story 11.4。
- **Finding #1（legacy story_location noise false positive）**：授权 P1 fixer。修复范围仅限 legacy story actual artifact discovery/filtering 与对应 tests。
- **合法 Story artifact 最小定义**：directory `story_location` 下，direct child `.md` 且 basename 精确匹配同一 `sprint-status.yaml` 的合法 `development_status` Story key。
- **明确排除**：不授权 Story 11.5 whole/sharded precedence、新 workflow routing、artifact migration、canonical docs rewrite、Story/SPEC/gate/tracker 修改、reviewer summary 修改、CR rules 修改、resolver-level protected namespace rejection。
- **Owner**：当前 bounded fix 不需要 owner 决策。若 fixer 认为必须支持 single-file `story_location` 或 `legacy.md` 这类非 story-key 文件，应 HALT 并提出 owner 问题：`SPEC 09` 是否要把 `story_location` 从“Story 文件所在目录”扩展为“目录或单个 Story 文件”，以及合法 Story artifact signature 是否允许 metadata-only 而非 story-key filename？

## Verification（验证）

- 读取并遵守：`/Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/SKILL.md`、`/Users/fancyliu/Repos/SpecLite/AGENTS.md`。
- 读取配置与模板：`/Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/references/cr-config.md`、`/Users/fancyliu/.agents/skills/bmenhance-cr-02-evaluator/assets/output-format.md`。
- 读取 review source：`_bmad-output/implementation-artifacts/code-reviews/11-3-code-review/11-3-code-review-summary-20260903-round-2.md`。
- 静态核验：读取 `src/validation/validate-project.ts`、`src/validation/artifact-paths.ts`、`src/validation/rules/artifact-path.ts`、`src/status/installed-state.ts`、`src/commands/status.ts`、`src/update/ownership-model.ts`、`src/manifest/manifest-schema.ts`、相关 Story/SPEC/canonical Skill 文件与 tests。
- Focused independent verification：`npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot` -> 6 files passed / 90 tests passed。
- Ad-hoc production reproduction：真实 `runInstallCommand({ yes: true })` installed state + legacy directory `story_location` + legal story key file / `README.md` / `notes.md` / `notes.txt`，`runValidateCommand()` 输出 4 个 `artifact-path.config-artifact-mismatch` actualConsumedPath，包含所有噪声文件；临时目录已清理。
- Resolver future-boundary reproduction：`implementation_artifacts="_speclite"` 当前仍被 existing resolver 接受且 `issues=[]`，说明 protected namespace rejection 仍是 future / owner decision，而不是已实现或本轮应修项。
- Canonical source governance preflight：`node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json` -> `status="ok"`、`findings=[]`、`changedPathCount=1`、impacted classes 为 `canonical-source-truth:D0` 与 `module-discovery-contract:D0`、`decisionRecordRequired=false`。
- Final canonical checker：warn 与 strict mode 均为 `status="ok"`、`findings=[]`；counts 为 `core=18`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=68`。

## 修复执行记录

### 修复执行记录
- **Date**: 2026-09-03
- **Model Used**: GPT-5.5 (gpt-5.5)
- **Fix Items**: 1

#### Fix Item #1：legacy `story_location` directory noise false positive

- 处理范围：仅修改 validation 的 legacy story actual-evidence plumbing 与对应测试；未修改 Story、SPEC、flow gates、tracker、docs、canonical source、reviewer summary、CR rules、migration 或 resolver-level protected namespace rejection。
- 代码修改：`src/validation/validate-project.ts` 在读取同一份 `sprint-status.yaml` 时同时解析 `development_status` keys，只接受合法 `^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$` Story key；directory `story_location` 只生成 direct-child `{story_key}.md` 的 `actualArtifactPaths`，排除 `README.md`、`notes.md`、`notes.txt`、metadata sidecar、hidden/temp entries 与 recursive children；single-file `story_location` 不作为本轮合法 legacy Story evidence。
- 代码修改：`src/validation/artifact-paths.ts` 支持 `ActualOutputPathEvidence.actualArtifactPaths`，当 legacy caller 提供精确 artifact list 时只读取这些 explicit paths；通用 `discoverArtifacts()` 目录递归行为保持不变，避免影响 report/directory artifact metadata contract。
- 测试修改：`test/existing-install-compatibility.test.ts` 将原 `legacy.md` fixture 改为合法 `11-3-existing-install-compatibility-and-diagnostics.md`，并新增 production `runInstallCommand()` + `runValidateCommand()` mixed-noise regression；断言 `artifact-path.config-artifact-mismatch.details.actualConsumedPath` 只包含合法 Story key path，single-file `story_location` 不产生 Story actual mismatch。
- 验证结果：`npx vitest run test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts --reporter=dot` -> 2 files passed / 18 tests passed。
- 验证结果：`npx vitest run test/status-command.test.ts test/existing-install-compatibility.test.ts test/artifact-path-validation.test.ts test/ownership-model.test.ts test/update-planning.test.ts test/validate-command.test.ts --reporter=dot` -> 6 files passed / 91 tests passed。
- 验证结果：`npm run build` -> passed；`npm test` -> 62 files passed / 491 passed / 4 todo；`npm run docs:check` -> passed；`npm run release:packaging-check` -> passed；`git diff --check` -> passed。
- Canonical governance：已按 `speclite-canonical-source-governance-runner` 读取治理映射流程并执行 `speclite-check-canonical-source-change` warn/strict；两次均为 `status="ok"`、`findings=[]`，counts 为 `core=18`、`sdlc=50`、`support=8`、`hooks=2`、`defaultInstall.total=68`。本轮仅有 `canonical-source-truth:D0` 与 `module-discovery-contract:D0` impact，`decisionRecordRequired=false`；D1/D2 surfaces 未要求独立记录，public docs check 与 packaging check 均通过。
- 结论：Round 2 P1 bounded fix 已完成。下一步必须进入 fresh Reviewer Round 3，再由 fresh Evaluator Round 3 复评；在 Reviewer/Evaluator 双通过前不得执行 CR04/CR05/CR06 或进入 Story 11.4。
