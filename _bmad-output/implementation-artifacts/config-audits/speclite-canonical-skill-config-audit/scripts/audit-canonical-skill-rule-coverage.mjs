#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  collectSkillDirs,
  collectSkillTextFiles,
  isTextLikeFile,
  readTextFile,
  toPosix,
  walkFiles,
} from "./config-extract-lib.mjs";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const auditDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(auditDir, "../../../..");
const resultsDir = path.join(auditDir, "results");
const configCoveragePath = path.join(resultsDir, "config-doc-coverage.json");
const dataVariantPolicyPath = path.join(repoRoot, "assets/source/speclite/canonical-data-variant-policy.json");

if (!fs.existsSync(configCoveragePath)) {
  console.error(`Missing input: ${configCoveragePath}. Run audit-config-doc-coverage.mjs first.`);
  process.exit(1);
}

const configCoverage = JSON.parse(fs.readFileSync(configCoveragePath, "utf8"));
const dataVariantPolicy = fs.existsSync(dataVariantPolicyPath)
  ? JSON.parse(fs.readFileSync(dataVariantPolicyPath, "utf8"))
  : { accepted_basename_variants: [], accepted_field_context_variants: [] };

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, " ");
}

function stripPlaceholderBraces(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^\{(.+)}$/);
  return match ? match[1] : trimmed;
}

function normalizeRuleValue(value) {
  return stripPlaceholderBraces(value)
    .replace(/^\$/, "")
    .replace(/\{\{([^}]+)}}/g, "$1")
    .toLowerCase();
}

function basenameOfPosix(relativePath) {
  return relativePath.split("/").pop() ?? relativePath;
}

function acceptedBasenamePolicy(basename, files) {
  const policy = dataVariantPolicy.accepted_basename_variants?.find((item) => item.basename === basename);
  if (!policy) return null;
  const allowedSkills = new Set(policy.scopes?.flatMap((scope) => scope.skills ?? []) ?? []);
  if (allowedSkills.size === 0) return null;
  return files.every((file) => allowedSkills.has(file.skill)) ? policy : null;
}

function acceptedFieldContextPolicy(value, items) {
  const fieldPolicies =
    dataVariantPolicy.accepted_field_context_variants?.filter((item) => item.field === value) ?? [];
  for (const fieldPolicy of fieldPolicies) {
    const basenamePolicy = dataVariantPolicy.accepted_basename_variants?.find((item) => item.basename === fieldPolicy.basename);
    if (!basenamePolicy) continue;
    const allowedSkills = new Set(basenamePolicy.scopes?.flatMap((scope) => scope.skills ?? []) ?? []);
    const allCovered = items.every(
      (item) =>
        basenameOfPosix(item.localItem.source.file) === fieldPolicy.basename &&
        allowedSkills.has(item.skill),
    );
    if (allCovered) {
      return { ...fieldPolicy, basenamePolicy };
    }
  }
  return null;
}

function atomKey(atom) {
  return `${atom.category}\u0000${atom.skill}\u0000${normalizeRuleValue(atom.value)}`;
}

function firstOccurrence(occurrences) {
  return occurrences[0] ?? { file: "", line: 0, context: "" };
}

const statusCategoryMap = {
  FILE_EXISTS: "local-file-reference",
  LOCAL_CONFIG_DEFINED: "local-config-definition",
  LOCAL_PLACEHOLDER_DEFINED: "local-placeholder-reference",
  RUNTIME_CONFIG_REFERENCE: "runtime-config-reference",
  RUNTIME_CONFIG_DEFINED: "runtime-config-reference",
  ARTIFACT_PATH_REFERENCE: "artifact-path-contract",
  ARTIFACT_PATH_DEFINED: "artifact-path-contract",
  WORKFLOW_LOCAL_VARIABLE: "workflow-local-variable",
  EXTERNAL_PROJECT_FILE_REFERENCE: "external-project-reference",
  EXTERNAL_PROJECT_PATTERN_REFERENCE: "external-project-reference",
  TEMPLATE_PLACEHOLDER: "template-placeholder",
  SCHEMA_FIELD_REFERENCE: "schema-field-reference",
  WORKFLOW_PARAMETER_REFERENCE: "workflow-parameter",
  DEFINED_IN_PLANNING_DOCS: "contract-defined-reference",
  DEFINED_IN_IMPLEMENTATION_DOCS: "contract-defined-reference",
};

