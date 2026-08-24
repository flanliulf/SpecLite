# Evidence and Traceability（证据与追溯）

## Evidence Status（证据状态）

| 状态 | 含义 | 写作要求 |
|---|---|---|
| `Confirmed` | 有 active owner、源码、契约、测试或运行证据 | 引用 path、版本、commit 或 artifact id |
| `Proposed` | 本技术方案提出的目标设计 | 说明理由、alternative、trade-off 和审批状态 |
| `TBD` | 事实或决策尚未确定 | 记录 owner、due date、影响和关闭条件 |
| `N/A` | 经判断不适用 | 给出可验证理由，不得只写“暂无” |

文档不得把 `Proposed` 写成 Current State，也不得因为附件或历史文档出现某个实现方式就标记 `Confirmed`。

## Anchor Classification（锚点分类）

- `Contract Anchor`：PRD、Architecture、owning SPEC、schema 或明确验收契约规定的义务。
- `Functional Anchor`：系统必须表现出的功能、状态转换或失败行为。
- `Evidence Anchor`：测试、fixture、snapshot、command output、API trace、metric 或运行记录。
- `Guidance Anchor`：Story 建议、历史路径、示例代码或推荐实现形态。

检查顺序固定为 `Contract Anchor -> Functional Anchor -> Evidence Anchor`。`Guidance Anchor` 只帮助定位，不得升级为 hard gate。

具体源码路径、fixture、schema 或 command 只有 owning SPEC 明确要求时才是 hard gate；否则允许 equivalent implementation policy。等价实现必须满足相同 Functional Anchor，并提供可复核 Evidence Anchor。

## Source Baseline（来源基线）

每个来源记录：

| Source | Type | Version / Commit | Status | Used For |
|---|---|---|---|---|

- active index 指向的 shards 应列出实际读取范围。
- archived / superseded artifact 标明历史用途。
- 外部链接记录 owner 和访问日期；无法访问时不得臆测内容。
- 若来源发生变化，文档状态回退为 `Draft`，直到重新执行影响与一致性检查。

## Traceability Matrix（追溯矩阵）

最终文档至少包含：

| Requirement ID | Design Section | Component or Contract | Verification | Status |
|---|---|---|---|---|

- Requirement ID 来自 active PRD、Epic 或用户确认的需求契约。
- Design Section 使用文档稳定 heading 或显式 anchor。
- Component or Contract 指向系统、模块、API、Event、Schema 或运行约束。
- Verification 指向测试类型、验收场景、metric、人工检查或 external evidence。
- Status 使用 `Covered`、`Partial`、`Blocked`；不得用模糊的“基本覆盖”。

## Conflict Register（冲突登记）

| Conflict ID | Sources | Contradiction | Impact | Owning Workflow | Status |
|---|---|---|---|---|---|

本 Skill 不修订冲突来源。PRD 冲突路由 requirements owner，Architecture / SPEC 冲突路由 solutioning owner，Story 冲突路由 Story owner，代码与 contract 不符路由 implementation / correct-course workflow。blocking conflict 未关闭时禁止进入 `Review`。
