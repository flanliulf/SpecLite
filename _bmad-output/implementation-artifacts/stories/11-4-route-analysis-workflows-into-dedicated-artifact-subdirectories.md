# Story 11.4: Route Analysis Workflows Into Dedicated Artifact Subdirectories（将 Analysis Workflows 路由至专属 Artifact 子目录）

Status: ready-for-dev

## Story（故事）

作为使用 SpecLite 的 AI IDE 用户和项目维护者，  
我希望 `1-analysis` workflow artifacts 输出到 `{analysis_artifacts}` 下的专属子目录，  
以便分析产物与 Planning、Project Knowledge、Public Documentation 明确分离。

## Acceptance Criteria（验收标准）

1. Fresh install 预创建 `{analysis_artifacts}/research/`、`{analysis_artifacts}/product-brief/`、`{analysis_artifacts}/prfaq/`。
2. `speclite-domain-research`、`speclite-market-research`、`speclite-technical-research` 统一写 `{analysis_artifacts}/research/`，保留原 basename 规则。
3. `speclite-product-brief` 写入 `{analysis_artifacts}/product-brief/`。
4. `speclite-prfaq` 写入 `{analysis_artifacts}/prfaq/`。
5. 同步所有受影响 ZH/EN Skill、steps/references、help、metadata、artifact contracts、config examples 与治理文档，不遗留冲突 active defaults。
6. Analysis producers 可读取 `{project_knowledge}`，但不得把 research 输出到它；`docs/` 仍是 Public Documentation。
7. Existing install 无 `analysis_artifacts` 时消费 11.1 resolver 与 11.3 compatibility，保持旧 artifacts 原位。
8. Negative corpus scan 必须排除 active `{planning_artifacts}/research/`、Planning-root product brief/PRFAQ 与 `{project_knowledge}` research producer defaults。
9. Focused tests 覆盖 fresh directories、新默认路径、legacy fallback、artifact metadata/default path 与三类空间边界。
10. Scope 仅 `1-analysis`；不处理 Planning、UX、Readiness、CR routing。

## Tasks / Subtasks（任务 / 子任务）

- [ ] 核验 11.1–11.3 completion Gates，并通过 11.4 `story-kickoff`。
- [ ] 先建立 producer/path/metadata/legacy/corpus-scan 失败测试矩阵。
- [ ] 扩展 module/runtime directory plan，加入三个 Analysis 子目录。
- [ ] 更新三类 Research、Product Brief、PRFAQ ZH/EN producer 与 resume/finalization paths，保持现有 basename/stage 行为。
- [ ] 更新 help/metadata/artifact contracts/docs/fixtures 与 consumers；证明 Project Knowledge/Public Docs/Analysis 三 planes 分离。
- [ ] 运行 focused suites、canonical parity/negative scan、build、`git diff --check`，review 前执行 completion Gate。

## Dev Notes（开发备注）

### Current Verified Baseline（当前已验证基线）

- 三个 research workflow-details 当前仍声明 `{planning_artifacts}/research/`。
- Product Brief 的 prompts/finalize/manifest 当前写 Planning root；PRFAQ workflow/stages/manifest 同样未使用专属 Analysis root。
- `module.yaml` / runtime structure 尚未创建三个 Analysis subject directories；manifest interpolation 需支持 `{analysis_artifacts}`。
- `module.yaml` 当前只有旧 Planning/Implementation/DevOps/Project Knowledge fields/directories；新增 Analysis roots 时必须保留 agents、既有 directories 与 deterministic order。
- 现有 output filename、resume/progress、distillate 行为必须保留；只改变 root/subject directory。

### Technical / Architecture / Testing Requirements（技术、架构与测试要求）

- 使用 Story 11.1 shared resolver；不硬编码另一份 fallback/default；不升级依赖、不需 web research。
- 更新 ZH/EN 定义与 package-internal references 时保持语义 parity；不得只改入口文件。
- Legacy fallback 是 read/resolve compatibility，禁止迁移、复制或重写既有 artifacts。
- 测试覆盖 3 directories + 5 producer families、metadata defaultOutputPath、legacy fallback、no-migration、relative POSIX、negative scan。

