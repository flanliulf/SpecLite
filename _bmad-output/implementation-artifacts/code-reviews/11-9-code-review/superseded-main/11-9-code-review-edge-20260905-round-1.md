---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 1
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T20:19:57.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `7` 项 P1、`0` 项 P2。所有修复路径均可由 Story 11.9 与 shared CR contract 唯一确定，`Owner Gate: NONE`。

## P1 Findings（P1 发现）

### P1-1 — 无 current-series round evidence 的 legacy 目录被当作 unfinished run 原位续写

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:182-204`、`:84-118`
- **Trigger condition**：唯一 title-bearing legacy 目录为空、只含无关文件，或只含其他 `reviewSeries` 的 artifacts。
- **Unhandled path**：`inspectCandidate` 在没有任何 requested-series round 时返回 `maxRound=null`、`completed=false`；上层直接把 `!completed` 等同 `unfinished`。因此“没有可绑定 evidence”和“存在未完成 current run”无法区分。只含已完成 `main` series 的 legacy 目录在请求 `retry` series 时也会被选为 `legacy-resume`。
- **Consequence**：新 run 会写入一个无法证明属于 current series/round 的旧 title 目录，违反 unsafe evidence 必须 stable block 的恢复矩阵。
- **Evidence**：只读临时目录探针中，空 `11-9-old-code-review/` 返回 `ok=true, compatibilityMode=legacy-resume`；只含已完成 `main` finalizer、请求 `reviewSeries=retry` 时也返回同一 legacy resume。
- **Guard sketch**：将 candidate 状态分为 `completed | unfinished | no-current-series-evidence | unsafe`；只有存在唯一、schema/identity 有效的 requested-series unfinished round 才允许 resume，其余按合同 canonical restart 或 ambiguity block。

### P1-2 — 任意 basename 与不完整 frontmatter 可伪造 latest round / DONE

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:185-204`
- **Trigger condition**：legacy 目录含任意以 `-{reviewSeries}-round-{n}.md` 结尾的文件，或含 basename 带 `-cr-finalizer-` 且正文只有 schema/result 的文件。
- **Unhandled path**：`maxRound` 接受所有匹配后缀的 basename，不限定规范 CR artifact family；DONE 判定只验证 `schemaVersion` 和 `result`，不验证 frontmatter `storyId`、`reviewSeries`、`round` 与 filename round 一致，也不拒绝超出 safe integer 的 round。错误或伪造 evidence 可把实际 unfinished legacy 判为 completed。
- **Consequence**：resolver 会切到 canonical directory 开启新 run，把同一未完成轮拆到 legacy 与 canonical 两个目录。
- **Evidence**：只读临时目录探针以 `garbage-main-round-2.md` 加仅含 `schemaVersion/result` 的 `x-cr-finalizer-x-main-round-2.md`，resolver 返回 `compatibilityMode=canonical`，未识别 evidence 身份缺失。
- **Guard sketch**：只接受 shared contract 列举的 canonical artifact basenames；解析完整 v2 frontmatter并严格绑定 normalized story、requested series、filename round、finite safe integer round 与 finalizer result，否则返回 unsafe ambiguity。

### P1-3 — code-review root 缺失时未验证 symlink ancestor，返回的写路径可越出 project root

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:37-47`、`:151-168`、`:222-228`
- **Trigger condition**：`implementationArtifacts` 的已有父级是指向 project 外部的 symlink，而其下 `code-reviews/` 尚不存在；或 `projectRoot` realpath 指向非目录。
- **Unhandled path**：`inspectRoot` 遇到目标 `ENOENT` 立即返回 `missing`，没有解析最近存在 ancestor，也没有验证未来创建路径仍位于 `resolvedProjectRoot`；`realpath(projectRoot)` 也未验证其为 directory。
- **Consequence**：resolver 返回 `ok=true`，下游首次创建 `$crDir` 时可在 project root 外写 artifacts、temp 与 goal records。
- **Evidence**：只读临时目录探针把 `<project>/out` symlink 到外部目录、保持 `out/code-reviews` 缺失，resolver 仍返回 canonical success `out/code-reviews/11-9-code-review`。
- **Guard sketch**：对 missing root 逐级找到最近存在 ancestor，以 no-follow `lstat/realpath` 验证为 project 内 directory；任何 symlink、non-directory 或 escape 返回 `unsafe-code-review-root`。

### P1-4 — filesystem read errors 会抛出非结构化异常而非 stable redacted diagnostic

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:60-68`、`:182-204`、`:239-243`
- **Trigger condition**：`readdir(codeReviewRoot)` 或 `readdir(candidate)` 遭遇权限、I/O、并发删除等非 `ENOENT` 错误。
- **Unhandled path**：两处 `readdir` 没有 catch/classification，CLI 也没有顶层异常转换。Node 会输出含 absolute path/stack 的 stderr，stdout 不再是合同要求的恰一个 JSON，且没有 `cr-directory.ambiguous-resume-root` details/reason。
- **Consequence**：unsafe evidence 虽可能令 caller 停止，却丢失 stable diagnostic、破坏 redaction 与可恢复状态机契约。
- **Guard sketch**：捕获所有 inspection I/O failure，映射为固定 reason 与结构化、project-relative evidence；CLI 顶层始终只输出一个 JSON 且不泄露 raw error/path/stack。

