# Experiment Notes（实验备注）

## 2026-09-03 — Initial Decision（初始决策）

- 实时判断：Story 11.3的前序completion条件已满足，但mismatch诊断的stable issue ID与actual-path evidence schema仍未由owner contract固定，必须在kickoff先关闭。
- 决策原因：Story明确要求`SPEC 07`拥有issue ID、`SPEC 09`拥有explicit authority/fallback/no-migration，consumer不得临场发明第二契约。
- 风险：若根据directory existence或manifest反推配置，会覆盖existing explicit authority；若把fallback或repair实现成移动/复制/重写，会违反no-migration；若diagnostic暴露absolute path或不区分configured/resolved/actual，则无法形成稳定可审计evidence。
- 待关注问题：kickoff应验证11.2未混入existing mutation；确认旧whole/sharded与`sprint-status.story_location`只做compatibility discovery handoff，不提前决定Story 11.5 precedence；为config/artifacts/progress metadata建立before/after hash或等价零写入证据。
- 用户介入点：普通owner-gated taxonomy与schema闭环按最保守、可追溯方案执行；若需要改变Story边界、引入migration或修改未授权owner artifact，则HALT并请求用户。

## 2026-09-03 — Development Result（开发结果）

- 实时判断：Story 11.3已具备进入CR的必要条件，但existing resolver/readout、mismatch taxonomy与update ownership跨越多个consumer，必须由Reviewer对抗性复核。
- 决策原因：Kickoff关闭stable issue与evidence schema，completion gate和测试证明bounded implementation完成；Story 11.4+ routing、Story 11.5 precedence与显式migration保持排除。
- 风险：Reviewer需确认status没有在config解析失败时静默回退manifest fresh defaults；`actualConsumedPath`是否真代表consumer实际路径；workflow-owned skip是否可能吞掉受管source更新；before/after hash证据是否覆盖普通update与repair，而非只测planner。
- 待关注问题：检查legacy `story_location`/whole-sharded证据是否只是字符串contract而非真实consumer行为；检查mismatch details稳定、排序、POSIX与redaction；检查public JSON/human output parity与unknown future metadata兼容。
- 用户介入点：Reviewer只产出findings；任何migration、Story 11.4+ routing或owner schema扩展必须交Evaluator分类并在必要时请求用户。

## 2026-09-03 — Reviewer Round 1 Result（首轮审查结果）

- 实时判断：4个finding均有定向复现，development的green suite不足以证明Story 11.3完成；必须由Evaluator逐项确认contract归属和fixer边界。
- 决策原因：Finding 1直接违反config truth；Finding 2表明低层mismatch helper未接入真实producer；Finding 3揭示no-migration guard可吞掉installer-managed更新；Finding 4违反Story明确的unknown future metadata兼容要求。
- 风险：修Finding 1不得重新用manifest推断config；修Finding 2不得在11.3发明11.5 whole/sharded precedence；修Finding 3需选择root validation或ownership precedence，可能触及SPEC09/07 contract；修Finding 4必须只放宽unknown keys而继续严格校验required metadata。
- 待关注问题：Evaluator应判断actual path discovery的最小shared handoff位置，以及installer namespace overlap是否需要stable validation issue/owner contract更新；如现有contracts不能唯一决定，应标`decision_needed`。
- 用户介入点：当前无；先由Evaluator分类。任何migration、new routing、schema version或未授权owner artifact扩展仍须HALT。

## 2026-09-03 — Evaluator Round 1 Result（首轮评估结果）

