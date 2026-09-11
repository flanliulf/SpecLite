# Experiment Notes（实验备注）

## 2026-09-04 — Initial Decision（初始决策）

- 实时判断：Story11.6 hard predecessors已满足，但`ready-for-dev`不等于实现授权或完成证据；必须由fresh Development先运行11.6 kickoff。
- 关键不变量：UX parent预创建、design-system on-demand、三个exact basenames、relative link/asset有效且不越界、legacy no-migration、consumer共享Planning resolved root。
- 风险：机械替换root可能破坏HTML/Markdown relative links、screenshots/assets或把legacy discovery误做迁移；Review需核对真实producer/consumer而非仅文案。
- 外部边界：drawer/mirrors/fixed-count drift不属于11.6。
- 用户介入点：当前无；若kickoff发现新的owner contract缺口，先输出精确gate并HALT。

## 2026-09-04 — Development Result（开发结果）

- 实时判断：11.6已有可执行producer/consumer、legacy/no-migration与focused evidence，可进入Reviewer；development green不等于Story完成。
- Reviewer重点：所有15 steps的current/resume/progress路径；三个HTML/Markdown basenames与relative assets；design-system只按需；legacy exact fallback不得迁移；consumer不得残留active Planning-root default。
- 验证边界：expanded/full中的drawer count失败必须独立报告，Reviewer不得修改external package或fixed counts。
- 用户介入点：无。Reviewer findings先交fresh Evaluator，不直接修复。

## 2026-09-04 — Reviewer Round 1 Result（第一轮审查结果）

- 实时判断：路径文本迁移已完成，但fresh/continuation状态机、legacy supporting outputs与可执行evidence仍不足，当前不能closeout。
- 决策候选：legacy main已选择时，存在legacy sibling应原位使用；缺失sibling是同目录创建还是canonical创建会改变写入位置，必须由Evaluator判断owning contract是否唯一。
- Patch候选：resolver failure/candidate kind、post-decode link boundary、config example parity及behavior fixtures均有明确AC支撑，但仍需Evaluator正式授权。
- P2候选：inactive duplicate Architecture step wildcard不属于active route，可能defer CR05。
- 用户介入点：先等fresh Evaluator；如legacy missing-sibling策略不唯一，再提出精确Owner gate。

## 2026-09-04 — Evaluator Round 1 Result（第一轮评估结果）

- 实时判断：7项均为交付阻塞P1且已有唯一修复语义；不需要用户补充决策。
- Legacy策略：existing main/sibling均原位选择且不迁移；缺失supporting sibling属于new write，写canonical `ux/` exact path。不得把legacy main同目录当作新输出默认。
- P2状态：inactive shipped Architecture duplicate wildcard不属于本轮P1修复，保留CR05。
- 验证要求：建立可执行UX routing/reference harness，覆盖fresh/continuation/coexistence/no-migration、resolver/candidate fail-close、real links/assets single-decode/symlink/three-space与config example parity。
- 用户介入点：无。Fixer后进入Round2复审复评。

## 2026-09-04 — Fixer Round 1 Result（第一轮修复结果）

- 实时判断：七项P1已有shared helper、workflow state与executable fixtures，具备Round2复审条件；Fixer green不等于CR通过。
- Reviewer重点：fresh/canonical/legacy/coexistence状态机；supporting selected paths；resolver/candidate安全；Markdown/HTML local-ref single-decode/containing-dir/symlink/three-space；config parity。
- P2边界：inactive Architecture duplicate wildcard必须保持未修并在closeout CR05登记。
- 验证解释：33/191全绿；full唯一失败仍为external drawer counts，不得修改外部baseline。
- 用户介入点：无。Round2 findings先交fresh Evaluator。

## 2026-09-04 — Reviewer Round 2 Result（第二轮审查结果）

- 实时判断：Round1主状态机修复成立，但physical ownership与reference parsing仍有安全边界，install evidence也未准确覆盖existing-before-install。
- 合并边界：missing write target需验证nearest existing ancestor；existing canonical/supporting symlink final target必须留在其UX/legacy owning space，而非仅project root。
- Parser边界：duplicate definition须first-wins；character reference可选择bounded decode或明确fail-close，需Evaluator限定，禁止完整HTML parser扩面。
- Evidence边界：install前先存在legacy，且必须assert install/update/repair command outcomes与tree/hash invariants；completion gate需同步current证据。
- 用户介入点：先等fresh Evaluator；无必要不新增Owner gate。

## 2026-09-04 — Evaluator Round 2 Result（第二轮评估结果）

