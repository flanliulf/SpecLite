# Epic 4: Safe Update And Repair（安全更新与修复）

项目维护者可以安全更新 installer-owned 文件，在写入前获得 plan、ownership/hash 判断、operation lock 和 conflict 可见性，同时保护 human-owned custom 与 workflow-owned artifacts，并通过 `update --repair` 显式修复可恢复 drift。

## Story 4.1: Ownership Model And Protected File Boundaries（所有权模型与受保护文件边界）

作为项目维护者，
我希望 SpecLite 明确区分 installer-owned、human-owned 和 workflow-owned 文件，
以便 update 和 repair 可以安全修改工具生成内容，同时保护人工配置和研发过程产物。

**验收标准：**

**前提** SpecLite 安装生成文件清单
**当** 系统记录 installed state
**则** 每个受管理文件会被标记为 installer-owned、human-owned 或 workflow-owned
**并且** ownership 信息可被 update、repair 和 validate 读取。

**前提** 文件位于 `_speclite/config.toml` 或 `_speclite/config.user.toml`
**当** 系统判断 ownership
**则** 这些 installer 初始化配置文件可被标记为 installer-owned
**并且** 后续 update 必须按 manifest/hash 与配置契约判断是否可安全修改。

**前提** 文件位于 `_speclite/custom/*.toml` 或 `_speclite/custom/*.user.toml`
**当** 系统判断 ownership
**则** 这些文件默认视为 human-owned
**并且** install/update/repair 不得覆盖、重写、重排或格式化已存在文件。

**前提** fresh install 发现 human-owned TOML stub 不存在
**当** 系统需要初始化 custom 层入口
**则** 只可以按 create-if-absent 规则创建 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml`
**并且** 如果目标文件已存在，则不得修改其内容、顺序或注释。

**前提** 文件路径匹配 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`
**当** fresh install、update 或 repair 处理 skill-specific customization
**则** 这些文件默认由用户手工创建或未来显式 customization 命令创建
**并且** fresh install 不得为每个 installed skill 自动生成 skill-specific stub。

**前提** 文件位于 `_speclite-output` 或配置约定的 workflow artifact 目录
**当** 系统判断 ownership
**则** workflow 产物默认视为 workflow-owned
**并且** update/repair 不得将其纳入覆盖或重写计划。

**前提** validate 或 update 发现 ownership 缺失或冲突
**当** 系统生成诊断结果
**则** issue 会包含稳定 issue id、category、severity 和 affected path
**并且** suggested next step 不会建议用户删除或覆盖 human-owned/workflow-owned 文件作为默认修复方式。

## Story 4.2: Config And Customization Merge Order For Updates（更新中的配置与定制化合并顺序）

作为项目维护者，
我希望 update 和 repair 在规划前使用统一 resolver 读取项目配置和 customization 覆盖，
以便更新行为尊重团队/个人配置，并且不会破坏 human-owned TOML 文件。

**验收标准：**

**前提** update 或 repair 需要读取项目配置
**当** 系统解析 config
**则** 必须按 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 的顺序合并
**并且** custom 层覆盖 installer user 层。

**前提** update 或 repair 需要读取 skill customization
**当** 系统解析 customization
**则** 必须按 skill `customize.toml` defaults、`_speclite/custom/{skill}.toml`、`_speclite/custom/{skill}.user.toml` 的顺序合并
**并且** 使用 skill directory basename 作为 customization lookup key。

**前提** human-owned TOML 文件存在
**当** update 或 repair 完成 resolver 读取
**则** 系统只能读取并保护这些文件
**并且** 不得覆盖、重写、重排、格式化或删除它们。

**前提** optional custom layer 缺失
**当** resolver 合并配置或 customization
**则** 缺失 layer 被视为 `{}` 并继续
**并且** 不产生阻断性 error。

**前提** optional custom layer 存在但无法读取或解析
**当** update 或 repair 需要继续规划
**则** 系统会输出 ValidationIssue 形状 warning diagnostic
**并且** 在没有 error 或 critical diagnostics 时仍可继续进入保守规划。

**前提** resolver 行为发生变更
**当** 更新 config/customization 解析实现
**则** 必须同步 resolve parity fixture、owning SPEC 和 expected outputs
**并且** update/repair 不得实现第二套私有 merge logic。

## Story 4.3: Update Plan Before Write（写入前更新计划）

作为项目维护者，
我希望 `speclite update` 在修改任何文件前先生成明确的 update plan，
以便看到哪些文件将被修改、跳过或标记冲突，并在授权前确认影响范围。

