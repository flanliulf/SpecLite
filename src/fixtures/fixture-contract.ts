import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  CoveredCommandResultSchema,
  ValidationIssueSchema,
} from "../diagnostics/command-result-schema.js";
import { normalizeProjectRelativePosixPath } from "../fs/path-normalizer.js";
import {
  FilesIndexSchema,
  HelpIndexSchema,
  ManifestSchema,
  PhaseCoverageSchema,
  SkillIndexSchema,
} from "../manifest/manifest-schema.js";

export const RELEASE_GATE_FIXTURE_CASES = [
  "fresh-install-empty-project",
  "existing-install-update",
  "ide-drift",
  "source-integrity",
  "resolve-parity",
  "path-portability",
  "skill-artifact-loop",
] as const;

export const REQUIRED_SOURCE_INTEGRITY_SUB_CASES = [
  "bundled-packaging-trusted",
  "bundled-packaging-missing-evidence-blocked",
  "registry-lock-trusted",
  "registry-unverified",
  "git-floating-blocked",
  "local-source-snapshot-unverified",
  "local-source-path-redacted",
  "local-source-installed-state-blocked",
  "artifact-hash-mismatch-blocked",
  "source-unreadable-blocked",
] as const;

export const EXPECTED_OUTPUT_CLASS_IDS = [
  "installed-tree",
  "manifest-index-snapshot",
  "command-json",
  "validation-issue-set",
  "stderr-jsonl-diagnostics",
  "file-hash",
  "normalized-file-tree-summary",
  "human-output-profile",
] as const;

export const FIXTURE_GATE_CLASSIFICATIONS = [
  "fixture-project-gate",
  "fixture-group-sub-case",
  "release-checklist-gate",
  "regression-asset",
  "documentation-example",
] as const;

export const HUMAN_OUTPUT_PROFILES = ["compact", "evidence", "structured"] as const;
export const MVP_NODE_RUNTIME_MATRIX = [22, 24] as const;
export const MVP_RUNTIME_POLICY = {
  minimumNode: 22,
  recommendedNode: 24,
  requiredRange: ">=22",
} as const;
export const RELEASE_FIXTURE_MATRIX = [
  { fixtureId: "fresh-install-empty-project", status: "required" },
  { fixtureId: "existing-install-update", status: "required" },
  { fixtureId: "ide-drift", status: "required" },
  { fixtureId: "source-integrity", status: "required" },
  { fixtureId: "resolve-parity", status: "required" },
  { fixtureId: "path-portability", status: "required" },
  { fixtureId: "skill-artifact-loop", status: "required" },
] as const;
const SCHEMA_DECLARED_TIMESTAMP_FIELDS = new Set(["createdAt", "generatedAt", "timestamp", "updatedAt"]);

export type FixtureCaseId = (typeof RELEASE_GATE_FIXTURE_CASES)[number];
export type FixtureGroupId = "source-integrity";
export type FixtureSubCaseId = (typeof REQUIRED_SOURCE_INTEGRITY_SUB_CASES)[number] | string;
export type ExpectedOutputClass = (typeof EXPECTED_OUTPUT_CLASS_IDS)[number];
export type FixtureGateClassification = (typeof FIXTURE_GATE_CLASSIFICATIONS)[number];
export type HumanOutputProfile = (typeof HUMAN_OUTPUT_PROFILES)[number];

export type ExpectedOutputClassRegistryEntry = {
  classId: ExpectedOutputClass;
  parserAnchor: string;
  comparisonRule: string;
  profiles?: readonly HumanOutputProfile[];
};

export type FixtureContractViolation = {
  code:
    | "invalid-case-id"
    | "invalid-group-id"
    | "invalid-sub-case-id"
    | "invalid-layout-path"
    | "missing-input-dir"
    | "missing-expected-dir"
    | "missing-readme"
    | "unstable-expected-truth"
    | "unknown-expected-output-class"
    | "ansi-output"
    | "spinner-only-progress"
    | "missing-human-field"
    | "path-leak"
    | "snapshot-before-spec"
    | "snapshot-before-parser"
    | "snapshot-without-local-action"
    | "ci-snapshot-update";
  path?: string;
  message: string;
};

export type FixtureCaseLayoutInput = {
  relativeCasePath: string;
  caseId?: string;
  groupId?: string;
  subCaseId?: string;
  entries: readonly string[];
};

export type StableJsonOptions = {
  allowedNonStableFields?: readonly string[];
  normalizePathSeparators?: boolean;
};

export type SemanticJsonComparison = {
  actual: unknown;
  expected: unknown;
  allowedNonStableFields?: readonly string[];
};

