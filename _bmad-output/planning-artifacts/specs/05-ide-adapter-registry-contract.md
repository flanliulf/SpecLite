# IDE Adapter Registry Contract（IDE 适配器注册表契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 MVP IDE adapter registry 的 canonical contract。

- PRD 负责 product requirement 和 acceptance intent。
- Architecture 负责 implementation mapping 和 module responsibility。
- 本 SPEC 负责 adapter ids、target ids、adapter capability fields、target ordering、status semantics 和 command pointer extension boundaries。
- `docs/specs/04-manifest-index-contract.md` 负责消费 adapter registry data 的 installed manifest/index projections。
- 如果 PRD 或 Architecture 文本与本 SPEC 冲突，adapter registry behavior 以本 SPEC 为准。

## MVP Targets（MVP 目标）

MVP target ids 是 physical execution targets，不是 branded IDE claims：

1. `claude`：`.claude/skills`
2. `agents`：`.agents/skills`

当 GitHub Copilot 和 Cursor 支持 `.agents/skills` 时，可以使用 `agents` target。除非存在 dedicated adapter，否则 MVP 不得虚构 `copilot` 或 `cursor` target ids。

Canonical target order 是：

```ts
const CANONICAL_TARGET_ORDER = ["claude", "agents"] as const;
```

Manifest generation、command JSON `ideTargets`、validation `checkedTargets`、phase coverage rows 和 fixture snapshots 必须使用此顺序。它们不得使用 glob order、filesystem order、user selection order 或 async adapter completion order。

## Adapter Definition Shape（适配器定义形状）

MVP adapter registry entries 必须包含：

```ts
type IdeAdapterDefinition = {
  id: "claude" | "agents";
  targetDirectory: ".claude/skills" | ".agents/skills";
  entryType: "self-contained-skill";
  supportedActivationTargets: string[];
  sharedTargetPolicy: "dedupe-by-canonical-skill-id";
  commandPointerBehavior: "none" | "unsupported";
  knownLimitations: string[];
  validationChecks: string[];
  targetOrder: number;
};
```

`commandPointerBehavior` 仅是 extension placeholder。MVP 不得生成 command pointer artifacts。

Adapter definitions 不得重命名 canonical skill ids、canonical skill package directories 或 customization lookup keys。

## Status Semantics（状态语义）

Target status vocabulary 按 layer 区分：

| Layer（层） | Values（取值） | Meaning（含义） |
| --- | --- | --- |
| Install planning | `planned`, `unsupported`, `failed` | adapter 是否可以参与 planned writes。 |
| Installed phase coverage | `mapped`, `unsupported`, `failed` | installed phase entry 是否可通过 target 可见。 |
| Status summary | `not-configured`, `configured`, `partial`, `failed` | installed target 的 health summary。 |

这些 vocabularies 不得跨 layer 复用。

`unsupported` 表示 adapter 声明了 capability gap。它不是 write failure。

`failed` 表示 target directory resolution、schema generation、write 或 reverse validation step 已尝试或已计划但失败。

如果用户显式选择某个 target，而该 target 对 requested module set 不支持，install planning 必须产生 blocking error。如果 target 是 optional 或未被选择，则 unsupported 可以按 `docs/specs/07-validation-issue-taxonomy.md` 报告为 warning、info 或 known limitation。

## Adapter Responsibilities（适配器职责）

Adapter 可以：

- resolve its target directory
- 将 canonical skill packages 映射为 self-contained target entries
- 生成 target-specific discovery metadata
- 报告声明的 capability gaps
- 为 generated entries 提供 reverse validation checks

Adapter 不得：

- 修改 canonical skill package content
- 实现 config/customization merge logic
- 决定 source trust
- 独立计算 files-index ownership
- 在 MVP 中生成 command pointer artifacts
- 为只消费 `.agents/skills` 的 IDE 创建 branded target ids

## Fixture Policy（Fixture 策略）

Adapter changes 必须更新覆盖以下内容的 fixtures：

- canonical target ordering
- generated target directory paths
- target status mapping
- unsupported target behavior
- duplicate canonical skill id handling
- mapped self-contained skill entries 的 reverse validation
- targets 之间的 canonical package hash stability

`fresh-install-empty-project`、`ide-drift` 和 `path-portability` 是 adapter behavior 的 release gate fixtures。