**验收标准：**

**前提** 用户运行 `speclite update`
**当** 系统开始更新流程
**则** 系统会先读取 installed state、source descriptor、files index、ownership 信息和 resolved config
**并且** 在生成 update plan 前不修改项目文件。

**前提** update plan 生成中
**当** 系统比较 expected state 与 current installed state
**则** plan 会列出 planned effects、affected paths、ownership、current hash、expected hash 和 proposed action
**并且** 路径使用 project-relative POSIX path。

**前提** 某个 installer-owned 文件未发生本地 drift 且 source 有更新
**当** 系统生成 update plan
**则** 该文件可被标记为 planned change
**并且** 只有获得明确写入授权后才允许进入写入阶段。

**前提** 某个文件无法确认安全更新
**当** 系统生成 update plan
**则** 该文件会进入 skipped 或 conflicts 集合
**并且** 原文件在本次命令中保持不变。

**前提** 用户以交互模式运行 update
**当** plan 已生成但用户尚未确认
**则** 系统会展示 impact summary、changed/skipped/conflict paths 的预期结果
**并且** 不会把未授权的 planned action 改写成 `skip:not-authorized`。

**前提** 用户以脚本模式运行 update 且未传入 `--yes`
**当** plan 需要写入授权
**则** 命令保持 unapplied plan 状态
**并且** 不写入 installer-owned 文件。

**前提** 用户请求 `update --json` 输出
**当** plan 生成完成
**则** machine-readable data 会区分 planned effects、actual apply results、skipped paths 和 conflicts
**并且** 不把逐路径 conflicts 复制成多个 command-level issues。

**前提** update plan 使用 human-readable output 展示
**当** 系统进入写入授权前的 Evidence profile
**则** 输出必须明确展示 planned effects、write authorization status、changed paths、skipped paths、conflicts 和 protected boundaries
**并且** conflicts 与 skipped paths 必须包含稳定 reason code 或文本等价说明，不能只依赖颜色、图标或表格位置传达含义。

**前提** update plan 在窄终端、`NO_COLOR`、non-TTY 或 CI 环境展示
**当** renderer 降级表格或移除颜色
**则** affected path、ownership、proposed action、conflict reason、suggested next step 和是否需要 `--yes` 仍必须可读
**并且** human-readable output 不得把 automation 依赖字段作为唯一承载位置。

## Story 4.4: Project Operation Lock And Safe Write（项目操作锁与安全写入）

作为项目维护者，
我希望所有会写入项目的 SpecLite 命令都使用 project operation lock 和 safe write，
以便避免并发更新、路径逃逸、符号链接逃逸或部分写入破坏项目状态。

**验收标准：**

**前提** write-capable command 准备进入写入阶段
**当** 系统尝试获取项目锁
**则** 必须创建或获取 `_speclite/.lock` project operation lock
**并且** 未获取锁时不得写入任何文件。

**前提** `_speclite/.lock` 已被其他操作持有
**当** 当前命令无法安全获取锁
**则** 命令返回 failure 且非 0 exit code
**并且** 输出 `operation-lock.project-locked` command-level issue。

**前提** 同一 process 已持有 project operation lock
**当** 它再次进入 public write-capable command path
**则** MVP 仍按 non-reentrant lock 处理，不得绕过 lock acquisition
**并且** 内部 orchestration 若需复用锁，只能传递 private lock handle，不得重新调用 public command path。

**前提** validate 发现 stale lock
**当** stale lock 不阻断当前只读验证
**则** validate 可以输出 `operation-lock.stale-lock` warning
**并且** 不得自动删除 lock file。

**前提** installer-owned 文件准备写入
**当** 系统执行 safe write
**则** 必须使用 temp-write + rename 或等价安全写入策略
**并且** temporary file 必须位于 target file 同一目录，文件名包含 `.speclite-tmp-` marker，且不进入 files index、manifest/index、public JSON 或 stable fixture snapshot。

**前提** 目标路径存在 symlink escape、path escape、case conflict 或 unsafe overwrite 风险
**当** 系统规划或执行写入
**则** 写入必须被阻断
**并且** 输出稳定 issue 或 conflict reason。

**前提** 写入过程中发生 partial failure
**当** 命令生成结果
**则** 输出 completed steps、failed step、pending steps、changed paths 和 manual action
**并且** 不声称未完成的文件已成功更新。

**前提** lock file shape 被记录或诊断
**当** 输出 public JSON 或 fixture snapshot
**则** 不暴露不稳定的 createdAt、pid 或 checkout-specific absolute path
**并且** lock file 不进入 files index 或 stable files-index hash。

