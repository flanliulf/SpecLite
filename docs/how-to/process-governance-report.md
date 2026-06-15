# Process Governance Report（流程治理报告）

`speclite governance-report` 从目标项目的 installed-state evidence 生成只读流程治理覆盖报告。

## Run Command（运行命令）

在 SpecLite tool repo 中运行：

```sh
npm run dev -- governance-report /path/to/target-project
```

输出 JSON：

```sh
npm run dev -- governance-report /path/to/target-project --json
```

## Metrics（指标）

报告包含四个核心指标：

- `phaseEntryCoverage`：来自 `_speclite/_config/phase-coverage.json` 的阶段入口覆盖。
- `artifactPresenceRate`：来自 `phaseCoverage.rows[].artifactContract` 的标准产物存在与 metadata contract 检查。
- `validatePassRate`：基于 `speclite validate` 已检查 categories 和 `ValidationIssue` 聚合。
- `openGapCount`：阶段缺口与 artifact contract issue 的数量。

## Scope Boundary（范围边界）

报告只检查本地 contract evidence：

- manifest/index 是否可读。
- phase coverage target 是否 mapped。
- workflow artifact path、existence 和 metadata 是否符合 artifact contract。
- validate output 是否存在 blocking issue。

报告不会判断文档内容质量、人工 review 是否充分或团队真实执行质量。

## Extensions（扩展）

趋势、导出、多项目或团队视角只能建立在 MVP phase coverage matrix 与 validate output 之上。不要把这些扩展实现为 Web dashboard、数据库趋势服务、后台 daemon 或 hosted registry UI，除非未来有新的 owning SPEC 明确授权。
