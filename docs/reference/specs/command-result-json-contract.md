# CommandResult JSON Contract（CommandResult JSON 契约）

> Status: Normative（规范）。本文是 SpecLite 公共 `CommandResult` JSON 行为的规范性说明。

本文规定 `CommandResult` envelope、命令标识、状态与退出码、公共 payload 边界、路径与排序、敏感信息边界以及兼容性策略。面向日常使用的字段速查见 [`../command-result-json.md`](../command-result-json.md)。

## Authority Model（权威模型）

| Artifact | Responsibility |
|---|---|
| 本文 | 公共 JSON 的规范性语义和兼容要求。 |
| `src/diagnostics/command-result-schema.ts` | 唯一 executable schema anchor。 |
| focused tests 与 fixtures | 契约证据和回归保护。 |
| PRD、Architecture、Story | 需求意图、实现映射和变更过程，不复制维护公共契约。 |
| `_bmad-output/planning-artifacts/specs/` | 历史规划来源，不是当前公开契约入口。 |

改变公共 JSON 行为时必须按以下顺序收口：

1. 更新本文。
2. 更新 executable schema 与 producer。
3. 更新 focused tests、fixtures 和消费者 Reference。

如果本文与 executable schema 冲突，变更不能视为完成；必须核对当前实现意图并在同一变更中恢复一致。

## Scope（范围）

以下 command id 使用统一 `CommandResult`：

| Command ID | Typical Invocation |
|---|---|
| `install` | `speclite install --json` |
| `init` | `speclite init --json` |
| `list` | `speclite list --json` |
| `status` | `speclite status --json` |
| `validate` | `speclite validate --json` |
| `update` | `speclite update --json` |
| `update.repair` | `speclite update --repair --json` |
| `doctor` | `speclite doctor --json` |
| `sync` | `speclite sync --json` |
| `uninstall` | `speclite uninstall --json` |
| `governance-report` | `speclite governance-report --json` |

`speclite resolve` 是明确例外：默认 stdout 输出 pure resolve-result JSON，diagnostics 以 `ValidationIssue` 形状的 JSON Lines 写入 stderr。它不使用 `CommandResult` envelope。`resolve config` 输出 raw merged config；`resolve artifact-roots` 使用独立 `speclite.resolve.artifact-roots.v1` payload 暴露 SPEC 09 resolver-backed roots、`resolutionMode` 和 source/provenance evidence；`resolve artifact-documents` 使用 `speclite.resolve.artifact-documents.v1` payload 暴露 governed subject 的 whole/sharded discovery、invocation selection、`consumedPaths` 和 blocking continuation；`resolve cr-directory` 使用 `speclite.resolve.cr-directory.v1` payload 暴露 Story 的唯一 Code Review 目录、`compatibilityMode`、legacy candidates 与 continuation。

## Envelope（顶层结构）

所有 covered commands 必须输出以下顶层结构：

```json
{
  "schemaVersion": "speclite.command-result.v1",
  "status": "success",
  "command": "validate",
  "targetProject": "example-project",
  "summary": "SpecLite validation completed.",
  "issues": [],
  "nextActions": [],
  "data": {}
}
```

| Field | Normative Rule |
|---|---|
| `schemaVersion` | `v1` 固定为 `speclite.command-result.v1`。 |
| `status` | 只能是 `success`、`warning` 或 `failure`。 |
| `command` | 使用上表中的 normalized command id，不使用 raw argv、alias 或带 flags 的字符串。 |
| `targetProject` | 使用 trim 后非空的项目名；缺失时使用 target project directory basename，不输出 absolute path。 |
| `summary` | 稳定的人类可读短句；automation 不得解析其文案。 |
| `issues` | `ValidationIssue[]`，表达 machine-readable diagnostics。 |
| `nextActions` | 给人和 agent 的后续动作，不作为稳定状态机。 |
| `data` | command-specific public payload，必须通过 executable schema 校验。 |

顶层不得增加 timestamp、absolute checkout path、stack trace、credential-bearing URL、随机 id 或只服务单个 renderer 的字段。

## Status and Exit Code（状态与退出码）

状态按以下规则推导：

