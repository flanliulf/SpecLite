# Replace Python Resolvers With Node Parity（用 Node 兼容替代 Python 解析器）

SpecLite MVP 将实现 Node/TypeScript config 与 customization resolver 作为正式运行入口，不把 `resolve_config.py` 或 `resolve_customization.py` 作为安装后 skills 的长期运行时依赖。现有 Python resolver 的四层 config merge、三层 customization merge、`--key` 抽取、缺失 key 行为、错误处理和 JSON 输出语义作为 Python Resolver Baseline（Python 解析器基线）保留；Node resolver 必须通过 parity fixtures 证明兼容后，才能替代 skill instructions 中的 Python 调用。`speclite resolve config` 与 `speclite resolve customization` 是 MVP runtime support command（运行时支撑命令），用于给 skills 暴露稳定 Resolver Runtime Entry（解析器运行入口）；skills 不得绑定 `node dist/...` 等内部构建产物路径。字段、stdout/stderr、merge、fallback、layer failure、array merge 和 fixture 细节以 `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 为 canonical contract；本 ADR 只记录为什么用 Node parity 替代 Python runtime dependency。

## Runtime Guidance（运行时建议）

当安装后 skill 仍按旧指令直接执行 `python3 resolve_config.py` 或 `python3 resolve_customization.py` 时，`python3` 可能解析到系统或 Xcode 附带的 Python 3.9，导致标准库 `tomllib` 缺失并触发 Python 3.11+ 检查失败。该问题不是 resolver merge 语义错误，而是运行时入口绑定到不稳定的裸 `python3`。

- Short Term（短期）：在 Node parity 入口替代旧 Python 调用前，人工执行或调试 resolver 时显式使用已确认支持 `tomllib` 的解释器，例如 `python3.12`、`pyenv exec python3`，或其它 Python 3.11+ 解释器。
- Medium Term（中期）：本机开发环境应让预期的 Python 版本管理器接管裸 `python3`，例如把 `~/.pyenv/shims` 放入 `PATH` 并初始化 `pyenv`；若使用 Conda，则应明确激活包含 Python 3.11+ 的环境。不要假设所有 macOS 机器的 `/usr/bin/python3` 都满足 resolver 要求。
- Long Term（长期）：产品和 skill instructions 应收敛到 `speclite resolve config` 与 `speclite resolve customization`，由 Node/TypeScript resolver 提供稳定运行时入口；Python resolver 继续作为 parity baseline 和故障诊断参照，不应成为安装后 skill 的长期执行依赖。
