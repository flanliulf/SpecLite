# Fresh Install Empty Project（空项目 Fresh Install）

Story 1.1 只建立 install preflight、runtime/platform guard 与 expected command JSON skeleton。

本 fixture 的 `input/` 目录保持为空，用于验证 guard failure 不会创建或修改：

- `_speclite`
- `_speclite-output`
- `.claude/skills`
- `.agents/skills`

完整 fresh install 输出、manifest、IDE mirror 和 ready summary gate 由后续 Story 补齐。

