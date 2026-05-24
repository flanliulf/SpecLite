# Resolve Command Contract（解析命令契约）

## Status（状态）

Accepted for MVP planning.

## Ownership（所有权）

This SPEC is the canonical contract for `speclite resolve config` and `speclite resolve customization`.

- PRD owns product requirement and acceptance intent.
- Architecture owns implementation mapping and module responsibility.
- This SPEC owns resolve command behavior, config/customization merge semantics, stdout/stderr shape, fallback rules, and parity fixture requirements.
- `docs/specs/01-command-result-json-contract.en.md` owns `CommandResult`; `resolve` is an explicit exception and must not use the `CommandResult` envelope.
- If PRD, Architecture, or ADR text conflicts with this SPEC, this SPEC wins for resolve behavior.

## Scope（范围）

Covered commands:

- `speclite resolve config`
- `speclite resolve customization`

`resolve` is a runtime support command for installed skills. It is not a primary user journey command and should not be marketed as one in MVP.

## Output Contract（输出契约）

stdout must contain only the resolved JSON object.

stderr must contain diagnostics as JSON Lines:

- one JSON object per line
- each line uses the `ValidationIssue` shape from `docs/specs/01-command-result-json-contract.en.md`
- no human-readable prose may be mixed into stderr in machine mode

Exit code rules:

- parsing succeeds and no error/critical diagnostics exist: exit code 0
- parsing succeeds with warning diagnostics only: exit code 0
- required layer read or parse failure: non-zero
- error or critical diagnostic: non-zero

Resolve result JSON formatting preference:

- 2-space indentation
- trailing newline
- non-ASCII characters are not escaped

Parity fixtures must compare JSON semantics, not byte-for-byte stdout text.

## Key Selection（Key 选择）

`--key` accepts dotted key strings.

Default missing-key behavior:

- missing key is not a failure
- stdout is `{}`
- exit code is 0
- stderr is empty

Repeated `--key` is allowed. The output object must use the original dotted key string as the field name. Existing keys are included; missing keys are omitted.

Strict missing-key validation is Post-MVP unless introduced by a future explicit flag. It must not change the default behavior.

## Project Root Resolution（项目根解析）

`speclite resolve config` must require explicit `--project-root`.

`speclite resolve customization` must support explicit `--project-root`. Installed skill instructions should pass it explicitly.

For Python resolver parity, `resolve customization` may fall back when `--project-root` is omitted:

1. search upward from the skill directory for `_speclite` or `.git`
2. if not found, search upward from cwd for `_speclite` or `.git`

Fallback is a compatibility behavior, not the preferred installed skill contract.

## Config Merge（配置合并）

`speclite resolve config` merge order:

1. installer-owned `_speclite/config.toml`
2. installer-owned `_speclite/config.user.toml`
3. human-owned `_speclite/custom/config.toml`
4. human-owned `_speclite/custom/config.user.toml`

Later layers override earlier layers.

`_speclite/config.toml` is required. Human-owned custom layers are optional unless a future schema explicitly marks them required.

## Customization Merge（定制化合并）

`speclite resolve customization` merge order:

1. skill `customize.toml`
2. `_speclite/custom/{skill}.toml`
3. `_speclite/custom/{skill}.user.toml`

Later layers override earlier layers.

`--skill` must use the skill directory basename as the customization lookup key.

MVP must not introduce a second customization key. If a future IDE adapter needs to rename a canonical skill directory, manifest/index must explicitly record the customization key and this SPEC must be updated before implementation.

## Layer Failure Semantics（层失败语义）

Required layer read or parse failure fails the command.

Optional layer read or parse failure:

- emits a warning diagnostic to stderr as one `ValidationIssue` JSON line
- treats the failed layer as `{}`
- continues merging
- exits 0 if no error/critical diagnostics exist

Diagnostic `details` must not contain absolute paths, home directories, stack traces, environment variables, timestamps, random ids, or credentials.

## Array Merge Semantics（数组合并语义）

Arrays follow Python resolver parity:

- keyed merge only applies when all base and override elements are tables and all elements share the same `code` key or all share the same `id` key
- when keys match, the override item replaces the whole base item
- item-level deep merge is not allowed
- mixed `code` and `id`, missing keys, or non-table elements must append instead of keyed merge

MVP has no deletion mechanism. Overrides must not delete base items via `null`, `enabled=false`, `remove`, empty arrays, or any other special field. Disabling a default behavior must be represented by an explicit no-op replacement or a future deletion schema.

## Fixture Policy（Fixture 策略）

`resolve-parity` is an MVP release gate fixture.

It must cover:

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

Resolve fixtures compare stdout JSON semantically and stderr diagnostics as JSON Lines using stable `ValidationIssue` fields.
