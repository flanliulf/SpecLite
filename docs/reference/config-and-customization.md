# Config And Customization（配置与定制）

本文记录 SpecLite installed project 中 `_speclite/config.toml`、`_speclite/config.user.toml` 和 `_speclite/custom/*.toml` 的职责边界。它是 Reference 文档，用于快速判断某个配置应该由 installer 生成、由团队提交，还是由个人本地覆盖。

## Files（文件）

| Path | Ownership | Commit Guidance | Purpose |
|---|---|---|---|
| `_speclite/config.toml` | `installer-owned` | 提交 | 共享 runtime config，由 install / init 生成。 |
| `_speclite/config.user.toml` | `installer-owned` | 不提交 | 本地用户安装回答，由 install / init 生成。 |
| `_speclite/custom/config.toml` | `human-owned` | 通常提交 | 团队级 project config override。 |
| `_speclite/custom/config.user.toml` | `human-owned` | 不提交 | 个人级 project config override。 |
| `_speclite/custom/<skill>.toml` | `human-owned` | 通常提交 | 团队级 Skill customization override。 |
| `_speclite/custom/<skill>.user.toml` | `human-owned` | 不提交 | 个人级 Skill customization override。 |

Installer 可以读取 human-owned customization 参与解析，但不能把它们当作 installer output 重写、格式化或删除。

## Runtime Config（运行时配置）

`_speclite/config.toml` 当前包含 shared project/runtime sections：

| Section | Fields | Notes |
|---|---|---|
| `[core]` | `project_name`、`user_name`、`communication_language`、`document_output_language`、`output_folder`、`brainstorming_artifacts` | 共享项目标识、语言和 Core artifact root。 |
| `[modules.sdlc]` | `user_skill_level`、`analysis_artifacts`、`planning_artifacts`、`solutioning_artifacts`、`implementation_artifacts`、`devops_artifacts`、`project_knowledge` | SDLC artifact roots 和 Project Knowledge 目录。 |
| `[agents.<agent-id>]` | `module`、`team`、`name`、`title`、`icon`、`description` | 从 `module.yaml` Agent roster 生成的 runtime Agent descriptor。 |
| `[hooks.<hook-id>]` | `module`、`source_skill`、`protected_skill` 或 `protected_surface`、`description`、`runtime_root`、`runner`、`events`、`platform_configs`、`trust_note` | 从 canonical hook source 生成的 runtime Hook descriptor。 |

`_speclite/config.user.toml` 当前包含 user-local sections：

| Section | Fields | Notes |
|---|---|---|
| `[core]` | `user_name`、`communication_language` | 影响对话称呼和人类输出语言。 |
| `[modules.sdlc]` | `user_skill_level` | 影响 Agent 解释概念的细致程度。 |

## Agent Descriptors（Agent 描述符）

Agent descriptor 是 install-time projection，用于让 runtime config 记录当前 selected modules 中可用的 role activation agents。当前 SDLC roster 的 ID、`name` 与 `title` 以 [`skills/agent-roster.md`](skills/agent-roster.md) 为唯一源定义。

Descriptor 不替代 installed Skill package。完整 persona、menu、persistent facts 和 activation protocol 仍以对应 `.claude/skills/<agent-id>/` 或 `.agents/skills/<agent-id>/` 中的 `SKILL.md` / `customize.toml` 为准。

## Hook Descriptors（Hook 描述符）

Hook descriptor 记录 installed hook 的来源、保护对象和运行入口。当前默认 descriptors 是 `hooks.flow-gate-enforcement` 和 `hooks.canonical-source-change-check`：

