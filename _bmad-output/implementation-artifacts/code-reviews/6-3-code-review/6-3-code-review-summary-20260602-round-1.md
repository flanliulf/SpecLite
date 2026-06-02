---
Story: 6-3
Round: 1
Date: 2026-06-02
Model Used: GPT-5.5
Type: Code Review Summary
---

## 审查结论

首轮审查。Agent 子代理工具在当前环境不可用，已按 `bmenhance-cr-01-reviewer` 降级规则执行串行三层审查（Blind Hunter、Edge Case Hunter、Acceptance Auditor 均在当前上下文完成）。`npm run build` 通过，`npm test` 全量通过（36 files / 274 tests），相关聚焦测试通过（5 files / 47 tests）。`package.json` 未定义 `lint` 脚本，因此未执行 `npm run lint`。

结论：不通过。发现 1 个阻塞问题：`resolve-parity` required config layer failure fixture 将 required layer 标成 optional layer，导致 release gate fixture 与 owning SPEC / runtime implementation 的 required-layer failure 语义不一致。

## 新发现

### 1. [中] `resolve-parity` required config layer failure fixture 标错 `layerRole`

- **来源**：edge+auditor
- **分类**：patch

- **证据**
  - `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md:85-95` 定义 `speclite resolve config` 的第一层 `_speclite/config.toml` 是 required，human-owned custom layers 才是 optional。
  - `src/config/config-reader.ts:21-27` 的 runtime implementation 也把 `_speclite/config.toml` 配置为 `required: true`，`role: "required-config"`。
  - `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl:1` 却把同一个 `_speclite/config.toml` required-layer failure 的 diagnostic 写成 `details.layerRole: "optional-config"`。
  - 覆盖缺口使该错误未被测试捕获：`test/fixture-contract.test.ts:257-268` 只 parse JSONL 并做 redaction 检查，`test/resolve-cli.test.ts:89-101` 只断言 required failure 的 `issueId`、`severity`、`affectedPath`，没有将 live stderr 与 `resolve-parity` fixture expected JSONL 做语义一致性比较，也没有断言 `layerRole`。

- **影响**
  - 违反 Story 6.3 AC9 的 required layer failure semantics 和 resolve parity fixture 要求。
  - release gate fixture 会向维护者提供错误的失败分类：required `_speclite/config.toml` 缺失被标为 optional layer，后续 evaluator / release gate / fixture consumer 可能把 blocking failure 当作 optional warning surface 的同类问题处理。
  - 当前全量测试仍然通过，说明测试没有真正锁住 fixture 与 runtime resolver diagnostic 的 parity。

- **建议**
  - 将 `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl` 中的 `details.layerRole` 改为 `"required-config"`。
  - 补一条测试，将 `speclite resolve config --project-root <missing required layer>` 的 stderr JSONL 与 `test/fixtures/resolve-parity/expected/config/required-layer-error.jsonl` 做语义比较，或至少断言 `details.layerRole === "required-config"`。

## 验证摘要

- `npm test` ✅ 通过（36 files / 274 tests）
- `npm run lint` 未执行：`package.json` 未定义 `lint` 脚本
- `npm run build` ✅ 通过
- 定向复核 ✅
  - `npm test -- test/fixture-contract.test.ts test/fixture-release-gates.test.ts test/resolve-cli.test.ts test/resolve-readers.test.ts test/update-planning.test.ts` 通过（5 files / 47 tests）
  - 复核 `resolve-parity` expected stderr JSONL、runtime config reader 和 resolve SPEC，确认 required config layer 的 expected fixture 与 runtime/spec 不一致

## 通过项

- `ide-drift` validate fixture 覆盖 `ide-mirror.hash-mismatch`、deterministic details、Evidence human output 和 no repair payload；测试中读取 validate 前后的 manifest / skill-index / files-index 并断言不变，符合 read-only validate 方向。
- `source-integrity` 10 个 required sub-case 均存在独立 `input/`、`expected/command-json/source-integrity.json`、`expected/issues.json`、`expected/redaction-assertions.json` 和 `README.md`；expected command JSON 可通过 `CommandResult` schema，source descriptor 可通过 schema，redaction assertions 覆盖公开 fixture 文本。
- `resolve-parity` stdout expected 文件保持 pure JSON object，stderr expected 文件保持 JSON Lines `ValidationIssue` shape；本轮仅发现 required config layer role 的语义错标。
- 未发现 Story 6.3 expected outputs 混入 `RepairCommandData`、`update.repair`、`repairPlan` 或 repair action payload；repair execution fixture 未混入 validate/source/resolve fixture。
