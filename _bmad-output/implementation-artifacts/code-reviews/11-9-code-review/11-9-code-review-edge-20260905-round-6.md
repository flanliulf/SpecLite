---
schemaVersion: "speclite.code-review.layer.v1"
storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id"
round: 6
layer: "edge"
result: "FAIL"
generatedAt: "2026-09-04T22:30:03.000Z"
sourceSkill: "bmad-review-edge-case-hunter"
headSha: "ff7528d3f9ec34072bb669ee79f7569345c23d47"
---

# Story 11.9 Code Review Edge Hunter（边界路径审查）

## Verdict（结论）

`FAIL`。发现 `2` 项 P1；Round 5 已确认的 `supersededIndex` 连续性缺口维持 `1` 项 deferred P2，不升级、不混入当前 patch。Round 5 Fixer 的六项授权修复主体均已落地，focused test 为 `47 passed / 4 todo`；但 role-specific terminal parser 仍把 YAML/Markdown 内的非状态文本当成真实 tracker 终态，且 `trackerChangeSet` parser 没有把结构限定在 finalizer frontmatter。Findings 仅限 Story 11.9；不涉及 Story 11.10、external drawer、workspace mirrors、fixed-count baseline、report basename、CR producer/supersession algorithm、approval policy、build、full suite或 packaging。

## P1 Findings（P1 发现）

### P1-1 — Terminal parser 把 block scalar 与 fenced example 内文本认证为真实终态

- **Location**：`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs:662-670`；`test/code-review-contract.test.ts:990-1022`
- **Trigger condition**：sprint/workflow YAML 只在 block scalar 内容中出现缩进的 exact tracker key，或 Story Markdown 只在 fenced code block 中出现 `Status: done`。
- **Unhandled path**：`trackerHasExactTerminalState()` 对整份文件逐行执行 context-free regex。它会拒绝 tracker key 自身的 `key: |` / `key: >`，却不跟踪其他 YAML key 已开启的 block scalar；Story role 也不跟踪 Markdown fence。只读函数探针对 `notes: |\n  {storyKey}: done` 与 `````yaml\nStatus: done\n``` `` 均返回 `true`。Round 5 的 `non-scalar` fixture只覆盖 tracker key自身取值为 `|`，没有覆盖 key位于另一 block scalar内部；没有 fenced Markdown反例。
- **Consequence**：只要 finalizer hash与该损坏/示例型 tracker bytes一致，resolver即可把并未真实进入终态的 Story、sprint或workflow认证为 authentic `DONE`，completed legacy随后被当成可开启 canonical new run。
- **Guard sketch**：按 role 解析结构上下文；YAML 只接受实际 mapping entry并排除任何 block scalar内容，Story只接受 frontmatter/owning status位置且排除 fenced code；继续要求 exact key、唯一 scalar与 frozen terminal value。

### P1-2 — `trackerChangeSet` 移出 frontmatter 后仍可认证 DONE

- **Location**：`resolve-cr-directory.mjs:409-420,570-623`；`test/code-review-contract.test.ts:1024-1051,2106-2161`
- **Trigger condition**：finalizer frontmatter保留其他合法 identity/result字段，但完全删除 `trackerChangeSet`，随后在 closing `---` 后的 Markdown body放入同样两/三项 change-set。
- **Unhandled path**：artifact identity由 `parseLeadingFrontmatter()`验证，但 `validTrackerChangeSet()`随后对完整 `content` 使用 multiline `^trackerChangeSet:` 搜索，没有限制 match必须位于 leading frontmatter，也没有要求 parsed frontmatter实际拥有该结构。只读完整 resolver探针把合法 change-set仅放在body，仍返回 `ok=true / compatibilityMode=canonical`，将 completed legacy认证成功。现有 exact/unique schema mutations全部在原 frontmatter block内改字段，未穿过该边界。
- **Consequence**：缺失规范 frontmatter tracker evidence 的 finalizer可借正文示例或伪造 block通过 authenticity gate，CR06 tracker mutation无法由冻结 schema唯一重建。
- **Guard sketch**：从 leading frontmatter的受界字节内解析 `trackerChangeSet`，并要求该字段恰一次、结构化items恰为expected roles；正文同名block必须完全不参与认证。

