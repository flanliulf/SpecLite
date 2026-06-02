#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  extractConfigRefsFromFile,
  isTextLikeFile,
  readTextFile,
  toPosix,
  uniqueByValue,
  walkFiles,
} from "./config-extract-lib.mjs";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const auditDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(auditDir, "../../../..");
const resultsDir = path.join(auditDir, "results");
const skillDepsPath = path.join(resultsDir, "skill-config-deps.json");

if (!fs.existsSync(skillDepsPath)) {
  console.error(`Missing input: ${skillDepsPath}. Run extract-skill-config-deps.mjs first.`);
  process.exit(1);
}

const skillDeps = JSON.parse(fs.readFileSync(skillDepsPath, "utf8"));
const docRoots = [
  path.join(repoRoot, "_bmad-output/planning-artifacts"),
  path.join(repoRoot, "_bmad-output/implementation-artifacts"),
];

function isInsideAuditDir(filePath) {
  return filePath.startsWith(`${auditDir}${path.sep}`);
}

const docFiles = docRoots
  .flatMap((root) => walkFiles(root))
  .filter((file) => !isInsideAuditDir(file))
  .filter(isTextLikeFile)
  .sort();

const docTexts = docFiles.map((filePath) => ({
  filePath,
  relativePath: toPosix(path.relative(repoRoot, filePath)),
  text: readTextFile(filePath),
}));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchDocs(value) {
  if (!value || value.length < 2) {
    return [];
  }
  const regex = new RegExp(`(^|[^A-Za-z0-9_.-])${escapeRegExp(value)}([^A-Za-z0-9_.-]|$)`, "g");
  const hits = [];
  for (const doc of docTexts) {
    if (doc.text === null) {
      continue;
    }
    const lines = doc.text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      regex.lastIndex = 0;
      if (regex.test(line)) {
        hits.push({
          file: doc.relativePath,
          line: index + 1,
          context: line.trim().slice(0, 260),
          isPlanning: doc.relativePath.startsWith("_bmad-output/planning-artifacts/"),
          isImplementation: doc.relativePath.startsWith("_bmad-output/implementation-artifacts/"),
          looksDefinitionLike:
            /(配置|默认|字段|路径|目录|产物|契约|定义|schema|status|location|output|artifact|config|default|field|path|directory|contract|define|setting|value|must|required)/i.test(
              line,
            ),
        });
      }
    }
  }
  return hits;
}

function classifyHits(hits) {
  if (hits.some((hit) => hit.isPlanning && hit.looksDefinitionLike)) {
    return "DEFINED_IN_PLANNING_DOCS";
  }
  if (hits.some((hit) => hit.looksDefinitionLike)) {
    return "DEFINED_IN_IMPLEMENTATION_DOCS";
  }
  if (hits.length === 0) {
    return null;
  }
  return "WEAK_DOC_EVIDENCE";
}

function hasDocDefinition(hits) {
  return classifyHits(hits) !== null && classifyHits(hits) !== "WEAK_DOC_EVIDENCE";
}

function uniqueExistingSkillBasenameMatches(skillDir, basename) {
  const root = path.join(repoRoot, skillDir);
  if (!fs.existsSync(root)) {
    return [];
  }
  return walkFiles(root)
    .filter((filePath) => path.basename(filePath) === basename)
    .filter((filePath) => fs.statSync(filePath).isFile())
    .map((filePath) => ({
      kind: "skill-basename-unique-match",
      absolutePath: filePath,
      relativePath: toPosix(path.relative(repoRoot, filePath)),
    }));
}

function addCandidate(candidates, kind, rawPath) {
  if (!rawPath || rawPath.includes("{") || rawPath.includes("}")) {
    return;
  }
  const absolutePath = path.resolve(rawPath);
  candidates.push({ kind, absolutePath });
}

function resolveLocalConfigFile(ref) {
  const value = ref.value;
  const candidates = [];

  for (const occurrence of ref.occurrences) {
    const occurrenceDir = path.dirname(path.join(repoRoot, occurrence.file));
    const skillRoot = path.join(repoRoot, ref.skillDir);

    if (value.startsWith("{skill-root}/")) {
      addCandidate(candidates, "skill-root-placeholder", value.replace("{skill-root}", skillRoot));
    }

    if (!value.includes("{") && !path.isAbsolute(value)) {
      addCandidate(candidates, "relative-to-source-file", path.join(occurrenceDir, value));
      addCandidate(candidates, "relative-to-skill-root", path.join(skillRoot, value));
    }
  }

  const seen = new Set();
  for (const candidate of candidates) {
    const key = candidate.absolutePath;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (fs.existsSync(candidate.absolutePath) && fs.statSync(candidate.absolutePath).isFile()) {
      return {
        exists: true,
        kind: candidate.kind,
        resolvedPath: toPosix(path.relative(repoRoot, candidate.absolutePath)),
      };
    }
  }

  if (!value.includes("{")) {
    const basenameMatches = uniqueExistingSkillBasenameMatches(ref.skillDir, path.basename(value));
    if (basenameMatches.length === 1) {
      return {
        exists: true,
        kind: basenameMatches[0].kind,
        resolvedPath: basenameMatches[0].relativePath,
      };
    }
  }

  return {
    exists: false,
    kind: null,
    resolvedPath: null,
  };
}

