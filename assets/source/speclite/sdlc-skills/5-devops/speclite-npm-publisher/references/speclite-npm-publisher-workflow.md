# Node npm Publisher Workflow

## Purpose（目标）

本文档承载 `speclite-npm-publisher` 的详细执行标准。入口 `SKILL.md` 只保留流程骨架；当任务涉及 npm 发布准备、正式发布、发布后验证或发布故障恢复时，按本文档执行。

## Scope（适用范围）

适用：

- 开源 Node.js package 发布到 public npm registry。
- CLI package、library package、同时包含 `bin` 与 `exports` 的混合 package。
- scoped public package，例如 `@scope/name`。
- monorepo 中的单个 package，前提是先定位具体 package directory。

不适用：

- private package、内部 registry、GitHub Packages、Verdaccio 或企业制品库，除非用户明确要求改写 registry 策略。
- 非 npm 生态发布，例如 PyPI、Maven、Cargo、Docker、Homebrew。
- 仅审查 README 或发布文档的任务；这类任务优先使用 `npm-release-docs-checker`。

## Intent Gate（意图门禁）

先把用户请求归类：

| 用户意图 | 行为 |
| --- | --- |
| 问"怎么发布"或"现在能不能发布" | 只读审计并给证据，不修改文件，不运行 publish |
| 要"准备发布"或"修复发布门禁" | 只修改用户授权文件，修复后运行验证 |
| 要"发布到 npm" | 先完成所有门禁，再展示确认清单，等待用户确认后发布 |
| 要"处理发布失败" | 先收集错误码、registry、auth、package、version 和最近命令，不重试同版本 publish |

正式 publish 前必须展示：

- package name 和 version。
- publish registry。
- 将执行的 publish command。
- 是否 scoped public package。
- 发布后验证计划。
- 当前 git status 摘要。

用户没有确认前，不运行 `npm publish`。

## Contract Audit（发布契约审计）

在 package directory 执行，只从真实文件取事实：

```bash
git status --short
npm config get registry
npm whoami --registry https://registry.npmjs.org/
node -e "const p=require('./package.json'); console.log(JSON.stringify({name:p.name,version:p.version,private:p.private,license:p.license,bin:p.bin,main:p.main,exports:p.exports,types:p.types,files:p.files,publishConfig:p.publishConfig,scripts:p.scripts,repository:p.repository,homepage:p.homepage,bugs:p.bugs,engines:p.engines}, null, 2))"
```

必须判断：

- `package.json` 存在，`name` 和 `version` 非空。
- `private` 不是 `true`；若为 `true`，必须要求用户明确解除或解释例外。
- `version` 不是占位版本，例如 `0.0.0`，并符合 SemVer。
- 开源 package 应有 `license`；若缺失根目录 `LICENSE`，先报告，不猜版权持有人。
- public package 应有 `repository`、`homepage`、`bugs`；`keywords` 和 `author` 推荐补齐。
- scoped public package 应有 `publishConfig.access = "public"`，并固定官方 registry。
- `files`、`.npmignore`、构建输出和 README / docs / LICENSE / CHANGELOG 的包含关系一致。
- `bin` 存在时，构建后 bin 路径必须存在、可执行，并能在安装后的 `.bin` symlink 场景运行。
- `exports`、`main`、`module` 或 `types` 存在时，构建输出必须存在，并设计对应 library smoke。

工作树不干净时：

- 列出 dirty files。
- 确认这些变更是否就是要发布的内容。
- 如果 dirty files 与发布无关，要求用户先处理或明确继续。
- 不使用 `git add -A`、不自动 commit、不清理无关变更。

## Version Occupancy（版本占用）

发布前读取目标：

```bash
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
npm view "$name@$version" version --registry https://registry.npmjs.org/
```

解释规则：

