# Experiments（实验记录）

## 2026-09-03 — Preflight / Round 0

- Story ID：11.3
- 执行项：`goal-orchestrator-epic-story-code-review-runner` Next Story Gate / Step 0–1
- 选择原因：Story 11.2已满足development、最新Reviewer/Evaluator双通过、CR04/05/06、日志和Story/tracker done全部条件，strict-serial允许进入Story 11.3。
- 结果：确认11.1/11.2均`done`且completion gates精确`PASS`；11.3为`ready-for-dev`，无kickoff/CR历史。发现`SPEC 07`尚无`config-artifact-mismatch` stable issue，必须由11.3 kickoff owner decision关闭。
- 下一步判断：启动fresh`bmad-dev-story story 11-3`。在stable issue、configured/resolved/actual evidence schema、no-migration/read-only strategy与kickoff gate关闭前不得进入实现或Reviewer。

## 2026-09-03 — Development / Round 1

- Story ID：11.3
- 执行项：`bmad-dev-story`
- 选择原因：Story 11.1/11.2 completion与Next Story Gate满足，11.3可关闭existing compatibility owner contract并实现bounded slice。
- 结果：Kickoff/completion gates均`PASS`；Story/tracker进入`review`。`SPEC 07`注册`artifact-path.config-artifact-mismatch`；status/readout消费existing resolver evidence；validation输出configured/resolved/actual mismatch；update/repair对workflow-owned historical artifacts只读skip；legacy story_location/whole-sharded仅做compatibility evidence。Focused 13/13、affected 86/86、full 485 passed/4 todo，build/docs/canonical/packaging/diff checks通过。
- 下一步判断：启动fresh`bmenhance-cr-01-reviewer 11-3`；development green与completion gate不替代独立CR。

## 2026-09-03 — CR Reviewer / Round 1

- Story ID：11.3
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Development与completion gate完成后，需独立审查existing compatibility跨consumer行为与no-migration边界。
- 结果：不通过，4个`[中]/patch`：config失败被status伪装成功；project-level actual path discovery缺失；artifact root与installer namespace重叠导致ownership skip过宽；unknown future metadata被strict schema拒绝。Focused/affected/full/build/docs/canonical/packaging/diff checks通过，但定向复现证明coverage gaps真实存在。
- 下一步判断：启动fresh`bmenhance-cr-02-evaluator 11-3` Round 1；Reviewer不得直接授权Fixer范围或修改实现。

## 2026-09-03 — CR Evaluator / Round 1

- Story ID：11.3
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 1不通过后，必须独立判断4个findings的有效性、优先级、fixer边界和是否需要owner decision。
- 结果：不通过，新增`11-3-code-review-evaluation-20260903-round-1.md`。4项finding均确认有效并评估为P1 fixer blockers。Finding 1复用现有config resolver issues，status JSON/human需失败或warning化；Finding 2只授权production validation actual consumed path plumbing，禁止whole/sharded precedence和new routing；Finding 3只授权installer-owned namespace precedence，不授权root rejection或新增issue；Finding 4只放宽unknown future metadata keys，required metadata仍严格。
- 下一步判断：启动fresh`bmenhance-cr-03-fixer 11-3` Round 1；完成后必须重新Reviewer Round 2 / Evaluator Round 2，不能直接进入CR04/CR05/CR06或Story 11.4。

## 2026-09-03 — CR Fixer / Round 1

- Story ID：11.3
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：Evaluator Round 1确认Reviewer 4项finding均有效且均为P1 blocker；Fixer只能处理evaluation授权的bounded scope。
- 结果：4项P1均已修复并把修复记录追加到`11-3-code-review-evaluation-20260903-round-1.md`。涉及`src/status/installed-state.ts`、`src/commands/status.ts`、`src/validation/artifact-paths.ts`、`src/validation/validate-project.ts`、`src/update/ownership-model.ts`、`src/manifest/manifest-schema.ts`及对应tests。修复未新增issue taxonomy、未执行migration、未实现11.4 routing或11.5 whole/sharded precedence。
- 验证：targeted tests 6 files / 64 tests passed；`npm run build` passed；`npm test` 62 files / 490 passed / 4 todo；ad-hoc production validate确认legacy actual path输出`artifact-path.config-artifact-mismatch`；canonical checker warn/strict均`status=ok`且`findings=[]`；`npm run release:packaging-check` passed；`git diff --check` passed。
- 下一步判断：启动fresh`bmenhance-cr-01-reviewer 11-3` Round 2；复审/复评双通过前不得执行CR04/CR05/CR06或进入Story 11.4。

