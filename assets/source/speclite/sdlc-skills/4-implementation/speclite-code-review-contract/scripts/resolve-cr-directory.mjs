#!/usr/bin/env node

import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";

const AMBIGUITY_ISSUE_ID = "cr-directory.ambiguous-resume-root";
const STORY_ID_PATTERN = /^[1-9][0-9]*[.-][1-9][0-9]*$/u;
const REVIEW_SERIES_PATTERN = /^[a-z0-9][a-z0-9-]{0,31}$/u;
const CURRENT_ARTIFACTS = [
  ["code-review-summary", "speclite.cr-review.v2", "code-review-summary"],
  ["code-review-evaluation", "speclite.cr-evaluation.v2", "code-review-evaluation"],
  ["cr-rules-extraction", "speclite.cr-rules-extraction.v2", "cr-rules-extraction"],
  ["cr-todo-result", "speclite.cr-todo-result.v2", "cr-todo-result"],
  ["cr-finalizer", "speclite.cr-finalizer.v2", "cr-finalizer"],
];
const RESERVED_CR_SUBPATHS = new Set([".tmp", "goal-execute-records"]);
const OWNERSHIP_MARKER_SUBPATH = ".tmp/cr-directory-ownership.json";
const OWNERSHIP_MARKER_FIELDS = [
  "schemaVersion",
  "artifactType",
  "storyId",
  "reviewSeries",
  "crDir",
];
const IDENTITY_FIELDS = new Set([
  "schemaVersion",
  "artifactType",
  "storyId",
  "reviewSeries",
  "round",
]);
const CONTEXT_FIELDS = [
  "storyId",
  "reviewSeries",
  "crDir",
  "canonicalCrDir",
  "compatibilityMode",
  "legacyArtifactPaths",
];

export function normalizeStoryId(value) {
  if (typeof value !== "string" || !STORY_ID_PATTERN.test(value)) {
    return { ok: false, reason: "invalid-story-id" };
  }
  return { ok: true, storyId: value.replace(".", "-") };
}

