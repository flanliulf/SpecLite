# EXPERIMENTS

## 尝试记录

### 2026-05-28 初始化

- 方案: 为 Story 3.2 创建 code review 进度文件，并按 dev -> CR -> evaluator -> fixer -> 复检 -> rules/todo/finalizer 的顺序推进。
- 选择原因: 用户要求每个 Story 在对应 code review 输出目录维护中文进度记录，且所有步骤必须严格串行。
- 结果: 已初始化，等待 Story 3.1 完成后开始。

### 2026-05-28 19:50 dev-story 启动

- 方案: 按用户最新指令收窄为只执行 `/bmad-dev-story story 3-2`，不进入 CR/finalizer/提交链路。
- 选择原因: 用户明确要求作为 fresh sub-agent 严格只执行 Story 3.2 的开发步骤。
- 结果: 已完成 skill 激活、配置解析、Story 与 sprint status 读取；开始进入 RED-GREEN-REFACTOR。

### 2026-05-28 19:50 前置核对

- 方案: 检查 `package.json`、`src/`、`test/`、CLI scaffold、manifest schema、diagnostics、path normalizer、adapter registry、status/installer anchors 和 dirty worktree。
- 选择原因: Story Task 1 要求不能仅凭 story context 判断前置 stories 完成。
- 结果: 前置 TypeScript implementation anchors 已存在；`src/commands/validate.ts`、`src/validation/validate-project.ts`、`src/validation/rules/manifest-schema.ts` 尚待本 Story 创建。工作区存在大量无关未提交改动，后续只处理 3.2 范围。

### 2026-05-28 19:52 RED

- 方案: 添加 `test/validate-command.test.ts`，覆盖 valid projection、schema version diagnostics、domain malformed fields、CLI JSON 和 human evidence。
- 选择原因: Story workflow 要求先写失败测试，验证缺口真实存在。
- 结果: `npx vitest run test/validate-command.test.ts` 失败，原因是 `src/commands/validate.ts` 尚不存在，RED 成立。

### 2026-05-28 19:55 GREEN

- 方案: 创建 `src/commands/validate.ts`、`src/validation/validate-project.ts`、`src/validation/rules/manifest-schema.ts`，扩展 CommandResult schema/output/bin 注册，并收紧 manifest/index runtime schemas。
- 选择原因: 将 command orchestration、validation aggregation、rule、schema 和 renderer 分层放在 Story 指定 anchors。
- 结果: `npx vitest run test/validate-command.test.ts` 通过，5 个 focused tests 全部通过。

### 2026-05-28 19:56 回归修复

- 方案: 对 `files-index` required fields 收紧后，补齐 existing human-owned stub 的 hash/hashAlgorithm，并允许 `sourceRef` 使用稳定 local reference token。
- 选择原因: 完整测试发现 runtime structure 生成端仍有旧 shape；这属于 Story 3.2 schema 收紧后的相关生成端修复。
- 结果: `npx vitest run test/runtime-structure.test.ts -t "preserves existing human-owned stubs"` 通过。

### 2026-05-28 19:56 最终验证

- 方案: 运行 `npm run build`、`npm test`、`git diff --check`。
- 选择原因: Story Step 7/9 要求 build、full regression 和 diff hygiene。
- 结果: build 通过；完整测试 22 个 test files / 133 个 tests 全部通过；`git diff --check` 无输出。

### 2026-05-28 CR Round 1 启动

- 方案: 按 `/bmenhance-cr-01-reviewer 3-2` 执行首轮代码审查，范围限定为 Story 3.2 `File List` 与直接 schema projection 相关差异。
- 选择原因: 用户明确要求 fresh sub-agent 只执行 Story 3.2 的 CR reviewer 步骤，不修复、不提交。
- 结果: 已确认无既有 3.2 review summary，当前为 Round 1；Agent 工具不可用，按 skill 降级规则采用当前上下文串行三层审查。

### 2026-05-28 CR Round 1 结论

- 方案: 汇总三层审查结果，按四桶分类生成 `3-2-code-review-summary-20260528-round-1.md`。
- 选择原因: Skill 要求输出结构化 CR summary，并在发现问题时标注来源、分类、严重性、证据、影响和建议。
- 结果: 发现 1 个 `[中] patch`：skill-index completeness 只按 53 个 entries 数量判断，无法发现“总数正确但 selected package root 缺失”的情况；无 decision_needed / defer。

### 2026-05-28 CR Evaluation Round 1

- 方案: 按 `/bmenhance-cr-02-evaluator 3-2` 只评估最新 CR summary，并用源码、Story AC 与测试逐条验证 finding。
- 选择原因: 用户明确要求 fresh sub-agent 只执行 Story 3.2 的 CR 评估步骤；允许写评估结果和本目录进度记录，禁止修复源码或 Story。
- 结果: 1 个 reviewer finding 确认有效，评估为 P1 阻塞修复项；TODO/误报均为 0；已生成 `3-2-code-review-evaluation-20260528-round-1.md`，可进入 fixer。

### 2026-05-28 CR Fix Round 1

- 方案: 按 `/bmenhance-cr-03-fixer 3-2` 只修复最新评估文件确认的 1 个 P1 项，在 `manifest-schema` rule 中补 selected root 覆盖校验，并补 focused regression。
- 选择原因: 评估结论明确要求补“总数仍为 53 但 selected canonical package root 缺失”的校验；用户要求不得扩大修复范围。
- 结果: 已修改 `src/validation/rules/manifest-schema.ts` 和 `test/validate-command.test.ts`；focused test `npx vitest run test/validate-command.test.ts` 已通过；`git diff --check` 无输出；对本轮 untracked 文件执行 `git diff --check --no-index /dev/null <file>` 也无输出。