## Story 4.5: Conflict Detection And Default Non-Overwrite Behavior（冲突检测与默认不覆盖行为）

作为项目维护者，
我希望普通 `speclite update` 在发现本地 drift 或不确定安全性的文件时默认标记 conflict，
以便避免静默覆盖用户修改、IDE mirror drift 或其它已安装状态异常。

**验收标准：**

**前提** installer-owned 文件的 current hash 与 files index baseline 不一致
**当** 用户运行普通 `speclite update`
**则** 系统会将该路径标记为 conflict
**并且** 不会静默覆盖当前文件内容。

**前提** IDE mirror 中的 canonical skill package 与 manifest baseline 不一致
**当** 普通 update 生成计划
**则** 系统会报告 IDE mirror drift conflict
**并且** 不会直接恢复 canonical 内容。

**前提** human-owned custom 文件存在本地内容
**当** update 检查该路径
**则** 系统不会把它加入 overwrite plan
**并且** 不会因为 source 有更新而修改、重排或格式化该文件。

**前提** workflow-owned artifact 存在
**当** update 检查 artifact path
**则** 系统不会覆盖或删除该产物
**并且** artifact path 不进入 installer-owned changed paths。

**前提** update 发现一个或多个 conflicts
**当** 生成 command-level issue
**则** 使用 `update.conflicts` 作为 command-level planning blocker
**并且** 逐路径冲突只放入 `data.conflicts`，不得复制成多个 issues。

**前提** update 输出 conflict summary
**当** 用户查看 human-readable 或 `--json` 结果
**则** 每个 conflict 包含 affected path、ownership、reason code 和 suggested next step
**并且** producer 只能输出 owning SPEC registry 中的 reason code，suggested next step 指向明确的 repair、manual action 或验证命令。

**前提** 相同 drift 状态下重复运行 update planning
**当** files、manifest 和 source 未变化
**则** conflicts 的 affected path、reason code 和 action 集合保持稳定
**并且** 不依赖 filesystem traversal order。

## Story 4.6: Explicit Repair For Recoverable Installer-Owned Drift（可恢复 Installer-Owned Drift 的显式修复）

作为项目维护者，
我希望通过 `speclite update --repair` 显式修复可安全恢复的 installer-owned drift，
以便恢复 `_speclite` metadata、runtime scripts 或 IDE mirrors 的 canonical 状态，同时继续保护人工配置和 workflow 产物。

**验收标准：**

**前提** 用户运行 `speclite update --repair`
**当** 系统进入 repair planning
**则** 只评估 installer-owned drift 是否可安全恢复或重建
**并且** human-owned custom 文件与 workflow-owned artifacts 始终排除在 repair overwrite 范围外。

**前提** drift 文件可以从 resolved canonical source 或 installed canonical package baseline 恢复
**当** 系统生成 repair plan
**则** 该路径可被标记为 `restore-canonical` 或 `regenerate` action
**并且** plan 会列出 affected path、ownership、current hash、expected hash 和 action。

**前提** repair planner 生成 `restore-canonical` 或 `regenerate` action
**当** action 进入 repair plan
**则** 每个 action 都必须包含 `RepairPlan.actions[].expectedHash`
**并且** `regenerate` 必须先 dry-run candidate content，计算 expected hash 后才能进入 repair plan。

**前提** 缺少 resolved canonical source 或 installed canonical package baseline
**当** repair 无法证明可安全恢复
**则** 该路径进入 conflict
**并且** reason code 为 `missing-source-evidence` 或 owning SPEC 定义的等价稳定值。

**前提** 用户以脚本模式运行 `update --repair` 且未传入 `--yes`
**当** repair plan 需要写入授权
**则** 命令输出 unapplied repair plan
**并且** 不写入任何文件。

**前提** 用户确认 repair plan 或传入 `--yes`
**当** 系统执行 repair 写入
**则** 只修改 repair plan 中获授权的 installer-owned paths
**并且** 使用 project operation lock 与 safe write。

**前提** repair 完成
**当** 系统生成结果
**则** 输出 changed paths、skipped paths、remaining conflicts 和 suggested validation command
**并且** 不生成 standalone report artifact、backup/restore 或顶级 `speclite repair` 命令。

**前提** 相同 drift 状态下重复生成 repair plan
**当** source evidence、manifest 和 files index 未变化
**则** affected path、hash、reason code 和 action 集合保持稳定
**并且** consumer/parser 必须容忍 unknown future reason codes，不得仅因 code unknown 而 parsing failed。
