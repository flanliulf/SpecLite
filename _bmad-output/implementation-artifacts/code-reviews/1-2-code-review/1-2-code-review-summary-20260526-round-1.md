---
Story: 1-2
Round: 1
Date: 2026-05-26
Model Used: GPT-5.5 (gpt-5.5)
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 工具不可用，已按 `bmenhance-cr-01-reviewer` 降级规则在当前上下文中串行执行 Blind Hunter、Edge Case Hunter、Acceptance Auditor 三层审查；审查层无单独失败，但并行 Agent 隔离不可用。`npm test` 与 `npm run build` 未能执行到测试/构建阶段，因为当前仓库缺少 `node_modules`，分别找不到 `vitest` 与 `tsup`；`npm run lint` 不存在。当前发现 5 项，其中 1 项高优先级、3 项中优先级、1 项低优先级；建议不通过本轮 CR，需要进入 evaluator/fixer。

## 新发现

### 1. [高] missing manifest 的 existing-install 在 JSON 中被误报为默认 manifest version

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - Story AC5 要求 existing-install 列出 detected runtime、manifest version、IDE targets，并在 manifest/index 不可读或 schema version 不受支持时使用 `manifest-schema` issue model：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:42-47`。
  - Story 明确 `_speclite/` 存在但没有 readable manifest 时仍是 existing installed state，不能覆盖 fresh install：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:192-204`。
  - `readManifestProjection` 在 manifest 缺失时返回 `installedModules: []` 且没有 `manifestVersion`：`src/installer/target-directory.ts:115-122`。
  - `createTargetStateData` 对 existing-install 使用 `state.manifestVersion ?? DEFAULT_INSTALL_MANIFEST_VERSION`，会把 unavailable manifest 投影为 `"speclite.manifest.v1"`：`src/commands/install.ts:169-176`。

- **影响**
  - public JSON 会把未知/不可用 manifest 伪装成当前默认版本，自动化消费者无法区分真实 v1 manifest 与 manifest unavailable。
  - 这会削弱 existing-install 安全门禁，后续 evaluator/fixer 难以基于 JSON 判断应停止 fresh install 还是继续处理。

- **建议**
  - 对 manifest 缺失或不可读的 existing-install 使用明确的 unavailable 投影或 issue/nextAction 表达，不要回填默认 manifest version。
  - 增加 `_speclite/` 存在但 `manifest.yaml` 缺失的 command JSON 测试，断言不会输出虚假的默认 manifest version。

### 2. [中] manifest/index 校验只覆盖 manifest.yaml，其他 index 文件损坏会被静默放过

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - Story Task 4 要求 unreadable 或 malformed manifest/index 产生 `manifest-schema` issue：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:80-81`。
  - Contract notes 指向 Manifest/index fields and schema versions 的 owning SPEC：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:143-149`。
  - `INSTALLED_STATE_PATHS` 包含 `skill-index.json`、`help-index.json`、`files-index.json`、`phase-coverage.json`：`src/installer/target-directory.ts:13-20`。
  - `inspectExistingInstall` 只调用 `readManifestProjection(manifestPath)`，没有读取或验证任何 index 文件：`src/installer/target-directory.ts:93-104`。
  - `hasInstalledState` 对 index 文件只做 `pathExists`，损坏内容不会产生 issue：`src/installer/target-directory.ts:181-189`。

- **影响**
  - 只有 index evidence、或 manifest 正常但 index malformed/unsupported 的 existing install 会被当作安全状态继续报告，违反 AC5 的 manifest/index 诊断要求。
  - 对 IDE target、installed modules 或 phase coverage 的后续判断可能建立在损坏索引上。

- **建议**
  - 至少对 Story 1.2 触达的 index 文件做 schemaVersion/readability 检查，使用既有 `manifest-schema.*` issue id 或 Story 允许的 owning taxonomy。
  - 增加 index malformed、index unsupported-version、manifest absent but index present 的 focused tests。

### 3. [中] 普通文件和 symlink target 未被安全地区分，存在 path escape/误分类风险

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - Story Task 3 要求用 `lstat` / `realpath` 区分普通目录、文件和 symlink，不得跟随 symlink 产生 path escape 写入风险：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:76`。
  - Story 测试要求包含 symlink/path cases：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:234-242`。
  - `safeLstat` 遇到 symlink 只调用 `realpath`，随后仍返回 symlink 的 `lstat` 结果：`src/installer/target-directory.ts:237-243`。
  - `inspectTargetDirectory` 对非目录 target 使用 `[path.basename(input.targetRoot)]`，会把普通文件报告为 `non-empty` target：`src/installer/target-directory.ts:71-90`。