const storyRelevantCategories = new Set([
  "artifact-path-contract",
  "runtime-config-reference",
  "schema-field-reference",
  "workflow-parameter",
  "flow-gate-mode",
  "flow-gate-result",
  "hard-gate-rule",
  "evidence-rule",
  "equivalent-implementation-policy",
  "story-template-section",
]);

const architectureRelevantCategories = new Set([
  "artifact-path-contract",
  "runtime-config-reference",
  "schema-field-reference",
  "workflow-parameter",
  "flow-gate-mode",
  "flow-gate-result",
  "hard-gate-rule",
  "evidence-rule",
  "equivalent-implementation-policy",
  "local-config-definition",
  "local-placeholder-reference",
]);

function isCriticalArtifactValue(value, skill = "") {
  const clean = stripPlaceholderBraces(value);
  if (
    /(story_location|story_location_absolute|story_root|stories|flow_gate|flow_gate_root|flow-gates|sprint_status|sprint_status_file|development_status|review_input|cr_dir|sr_dir)/i.test(
      clean,
    )
  ) {
    return true;
  }
  if (/default_output_file/i.test(clean) && /create-story/i.test(skill)) {
    return true;
  }
  return (
    /(implementation_artifacts|planning_artifacts)/i.test(clean) &&
    /(story-review|code-review|dev-story|create-story|flow-gate|sprint)/i.test(skill)
  );
}

function isCriticalRuntimeValue(value) {
  const clean = stripPlaceholderBraces(value);
  return /^(modules\.sdlc\.(planning_artifacts|implementation_artifacts|project_knowledge)|planning_artifacts|implementation_artifacts|project_knowledge|\{?project-root}\/_speclite\/config\.toml|\{?speclite-runtime-root}\/custom)/i.test(
    clean,
  );
}

function isCriticalSchemaValue(value) {
  return /(anchor_contract_map|dependency_gate|evidence_plan|anchor_evidence_summary|development_status|story_completion_status|epic_status|sprint_status|story_location|acceptance_criteria|file_list|completion_notes|flow_gate|gate_result)/i.test(
    value,
  );
}

function expectedLayersFor(category, value, skill) {
  if (category === "flow-gate-mode" || category === "flow-gate-result") {
    return ["architecture", "epics", "stories"];
  }
  if (category === "hard-gate-rule" && value !== "HALT") {
    return ["architecture", "epics", "stories"];
  }
  if (category === "evidence-rule" || category === "equivalent-implementation-policy" || category === "story-template-section") {
    return ["epics", "stories"];
  }
  if (category === "artifact-path-contract" && isCriticalArtifactValue(value, skill)) {
    return ["architecture", "epics", "stories"];
  }
  if (category === "schema-field-reference" && isCriticalSchemaValue(value)) {
    return ["epics", "stories"];
  }
  if (category === "runtime-config-reference" && isCriticalRuntimeValue(value)) {
    return ["architecture"];
  }
  return [];
}

function sourceKindForStatus(status) {
  if (status.startsWith("LOCAL_") || status === "FILE_EXISTS") return "local";
  if (status.includes("RUNTIME")) return "runtime";
  if (status.includes("ARTIFACT")) return "artifact";
  if (status.includes("SCHEMA")) return "schema";
  if (status.includes("WORKFLOW")) return "workflow";
  return "reference";
}

const atomMap = new Map();