- 实时判断：四项P1均有唯一bounded修复，不需要Owner决策；当前不能进入CR04/05/06。
- Physical owner：missing target查nearest existing ancestor，existing target与ancestor均须落在canonical UX或selected legacy owning space；actual write前执行同一重验。
- Parser：duplicate definition固定first-wins；local-ish HTML attribute raw值含`&`即fail-close，external scheme与纯fragment/query-only维持忽略；不实现entity parser。
- Lifecycle：legacy必须在install前存在，install/update/repair每阶段断言成功和原path/type/hash不变且无canonical copy；允许install创建`ux/` parent。
- 用户介入点：无。Fixer完成后由root根据current验证刷新completion gate，再进入Round3。

## 2026-09-04 — Fixer Round 2 Result（第二轮修复结果）

- 实时判断：四项P1已有实现、active contract、D1 docs与64-case focused evidence；completion gate也已刷新，具备Round3复审条件。
- 安全闭环：owner/ancestor/pre-write replacement window均fail-close且zero mutation；parser与renderer对duplicate/HTML character-reference不再产生已知语义分叉。
- Lifecycle闭环：legacy先于install存在，install/update/repair逐阶段验证success与path/type/hash/symlink invariants；允许canonical UX parent创建但禁止legacy copy/migration。
- 外部例外：full12 failures继续只归因drawer core19/total69固定数量漂移；不得在Round3把它归为11.6回归或修fixed counts。
- 用户介入点：无。Round3 findings仍须先经fresh aggregator/Evaluator，不能直接closeout。

## 2026-09-04 — Reviewer Round 3 Result（第三轮审查结果）

- 实时判断：Round2四项主修复大部成立，但actual operation coupling与asset-side no-copy evidence仍未闭环，当前completion gate不能作为closeout证据。
- Operation边界：finding仅针对current internal API把approval result交还caller后再写入的同步seam；Evaluator需给出bounded primitive语义，不预设native API。
- Evidence边界：legacy source preservation已覆盖六类entry，缺口只在canonical counterpart/allowlist侧；需逐阶段排除asset dir/file/symlink copy。
- Layer完整性：初始Blind因platform false-positive无产物而排除，fresh replacement Blind正式PASS，最终3/3有效层无降级。
- 用户介入点：无。两项语义由AC唯一约束，先等fresh Evaluator。

## 2026-09-04 — Evaluator Round 3 Result（第三轮评估结果）

- 实时判断：两项P1成立且有唯一bounded修复；不需要Owner Gate，当前不得closeout。
- Operation语义：production primitive不向caller暴露approval seam；test-only hook只能位于internal测试接口，hook后仍执行真正final commit-time validation并立即operation，不能write-then-check或自动删除。
- 失败语义：校验失败时operation未发起且zero mutation；existing target不得覆盖/截断；post-check只保护后续bind，不能替代pre-operation guard。
- Lifecycle语义：每阶段逐项排除六种legacy canonical counterpart，或对canonical UX descendants做显式allowlist；禁止宽泛pattern放行。
- 用户介入点：无。Fixer后root刷新gate，再进入Round4双门禁。

## 2026-09-04 — Fixer Round 3 Result（第三轮修复结果）

- 实时判断：approval seam已由执行型bounded primitive替换，asset-side no-copy evidence也覆盖全部legacy shape；completion gate current，可进入Round4。
- Operation证据：正常exclusive create/mkdir由primitive完成，existing不覆盖；hook后的final validation拒绝UX/design-system ancestor替换，production不暴露hook或approval。
- Lifecycle证据：install/update/repair每阶段核对六类source invariants和六类canonical counterpart absence，空UX parent仍允许。
- 外部例外：full12 failures仍只归因drawer core19/total69固定数量漂移，canonical warn/strict无findings。
- 用户介入点：无。Round4仍需fresh三层、aggregator与Evaluator双PASS后才可closeout。

## 2026-09-04 — Reviewer Round 4 Result（第四轮审查结果）

- 实时判断：source primitive与focused harness成立，但Round3 active prose把它提升为required runtime capability后，installed Skill没有可定位调用点，completion gate当前超出installed evidence。
- Binding边界：不得因缺口新增public CLI/schema；优先由Evaluator限定Skill-local private executable或等价private binding，并要求installer自然投影、exact invocation与structured result。
- Source-of-truth：不得复制两套会漂移的owner/ancestor/operation实现；installed invocation必须复用同源逻辑并有真实installed-tree test。
- Hook边界：test-only interposition不能暴露为installed参数/env/active input；current source module未发布，因此不单独成finding。
- 用户介入点：当前Owner Gate NONE；若方案要求public/shared runtime surface，必须另行升级而不能擅自扩面。