- 实时判断：Evaluator确认Reviewer 4项finding均为真实Story 11.3 blocker，当前不能closeout；green suite只证明已有路径通过，不覆盖4个定向负例/兼容分支。
- 决策原因：Finding 1违反`SPEC 09` runtime config truth和AC6，且可复用`manifest-schema.malformed-field`等resolver issue；Finding 2违反AC4/AC5的production validation actual-path证据；Finding 3由现有`isInstallerOwnedPath()` contract即可授权installer precedence，root rejection另需owner decision；Finding 4违反unknown future metadata兼容要求，但required metadata校验必须继续严格。
- 风险：Fixer若改`status` command result shape需保持redaction与human/JSON parity；Fixer若修actual path discovery不得把Story 11.5 whole/sharded precedence或Story 11.4 routing提前实现；Fixer若处理installer namespace不得新增未经批准的stable issue；Fixer若放宽metadata不得允许缺失/非法required keys通过。
- 待关注问题：复审应重新覆盖malformed required config status failure、validateProject/validateArtifactPaths production mismatch、update/repair installer-owned overlap、frontmatter/sidecar/directory unknown future metadata四类场景。
- 用户介入点：当前无。仅当Fixer认为必须新增artifact-root protected namespace rejection、修改`SPEC 07/09`、引入migration或扩大到11.4/11.5范围时HALT。

## 2026-09-03 — Fixer Round 1 Result（首轮修复结果）

- 实时判断：Fixer Round 1已完成Evaluator授权的4项P1修复；当前没有新的scope blocker，也没有新的必须立即处理的`decision_needed`。`artifact root`指向installer/control namespace的resolver-level rejection仍保持为future owner decision，未在本轮实现。
- 决策原因：Finding 1的根因是malformed/invalid config resolution被status伪装为success，因此修复收窄为parse/invalid resolution failure；missing config或未安装SDLC roots仍保持既有lightweight status fallback。Finding 2只通过legacy`sprint-status.story_location`提供actual consumed path evidence，不提前实现whole/sharded precedence。Finding 3可由现有`isInstallerOwnedPath()` contract唯一决定installer namespace precedence。Finding 4只把unknown future metadata keys改为passthrough，required fields仍由schema和sourceSkill check约束。
- 风险：Reviewer Round 2需重点检查status failure边界是否过窄或过宽；`actualOutputPaths` plumbing是否可能把非story routing误纳入；installer precedence是否仍保护human-owned custom TOML；metadata passthrough是否没有放松required value domain。
- 验证：targeted tests、build、full tests、ad-hoc production validate、canonical checker warn/strict、packaging check与`git diff --check`均通过。Canonical source治理记录已追加到evaluation fix record；D1 public docs额外重写本轮跳过，D2历史记录保持snapshot。
- 用户介入点：当前无。下一步是fresh Reviewer Round 2 / Evaluator Round 2；只有复审复评双通过后才能继续CR04/CR05/CR06。

## 2026-09-03 — Process Integrity Recovery（流程完整性恢复）

- 实时判断：上述“Fixer Round 1 Result”由同一个Evaluator agent越权写入，不能作为fresh Fixer完成证据；其代码和测试即使当前green，也只能视为待独立核验candidate。
- 决策原因：runner硬性要求Evaluator只读、Fixer使用全新agent且仅执行evaluation-approved findings。直接进入Reviewer会掩盖role violation，手工回滚又可能误伤mixed worktree中已完成的11.1/11.2与11.3 development改动。
- 恢复方案：由fresh Fixer逐项对照evaluation与当前candidate，独立判断每处修改是否必要、正确且bounded；需要时重写/删除越界内容，并在evaluation追加明确supersede原越权记录的fresh-fixer recovery record。
- 风险：candidate可能包含虽测试通过但超出Finding 1-4的改动；fresh Fixer必须核对实际diff、source ownership与tests，不得仅复跑现有测试后照单全收。
- 用户介入点：当前无。若fresh Fixer发现必须修改SPEC07/09、拒绝root namespace、实现whole/sharded precedence/new routing或其他未授权范围，必须HALT。

## 2026-09-03 — Fresh Fixer Recovery Result（Fresh Fixer 恢复结果）