### P1-5 — pre-write zero-mutation 测试只覆盖 resolver 目录快照，未覆盖 runner progress/tracker 顺序

- **Location**：`test/code-review-contract.test.ts:573-623`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner/references/runner-workflow.md:14-20`
- **Trigger condition**：dual/multi/unsafe ambiguity 发生在 runner 已创建 goal records、`.tmp`、更新 Story/sprint tracker 或 progress state 之后。
- **Unhandled path**：测试仅直接调用 read-only resolver，并只 snapshot `code-reviews` root；没有执行 runner preflight，也没有在 root 外布置并断言 Story、sprint tracker、workflow tracker、goal/progress state 零变化。runner 把 resolver 放在写入前目前只有 prose/string 证据。
- **Consequence**：实际 orchestrated ambiguity 仍可能先产生 progress/tracker mutation，completion gate 的“progress mutation 测试为零变化”无法由当前测试复现。
- **Guard sketch**：增加 executable runner/preflight harness，在各 ambiguity/unsafe case 前后对 artifact、goal、temp、Story 与全部 tracker/progress surfaces 做 exact snapshot，断言 resolver failure 后零变化。

### P1-6 — installed projection 只验证 resolver script，未验证 runner 与 CR01–06 消费同一 crDir

- **Location**：`test/code-review-contract.test.ts:625-645`、`:699-752`
- **Trigger condition**：fresh install 投影了 resolver，但遗漏或保留旧版 runner/任一 CR01–06 entrypoint/workflow。
- **Unhandled path**：single propagation 测试只读取 canonical source；fresh-install 测试只比较 resolver bytes/mode 并执行 CLI probe，不读取 installed `.agents` / `.claude` 中 runner、shared contract 与六个 leaf workflow 的 `crDir`/resolver evidence。两组断言没有交集。
- **Consequence**：canonical source 回归为绿时，installed consumer 仍可能重新按 title 推导或不接收 frozen `crDir`，实际用户环境违反 AC4/AC5/AC7。
- **Guard sketch**：对两个 IDE target 逐一比较 runner、contract、CR01–06 changed entrypoint/workflow bytes，并在 installed corpus 重新执行 once-only resolver 与同一 `crDir` propagation assertions。

### P1-7 — active negative scan 的手工文件集与两条模板 regex 会漏掉合同要求的 active surfaces

- **Location**：`test/code-review-contract.test.ts:667-697`
- **Trigger condition**：title-bearing path 以 concrete value、shell/JS concatenation、不同 placeholder spelling 出现在 template、script、hook、fixture、help/metadata 或 public docs。
- **Unhandled path**：scanner 只枚举 shared/runner/CR01–06 的 ZH/EN entrypoint 与一个 workflow reference；未扫描新增 resolver、assets/templates、module help、release metadata、fixtures、hooks/scripts 与 docs。两条 regex 也只识别 `{story...}` 的两种相邻模板形式，不识别 `$story_id-$story_slug`、`${storyId}-${storySlug}`、拼接或 concrete title-bearing path；另一个 guidance 测试只要求出现至少一个 canonical token，不能拒绝并存的旧 active pattern。
- **Consequence**：任一遗漏 surface 可恢复第二套 title-bearing active directory contract，而 focused negative scan 仍通过。
- **Guard sketch**：建立 no-follow deterministic active-corpus inventory，逐命中记录 `{path,line,token,role}`；覆盖 Story 冻结的 scripts/hooks/templates/fixtures/help/metadata/contracts/docs，并仅按明确 legacy fixture/compatibility-doc role allowlist 放行。

## P2 Findings（P2 发现）

无。

## Evidence Boundary（证据边界）

- 已遍历：numeric/traversal、single propagation、legacy-only completed/unfinished/no-evidence/other-series、dual/multi/unsafe ambiguity、pre-write zero mutation、installed projection与 active negative scan。
- 只读辅助验证：直接读取 Story 11.9、completion gate、shared resolver、runner、CR01–06、tests/docs/manifest；使用 OS 临时目录执行四个 resolver 边界探针，临时目录均已清理。
- 未运行：build、full suite、packaging。
- 排除：Story 11.10、`assets/source/speclite/core-skills/speclite-drawer-er-modeler/`、其 zip、workspace mirrors、fixed-count drift 与其他 Story 变更。

## Owner Gate（Owner 门禁）

`NONE`。七项均为已冻结 numeric-only、unsafe-evidence block、single propagation、pre-write zero mutation 与 installed/negative-scan closure 的实现或验证缺口，不需要新增产品或架构裁决。

---

*本文档由 bmad-review-edge-case-hunter Skill 自动生成*
