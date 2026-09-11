# Blind Hunter Review（盲审报告）

- `modelUsed`: `OpenAI GPT-5.6 Sol (high)`
- `inputSha256`: `2d34d3d44fd7b48a18ed58dfbc831459be274fdaf0d5b99ea69abe4fd4b77834`
- `completedAtUtc`: `2026-09-07T13:07:02Z`
- `findingCount`: `2`
- `inputMode`: `scoped-diff-only`

## Findings（发现）

### B1-01 — tracker `afterHash` 使用规范化 hash，无法证明 whole-file 字节未变

- `severity`: `blocking`
- `category`: `integrity.tracker-after-hash-exactness`
- `invariant`: finalizer 对 required tracker 的 `afterHash` 必须校验当前文件的 exact whole-file bytes；任何写后字节变化都必须使历史 `DONE` 认证失败。
- `concrete_failure_scenario`: finalizer 写入时 Story tracker 为 `Status: done\n`，并记录该内容的 `afterHash`；随后文件仅被改成 `Status: done\n\n`（或只发生 CRLF/LF、NFC/NFD 差异）。当前实现对两份内容先执行 NFC、换行归一化和 `trimEnd()`，得到相同 hash；`trackerHasExactTerminalState` 仍读到唯一 `Status: done`，因此 resolver 会把已经发生写后变更的 tracker 错误认证为与 finalizer 一致，并可能把 legacy run 判为 completed、转而启动 canonical 新 run。
- `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` — `canonicalizedHash()` 与 `validTrackerChangeSet()` 的 `afterHash` 比较。
- `first_hand_diff_evidence`:

  ```js
  function canonicalizedHash(content) {
    const normalized = content.normalize("NFC").replace(/\r\n?/gu, "\n").trimEnd();
    return `sha256:${createHash("sha256").update(normalized, "utf8").digest("hex")}`;
  }
  ```

  ```js
  if (!current.ok
    || canonicalizedHash(current.content) !== values.afterHash
    || !trackerHasExactTerminalState(...)) return false;
  ```

### B1-02 — YAML tracker 扫描器会接受缺少 document-start 的 directive 文档

- `severity`: `blocking`
- `category`: `authority.yaml-tracker-parseability`
- `invariant`: sprint/workflow tracker 只有在 YAML 结构可解析时，唯一 exact key scalar 才能作为 terminal-state authority；parser-invalid YAML 必须 fail-close。
- `concrete_failure_scenario`: workflow tracker 内容为 `%YAML 1.2\nimplementation: done\n`。YAML directive 后缺少必需的 document-start marker `---`，所以该文档不可作为可解析 tracker；但 `trackerLinesOutsideYamlBlockScalars()` 对 `%YAML 1.2` 不建立任何 rejected/ambiguous 状态，仍把下一行放入 `visible`。随后 `trackerHasExactTerminalState()` 匹配到唯一 `implementation: done` 并返回 `true`；只要 finalizer 的 `afterHash` 与该文件匹配，resolver 就会错误接受无效 YAML 中的 terminal authority，并把 `DONE` 当作真实完成证据。
- `primary_location`: `assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs` — `trackerLinesOutsideYamlBlockScalars()` / `trackerHasExactTerminalState()`。
- `first_hand_diff_evidence`:

  ```js
  const matches = role === "story"
    ? trackerLinesOutsideMarkdownFences(content).map((line) => line.match(candidatePattern)).filter(Boolean)
    : trackerLinesOutsideYamlBlockScalars(content).map((line) => line.match(candidatePattern)).filter(Boolean);
  if (matches.length !== 1) return false;
  ```

  `trackerLinesOutsideYamlBlockScalars()` 的循环只对 block、quote、flow、plain scalar、explicit key 与 node property 维护状态；diff 中没有识别或拒绝 `%YAML` / `%TAG` directive 及其必需 document-start binding 的分支，最终在无这些状态时直接返回 `visible`。

## Conclusion（结论）

本轮存在 `2` 项有具体失败场景与第一手 diff 证据的 blocking findings。未设置最低 finding 数；若不存在实质问题，零 finding 同样是合法结果。
