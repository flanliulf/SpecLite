# Examples（示例）

## Example 1：Scaffold Docs Structure（创建文档结构）

### Input（输入）

用户要求：

> 为开源项目创建 `docs/` 目录结构，包含 tutorials、how-to、explanation、reference。

### Process（处理）

1. 读取现有 `docs/`、README 和 `package.json`。
2. 判断是否已有稳定入口，例如 `docs/quick-start.md`。
3. 创建目录级 `index.md` 和必要占位页。
4. 更新 `docs/index.md`，保留旧入口。
5. 运行 `git diff --check`。

### Output（输出）

- `docs/tutorials/index.md`
- `docs/how-to/index.md`
- `docs/explanation/index.md`
- `docs/reference/index.md`
- 更新后的 `docs/index.md`

## Example 2：Write Reference（编写参考文档）

### Input（输入）

用户要求：

> 写一份 CLI reference。

### Process（处理）

1. 读取 CLI entrypoint 和 command registration。
2. 列出命令、参数、输出格式和典型调用。
3. 将设计原因链接到 `docs/explanation/`，不在 Reference 中展开长解释。
4. 更新 `docs/reference/index.md`。

### Output（输出）

- `docs/reference/cli.md`
- 更新后的 `docs/reference/index.md`

## Example 3：Validate Rendering Target（验证渲染目标）

### Input（输入）

用户要求：

> 检查文档是否适合 GitHub 和 npm。

### Process（处理）

1. 搜索 `:::note`、`:::tip`、`:::caution`。
2. 检查 README 和 package `files` 是否仍指向存在路径。
3. 检查目标 docs tooling 是否被误写成当前门禁。
4. 运行 `git diff --check`。
