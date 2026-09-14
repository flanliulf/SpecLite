# Epic 4: Safe Update And Repair Glossary（安全更新与修复术语表）

本文解释 Epic 4「Safe Update And Repair」中的英文组合术语，帮助维护者理解 ownership、plan-before-write、operation lock、conflict 和显式 repair 如何共同保护项目文件。

> Note: 本文解释的是 Epic 4 规划文档中的术语语义，不表示相应 Story 已经实施或通过验证。命令、字段、path、action 和 reason code 保留英文。

## Ownership Model（所有权模型）

| Term | 中文直译 | Definition |
|---|---|---|
| **ownership model** | 所有权模型 | 按谁有权修改文件，将 installed state 划分为 installer-owned、human-owned 和 workflow-owned。 |
| **installer-owned** | Installer 所有 | 由 SpecLite installer 生成和维护的文件；update 或 repair 仍须依据 manifest/hash 和授权判断能否修改。 |
| **human-owned** | 人工所有 | 由团队或个人维护的 custom TOML 等文件，installer 不得覆盖、重排、格式化或删除。 |
| **workflow-owned** | Workflow 所有 | 由 Workflow 和项目维护者管理的过程产物，install、update 和 repair 不得纳入 overwrite plan。 |
| **protected file boundary** | 受保护文件边界 | 根据 ownership 和 path 划定的不可自动覆盖范围。 |
| **ownership projection** | 所有权投影 | Manifest/files index 对每个受管理文件 ownership 的结构化记录。 |
| **create-if-absent stub** | 不存在时创建的存根 | 只在文件不存在时创建的 human-owned custom 入口；已存在内容必须保持逐字不变。 |
| **Skill-specific stub** | Skill 专属存根 | `_speclite/custom/{skill}.toml` 或 `.user.toml`；fresh install 不为每个 installed Skill 自动生成。 |
| **ownership conflict** | 所有权冲突 | 文件的路径、manifest 记录和实际用途无法得出唯一 owner 时的状态，必须诊断而非猜测。 |

## Merge And Resolve（合并与解析）

| Term | 中文直译 | Definition |
|---|---|---|
| **config precedence** | 配置优先级 | `_speclite/config.toml` → `config.user.toml` → team custom → user custom 的固定覆盖顺序。 |
| **customization precedence** | 自定义优先级 | Skill defaults → team `{skill}.toml` → user `{skill}.user.toml` 的固定覆盖顺序。 |
| **unified resolver** | 统一解析器 | Install、update、repair 和 Skill execution 共同使用的 config/customization 解析实现。 |
| **optional custom layer** | 可选自定义层 | 可以缺失的 human-owned TOML 层；缺失按 `{}` 处理，解析失败产生 warning 并进入保守规划。 |
| **conservative planning** | 保守规划 | 当信息不完整但尚无 error/critical 时，继续生成不冒险覆盖文件的计划。 |
| **resolve parity fixture** | Resolve 一致性 Fixture | 验证不同调用方获得相同 merge 结果的 fixture，防止 update/repair 引入私有 merge logic。 |

## Plan Before Write（写入前计划）

| Term | 中文直译 | Definition |
|---|---|---|
| **plan-before-write** | 写前计划 | 任何修改发生前先生成、展示并授权 update 或 repair plan 的安全原则。 |
| **update plan** | 更新计划 | 比较 expected state 与 current installed state 后形成的结构化计划，列出 effect、path、ownership、hash 和 action。 |
| **expected state** | 预期状态 | Resolved canonical source、配置和 installed contract 推导出的目标状态。 |
| **current installed state** | 当前安装状态 | 命令运行时从 target project 实际读取的 manifest、indexes 和文件内容。 |
| **planned effect** | 计划效果 | 计划对某个路径产生的 create、update、skip、conflict 等结果，尚不表示已执行。 |
| **proposed action** | 建议动作 | Plan 建议对路径执行的具体动作。 |
| **impact summary** | 影响总结 | 写入授权前汇总 changed、skipped、conflict paths 和 protected boundaries 的 human-readable 视图。 |
| **unapplied plan** | 未应用计划 | 已计算但尚未被授权执行的计划；脚本模式未传 `--yes` 时必须保持此状态。 |
| **actual apply result** | 实际应用结果 | 写入阶段完成后记录的真实 changed、skipped 和 remaining conflict 结果，不能与 planned effect 混为一谈。 |
| **changed path** | 变更路径 | 本次获授权且实际发生变化的 project-relative path。 |
| **skipped path** | 跳过路径 | 因保护、无变化或其他明确 reason 未执行写入的路径。 |

