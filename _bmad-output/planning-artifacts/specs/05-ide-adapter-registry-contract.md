# IDE Adapter Registry Contract（IDE 适配器注册表契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 MVP IDE adapter registry 的 canonical contract。

- PRD 负责 product requirement 和 acceptance intent。
- Architecture 负责 implementation mapping 和 module responsibility。
- 本 SPEC 负责 adapter ids、target ids、adapter capability fields、target ordering、status semantics 和 command pointer extension boundaries。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 负责消费 adapter registry data 的 installed manifest/index projections。
- 如果 PRD 或 Architecture 文本与本 SPEC 冲突，adapter registry behavior 以本 SPEC 为准。

## Implementation Anchor（实现锚点）

Implementation 必须提供 `src/ide/adapter-registry.ts` 作为 adapter ids、target ids、capability fields、target ordering 和 target status mapping 的 executable registry/schema anchor。该 module 不是第二份契约真源；若它与本 SPEC 冲突，以本 SPEC 为准。

## MVP Targets（MVP 目标）

MVP target ids 是 physical execution targets，不是 branded IDE claims：

1. `claude`：`.claude/skills`
2. `agents`：`.agents/skills`

当 GitHub Copilot 和 Cursor 支持 `.agents/skills` 时，可以使用 `agents` target。除非存在 dedicated adapter，否则 MVP 不得虚构 `copilot` 或 `cursor` target ids。

Human-readable output 和 docs 必须把 `agents` 显示为 agents directory target 或 `.agents/skills` target，不得把它渲染成 Copilot/Cursor readiness、health 或 dedicated adapter 状态。只有 future dedicated adapter 存在，并且本 SPEC 先更新 target id、status 和 fixture rules 后，才可以输出 branded Copilot/Cursor target id 或 branded readiness。

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

## Self-Contained Skill Entry Layout（自包含 Skill Entry 布局）

MVP self-contained skill entry 必须使用 canonical skill id 作为 target directory basename：

- `.claude/skills/<canonicalSkillId>/`
- `.agents/skills/<canonicalSkillId>/`

每个 installed entry 必须至少包含 `SKILL.md`。当 canonical source package 中存在以下路径时，adapter 必须按相同 relative path 复制到 installed entry：

- `CHANGELOG.md`
- `references/`
- `assets/`
- `scripts/`
- `config.toml.example`
- `customize.toml`

这些 copied files 属于 canonical package content，必须参与 canonical package hash 或 file-level hash。Adapter-specific discovery metadata、wrapper files 或 capability catalog entries 必须作为 adapter artifacts 单独记录，不得混入 canonical package hash。若某个 IDE 要求 entry-local wrapper 或 metadata，adapter 必须在 manifest/index 中把它标为 adapter artifact，并为其记录独立 file hash 与 ownership。

Installed entry 不得读取 source checkout 中的 skill files 作为运行时依赖。Fixture reverse validation 必须证明 installed entry 在离开 source checkout 后仍能被目标 IDE discovery path 发现，并能通过 `speclite resolve` 读取项目级 config/customization。

## Hook Projection Boundary（Hook 投射边界）

Project-level hook config 是 adapter artifact，不是 self-contained skill package content。Adapter 可以为 selected execution targets 生成 hook projection，但不得把 hook runner、hook manifest 或 platform hook config 放进 `.claude/skills/<canonicalSkillId>/` 或 `.agents/skills/<canonicalSkillId>/`，也不得让这些文件参与 canonical skill package hash。

Hook projection 的 source truth 必须来自独立 canonical hook source root，例如 `assets/source/speclite/hooks/flow-gate-enforcement/`。`speclite-dev-story` 只能声明自己受 Flow Gate hook 保护，不能携带 hook source 或重新定义 hook identity。

Claude project hook config 使用 `.claude/settings.json`。Codex project hook config 使用 `.codex/hooks.json` 或未来契约化的 `.codex/config.toml` `[hooks]` 形式。Codex project-local hooks 受 `/hooks` review/trust 边界约束；install summary 或文档必须明确提醒用户 review/trust 后才可依赖 enforcement。

已有 `.claude` 或 `.codex` config 必须被视为 protected project configuration。Installer 可以 safe merge，也可以输出 manual action；不得静默覆盖用户已有 hooks、rules、settings 或 trust decisions。

## Status Semantics（状态语义）

Target status vocabulary 按 layer 区分：

| Layer（层） | Values（取值） | Meaning（含义） |
| --- | --- | --- |
| Install planning | `planned`, `unsupported`, `failed` | adapter 是否可以参与 planned writes。 |
| Installed phase coverage | `mapped`, `unsupported`, `failed` | installed phase entry 是否可通过 target 可见。 |
| Status summary | `not-configured`, `configured`, `partial`, `failed` | installed target 的 health summary。 |

同名 literal 可以出现在不同 layer，但必须由 layer-scoped type 解释：`InstallPlanningTargetStatus`、`InstalledPhaseCoverageStatus`、`StatusSummaryTargetHealth`。不得把某一层的 `unsupported` 或 `failed` 直接当作另一层语义。

`unsupported` 表示 adapter 声明了 capability gap。它不是 write failure。

`failed` 表示 target directory resolution、schema generation、write 或 reverse validation step 已尝试或已计划但失败。

如果用户显式选择某个 target，而该 target 对 requested module set 不支持，install planning 必须产生 blocking error。如果 target 是 optional 或未被选择，则 unsupported 可以按 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 报告为 warning、info 或 known limitation。

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
