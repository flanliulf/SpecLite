# CLI Tool Contract Audit Workflow（CLI 工具契约审计流程）

## Evidence（证据）

优先读取目标项目中的 manifest `bin`、entry files、command parser、README、tests、fixtures、CI、install instructions 和真实 command output。命令行为、exit code、JSON contract 或 shell portability 结论必须有代码、测试、文档或命令输出支撑。

## Review Dimensions（审查维度）

- Command boundary：binary name、entry file、runtime、package manager invocation。
- Command surface：subcommands、options、args、help text、localized output、JSON mode。
- I/O behavior：stdout/stderr 分界、TTY / non-TTY、exit code、signal handling、error formatting。
- Portability：POSIX shell、Windows path assumptions、env vars、cwd assumptions、Node/runtime version。
- Install smoke：local package exec、global install、`npx` / package-manager exec、tarball install。
- Drift：README 示例、tests、implementation 和 generated help 之间的不一致。

## Output（输出）

输出 Markdown 应包含 `Evidence Summary（证据摘要）`、`Command Surface（命令面）`、`Runtime Behavior（运行行为）`、`Install Smoke Plan（安装冒烟计划）`、`Drift（漂移）` 和 `Unknowns（未知项）`。