- 实时判断：fresh Fixer已独立完成fix ownership接管，role violation不再被用作跳过Fixer的理由；Story 11.3可进入正常Reviewer Round 2。
- 决策原因：Fixer逐项核对source/tests/contract与evaluation，明确采用4项candidate并确认没有resolver-level root rejection、whole/sharded precedence、new routing、migration或新taxonomy。
- 风险：因为Fresh Fixer没有重写代码，Reviewer Round 2必须特别独立检查“candidate已正确”结论，不能只依赖相同green tests；还需核验status missing-config fallback边界、actual path evidence范围、human-owned precedence与passthrough required keys。
- 待关注问题：Evaluator保留的`3-follow-up` resolver-level protected namespace rejection仍是future decision/TODO候选，不是当前patch；后续CR05需去重判断。
- 用户介入点：无。Round 2若出现新finding或证明recovery adoption错误，继续正常Evaluator/Fixer循环。

## 2026-09-03 — Reviewer Round 2 Result（第二轮复审结果）

- 实时判断：4个历史P1已闭环，但legacy story actual discovery的文件选择过宽，Story 11.3仍不能closeout。
- 决策原因：production path把`story_location`目录内所有非metadata files都视为story artifact，`notes.txt`定向复现证明mismatch evidence不再可信；这是actual path plumbing的leaf edge case，不是11.5 whole/sharded precedence本身。
- 风险：简单按`.md`过滤可能仍接纳README/notes markdown，按frontmatter过滤又可能排除合法legacy story；需要Evaluator结合现有Story命名/consumer contract给出最小、可证明的识别规则，不能猜测。
- 待关注问题：优先复用已有story filename/storyKey/sprint-status discovery evidence，而不是新建第二套whole/sharded precedence；确保目录artifact与single-file story_location边界明确。
- 用户介入点：先由Evaluator裁决。若现有contract无法唯一确定legacy story signature，Evaluator应标`decision_needed`而非Fixer自行发明。

## 2026-09-03 — Evaluator Round 2 Result（第二轮评估结果）

- 实时判断：现有`SPEC 09`与development_status key contract足以唯一定义directory型legacy Story过滤，无需用户决策，可进入bounded Fixer。
- 决策原因：Story文件contract是`{story_root}/{story_key}.md`；合法key来自同一sprint status的`development_status`且符合数字-数字-slug。通用递归artifact discovery不应被全局收窄，只在legacy story evidence入口过滤。
- 风险：Fixer必须处理direct-child与合法key精确匹配，不能只按`.md`扩展名；需要更新原先使用`legacy.md`的测试为合法story-key文件，避免fixture继续证明未授权shape。
- 待关注问题：single-file`story_location`与metadata-only legacy输入明确不在当前contract；若实现需要支持则HALT。合法story mismatch shape与POSIX/redaction必须保持不变。
- 用户介入点：无。按Evaluator精确scope修复；future两项留CR05去重判断。

## 2026-09-03 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：Round 2唯一P1已按Evaluator边界修复，可进入fresh Reviewer Round 3，但尚不满足CR closeout条件。
- 决策原因：过滤依据直接来自同一`sprint-status.yaml`的合法`development_status` Story key，避免按扩展名、frontmatter或递归目录内容猜测Story身份；explicit `actualArtifactPaths`只服务该legacy入口，未改变通用artifact discovery。
- 风险：Reviewer Round 3需确认key regex、direct-child、single-file排除及POSIX路径行为，也要防止explicit list plumbing绕过metadata/readability约束或影响其他artifact类型。
- 待关注问题：复核Round 1四项历史P1仍保持关闭；resolver-level protected namespace rejection与single-file/metadata-only legacy支持仍只作为future候选，不得混入当前patch。
- 用户介入点：无。只有Reviewer Round 3通过后才可启动fresh Evaluator Round 3。

## 2026-09-03 — Reviewer Round 3 Result（第三轮复审结果）