## P2 Findings（P2 发现）

### P2-1 — `supersededIndex` identity/continuity 继续维持 deferred

- **Location**：`resolve-cr-directory.mjs:380-389,266,292-332`；`assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/references/cr-contract.md:113-120`
- **Trigger condition**：同 family/round 的历史副本重复使用 `-superseded-1.md`，或首个副本直接从 `-superseded-2.md` 开始，且均绑定合法 current basename。
- **Unhandled path**：classifier仍解析但丢弃 `supersededIndex`；historical validation只核对 family/round与 `supersededBy`，不验证 ordinal从 1 开始、唯一且连续。
- **Consequence**：replacement历史顺序不能唯一审计，但不改变 current artifact消费、canonical write target或本轮安全主路径。
- **Disposition**：严格维持 Round 5 Evaluator 的 deferred P2/CR05 策略；不得在本轮 P1 Fixer 中实现，也不得借此扩展 producer retry/supersession algorithm。

## Closed Boundaries（已关闭边界）

- 真实缩进 sprint/workflow YAML 的普通 mapping entry、comment、key自身 `|`/`>`、duplicate、missing与non-terminal主路径已有回归；本轮 `P1-1` 仅是嵌入 block/fence 的 context边界。
- malformed current round delimiter、current round set `1..N`连续性、tracker item字段 exact/unique/order、unsafe first/middle/last完整 `roundEvidence` 均已关闭；未复现 Round 5对应finding。
- bounded title/name/slug/filename × placeholder/shell/template/JS/array/config detector与classified ledger当前通过；全库只读候选查询未发现新的 active title-bearing producer，未扩大到 Story 11.10 generic inventory。
- current completion gate `generatedAt=2026-09-04T22:25:23.000Z` 晚于 Round 5 Fixer source/test mutation及本轮 affected evidence，当前 freshness主张成立。由于 finalizer要求 `gateTime >= latest evaluationTime`，outer owner仍必须在未来 latest PASS evaluator之后再生 gate；这属于既定顺序义务，不作为本轮新增 finding。

## Verification And Boundary（核证与边界）

- `npx vitest run test/code-review-contract.test.ts --reporter=dot`：`47 passed / 4 todo`。
- 只读 private-function probe：YAML block scalar内部的 `${storyKey}: done` 与 Story fenced code内部的 `Status: done` 均返回 `true`。
- 只读完整 resolver probe：将 authentic finalizer的 `trackerChangeSet`仅置于 closing frontmatter之后，返回 `ok=true / compatibilityMode=canonical`；临时目录已清理。
- live tracker仍为 Story 11.9=`review`；Round 1–5 layer/summary/evaluation链均存在，Round 5 Fix Summary仅授权并完成六项P1 patch。
- 未运行 build、full suite、packaging或 canonical governance；未读取/修改 Story 11.10或 external drawer。
- 本层除创建本报告外未修改 source、tests、fixtures、Story、tracker、completion gate、root goal records或既有 CR artifacts。

## Edge JSON（边界结果）

```json
[
  {"location":"resolve-cr-directory.mjs:662-670","trigger_condition":"Terminal text appears only inside YAML block or Markdown fence","guard_snippet":"parse role structure and ignore block scalar or fenced content","potential_consequence":"Non-terminal trackers authenticate completed legacy"},
  {"location":"resolve-cr-directory.mjs:570-623","trigger_condition":"Tracker change set exists only after closing frontmatter","guard_snippet":"parse trackerChangeSet only from bounded leading frontmatter bytes","potential_consequence":"Body examples authenticate finalizer DONE"},
  {"location":"resolve-cr-directory.mjs:380-389","trigger_condition":"Superseded history repeats or skips its ordinal index","guard_snippet":"defer unique consecutive supersededIndex validation to tracked TODO","potential_consequence":"Replacement history remains ambiguously ordered"}
]
```

## Exclusions（明确排除）

- 未审查或建议修改 Story 11.10 generic inventory。
- 未扫描或纳入 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 及 zip。
- 未运行 `npm run build`、full suite、packaging或 canonical governance。
- 未建议修改 report basenames、CR producer/supersession algorithm、round numbering、approval/confirmation policy或 dependencies。