function isLocalConfigDefinitionSource(occurrence) {
  if (["toml-key", "toml-section", "toml-array-section", "yaml-key", "json-key", "csv-header"].includes(occurrence.source)) {
    return true;
  }
  if (occurrence.source !== "assignment") {
    return false;
  }
  const basename = path.basename(occurrence.file);
  return (
    basename === "config.toml.example" ||
    basename === "customize.toml" ||
    basename.endsWith(".toml") ||
    basename.endsWith(".yaml") ||
    basename.endsWith(".yml") ||
    basename.endsWith(".json")
  );
}

function stripPlaceholderBraces(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^\{(.+)}$/);
  return match ? match[1] : trimmed;
}

function isBracedPlaceholder(value) {
  return /^\{.+}$/.test(value.trim());
}

function normalizedValue(value) {
  return stripPlaceholderBraces(value).replace(/^\$/, "");
}

function occurrenceText(ref) {
  return ref.occurrences.map((occurrence) => `${occurrence.file} ${occurrence.context}`).join("\n");
}

function classifyKnownReference(ref, kind, hits) {
  const value = ref.value;
  const normalized = normalizedValue(value);
  const docStatus = classifyHits(hits);
  const contextText = occurrenceText(ref);
  const isPlaceholderReference =
    isBracedPlaceholder(value) ||
    ref.occurrences.some((occurrence) => occurrence.source === "placeholder") ||
    contextText.includes(`{${normalized}}`);

  const routeOrModeValues = new Set([
    "deep_dive",
    "epic-completion",
    "epic-kickoff",
    "full_rescan",
    "initial_scan",
    "planning_generation",
    "sprint-planning",
    "story-completion",
    "story-kickoff",
    "targeted_deep_dive",
  ]);

  const storySchemaFieldValues = new Set([
    "acceptance_criteria",
    "anchor_contract_map",
    "anchor_evidence_summary",
    "architecture_compliance",
    "developer_context_section",
    "equivalent_implementation_policy",
    "evidence_plan",
    "file_structure_requirements",
    "git_intelligence_summary",
    "latest_tech_information",
    "previous_story_intelligence",
    "project_context_reference",
    "story_header",
    "story_requirements",
    "technical_requirements",
    "testing_requirements",
  ]);

  const exampleReferencePattern =
    kind === "config-item" &&
    (/^HEAD~\d+\.\.HEAD$/.test(normalized) ||
      /^sha\d*>..<sha\d*$/i.test(normalized) ||
      /^[A-Za-z0-9_./-]+\.(?:ts|tsx|js|jsx|java|py|go|rs):\d+$/.test(normalized) ||
      normalized === "path:line");

  const routeOrModePattern =
    kind === "config-item" &&
    (/^skill:speclite-[a-z0-9-]+$/.test(normalized) ||
      routeOrModeValues.has(normalized) ||
      (/^[a-z]+[a-z0-9-]*-[a-z0-9-]+$/.test(normalized) &&
        /(mode|skill route|运行|推荐|gate|门控|模式|Option)/i.test(contextText)));

  const templatePlaceholderPattern =
    kind === "config-item" &&
    (/\{\{.+}}/.test(value) ||
      /\{\{[^}]+}}/.test(contextText) ||
      /^\{?(?:anchor:\.\.\.|path\d+)\}?$/.test(value) ||
      /\/assets\/.*template/i.test(contextText) ||
      /(template|模板|placeholder|占位符|代码块示例|example output|sample output)/i.test(contextText));

  const schemaFieldPattern =
    kind === "config-item" &&
    (/(schema|contract|manifest|evidence-schema|project-scan-report-schema|status-schema)/i.test(contextText) ||
      /(字段|必填字段|选填字段|required field|optional field|schema field|JSON array|JSON object|输出 JSON|包含字段|字段：|frontmatter|状态文件|state file|status file|映射|map to|作为 `title`|as `title`|作为 `detail`|as `detail`)/i.test(
        contextText,
      ) ||
      storySchemaFieldValues.has(normalized) ||
      /^(development_status|development_status\{story_key}|high_coupling_nodes|dir_indicators|is_model_file|resolved_as|resolution|completed_steps|project_parts)$/.test(
        normalized,
      ) ||
      /^\w+_status$/.test(normalized));

  const workflowParameterPattern =
    kind === "config-item" &&
    (/(workflow invocation|input|optional|required|必填|可选|参数|用户输入|derive|derived|输出参数|session context|starter output|output file)/i.test(
      contextText,
    ) ||
      /(Set|Store|Extract|Load|Calculate|Display|Read|Check|记录|存为|设置|提取|加载|输出|更新|查找|扫描|变量|列表|用户指定|保存为|当前|缓存|计数|summary|count|date)/i.test(
        contextText,
      ) ||
      isPlaceholderReference ||
      /^(context_file|session_topic|session_goals|source_documents|token_budget|downstream_consumer|research_topic_slug|project_context|project_type|current_date|story_key|story_num|epic_num|story_title|sprint_status|story_root|story_path|feature_name|baseline_commit|scan_level|current_status|review_mode|change_type|intent_summary|first_task_description|pending_review_items|resolved_review_items|review_continuation|review_date|review_outcome|sprint_status_summary|unchecked_review_count|resolved_count|high_count|med_count|low_count|concept_type|outputFile)$/.test(
        normalized,
      ));

  const externalProjectPattern =
    kind === "config-item" &&
    (/^(\*\.|\.[A-Za-z0-9]+$|@[A-Za-z]|pom\.xml$|build\.gradle$|path:line$)/.test(normalized) ||
      /(源文件|扩展名|framework|adapter|扫描整个仓库|source file|JPA|MyBatis|Spring)/i.test(contextText));

  const runtimeConfigPattern =
    /(^|\{)(project-root|speclite-runtime-root|skill-root|skill-name|communication_language|document_output_language|user_name)(\}|$)/.test(
      value,
    ) ||
    /^(_speclite|config\.toml|config\.user\.toml)/.test(normalized) ||
    /^(core|agent|workflow|modules\.sdlc)\./.test(normalized) ||
    /^(communication_language|document_output_language|user_name|activation_steps_|persistent_facts|menu$|role$|identity$|principles$|icon$)/.test(
      normalized,
    );

  const artifactPattern =
    /(\{implementation_artifacts}|\{planning_artifacts}|\{project_knowledge}|_speclite-output|sprint-status\.yaml|speclite-workflow-status\.yaml|story_location|default_output_file|output_file|output_path|report_path|review_input|cr_dir|sr_dir|story_id|epic_id)/.test(
      value,
    ) ||
    /^(implementation_artifacts|planning_artifacts|project_knowledge|story_location|default_output_file|review_input|cr_dir|sr_dir|story_id|epic_id|flow_gate_root)$/.test(
      normalized,
    ) ||
    /(?:_file|_file_path|_folder_path|_path|_dir|_root|_location|_pattern)$/.test(normalized) ||
    /^(brief_file_name|discovered_path|source_dir|test_dir|agent_roster)$/.test(normalized) ||
    /^(repo-manifest|api-contract-candidates|config-surface|historical-docs-index|schema-migration-index)\.json$/.test(
      path.basename(normalized),
    ) ||
    /^(evidence|baseline|deep-dives|planning-handoff)\//.test(normalized);

  const externalProjectFilePattern =
    kind === "config-file" &&
    /(^|\/)(Cargo\.toml|pyproject\.toml|pubspec\.yaml|package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|docker-compose\.ya?ml|\.gitlab-ci\.yml|ci\.yml|tsconfig\.json|process\.env|os\.env)$/.test(
      normalized,
    );

  const workflowLocalVariablePattern = kind === "config-item" && /^\$[A-Za-z][A-Za-z0-9_]*$/.test(value);

  if (externalProjectFilePattern) {
    return "EXTERNAL_PROJECT_FILE_REFERENCE";
  }
  if (externalProjectPattern) {
    return "EXTERNAL_PROJECT_PATTERN_REFERENCE";
  }
  if (workflowLocalVariablePattern) {
    return "WORKFLOW_LOCAL_VARIABLE";
  }
  if (runtimeConfigPattern) {
    return hasDocDefinition(hits) ? "RUNTIME_CONFIG_DEFINED" : "RUNTIME_CONFIG_REFERENCE";
  }
  if (artifactPattern) {
    return hasDocDefinition(hits) ? "ARTIFACT_PATH_DEFINED" : "ARTIFACT_PATH_REFERENCE";
  }
  if (exampleReferencePattern) {
    return "EXTERNAL_PROJECT_PATTERN_REFERENCE";
  }
  if (routeOrModePattern) {
    return "WORKFLOW_PARAMETER_REFERENCE";
  }
  if (templatePlaceholderPattern) {
    return "TEMPLATE_PLACEHOLDER";
  }
  if (schemaFieldPattern) {
    return "SCHEMA_FIELD_REFERENCE";
  }
  if (workflowParameterPattern) {
    return "WORKFLOW_PARAMETER_REFERENCE";
  }
  return docStatus ?? "UNRESOLVED";
}