- **影响**
  - 普通文件 target 会被误报为 non-empty directory，而不是 unsupported/unsafe target。
  - symlink target 的后续 `access`/`readdir` 会继续沿 symlink 访问，当前 Story 虽未写入，但该状态会为后续 install stages 留下 path escape 风险。

- **建议**
  - 对 regular file、symlink-to-dir、symlink-to-file、broken symlink 分支给出明确状态或 `operation-lock`/manifest-schema 以外的合规 issue 策略；如果现有 taxonomy 不足，先进入 evaluator 决策。
  - 增加 symlink/path escape 和 regular-file target 测试，断言不会把文件伪装为 non-empty project directory。

### 4. [中] human-readable output 未满足 target summary 和 existing-install 详情要求

- **来源**：auditor+blind
- **分类**：patch

- **证据**
  - AC4 要求向用户展示继续安装可能影响的项目根目录：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:35-40`。
  - AC5 要求列出 detected runtime、manifest version、IDE targets 和建议下一步：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:42-47`。
  - UX 要求 human-readable target summary 回答 resolved target、directory state、detected SpecLite state、confirmation 后才会发生什么、next action：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:222-231`。
  - `renderInstallHumanOutput` 只输出 summary、issues、nextActions：`src/diagnostics/output.ts:7-21`。
  - `createTargetSummary` 的文案不包含 resolved target/displayPath、IDE target visibility、manifest version 或 detectedRuntime：`src/commands/install.ts:126-139`。

- **影响**
  - 用户在 human-readable 模式下无法确认实际影响哪个 target root，也看不到 existing-install 的 runtime/manifest/IDE target 明细。
  - 这削弱了 target confirmation gate 的可审计性，尤其是 explicit target 或 non-empty target。

- **建议**
  - 在 human output 中加入 display-safe target root、directory state、detected runtime、manifest version/unavailable、canonical IDE target statuses。
  - 保持 public JSON 不新增未经 SPEC 声明的 required fields；human-readable 可以更丰富，但仍需 display-safe。

### 5. [低] no-write 与边界测试覆盖未达到 Story 声明的断言范围

- **来源**：auditor+edge
- **分类**：patch

- **证据**
  - Story 要求 no-write tests 在 failure、pending confirmation、existing-install 分支均断言目标项目未发生 mutation：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:107-111`。
  - No-write requirements 明确 `_speclite`、`_speclite-output`、`.claude/skills`、`.agents/skills`、operation lock、safe-write temp、manifest/index files 都不得创建：`_bmad-output/implementation-artifacts/stories/1-2-project-target-directory-resolution-and-existing-install-detection.md:208-220`。
  - `assertNoInstallWrites` 只检查 `_speclite-output`、`.claude/skills`、`.agents/skills`，未检查 `_speclite`、operation lock、safe-write temp 或 manifest/index files：`test/target-directory.test.ts:322-337`。

- **影响**
  - 当前代码看起来没有写入 `_speclite`，但测试无法防止后续回归。
  - Story 声称覆盖 path escape guard、symlink/path cases、non-empty target no-write，但当前测试没有覆盖这些关键边界。

- **建议**
  - 扩展 `assertNoInstallWrites` 覆盖 `_speclite` 和 Story 列出的 pre-confirmation forbidden paths。
  - 增加 non-empty target、regular file target、symlink/path escape、index malformed、manifest missing existing-install 的 integration/focused tests。

## 验证摘要

- `npm test` 失败：未执行到测试阶段，`vitest: command not found`。当前只读约束下未运行 `npm install`。
- `npm run lint` 失败：`package.json` 没有 `lint` script。
- `npm run build` 失败：未执行到构建阶段，`tsup: command not found`。当前只读约束下未安装依赖。
- 定向复现：未运行动态复现；本轮基于 Story、源码和测试文件进行静态证据审查。

## 通过项

- Story 文件存在且状态为 `review`，File List 覆盖了本轮核心实现文件与测试文件。
- `speclite install` 使用 commander optional argument `[target-directory]`，未发现新增 `--project-root` flag。
- 默认 cwd 与 explicit target normalization 的核心路径集中在 `src/fs/path-normalizer.ts`，public `data.paths.projectRoot` 固定为 `"."`。
- Install orchestration 当前停在 `target-confirmation`，未发现 Story 1.3+ 的 source discovery、module selection、config initialization、IDE mirror creation 或 ready summary 被提前实现。
- Missing/empty/non-empty/existing-install 的基础状态模型已存在，且 current implementation 未发现直接创建 `_speclite`、`_speclite-output`、`.claude/skills` 或 `.agents/skills` 的代码路径。