| Field | Meaning |
|---|---|
| `source_skill` | 产生 hook 语义或检查清单的 Skill，例如 `speclite-flow-gate` 或 `speclite-check-canonical-source-change`。 |
| `protected_skill` | 受 hook 保护的 Skill。`flow-gate-enforcement` 使用 `speclite-dev-story`。 |
| `protected_surface` | 受 hook 观察的路径边界。`canonical-source-change-check` 使用 `assets/source/speclite`。 |
| `runtime_root` | 安装后的 hook root，例如 `{project-root}/_speclite/hooks/flow-gate-enforcement`。 |
| `runner` | hook runner 入口，例如 `{project-root}/_speclite/hooks/flow-gate-enforcement/runner.mjs`。 |
| `events` | hook 订阅事件。当前 registry 覆盖 `UserPromptSubmit`、`PostToolUse` 和 `Stop`。 |
| `platform_configs` | 可能生成的 IDE hook config，当前为 `.claude/settings.json` 和 `.codex/hooks.json`。Codex 使用 event-keyed `{"hooks": {"Event": [...]}}` 形态。 |
| `trust_note` | Codex hooks 需要用户本地 review/trust 的提示。 |

Hook descriptor 只描述 installed runtime。是否真正执行，还取决于 IDE target、平台 hook config 和本地 trust 状态。

## Customization Boundaries（定制边界）

| Need | Use |
|---|---|
| 固定团队共享项目配置 | `_speclite/custom/config.toml` |
| 固定个人本地偏好 | `_speclite/custom/config.user.toml` |
| 覆盖某个 Skill 的团队默认行为 | `_speclite/custom/<skill>.toml` |
| 覆盖某个 Skill 的个人默认行为 | `_speclite/custom/<skill>.user.toml` |
| 改变 installer 生成的 official default | 重新运行 `speclite init` 或 `speclite install`，不要手改 `_speclite/config.toml`。 |

> Caution: 不要把 `_speclite/custom/*.toml` 当作 installer-owned 文件。它们是 human-owned，update 会 skip，uninstall 会 preserve。

## Resolution Commands（解析命令）

默认 Skill activation 应使用 Node CLI resolver：

```sh
speclite resolve config --project-root /path/to/project
speclite resolve artifact-roots --project-root /path/to/project
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project
```

`resolve config` 输出 raw merged config，并保留既有 `--key` 对 merged config 的选择语义；它不会为缺失的 artifact root 合成 fallback。需要消费 SPEC 09 root resolver 的 `resolvedRoot`、`resolutionMode`、`plane`、`ownership`、`contractRefs` 和 source/provenance evidence 时，使用 `resolve artifact-roots`；需要发现 PRD、Epics、Architecture 的 whole/sharded subject document 时，使用 `resolve artifact-documents` 并只消费其 `consumedPaths`。

默认 stdout 是 JSON object。需要人工排查时才使用 `--human`：

```sh
speclite resolve config --project-root /path/to/project --key core.project_name --human
speclite resolve artifact-roots --project-root /path/to/project --human
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project --key agent.menu --human
```

Artifact-root resolver 的默认 lifecycle 是 `existing`；fresh install 或 fresh install fixture 校验可显式传入 `--lifecycle fresh`。Existing install 中新增 root 缺失时，resolver 可将符合 SPEC 09 的兼容解析标记为 `legacy-compatible`，但不得把 fallback 写回 config，也不表示 workflow-owned artifacts 已迁移。

Legacy Python resolver scripts 可能存在于 `_speclite/scripts/`，但它们是 compatibility assets，不是默认 activation resolver。

## Related Documents（相关文档）

| Topic | Link |
|---|---|
| Runtime layout | [`runtime-layout.md`](runtime-layout.md) |
| Runtime boundaries | [`../explanation/runtime-boundaries.md`](../explanation/runtime-boundaries.md) |
| File ownership model | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| CLI resolve reference | [`cli.md`](cli.md#resolve-options解析参数) |
| Agent explanation | [`../explanation/speclite-agents.md`](../explanation/speclite-agents.md) |

> Generated by（生成说明）：本文初稿由 `speclite-agent-docs-steward` Skill 生成；后续以人工维护的正文为准。