function addAtom(input) {
  const occurrences = input.occurrences.filter(Boolean);
  if (occurrences.length === 0 || !input.value) return;
  const atom = {
    category: input.category,
    value: input.value,
    normalizedValue: normalizeRuleValue(input.value),
    skill: input.skill,
    scope: input.scope,
    skillDir: input.skillDir,
    sourceKind: input.sourceKind,
    expectedLayers: input.expectedLayers ?? expectedLayersFor(input.category, input.value, input.skill),
    occurrences,
  };
  const key = atomKey(atom);
  if (!atomMap.has(key)) {
    atomMap.set(key, atom);
    return;
  }
  const existing = atomMap.get(key);
  existing.occurrences.push(...occurrences);
  existing.occurrences = existing.occurrences
    .filter((occurrence, index, all) =>
      all.findIndex((candidate) => candidate.file === occurrence.file && candidate.line === occurrence.line) === index,
    )
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

for (const item of configCoverage.coverage) {
  const category = statusCategoryMap[item.status];
  if (!category) continue;
  addAtom({
    category,
    value: item.value,
    skill: item.skill,
    scope: item.scope,
    skillDir: item.skillDir,
    sourceKind: sourceKindForStatus(item.status),
    occurrences: item.firstSkillOccurrences,
  });
}

const lexicalRules = [
  {
    category: "flow-gate-mode",
    sourceKind: "workflow",
    values: ["story-kickoff", "story-completion", "epic-completion", "epic-kickoff"],
  },
  {
    category: "flow-gate-result",
    sourceKind: "workflow",
    values: ["PASS_EQUIVALENT", "FAIL_CONTRACT", "FAIL_FUNCTION", "FAIL_EVIDENCE", "DECISION_NEEDED"],
  },
  {
    category: "story-template-section",
    sourceKind: "template",
    values: ["Dependency Gate", "Anchor Contract Map", "Equivalent Implementation Policy", "Evidence Plan", "Anchor Evidence Summary"],
  },
  {
    category: "equivalent-implementation-policy",
    sourceKind: "policy",
    values: ["owning SPEC", "equivalent implementation policy", "Contract Anchor", "Functional Anchor", "Evidence Anchor", "Guidance Anchor"],
  },
  {
    category: "evidence-rule",
    sourceKind: "evidence",
    values: ["Anchor Evidence Summary", "Evidence Plan", "test evidence", "测试证据"],
  },
];

const hardGateWords = /(must exist|required file|hard gate|HALT|必须存在|必须有|不得继续|停止|中止)/i;
const hardGatePathPattern = /(?:src|test|tests|fixtures|assets\/source|_speclite-output|_bmad-output)\/[A-Za-z0-9_{}./-]+/g;

for (const skill of collectSkillDirs(repoRoot)) {
  for (const filePath of collectSkillTextFiles(skill.dir)) {
    const text = readTextFile(filePath);
    if (text === null) continue;
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const context = normalizeWhitespace(line).slice(0, 260);
      if (!context) continue;
      const occurrence = {
        file: relativePath,
        line: index + 1,
        context,
      };
      for (const rule of lexicalRules) {
        for (const value of rule.values) {
          const regex = new RegExp(escapeRegExp(value), "i");
          if (regex.test(line)) {
            addAtom({
              category: rule.category,
              value,
              skill: skill.name,
              scope: skill.scope,
              skillDir: skill.relativeDir,
              sourceKind: rule.sourceKind,
              occurrences: [occurrence],
            });
          }
        }
      }
      if (hardGateWords.test(line)) {
        const paths = [...line.matchAll(hardGatePathPattern)].map((match) => match[0]);
        if (paths.length > 0) {
          for (const gatePath of paths) {
            addAtom({
              category: "hard-gate-rule",
              value: gatePath,
              skill: skill.name,
              scope: skill.scope,
              skillDir: skill.relativeDir,
              sourceKind: "policy",
              occurrences: [occurrence],
            });
          }
        } else if (/HALT|不得继续|停止|中止/i.test(line)) {
          addAtom({
            category: "hard-gate-rule",
            value: "HALT",
            skill: skill.name,
            scope: skill.scope,
            skillDir: skill.relativeDir,
            sourceKind: "policy",
            occurrences: [occurrence],
          });
        }
      }
    }
  }
}

const atoms = [...atomMap.values()]
  .sort((a, b) => a.skill.localeCompare(b.skill) || a.category.localeCompare(b.category) || a.value.localeCompare(b.value));

function collectDocFiles(layer, roots) {
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    if (fs.statSync(root).isFile()) {
      files.push(root);
      continue;
    }
    files.push(...walkFiles(root));
  }
  return files
    .filter(isTextLikeFile)
    .filter((filePath) => !filePath.startsWith(`${auditDir}${path.sep}`))
    .map((filePath) => ({
      layer,
      filePath,
      relativePath: toPosix(path.relative(repoRoot, filePath)),
      text: readTextFile(filePath),
    }))
    .filter((doc) => doc.text !== null);
}