## Previous Story Intelligence（前序 Story 情报）

- 11.1–11.3 当前均仅为 planned `ready-for-dev`；11.4 kickoff 必须等待它们实际 `done`，并消费 resolver/projection/compatibility 的 current evidence。

## Dependency Gate（依赖门禁）

- Hard predecessors：11.1–11.3 `done` + completion Gate；不得依赖 11.5+。
- Kickoff report：`{implementation_artifacts}/flow-gates/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories-story-kickoff-gate.md`。

## Anchor Contract Map（锚点契约映射）

| Anchor | Evidence | Failure |
| --- | --- | --- |
| `FR23b` / `SPEC 09` Analysis roots | exact producer/path matrix | `FAIL_CONTRACT` |
| Project Knowledge/Public Docs separation | read-vs-write boundary tests | `FAIL_FUNCTION` |
| ZH/EN + metadata parity | corpus reconciliation | `FAIL_EVIDENCE` |
| legacy/no-migration | before/after artifact hashes | `FAIL_EVIDENCE` |

## Equivalent Implementation Policy（等价实现策略）

- Internal helper、test file 或 metadata projection 的拆分可调整；三个 subject directories、五类 producer 路由、原 basename、三 planes 边界、legacy no-migration 与 corpus negative assertions 不可改变。

## Files To Modify（预计文件范围）

- `assets/source/speclite/sdlc-skills/module.yaml`、`src/installer/runtime-structure.ts`、`src/manifest/manifest-generator.ts`。
- 三个 Research package 的 `references/workflow-details.md`：current `{planning_artifacts}/research/` → `{analysis_artifacts}/research/`；保留各 basename、resume 与 ZH/EN semantics。
- Product Brief 的 `references/workflow-details.md`、`references/prompts/contextual-discovery.md`、`references/prompts/draft-and-review.md`、`references/prompts/finalize.md`、`data/speclite-manifest.json`、ZH/EN/config examples：改到 `{analysis_artifacts}/product-brief/`；保留 contextual discovery、main/distillate naming 与 final handoff。
- PRFAQ 的 `references/workflow-details.md`、`references/customer-faq.md`、`references/internal-faq.md`、`references/press-release.md`、`references/verdict.md`、`data/speclite-manifest.json`、ZH/EN/config examples：改到 `{analysis_artifacts}/prfaq/`；保留 customer/internal FAQ、stage/resume/distillate/verdict content behavior。
- `assets/source/speclite/sdlc-skills/module-help.csv`、`docs/reference/skills/sdlc-workflows.md`、`docs/reference/workflow-artifact-layout.md`。

### New Files（新增文件，Guidance）

- `test/analysis-artifact-routing.test.ts` 或等价 suite：覆盖 exact subdirs、五 producer families、basename/resume/stage/distillate preservation、ZH/EN parity、legacy no-migration 与 active scan 100% classification。

## Evidence Plan（证据计划）

- Producer matrix 逐条记录 old literal、新 resolved path、basename 与 resume/finalization behavior。
- Fresh directories + metadata + legacy fallback + three-plane fixtures。
- ZH/EN/package-manifest/help/docs reconciliation 与 active old-default negative scan。

## References（参考资料）

- [Source: Epic 11 Story 11.4]
- [Source: PRD FR23b]
- [Source: `SPEC 09` Analysis routing]
- [Source: `assets/source/speclite/sdlc-skills/1-analysis/`]

## Dev Agent Record（开发代理记录）

### Agent Model Used（使用模型）
待实现 Agent 填写。

### Completion Notes List（完成说明）
- 终极上下文引擎分析已完成 —— 已创建完整开发者指南。
- Story 尚未实现；路径清单与 tests 均为计划。

### File List（文件清单）
- `_bmad-output/implementation-artifacts/stories/11-4-route-analysis-workflows-into-dedicated-artifact-subdirectories.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Anchor Evidence Summary（锚点证据摘要）
- 待实现与 Flow Gates 填写。

## Change Log（变更记录）
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2026-09-02 | 0.1 | 创建 Analysis routing、plane boundary、legacy 与 corpus evidence 上下文。 | Fancyliu / Codex |

---
*本文档由 bmad-create-story Skill 自动生成*