function buildLocalConfigDefinitionIndex() {
  const bySkill = new Map();
  for (const ref of skillDeps.flatConfigItems) {
    for (const occurrence of ref.occurrences) {
      if (!isLocalConfigDefinitionSource(occurrence)) {
        continue;
      }
      if (!bySkill.has(ref.skill)) {
        bySkill.set(ref.skill, new Map());
      }
      const skillIndex = bySkill.get(ref.skill);
      const source = {
        file: occurrence.file,
        line: occurrence.line,
        extractorSource: occurrence.source,
        context: occurrence.context,
        matchedValue: ref.value,
      };
      if (!skillIndex.has(ref.value)) {
        skillIndex.set(ref.value, []);
      }
      skillIndex.get(ref.value).push(source);
    }
  }
  return bySkill;
}

const localConfigDefinitionIndex = buildLocalConfigDefinitionIndex();

function lookupLocalConfigDefinition(ref) {
  const skillIndex = localConfigDefinitionIndex.get(ref.skill);
  if (!skillIndex) {
    return null;
  }

  const normalized = stripPlaceholderBraces(ref.value);
  const exact = skillIndex.get(normalized) ?? skillIndex.get(ref.value);
  if (exact?.length > 0) {
    return {
      ...exact[0],
      matchKind: normalized === ref.value ? "exact" : "placeholder-unwrapped",
    };
  }

  if (!normalized.includes(".")) {
    const suffixMatches = [...skillIndex.entries()].filter(([key]) => key.endsWith(`.${normalized}`));
    if (suffixMatches.length === 1 && suffixMatches[0][1].length > 0) {
      return {
        ...suffixMatches[0][1][0],
        matchKind: "unique-suffix",
      };
    }
  }

  return null;
}