const docCorpus = [
  ...collectDocFiles("prd", [path.join(repoRoot, "_bmad-output/planning-artifacts/prd")]),
  ...collectDocFiles("architecture", [path.join(repoRoot, "_bmad-output/planning-artifacts/architecture")]),
  ...collectDocFiles("specs", [path.join(repoRoot, "_bmad-output/planning-artifacts/specs")]),
  ...collectDocFiles("epics", [path.join(repoRoot, "_bmad-output/planning-artifacts/epics")]),
  ...collectDocFiles("stories", [path.join(repoRoot, "_bmad-output/implementation-artifacts/stories")]),
];

function aliasesFor(atom) {
  const aliases = new Set([atom.value]);
  const stripped = stripPlaceholderBraces(atom.value);
  aliases.add(stripped);
  if (stripped.includes(".")) aliases.add(stripped.split(".").at(-1));
  if (atom.category === "hard-gate-rule" && atom.value !== "HALT") {
    aliases.add(path.basename(atom.value));
  }
  if (atom.category === "story-template-section") {
    aliases.add(atom.value.toLowerCase().replace(/\s+/g, "_"));
  }
  return [...aliases].filter((alias) => alias && alias.length >= 2);
}

function searchDocForAliases(doc, aliases) {
  const hits = [];
  const lines = doc.text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const alias of aliases) {
      const regex = /^[A-Za-z0-9_.-]+$/.test(alias)
        ? new RegExp(`(^|[^A-Za-z0-9_.-])${escapeRegExp(alias)}([^A-Za-z0-9_.-]|$)`, "i")
        : new RegExp(escapeRegExp(alias), "i");
      if (regex.test(line)) {
        hits.push({
          file: doc.relativePath,
          line: index + 1,
          layer: doc.layer,
          alias,
          context: normalizeWhitespace(line).slice(0, 260),
        });
        break;
      }
    }
    if (hits.length >= 20) break;
  }
  return hits;
}