## 2026-09-04 — Evaluator Round 4 Result（第四轮评估结果）

- 实时判断：installed binding缺口成立，且现有Skill-local scripts投影惯例给出唯一private方案，无需Owner决策。
- 单一实现：canonical `.mjs`同时导出repo test API并提供direct CLI adapter；TypeScript不得保留第二份actual create/mkdir逻辑。
- 私有协议：只允许两个operation与固定flags；unknown input fail-close；JSON/non-zero是Skill-local protocol，不新增public schema/stable ID。
- Install证据：必须通过真实installer生成temp project并从`.agents`和`.claude`执行，禁止手工改workspace mirrors伪造消费闭环。
- 用户介入点：无。Fixer后root刷新gate，再进入Round5 latest双PASS门禁。

## 2026-09-04 — Fixer Round 4 Result（第四轮修复结果）

- 实时判断：repo-only oracle已成为canonical Skill-local private installed capability，单一实现与真实两类installed invocation均有证据，可进入Round5。
- Private边界：direct CLI只接受固定operation/flags并输出单JSON；unknown/test-hook argv、stdin、env fail-close；未新增public `speclite` command或schema。
- Projection边界：installer自然复制script并保留executable mode，files-index/hash/sourceRef与skill/package inventory一致；workspace mirrors未手改。
- 外部例外：fresh fixture3项和full12项失败继续只归因drawer core19/total69固定数量漂移。
- 用户介入点：无。Round5须fresh三层、aggregator和Evaluator均PASS后才可进入CR04。

## 2026-09-04 — Reviewer Round 5 Result（第五轮审查结果）

- 实时判断：latest Reviewer已正式PASS且无blocking finding；installed private capability与source/test/docs/evidence链一致。
- 消费闭环：canonical script、repo import与两类installed direct invocation为同一bytes/implementation，private protocol与HALT映射已验证。
- 既有修复：physical owner/operation coupling、reference parser、legacy lifecycle在Round5未见回归。
- 非阻塞项：inactive duplicate wildcard仍为P2，不影响Reviewer PASS但必须由CR05登记。
- 用户介入点：无。等待fresh Evaluator独立PASS，不能以三层全PASS跳过evaluation。

## 2026-09-04 — Evaluator Round 5 Result（第五轮评估结果）

- 实时判断：latest双PASS已成立，无blocking finding；Story 11.6可进入CR04，但尚未满足CR05/CR06 closeout。
- 关闭项：installed consumption、single source、test-hook exposure与lifecycle顺序均有current executable evidence，不再形成fix项。
- P2边界：inactive Architecture duplicate wildcard仍有效且非阻塞，只能由CR05登记，不能在CR04或Finalizer中修。
- 外部边界：drawer caveat继续保留，不影响latest双PASS，也不能宣称full全绿。
- 用户介入点：无。下一步CR04只提炼规则，不改实现或TODO。

## 2026-09-04 — CR04 Result（规则提炼结果）

- 实时判断：可复用经验已通过新增/增强四条规则收口，不需要修改实现或建立Story专属规则。
- 去重结果：physical operation与markup parity新建；installed binding和lifecycle evidence合并进既有规则，避免重复taxonomy。
- 排除边界：P2 wildcard不能被CR04吸收；external caveat与具体basename不是开发规则。
- 用户介入点：无。CR05仅管理TODO，不修P2源码。

## 2026-09-04 — CR05 Result（待办登记结果）

- 实时判断：唯一P2已进入可追踪backlog，不再是closeout遗漏；latest双PASS不受其阻塞。
- 去重与归属：TODO-017为新条目，明确归属inactive duplicate ownership，不与active consumer或path safety问题混淆。
- 边界：CR05未修源码；后续处理TODO必须另行授权并重新验证duplicate ownership。
- 用户介入点：无。CR06可执行Story/tracker最终同步。

## 2026-09-04 — CR06 Result（最终收口结果）

- 实时判断：Story11.6全部terminal conditions满足，已从review正式收口为done；可严格串行进入11.7。
- Tracker边界：仅11.6状态改变；Epic未提前done，后续Stories未推进。
- Evidence边界：PASS_EQUIVALENT继续明确full并非全绿，drawer仍是external caveat；TODO-017保持open而非伪装已修。
- 用户介入点：无。下一步只做11.7 preflight并启动fresh Development。