- command 无法完成，或存在 `error` / `critical` issue：`failure`。
- command 完成，且最高 severity 为 `warning`：`warning`。
- command 完成，且没有 `warning` / `error` / `critical` issue：`success`。
- `update` 或 `update.repair` 只要存在 path-level conflict，就必须返回 `failure`，即使当前是 dry-run 或尚未授权写入。

退出码必须与状态一致：

| Status | Exit Code |
|---|---|
| `success` | `0` |
| `warning` | `0` |
| `failure` | non-zero |

`status.data.highLevelHealth` 描述安装健康摘要，与本次 command 的 `status` 相互独立。`not-configured` 是正常可诊断状态，不自动表示命令失败。

## Issue Contract（问题契约）

每个 `ValidationIssue` 必须包含稳定的 `issueId`、`category`、`severity`、`impact` 和 `suggestedNextStep`，并可以包含 `affectedPath`、`component` 与结构化 `details`。

- `issueId` 使用 `<category>.<stable-code>`。
- 动态 path、hash、count 或 target context 不得进入 `issueId`。
- `details` 必须可 JSON 序列化、确定性且可脱敏。
- `impact` 与 `suggestedNextStep` 使用稳定短句，不包含 timestamp、absolute path 或 stack trace。
- `affectedPath` 遵守 project-relative POSIX path 规则。

完整 category、severity 与 issue id 由 executable schema、`src/validation/issue-model.ts` 和 focused tests共同约束；公共 Reference 不得自行发明新的 issue 语义。

## Data Boundaries（数据边界）

`data` 只暴露外部消费者需要的公共投影，不直接序列化内部 domain object。当前公共 payload 族包括：

- install、init、update、repair、sync 与 uninstall 的 plan/apply、授权、冲突和变更路径信息；
- list 的 module、Skill、IDE target、version 和 installed-state 投影；
- status 的 lightweight installed-state 与 `highLevelHealth`；
- validate 与 doctor 的 issue counts、checked categories、targets 和 paths；
- governance-report 的本地治理 evidence 与 metrics。

内部 model 可以比公共投影更丰富，但新增公共字段必须先进入本文和 executable schema。所有 write-capable commands 必须区分 planned actions、write authorization 和实际 mutation results。

## Path, Order and Redaction（路径、排序与脱敏）

- 公共 path 使用 project-relative POSIX form；目标项目根使用 `"."`。
- 所有公共 arrays 必须有确定性顺序；不得依赖 filesystem traversal、异步完成或对象插入顺序。
- `issues` 按 severity、category、normalized affected path 和 issue id 的稳定顺序输出。
- `nextActions` 按 blocking remediation、recommended next step、optional exploration 的优先级输出，不按字母序重排。
- public JSON 默认不包含 timestamp；明确属于 generated metadata 的 timestamp 也不得成为 fixture 的稳定比较字段。
- 不得输出 home directory、absolute checkout root、credential、raw private source URL、stack trace 或原始异常对象。

## Compatibility（兼容性）

`speclite.command-result.v1` 只允许 backward-compatible additive changes，例如增加 optional field 或消费者可以忽略的新 issue id。

以下变化必须升级 schema version：

- 删除或重命名字段；
- 改变既有字段语义或类型；
- 收窄 enum；
- 增加新的必填字段。

Producer 必须只输出当前 schema 接受的值；外部 consumer 应忽略未知 optional fields，并容忍未来新增的稳定 reason code 或 issue id。

## Verification（验证）

修改本契约或相关实现后至少运行：

```sh
npm run docs:check
npx vitest run test/docs-reference-cli-options.test.ts
npx vitest run test/contract-anchors.test.ts
```

如果 focused test 文件发生调整，应选择覆盖 `src/diagnostics/command-result-schema.ts`、producer 和 fixtures 的等价测试，不得仅以 Markdown 链接检查替代契约测试。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 消费者快速参考 | [`../command-result-json.md`](../command-result-json.md) |
| CLI 参数参考 | [`../cli.md`](../cli.md) |
| Human output 边界 | [`../cli-human-output-matrix.md`](../cli-human-output-matrix.md) |
| 文档目录治理 | [`../../README.md`](../../README.md) |