function storyKeyFromPath(relativePath) {
  const basename = path.basename(relativePath);
  const match = basename.match(/^(\d+)-(\d+)-/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function epicKeyFromStory(storyKey) {
  return storyKey?.split("-")[0] ?? null;
}

const matrix = atoms.map((atom) => {
  const aliases = aliasesFor(atom);
  const hits = docCorpus.flatMap((doc) => searchDocForAliases(doc, aliases));
  const byLayer = {
    prd: hits.filter((hit) => hit.layer === "prd").length,
    architecture: hits.filter((hit) => hit.layer === "architecture").length,
    specs: hits.filter((hit) => hit.layer === "specs").length,
    epics: hits.filter((hit) => hit.layer === "epics").length,
    stories: hits.filter((hit) => hit.layer === "stories").length,
  };
  const storyKeys = [...new Set(hits.filter((hit) => hit.layer === "stories").map((hit) => storyKeyFromPath(hit.file)).filter(Boolean))].sort();
  const epicKeys = [...new Set(storyKeys.map(epicKeyFromStory).filter(Boolean))].sort();
  const missingExpectedLayers = atom.expectedLayers.filter((layer) => {
    if (layer === "architecture") return byLayer.architecture + byLayer.specs === 0;
    return byLayer[layer] === 0;
  });
  const coverageRisk =
    atom.expectedLayers.length === 0
      ? "INVENTORY_ONLY"
      : missingExpectedLayers.includes("stories")
      ? "MISSING_STORY_COVERAGE"
      : missingExpectedLayers.length > 0
        ? "MISSING_EXPECTED_LAYER"
        : hits.length === 0
          ? "NO_DEV_DOC_COVERAGE"
          : "COVERED";

  return {
    ...atom,
    aliases,
    hitCount: hits.length,
    byLayer,
    storyKeys,
    epicKeys,
    missingExpectedLayers,
    coverageRisk,
    firstHits: hits.slice(0, 12),
  };
});

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const dataFileVariants = [];
const acceptedDataFileVariants = [];
const localDataFiles = collectSkillDirs(repoRoot).flatMap((skill) =>
  walkFiles(skill.dir)
    .filter((filePath) => /[/\\]data[/\\].+\.(csv|json|ya?ml|toml)$/i.test(filePath))
    .map((filePath) => ({
      skill: skill.name,
      file: toPosix(path.relative(repoRoot, filePath)),
      basename: path.basename(filePath),
      hash: hashFile(filePath),
    })),
);

for (const [basename, files] of Object.entries(Object.groupBy(localDataFiles, (item) => item.basename))) {
  const hashes = [...new Set(files.map((item) => item.hash))];
  if (files.length > 1 && hashes.length > 1) {
    const acceptedPolicy = acceptedBasenamePolicy(basename, files);
    if (acceptedPolicy) {
      acceptedDataFileVariants.push({
        kind: "accepted-basename-variant",
        basename,
        variantCount: hashes.length,
        files,
        scopes: acceptedPolicy.scopes,
        reason: acceptedPolicy.reason,
      });
      continue;
    }
    dataFileVariants.push({
      kind: "same-basename-different-content",
      basename,
      variantCount: hashes.length,
      files,
    });
  }
}

const localConfigDefinitionVariants = [];
const acceptedLocalConfigDefinitionVariants = [];
for (const [value, items] of Object.entries(
  Object.groupBy(
    configCoverage.coverage.filter((item) =>
      item.status === "LOCAL_CONFIG_DEFINED" &&
      item.localItem?.source?.context &&
      (/^(core\.|modules\.sdlc\.)/.test(item.value) ||
        ["detection_signals", "suggested_workflow", "web_searches", "project_type"].includes(item.value)),
    ),
    (item) => item.value,
  ),
)) {
  const contexts = [...new Set(items.map((item) => item.localItem.source.context))];
  const skills = [...new Set(items.map((item) => item.skill))];
  if (skills.length > 1 && contexts.length > 1) {
    const acceptedPolicy = acceptedFieldContextPolicy(value, items);
    if (acceptedPolicy) {
      acceptedLocalConfigDefinitionVariants.push({
        kind: "accepted-local-config-key-context-variant",
        value,
        basename: acceptedPolicy.basename,
        skillCount: skills.length,
        contextCount: contexts.length,
        reason: acceptedPolicy.reason,
        samples: items.slice(0, 10).map((item) => ({
          skill: item.skill,
          file: item.localItem.source.file,
          line: item.localItem.source.line,
          context: item.localItem.source.context,
        })),
      });
      continue;
    }
    localConfigDefinitionVariants.push({
      kind: "same-local-config-key-different-definition-context",
      value,
      skillCount: skills.length,
      contextCount: contexts.length,
      samples: items.slice(0, 10).map((item) => ({
        skill: item.skill,
        file: item.localItem.source.file,
        line: item.localItem.source.line,
        context: item.localItem.source.context,
      })),
    });
  }
}

const storyCoverageGaps = matrix
  .filter((item) => item.coverageRisk === "MISSING_STORY_COVERAGE")
  .map((item) => ({
    category: item.category,
    value: item.value,
    skill: item.skill,
    expectedLayers: item.expectedLayers,
    byLayer: item.byLayer,
    firstOccurrence: firstOccurrence(item.occurrences),
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.skill.localeCompare(b.skill) || a.value.localeCompare(b.value));

const missingExpectedLayer = matrix
  .filter((item) => item.coverageRisk === "MISSING_EXPECTED_LAYER")
  .map((item) => ({
    category: item.category,
    value: item.value,
    skill: item.skill,
    missingExpectedLayers: item.missingExpectedLayers,
    byLayer: item.byLayer,
    firstOccurrence: firstOccurrence(item.occurrences),
  }))
  .sort((a, b) => b.missingExpectedLayers.length - a.missingExpectedLayers.length || a.category.localeCompare(b.category));

const consistencyFindings = [
  ...dataFileVariants,
  ...localConfigDefinitionVariants,
].sort((a, b) => a.kind.localeCompare(b.kind) || (a.basename ?? a.value).localeCompare(b.basename ?? b.value));
const acceptedConsistencyVariants = [
  ...acceptedDataFileVariants,
  ...acceptedLocalConfigDefinitionVariants,
].sort((a, b) => a.kind.localeCompare(b.kind) || (a.basename ?? a.value).localeCompare(b.basename ?? b.value));

const summary = {
  generatedAt: new Date().toISOString(),
  skillCount: configCoverage.skillCount,
  ruleAtomCount: atoms.length,
  docCorpusFileCount: docCorpus.length,
  coverageRiskCounts: matrix.reduce((counts, item) => {
    counts[item.coverageRisk] = (counts[item.coverageRisk] ?? 0) + 1;
    return counts;
  }, {}),
  storyCoverageGapCount: storyCoverageGaps.length,
  missingExpectedLayerCount: missingExpectedLayer.length,
  consistencyFindingCount: consistencyFindings.length,
  acceptedConsistencyVariantCount: acceptedConsistencyVariants.length,
};

const inventoryOutput = {
  generatedAt: summary.generatedAt,
  skillCount: summary.skillCount,
  ruleAtomCount: summary.ruleAtomCount,
  atoms,
};

const matrixOutput = {
  ...summary,
  docCorpus: docCorpus.map((doc) => ({ layer: doc.layer, file: doc.relativePath })),
  matrix,
};

const consistencyOutput = {
  generatedAt: summary.generatedAt,
  consistencyFindingCount: consistencyFindings.length,
  acceptedConsistencyVariantCount: acceptedConsistencyVariants.length,
  policyFile: fs.existsSync(dataVariantPolicyPath) ? toPosix(path.relative(repoRoot, dataVariantPolicyPath)) : null,
  findings: consistencyFindings,
  acceptedVariants: acceptedConsistencyVariants,
};

fs.writeFileSync(path.join(resultsDir, "canonical-skill-rule-inventory.json"), `${JSON.stringify(inventoryOutput, null, 2)}\n`);
fs.writeFileSync(path.join(resultsDir, "rule-coverage-matrix.json"), `${JSON.stringify(matrixOutput, null, 2)}\n`);
fs.writeFileSync(path.join(resultsDir, "rule-consistency-findings.json"), `${JSON.stringify(consistencyOutput, null, 2)}\n`);

function pushTable(lines, headers, rows) {
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  lines.push(...rows);
}

const inventoryLines = [];
inventoryLines.push("# Canonical Skill Rule Inventory（Canonical Skill 规则原子清单）");
inventoryLines.push("");
inventoryLines.push(`- 生成时间：${summary.generatedAt}`);
inventoryLines.push(`- Skill 数量：${summary.skillCount}`);
inventoryLines.push(`- Rule Atom 数量：${summary.ruleAtomCount}`);
inventoryLines.push("");
inventoryLines.push("## Category Summary（分类汇总）");
inventoryLines.push("");
const categoryRows = Object.entries(Object.groupBy(atoms, (atom) => atom.category))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([category, items]) => `| \`${category}\` | ${items.length} |`);
pushTable(inventoryLines, ["Category", "Count"], categoryRows);
inventoryLines.push("");
inventoryLines.push("## Samples（样例）");
inventoryLines.push("");
pushTable(
  inventoryLines,
  ["Category", "Skill", "Value", "First Source"],
  atoms.slice(0, 120).map((atom) => {
    const first = firstOccurrence(atom.occurrences);
    return `| \`${atom.category}\` | \`${atom.skill}\` | \`${atom.value}\` | [${first.file}](/Users/fancyliu/Repos/SpecLite/${first.file}:${first.line}) |`;
  }),
);
inventoryLines.push("");
inventoryLines.push("完整规则原子、来源行号和上下文见 `canonical-skill-rule-inventory.json`。");
fs.writeFileSync(path.join(resultsDir, "canonical-skill-rule-inventory.md"), `${inventoryLines.join("\n")}\n`);

const matrixLines = [];
matrixLines.push("# Rule Coverage Matrix（规则覆盖矩阵）");
matrixLines.push("");
matrixLines.push(`- 生成时间：${summary.generatedAt}`);
matrixLines.push(`- Rule Atom 数量：${summary.ruleAtomCount}`);
matrixLines.push(`- 开发文档文件数量：${summary.docCorpusFileCount}`);
matrixLines.push(`- Story Coverage Gaps：${summary.storyCoverageGapCount}`);
matrixLines.push(`- Missing Expected Layer：${summary.missingExpectedLayerCount}`);
matrixLines.push("");
matrixLines.push("## Coverage Risk Summary（覆盖风险汇总）");
matrixLines.push("");
const riskRows = Object.entries(summary.coverageRiskCounts)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([risk, count]) => `| \`${risk}\` | ${count} |`);
pushTable(matrixLines, ["Risk", "Count"], riskRows);
matrixLines.push("");
matrixLines.push("## Tracking Policy（跟踪口径）");
matrixLines.push("");
matrixLines.push("- `INVENTORY_ONLY`：进入规则清单和一致性检查，但默认不要求逐条出现在 PRD、Architecture、Epic 或 Story。");
matrixLines.push("- 覆盖缺口只针对生命周期契约类规则：flow gate mode/result、hard gate path、Story 模板章节、证据策略、等价实现策略、关键 artifact path 和 Story 状态字段。");
matrixLines.push("- 本地配置定义、占位符、模板变量和普通 workflow local variable 先按本地定义/一致性处理，避免把 skill 内部实现细节误判为 Story 缺口。");
matrixLines.push("");
matrixLines.push("## High Risk Samples（高风险样例）");
matrixLines.push("");
pushTable(
  matrixLines,
  ["Risk", "Category", "Skill", "Value", "PRD", "Arch", "Specs", "Epics", "Stories", "First Source"],
  matrix
    .filter((item) => item.coverageRisk !== "COVERED" && item.coverageRisk !== "INVENTORY_ONLY")
    .slice(0, 120)
    .map((item) => {
      const first = firstOccurrence(item.occurrences);
      return `| \`${item.coverageRisk}\` | \`${item.category}\` | \`${item.skill}\` | \`${item.value}\` | ${item.byLayer.prd} | ${item.byLayer.architecture} | ${item.byLayer.specs} | ${item.byLayer.epics} | ${item.byLayer.stories} | [${first.file}](/Users/fancyliu/Repos/SpecLite/${first.file}:${first.line}) |`;
    }),
);
matrixLines.push("");
matrixLines.push("完整矩阵、命中行和 Story key 见 `rule-coverage-matrix.json`。");
fs.writeFileSync(path.join(resultsDir, "rule-coverage-matrix.md"), `${matrixLines.join("\n")}\n`);

const consistencyLines = [];
consistencyLines.push("# Rule Consistency Findings（规则一致性发现）");
consistencyLines.push("");
consistencyLines.push(`- 生成时间：${summary.generatedAt}`);
consistencyLines.push(`- Variant policy：\`${toPosix(path.relative(repoRoot, dataVariantPolicyPath))}\``);
consistencyLines.push(`- Finding 数量：${consistencyFindings.length}`);
consistencyLines.push(`- Accepted Variant 数量：${acceptedConsistencyVariants.length}`);
consistencyLines.push("");
if (consistencyFindings.length === 0) {
  consistencyLines.push("未发现脚本可判定的一致性候选。");
} else {
  for (const finding of consistencyFindings.slice(0, 80)) {
    consistencyLines.push(`## ${finding.kind}`);
    consistencyLines.push("");
    if (finding.basename) {
      consistencyLines.push(`- Basename：\`${finding.basename}\``);
      consistencyLines.push(`- Variant Count：${finding.variantCount}`);
      for (const file of finding.files.slice(0, 12)) {
        consistencyLines.push(`  - \`${file.skill}\` -> \`${file.file}\` (${file.hash.slice(0, 12)})`);
      }
    } else {
      consistencyLines.push(`- Value：\`${finding.value}\``);
      consistencyLines.push(`- Skill Count：${finding.skillCount}`);
      consistencyLines.push(`- Context Count：${finding.contextCount}`);
      for (const sample of finding.samples.slice(0, 8)) {
        consistencyLines.push(`  - \`${sample.skill}\` [${sample.file}](/Users/fancyliu/Repos/SpecLite/${sample.file}:${sample.line})：${sample.context}`);
      }
    }
    consistencyLines.push("");
  }
  if (consistencyFindings.length > 80) {
    consistencyLines.push(`另有 ${consistencyFindings.length - 80} 项见 JSON。`);
  }
}
consistencyLines.push("## Accepted Variants（已声明变体）");
consistencyLines.push("");
if (acceptedConsistencyVariants.length === 0) {
  consistencyLines.push("未发现已声明的数据或字段上下文变体。");
} else {
  for (const variant of acceptedConsistencyVariants.slice(0, 80)) {
    consistencyLines.push(`### ${variant.kind}`);
    consistencyLines.push("");
    if (variant.basename) {
      consistencyLines.push(`- Basename：\`${variant.basename}\``);
    }
    if (variant.value) {
      consistencyLines.push(`- Value：\`${variant.value}\``);
    }
    if (variant.variantCount) {
      consistencyLines.push(`- Variant Count：${variant.variantCount}`);
    }
    if (variant.skillCount) {
      consistencyLines.push(`- Skill Count：${variant.skillCount}`);
    }
    consistencyLines.push(`- Reason：${variant.reason}`);
    const samples = variant.files ?? variant.samples ?? [];
    for (const sample of samples.slice(0, 8)) {
      const line = sample.line ? `:${sample.line}` : "";
      consistencyLines.push(`  - \`${sample.skill}\` -> \`${sample.file}${line}\``);
    }
    consistencyLines.push("");
  }
  if (acceptedConsistencyVariants.length > 80) {
    consistencyLines.push(`另有 ${acceptedConsistencyVariants.length - 80} 项见 JSON。`);
  }
}
fs.writeFileSync(path.join(resultsDir, "rule-consistency-findings.md"), `${consistencyLines.join("\n")}\n`);

const storyGapLines = [];
storyGapLines.push("# Story Rule Coverage Gaps（Story 规则覆盖缺口）");
storyGapLines.push("");
storyGapLines.push(`- 生成时间：${summary.generatedAt}`);
storyGapLines.push(`- Story Coverage Gap 数量：${storyCoverageGaps.length}`);
storyGapLines.push("");
pushTable(
  storyGapLines,
  ["Category", "Skill", "Value", "PRD", "Arch", "Specs", "Epics", "First Source"],
  storyCoverageGaps.slice(0, 160).map((item) => {
    const first = item.firstOccurrence;
    return `| \`${item.category}\` | \`${item.skill}\` | \`${item.value}\` | ${item.byLayer.prd} | ${item.byLayer.architecture} | ${item.byLayer.specs} | ${item.byLayer.epics} | [${first.file}](/Users/fancyliu/Repos/SpecLite/${first.file}:${first.line}) |`;
  }),
);
if (storyCoverageGaps.length > 160) {
  storyGapLines.push(`| ... | ... | ... | ... | ... | ... | ... | 另有 ${storyCoverageGaps.length - 160} 项，见 JSON |`);
}
storyGapLines.push("");
storyGapLines.push("完整 Story 命中和缺口列表见 `rule-coverage-matrix.json`。");
fs.writeFileSync(path.join(resultsDir, "story-rule-coverage-gaps.md"), `${storyGapLines.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      ruleAtomCount: summary.ruleAtomCount,
      docCorpusFileCount: summary.docCorpusFileCount,
      storyCoverageGapCount: summary.storyCoverageGapCount,
      missingExpectedLayerCount: summary.missingExpectedLayerCount,
      consistencyFindingCount: summary.consistencyFindingCount,
      acceptedConsistencyVariantCount: summary.acceptedConsistencyVariantCount,
      inventory: toPosix(path.relative(repoRoot, path.join(resultsDir, "canonical-skill-rule-inventory.md"))),
      matrix: toPosix(path.relative(repoRoot, path.join(resultsDir, "rule-coverage-matrix.md"))),
      consistency: toPosix(path.relative(repoRoot, path.join(resultsDir, "rule-consistency-findings.md"))),
      storyGaps: toPosix(path.relative(repoRoot, path.join(resultsDir, "story-rule-coverage-gaps.md"))),
    },
    null,
    2,
  ),
);