### 2026-05-28 CR Round 2 复审

- 方案: 按 `/bmenhance-cr-01-reviewer 3-2` 执行修复后复审，参考 Round 1 CR、最新 evaluation 与修复执行记录。
- 选择原因: 用户明确要求 fresh sub-agent 只执行 reviewer 复审步骤，重点验证 selected canonical package root 覆盖校验修复是否真正解决且未引入新问题。
- 结果: 已生成 Round 2 CR summary；focused test 通过，但发现 selected root 覆盖校验仍未按 expected canonical package root inventory 做 set equality，比对缺口仍为 1 个 patch 阻塞项；建议进入 evaluator。

### 2026-05-28 CR Evaluation Round 2

- 方案: 按 `/bmenhance-cr-02-evaluator 3-2` 只评估最新 Round 2 CR summary，独立核对 Story AC、当前 `manifest-schema` rule、focused regression 与 ready-check 中的 expected inventory 思路。
- 选择原因: 用户明确要求本轮只执行 Round 2 CR 评估，禁止修复源码或 Story，只允许写评估结果与本目录进度记录。
- 结果: 1 个 reviewer finding 确认有效，评估为 P1 阻塞修复项；TODO/误报均为 0；已生成 `3-2-code-review-evaluation-20260528-round-2.md`，可进入 fixer。

### 2026-05-28 CR Fix Round 2

- 方案: 按 `/bmenhance-cr-03-fixer 3-2` 只修复最新评估文件确认的 1 个 P1 项，为 `manifest-schema` rule 增加 selected canonical package root expected set 与 actual set equality，并补 focused regression。
- 选择原因: Round 2 评估明确要求覆盖“总数 53、无 duplicate、module count 正确但 expected root 被唯一 unexpected root 替换”的场景；用户要求不得扩大修复范围。
- 结果: 已修改 `src/validation/rules/manifest-schema.ts` 和 `test/validate-command.test.ts`；focused test `npm test -- test/validate-command.test.ts` 通过 7/7；`npm run build` 通过；`git diff --check` 无输出；对本轮触及 untracked 文件执行 `git diff --check --no-index /dev/null <file>` 均无输出。

### 2026-05-28 CR Round 3 复审

- 方案: 按 `/bmenhance-cr-01-reviewer 3-2` 执行 Round 2 修复后的复审，重点验证 expected canonical package root inventory set equality 是否真正解决。
- 选择原因: 用户明确要求本轮只执行 reviewer 复审，参考历史 CR、最新评估与修复执行记录，禁止修复源码或 Story。
- 结果: 已生成 Round 3 CR summary；focused test `npm test -- test/validate-command.test.ts` 通过 7/7；expected inventory 与当前 source-side canonical package roots count 一致；未发现新的 blocking/patch/defer finding，可进入 evaluator。

### 2026-05-28 CR Evaluation Round 3

- 方案: 按 `/bmenhance-cr-02-evaluator 3-2` 只评估最新 Round 3 CR summary，独立验证 reviewer 通过结论是否成立。
- 选择原因: 用户明确要求本轮只执行 Round 3 CR 评估，确认 expected canonical package root inventory set equality 修复已闭环且无新增阻塞问题。
- 结果: 已生成 `3-2-code-review-evaluation-20260528-round-3.md`；Round 2 阻塞项确认闭环，新增阻塞项 0、CR TODO 0、误报 0；整体结论 Approved / 通过，可进入 rules/todo/finalizer。

### 2026-05-28 CR Rules Extraction 04

- 方案: 按 `/bmenhance-cr-04-rules-extractor 3-2` 分析 Round 1-3 CR 历史，并对 selected canonical package root set equality 经验执行量化升格判定。
- 选择原因: 用户要求 CR 收尾先执行 rules extractor，遇到决策默认采用推荐路径；该经验已解决且具备复用价值，但不宜扩大到全局文档修改。
- 结果: 新增 `CR-API-16` 到 `cr-rules-summary.md`，去向为 `rules-summary` / record-only；未修改全局文档，未交给 TODO。

### 2026-05-28 CR TODO Tracker 05

- 方案: 按 `/bmenhance-cr-05-todo-tracker 3-2` 只检查 Round 1-3 中 non-blocking / defer / 后续改善候选项。
- 选择原因: 用户要求只处理 non-blocking 项，不得把 blocking 问题降级为 TODO。
- 结果: Round 3 evaluator 明确 CR TODO 0；本轮无新增 TODO，不修改 `cr-todo-backlog.md`。

### 2026-05-28 CR Finalizer 06

- 方案: 按 `/bmenhance-cr-06-finalizer 3-2` 验证最新 Round 3 evaluation 为 Approved 后，同步 Story 与 sprint status。
- 选择原因: 用户要求 CR 双通过后执行 finalizer，且必须先验证 evaluator Approved；Epic 主状态如需确认则不主动修改。
- 结果: Story 文件状态已由 `review` 更新为 `done`；`sprint-status.yaml` 中 `3-2-manifest-and-index-schema-validation` 已更新为 `done`，`last_updated` 更新为 `2026-05-28 20:30 CST`；`bmm-workflow-status.yaml` 不存在，按 skill 容错跳过；Epic 3 仍有未完成 Story，保持 `in-progress`。