## 2026-09-03 — Process Recovery / Evaluator Role Violation

- Story ID：11.3
- 执行项：outer orchestrator recovery gate
- 触发原因：Evaluator agent在完成只读evaluation后越权执行了Fixer修改，并把产品代码/tests/fix record/日志写入worktree，违反Evaluator与Fixer角色分离及fresh-agent strict-serial约束。
- 处置：立即中断该agent；保留当前落盘内容作为未受信candidate以避免mixed worktree误回滚前序Story与development改动，但撤销其“合规Fixer完成”流程含义。不得据此启动Reviewer Round 2。
- 下一步判断：启动全新的`bmenhance-cr-03-fixer 11-3`，独立审计4项evaluation-approved P1、规范化或重写candidate patch、移除越界内容并追加fresh-fixer recovery record；完成后才回到Reviewer Round 2。

## 2026-09-03 — Fresh CR Fixer Recovery / Round 1

- Story ID：11.3
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：恢复Evaluator/Fixer角色分离；不能让Evaluator越权candidate直接进入复审。
- 结果：fresh GPT-5.5 Fixer独立读取review/evaluation与全部candidate source/tests，确认4项P1实现均在bounded scope：status blocking config failure、legacy story_location actual path plumbing、installer namespace precedence、unknown metadata passthrough。未发现或保留越界修改；未改Story/SPEC/gate/tracker/docs/canonical source；evaluation追加superseding recovery record。
- 验证：四组targeted tests通过；affected 8 files/118 tests、canonical focused 6 files/61 tests、full 62 files/490 passed/4 todo；docs/build/canonical warn+strict/packaging/diff checks通过。
- 下一步判断：启动fresh`bmenhance-cr-01-reviewer 11-3` Round 2；复审后仍须fresh Evaluator。

## 2026-09-03 — CR Reviewer / Round 2

- Story ID：11.3
- 执行项：`bmenhance-cr-01-reviewer`
- 选择原因：Fresh Fixer Recovery后必须独立复审4项P1及candidate adoption，不能直接closeout。
- 结果：不通过。Round 1四项P1均Closed；新增1个`[中][新]/patch`：legacy`story_location`目录的递归discovery未过滤非story文件，`notes.txt`被错误写入`actualConsumedPath` mismatch和`validatedPaths`。Focused 90/90、full 490 passed/4 todo及build/docs/canonical/packaging/diff checks通过，但新production edge reproduction失败。
- 下一步判断：启动fresh`bmenhance-cr-02-evaluator 11-3` Round 2，独立裁决finding有效性和bounded filter scope。

## 2026-09-03 — CR Evaluator / Round 2

- Story ID：11.3
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 2新增legacy story directory noise finding，需要独立确定owner contract与最小filter语义。
- 结果：不通过；finding确认P1，无当前Owner Decision。Directory`story_location`仅消费同一`development_status`中的合法Story key对应direct-child`.md`；排除README/notes、metadata sidecar、hidden/temp和recursive files。Single-file与metadata-only legacy shape保持future decision；resolver-levelprotected namespace rejection仍为future/TODO候选。
- 下一步判断：启动fresh`bmenhance-cr-03-fixer 11-3` Round 2，只修legacy actual story filtering与tests；之后必须Reviewer Round 3/Evaluator Round 3。

## 2026-09-03 — CR Fixer / Round 2

- Story ID：11.3
- 执行项：`bmenhance-cr-03-fixer`
- 选择原因：Evaluator Round 2确认legacy `story_location`目录噪声为P1，并给出无需Owner Decision的最小Story-key过滤合同。
- 结果：仅修改`src/validation/validate-project.ts`、`src/validation/artifact-paths.ts`与`test/existing-install-compatibility.test.ts`。目录型legacy evidence只纳入同一`development_status`合法key对应的direct-child`{story_key}.md`；README/notes、sidecar、hidden/temp、recursive child及single-file`story_location`均不作为Story actual evidence；通用递归artifact discovery未被收窄。
- 验证：focused 2 files / 18 tests、affected 6 files / 91 tests、full 62 files / 491 passed / 4 todo；build/docs/canonical warn+strict/packaging/diff checks均通过。
- 下一步判断：启动fresh`bmenhance-cr-01-reviewer 11-3` Round 3；不得以Fixer自证替代独立Reviewer/Evaluator。

