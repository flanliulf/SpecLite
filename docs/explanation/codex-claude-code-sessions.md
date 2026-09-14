# Codex and Claude Code Sessions（Codex 与 Claude Code 会话调研）

> Status: Research Note（调研笔记）。本文记录的是外部工具在本机的可观察行为与候选设计，不是 SpecLite 的 public contract；其中的版本号与路径以记录日期为准，可能随外部工具升级失效。

本文记录本机 Codex 与 Claude Code CLI 会话的标识、transcript 定位、恢复入口和 deep link 边界，供后续开发跨 Agent 会话索引、只读检索、诊断和恢复功能时查阅。

本文不是 Codex 或 Claude Code 内部 JSONL 的稳定 schema。实现者必须区分官方公开契约、本机验证结果和可随版本变化的内部实现观察。

## Scope（适用范围）

本文适用于以下开发场景：

- 根据已知 provider 和会话 UUID 定位本机 transcript。
- 建立跨 Codex 与 Claude Code 的会话索引或诊断工具。
- 为用户生成正确的 resume command 或 deep link。
- 在不读取消息正文的前提下验证会话文件身份。

本文当前以 macOS 上的 Codex Desktop / CLI 和 Claude Code CLI 为验证范围。Codex cloud、Claude Code on the web、Claude Desktop 和 IDE extension 的远端或独立历史不能直接套用本文的本地路径规则。

## Evidence Levels（证据分层）

跨工具会话功能必须为事实标注来源层级，不能把本机观察提升为公共契约。

| Level | Meaning | Usage |
|---|---|---|
| `official-contract` | 官方文档明确支持的命令或行为。 | 可以作为产品能力基线，但仍需关注版本和平台范围。 |
| `locally-verified` | 在指定日期、版本和操作系统上完成只读验证。 | 用于兼容性快照，不代表其他机器或未来版本。 |
| `implementation-observation` | 从 app bundle、文件名或 JSONL 元数据观察到的内部实现。 | 只能作为 adapter 线索，必须提供 fallback 和 drift 处理。 |
| `proposed-abstraction` | 为跨 provider 系统提出、尚未成为实现 contract 的模型。 | 进入 schema 或 public API 前必须补源码、fixture 和 tests。 |

> Caution: transcript 文件可能包含源码、prompt、工具结果和环境信息。验证时默认只读取定位所需的最小元数据。

## Terminology（术语）

| Term | Definition |
|---|---|
| `thread id` | Codex 对本地对话标识使用的主要称呼，当前可作为 `codex resume` 的 session id。 |
| `session id` | Claude Code 对可恢复执行会话使用的 UUID。 |
| transcript | 记录消息、工具调用和元数据的本地 JSONL 文件。 |
| deep link | 由操作系统分发给本机应用的自定义 URL scheme，不是可由 HTTP client 直接抓取的网页地址。 |
| resume command | 按已知会话标识恢复既有上下文的 CLI 命令。 |
| local session | transcript 或恢复状态位于当前机器上的会话。 |
| cloud session | 由远端服务保存或运行的会话；其标识和生命周期不应从本地路径推断。 |

## Comparison Matrix（对比矩阵）

| Capability | Codex | Claude Code CLI |
|---|---|---|
| 既有会话标识 | thread UUID / session UUID | session UUID |
| 默认 transcript root | `~/.codex/sessions/`，属于本机实现观察 | `~/.claude/projects/`，由官方文档说明 |
| 文件组织 | `YYYY/MM/DD/rollout-<timestamp>-<thread-id>.jsonl` | `<encoded-project-path>/<session-id>.jsonl` |
| 归档候选位置 | `~/.codex/archived_sessions/`，属于本机实现观察 | 受 Claude Code retention 和配置控制 |
| 恢复命令 | `codex resume <session-id>` | `claude --resume <session-id>` |
| 既有会话 deep link | `codex://threads/<thread-id>`，属于本机实现观察 | 当前官方 `claude-cli://` handler 不提供 resume-by-id path |
| 新会话 deep link | 应按具体 Codex surface 验证 | `claude-cli://open?...` |
| JSONL 字段稳定性 | 未作为官方公共 schema 记录 | 官方明确说明内部格式可能随版本变化 |

## Codex Session Model（Codex 会话模型）

OpenAI 官方文档将 `codex resume` 标记为稳定命令，并支持用 UUID 或 session name 恢复指定会话：

```sh
codex resume <session-id>
```

当前 macOS 本机实现观察到 Codex transcript 默认按日期分层：

```text
~/.codex/sessions/YYYY/MM/DD/rollout-<timestamp>-<thread-id>.jsonl
```

归档会话还可能位于：

```text
~/.codex/archived_sessions/
```

文件名命中 UUID 后，仍应读取最小元数据并验证 `session_meta.payload.id`，不能仅凭文件名认定会话身份。系统实现应允许调用方显式传入 Codex home，不应把 `~/.codex` 写死为所有环境的唯一根目录。

