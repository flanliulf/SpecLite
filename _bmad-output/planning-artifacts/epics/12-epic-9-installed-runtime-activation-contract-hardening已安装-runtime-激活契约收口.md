# Epic 9: Installed Runtime Activation Contract Hardening（已安装 Runtime 激活契约收口）

SpecLite 已经具备 `speclite resolve config` 与 `speclite resolve customization` 的 Node CLI runtime support，但 canonical installed skill activation protocol 尚未全量收口。当前风险是：部分已安装 Agent / Workflow 仍直接读取 `_speclite/config.toml` 或调用 `_speclite/scripts/resolve_*.py`，导致目标项目中已存在于 merged runtime config 的字段被误判缺失，典型复现是 `/Users/fancyliu/Repos/noi` 中 `speclite-agent-analyst` 没有读取 `_speclite/config.user.toml` 的 `core.user_name` 与 `core.communication_language`。

本 Epic 是 corrective planning Epic。它不改变 `speclite resolve` 的 merge semantics、stdout/stderr machine contract 或 `CommandResult` JSON contract。它只收口 installed skill activation contract、AI 会话中的 CLI availability preflight、full canonical skill corpus regression gate，以及 Python resolver scripts 的兼容资产边界。

## Product Problem（产品问题）

当前 installed runtime contract 在三个层面存在断裂：

- `speclite resolve` 已是 Node/TypeScript runtime support command，但部分 canonical skill 文案仍绑定 legacy Python resolver 或单文件 `_speclite/config.toml`。
- AI 对话会话能否执行 `speclite resolve` 取决于 `speclite` binary 是否在该会话 `PATH` 中；现有 activation protocol 未把 CLI availability 作为明确 preflight。
- Python resolver scripts 的定位不清：源码和 packaging inventory 仍把它们当 runtime assets，但默认 skill activation 不应依赖它们。

## Product Thesis（产品主张）

Installed skill activation 必须只有一个默认 resolver entry：`speclite resolve`。如果 AI execution plane 无法运行 `speclite`，skill 必须明确 halt 为 CLI unavailable，而不是回退 Python resolver、手写 TOML merge、读取 source checkout 或把 merged config 缺失误报成用户配置错误。

## Scope（范围）

本 Epic 覆盖：

- canonical Agent / Workflow `SKILL.md` 与 activation references 的 Node CLI resolver migration。
- `command -v speclite` 或等价 CLI availability preflight 的 activation contract。
- Alice / `speclite-agent-analyst` merged config regression。
- full canonical skill corpus lint / fixture / release gate。
- Python resolver scripts 作为 compatibility assets 的 install、files-index、validate、update、repair、uninstall、packaging 和 docs 边界。

本 Epic 不覆盖：

- 改变 `speclite resolve` 的 default machine stdout、stderr JSON Lines、exit code、missing key behavior 或 merge order。
- 新增第二个 resolver command、wrapper daemon、background service 或 IDE-specific command pointer artifact。
- 重新实现 TOML merge 逻辑。
- 将 Python scripts 恢复为默认 activation fallback。
- 修改 unrelated skill persona、menu、workflow business logic 或 artifact content quality。

## Runtime Decision（运行时决策）

默认 activation contract：

```sh
command -v speclite >/dev/null 2>&1
speclite resolve config --project-root "$PROJECT_ROOT" --key core.user_name --key core.communication_language
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key agent
```

Workflow activation 使用：

```sh
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key workflow
speclite resolve customization --skill "$SKILL_ROOT" --project-root "$PROJECT_ROOT" --key workflow.on_complete
```

规则：

- `--project-root` 必须显式传入。
- 默认 mode 只消费 stdout JSON，不使用 `--human`。
- `speclite` unavailable 必须 halt，并输出明确 remediation。
- `config.toml.example` 只能作为字段结构参考。
- Python resolver scripts 只允许作为 compatibility / troubleshooting assets。

## Story List（Story 列表）

### Story 9.1: Installed Skill Activation Contract Hardening（已安装 Skill 激活契约收口）

把所有 canonical Agent / Workflow activation protocol 收口到 Node CLI resolver，新增 CLI availability preflight，更新 lint 和 full corpus tests，并用 Alice / NOI regression 证明 merged config 读取正确。

### Story 9.2: Python Resolver Compatibility Asset Projection（Python Resolver 兼容资产投影）

把 legacy Python resolver scripts 明确定义为 compatibility assets：可安装、可索引、可验证、可 repair、可卸载、可打包，但不得作为默认 skill activation path。

## Dependency / Sequencing（依赖与顺序）

Story 9.1 是 P0，优先执行。Story 9.2 是 P1，依赖 Story 9.1 对默认 activation path 的负向断言，避免兼容脚本被误引回默认路径。

## Completion Gate（完成门禁）

Epic 9 完成时必须满足：

- `/Users/fancyliu/Repos/noi` 这类安装目标中，Alice 不再因 `_speclite/config.toml` 单文件缺少字段而阻断。
- full canonical installed skill corpus 没有默认 Python resolver dependency。
- `speclite` 不在 AI 会话 `PATH` 时，activation 明确报告 CLI unavailable。
- Python scripts 即使安装，也只作为 `runtime-compat-script` 或等价兼容资产，不被 activation 文案引用。
- `npm test`、`npm run release:packaging-check` 和 agent lint/corpus tests 覆盖该 contract。
