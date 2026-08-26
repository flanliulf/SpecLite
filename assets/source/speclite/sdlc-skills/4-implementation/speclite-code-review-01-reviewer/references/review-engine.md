# Three-Layer Review Engine v2（三层审查引擎 v2）

本文件定义 `speclite-code-review-01-reviewer` 的内部执行引擎。共享 identity、scope、schema、quorum、round 和 fingerprint 规则以 `{skills-root}/speclite-code-review-contract/references/cr-contract.md` 为准，不依赖 runner。

## Phase A: Scope and Inputs（范围与输入）

### A1. Scope Completeness（范围完整性）

1. 从 Story 提取 `declaredFiles`。
2. 相对显式 `baseSha` 读取全部 tracked diff，并加入 staged、unstaged、untracked 文件，得到 `actualChangedFiles`。
3. 应用用户明确批准的 `excludedFiles`。
4. 计算 `scopeExceptions = actualChangedFiles - declaredFiles - excludedFiles`。
5. `scopeExceptions` 非空时写入 scope report，review verdict 固定为 `REVIEW_DEGRADED`，不得只过滤后继续。
6. 计算 `scopeHash`，绑定 base/head、三类文件清单及当前内容摘要。

禁止自动使用 `main...HEAD`。用户未指定 baseline 时必须从 development record 读取；仍无法确定则 HALT。

### A2. Review Input（审查输入）

将完整 scoped diff 写入：

`$crDir/.tmp/$reviewSeries-round-$round/review-input.diff`

同时写入：

- `spec-content.md`：Story AC 与必要约束。
- `anchor-evidence.md`：Anchor Evidence Summary 与 completion gate，标注 evidence freshness。
- `history-registry.json`：current series 历史 finding fingerprint/disposition。
- `scope-manifest.json`：共享契约定义的 scope 字段。

diff 为空但 Story 明确要求 full-file review 时可以读取完整文件，并标记 `inputMode=full-file`；否则 HALT。

## Phase B: Independent Layers（独立审查层）

优先在 reviewer 内部并行启动三个 fresh sub-agent。每层 prompt 开头必须原样注入：

> 不设最低 finding 数，零 finding 是合法结果。只报告有第一手证据的实质问题。每个 blocking finding 必须给出稳定 category、被违反的单一 invariant、具体输入/状态 → 实际错误结果、primary location。无法给出具体失败场景时不得输出 blocking finding。历史 finding 只有具体失败场景变化时才可视为 new；仅措辞或位置变化按 fingerprint 归为 recurred。可由测试判定但尚无反例的关切标为 verify-required。metadata 机械同步不阻塞，但 authority/provenance 真实绕过仍可阻塞。

### B1. Blind Hunter（盲点猎手）

- 使用 `speclite-review-adversarial-general`。
- 只读取 scoped diff，不读取 Story/AC，保持盲审。
- 输出 `b1-blind-hunter.md`，每项包含 category、invariant、concrete failure scenario、primary location。

### B2. Edge Case Hunter（边界条件猎手）

- 使用 `speclite-review-edge-case-hunter`。
- 可以读取引用关系，但不得扩展到 scope 外修改。
- 输出 `b2-edge-case-hunter.json`，使用 core Skill v2 JSON 字段。

### B3. Acceptance Auditor（验收标准审计员）

- 使用 `speclite-review-acceptance-auditor`。
- 读取 scoped diff、Story AC、Anchor Evidence 和 completion gate。
- 固定路径只有 owning contract 明确规定时才是 hard gate；否则评估 functional equivalence。
- 输出 `b3-acceptance-auditor.md`。

## Phase C: Quorum（层级 Quorum）

- 3/3：允许继续规范化并产生 `PASS_RECOMMENDED` 或 `FINDINGS_REPORTED`。
- 2/3：保留发现，但 verdict 固定 `REVIEW_DEGRADED`；补跑失败层是唯一可升级路径。
- 0/3 或 1/3：HALT，不生成可供 evaluator/finalizer 消费的 current review。
- Acceptance Auditor 缺失时 `acCoverageComplete=false`。

不得以当前模型单独补写结果来冒充独立层。

## Phase D: Normalize and Fingerprint（规范化与指纹）

统一字段：

| 字段 | 含义 |
|---|---|
| `findingId` | 当前 round 展示编号 |
| `category` | 稳定问题类别 |
| `invariant` | 被违反的单一不变量 |
| `concreteFailureScenario` | 具体输入/状态 → 实际错误结果 |
| `primaryLocation` | 主要文件与行号 |
| `sourceLayers` | blind/edge/auditor 组合 |
| `bucket` | decision-needed/patch/verify-required/defer/dismiss |
| `disposition` | new/recurred/resolved/superseded/deferred/dismissed |
| `fingerprint` | SHA-256(category + invariant + scenario + location) |

### D1. Reject Noise（拒绝噪音）

- 无具体失败场景 → `dismiss`。
- 只是“可能还有分支”且无错误结果 → `dismiss`。
- 纯 round/pointer/展示 provenance 漂移 → `verify-required` 或 `dismiss`。
- 实际 authority/provenance 可绕过 server-owned policy → 可进入 patch/decision-needed。

### D2. Semantic Deduplication（语义去重）

以 invariant + concrete failure scenario 为主，location 为辅。多个层发现同一失败行为时合并 `sourceLayers`；不得仅因相同行号合并不同不变量。

### D3. Historical Disposition（历史处置）

- fingerprint 相同且仍可复现 → `recurred`。
- 历史 finding 已验证关闭 → `resolved`。
- Correct Course 删除对应实现 → `superseded`，同时保留根 invariant 的迁移引用。
- 新 fingerprint 必须有新的具体失败场景，才能计入 `new`。

写入 `classified-findings.json`，并对规范化 JSON 计算 `findingSetHash`。

## Phase E: Classification（分类）

| 分类桶 | 规则 |
|---|---|
| `decision-needed` | 需求/授权不明确，无法安全选择正确修复 |
| `patch` | 有确定失败场景且修复方向明确 |
| `verify-required` | 只需测试/断言/fixture/机械证据，不需要改变生产语义 |
| `defer` | 真实但非当前阻塞，必须由 evaluator 决定是否进入 TODO |
| `dismiss` | 误报、无证据、已关闭或纯噪音 |

Reviewer 不决定 P0/P1/TODO；只提供证据和建议 bucket，最终由 evaluator 裁决。

## Phase F: Output（输出）

使用 `assets/output-template.md` 生成 v2 review summary：

- frontmatter 字段完整且计数与正文一致；
- 明确本轮实际执行的命令与引用既有证据；
- 写入 scope manifest、layer status、finding registry 和 convergence input；
- 零 finding 且 3/3 quorum 时合法输出 `PASS_RECOMMENDED`；
- 任一 scope/quorum hard gate 不满足时输出 `REVIEW_DEGRADED`，不得写“通过”。