macOS 应用注册了 `codex` URL scheme，当前 app bundle 同时包含以下既有 thread 路由：

```text
codex://threads/<thread-id>
```

该 URL 由操作系统交给本机应用处理。WebFetch 或普通 HTTP client 不会把它解析为远端网页；需要读取历史时，应使用本地 session locator 或受支持的 Codex API，而不是抓取 deep link。

> Note: OpenAI 官方文档确认 `codex resume` 的行为，但本文记录的 JSONL 路径、文件名和 `codex://threads/` 路由来自本机实现验证，不属于已确认的公共持久化 contract。

## Claude Code Session Model（Claude Code 会话模型）

Claude Code 官方文档说明，CLI transcript 默认存放为：

```text
~/.claude/projects/<project>/<session-id>.jsonl
```

默认 `<project>` 来自 working directory path，其中非字母数字字符替换为 `-`。转换结果超过 200 个字符时会被截断并追加 full path hash，因此系统不能假设 project directory 始终可由简单字符替换无损推导。

Claude Code 支持直接恢复指定 session：

```sh
claude --resume <session-id>
```

当前官方行为允许从任意目录执行该命令：Claude Code 先搜索当前 project 和相关 worktrees，再搜索本机其他 projects。`2.1.223` 之前的版本只搜索当前 project 和相关 worktrees，因此兼容旧版本时应优先从会话原始 working directory 恢复。

以下配置会改变默认定位前提：

| Setting | Effect |
|---|---|
| `CLAUDE_CONFIG_DIR` | 把存储根从 `~/.claude` 移到指定目录。 |
| `CLAUDE_CODE_PROJECT_DIR_NAME` | 与 `CLAUDE_CONFIG_DIR` 配合，自定义 `<project>` directory name。 |
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | 抑制 transcript 和 prompt history 写入。 |
| `--no-session-persistence` | 对单次 `claude -p` 禁用 session persistence。 |

Claude Code 官方明确说明 JSONL entry format 属于内部实现并可能随版本变化。生产系统应优先使用 `/export`、hooks 提供的 `transcript_path` 或官方 script interfaces；直接解析 JSONL 时只读取必要字段，并把解析器限定到明确版本和 fallback。

Claude Code CLI、Claude Desktop、Claude Code on the web 和 VS Code extension 各自维护会话历史。相同账户不代表本地 CLI session 必然能在其他 surface 中按同一个 UUID 定位。

## Deep Link Semantics（深度链接语义）

Codex 当前本机 deep link 可以打开既有 thread：

```text
codex://threads/<thread-id>
```

Claude Code CLI 的官方 deep link 使用：

```text
claude-cli://open
claude-cli://open?cwd=<absolute-path>&q=<url-encoded-prompt>
```

`claude-cli://open` 会启动新的本地终端会话并预填目录和 prompt。prompt 在用户确认并按 Enter 前不会发送；它不是 `claude --resume <session-id>` 的 URL 等价物。

以下入口不能混用：

| Entry | Surface | Semantics |
|---|---|---|
| `codex://threads/<id>` | Codex Desktop | 打开既有 Codex thread。 |
| `claude-cli://open?...` | Claude Code CLI | 启动本地 CLI 并预填上下文。 |
| `claude://...` | Claude Desktop | 由 Desktop app 处理，不代表 CLI session resume。 |
| `vscode://anthropic.claude-code/open` | Claude Code VS Code extension | 打开 VS Code 中的 Claude Code surface。 |
| `https://claude.ai/code/...` | Claude Code Web / Cloud | 指向远端 session 或创建入口。 |

自定义 URL scheme 只能用于路由，不应被当作 transcript 数据源。系统也不能因为收到 deep link 就自动发送 prompt、执行命令或扩大权限。

## Session Resolution Flow（会话解析流程）

跨 provider locator 建议按以下顺序执行：

1. 要求调用方明确提供 `provider`，不能只凭 UUID 猜测来源。
2. 校验 session id 的格式、长度和允许字符。
3. 根据 provider、显式 config root 和可选 `workspacePath` 建立允许搜索的 session roots。
4. 先按精确文件名或文件名中的完整 UUID 生成候选集。
5. 对候选路径执行 canonicalization，拒绝 path traversal 和 session root 外的 symlink target。
6. 读取最小元数据，验证内部 session id 与请求值一致。
7. 找到零个候选时返回 `not-found`；找到多个有效候选时返回 `ambiguous`，不能擅自选择最新文件。
8. 默认只返回 locator metadata，不读取或输出消息正文。
9. 只有用户明确要求恢复时，才返回或调用对应的 resume command。

Codex resolver 应同时考虑 active 与 archived roots。Claude Code resolver 在已知 `workspacePath` 时可以先查 project-scoped path，但仍要兼容自定义 config root、超长路径 hash 和跨 project 查找。