- 查到版本：停止。该版本已发布，不能复用。按变更语义选择 `npm version patch|minor|major --no-git-tag-version`，再重跑全部门禁。
- 返回 read-side 404：通常表示该版本未发布；继续前仍需确认 `npm whoami` 是官方 registry 登录态。
- unscoped package 名已被他人占用：不能发布到同名 package；要求用户更名或改 scoped package。
- scoped package 首发 404 不等于失败；publish 时还要处理 scope 权限和 public access。

## Prepublish Gates（发布前门禁）

按顺序执行，失败就停止并修复根因：

1. 官方 registry 登录态：

   ```bash
   npm whoami --registry https://registry.npmjs.org/
   ```

   如果失败，使用官方 registry 重新登录：

   ```bash
   npm logout --registry https://registry.npmjs.org/
   npm login --registry https://registry.npmjs.org/ --auth-type=legacy
   ```

2. 项目 release gate：

   - 如果存在 `scripts.release:check`，优先运行：

     ```bash
     npm run release:check
     ```

   - 否则基于现有 scripts 组合运行，不凭空假设：

     ```bash
     npm run build
     npm test
     npm run lint
     npm run typecheck
     ```

     只运行 `package.json.scripts` 中真实存在的命令。

3. 真实 tarball：

   ```bash
   tmp_pack=$(mktemp -d "${TMPDIR:-/tmp}/npm-pack.XXXXXX")
   npm pack --pack-destination "$tmp_pack" --json
   tar -tf "$tmp_pack"/*.tgz | sort
   ```

   检查 tarball：

   - 应包含构建产物、README、LICENSE、必要 docs、types、assets。
   - 不应包含 `.env`、token、测试缓存、AI 工具目录、内部主机名、临时文件。
   - 不用 `npm pack --dry-run` 替代真实 tarball install smoke。

4. 干净安装 smoke：

   ```bash
   tmp_install=$(mktemp -d "${TMPDIR:-/tmp}/npm-install.XXXXXX")
   cd "$tmp_install"
   npm init -y >/dev/null
   npm install "$tmp_pack"/*.tgz --registry https://registry.npmjs.org/
   ```

   CLI package：

   - 从 `package.json.bin` 读取 bin 名。
   - 优先运行已记录为无副作用的命令，例如 `--version`、`--help`。
   - 如果 CLI 没有无副作用命令，询问用户提供 smoke command。
   - 必须覆盖安装后的 `.bin` symlink，不只运行源码入口。

   Library package：

   - 如果 `type = "module"` 或 `exports` 指向 ESM，使用 `node -e "import('package-name').then(()=>console.log('import ok'))"`。
   - 如果是 CommonJS，使用 `node -e "require('package-name'); console.log('require ok')"`。
   - 如果 package 需要特定 API 调用才能验证，询问用户提供 harmless smoke。
   - TypeScript package 如发布 `types`，可按项目现有命令或临时 consumer 做 type smoke；不要凭空创建复杂类型测试。

## Publish Execution（正式发布）

发布命令按 package 事实选择。

scoped public package：

```bash
npm publish --access public --registry https://registry.npmjs.org/ --auth-type=legacy
```

unscoped package：

```bash
npm publish --registry https://registry.npmjs.org/ --auth-type=legacy
```

规则：

- OTP、password、token、recovery code 只在终端提示中输入。
- 不把凭据写进脚本、文档、聊天记录、日志或 shell history。
- 不使用 `--force` 解决发布问题。
- 不重复 publish 同一版本。
- publish 命令失败后先诊断错误码，不机械重试。

## Postpublish Verification（发布后验证）

发布后按顺序验证：

```bash
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
npm view "$name@$version" name version dist-tags bin license repository homepage bugs --registry https://registry.npmjs.org/
npm dist-tag ls "$name" --registry https://registry.npmjs.org/
```

CLI package：

```bash
tmp_npx=$(mktemp -d "${TMPDIR:-/tmp}/npm-npx.XXXXXX")
(cd "$tmp_npx" && npx --yes "$name@$version" --version)
```