function resolveLocalConfigItem(ref) {
  const definition = ref.occurrences.find(isLocalConfigDefinitionSource);
  if (definition) {
    return {
      defined: true,
      source: {
        file: definition.file,
        line: definition.line,
        extractorSource: definition.source,
        context: definition.context,
        matchedValue: ref.value,
        matchKind: "same-reference",
      },
    };
  }

  const indexedDefinition = lookupLocalConfigDefinition(ref);
  if (indexedDefinition) {
    return {
      defined: true,
      source: indexedDefinition,
    };
  }

  return {
    defined: false,
    source: null,
  };
}

function firstOccurrences(ref) {
  return ref.occurrences.slice(0, 5).map((occurrence) => ({
    file: occurrence.file,
    line: occurrence.line,
    context: occurrence.context,
  }));
}

const coverage = [];
for (const ref of skillDeps.flatConfigFiles) {
  const hits = searchDocs(ref.value);
  const localFile = resolveLocalConfigFile(ref);
  const status = localFile.exists ? "FILE_EXISTS" : classifyKnownReference(ref, "config-file", hits);
  coverage.push({
    kind: "config-file",
    value: ref.value,
    skill: ref.skill,
    scope: ref.scope,
    skillDir: ref.skillDir,
    status,
    localFile,
    hitCount: hits.length,
    planningHitCount: hits.filter((hit) => hit.isPlanning).length,
    implementationHitCount: hits.filter((hit) => hit.isImplementation).length,
    firstSkillOccurrences: firstOccurrences(ref),
    firstDocHits: hits.slice(0, 8),
  });
}
for (const ref of skillDeps.flatConfigItems) {
  const hits = searchDocs(ref.value);
  const localItem = resolveLocalConfigItem(ref);
  const status = localItem.defined
    ? isBracedPlaceholder(ref.value)
      ? "LOCAL_PLACEHOLDER_DEFINED"
      : "LOCAL_CONFIG_DEFINED"
    : classifyKnownReference(ref, "config-item", hits);
  coverage.push({
    kind: "config-item",
    value: ref.value,
    itemKind: ref.kind,
    skill: ref.skill,
    scope: ref.scope,
    skillDir: ref.skillDir,
    status,
    localItem,
    hitCount: hits.length,
    planningHitCount: hits.filter((hit) => hit.isPlanning).length,
    implementationHitCount: hits.filter((hit) => hit.isImplementation).length,
    firstSkillOccurrences: firstOccurrences(ref),
    firstDocHits: hits.slice(0, 8),
  });
}

const docExtractedFiles = [];
const docExtractedItems = [];
for (const doc of docTexts) {
  if (doc.text === null) {
    continue;
  }
  const extracted = extractConfigRefsFromFile({
    filePath: doc.filePath,
    relativePath: doc.relativePath,
    rootDir: repoRoot,
  });
  if (!extracted) {
    continue;
  }
  for (const ref of extracted.configFiles) {
    docExtractedFiles.push({ ...ref, doc: doc.relativePath });
  }
  for (const ref of extracted.configItems) {
    docExtractedItems.push({ ...ref, doc: doc.relativePath });
  }
}

const skillFileValues = new Set(skillDeps.flatConfigFiles.map((ref) => ref.value));
const skillItemValues = new Set(skillDeps.flatConfigItems.map((ref) => ref.value));
const docOnlyConfigFiles = uniqueByValue(docExtractedFiles).filter((ref) => !skillFileValues.has(ref.value));
const docOnlyConfigItems = uniqueByValue(docExtractedItems).filter((ref) => !skillItemValues.has(ref.value));

