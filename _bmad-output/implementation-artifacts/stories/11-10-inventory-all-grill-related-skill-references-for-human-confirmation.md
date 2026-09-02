# Story 11.10: Inventory All Grill-Related Skill References For Human Confirmation（盘点全部 Grill 相关 Skill 引用供人工确认）

Status: ready-for-dev

## Story（故事）

作为 SpecLite canonical source 维护者，  
我希望获得所有 grill-related Skill 定义及引用的完整、逐条、可定位清单，  
以便在额外治理或语义调整前先确认真实关系和影响范围。

## Acceptance Criteria（验收标准）

1. 扫描 `assets/source/speclite/` 全部 packages 与关联 ZH/EN definitions、steps、references、templates/assets、scripts/hooks、metadata/help/registry/contracts、active docs，不限目录名含 `grill`。
2. Case-insensitive 词集至少含 `grill`、`grilling`、`ir-grill`、`grill-consistency`、`implementation-readiness-grill` 及扫描发现的所有 variants/IDs/paths。
3. 每一 match 记录 owner package、file、line、language、reference type、literal、target Skill/workflow/path、active/compatibility/legacy/fixture classification、11.8 impact 与 keep/fix/confirm recommendation。
4. Reference types 至少区分 identity/frontmatter、trigger/description、caller→callee、prerequisite、output directory、report filename、help/discovery、rename mapping、prose/example、legacy/regression evidence。
5. 关系摘要区分 grill Skills、callers、artifact consumers、historical/compat/test expressions，并记录 SDLC stage 与 artifact root。
6. ZH 与 EN 分条记录并做 parity；不得压缩为不可定位的合并项。
7. 以 Story 11.8 完成后的 current state 为 baseline；old IDs / `ir-grill/` compatibility 单列；本 inventory 不是 11.8 completion gate。
8. 最终结果写入本 Story implementation artifact 的独立 `Grill Reference Inventory（Grill 引用清单）` 章节，并在 Epic runner handoff 提供可点击 path。
9. 记录 reproducible command、scope、Git commit/tree identity、exclusions/reasons、raw matches、deduplicated entries 与 classification counts。
10. 每个 machine match 必须 1:1 对应 report entry；遗漏/未分类即失败；100% reconciliation 不表示所有 references 应删除或已获批。
11. 除本 Story artifact、runner records 与必要 tracker 外，被盘点 canonical definitions 全程 read-only；进一步修改等待用户确认与新 change authorization。
12. 最终先展示摘要、高风险、歧义，再明确请求人工确认；“已列出”不等于批准。
13. Active exact old ID/path 单列为 Story 11.8 regression；其他 semantic/parity risks 是待确认治理候选；两类都不自动修改或回写 11.8。

## Tasks / Subtasks（任务 / 子任务）

- [ ] Task 1: Baseline / Read-only Kickoff（AC: 1-13）
  - [ ] 核验 11.1–11.9 `done` + completion Gates，尤其锁定 11.8 new IDs/root/mapping/exact-scan identity。
  - [ ] 记录 initial Git commit/tree/status 与允许写入白名单；运行 11.10 `story-kickoff`。
- [ ] Task 2: 设计可复现 Broad Scanner（AC: 1-2, 9-10）
  - [ ] 固定 include/exclude、case-insensitive variants、raw output 格式与 deterministic sort；禁止人工抽样替代机器全集。
- [ ] Task 3: 逐 Match 分类与关系建模（AC: 3-7, 13）
  - [ ] 建立 stable entry ID 与 raw-match-to-entry mapping；分别计算 ZH/EN parity、caller/callee/consumer relationships。
  - [ ] 将 11.8 exact regression 与 generic governance candidates 分开。
- [ ] Task 4: 写入 Inventory 与 Completeness Evidence（AC: 8-10）
  - [ ] 在下方独立章节填入每条 entry、counts、commands、tree identity、exclusions 与 100% reconciliation。
- [ ] Task 5: Read-only Diff Proof 与 Human Handoff（AC: 11-13）
  - [ ] 对 canonical source 做 before/after tree comparison，证明零修改。
  - [ ] 运行 completeness validator；展示摘要/风险/歧义并请求用户确认，不执行治理修改。
  - [ ] 完成 story-completion Gate 与实际 evidence summary。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- Current canonical source 已存在 core `speclite-grill-with-docs`、`speclite-grilling`，以及旧 Implementation Readiness grill package/references；不能仅扫描 package names。