export type HumanOutputAssertionInput = {
  profile: HumanOutputProfile;
  output: string;
  requiredFields: readonly string[];
  terminalWidth?: number;
};

export type SnapshotUpdateDisciplineInput = {
  owningSpecUpdated: boolean;
  executableParserUpdated: boolean;
  expectedOutputUpdated: boolean;
  ci: boolean;
  explicitLocalUpdate: boolean;
};

export const FixtureCaseIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const FixtureGroupIdSchema = FixtureCaseIdSchema;
export const FixtureSubCaseIdSchema = FixtureCaseIdSchema;
export const ExpectedOutputClassSchema = z.enum(EXPECTED_OUTPUT_CLASS_IDS);
export const FixtureGateClassificationSchema = z.enum(FIXTURE_GATE_CLASSIFICATIONS);

const FixtureManifestCaseIdSchema = z.union([
  z.enum(RELEASE_GATE_FIXTURE_CASES),
  z.string().regex(/^source-integrity\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/),
]);

export const FixtureCaseManifestSchema = z
  .object({
    caseId: FixtureManifestCaseIdSchema,
    releaseGate: z.boolean().optional(),
    purpose: z.string().min(1).optional(),
    expectedGate: z.string().min(1).optional(),
    expectedOutputClass: ExpectedOutputClassSchema.optional(),
  })
  .passthrough();

export const ExpectedCommandJsonSchema = CoveredCommandResultSchema;
export const ExpectedStderrJsonLineSchema = ValidationIssueSchema;
export const ExpectedValidationIssueSetSchema = z.array(ValidationIssueSchema);
export const ExpectedManifestSnapshotSchema = z.union([
  ManifestSchema,
  SkillIndexSchema,
  HelpIndexSchema,
  FilesIndexSchema,
  PhaseCoverageSchema,
]);

export const ReleasePerformanceEvidenceSchema = z
  .object({
    schemaVersion: z.literal("speclite.release-performance-evidence.v1"),
    baselineId: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    generatedAtPolicy: z.literal("non-stable-excluded-from-fixture-snapshots"),
    measurements: z.array(
      z
        .object({
          command: z.enum(["install", "status", "validate", "update", "resolve", "update.repair"]),
          fixtureCase: FixtureCaseIdSchema,
          nodeVersion: z.string().min(1),
          osFamily: z.enum(["macos", "windows"]),
          sampleCount: z.number().int().positive(),
          p95DurationMs: z.number().nonnegative(),
          acceptedBaselineMs: z.number().nonnegative(),
          regressionPercentage: z.number(),
          profilingSampleLocation: z
            .string()
            .min(1)
            .refine((value) => {
              try {
                normalizeProjectRelativePosixPath(value);
                return true;
              } catch {
                return false;
              }
            }, "profilingSampleLocation must be project-relative POSIX"),
          conclusion: z.enum(["pass", "fail"]),
        })
        .strict(),
    ),
  })
  .strict();

export const FIXTURE_GATE_REGISTRY = {
  fixtureProjectGates: {
    "fresh-install-empty-project": {
      releaseGate: true,
      purpose: "fresh install generated tree, manifest/index, IDE mirrors and ready summary",
    },
    "existing-install-update": {
      releaseGate: true,
      purpose: "update safety, ownership protection and conflict boundaries",
    },
    "ide-drift": {
      releaseGate: true,
      purpose: "IDE mirror drift detection and repair planning",
    },
    "source-integrity": {
      releaseGate: true,
      purpose: "source descriptor trust and evidence fixture group",
    },
    "resolve-parity": {
      releaseGate: true,
      purpose: "config and customization resolver parity",
    },
    "path-portability": {
      releaseGate: true,
      purpose: "cross-platform path normalization and escape behavior",
    },
    "skill-artifact-loop": {
      releaseGate: true,
      purpose: "installed skill activation and artifact metadata loop",
    },
  },
  fixtureGroupSubCases: Object.fromEntries(
    REQUIRED_SOURCE_INTEGRITY_SUB_CASES.map((subCase) => [
      `source-integrity/${subCase}`,
      {
        releaseGate: true,
        groupId: "source-integrity",
        subCaseId: subCase,
      },
    ]),
  ) as Record<string, { releaseGate: true; groupId: "source-integrity"; subCaseId: string }>,
  releaseChecklistGates: {
    "packaging-acceptance": {
      releaseGate: true,
      stableArtifact: "release/packaging-manifest.json",
      commandId: "npm run release:packaging-check",
    },
  },
} as const;

