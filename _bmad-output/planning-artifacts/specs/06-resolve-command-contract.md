# Resolve Command Contract（解析命令契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 `speclite resolve config` 和 `speclite resolve customization` 的 canonical contract。

- PRD 负责 product requirement 和 acceptance intent。
- Architecture 负责 implementation mapping 和 module responsibility。
- 本 SPEC 负责 resolve command behavior、config/customization merge semantics、stdout/stderr shape、fallback rules 和 parity fixture requirements。
- `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 负责 `CommandResult`；`resolve` 是显式例外，必须不使用 `CommandResult` envelope。
- 如果 PRD、Architecture 或 ADR 文本与本 SPEC 冲突，resolve behavior 以本 SPEC 为准。

## Implementation Anchor（实现锚点）

Implementation 必须提供 `src/config/resolve-output-schema.ts` 作为 resolve stdout JSON、stderr JSON Lines diagnostic 和 merge-result parser 的 executable schema/parser anchor。该 module 不是第二份契约真源；若它与本 SPEC 冲突，以本 SPEC 为准。

## Scope（范围）

Covered commands：

- `speclite resolve config`
- `speclite resolve customization`

`resolve` 是 installed skills 的 runtime support command。它不是 primary user journey command，也不应在 MVP 中作为 primary user journey 进行宣传。

## Output Contract（输出契约）

stdout 必须只包含 resolved JSON object。

stderr 必须以 JSON Lines 输出 diagnostics：

- 每行一个 JSON object
- 每行使用 `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` 中的 `ValidationIssue` shape
- machine mode 中不得混入 human-readable prose

Exit code rules：

- parsing 成功且不存在 error/critical diagnostics：exit code 0
- parsing 成功且只有 warning diagnostics：exit code 0
- required layer read 或 parse failure：non-zero
- error 或 critical diagnostic：non-zero

Resolve result JSON formatting preference：

- 2-space indentation
- trailing newline
- non-ASCII characters 不转义

Parity fixtures 必须比较 JSON semantics，而不是逐字节比较 stdout text。

## Key Selection（Key 选择）

`--key` 接受 dotted key strings。

Default missing-key behavior：

- missing key 不是 failure
- stdout 为 `{}`
- exit code 为 0
- stderr 为空

允许重复使用 `--key`。Output object 必须使用原始 dotted key string 作为 field name。Existing keys 会被包含；missing keys 会被省略。

Strict missing-key validation 是 Post-MVP，除非未来通过显式 flag 引入。它不得改变 default behavior。

## Project Root Resolution（项目根解析）

`speclite resolve config` 必须要求显式 `--project-root`。

`speclite resolve customization` 必须支持显式 `--project-root`。Installed skill instructions 应显式传入它。

为了 Python resolver parity，当省略 `--project-root` 时，`resolve customization` 可以 fallback：

1. 从 skill directory 向上搜索 `_speclite` 或 `.git`
2. 如果未找到，则从 cwd 向上搜索 `_speclite` 或 `.git`

Fallback 是 compatibility behavior，不是推荐的 installed skill contract。

## Config Merge（配置合并）

`speclite resolve config` merge order：

1. installer-owned `_speclite/config.toml`
2. installer-owned `_speclite/config.user.toml`
3. human-owned `_speclite/custom/config.toml`
4. human-owned `_speclite/custom/config.user.toml`

后面的 layers 覆盖前面的 layers。

`_speclite/config.toml` 是 required。除非未来 schema 明确标记为 required，否则 human-owned custom layers 是 optional。

## Customization Merge（定制化合并）

`speclite resolve customization` merge order：

1. skill `customize.toml`
2. `_speclite/custom/{skill}.toml`
3. `_speclite/custom/{skill}.user.toml`

后面的 layers 覆盖前面的 layers。

`--skill` 必须使用 skill directory basename 作为 customization lookup key。

MVP 不得引入第二个 customization key。如果未来 IDE adapter 需要重命名 canonical skill directory，manifest/index 必须显式记录 customization key，并且本 SPEC 必须先于 implementation 更新。

## Layer Failure Semantics（层失败语义）

Required layer read 或 parse failure 会使命令失败。

Optional layer read 或 parse failure：

- 向 stderr 输出一个 warning diagnostic，格式为一行 `ValidationIssue` JSON
- 将 failed layer 视为 `{}`
- 继续 merge
- 如果不存在 error/critical diagnostics，则 exits 0

Diagnostic `details` 不得包含 absolute paths、home directories、stack traces、environment variables、timestamps、random ids 或 credentials。

## Array Merge Semantics（数组合并语义）

Arrays 遵循 Python resolver parity：

- keyed merge 只在所有 base 和 override elements 都是 tables，且所有元素共享同一个 `code` key 或都共享同一个 `id` key 时适用
- keys 匹配时，override item 替换整个 base item
- 不允许 item-level deep merge
- mixed `code` and `id`、missing keys 或 non-table elements 必须 append，而不是 keyed merge

MVP 没有 deletion mechanism。Overrides 不得通过 `null`、`enabled=false`、`remove`、empty arrays 或任何其他 special field 删除 base items。禁用默认行为必须通过显式 no-op replacement 表达，或由未来 deletion schema 表达。

## Fixture Policy（Fixture 策略）

`resolve-parity` 是 MVP release gate fixture。

它必须覆盖：

- config four-layer merge order
- customization three-layer merge order
- repeated `--key`
- missing key default behavior
- optional layer warning diagnostic
- required layer failure
- keyed array replacement
- append fallback for non-keyed arrays
- non-ASCII JSON output
- explicit `--project-root`
- customization fallback search behavior

Resolve fixtures 以 semantic 方式比较 stdout JSON，并使用 stable `ValidationIssue` fields 将 stderr diagnostics 作为 JSON Lines 比较。