const bySkill = new Map(
  skillDeps.skills.map((skill) => [
    skill.name,
    {
      skill: skill.name,
      scope: skill.scope,
      total: 0,
      missing: 0,
      weak: 0,
      fileExists: 0,
      localConfigDefined: 0,
      localPlaceholderDefined: 0,
      runtimeConfigReference: 0,
      artifactPathReference: 0,
      workflowLocalVariable: 0,
      externalProjectFileReference: 0,
      externalProjectPatternReference: 0,
      templatePlaceholder: 0,
      schemaFieldReference: 0,
      workflowParameterReference: 0,
      unresolved: 0,
      implementationOnly: 0,
      planningDefined: 0,
    },
  ]),
);
for (const item of coverage) {
  const bucket = bySkill.get(item.skill);
  bucket.total += 1;
  if (item.status === "UNRESOLVED") {
    bucket.missing += 1;
    bucket.unresolved += 1;
  } else if (item.status === "WEAK_DOC_EVIDENCE") {
    bucket.weak += 1;
  } else if (item.status === "FILE_EXISTS") {
    bucket.fileExists += 1;
  } else if (item.status === "LOCAL_CONFIG_DEFINED") {
    bucket.localConfigDefined += 1;
  } else if (item.status === "LOCAL_PLACEHOLDER_DEFINED") {
    bucket.localPlaceholderDefined += 1;
  } else if (item.status === "RUNTIME_CONFIG_REFERENCE" || item.status === "RUNTIME_CONFIG_DEFINED") {
    bucket.runtimeConfigReference += 1;
  } else if (item.status === "ARTIFACT_PATH_REFERENCE" || item.status === "ARTIFACT_PATH_DEFINED") {
    bucket.artifactPathReference += 1;
  } else if (item.status === "WORKFLOW_LOCAL_VARIABLE") {
    bucket.workflowLocalVariable += 1;
  } else if (item.status === "EXTERNAL_PROJECT_FILE_REFERENCE") {
    bucket.externalProjectFileReference += 1;
  } else if (item.status === "EXTERNAL_PROJECT_PATTERN_REFERENCE") {
    bucket.externalProjectPatternReference += 1;
  } else if (item.status === "TEMPLATE_PLACEHOLDER") {
    bucket.templatePlaceholder += 1;
  } else if (item.status === "SCHEMA_FIELD_REFERENCE") {
    bucket.schemaFieldReference += 1;
  } else if (item.status === "WORKFLOW_PARAMETER_REFERENCE") {
    bucket.workflowParameterReference += 1;
  } else if (item.status === "DEFINED_IN_IMPLEMENTATION_DOCS") {
    bucket.implementationOnly += 1;
  } else if (item.status === "DEFINED_IN_PLANNING_DOCS") {
    bucket.planningDefined += 1;
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  docRoots: docRoots.map((root) => toPosix(path.relative(repoRoot, root))),
  docFileCount: docFiles.length,
  skillCount: skillDeps.skillCount,
  dependencyCount: coverage.length,
  unresolvedCount: coverage.filter((item) => item.status === "UNRESOLVED").length,
  weakDocEvidenceCount: coverage.filter((item) => item.status === "WEAK_DOC_EVIDENCE").length,
  implementationOnlyDefinitionCount: coverage.filter((item) => item.status === "DEFINED_IN_IMPLEMENTATION_DOCS").length,
  planningDefinedCount: coverage.filter((item) => item.status === "DEFINED_IN_PLANNING_DOCS").length,
  localFileExistsCount: coverage.filter((item) => item.status === "FILE_EXISTS").length,
  localConfigDefinedCount: coverage.filter((item) => item.status === "LOCAL_CONFIG_DEFINED").length,
  localPlaceholderDefinedCount: coverage.filter((item) => item.status === "LOCAL_PLACEHOLDER_DEFINED").length,
  runtimeConfigReferenceCount: coverage.filter((item) => item.status === "RUNTIME_CONFIG_REFERENCE" || item.status === "RUNTIME_CONFIG_DEFINED").length,
  artifactPathReferenceCount: coverage.filter((item) => item.status === "ARTIFACT_PATH_REFERENCE" || item.status === "ARTIFACT_PATH_DEFINED").length,
  workflowLocalVariableCount: coverage.filter((item) => item.status === "WORKFLOW_LOCAL_VARIABLE").length,
  externalProjectFileReferenceCount: coverage.filter((item) => item.status === "EXTERNAL_PROJECT_FILE_REFERENCE").length,
  externalProjectPatternReferenceCount: coverage.filter((item) => item.status === "EXTERNAL_PROJECT_PATTERN_REFERENCE").length,
  templatePlaceholderCount: coverage.filter((item) => item.status === "TEMPLATE_PLACEHOLDER").length,
  schemaFieldReferenceCount: coverage.filter((item) => item.status === "SCHEMA_FIELD_REFERENCE").length,
  workflowParameterReferenceCount: coverage.filter((item) => item.status === "WORKFLOW_PARAMETER_REFERENCE").length,
  docOnlyConfigFileCandidateCount: docOnlyConfigFiles.length,
  docOnlyConfigItemCandidateCount: docOnlyConfigItems.length,
  zeroDependencySkillCount: [...bySkill.values()].filter((item) => item.total === 0).length,
};

const missingByValue = [...coverage
  .filter((item) => item.status === "UNRESOLVED")
  .reduce((map, item) => {
    const key = `${item.kind}\u0000${item.value}`;
    if (!map.has(key)) {
      map.set(key, {
        kind: item.kind,
        value: item.value,
        skillCount: 0,
        skills: new Set(),
        firstSkillOccurrences: [],
      });
    }
    const bucket = map.get(key);
    bucket.skills.add(item.skill);
    if (bucket.firstSkillOccurrences.length < 5) {
      bucket.firstSkillOccurrences.push({
        skill: item.skill,
        ...item.firstSkillOccurrences[0],
      });
    }
    return map;
  }, new Map())
  .values()]
  .map((item) => ({
    ...item,
    skillCount: item.skills.size,
    skills: [...item.skills].sort(),
  }))
  .sort((a, b) => b.skillCount - a.skillCount || a.value.localeCompare(b.value));

function normalizeRuntimePath(value) {
  return value
    .replace(/^\{project-root}\/_speclite/, "{speclite-runtime-root}")
    .replace(/\{skill_name}/g, "{skill-name}")
    .replace(/\/+/g, "/");
}

const runtimePathRefs = coverage
  .filter((item) => item.kind === "config-file")
  .filter((item) => /(_speclite|speclite-runtime-root|skill-root|customize\.toml|config\.toml)/.test(item.value))
  .map((item) => ({
    value: item.value,
    normalized: normalizeRuntimePath(item.value),
    status: item.status,
    skill: item.skill,
    firstSkillOccurrences: item.firstSkillOccurrences,
  }));

const runtimePathVariants = [...runtimePathRefs
  .reduce((map, item) => {
    const key = path.basename(item.normalized);
    if (!map.has(key)) {
      map.set(key, {
        basename: key,
        variants: new Map(),
        skills: new Set(),
      });
    }
    const bucket = map.get(key);
    bucket.skills.add(item.skill);
    if (!bucket.variants.has(item.normalized)) {
      bucket.variants.set(item.normalized, {
        normalized: item.normalized,
        rawValues: new Set(),
        statuses: new Set(),
        firstSkillOccurrences: [],
      });
    }
    const variant = bucket.variants.get(item.normalized);
    variant.rawValues.add(item.value);
    variant.statuses.add(item.status);
    if (variant.firstSkillOccurrences.length < 5) {
      variant.firstSkillOccurrences.push({
        skill: item.skill,
        ...item.firstSkillOccurrences[0],
      });
    }
    return map;
  }, new Map())
  .values()]
  .map((bucket) => ({
    basename: bucket.basename,
    skillCount: bucket.skills.size,
    skills: [...bucket.skills].sort(),
    variants: [...bucket.variants.values()].map((variant) => ({
      normalized: variant.normalized,
      rawValues: [...variant.rawValues].sort(),
      statuses: [...variant.statuses].sort(),
      firstSkillOccurrences: variant.firstSkillOccurrences,
    })),
  }))
  .filter((bucket) => bucket.variants.length > 1 || bucket.variants.some((variant) => variant.statuses.includes("UNRESOLVED")))
  .sort((a, b) => b.skillCount - a.skillCount || a.basename.localeCompare(b.basename));

const output = {
  ...summary,
  perSkillSummary: [...bySkill.values()].sort((a, b) => a.skill.localeCompare(b.skill)),
  coverage,
  missingByValue,
  runtimePathVariants,
  docOnlyConfigFiles,
  docOnlyConfigItems,
};

fs.writeFileSync(
  path.join(resultsDir, "config-doc-coverage.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

function rowsForStatus(status, limit = 80) {
  return coverage
    .filter((item) => item.status === status)
    .slice(0, limit)
    .map((item) => {
      const first = item.firstSkillOccurrences[0];
      return `| \`${item.skill}\` | ${item.kind} | \`${item.value}\` | [${first.file}](/Users/fancyliu/Repos/SpecLite/${first.file}:${first.line}) |`;
    });
}

const lines = [];
lines.push("# Config Doc Coverage（配置开发文档覆盖审计）");
lines.push("");
lines.push(`- 生成时间：${summary.generatedAt}`);
lines.push(`- 开发文档文件数量：${summary.docFileCount}`);
lines.push(`- Skill 数量：${summary.skillCount}`);
lines.push(`- 配置依赖条目数：${summary.dependencyCount}`);
lines.push(`- 本地配置文件存在：${summary.localFileExistsCount}`);
lines.push(`- 本地配置项定义：${summary.localConfigDefinedCount}`);
lines.push(`- 本地占位引用已回连：${summary.localPlaceholderDefinedCount}`);
lines.push(`- Runtime config 引用：${summary.runtimeConfigReferenceCount}`);
lines.push(`- Artifact path 引用：${summary.artifactPathReferenceCount}`);
lines.push(`- Workflow 局部变量：${summary.workflowLocalVariableCount}`);
lines.push(`- 外部项目文件引用：${summary.externalProjectFileReferenceCount}`);
lines.push(`- 外部项目模式引用：${summary.externalProjectPatternReferenceCount}`);
lines.push(`- 模板占位符：${summary.templatePlaceholderCount}`);
lines.push(`- Schema 字段引用：${summary.schemaFieldReferenceCount}`);
lines.push(`- Workflow 参数引用：${summary.workflowParameterReferenceCount}`);
lines.push(`- Planning docs 定义：${summary.planningDefinedCount}`);
lines.push(`- 仅 Implementation docs 定义：${summary.implementationOnlyDefinitionCount}`);
lines.push(`- 弱证据：${summary.weakDocEvidenceCount}`);
lines.push(`- 未解析：${summary.unresolvedCount}`);
lines.push(`- 未提取到配置依赖的 Skill：${summary.zeroDependencySkillCount}`);
lines.push(`- 开发文档中存在但 skill 未引用的配置文件候选：${summary.docOnlyConfigFileCandidateCount}`);
lines.push(`- 开发文档中存在但 skill 未引用的配置项候选：${summary.docOnlyConfigItemCandidateCount}`);
lines.push("");
lines.push("## Per Skill Summary（逐 Skill 汇总）");
lines.push("");
lines.push("| Skill | Scope | Total | File Exists | Local Config | Local Placeholder | Runtime | Artifact | Workflow Var | External File | External Pattern | Template | Schema | Workflow Param | Planning | Implementation | Weak | Unresolved |");
lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const item of output.perSkillSummary) {
  lines.push(
    `| \`${item.skill}\` | \`${item.scope}\` | ${item.total} | ${item.fileExists} | ${item.localConfigDefined} | ${item.localPlaceholderDefined} | ${item.runtimeConfigReference} | ${item.artifactPathReference} | ${item.workflowLocalVariable} | ${item.externalProjectFileReference} | ${item.externalProjectPatternReference} | ${item.templatePlaceholder} | ${item.schemaFieldReference} | ${item.workflowParameterReference} | ${item.planningDefined} | ${item.implementationOnly} | ${item.weak} | ${item.unresolved} |`,
  );
}
lines.push("");
lines.push("## Per Skill Findings（逐 Skill 检查结果）");
lines.push("");
for (const skill of output.perSkillSummary) {
  lines.push(`### ${skill.skill}`);
  lines.push("");
  lines.push(`- Scope：\`${skill.scope}\``);
  lines.push(`- Total：${skill.total}`);
  lines.push(`- File Exists：${skill.fileExists}`);
  lines.push(`- Local Config Defined：${skill.localConfigDefined}`);
  lines.push(`- Local Placeholder Defined：${skill.localPlaceholderDefined}`);
  lines.push(`- Runtime Config Reference：${skill.runtimeConfigReference}`);
  lines.push(`- Artifact Path Reference：${skill.artifactPathReference}`);
  lines.push(`- Workflow Local Variable：${skill.workflowLocalVariable}`);
  lines.push(`- External Project File Reference：${skill.externalProjectFileReference}`);
  lines.push(`- External Project Pattern Reference：${skill.externalProjectPatternReference}`);
  lines.push(`- Template Placeholder：${skill.templatePlaceholder}`);
  lines.push(`- Schema Field Reference：${skill.schemaFieldReference}`);
  lines.push(`- Workflow Parameter Reference：${skill.workflowParameterReference}`);
  lines.push(`- Planning Defined：${skill.planningDefined}`);
  lines.push(`- Implementation Only：${skill.implementationOnly}`);
  lines.push(`- Weak：${skill.weak}`);
  lines.push(`- Unresolved：${skill.unresolved}`);
  if (skill.total === 0) {
    lines.push("- Result：脚本未提取到配置文件或配置项依赖。");
    lines.push("");
    continue;
  }
  const skillMissing = coverage
    .filter((item) => item.skill === skill.skill && item.status === "UNRESOLVED")
    .slice(0, 12);
  const skillWeak = coverage
    .filter((item) => item.skill === skill.skill && item.status === "WEAK_DOC_EVIDENCE")
    .slice(0, 8);
  const skillLocalFiles = coverage
    .filter((item) => item.skill === skill.skill && item.status === "FILE_EXISTS")
    .slice(0, 8);
  const skillLocalItems = coverage
    .filter((item) => item.skill === skill.skill && item.status === "LOCAL_CONFIG_DEFINED")
    .slice(0, 8);
  const skillLocalPlaceholders = coverage
    .filter((item) => item.skill === skill.skill && item.status === "LOCAL_PLACEHOLDER_DEFINED")
    .slice(0, 8);
  if (skillLocalFiles.length > 0) {
    lines.push("- Local File Exists Sample：");
    for (const item of skillLocalFiles) {
      const first = item.firstSkillOccurrences[0];
      lines.push(`  - config-file \`${item.value}\` -> \`${item.localFile.resolvedPath}\` (${item.localFile.kind}) at \`${first.file}:${first.line}\``);
    }
  }
  if (skillLocalItems.length > 0) {
    lines.push("- Local Config Defined Sample：");
    for (const item of skillLocalItems) {
      lines.push(`  - config-item \`${item.value}\` defined by \`${item.localItem.source.matchedValue}\` at \`${item.localItem.source.file}:${item.localItem.source.line}\` (${item.localItem.source.extractorSource}, ${item.localItem.source.matchKind})`);
    }
  }
  if (skillLocalPlaceholders.length > 0) {
    lines.push("- Local Placeholder Defined Sample：");
    for (const item of skillLocalPlaceholders) {
      lines.push(`  - config-item \`${item.value}\` defined by \`${item.localItem.source.matchedValue}\` at \`${item.localItem.source.file}:${item.localItem.source.line}\` (${item.localItem.source.extractorSource}, ${item.localItem.source.matchKind})`);
    }
  }
  if (skillMissing.length > 0) {
    lines.push("- Unresolved Sample：");
    for (const item of skillMissing) {
      const first = item.firstSkillOccurrences[0];
      lines.push(`  - ${item.kind} \`${item.value}\` at \`${first.file}:${first.line}\``);
    }
    if (skill.unresolved > skillMissing.length) {
      lines.push(`  - 另有 ${skill.unresolved - skillMissing.length} 项见 JSON。`);
    }
  }
  if (skillWeak.length > 0) {
    lines.push("- Weak Evidence Sample：");
    for (const item of skillWeak) {
      const first = item.firstSkillOccurrences[0];
      lines.push(`  - ${item.kind} \`${item.value}\` at \`${first.file}:${first.line}\``);
    }
    if (skill.weak > skillWeak.length) {
      lines.push(`  - 另有 ${skill.weak - skillWeak.length} 项见 JSON。`);
    }
  }
  if (skill.unresolved === 0 && skill.weak === 0) {
    lines.push("- Result：未发现未解析或弱证据项。");
  }
  lines.push("");
}
lines.push("");
lines.push("## Unresolved（未解析）");
lines.push("");
lines.push("| Skill | Kind | Value | First Skill Source |");
lines.push("| --- | --- | --- | --- |");
lines.push(...rowsForStatus("UNRESOLVED"));
if (coverage.filter((item) => item.status === "UNRESOLVED").length > 80) {
  lines.push(
    `| ... | ... | ... | 另有 ${coverage.filter((item) => item.status === "UNRESOLVED").length - 80} 项，见 JSON |`,
  );
}
lines.push("");
lines.push("## High Repeat Unresolved Values（高频未解析项）");
lines.push("");
lines.push("| Kind | Value | Skill Count | Sample Skills |");
lines.push("| --- | --- | ---: | --- |");
for (const item of missingByValue.slice(0, 40)) {
  lines.push(
    `| ${item.kind} | \`${item.value}\` | ${item.skillCount} | ${item.skills.slice(0, 8).map((skill) => `\`${skill}\``).join(", ")}${item.skills.length > 8 ? " ..." : ""} |`,
  );
}
lines.push("");
lines.push("## Runtime Path Variants（Runtime 路径变体候选）");
lines.push("");
lines.push("这些候选由脚本按 runtime path 规则归并。它们不一定都是错误，但需要人工确认是否属于合法别名、模板占位符，还是开发文档未定义的路径变体。");
lines.push("");
for (const bucket of runtimePathVariants.slice(0, 30)) {
  lines.push(`### ${bucket.basename}`);
  lines.push("");
  lines.push(`- Skill Count：${bucket.skillCount}`);
  for (const variant of bucket.variants) {
    lines.push(`- Variant：\`${variant.normalized}\`；Status：${variant.statuses.join(", ")}；Raw：${variant.rawValues.map((value) => `\`${value}\``).join(", ")}`);
  }
  lines.push("");
}
if (runtimePathVariants.length > 30) {
  lines.push(`另有 ${runtimePathVariants.length - 30} 组，见 JSON。`);
  lines.push("");
}
lines.push("");
lines.push("## Weak Doc Evidence（弱证据）");
lines.push("");
lines.push("| Skill | Kind | Value | First Skill Source |");
lines.push("| --- | --- | --- | --- |");
lines.push(...rowsForStatus("WEAK_DOC_EVIDENCE", 80));
if (coverage.filter((item) => item.status === "WEAK_DOC_EVIDENCE").length > 80) {
  lines.push(
    `| ... | ... | ... | 另有 ${coverage.filter((item) => item.status === "WEAK_DOC_EVIDENCE").length - 80} 项，见 JSON |`,
  );
}
lines.push("");
lines.push("## Doc Only Candidates（开发文档独有候选）");
lines.push("");
lines.push("这些候选由同一提取器从开发文档中提取，但未在 core/sdlc skill 依赖集合中出现。它们可能是正常的实现细节，也可能表示 canonical skill 漏掉的配置约束。完整来源见 JSON。");
lines.push("");
lines.push("### Config Files");
lines.push("");
for (const ref of docOnlyConfigFiles.slice(0, 80)) {
  lines.push(`- \`${ref.value}\``);
}
if (docOnlyConfigFiles.length > 80) {
  lines.push(`- 另有 ${docOnlyConfigFiles.length - 80} 项，见 JSON。`);
}
lines.push("");
lines.push("### Config Items");
lines.push("");
for (const ref of docOnlyConfigItems.slice(0, 120)) {
  lines.push(`- \`${ref.value}\``);
}
if (docOnlyConfigItems.length > 120) {
  lines.push(`- 另有 ${docOnlyConfigItems.length - 120} 项，见 JSON。`);
}
lines.push("");
lines.push("## Evidence（证据）");
lines.push("");
lines.push("完整命中、来源行号和上下文见 `config-doc-coverage.json`。");