export const EXPECTED_OUTPUT_CLASS_REGISTRY: readonly ExpectedOutputClassRegistryEntry[] = [
  {
    classId: "installed-tree",
    parserAnchor: "src/fixtures/fixture-contract.ts",
    comparisonRule: "normalize project-relative POSIX file-tree summary and require hashes for installer-owned files",
  },
  {
    classId: "manifest-index-snapshot",
    parserAnchor: "src/manifest/manifest-schema.ts",
    comparisonRule: "parse through manifest/index schemas and normalize schema-declared generated metadata timestamps",
  },
  {
    classId: "command-json",
    parserAnchor: "src/diagnostics/command-result-schema.ts",
    comparisonRule: "parse CommandResult and compare semantic fields, ordering and redaction-safe paths",
  },
  {
    classId: "validation-issue-set",
    parserAnchor: "src/diagnostics/command-result-schema.ts",
    comparisonRule: "parse ValidationIssue array and compare severity, category, issueId, location, details and actions",
  },
  {
    classId: "stderr-jsonl-diagnostics",
    parserAnchor: "src/config/resolve-output-schema.ts",
    comparisonRule: "parse each stderr JSON Lines diagnostic as ValidationIssue",
  },
  {
    classId: "file-hash",
    parserAnchor: "src/manifest/manifest-schema.ts",
    comparisonRule: "compare sha256 hash assertions for installer-owned files",
  },
  {
    classId: "normalized-file-tree-summary",
    parserAnchor: "src/fixtures/fixture-contract.ts",
    comparisonRule: "compare normalized project-relative POSIX paths and stable file metadata",
  },
  {
    classId: "human-output-profile",
    parserAnchor: "src/diagnostics/output.ts",
    comparisonRule: "assert Compact/Evidence/Structured field presence, no ANSI, text equivalence and narrow fallback fields",
    profiles: HUMAN_OUTPUT_PROFILES,
  },
];

export type FixtureCaseManifest = z.infer<typeof FixtureCaseManifestSchema>;

export function parseExpectedCommandJson(value: unknown) {
  return ExpectedCommandJsonSchema.parse(value);
}

export function parseExpectedManifestSnapshot(value: unknown) {
  return ExpectedManifestSnapshotSchema.parse(value);
}

export function parseExpectedValidationIssueSet(value: unknown) {
  return ExpectedValidationIssueSetSchema.parse(value);
}

export function parseExpectedStderrJsonLines(value: string) {
  return value
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => ExpectedStderrJsonLineSchema.parse(JSON.parse(line)));
}

export function getFixtureGateClassification(caseId: string): FixtureGateClassification | undefined {
  if (caseId in FIXTURE_GATE_REGISTRY.fixtureProjectGates) return "fixture-project-gate";
  if (caseId in FIXTURE_GATE_REGISTRY.fixtureGroupSubCases) return "fixture-group-sub-case";
  if (isSourceIntegrityVariantGate(caseId)) return "fixture-group-sub-case";
  if (caseId in FIXTURE_GATE_REGISTRY.releaseChecklistGates) return "release-checklist-gate";
  return undefined;
}

export function validateFixtureCaseLayout(input: FixtureCaseLayoutInput): FixtureContractViolation[] {
  const violations: FixtureContractViolation[] = [];
  const normalizedCasePath = normalizeLoosePosixPath(input.relativeCasePath);
  const isGroup = input.groupId !== undefined || input.subCaseId !== undefined;

  if (isGroup) {
    if (input.groupId === undefined || !isLowerKebab(input.groupId)) {
      violations.push({
        code: "invalid-group-id",
        message: "Fixture group id must be stable lower-kebab text.",
      });
    }
    if (input.subCaseId === undefined || !isLowerKebab(input.subCaseId)) {
      violations.push({
        code: "invalid-sub-case-id",
        message: "Fixture sub-case id must be stable lower-kebab text.",
      });
    }
    const expected = `test/fixtures/${input.groupId ?? ""}/${input.subCaseId ?? ""}`;
    if (normalizedCasePath !== expected) {
      violations.push({
        code: "invalid-layout-path",
        path: input.relativeCasePath,
        message: "Fixture group sub-case path must be test/fixtures/<group>/<sub-case>.",
      });
    }
  } else {
    const validCaseId = input.caseId !== undefined && isLowerKebab(input.caseId);
    if (!validCaseId) {
      violations.push({
        code: "invalid-case-id",
        message: "Fixture case id must be stable lower-kebab text.",
      });
    }
    const expected = `test/fixtures/${input.caseId ?? ""}`;
    if (!validCaseId || normalizedCasePath !== expected) {
      violations.push({
        code: "invalid-layout-path",
        path: input.relativeCasePath,
        message: "Fixture single case path must be test/fixtures/<case>.",
      });
    }
  }

  const entries = input.entries.map(normalizeLoosePosixPath);
  if (!hasEntry(entries, `${normalizedCasePath}/input`)) {
    violations.push({
      code: "missing-input-dir",
      path: `${normalizedCasePath}/input`,
      message: "Fixture case layout must include input/.",
    });
  }
  if (!hasEntry(entries, `${normalizedCasePath}/expected`)) {
    violations.push({
      code: "missing-expected-dir",
      path: `${normalizedCasePath}/expected`,
      message: "Fixture case layout must include expected/.",
    });
  }
  if (!entries.includes(`${normalizedCasePath}/README.md`)) {
    violations.push({
      code: "missing-readme",
      path: `${normalizedCasePath}/README.md`,
      message: "Fixture case layout must include README.md.",
    });
  }

  for (const entry of entries) {
    if (entry.startsWith(`${normalizedCasePath}/expected/`) && isUnstableExpectedTruthPath(entry)) {
      violations.push({
        code: "unstable-expected-truth",
        path: entry,
        message: "Expected truth must not include generated output, cache, temp, build, checkout-root or local absolute paths.",
      });
    }
  }

  return violations;
}