如果 CLI 不支持 `--version`，使用用户确认的 harmless command。不要在源码仓库根目录执行远端 `npx` 验证。

Clean install：

```bash
tmp_remote=$(mktemp -d "${TMPDIR:-/tmp}/npm-remote.XXXXXX")
cd "$tmp_remote"
npm init -y >/dev/null
npm install "$name@$version" --registry https://registry.npmjs.org/
```

随后按 package 类型执行 `.bin`、import 或 require smoke。

如果 `npm publish` 已成功返回，但 `npm view` 或 `npx` 暂时 404：

- 先检查 `npm dist-tag ls "$name"`、`npm access get status "$name"`、`npm search --searchlimit=5 "$name"`。
- 等待后重试 read-side 验证。
- 记录为 npm registry propagation delay 或 search index lag。
- 不重复发布同一版本。

## Incident Matrix（故障矩阵）

| 症状 | 常见原因 | 处理 |
| --- | --- | --- |
| `E401` 或 `ENEEDAUTH` | 官方 registry 未登录，或登录态属于镜像 registry | 对 `https://registry.npmjs.org/` 执行 `npm login --auth-type=legacy`，再 `npm whoami` |
| `EOTP` | 2FA 需要 OTP，或 OTP 过期 | 在终端交互输入新 OTP，不写入脚本或聊天 |
| `E404 Not Found - PUT scoped package` | scope 权限、登录态或 registry 配置问题 | 确认官方 registry、当前 npm 用户、scope 权限和 `--access public` |
| `E403` | 包名无权限、版本已存在、组织策略限制 | 查询 `npm view` 和账户权限；不要复用版本 |
| `npm view` 发布后短暂 404 | read-side propagation delay | 等待并复查 dist-tag/access/search，不重新 publish |
| `npx` 输出旧版本 | 在源码根目录解析到本地 package，或 dist-tag 未更新 | 到干净临时目录运行指定版本 `npx --yes name@version` |
| tarball 缺 dist 或 README | `files`、`.npmignore`、build script 或 pack 规则错误 | 修复包边界，重跑 build、pack、install smoke |
| `.bin` 执行失败 | bin 路径、shebang、权限、realpath 入口判断错误 | 在 clean install 后执行 `.bin`，修复入口并升级版本 |
| 默认 registry 是镜像 | `npm config get registry` 指向 npmmirror 等 | publish 和 auth 命令显式加官方 registry |

## Report Template（报告模板）

发布审计或发布完成后，如用户要求报告，写入：

```text
.specskills/output/devops/speclite-npm-publisher/<package-name>-<version>-release-report.md
```

报告至少包含：

- package name、version、registry、publish command。
- git status 摘要。
- metadata audit 结论。
- version occupancy 结论。
- prepublish gate 命令和结果。
- tarball 文件摘要和 smoke test 结果。
- publish 结果。
- postpublish verification 结果。
- 未解决风险和用户决策。

报告末尾追加：

```text
---

*本文档由 speclite-npm-publisher Skill 自动生成*
```

## Best Practices（最佳实践）

- 先验证官方 registry 登录态，再判断版本占用；不要把默认 registry 当作发布 registry。
- 先用真实 tarball 安装 smoke，再 publish；`npm pack --dry-run` 只能辅助看文件列表。
- CLI 包必须验证安装后的 `.bin` symlink；源码入口通过不代表 npm 安装后可运行。
- Library 包必须验证 consumer 视角的 import 或 require；构建成功不代表导出契约可用。
- 发布后同时查 metadata、dist-tag 和实际安装；只看 `npm publish` 返回不足以证明用户可用。
- read-side 404 与 publish failure 要分开诊断；同版本重复发布只会制造新问题。
- 任何安全凭据只通过终端交互输入，绝不落盘。

## Version（版本说明）

- v1.0.0 (2026-06-05): 初始版本。
