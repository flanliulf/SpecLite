#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const auditDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(auditDir, "../../../..");
const resultsDir = path.join(auditDir, "results");
const matrixPath = path.join(resultsDir, "rule-coverage-matrix.json");
const consistencyPath = path.join(resultsDir, "rule-consistency-findings.json");

if (!fs.existsSync(matrixPath)) {
  console.error(`Missing input: ${matrixPath}. Run audit-canonical-skill-rule-coverage.mjs first.`);
  process.exit(1);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function fileLink(relativeFile, line) {
  return `[${relativeFile}](${path.join(repoRoot, relativeFile)}${line ? `:${line}` : ""})`;
}

function groupBy(items, keyFn) {
  return Object.groupBy(items, keyFn);
}

function firstOccurrence(items) {
  return items[0]?.occurrences?.[0] ?? { file: "", line: 0, context: "" };
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function isStoryOnlyGap(missingExpectedLayers) {
  return missingExpectedLayers.length === 1 && missingExpectedLayers[0] === "stories";
}

function classifyCoverageGroup({ risk, category, value, missingExpectedLayers }) {
  if (risk === "MISSING_EXPECTED_LAYER") {
    if (
      (category === "runtime-config-reference" || category === "artifact-path-contract") &&
      /(planning_artifacts|implementation_artifacts|project_knowledge)/i.test(value)
    ) {
      return {
        disposition: "TRUE_GAP",
        bucket: "SYSTEM_CONTRACT_GAP",
        priority: "P1",
        action:
          "在 Architecture/Specs 层补齐 runtime artifact roots 与 workflow artifact roots 的统一契约；Epic 层只引用该契约，不重复定义。",
      };
    }
    if (category === "equivalent-implementation-policy" && /Functional Anchor/i.test(value)) {
      return {
        disposition: "TRUE_GAP",
        bucket: "ANCHOR_POLICY_GAP",
        priority: "P1",
        action:
          "在 Epic/Story creation guidance 中明确 Contract / Functional / Evidence / Guidance Anchor 的层级含义和使用场景。",
      };
    }
  }

  if (risk === "MISSING_STORY_COVERAGE") {
    if (isStoryOnlyGap(missingExpectedLayers)) {
      if (category === "flow-gate-mode" || category === "flow-gate-result") {
        return {
          disposition: "LEGACY_BASELINE",
          bucket: "FLOW_GATE_FUTURE_STORY_ENFORCEMENT",
          priority: "P2",
          action:
            "Architecture/Specs/Epics 已有中央契约；当前缺口仅表示历史 Story 未批量回填。新建、重新打开、进入开发或进入 review 的 Story 必须体现该 Flow Gate rule。",
        };
      }
      if (category === "artifact-path-contract" || category === "schema-field-reference") {
        return {
          disposition: "LEGACY_BASELINE",
          bucket: "STORY_LIFECYCLE_FUTURE_ENFORCEMENT",
          priority: "P2",
          action:
            "Story lifecycle schema 已有中央契约；当前缺口仅表示历史 Story 未批量回填。新建或后续修改的 Story 必须体现该 lifecycle field/path。",
        };
      }
    }
    if (category === "flow-gate-mode" || category === "flow-gate-result") {
      return {
        disposition: "TRUE_GAP",
        bucket: "FLOW_GATE_CONTRACT_GAP",
        priority: "P1",
        action:
          "补齐 flow gate mode/result 的中央契约，并将历史 Story 标记为 legacy baseline；只强制新建或后续修改的 Story 体现该规则。",
      };
    }
    if (category === "artifact-path-contract" || category === "schema-field-reference") {
      return {
        disposition: "TRUE_GAP",
        bucket: "STORY_LIFECYCLE_SCHEMA_GAP",
        priority: "P1",
        action:
          "补齐 Story lifecycle schema、story_location、flow_gate_root、development_status 等字段的统一定义；历史 Story 不批量回填。",
      };
    }
    if (
      category === "story-template-section" ||
      category === "evidence-rule" ||
      category === "equivalent-implementation-policy"
    ) {
      return {
        disposition: "LEGACY_BASELINE",
        bucket: "STORY_TEMPLATE_MIGRATION_BASELINE",
        priority: "P2",
        action:
          "这是新 Story 模板和 evidence policy 引入后的历史基线缺口；不回改已完成 Story，只要求后续 create-story 产物包含这些章节或等价证据。",
      };
    }
  }

  return {
    disposition: "DECISION_NEEDED",
    bucket: "MANUAL_REVIEW",
    priority: "P3",
    action: "需要人工判断这是缺文档、历史基线还是审计规则过严。",
  };
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const consistency = fs.existsSync(consistencyPath)
  ? JSON.parse(fs.readFileSync(consistencyPath, "utf8"))
  : { findings: [] };

const coverageRisks = ["MISSING_EXPECTED_LAYER", "MISSING_STORY_COVERAGE"];
const riskyItems = matrix.matrix.filter((item) => coverageRisks.includes(item.coverageRisk));
const hasCrossLayerGap = riskyItems.some((item) => item.coverageRisk === "MISSING_EXPECTED_LAYER");
const coverageGroups = Object.entries(groupBy(riskyItems, (item) => `${item.coverageRisk}\u0000${item.category}\u0000${item.value}`))
  .map(([key, items]) => {
    const [risk, category, value] = key.split("\u0000");
    const skills = uniqueSorted(items.map((item) => item.skill));
    const missingExpectedLayers = uniqueSorted(items.flatMap((item) => item.missingExpectedLayers));
    const classification = classifyCoverageGroup({ risk, category, value, missingExpectedLayers });
    const occurrence = firstOccurrence(items);
    return {
      risk,
      category,
      value,
      itemCount: items.length,
      skillCount: skills.length,
      skills,
      missingExpectedLayers,
      firstSource: {
        file: occurrence.file,
        line: occurrence.line,
        context: occurrence.context,
      },
      ...classification,
    };
  })
  .sort(
    (a, b) =>
      a.priority.localeCompare(b.priority) ||
      a.disposition.localeCompare(b.disposition) ||
      a.bucket.localeCompare(b.bucket) ||
      b.itemCount - a.itemCount ||
      a.category.localeCompare(b.category) ||
      a.value.localeCompare(b.value),
  );

const consistencyGroups = consistency.findings.map((finding) => {
  const isSameBasename = finding.kind === "same-basename-different-content";
  return {
    kind: finding.kind,
    value: finding.basename ?? finding.value,
    itemCount: finding.files?.length ?? finding.skillCount ?? 0,
    disposition: "DECISION_NEEDED",
    bucket: isSameBasename ? "SHARED_DATA_VARIANT" : "SHARED_SCHEMA_CONTEXT_VARIANT",
    priority: "P2",
    action: isSameBasename
      ? "确认同名 data 文件是否应收敛为公共基础数据，或明确记录为 phase-specific variant。"
      : "确认同名字段跨 data/schema 文件是否语义一致；若不一致，应改名或在引用处声明 scope。",
    samples:
      finding.files?.slice(0, 8).map((file) => ({ skill: file.skill, file: file.file, hash: file.hash })) ??
      finding.samples?.slice(0, 8).map((sample) => ({
        skill: sample.skill,
        file: sample.file,
        line: sample.line,
        context: sample.context,
      })) ??
      [],
  };
});

const globalRuleAggregations = coverageGroups
  .filter((group) => group.itemCount > 1 && (group.category.startsWith("flow-gate") || group.category === "story-template-section"))
  .map((group) => ({
    rule: `${group.category}: ${group.value}`,
    category: group.category,
    value: group.value,
    itemCount: group.itemCount,
    skillCount: group.skillCount,
    skills: group.skills,
    firstSource: group.firstSource,
    aggregationPolicy:
      "该规则是全局生命周期契约，已按 category + value 汇总；per-skill source evidence 只用于追溯，不再计为独立修复任务。",
  }));

const allTriage = [...coverageGroups, ...consistencyGroups];

function countBy(items, key) {
  return Object.entries(groupBy(items, (item) => item[key] ?? ""))
    .map(([name, values]) => ({ name, count: values.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const output = {
  generatedAt: new Date().toISOString(),
  sourceMatrix: toPosix(path.relative(repoRoot, matrixPath)),
  sourceConsistency: toPosix(path.relative(repoRoot, consistencyPath)),
  coverageRiskCounts: matrix.coverageRiskCounts,
  riskyCoverageItemCount: riskyItems.length,
  riskyCoverageGroupCount: coverageGroups.length,
  consistencyFindingCount: consistencyGroups.length,
  acceptedConsistencyVariantCount: consistency.acceptedConsistencyVariantCount ?? 0,
  auditRuleTuningCandidateCount: 0,
  resolvedAuditRuleTuningCount: globalRuleAggregations.length,
  globalRuleAggregationCount: globalRuleAggregations.length,
  dispositionCounts: countBy(allTriage, "disposition"),
  bucketCounts: countBy(allTriage, "bucket"),
  coverageGroups,
  consistencyGroups,
  auditRuleTuningCandidates: [],
  globalRuleAggregations,
};

fs.writeFileSync(path.join(resultsDir, "rule-coverage-triage.json"), `${JSON.stringify(output, null, 2)}\n`);

const lines = [];
lines.push("# Rule Coverage Triage（规则覆盖分流）");
lines.push("");
lines.push(`- 生成时间：${output.generatedAt}`);
lines.push(`- 输入矩阵：\`${output.sourceMatrix}\``);
lines.push(`- 输入一致性发现：\`${output.sourceConsistency}\``);
lines.push(`- 风险覆盖条目：${output.riskyCoverageItemCount}`);
lines.push(`- 去重后的覆盖分流组：${output.riskyCoverageGroupCount}`);
lines.push(`- 一致性候选：${output.consistencyFindingCount}`);
lines.push(`- 已声明一致性变体：${output.acceptedConsistencyVariantCount}`);
lines.push(`- 审计规则调优候选：${output.auditRuleTuningCandidateCount}`);
lines.push(`- 已聚合全局规则：${output.globalRuleAggregationCount}`);
lines.push("");
lines.push("## Triage Policy（分流口径）");
lines.push("");
lines.push("- `TRUE_GAP`：需要补齐权威契约或未来流程约束，但不默认批量回改历史 Story。");
lines.push("- `LEGACY_BASELINE`：由 flow-gate/story-template 改造后引入的历史基线缺口；只约束新建或后续修改的 Story。");
lines.push("- `DECISION_NEEDED`：需要确认同名数据或字段是否应收敛、改名或声明 scope。");
lines.push("- 全局生命周期规则按 `category + value` 聚合展示；per-skill source evidence 只用于追溯，不作为独立修复任务。");
lines.push("");
lines.push("## Disposition Summary（分流汇总）");
lines.push("");
lines.push("| Disposition | Count |");
lines.push("| --- | --- |");
for (const row of output.dispositionCounts) {
  lines.push(`| \`${row.name}\` | ${row.count} |`);
}
lines.push("");
lines.push("## Bucket Summary（问题桶汇总）");
lines.push("");
lines.push("| Bucket | Count |");
lines.push("| --- | --- |");
for (const row of output.bucketCounts) {
  lines.push(`| \`${row.name}\` | ${row.count} |`);
}
lines.push("");
lines.push("## Priority 1（优先级 1）");
lines.push("");
lines.push("| Disposition | Bucket | Risk | Rule | Items | Skills | Missing Layers | First Source | Action |");
lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const group of coverageGroups.filter((group) => group.priority === "P1")) {
  lines.push(
    `| \`${group.disposition}\` | \`${group.bucket}\` | \`${group.risk}\` | \`${group.category}: ${group.value}\` | ${group.itemCount} | ${group.skillCount} | \`${group.missingExpectedLayers.join(", ")}\` | ${fileLink(group.firstSource.file, group.firstSource.line)} | ${group.action} |`,
  );
}
lines.push("");
lines.push("## Legacy Baseline（历史基线）");
lines.push("");
lines.push("| Bucket | Rule | Items | Skills | First Source | Policy |");
lines.push("| --- | --- | --- | --- | --- | --- |");
for (const group of coverageGroups.filter((group) => group.disposition === "LEGACY_BASELINE")) {
  lines.push(
    `| \`${group.bucket}\` | \`${group.category}: ${group.value}\` | ${group.itemCount} | ${group.skillCount} | ${fileLink(group.firstSource.file, group.firstSource.line)} | ${group.action} |`,
  );
}
lines.push("");
lines.push("## Decision Needed（待决策项）");
lines.push("");
if (consistencyGroups.length === 0) {
  lines.push("当前无待决策一致性项；已声明的数据或字段上下文变体见 `rule-consistency-findings.md`。");
} else {
  lines.push("| Bucket | Value | Items | Samples | Action |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const group of consistencyGroups) {
    const samples = group.samples
      .slice(0, 4)
      .map((sample) => (sample.line ? `${sample.skill}: ${sample.file}:${sample.line}` : `${sample.skill}: ${sample.file}`))
      .join("<br>");
    lines.push(`| \`${group.bucket}\` | \`${group.value}\` | ${group.itemCount} | ${samples} | ${group.action} |`);
  }
}
lines.push("");
lines.push("## Global Rule Aggregation（全局规则聚合）");
lines.push("");
lines.push("| Rule | Items | Skills | First Source | Policy |");
lines.push("| --- | --- | --- | --- | --- |");
for (const group of globalRuleAggregations) {
  lines.push(
    `| \`${group.rule}\` | ${group.itemCount} | ${group.skillCount} | ${fileLink(group.firstSource.file, group.firstSource.line)} | ${group.aggregationPolicy} |`,
  );
}
lines.push("");
lines.push("## Recommended Execution Order（建议执行顺序）");
lines.push("");
if (hasCrossLayerGap) {
  lines.push("1. 先补体系级 contract：runtime artifact roots、flow gate modes/results、Story lifecycle schema、anchor policy。");
  lines.push("2. 在审计口径中加入 legacy baseline 规则：历史 Story 不批量回填，新建或后续修改 Story 必须体现新版模板和 evidence policy。");
  lines.push("3. 调整报告展示：全局生命周期规则按 `category + value` 汇总，避免 per-skill 重复扩大修复量。");
  lines.push("4. 再处理 shared data 决策项：确认 `project-types.csv`、`domain-complexity.csv`、`speclite-manifest.json` 是公共数据还是 phase-specific variant。");
} else {
  lines.push("1. 体系级 contract 已补齐；保留 `09-sdlc-workflow-lifecycle-contract.md` 作为后续 Story、SR、CR 和 finalizer 的唯一 lifecycle 真源。");
  lines.push("2. 维持 legacy baseline：历史 Story 不批量回填，新建或后续修改 Story 必须体现新版模板和 evidence policy。");
  lines.push("3. 全局生命周期规则已按 `category + value` 聚合展示，per-skill source evidence 只保留为追溯证据。");
  if (consistencyGroups.length === 0) {
    lines.push("4. Shared data/schema 变体已通过 `canonical-data-variant-policy.json` 声明 scope；当前只剩历史 Story legacy baseline。");
  } else {
    lines.push("4. 下一步处理 shared data 决策项：确认 `project-types.csv`、`domain-complexity.csv`、`speclite-manifest.json` 是公共数据还是 phase-specific variant。");
  }
}
lines.push("");
lines.push("完整结构化分流见 `rule-coverage-triage.json`。");

fs.writeFileSync(path.join(resultsDir, "rule-coverage-triage.md"), `${lines.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      riskyCoverageItemCount: output.riskyCoverageItemCount,
      riskyCoverageGroupCount: output.riskyCoverageGroupCount,
      consistencyFindingCount: output.consistencyFindingCount,
      acceptedConsistencyVariantCount: output.acceptedConsistencyVariantCount,
      auditRuleTuningCandidateCount: output.auditRuleTuningCandidateCount,
      resolvedAuditRuleTuningCount: output.resolvedAuditRuleTuningCount,
      globalRuleAggregationCount: output.globalRuleAggregationCount,
      dispositionCounts: output.dispositionCounts,
      markdown: toPosix(path.relative(repoRoot, path.join(resultsDir, "rule-coverage-triage.md"))),
      json: toPosix(path.relative(repoRoot, path.join(resultsDir, "rule-coverage-triage.json"))),
    },
    null,
    2,
  ),
);