export function normalizeStableFixtureJson(value: unknown, options: StableJsonOptions = {}): unknown {
  const allowed = new Set(options.allowedNonStableFields ?? []);
  return normalizeStableJsonValue(value, {
    allowedNonStableFields: allowed,
    normalizePathSeparators: options.normalizePathSeparators ?? false,
    path: [],
  });
}

export function compareSemanticJson(input: SemanticJsonComparison): {
  pass: boolean;
  differences: string[];
} {
  const options = {
    allowedNonStableFields: input.allowedNonStableFields,
    normalizePathSeparators: true,
  };
  const actual = normalizeStableFixtureJson(input.actual, options);
  const expected = normalizeStableFixtureJson(input.expected, options);
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  return isDeepStrictEqual(actual, expected)
    ? { pass: true, differences: [] }
    : { pass: false, differences: [`expected ${expectedJson} but received ${actualJson}`] };
}

export function assertHumanOutputProfile(input: HumanOutputAssertionInput): FixtureContractViolation[] {
  const violations: FixtureContractViolation[] = [];
  const stripped = stripAnsi(input.output);
  if (stripped !== input.output) {
    violations.push({
      code: "ansi-output",
      message: "Human-readable fixture assertions must not depend on ANSI escape sequences.",
    });
  }
  if (isSpinnerOnlyOutput(stripped)) {
    violations.push({
      code: "spinner-only-progress",
      message: "Human-readable output must not use spinner or icon-only progress as the only semantic signal.",
    });
  }
  if (findUnsafeStableString(stripped, false) !== undefined) {
    violations.push({
      code: "path-leak",
      message: "Human-readable fixture output leaks a non-portable path, credential, cache/temp path or stack trace.",
    });
  }

  const requiredFields = new Set(input.requiredFields);
  if ((input.terminalWidth ?? 100) < 80) {
    for (const field of [
      "severity",
      "issueId",
      "affectedPath",
      "targetId",
      "entryPath",
      "next action",
      "planned effect",
      "conflict reason",
      "artifact path",
      "workflowType",
      "sourceSkill",
      "generatedAt",
    ]) {
      requiredFields.add(field);
    }
  }

  for (const field of requiredFields) {
    if (!includesField(stripped, field)) {
      violations.push({
        code: "missing-human-field",
        message: `Human-readable ${input.profile} output is missing required field ${field}.`,
      });
      break;
    }
  }

  return violations;
}

export function validateSnapshotUpdateDiscipline(
  input: SnapshotUpdateDisciplineInput,
): FixtureContractViolation[] {
  if (!input.expectedOutputUpdated) return [];
  const violations: FixtureContractViolation[] = [];
  if (!input.owningSpecUpdated) {
    violations.push({
      code: "snapshot-before-spec",
      message: "Expected outputs must not be updated before the owning SPEC changes.",
    });
  }
  if (!input.executableParserUpdated) {
    violations.push({
      code: "snapshot-before-parser",
      message: "Expected outputs must not be updated before executable schemas/parsers/comparators change.",
    });
  }
  if (input.ci) {
    violations.push({
      code: "ci-snapshot-update",
      message: "CI must fail on snapshot mismatch, missing or obsolete snapshots; it must not write updates.",
    });
  } else if (!input.explicitLocalUpdate) {
    violations.push({
      code: "snapshot-without-local-action",
      message: "Snapshot update must be an explicit local action after contract/parser updates.",
    });
  }
  return violations;
}