export async function resolveCrDirectory({
  projectRoot,
  implementationArtifacts,
  storyId,
  reviewSeries = "main",
  directoryChoice,
}) {
  const inputs = validateResolverInputs({
    projectRoot,
    implementationArtifacts,
    storyId,
    reviewSeries,
    directoryChoice,
  });
  if (!inputs.ok) return inputs;

  const project = await inspectProjectRoot(projectRoot);
  if (!project.ok) return { ok: false, reason: "invalid-project-root" };

  const { normalizedStoryId, canonicalCrDir, codeReviewRootRelative } = inputs;
  const rootState = await inspectPath(
    projectRoot,
    codeReviewRootRelative,
    project.resolved,
    { missingAllowed: true, finalKind: "directory" },
  );
  if (!rootState.ok) {
    return directoryFailure({
      storyId: normalizedStoryId,
      canonicalCrDir,
      legacyCrDirs: [],
      reviewSeries,
      roundEvidence: [],
      reason: rootState.reason,
    });
  }
  if (rootState.missing) {
    if (directoryChoice !== undefined && directoryChoice !== canonicalCrDir) {
      return { ok: false, reason: "invalid-directory-choice" };
    }
    return directorySuccess(
      normalizedStoryId,
      reviewSeries,
      canonicalCrDir,
      canonicalCrDir,
      "canonical",
      [],
    );
  }

  const codeReviewRoot = toAbsolute(projectRoot, codeReviewRootRelative);
  const entries = await safeReadDirectory(codeReviewRoot);
  if (!entries.ok) {
    return directoryFailure({
      storyId: normalizedStoryId,
      canonicalCrDir,
      legacyCrDirs: [],
      reviewSeries,
      roundEvidence: [],
      reason: "inspection-io-failure",
    });
  }

  const canonicalName = `${normalizedStoryId}-code-review`;
  const candidates = entries.entries
    .filter((entry) => entry.name === canonicalName || isLegacyDirectoryName(entry.name, normalizedStoryId))
    .sort((left, right) => compareBytes(left.name, right.name));
  const legacyCrDirs = candidates
    .filter((entry) => entry.name !== canonicalName)
    .map((entry) => `${codeReviewRootRelative}/${entry.name}`);
  const inspected = [];

  for (const entry of candidates) {
    const crDir = `${codeReviewRootRelative}/${entry.name}`;
    const result = await inspectDirectoryCandidate({
      projectRoot,
      resolvedProjectRoot: project.resolved,
      crDir,
      storyId: normalizedStoryId,
      reviewSeries,
    });
    inspected.push(result.evidence);
    if (!result.ok) {
      return directoryFailure({
        storyId: normalizedStoryId,
        canonicalCrDir,
        legacyCrDirs,
        reviewSeries,
        roundEvidence: inspected,
        reason: result.reason,
      });
    }
  }

  const currentCandidates = inspected
    .filter((evidence) => evidence.currentResult === "CURRENT")
    .map((evidence) => evidence.crDir);
  let selected;
  if (currentCandidates.length === 0) {
    selected = canonicalCrDir;
  } else if (currentCandidates.length === 1) {
    selected = currentCandidates[0];
  } else if (directoryChoice !== undefined && currentCandidates.includes(directoryChoice)) {
    selected = directoryChoice;
  } else {
    return directoryFailure({
      storyId: normalizedStoryId,
      canonicalCrDir,
      legacyCrDirs,
      reviewSeries,
      roundEvidence: inspected,
      reason: "multiple-current-directory-candidates",
    });
  }

  if (directoryChoice !== undefined && selected !== directoryChoice) {
    return { ok: false, reason: "invalid-directory-choice" };
  }
  const compatibilityMode = selected === canonicalCrDir ? "canonical" : "legacy-resume";
  return directorySuccess(
    normalizedStoryId,
    reviewSeries,
    canonicalCrDir,
    selected,
    compatibilityMode,
    legacyCrDirs,
  );
}

export async function validateCrDirectoryContext({
  projectRoot,
  implementationArtifacts,
  frozenContext,
  consumerContext,
  writeSubpath,
}) {
  if (typeof projectRoot !== "string" || !path.isAbsolute(projectRoot)) {
    return { ok: false, reason: "invalid-project-root" };
  }
  if (!isPortableProjectRelativePath(implementationArtifacts)) {
    return { ok: false, reason: "invalid-implementation-artifacts" };
  }
  if (!isPortableProjectRelativePath(writeSubpath) || writeSubpath === ".") {
    return { ok: false, reason: "invalid-write-subpath" };
  }

  const frozen = normalizeContext(frozenContext, implementationArtifacts);
  const consumer = normalizeContext(consumerContext, implementationArtifacts);
  if (!frozen.ok || !consumer.ok || !sameContext(frozen.value, consumer.value)) {
    return { ok: false, reason: "frozen-cr-context-mismatch" };
  }

  const project = await inspectProjectRoot(projectRoot);
  if (!project.ok) return { ok: false, reason: "invalid-project-root" };
  const selectedState = await inspectPath(
    projectRoot,
    frozen.value.crDir,
    project.resolved,
    {
      missingAllowed: frozen.value.compatibilityMode === "canonical",
      finalKind: "directory",
    },
  );
  if (!selectedState.ok) return { ok: false, reason: "unsafe-cr-directory" };

  const writePath = `${frozen.value.crDir}/${writeSubpath}`;
  const writeState = await inspectPath(
    projectRoot,
    writePath,
    project.resolved,
    { missingAllowed: true, finalKind: "file" },
  );
  if (!writeState.ok) return { ok: false, reason: "unsafe-write-path" };

  return {
    ok: true,
    storyId: frozen.value.storyId,
    reviewSeries: frozen.value.reviewSeries,
    crDir: frozen.value.crDir,
    writePath,
  };
}