- Story 11.8 当前尚未实现；本 Story 文件可以预创建，但实际 inventory 必须等待 11.8 完成后的 current tree，不能提前填入今天的扫描结果冒充未来 baseline。
- 本 Story 是 read-only audit；唯一业务输出是本文件中的 inventory，外加 runner/tracker/gate records。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- Scanner 必须 deterministic、case-insensitive、binary-safe，并输出可回查 line + literal；symlink/vendor/cache/generated mirrors 的 include/exclude 必须显式说明。
- Stable entry identity 应基于 normalized source path + line + literal occurrence；去重不得合并 ZH/EN 或不同语义角色。
- 保存 raw output identity/hash，独立 validator 校验 raw match count = mapped match count 且 unmapped=0。
- 不修改 canonical definitions；任何“建议修正”只写 recommendation/classification。
- 不需要新 runtime dependency 或 web research；优先 `rg --line-number --ignore-case` 与仓库内 deterministic parser/test。
- 默认 scope：全量 include `assets/source/speclite/**` 与 active public docs；`docs/legacy/**` 若 include 则分类为 legacy，否则在 exclusions 逐项说明；tests/fixtures 是否进入 completeness denominator 必须在 kickoff 固定；installed mirrors、generated snapshots、`node_modules/` 与 caches 默认排除，除非它们是 current canonical contract 的唯一 evidence。
- Raw identity 除 HEAD commit/tree 外，还必须记录 dirty-worktree diff identity、normalized scan command（或 hash）与 raw match artifact hash，避免漏掉未提交 canonical changes。

## Previous Story Intelligence（前序 Story 情报）

- 11.8 必须先独立消除/分类两个 old IDs 与 old path；11.10 将其结果当 baseline，而非补做 11.8。
- 11.9 CR root normalization 与本 inventory 无直接写入交集；不得借 broad matches 改 CR files。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.9 `done` + completion Gates；11.8 evidence 必须包含 new IDs/root/mapping 与 bounded exact scan。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-10-inventory-all-grill-related-skill-references-for-human-confirmation-story-kickoff-gate.md`。
- 完成只依赖 broad scan 100% reconciliation、分类/关系/parity 与 human-confirmation handoff，不依赖未来治理 Story。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| `FR66a` full read-only inventory | scope + raw scan identity | `FAIL_CONTRACT` |
| match-to-entry completeness | reconciliation `unmapped=0` | `FAIL_EVIDENCE` |
| ZH/EN + relationship model | parity/relationship summaries | `FAIL_EVIDENCE` |
| 11.8 regression separation | classified exact-old subset | `FAIL_FUNCTION` |
| read-only boundary | canonical before/after tree identity | `FAIL_CONTRACT` |

## Equivalent Implementation Policy（等价实现策略）

- Scanner/deduper/report generator 可替换；不得降低 corpus coverage、line-level traceability、ZH/EN separation、100% mapping、read-only boundary、regression split 或 human-confirmation gate。

## Files To Modify（预计文件范围）

### Allowed Writes（允许写入）

- 本 Story file 的 `Grill Reference Inventory` 与 evidence sections。
- Story 11.10 flow-gate / runner records；必要的 `sprint-status.yaml` 状态更新。

### Read-only Scan Surface（只读扫描面）

- `assets/source/speclite/**`、active canonical docs、metadata/help/registry/contracts、scripts/hooks/tests 中的 grill-related references。

### Forbidden Writes（禁止写入）

- 任何被盘点的 Skill/package/document/test definition；Story 11.8 files；任何自动 rename/delete/rewrite。

## Grill Reference Inventory（Grill 引用清单）

> 实施阶段在 Story 11.8 完成后的 current tree 上填写。当前为空是有意为之；create-story 不得预先声称 inventory complete。

### Scan Metadata（扫描元数据）

- Git commit/tree identity：待实施填写。
- Commands / scope / exclusions：待实施填写。
- Raw / deduplicated / classification counts：待实施填写。

### Inventory Entries（清单条目）

- 待实施按 machine match 逐条填写；不得抽样或合并 ZH/EN。

### Relationship And Parity Summary（关系与双语一致性摘要）

- 待实施填写。

### High-risk / Ambiguous / Human Confirmation（高风险、歧义与人工确认）

- 待实施先区分 Story 11.8 regression 与 future governance candidates，再请求人工确认。

## References（参考资料）

- [Source: Epic 11 Story 11.10]
- [Source: PRD FR66a]
- [Source: Story 11.8 bounded rename/routing contract]
- [Source: `assets/source/speclite/` canonical source root]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未执行 inventory；空清单不代表无 matches，也不代表用户确认。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-10-inventory-all-grill-related-skill-references-for-human-confirmation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）
- Scan identity / 100% reconciliation / read-only diff / handoff / gates：待实际执行填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 broad read-only grill inventory、100% reconciliation 与 human confirmation 上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
