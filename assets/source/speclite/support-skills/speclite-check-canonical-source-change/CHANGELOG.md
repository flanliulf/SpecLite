# Changelog

## 1.2.0

- 新增 ecosystem module root 统计，报告 `ecosystems.total`、`ecosystems.packageRoots` 和 category breakdown。
- 扩展 `module-help.csv` 检查到 `assets/source/speclite/ecosystems/<category>/<id>/module-help.csv`。
- 保持 default install baseline 只计算 `core+sdlc`，避免未选择 ecosystem packages 混入默认安装总数。
- 扩展 stale count 扫描，识别 Story 10.1 前后的固定 core/sdlc baseline 文本。

## 1.1.0

- 新增 `canonical-governance.json` 治理映射读取、impacted classes 和 required followups 输出。
- 新增 `--mode strict`，将 `D0` warning 升级为 error，支持 CI / release gate 使用。
- 补充与 `speclite-canonical-source-governance-runner` 的职责边界。

## 1.0.0

- 新增 `speclite-check-canonical-source-change` support skill。
- 新增 canonical source 变更检查清单和只读 `check_canonical_source_change.mjs` 脚本。
- 覆盖 root counts、`module-help.csv`、hook source、baseline 常量、文档旧数字、fixtures、Codex hook config 形态和 packaging manifest 派生一致性。