function normalizeStableJsonValue(
  value: unknown,
  context: {
    allowedNonStableFields: Set<string>;
    normalizePathSeparators: boolean;
    path: string[];
  },
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      normalizeStableJsonValue(entry, {
        ...context,
        path: [...context.path, String(index)],
      }),
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        if (context.allowedNonStableFields.has(key)) {
          assertAllowedNonStableValue(key, entry);
          return [key, "<iso8601>"];
        }
        if (isNonStableFieldName(key)) {
          throw new Error(`non-stable field ${[...context.path, key].join(".")} is not declared by schema`);
        }
        return [
          key,
          normalizeStableJsonValue(entry, {
            ...context,
            path: [...context.path, key],
          }),
        ];
      }),
    );
  }
  if (typeof value === "string") {
    const normalized = context.normalizePathSeparators ? maybeNormalizeProjectPath(value) : value;
    const unsafe = findUnsafeStableString(normalized, !context.normalizePathSeparators);
    if (unsafe !== undefined) {
      throw new Error(`stable fixture value leaks ${unsafe} at ${context.path.join(".") || "<root>"}`);
    }
    return normalized;
  }
  return value;
}

function assertAllowedNonStableValue(field: string, value: unknown): void {
  if (!SCHEMA_DECLARED_TIMESTAMP_FIELDS.has(field)) {
    throw new Error(`non-stable field ${field} must be a schema-declared timestamp before normalization`);
  }
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`non-stable field ${field} must be an ISO 8601 timestamp before normalization`);
  }
}

function isNonStableFieldName(key: string): boolean {
  return /(?:^|\.)(?:timestamp|createdAt|updatedAt|generatedAt|duration|durationMs|elapsed|elapsedMs|p95|profile|profiling|processId|pid|randomId|stackTrace|env|environment)$/i.test(
    key,
  );
}

function maybeNormalizeProjectPath(value: string): string {
  if (!looksLikePath(value)) return value;
  if (value === ".") return value;
  return normalizeProjectRelativePosixPath(value);
}

function looksLikePath(value: string): boolean {
  return value.includes("/") || value.includes("\\");
}

function findUnsafeStableString(value: string, rejectBackslash: boolean): string | undefined {
  if (/^[A-Za-z]:(?:\/|\\|$)/.test(value)) return "drive letter path";
  if (value.startsWith("/") || value.startsWith("~/") || value === "~") return "absolute or home path";
  if (rejectBackslash && value.includes("\\")) return "OS-specific separator";
  if (/(?:token|secret|password|credential|auth)=/i.test(value)) return "credential-bearing value";
  if (/\b(?:node_modules|\.cache|cache|\.tmp|tmp|temp|dist|build|fixture-output)\b/.test(value)) {
    return "cache, temporary, dependency, build or fixture output path";
  }
  if (/\bat\s+.+:\d+:\d+/.test(value) || value.includes("Error:") || value.includes("Stack trace")) {
    return "stack trace";
  }
  return undefined;
}

function isUnstableExpectedTruthPath(value: string): boolean {
  return findUnsafeStableString(value, true) !== undefined || value.includes("/generated/");
}

function normalizeLoosePosixPath(value: string): string {
  return value.trim().replaceAll("\\", "/").replace(/\/+$/g, "");
}

function hasEntry(entries: readonly string[], requiredPath: string): boolean {
  return entries.some((entry) => entry === requiredPath || entry.startsWith(`${requiredPath}/`));
}

function isLowerKebab(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isSourceIntegrityVariantGate(caseId: string): boolean {
  const match = /^source-integrity\/([^/]+)\/([^/]+)$/.exec(caseId);
  if (match === null) return false;
  const [, subCaseId, variantId] = match;
  return (
    REQUIRED_SOURCE_INTEGRITY_SUB_CASES.includes(subCaseId as (typeof REQUIRED_SOURCE_INTEGRITY_SUB_CASES)[number]) &&
    isLowerKebab(variantId)
  );
}

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function isSpinnerOnlyOutput(value: string): boolean {
  const compact = value.trim();
  return compact.length > 0 && compact.length <= 2 && !/[A-Za-z0-9]/.test(compact);
}

function includesField(output: string, field: string): boolean {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^A-Za-z0-9-])${escaped}(?:\\s*[=:]|\\b)`, "i").test(output);
}
