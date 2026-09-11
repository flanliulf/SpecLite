# B1 Blind Hunter（盲点猎手）正式报告

- `status`: `COMPLETED_WITH_FINDINGS`
- `quorumEligible`: `true`
- `modelUsed`: `OpenAI GPT-5 Codex`
- `completedAt`: `2026-09-07T08:32:41Z`
- `inputMode`: `frozen-diff`
- `findingCount`: `2`
- `blockingFindingCount`: `2`

## Findings（发现）

### B1-01：quoted duplicate key 可伪造 v2 frontmatter 的完成语义

- `category`: `authority/provenance`
- `invariant`: 一个 v2 artifact 的同一 top-level semantic key，在所有 YAML 等价写法中必须唯一；存在 duplicate 或无法完整解析的 frontmatter 时必须 fail closed。
- `primaryLocation`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:440`
- `concreteFailureScenario`: legacy-only CR directory 中的其他字段、source hashes、gate、tracker 均满足校验，但 finalizer frontmatter 同时包含 bare `result: DONE` 与 quoted `"result": HALTED`。field regex 只识别 bare key，quoted YAML key 被静默忽略；`validDoneFinalizer()` 仍读取 `DONE`，把 malformed/ambiguous finalizer 当 authentic completed round，并错误切换到 canonical 新 run。
- `bucket`: `patch`
- `confidence`: `high`

### B1-02：document-root 多行 quoted scalar 可冒充 required YAML tracker 终态

- `category`: `authority/provenance`
- `invariant`: required YAML tracker 的 terminal state 必须来自真实 mapping key，不能来自 quoted scalar、block scalar、comment 或其他文本内容。
- `primaryLocation`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:1548`
- `concreteFailureScenario`: required workflow tracker 是合法 document-root 多行 quoted scalar `"example\nimplementation: done\nending"`，并不存在 `implementation` mapping key。`yamlQuotedScalarOpening()` 仅在 document-root 行以 `!` 或 `&` 开头时进入 quoted state，裸 `"`/`'` 不进入；中间物理行被当作 visible exact key，content hash 又可正确绑定，otherwise-authentic finalizer 因而通过并把 legacy run 误判完成。
- `bucket`: `patch`
- `confidence`: `high`

## Read Scope（读取范围）

仅只读 canonical B1 必要规则和冻结 `review-input.diff` 的完整 7,515 行；未读取 Story、AC、gate、历史 review、scope proposal、其他仓库文件或模板；未运行测试；未修改文件。长输出截断后只对同一冻结 diff 分段补齐。