## Operation Lock And Safe Write（操作锁与安全写入）

| Term | 中文直译 | Definition |
|---|---|---|
| **project operation lock** | 项目操作锁 | `_speclite/.lock` 表示的项目级写入互斥锁，所有 write-capable commands 在修改文件前必须取得。 |
| **write-capable command** | 可写命令 | 可能创建、修改或删除 target project 文件的命令。 |
| **project locked** | 项目锁定 | 另一个操作持有 lock、当前命令不能安全写入的状态，对应 `operation-lock.project-locked`。 |
| **non-reentrant lock** | 非重入锁 | 同一 process 也不能通过再次调用 public command path 重复获取锁。内部 orchestration 只能传递 private lock handle。 |
| **private lock handle** | 私有锁句柄 | 内部调用链复用已取得 lock 的非公开句柄，不进入 CLI 或 public JSON contract。 |
| **stale lock** | 过期锁 | 看似存在但可能已无对应活动操作的 lock；只读 validate 可以 warning，但不能自动删除。 |
| **safe write** | 安全写入 | 使用 temp-write + rename 或等价方式降低中途失败导致目标文件损坏的写入策略。 |
| **temp-write + rename** | 临时写入+重命名 | 先在目标文件同目录写临时文件，再以原子或近似原子 rename 替换目标的方式。 |
| **temporary marker** | 临时标记 | `.speclite-tmp-` 临时文件标识；临时文件不能进入 manifest/index、public JSON 或 stable fixture。 |
| **partial failure** | 部分失败 | 写入链路只完成部分步骤后失败的状态，结果必须如实区分 completed、failed 和 pending。 |
| **unsafe overwrite** | 不安全覆盖 | 无法证明不会破坏用户修改、ownership 边界或 current state 的覆盖操作，必须被阻断。 |

## Conflict Detection（冲突检测）

| Term | 中文直译 | Definition |
|---|---|---|
| **local drift** | 本地漂移 | 当前文件内容或 hash 与 files index baseline 不一致，可能来自用户修改或外部工具。 |
| **conflict** | 冲突 | Update 无法证明某项 planned write 安全时形成的阻断项，原文件保持不变。 |
| **default non-overwrite** | 默认不覆盖 | 普通 update 遇到 drift 或不确定 ownership 时默认不覆盖。 |
| **IDE mirror drift conflict** | IDE镜像漂移冲突 | Installed Skill package 与 manifest baseline 不一致，普通 update 不直接恢复 canonical content。 |
| **command-level planning blocker** | 命令级规划阻断项 | 表示整个 plan 存在阻断的单一 issue，例如 `update.conflicts`。 |
| **path-level conflict** | 路径级冲突 | `data.conflicts` 中逐路径记录 ownership、reason code 和 next step 的条目，不重复扩增为多个 command-level issues。 |
| **reason code** | 原因码 | 从 owning SPEC registry 选择的稳定冲突原因标识，供 automation 和 human renderer 共享。 |
| **conflict summary** | 冲突摘要 | 汇总 affected path、ownership、reason 和 suggested next step 的输出。 |
| **stable conflict set** | 稳定冲突集 | Source、manifest 和 files 未变化时，重复 planning 得到相同 path、reason code 和 action 集合。 |

## Explicit Repair（显式修复）

