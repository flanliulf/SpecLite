# Story Candidates（Story 候选）— 2026-10-02

本文记录 2026-10-02 在下游多机终端配置环境排查 installed Skill 激活失败时发现、需要作为后续 Story 规划的事项。它尚未进入 `sprint-status.yaml`，不表示已排期或已批准；给出证据、产品诉求依据、待裁决方案与验收草案，供规划下一 Epic 或 backlog 整理时裁决。

## SC-1 Installed Skill 的 `speclite` 定位顺序与 unavailable 诊断

- **现象**：在 GUI 启动的 agent 应用（Claude 桌面应用）中执行 `/speclite-agent-analyst`，preflight `command -v speclite` 失败并 HALT；同一台机器的交互终端中 `speclite --version` 为 `0.4.1`。CLI 实际安装在 fnm 管理的 Node 下（`$FNM_DIR/aliases/default/bin/speclite`）。
- **根因**：fnm、nvm、volta、asdf 等版本管理器通常在 `.zshrc` 中注入 `PATH`。GUI 应用只在启动时解析一次 Shell 环境，agent 的 Bash 工具、hooks、MCP 继承这份环境；`.zshrc` 后来才加入初始化，或应用启动早于安装时，AI session PATH 中就没有 `speclite`。另外 bin 入口为 `#!/usr/bin/env node`，即使给出 `speclite` 绝对路径，`node` 不在 `PATH` 时仍然失败。
- **现状契约**：Epic 9 规定 installed skill activation 只有一个默认 resolver entry `speclite resolve`，CLI unavailable 必须 HALT，不得回退 Python resolver、手写 TOML merge 或读取 source checkout；glossary 将"CLI 已安装但不在此 PATH 中"定义为 unavailable。`assets/source` 下 29 个文件携带同一 preflight 文案，`speclite-agent-lint` 的 `check_agent_skill.py` 强制该文案。
- **问题**：
  1. HALT 不区分 not installed 与 installed but not exposed；next action 只写"暴露或安装 Node CLI 后重试"，未给出包名。实际观察到 agent 据此自行推断了一个与发布包不一致的包名并建议全局安装；remediation 缺少完整包名会诱导安装非官方包，构成供应链风险。发布包名为 `@fancyliu/speclite`。
  2. 用户无法从 HALT 得知真实修复路径：重启 GUI agent 应用，或在登录 profile 中暴露版本管理器的稳定 bin 路径。
- **产品诉求**：保持 Epic 9 的 fail-closed 意图（不回退到其他 resolver）；但 CLI unavailable 是安装后的第一个体验点，remediation 必须可执行，且不得诱导安装错误的包。
- **待裁决方案**：
  - **A 契约不变，增强诊断**：preflight 失败后做只读探测，仅用于诊断、不执行候选二进制。探测位置：`${FNM_DIR:-$HOME/.local/share/fnm}/aliases/default/bin`、`${NVM_DIR:-$HOME/.nvm}/versions/node/*/bin`、`${VOLTA_HOME:-$HOME/.volta}/bin`、`npm prefix -g` 的 `bin`（`npm` 可用时）。HALT 文案分两态：not installed 给出 `npm install -g @fancyliu/speclite`；installed but not exposed 给出命中路径，以及"完全退出并重开 GUI agent 应用"和"在 `~/.zprofile` 暴露稳定 bin 路径"两条 remediation。
  - **B 修订契约，允许有界定位**：`PATH` 未命中时按固定顺序定位同一个 Node CLI，以 `PATH="<bin>:$PATH" speclite …` 调用（同时满足 `env node`），并在输出中报告实际使用的路径；仍禁止 Python resolver、TOML merge 与 source checkout。需修订 Epic 9 glossary 的 AI session PATH 定义并记录变更理由。
  - 倾向 A 先行（零契约变更、立即消除错误包名风险），B 作为后续契约决策。
- **验收草案（方案 A）**：
  - 29 个 source 文件的 preflight 文案与 lint 规则同步；`check_agent_skill.py` 接受两态文案，并拒绝不含完整包名 `@fancyliu/speclite` 的安装 remediation。
  - 用共享 preflight 片段或由 `speclite-agent-lint` 校验一致性，避免 29 处手工复制漂移。
  - 测试：临时 HOME 与受限 `PATH` 下，分别构造 not installed、fnm installed but not exposed、nvm installed but not exposed 三种 fixture，断言 HALT 文案与 remediation；断言探测过程未执行任何候选二进制。
  - `docs/how-to/use-installed-skills.md` 增加 GUI agent 应用 `PATH` 排障小节；Epic 9 glossary 的 AI session PATH 条目补充两态诊断说明。
- **关联文档**：`_bmad-output/planning-artifacts/epics/12-epic-9-installed-runtime-activation-contract-hardening已安装-runtime-激活契约收口.md`、`docs/reference/glossary/epics/epic-09-installed-runtime-activation-contract-hardening.md`、`docs/how-to/use-installed-skills.md`、`assets/source/speclite/support-skills/speclite-agent-lint/references/lint-rules.md`。

## Related Evidence（相关证据）

- 下游复现：Claude 桌面应用重启前，agent 的 `PATH` 来自应用启动时的旧 Shell 环境，不含 fnm；在登录 profile 暴露稳定路径并重启应用后，`speclite` `0.4.1` 可解析，activation 正常。
- 下游缓解：`terminal-config-shared` 的 `bootstrap.sh --profile` 向 `~/.zprofile` 写入 `$FNM_DIR/aliases/default/bin` 与 pyenv shims，并在新机器指南中要求重启 GUI agent 应用。该缓解只覆盖使用该配置仓库的机器，不替代 SpecLite 自身的诊断。
- `npm view @fancyliu/speclite` 于 2026-10-02 返回 `0.4.1`。
