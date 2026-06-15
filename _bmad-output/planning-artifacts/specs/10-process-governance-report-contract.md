# Process Governance Report Contract（流程治理报告契约）

## Purpose（目的）

`speclite governance-report` 是 Post-MVP 只读报告命令。它基于已安装的 MVP evidence 生成流程治理覆盖报告，用于展示阶段入口覆盖率、标准产物存在率、validate 通过率和未解决缺口数量。

本契约只定义 machine-readable report fields 和 human-readable section requirements，不评价文档 prose quality、人工 review 是否充分或团队真实执行质量。

## Inputs（输入）

报告只能消费本地 installed-state evidence：

- `_speclite/_config/manifest.yaml`
- `_speclite/_config/skill-index.json`
- `_speclite/_config/help-index.json`
- `_speclite/_config/files-index.json`
- `_speclite/_config/phase-coverage.json`
- `speclite validate` 复用的 `ValidationIssue` output
- `phaseCoverage.rows[].artifactContract` 指向的 workflow artifact paths

报告不得访问 remote source，不得依赖 Story 7.5 的 `list` output，不得改变 `install`、`status`、`validate`、`update` 的核心契约。

## CommandResult Payload（CommandResult 载荷）

`speclite governance-report --json` 输出 `CommandResult<GovernanceReportData>`，其中 top-level envelope 复用 `01-command-result-json-contract.md`。

```ts
type RatioMetric = {
  covered: number;
  total: number;
  rate: number;
};

type GovernanceReportData = {
  metrics: {
    phaseEntryCoverage: RatioMetric;
    artifactPresenceRate: RatioMetric;
    validatePassRate: RatioMetric;
    openGapCount: number;
  };
  phaseGaps: GovernancePhaseGap[];
  artifactChecks: GovernanceArtifactCheck[];
  validateIssueCounts: ValidationIssueCounts;
  checkedCategories: IssueCategory[];
  validatedPaths: string[];
  scope: {
    manifestPath: "_speclite/_config/manifest.yaml";
    phaseCoveragePath: "_speclite/_config/phase-coverage.json";
    artifactRoot: string;
  };
};
```

`rate` 必须是 `covered / total`，保留稳定数字；当 `total === 0` 时输出 `0`。

## Phase Gaps（阶段缺口）

`phaseGaps[]` 必须来自 `_speclite/_config/phase-coverage.json`，并按 `phaseId -> moduleId -> canonicalSkillId -> canonical target order` deterministic 排序。

```ts
type GovernancePhaseGap = {
  phaseId: string;
  phaseLabel: string;
  moduleId: string;
  canonicalSkillId: string;
  targetId: string;
  missingReason: "missing-target-entry" | "unsupported-target" | "failed-target";
};
```

阶段缺口同时通过 `ValidationIssue` 表示：

- `category: "menu-target"`
- `issueId: "menu-target.phase-entry-gap"`
- `affectedPath: "_speclite/_config/phase-coverage.json"`
- `details` 包含 `phaseId`、`phaseLabel`、`moduleId`、`canonicalSkillId`、`targetId`、`reason`

不得定义第二套 phase identity、skill identity 或 target identity。

## Artifact Checks（产物检查）

`artifactChecks[]` 必须来自 `phaseCoverage.rows[].artifactContract`，并复用 artifact path validation。

```ts
type GovernanceArtifactCheck = {
  artifactType: string;
  defaultOutputPath: string;
  present: boolean;
  valid: boolean;
  artifactPaths: string[];
  issueIds: string[];
};
```

`present` 只表示 contract path 下发现了 workflow artifact entity；`valid` 表示该 artifact contract 没有产生 `artifact-path` issue。报告不得基于文档内容质量、人工 review 结论或团队真实执行质量计算覆盖率。

当 contract path 存在但没有 discoverable artifact entity 时，报告可产生：

- `category: "artifact-path"`
- `issueId: "artifact-path.missing-required-artifact"`
- `affectedPath: defaultOutputPath`

metadata 不合法时继续复用 `artifact-path.missing-required-metadata` 或 `artifact-path.invalid-required-metadata`。

## Human Output（人类可读输出）

Human-readable report 必须包含以下 section：

- `Summary`
- `Scope`
- `Metrics`
- `Gaps`
- `Issues`
- `Next Actions`

Human output 可以添加 `Artifacts` section，但不得省略上述 section。

## Redaction（脱敏）

所有 public JSON path fields 必须是 project-relative POSIX path 或 `"."`。报告不得输出 home directory、absolute target path、cache path、temporary extraction path、credential、token、hash 或 timestamp-shaped diagnostic value。

## Extension Boundary（扩展边界）

趋势、导出、多项目或团队视角只能在 MVP phase coverage matrix 与 validate output 的基础上扩展。它们不得要求 Web dashboard、数据库趋势服务、后台 daemon 或 hosted registry UI，也不得改变 MVP command contracts。
