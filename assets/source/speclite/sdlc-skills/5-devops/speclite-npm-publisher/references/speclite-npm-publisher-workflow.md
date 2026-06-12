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
| 要"bugfix 后发布"或"feature 后发布" | 进入 SpecLite Iteration Release SOP，先版本升级和门禁，再提交推送，最后本机半自动 publish |

正式 publish 前必须展示：

- package name 和 version。
- publish registry。
- 将执行的 publish command。
- 是否 scoped public package。
- 发布后验证计划。
- 当前 git status 摘要。

用户没有确认前，不运行 `npm publish`。

## SpecLite Iteration Release SOP（SpecLite 迭代发布 SOP）

当任务是 bugfix / feature 后的常规交付，必须按下面顺序执行。不得把这些步骤拆成互不知情的 commit、push 和 publish 动作。

### Step 0：工作树边界审计

执行：

```bash
git status --short --untracked-files=all
git diff --stat
git log --oneline -10
```

规则：

- 标出本次 bugfix / feature 相关文件、发布基线文件和无关 dirty files。
- 无关 dirty files 必须排除、stash、单独提交，或得到用户明确确认后才可进入发布内容。
- `package.json.files` 会纳入 tarball 的文件必须特别核对；如果内容会被发布，就必须在 publish 前提交并推送。
- 不允许从 dirty worktree 执行 `npm publish`。
- 不允许先 publish 再补 Git commit；如果已经发生，必须立即补交已发布内容并推送，恢复 Git 与 npm tarball 对齐。

### Step 1：选择目标 SemVer

默认规则：

| 变更类型 | 默认版本动作 |
| --- | --- |
| bugfix | patch |
| feature | minor |
| breaking change | major |

选择目标版本后，先检查是否已存在：

```bash
name=$(node -p "require('./package.json').name")
npm view "$name@<target-version>" version --registry https://registry.npmjs.org/
```

若目标版本已存在，停止并选择下一个 SemVer。已发布版本绝不复用。

### Step 2：在 commit 前升级版本

版本升级必须发生在 release commit 之前：

```bash
npm version <target-version> --no-git-tag-version
```

随后同步所有 version-bound 文件，例如：

- `package-lock.json`。
- CLI `--version` smoke test。
- release metadata tests。
- command JSON fixtures。
- source integrity / installed-state fixtures。
- `dist/packaging-manifest.json`。

如果项目有自定义 version sync 脚本，优先使用项目脚本；没有脚本时只改真实受版本绑定的文件，不做全仓盲替换。

### Step 3：发布前门禁

执行项目发布门禁：

```bash
npm run release:check
```

若失败，先修复根因并重跑。通过后记录：

- 运行命令。
- test file / test count。
- packaging check 结果。
- 是否刷新 `dist/packaging-manifest.json`。

### Step 4：提交与推送

按主题拆分提交，常见顺序：

```text
fix(<scope>): 修复...
feat(<scope>): 添加...
build(release): 准备 <version> 发布基线
docs(<scope>): 更新随包发布文档
```

规则：

- 只使用 `git add -- <明确文件>`，禁止 `git add -A` 和 `git add .`。
- 默认中文 Conventional Commit。
- 敏感文件扫描必须在 commit 前执行。
- 版本升级、manifest、fixtures 和 release gate 刷新必须进入 release baseline commit。
- 推送目标默认 `origin/main`，但执行前要读取真实 upstream。

执行后核对：

```bash
git log --oneline -3
git status --short --untracked-files=all
git push origin main
```

### Step 5：建立 clean publish context

正式发布必须来自 clean `HEAD`。

如果当前工作区 clean，可以直接发布。若存在无关 dirty files，使用 clean worktree：

```bash
publish_root=$(mktemp -d "${TMPDIR:-/tmp}/speclite-publish.XXXXXX")
git worktree add --detach "$publish_root" HEAD
cd "$publish_root"
npm ci
npm run release:check
```

