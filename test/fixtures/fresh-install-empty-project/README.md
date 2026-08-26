# Fresh Install Empty Project（空项目 Fresh Install）

本 fixture 是 Story 6.2 的 release gate fixture project case。

本 fixture 的 `input/` 目录保持为空，用于验证 empty target project fresh install。Expected outputs 覆盖：

- `_speclite`
- `_speclite-output`
- `.claude/skills`
- `.agents/skills`
- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/phase-coverage.json`

当前默认 `core` + `sdlc` baseline 必须安装 68 个 canonical package roots，并在 `.claude/skills` 与 `.agents/skills` 中各生成 68 个 `SKILL.md` mirror entries。这个 count 只属于 default no-ecosystem fixture，不是 selected ecosystem installs 的全局 truth。技术生态 Skill 仅在选择对应 ecosystem module 时安装。

Selected ecosystem release gate matrix 由独立 fixture case 承担：

- `fresh-install-selected-backend-ecosystem`：选择 `ecosystem-backend-java-springboot`，并断言 Node.js / Python backend、frontend、other 和 support packages 不出现。
- `fresh-install-selected-frontend-ecosystem`：选择 `ecosystem-frontend-react`，并断言 Vue、backend、other 和 support packages 不出现。
- `fresh-install-selected-other-ecosystem`：选择 `ecosystem-other-npm-package`，并断言 CLI tool、documentation-only、frontend、backend 和 support packages 不出现。

Ready summary 只能在 `ReadyCheck` 成功后出现；failure expected outputs 不得包含 ready summary 或 release-ready summary。All path fields and expected tree entries use project-relative POSIX-style paths.