function validateResolverInputs({
  projectRoot,
  implementationArtifacts,
  storyId,
  reviewSeries,
  directoryChoice,
}) {
  const normalized = normalizeStoryId(storyId);
  if (!normalized.ok) return normalized;
  if (typeof projectRoot !== "string" || !path.isAbsolute(projectRoot)) {
    return { ok: false, reason: "invalid-project-root" };
  }
  if (!isPortableProjectRelativePath(implementationArtifacts)) {
    return { ok: false, reason: "invalid-implementation-artifacts" };
  }
  if (typeof reviewSeries !== "string" || !REVIEW_SERIES_PATTERN.test(reviewSeries)) {
    return { ok: false, reason: "invalid-review-series" };
  }
  if (directoryChoice !== undefined && !isPortableProjectRelativePath(directoryChoice)) {
    return { ok: false, reason: "invalid-directory-choice" };
  }
  const codeReviewRootRelative = `${implementationArtifacts}/code-reviews`;
  const canonicalCrDir = `${codeReviewRootRelative}/${normalized.storyId}-code-review`;
  if (directoryChoice !== undefined
    && directoryChoice !== canonicalCrDir
    && !isLegacyCrDir(directoryChoice, codeReviewRootRelative, normalized.storyId)) {
    return { ok: false, reason: "invalid-directory-choice" };
  }
  return {
    ok: true,
    normalizedStoryId: normalized.storyId,
    canonicalCrDir,
    codeReviewRootRelative,
  };
}

async function inspectDirectoryCandidate({
  projectRoot,
  resolvedProjectRoot,
  crDir,
  storyId,
  reviewSeries,
}) {
  const directoryState = await inspectPath(
    projectRoot,
    crDir,
    resolvedProjectRoot,
    { missingAllowed: false, finalKind: "directory" },
  );
  if (!directoryState.ok) {
    return {
      ok: false,
      reason: directoryState.reason === "unsafe-path"
        ? "unsafe-cr-directory-entry"
        : directoryState.reason,
      evidence: { crDir, maxRound: null, currentResult: "UNSAFE" },
    };
  }

  const absolute = toAbsolute(projectRoot, crDir);
  const entries = await safeReadDirectory(absolute);
  if (!entries.ok) {
    return {
      ok: false,
      reason: "inspection-io-failure",
      evidence: { crDir, maxRound: null, currentResult: "UNSAFE" },
    };
  }

  let maxRound = null;
  let currentCount = 0;
  for (const entry of entries.entries.sort((left, right) => compareBytes(left.name, right.name))) {
    const entryAbsolute = path.join(absolute, entry.name);
    if (entry.isSymbolicLink()) {
      return {
        ok: false,
        reason: "unsafe-cr-artifact-entry",
        evidence: { crDir, maxRound, currentResult: "UNSAFE" },
      };
    }
    if (entry.isDirectory()) {
      const nestedState = await inspectExistingDirectory(entryAbsolute, resolvedProjectRoot);
      if (!nestedState.ok) {
        return {
          ok: false,
          reason: "unsafe-cr-artifact-entry",
          evidence: { crDir, maxRound, currentResult: "UNSAFE" },
        };
      }
      if (entry.name === ".tmp") {
        const marker = await inspectOwnershipMarker({
          markerPath: path.join(absolute, OWNERSHIP_MARKER_SUBPATH),
          resolvedProjectRoot,
          storyId,
          reviewSeries,
          crDir,
        });
        if (!marker.ok) {
          return {
            ok: false,
            reason: marker.reason,
            evidence: { crDir, maxRound, currentResult: marker.currentResult },
          };
        }
        if (marker.current) currentCount += 1;
      }
      if (RESERVED_CR_SUBPATHS.has(entry.name)) continue;
      continue;
    }
    if (!entry.isFile()) {
      return {
        ok: false,
        reason: "unsafe-cr-artifact-entry",
        evidence: { crDir, maxRound, currentResult: "UNSAFE" },
      };
    }

    const classification = classifyCurrentArtifact(entry.name, storyId, reviewSeries);
    if (classification.kind === "unrelated") continue;
    if (classification.kind === "identity-conflict") {
      return {
        ok: false,
        reason: "current-directory-identity-conflict",
        evidence: { crDir, maxRound, currentResult: "IDENTITY_CONFLICT" },
      };
    }

    let content;
    try {
      content = await readFile(entryAbsolute, "utf8");
    } catch {
      return {
        ok: false,
        reason: "inspection-io-failure",
        evidence: { crDir, maxRound, currentResult: "UNSAFE" },
      };
    }
    const identity = readLeadingIdentity(content);
    if (!identity
      || identity.storyId !== storyId
      || identity.reviewSeries !== reviewSeries
      || identity.round !== classification.round
      || identity.artifactType !== classification.artifactType
      || identity.schemaVersion !== classification.schemaVersion) {
      return {
        ok: false,
        reason: "current-directory-identity-conflict",
        evidence: { crDir, maxRound, currentResult: "IDENTITY_CONFLICT" },
      };
    }
    currentCount += 1;
    maxRound = Math.max(maxRound ?? 0, classification.round);
  }

  return {
    ok: true,
    evidence: {
      crDir,
      maxRound,
      currentResult: currentCount > 0 ? "CURRENT" : "NO_CURRENT_SERIES_EVIDENCE",
    },
  };
}