如果项目会把 temporary path 识别为不可信 source，使用仓库同级目录创建 clean worktree，而不是 `/tmp`。

发布完成或阻塞后清理 worktree：

```bash
git worktree remove "$publish_root" --force
```

### Step 6：本机半自动 publish

本机半自动模式中，agent 负责审计、门禁、命令准备和结果解析；用户负责终端中的 npm login、浏览器 security key / 2FA 确认和 OTP 输入。

发布前检查：

```bash
npm whoami --registry https://registry.npmjs.org/
```

若未登录，由用户在本机终端执行：

```bash
npm login --registry https://registry.npmjs.org/ --auth-type=legacy
```

正式发布命令按 package 类型选择。对于 scoped public package：

```bash
npm publish --access public --registry https://registry.npmjs.org/ --auth-type=legacy
```

成功证据：

```text
+ <package-name>@<version>
```

出现该行即可判定 publish 写侧成功。即使 `npm view` 短时间仍旧版本，也不能重复 publish 同一版本。

### Step 7：发布后延迟验证

立即执行：

```bash
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
npm view "$name@$version" version --registry https://registry.npmjs.org/
npm dist-tag ls "$name" --registry https://registry.npmjs.org/
npm access get status "$name" --registry https://registry.npmjs.org/
npm view "$name" versions --json --registry https://registry.npmjs.org/
```

如果 read-side 仍未出现新版本，但 publish 输出已有成功行：

- 记录为 npm registry propagation delay。
- 按 30 秒、2 分钟、5 分钟、10 分钟节奏重试。
- 重试期间不重复发布、不回退版本、不改 tag 绕过。

最终 consumer 验证必须在干净目录执行：

```bash
tmp_npx=$(mktemp -d "${TMPDIR:-/tmp}/npm-npx.XXXXXX")
(cd "$tmp_npx" && npx --yes "$name@$version" --version)
```

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
- 如果 dirty files 与发布无关，要求用户先处理、stash、单独提交或使用 clean worktree。
- 如果 dirty files 位于 `package.json.files` 覆盖范围内，默认视为会进入 tarball；publish 前必须提交推送或明确排除。
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
- 不要求 agent、MCP 或 Computer Use 自动点击 security key 页面、读取 OTP 或输入密码；这些属于人工认证边界。
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

## Claude/Codex Hook Guardrails（Claude/Codex Hooks 防护）

Hooks 是 deterministic 防护层，不是发布编排层。Skill 仍负责 SemVer 判断、提交分组、用户确认、publish 输出解析和传播判断；hooks 只阻断明显危险动作或提示遗漏。

适用来源：

- Claude Code hooks：可在工具调用前后、会话停止等生命周期运行 shell / HTTP / prompt hook。
- Codex hooks：可在 Codex agentic loop 中运行 deterministic scripts，并通过 hook review / trust 机制管理。

### Pre-command Blocking（命令前阻断）

建议拦截命令模式：

| 命令模式 | 默认动作 | 阻断条件 |
| --- | --- | --- |
| `npm publish*` | block unless all gates pass | 工作区 dirty、目标版本已存在、未推送、未跑 release gate、manifest 与 package version 不一致 |
| `npm version*` | allow with warning | 有 unrelated dirty files，或用户未确认 SemVer |
| `git push*` | block on release residue | release 文件仍 staged/unstaged、敏感文件命中、当前分支与目标不一致 |
| `git add -A` / `git add .` | block | 要求改用 `git add -- <明确文件>` |
| `npm dist-tag add*` | block unless incident-approved | 避免用 dist-tag 掩盖 publish 或 propagation 问题 |

`npm publish` 前 hook 应检查：

```bash
test -z "$(git status --short --untracked-files=all)"
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
node -e "const p=require('./dist/packaging-manifest.json'); const j=require('./package.json'); if (p.packageJson.version !== j.version) process.exit(1)"
npm view "$name@$version" version --registry https://registry.npmjs.org/ >/dev/null 2>&1 && exit 1 || true
git rev-parse --abbrev-ref --symbolic-full-name @{upstream} >/dev/null
```