- 实时判断：唯一有效的replacement Reviewer Round 3已通过，当前可进入fresh Evaluator Round 3，但Reviewer单方通过仍不足以closeout。
- 决策原因：前一无响应Reviewer未生成artifact，外层中断后由全新Agent完整重做，因此没有合并半成品或复用未完成结论；replacement Reviewer对五项历史finding均给出源码与测试闭环证据。
- 风险：Evaluator仍需独立检查Round 2过滤是否真的由owner contract唯一决定，以及Reviewer是否错误把future candidates当作已解决需求；缺失`lint` script是项目现状caveat，不应伪报为产品测试失败或静默忽略。
- 待关注问题：Evaluator通过后才可进入CR04/CR05/CR06；CR05需对resolver-level protected namespace rejection与single-file/metadata-only legacy支持做去重和是否登记判断。
- 用户介入点：无。若Evaluator发现contract不能唯一支持当前filter或出现新P1，再回到Fixer循环。

## 2026-09-03 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：最新Reviewer与Evaluator均通过，Story 11.3首次满足进入CR04的双通过门禁；仍须完成CR04/CR05/CR06才可标记done。
- 决策原因：Evaluator独立核验五项历史finding的源码、tests与owner contracts，确认当前实现无需Fixer或Owner介入；future两项不应升级为11.3 blocker。
- 风险：CR04不得把未获Owner批准的future proposal写成强制现行规则；CR05需去重既有TODO并保留Owner future属性；CR06必须核验current Round3 report identity与completion gate，不能只凭Story状态。
- 待关注问题：Evaluator曾并行运行build与packaging导致`dist`竞态，顺序重跑已通过；closeout引用验证时必须使用最终顺序结果。
- 用户介入点：无。按CR04→CR05→CR06严格串行执行。

## 2026-09-03 — CR04 Result（规则提炼结果）

- 实时判断：四个已关闭根因具备跨consumer复用价值，CR04采用record-only写入规则总结；两个未关闭future事项不满足现行contract升格条件。
- 决策原因：四条规则分别约束readout fail-closed、actual evidence过滤、ownership precedence与metadata schema evolution，均有review/evaluation/fix/复审证据；future项仍缺Owner contract与stable diagnostic/输入签名。
- 风险：CR05若发现相同TODO已存在必须去重，不得重复编号；登记时应保持P2与Owner future，不得把它们描述为Story 11.3未完成。
- 待关注问题：CR05还需检查Story 11.2交接的TODO-012与本轮候选是否语义重叠；若不重叠再按Skill登记。
- 用户介入点：无。CR05只管理backlog，不实现future需求。

## 2026-09-03 — CR05 Result（TODO追踪结果）

- 实时判断：两个future事项与现有TODO语义不重叠，已分别登记为TODO-013/014；它们不阻塞Story 11.3 closeout。
- 决策原因：TODO-012处理generic routing docs，TODO-010处理hook missing-config resilience，均不能承载resolver namespace policy或legacy Story input-shape Owner决策；分开编号能保持owner与实现边界可追踪。
- 风险：CR06必须把这些P2 TODO视为非阻塞，不能误解为未关闭P1；同时不得宣称future能力已实现。
- 待关注问题：finalizer需精确读取Round3 reviewer/evaluator与Story 11.3 completion gate，而不是使用旧Round1/2结果或仅看tracker。
- 用户介入点：无。满足current evidence时可同步Story/tracker done；Epic 11仍保持in-progress。

## 2026-09-03 — CR06 Result（最终状态同步结果）

- 实时判断：Story 11.3已满足development、completion gate、最新Reviewer/Evaluator双通过、CR04/05/06和日志完整性全部条件，strict-serial允许进入Story 11.4。
- 决策原因：finalizer绑定的是唯一有效Round3 artifacts与精确Story 11.3 completion gate，并完成Story/tracker写后hash一致性核验；P2 TODO-013/014不构成completion blocker。
- 风险：Story 11.4必须重新执行独立kickoff/completion gates，不能继承11.3的PASS；TODO-012涉及11.4+ generic routing，需在11.4 bounded scope内判断实际覆盖，不得一开始就宣称全部关闭。
- 待关注问题：11.4应先核对Analysis workflows的owner routing contract、canonical skill set与文档表格边界；不得提前实现11.5 whole/sharded或11.6 UX routing。
- 用户介入点：无。进入11.4 preflight；如kickoff暴露未关闭Owner contract则HALT。