function classifyCurrentArtifact(name, storyId, reviewSeries) {
  const escapedStoryId = escapeRegExp(storyId);
  const escapedSeries = escapeRegExp(reviewSeries);
  for (const [basename, schemaVersion, artifactType] of CURRENT_ARTIFACTS) {
    const exact = name.match(new RegExp(
      `^${escapedStoryId}-${escapeRegExp(basename)}-[0-9]{8}-${escapedSeries}-round-([1-9][0-9]*)\\.md$`,
      "u",
    ));
    if (exact) {
      const round = Number(exact[1]);
      if (Number.isSafeInteger(round)) {
        return { kind: "current", round, schemaVersion, artifactType };
      }
      return { kind: "identity-conflict" };
    }
    const completeOtherSeries = name.match(new RegExp(
      `^${escapedStoryId}-${escapeRegExp(basename)}-[0-9]{8}-([a-z0-9][a-z0-9-]{0,31})-round-[1-9][0-9]*(?:-superseded-[1-9][0-9]*)?\\.md$`,
      "u",
    ));
    if (completeOtherSeries) return { kind: "unrelated" };
    const selectedSeriesPrefix = new RegExp(
      `^${escapedStoryId}-${escapeRegExp(basename)}-[0-9]{8}-${escapedSeries}`,
      "u",
    );
    if (selectedSeriesPrefix.test(name)) {
      return { kind: "identity-conflict" };
    }
  }
  return { kind: "unrelated" };
}