项目可以用本地 sentinel 记录最近一次 release gate，例如 `.specskills/output/devops/speclite-npm-publisher/release-check.json`。如果没有 sentinel，不应让 hook 伪造通过；应提示执行 `npm run release:check`。

### Post-edit / Stop Warnings（编辑后或停止前提醒）

建议在关键文件变更后提示：

- `package.json` version 已改但 `package-lock.json` 未同步。
- `package.json`、`src/**`、`assets/source/**` 已改但没有新的 `dist/packaging-manifest.json`。
- `package.json.files` 覆盖的 docs 已改但未纳入 release commit。
- `assets/source/**/SKILL.md` 已改但对应 `SKILL.en.md` 或 `CHANGELOG.md` 未同步。
- release baseline commit 后工作区仍有会进入 tarball 的 dirty files。

### Hook Output Policy（Hook 输出策略）

Hook 输出应短而可执行：

- 说明阻断的命令。
- 给出失败条件。
- 给出下一条可执行命令。
- 不输出 token、OTP、cookie、完整 `.npmrc` 或浏览器认证 URL。

示例阻断消息：

```text
Blocked npm publish: worktree is dirty and docs/quick-start.md is included by package.json.files.
Commit or stash the file, rerun npm run release:check, then publish from clean HEAD.
```

### Manual Auth Boundary（人工认证边界）

Hooks 不应绕过 npm security key、browser confirmation、password 或 OTP。若 `npm publish` 进入交互认证，agent 必须停止自动化操作并要求用户在本机终端完成认证。用户贴出最后的 `npm publish` 输出后，Skill 负责解析是否出现 `+ <package>@<version>`，并进入延迟验证。

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
- SemVer 选择依据和 version bump 命令。
- commit hashes、commit messages 和 push 目标。
- metadata audit 结论。
- version occupancy 结论。
- prepublish gate 命令和结果。
- tarball 文件摘要和 smoke test 结果。
- clean publish context 路径或说明。
- hook guardrail 结果：通过、阻断或未配置。
- 人工认证边界说明：是否由用户完成 login / security key / OTP。
- publish 结果。
- postpublish verification 结果。
- propagation retry 时间点和结果。
- 未解决风险和用户决策。

报告末尾追加：

```text
---

*本文档由 speclite-npm-publisher Skill 自动生成*
```

## Best Practices（最佳实践）

- 先验证官方 registry 登录态，再判断版本占用；不要把默认 registry 当作发布 registry。
- bugfix / feature 的发布版本必须在 commit 前升级；发布基线 commit 应包含 `package.json`、`package-lock.json`、版本绑定测试/fixture 和 packaging manifest。
- commit/push 是 publish 前门禁的一部分，不是 publish 后清理动作。
- 从 clean `HEAD` 或 clean worktree publish；本地脏文件即使"只是文档"也可能进入 tarball。
- 先用真实 tarball 安装 smoke，再 publish；`npm pack --dry-run` 只能辅助看文件列表。
- CLI 包必须验证安装后的 `.bin` symlink；源码入口通过不代表 npm 安装后可运行。
- Library 包必须验证 consumer 视角的 import 或 require；构建成功不代表导出契约可用。
- 发布后同时查 metadata、dist-tag 和实际安装；只看 `npm publish` 返回不足以证明用户可用。
- read-side 404 与 publish failure 要分开诊断；同版本重复发布只会制造新问题。
- 任何安全凭据只通过终端交互输入，绝不落盘。
- Claude/Codex hooks 只做 deterministic 阻断和提醒；不要把 hooks 当作发布流程的唯一状态机。

## Version（版本说明）

- v1.1.0 (2026-06-12): 增加 SpecLite bugfix / feature 迭代发布 SOP、本机半自动 npm publish、commit/push gate、clean publish context、Claude/Codex hook guardrails 和 propagation retry schedule。
- v1.0.0 (2026-06-05): 初始版本。