fs.writeFileSync(path.join(resultsDir, "config-doc-coverage.md"), `${lines.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      docFileCount: summary.docFileCount,
      dependencyCount: summary.dependencyCount,
      localFileExistsCount: summary.localFileExistsCount,
      localConfigDefinedCount: summary.localConfigDefinedCount,
      localPlaceholderDefinedCount: summary.localPlaceholderDefinedCount,
      runtimeConfigReferenceCount: summary.runtimeConfigReferenceCount,
      artifactPathReferenceCount: summary.artifactPathReferenceCount,
      workflowLocalVariableCount: summary.workflowLocalVariableCount,
      externalProjectFileReferenceCount: summary.externalProjectFileReferenceCount,
      externalProjectPatternReferenceCount: summary.externalProjectPatternReferenceCount,
      templatePlaceholderCount: summary.templatePlaceholderCount,
      schemaFieldReferenceCount: summary.schemaFieldReferenceCount,
      workflowParameterReferenceCount: summary.workflowParameterReferenceCount,
      unresolvedCount: summary.unresolvedCount,
      weakDocEvidenceCount: summary.weakDocEvidenceCount,
      implementationOnlyDefinitionCount: summary.implementationOnlyDefinitionCount,
      planningDefinedCount: summary.planningDefinedCount,
      json: toPosix(path.relative(repoRoot, path.join(resultsDir, "config-doc-coverage.json"))),
      markdown: toPosix(path.relative(repoRoot, path.join(resultsDir, "config-doc-coverage.md"))),
    },
    null,
    2,
  ),
);