function readLeadingIdentity(content) {
  if (typeof content !== "string" || !content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---", 4);
  if (end < 0) return null;
  const block = content.slice(4, end);
  const values = new Map();
  for (const line of block.split("\n")) {
    const match = line.match(/^(?:"([A-Za-z][A-Za-z0-9]*)"|'([A-Za-z][A-Za-z0-9]*)'|([A-Za-z][A-Za-z0-9]*))[ \t]*:[ \t]*(.*)$/u);
    if (!match) continue;
    const key = match[1] ?? match[2] ?? match[3];
    if (!IDENTITY_FIELDS.has(key)) continue;
    if (values.has(key)) return null;
    values.set(key, unquote(match[4].trim()));
  }
  const roundText = values.get("round");
  const round = typeof roundText === "string" && /^[1-9][0-9]*$/u.test(roundText)
    ? Number(roundText)
    : null;
  if (!Number.isSafeInteger(round)) return null;
  return {
    storyId: values.get("storyId"),
    reviewSeries: values.get("reviewSeries"),
    round,
    artifactType: values.get("artifactType"),
    schemaVersion: values.get("schemaVersion"),
  };
}

async function inspectOwnershipMarker({
  markerPath,
  resolvedProjectRoot,
  storyId,
  reviewSeries,
  crDir,
}) {
  let metadata;
  try {
    metadata = await lstat(markerPath);
  } catch (error) {
    if (error?.code === "ENOENT") return { ok: true, current: false };
    return { ok: false, reason: "inspection-io-failure", currentResult: "UNSAFE" };
  }
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    return { ok: false, reason: "unsafe-cr-artifact-entry", currentResult: "UNSAFE" };
  }
  let resolvedMarker;
  let content;
  try {
    resolvedMarker = await realpath(markerPath);
    content = await readFile(markerPath, "utf8");
  } catch {
    return { ok: false, reason: "inspection-io-failure", currentResult: "UNSAFE" };
  }
  if (!isWithin(resolvedProjectRoot, resolvedMarker)) {
    return { ok: false, reason: "unsafe-cr-artifact-entry", currentResult: "UNSAFE" };
  }
  const marker = parseOwnershipMarker(content);
  if (!marker
    || marker.schemaVersion !== "speclite.cr-directory-ownership.v1"
    || marker.artifactType !== "cr-directory-ownership"
    || marker.storyId !== storyId
    || marker.reviewSeries !== reviewSeries
    || marker.crDir !== crDir) {
    return {
      ok: false,
      reason: "current-directory-identity-conflict",
      currentResult: "IDENTITY_CONFLICT",
    };
  }
  return { ok: true, current: true };
}

function parseOwnershipMarker(content) {
  let value;
  try {
    value = JSON.parse(content);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== OWNERSHIP_MARKER_FIELDS.length
    || keys.some((key) => !OWNERSHIP_MARKER_FIELDS.includes(key))
    || OWNERSHIP_MARKER_FIELDS.some((key) => typeof value[key] !== "string")) {
    return null;
  }
  for (const key of OWNERSHIP_MARKER_FIELDS) {
    const occurrences = content.match(new RegExp(`"${key}"[ \\t\\r\\n]*:`, "gu")) ?? [];
    if (occurrences.length !== 1) return null;
  }
  return value;
}