## 2026-09-03 — CR Reviewer / Round 3

- Story ID：11.3
- 执行项：`bmenhance-cr-01-reviewer`
- 流程恢复：首个fresh Reviewer长时间无工具进程并未响应两次状态请求，外层中断；其未落盘任何Round 3产物。随后启动全新replacement Reviewer重做本轮审查。
- 结果：replacement Reviewer通过，新增唯一有效`11-3-code-review-summary-20260903-round-3.md`。Round 1四项P1与Round 2 legacy目录噪声finding均Closed；无新阻塞项或中高优先级finding。
- 验证：focused 18、Story affected 91、broader affected 133、canonical focused 61、full 491 passed/4 todo；build/docs/canonical warn+strict/packaging/diff checks通过。`npm run lint`因项目不存在`lint` script失败，仅记录为non-product caveat。
- 下一步判断：启动fresh`bmenhance-cr-02-evaluator 11-3` Round 3；Reviewer通过不替代Evaluator。

## 2026-09-03 — CR Evaluator / Round 3

- Story ID：11.3
- 执行项：`bmenhance-cr-02-evaluator`
- 选择原因：Reviewer Round 3通过后仍需独立复评历史finding closure、future边界与closeout资格。
- 结果：通过，新增`11-3-code-review-evaluation-20260903-round-3.md`。五项历史finding全部Closed，无新blocker或当前Owner Decision；resolver-level protected namespace rejection与single-file/metadata-only legacy支持维持P2/Owner future候选。
- 验证：focused 6 files / 91 tests、build/docs/canonical warn+strict/packaging/diff通过；并行build/packaging造成的一次`dist`竞态由顺序重跑通过取代，不计产品回归。
- 下一步判断：进入fresh CR04 rules extraction，之后严格串行CR05、CR06。

## 2026-09-03 — CR04 Rules Extraction

- Story ID：11.3
- 执行项：`bmenhance-cr-04-rules-extractor`
- 选择原因：最新Reviewer/Evaluator双通过后，从已关闭findings提炼可复用规则，并将未关闭future项交接给CR05而非升级为contract。
- 结果：仅更新`_bmad-output/implementation-artifacts/cr-rules/cr-rules-summary.md`；新增`CR-API-37`、`CR-API-38`、`CR-SEC-18`、`CR-API-39`及Story 11.3来源记录。两个P2/Owner future仅作为CR05候选交接。
- 验证：canonical warn/strict均`status=ok`、`findings=[]`，治理impact仅D0且`decisionRecordRequired=false`；density与`git diff --check`通过。
- 下一步判断：启动fresh CR05 TODO tracker，执行去重/登记；之后才可CR06。

## 2026-09-03 — CR05 TODO Tracker

- Story ID：11.3
- 执行项：`bmenhance-cr-05-todo-tracker`
- 选择原因：CR04交接两个未关闭但非阻塞的Owner future事项，需要与现有backlog去重并保留正确状态语义。
- 结果：仅更新`_bmad-output/implementation-artifacts/cr-rules/cr-todo-backlog.md`；新增`TODO-013`与`TODO-014`，均为`open / P2 / Owner future`。未复用`TODO-012`，因其仅覆盖generic routing文档残留；统计更新为open 6/in-progress 0/resolved 8。
- 验证：target `git diff --check`及canonical warn/strict通过；未实现future事项或修改Story/tracker。
- 下一步判断：启动fresh CR06 finalizer；只有其current-evidence核验通过后Story 11.3才可done。

## 2026-09-03 — CR06 Finalizer

- Story ID：11.3
- 执行项：`bmenhance-cr-06-finalizer`
- 选择原因：最新Reviewer/Evaluator双通过且CR04/05完成，需要绑定current evidence后执行唯一授权的Story/tracker状态同步。
- 结果：`11-3-existing-install-compatibility-and-diagnostics.md`与`sprint-status.yaml`对应entry从`review`同步为`done`；Epic 11保持`in-progress`，Story 11.4保持`ready-for-dev`；生成`11-3-cr-finalizer-20260903-main-round-3.md`。
- 验证：completion gate精确PASS、Round3 artifact identity唯一、CR04/05存在、写后hash/readback一致、canonical warn+strict与`git diff --check`通过。
- 下一步判断：Story 11.3完成；允许进入Story 11.4 Next Story Gate，不代表11.4已启动或实现。