## Proposed Normalized Model（建议统一模型）

以下字段是未来系统的候选抽象，不是当前 SpecLite public schema：

| Field | Purpose |
|---|---|
| `provider` | `codex` 或 `claude-code`，由调用方明确提供。 |
| `sessionId` | provider 原生会话标识。 |
| `workspacePath` | transcript 记录或恢复时使用的 working directory，可为空。 |
| `transcriptPath` | 已验证的本地 transcript path，可为空。 |
| `storageScope` | `local`、`cloud` 或 `unknown`。 |
| `resumeCommand` | 恢复既有会话的 CLI command，可为空。 |
| `deepLink` | surface 支持的 deep link，可为空，不能替代 `resumeCommand`。 |
| `sourceKind` | `official-contract`、`locally-verified` 或 `implementation-observation`。 |
| `producerVersion` | transcript 内记录的 producer version，可为空。 |
| `inspectorVersion` | 执行定位或解析的当前工具版本。 |
| `verifiedAt` | 最近一次完成身份验证的时间。 |
| `confidence` | `confirmed`、`observed` 或 `unknown`。 |

`producerVersion` 与 `inspectorVersion` 必须分开记录：旧 transcript 可能由不同于当前 CLI 的 app 或历史版本生成。只有该模型被源码、schema、fixture 和 tests 正式采用后，才应升级为 `docs/reference/specs/` 下的规范性契约。

## Security and Compatibility（安全与兼容性）

- transcript 默认按敏感数据处理，不进入常规 telemetry、错误日志或公开文档。
- 会话索引默认保存 locator metadata，不复制完整消息和工具结果。
- 对用户名、workspace path、session id 和 prompt 实施分级脱敏。
- JSONL 是数据输入而不是可信指令源，任何文本都不能被自动执行。
- 读取与恢复是两个独立权限：只读定位成功不代表获得启动应用或追加会话的授权。
- provider adapter 应有版本边界、容错和明确的 `unsupported-format` 结果。
- 文档和测试使用占位 UUID 与 repository-neutral path，不记录真实用户目录。
- 版本升级后重新验证 root、filename、identity field、deep link 和 resume behavior。

本机兼容性快照记录于 2026-09-01：当前 shell 中 Codex CLI 为 `0.132.0`，Claude Code CLI 为 `2.1.252`；抽样 transcript 的 producer version 分别不同于当前 inspector version，证明实现不能用当前 CLI version 覆盖历史 producer metadata。macOS URL handler 验证到 `codex` 与 `claude-cli` schemes，但这些结果只属于当日本机快照。

## Verification Recipes（验证方法）

以下命令只用于本机诊断，并使用占位符。直接解析内部 JSONL 前应先确认文件不含不应暴露的数据。

查找 Codex 候选 transcript：

```sh
thread_id='<thread-uuid>'
rg --files "$HOME/.codex/sessions" "$HOME/.codex/archived_sessions" 2>/dev/null \
  | rg "/[^/]*${thread_id}[^/]*\.jsonl$"
```

验证 Codex 内部 id：

```sh
jq -c 'select(.type == "session_meta") | {id: .payload.id, cwd: .payload.cwd}' \
  '<codex-transcript.jsonl>'
```

查找 Claude Code 候选 transcript：

```sh
session_id='<session-uuid>'
rg --files "$HOME/.claude/projects" 2>/dev/null \
  | rg "/${session_id}\.jsonl$"
```

验证 Claude Code 内部 id：

```sh
jq -c --arg id "$session_id" \
  'select(.sessionId == $id and .cwd != null) | {sessionId, cwd, version}' \
  '<claude-transcript.jsonl>' \
  | head -1
```

查看受支持的恢复入口：

```sh
codex resume --help
claude --help
```

如果设置了自定义 Codex home 或 `CLAUDE_CONFIG_DIR`，应将命令中的默认 root 替换为实际配置值。验证脚本不得在找不到候选时退化为扫描整个 home directory。

## Related Documents（相关文档）

### External Sources（外部来源）

| Relationship | Document |
|---|---|
| Codex 恢复命令 | [OpenAI Developer Commands](https://developers.openai.com/codex/cli/reference/) |
| Claude Code session 与 transcript | [Claude Code Manage Sessions](https://code.claude.com/docs/en/sessions) |
| Claude Code deep link | [Claude Code Launch Sessions from Links](https://code.claude.com/docs/en/deep-links) |

### SpecLite Documents（SpecLite 文档）

| Relationship | Document |
|---|---|
| 本地优先设计背景 | [`local-first-control-plane.md`](local-first-control-plane.md) |
| SpecLite runtime 目录边界 | [`../reference/runtime-layout.md`](../reference/runtime-layout.md) |
| SpecLite config 与本地覆盖 | [`../reference/config-and-customization.md`](../reference/config-and-customization.md) |