function unquote(value) {
  if (value.length >= 2
    && ((value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeContext(context, implementationArtifacts) {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return { ok: false };
  }
  if (Object.keys(context).some((key) => !CONTEXT_FIELDS.includes(key))
    || CONTEXT_FIELDS.some((key) => !Object.hasOwn(context, key))) {
    return { ok: false };
  }
  const normalized = normalizeStoryId(context.storyId);
  if (!normalized.ok || normalized.storyId !== context.storyId) return { ok: false };
  if (typeof context.reviewSeries !== "string" || !REVIEW_SERIES_PATTERN.test(context.reviewSeries)) {
    return { ok: false };
  }
  const canonicalCrDir = `${implementationArtifacts}/code-reviews/${context.storyId}-code-review`;
  if (context.canonicalCrDir !== canonicalCrDir
    || !isPortableProjectRelativePath(context.crDir)
    || !["canonical", "legacy-resume"].includes(context.compatibilityMode)
    || !Array.isArray(context.legacyArtifactPaths)) {
    return { ok: false };
  }
  const legacyArtifactPaths = [...context.legacyArtifactPaths];
  if (legacyArtifactPaths.some((entry) => !isLegacyCrDir(
    entry,
    `${implementationArtifacts}/code-reviews`,
    context.storyId,
  ))) {
    return { ok: false };
  }
  const sorted = [...new Set(legacyArtifactPaths)].sort(compareBytes);
  if (sorted.length !== legacyArtifactPaths.length
    || sorted.some((entry, index) => entry !== legacyArtifactPaths[index])) {
    return { ok: false };
  }
  if (context.compatibilityMode === "canonical" && context.crDir !== canonicalCrDir) {
    return { ok: false };
  }
  if (context.compatibilityMode === "legacy-resume"
    && !legacyArtifactPaths.includes(context.crDir)) {
    return { ok: false };
  }
  return {
    ok: true,
    value: {
      storyId: context.storyId,
      reviewSeries: context.reviewSeries,
      crDir: context.crDir,
      canonicalCrDir,
      compatibilityMode: context.compatibilityMode,
      legacyArtifactPaths,
    },
  };
}

function sameContext(left, right) {
  return CONTEXT_FIELDS.every((field) => JSON.stringify(left[field]) === JSON.stringify(right[field]));
}

function directorySuccess(storyId, reviewSeries, canonicalCrDir, crDir, compatibilityMode, legacyArtifactPaths) {
  return {
    ok: true,
    storyId,
    reviewSeries,
    crDir,
    canonicalCrDir,
    compatibilityMode,
    legacyArtifactPaths,
    issue: null,
  };
}

function directoryFailure({
  storyId,
  canonicalCrDir,
  legacyCrDirs,
  reviewSeries,
  roundEvidence,
  reason,
}) {
  return {
    ok: false,
    storyId,
    reviewSeries,
    crDir: null,
    canonicalCrDir,
    compatibilityMode: null,
    legacyArtifactPaths: legacyCrDirs,
    issue: {
      issueId: AMBIGUITY_ISSUE_ID,
      category: "lifecycle",
      severity: "error",
      continuation: "block",
      details: {
        storyId,
        canonicalCrDir,
        legacyCrDirs,
        reviewSeries,
        roundEvidence,
        reason,
      },
    },
  };
}

async function inspectProjectRoot(projectRoot) {
  try {
    const metadata = await lstat(projectRoot);
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) return { ok: false };
    return { ok: true, resolved: await realpath(projectRoot) };
  } catch {
    return { ok: false };
  }
}

async function inspectPath(projectRoot, relativePath, resolvedProjectRoot, {
  missingAllowed,
  finalKind,
}) {
  let current = projectRoot;
  const segments = relativePath.split("/");
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    let metadata;
    try {
      metadata = await lstat(current);
    } catch (error) {
      if (error?.code === "ENOENT" && missingAllowed) return { ok: true, missing: true };
      return { ok: false, reason: error?.code === "ENOENT" ? "missing-path" : "inspection-io-failure" };
    }
    if (metadata.isSymbolicLink()) return { ok: false, reason: "unsafe-path" };
    const isFinal = index === segments.length - 1;
    if ((!isFinal || finalKind === "directory") && !metadata.isDirectory()) {
      return { ok: false, reason: "unsafe-path" };
    }
    if (isFinal && finalKind === "file" && !metadata.isFile()) {
      return { ok: false, reason: "unsafe-path" };
    }
    let resolved;
    try {
      resolved = await realpath(current);
    } catch {
      return { ok: false, reason: "inspection-io-failure" };
    }
    if (!isWithin(resolvedProjectRoot, resolved)) return { ok: false, reason: "unsafe-path" };
  }
  return { ok: true, missing: false };
}

async function inspectExistingDirectory(absolute, resolvedProjectRoot) {
  try {
    const metadata = await lstat(absolute);
    const resolved = await realpath(absolute);
    return {
      ok: metadata.isDirectory()
        && !metadata.isSymbolicLink()
        && isWithin(resolvedProjectRoot, resolved),
    };
  } catch {
    return { ok: false };
  }
}

async function safeReadDirectory(directory) {
  try {
    return { ok: true, entries: await readdir(directory, { withFileTypes: true }) };
  } catch {
    return { ok: false };
  }
}

function isLegacyDirectoryName(name, storyId) {
  return name.startsWith(`${storyId}-`)
    && name.endsWith("-code-review")
    && name !== `${storyId}-code-review`;
}

function isLegacyCrDir(value, codeReviewRoot, storyId) {
  if (!isPortableProjectRelativePath(value)) return false;
  const prefix = `${codeReviewRoot}/`;
  return value.startsWith(prefix)
    && !value.slice(prefix.length).includes("/")
    && isLegacyDirectoryName(value.slice(prefix.length), storyId);
}

function isPortableProjectRelativePath(value) {
  if (typeof value !== "string"
    || value.length === 0
    || path.posix.isAbsolute(value)
    || value.includes("\\")) {
    return false;
  }
  return value.split("/").every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

function toAbsolute(projectRoot, relativePath) {
  return path.join(projectRoot, ...relativePath.split("/"));
}

function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function compareBytes(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

async function runCli() {
  const parsed = parseArguments(process.argv.slice(2));
  if (!parsed.ok) {
    writeCli({ ok: false, reason: "invalid-arguments" });
    return;
  }
  let outcome;
  try {
    outcome = parsed.mode === "resolve"
      ? await resolveCrDirectory(parsed.options)
      : await validateCrDirectoryContext(parsed.options);
  } catch {
    outcome = { ok: false, reason: parsed.mode === "resolve" ? "inspection-io-failure" : "context-validation-failure" };
  }
  writeCli(outcome);
}

function writeCli(outcome) {
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  process.exitCode = outcome.ok ? 0 : 2;
}

function parseArguments(args) {
  if (args.length % 2 !== 0) return { ok: false };
  const values = Object.create(null);
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    const name = key?.startsWith("--") ? key.slice(2) : "";
    if (!name || value === undefined || value.length === 0 || Object.hasOwn(values, name)) {
      return { ok: false };
    }
    values[name] = value;
  }

  const mode = values.mode ?? "resolve";
  if (mode === "resolve") {
    const known = new Set([
      "mode",
      "project-root",
      "implementation-artifacts",
      "story-id",
      "review-series",
      "directory-choice",
    ]);
    if (Object.keys(values).some((key) => !known.has(key))
      || !["project-root", "implementation-artifacts", "story-id"].every((key) => Object.hasOwn(values, key))) {
      return { ok: false };
    }
    return {
      ok: true,
      mode,
      options: {
        projectRoot: values["project-root"],
        implementationArtifacts: values["implementation-artifacts"],
        storyId: values["story-id"],
        reviewSeries: values["review-series"] ?? "main",
        directoryChoice: values["directory-choice"],
      },
    };
  }

  if (mode !== "validate-context") return { ok: false };
  const known = new Set([
    "mode",
    "project-root",
    "implementation-artifacts",
    "frozen-context",
    "story-id",
    "review-series",
    "cr-dir",
    "canonical-cr-dir",
    "compatibility-mode",
    "legacy-artifact-paths",
    "write-subpath",
  ]);
  if (Object.keys(values).some((key) => !known.has(key))
    || ![
      "project-root",
      "implementation-artifacts",
      "frozen-context",
      "story-id",
      "review-series",
      "cr-dir",
      "canonical-cr-dir",
      "compatibility-mode",
      "legacy-artifact-paths",
      "write-subpath",
    ].every((key) => Object.hasOwn(values, key))) {
    return { ok: false };
  }

  let frozenContext;
  let legacyArtifactPaths;
  try {
    frozenContext = JSON.parse(values["frozen-context"]);
    legacyArtifactPaths = JSON.parse(values["legacy-artifact-paths"]);
  } catch {
    return { ok: false };
  }
  return {
    ok: true,
    mode,
    options: {
      projectRoot: values["project-root"],
      implementationArtifacts: values["implementation-artifacts"],
      frozenContext,
      consumerContext: {
        storyId: values["story-id"],
        reviewSeries: values["review-series"],
        crDir: values["cr-dir"],
        canonicalCrDir: values["canonical-cr-dir"],
        compatibilityMode: values["compatibility-mode"],
        legacyArtifactPaths,
      },
      writeSubpath: values["write-subpath"],
    },
  };
}

if (process.argv[1] && path.basename(process.argv[1]) === "resolve-cr-directory.mjs") {
  await runCli();
}
