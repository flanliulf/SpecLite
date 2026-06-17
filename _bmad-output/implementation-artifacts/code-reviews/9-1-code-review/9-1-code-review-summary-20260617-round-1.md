---
Story: 9-1
Round: 1
Date: 2026-06-17
Model Used: GPT-5 Codex (gpt-5-codex)
Type: Code Review Summary
---

## 审查结论

首轮审查。由于当前环境没有可调用的 Agent 子代理工具，本轮按 `bmenhance-cr-01-reviewer` 降级路径在当前上下文中串行完成 Blind Hunter、Edge Case Hunter 与 Acceptance Auditor 三层审查；未发生内部审查层失败。Focused `npm test -- test/installed-activation-contract.test.ts`、agent lint、`npm run release:packaging-check` 与 `git diff --check` 均通过；未单独运行 `npm run build`，全量 `npm test -- --testTimeout 30000` 采用开发记录中的结果：因 unrelated untracked SDLC skill roots 改变 corpus count 失败。当前发现 2 个需修复的 Story 9.1 gate 缺口，建议本轮 CR 不通过，交由 evaluator/fixer 处理。

## 新发现

### 1. [中] `check_agent_skill.py` 的 legacy activation 正则不会命中目标字符串

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py:51-57` 中 `LEGACY_ACTIVATION_PATTERN` 使用 `r"resolve_customization\\.py"`、`r"python3\\s+\\S*resolve_..."`、`r"读取\\s+..."` 这类双重转义。Python regex 实际不会匹配普通文本 `resolve_customization.py`、`resolve_config.py`、`python3 scripts/resolve_config.py` 或 `读取 {project-root}/_speclite/config.toml`。
  - 定向复现：用同一 pattern 对 `resolve_customization.py --key agent`、`resolve_config.py`、`python3 scripts/resolve_config.py`、`读取 `{project-root}/_speclite/config.toml`` 运行 `pattern.search(...)`，结果全部为 `False`。
  - 该规则在 `assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py:429-435` 被用作 `RUNTIME-03`，因此当前 agent lint 输出 0 findings 并不能证明 legacy resolver / single-file config activation 会被 lint 阻断。

- **影响**
  - 违反 AC5 的 “agent lint 检查 activation protocol / legacy resolver dependency” 防线。后续 persona Agent 重新引入 Python resolver 或单文件 config activation 文案时，`check_agent_skill.py --all assets/source/speclite/sdlc-skills` 可能仍然 pass，形成假绿。

- **建议**
  - 将 Python raw regex 改为单层 regex 转义，例如 `r"resolve_customization\.py|resolve_config\.py|..."`、`r"python3\s+\S*resolve_[a-z_]+\.py"`、`r"读取\s+`?\{project-root\}/_speclite/config\.toml`?"`。
  - 增加针对 `LEGACY_ACTIVATION_PATTERN` 或 `RUNTIME-03` 的最小负向测试，直接证明上述 legacy samples 会产生 finding。

### 2. [中] “full corpus” activation contract test 未覆盖 `references/**/*.md` 全量 corpus

- **来源**：blind+auditor
- **分类**：patch

- **证据**
  - `test/installed-activation-contract.test.ts:28-37` 将 corpus 限定为固定 suffix：`SKILL.md`、`SKILL.en.md`、`references/activation.md`、`references/workflow-details.md`、两个 research step、两个 workflow instruction 文件。
  - `test/installed-activation-contract.test.ts:61-64` 的扫描谓词只接受上述 suffix，未实现 Story AC5 要求的 canonical source `references/**/*.md` 与 workflow terminal step files 全量扫描。
  - 定向统计：当前 `assets/source/speclite` 下 `references/**/*.md` 共 226 个，其中只有 29 个被该 suffix 列表覆盖，197 个未被 `installed-activation-contract.test.ts` 的 corpus test 扫描。

- **影响**
  - 违反 AC5 “full canonical corpus rejects legacy resolver dependency” 的测试覆盖要求。虽然本轮 `rg` 对 canonical source 与 installed mirror 未发现 legacy resolver 字符串，但自动化 gate 仍不能防止未列入 suffix 的 reference / terminal step 文件在未来重新引入 legacy resolver、source checkout resolver fallback 或单文件 config activation 文案。

- **建议**
  - 将 corpus file discovery 改为结构化全量遍历：`SKILL*.md`、所有 `references/**/*.md`、以及明确识别的 terminal step files，而不是维护固定 suffix 白名单。
  - 对 installed mirror 使用同样的 discovery 规则，覆盖 `.claude/skills/**/SKILL*.md`、`.agents/skills/**/SKILL*.md` 和 mirrored references。

## 验证摘要

- `npm test -- test/installed-activation-contract.test.ts` ✅ 通过（4 / 4）
- `python3 assets/source/speclite/support-skills/speclite-agent-lint/scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills` ✅ 通过（7 个 persona Agent，0 findings；但本轮发现 `RUNTIME-03` legacy regex 自身存在漏报缺陷）
- `npm run release:packaging-check` ✅ 通过
- `git diff --check` ✅ 通过
- `npm run build` 未单独运行；为避免在只读 CR 中刷新构建产物，本轮未执行可能写入 `dist/` 的 build。
- `npm test -- --testTimeout 30000` ❌ 未重跑；采用开发记录中的结果：失败 7 个断言，原因指向 4 个 unrelated untracked SDLC skill roots 改变 canonical package root count。该失败不要求回滚无关文件，但应在 evaluator 中确认是否作为 Story 9.1 非阻塞环境污染处理。
- 定向复现 ✅ `check_agent_skill.py` 当前 `LEGACY_ACTIVATION_PATTERN` 对 legacy samples 全部返回 `False`，确认 Finding #1。
- 定向 corpus 统计 ✅ `assets/source/speclite` 下 226 个 `references/**/*.md` 中 197 个未被当前 suffix-based test 覆盖，确认 Finding #2。

## 通过项

- Canonical source 与 installed mirror 的 legacy resolver / source checkout / single-file config 文案定向 `rg` 扫描未命中。
- Canonical persona Agent activation 文案包含 `command -v speclite`、明确 CLI unavailable halt 文案、`speclite resolve customization --skill {skill-root} --project-root {project-root} --key agent` 与 `speclite resolve config --project-root {project-root}`。
- Alice / NOI merged config regression focused test 通过，证明 `_speclite/config.user.toml` 中的 `core.user_name` 与 `core.communication_language` 可通过 `speclite resolve config` merged output 读取。
- Full test 失败对应 unrelated untracked SDLC skill roots 污染 corpus count；本轮不要求回滚或吸收这些无关 roots。