| Term | 中文直译 | Definition |
|---|---|---|
| **explicit repair** | 显式修复 | 用户通过 `speclite update --repair` 明确请求恢复可证明安全的 installer-owned drift。 |
| **repair planning** | 修复规划 | 在写入前判断每个 installer-owned drift 是否具有充分 source/hash evidence 的过程。 |
| **repair eligibility** | 修复适用性 | 某个 path 能否从 resolved canonical source 或 installed package baseline 安全恢复的判断。 |
| **repair plan** | 修复计划 | 只包含可授权 installer-owned actions 的计划，并列出 path、current hash、expected hash 和 action。 |
| **restore-canonical** | 恢复 Canonical 内容 | 直接用有证据支持的 canonical content 恢复 drift 文件的 repair action。 |
| **regenerate** | 重新生成 | 根据当前 contract 重新生成文件的 repair action；进入 plan 前必须 dry-run 并计算 `expectedHash`。 |
| **dry-run candidate content** | Dry-run 候选内容 | 不写入 target file 的情况下先生成候选内容，用于证明 regenerate 的预期 hash。 |
| **expected hash** | 预期哈希值 | Repair action 预计写入内容的 hash，写入授权和结果验证都以它为依据。 |
| **missing source evidence** | 缺失来源证据 | 缺少 canonical source 或 baseline、无法证明安全恢复的 conflict reason，例如 `missing-source-evidence`。 |
| **remaining conflict** | 剩余冲突 | Repair 执行后仍不能安全解决、需要 manual action 的冲突。 |
| **suggested validation command** | 建议验证命令 | Repair 完成后用于复核 installed state 的明确 validate 命令。 |
| **unknown future reason code tolerance** | 未知未来原因码兼容性 | Consumer 遇到未来新增 reason code 时仍能解析整体 plan，而不是因不认识 code 直接失败。 |

## Safety Boundaries（安全边界）

| Term | 中文直译 | Definition |
|---|---|---|
| **path escape** | 路径逃逸 | Planned path 通过 `..` 或 absolute path 离开 target project boundary。 |
| **symlink escape** | 符号链接逃逸 | Project 内路径经 symlink 解析后指向边界外。 |
| **case conflict** | 大小写冲突 | 大小写规则不同的平台上，两个路径可能解析为同一文件的冲突。 |
| **protected boundary** | 保护边界 | Human-owned 和 workflow-owned 内容永远排除在普通 update/repair overwrite 范围外。 |
| **manual action** | 手动操作 | 工具无法安全自动处理时，明确交给维护者判断和执行的步骤。 |
| **backup/restore exclusion** | 备份/恢复排除 | Epic 4 的 repair 不承诺通用 backup/restore 系统，也不引入顶级 `speclite repair` 命令。 |

## Common Distinctions（常见区别）

| Do Not Confuse | Difference |
|---|---|
| **update plan vs. apply result** | Plan 描述可能发生什么；apply result 记录实际发生了什么。 |
| **skipped path vs. conflict** | Skipped 有明确不执行原因且未必阻断；conflict 表示安全性无法证明并阻断相关写入。 |
| **ordinary update vs. explicit repair** | Ordinary update 不覆盖 drift；explicit repair 只恢复有证据支持的 installer-owned drift。 |
| **restore-canonical vs. regenerate** | 前者复制已知 canonical content；后者根据 contract 生成新 content，并先 dry-run。 |
| **operation lock vs. write authorization** | Lock 防止并发写入；authorization 表示用户允许执行 plan，两者缺一不可。 |
| **human-owned vs. installer-owned config** | Custom TOML 由人维护；installer 初始化配置可由工具管理，但仍受 hash 和 plan 保护。 |
| **warning diagnostic vs. safe-to-overwrite** | Optional layer warning 允许继续保守规划，不表示相关文件可以自动覆盖。 |

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 更新与修复指南 | [`../../../how-to/update-and-repair.md`](../../../how-to/update-and-repair.md) |
| 文件所有权术语 | [`../file-ownership.md`](../file-ownership.md) |
| 配置与 customization 参考 | [`../../config-and-customization.md`](../../config-and-customization.md) |
| Validation issues | [`../../validation-issues.md`](../../validation-issues.md) |
| Runtime 边界解释 | [`../../../explanation/runtime-boundaries.md`](../../../explanation/runtime-boundaries.md) |
