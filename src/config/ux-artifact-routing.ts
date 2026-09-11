import { constants as fsConstants } from "node:fs";
import { access, lstat, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import type {
  ArtifactRootResolution,
  ArtifactRootResolutionResult,
} from "./artifact-root-resolver.js";
import {
  normalizeProjectRelativePosixPath,
  resolveProjectRelativePath,
  toProjectRelativePosixPath,
} from "../fs/path-normalizer.js";

const UX_MAIN_BASENAME = "ux-design-specification.md";
const UX_COLOR_BASENAME = "ux-color-themes.html";
const UX_DIRECTIONS_BASENAME = "ux-design-directions.html";

export type UxArtifactRouteReason =
  | "artifact-root-resolution-blocked"
  | "planning-root-missing-or-ambiguous"
  | "candidate-path-invalid"
  | "candidate-unreadable"
  | "candidate-not-regular-file"
  | "candidate-symlink-escape"
  | "workflow-frontmatter-invalid";

export type UxArtifactRouteResult = {
  ok: boolean;
  continuation: "fresh" | "continue" | "block";
  resolvedRoot: string | null;
  resolutionMode: ArtifactRootResolution["resolutionMode"] | null;
  actualConsumedPath: string | null;
  actualColorThemesPath: string | null;
  actualDesignDirectionsPath: string | null;
  appendTarget: string | null;
  issues: ArtifactRootResolutionResult["issues"];
  diagnostic?: {
    reason: UxArtifactRouteReason;
    affectedPath: string;
  };
};

/**
 * Internal executable contract for Create UX routing. It is intentionally not a
 * CLI or public schema: workflow prompts and tests consume the same deterministic
 * routing rules without introducing a second artifact-root resolver.
 */
export async function resolveUxArtifactRoute(input: {
  projectRoot: string;
  rootResolution: ArtifactRootResolutionResult;
}): Promise<UxArtifactRouteResult> {
  if (!input.rootResolution.ok) {
    return blocked("artifact-root-resolution-blocked", ".", input.rootResolution.issues);
  }

  const planningRoots = input.rootResolution.roots.filter(
    (root) => root.field === "planning_artifacts",
  );
  if (planningRoots.length !== 1) {
    return blocked("planning-root-missing-or-ambiguous", ".", input.rootResolution.issues);
  }

  const root = planningRoots[0]!;
  const canonicalMain = `${root.resolvedRoot}/ux/${UX_MAIN_BASENAME}`;
  const legacyMain = `${root.resolvedRoot}/${UX_MAIN_BASENAME}`;
  const canonicalState = await inspectCandidate(input.projectRoot, canonicalMain, {
    planningRoot: root.resolvedRoot,
    owner: "canonical-ux",
    intent: "read-or-write-missing",
  });
  if (canonicalState.kind === "invalid") {
    return blockedCandidate(root, canonicalState, input.rootResolution.issues);
  }

  if (canonicalState.kind === "file") {
    const frontmatter = await inspectStepsCompleted(canonicalState.absolutePath);
    if (!frontmatter.ok) {
      return blockedWithRoot(root, "workflow-frontmatter-invalid", canonicalMain, input.rootResolution.issues);
    }
    const canonicalSupporting = await selectCanonicalSupportingPaths({
      projectRoot: input.projectRoot,
      root,
    });
    if (!canonicalSupporting.ok) {
      return blockedCandidate(root, canonicalSupporting.state, input.rootResolution.issues);
    }
    return continued({
      root,
      main: canonicalMain,
      color: canonicalSupporting.color,
      directions: canonicalSupporting.directions,
      issues: input.rootResolution.issues,
    });
  }

  const legacyState = await inspectCandidate(input.projectRoot, legacyMain, {
    planningRoot: root.resolvedRoot,
    owner: "legacy-planning",
    intent: "read-existing",
  });
  if (legacyState.kind === "invalid") {
    return blockedCandidate(root, legacyState, input.rootResolution.issues);
  }
  if (legacyState.kind === "file") {
    const frontmatter = await inspectStepsCompleted(legacyState.absolutePath);
    if (!frontmatter.ok) {
      return blockedWithRoot(root, "workflow-frontmatter-invalid", legacyMain, input.rootResolution.issues);
    }
    const color = await selectLegacySupportingPath({
      projectRoot: input.projectRoot,
      root,
      basename: UX_COLOR_BASENAME,
    });
    if (!color.ok) return blockedCandidate(root, color.state, input.rootResolution.issues);
    const directions = await selectLegacySupportingPath({
      projectRoot: input.projectRoot,
      root,
      basename: UX_DIRECTIONS_BASENAME,
    });
    if (!directions.ok) return blockedCandidate(root, directions.state, input.rootResolution.issues);
    return continued({
      root,
      main: legacyMain,
      color: color.path,
      directions: directions.path,
      issues: input.rootResolution.issues,
    });
  }

  const canonicalSupporting = await selectCanonicalSupportingPaths({
    projectRoot: input.projectRoot,
    root,
  });
  if (!canonicalSupporting.ok) {
    return blockedCandidate(root, canonicalSupporting.state, input.rootResolution.issues);
  }
  return {
    ok: true,
    continuation: "fresh",
    resolvedRoot: root.resolvedRoot,
    resolutionMode: root.resolutionMode,
    actualConsumedPath: null,
    actualColorThemesPath: canonicalSupporting.color,
    actualDesignDirectionsPath: canonicalSupporting.directions,
    appendTarget: null,
    issues: input.rootResolution.issues,
  };
}

/** Re-probes the exact fresh canonical file before making it the append target. */
export async function bindCreatedUxMain(input: {
  projectRoot: string;
  route: UxArtifactRouteResult;
}): Promise<UxArtifactRouteResult> {
  if (!input.route.ok || input.route.continuation !== "fresh" || input.route.resolvedRoot === null) {
    return input.route;
  }
  const canonicalMain = `${input.route.resolvedRoot}/ux/${UX_MAIN_BASENAME}`;
  const candidate = await inspectCandidate(input.projectRoot, canonicalMain, {
    planningRoot: input.route.resolvedRoot,
    owner: "canonical-ux",
    intent: "read-existing",
  });
  if (candidate.kind !== "file") {
    if (candidate.kind === "invalid") {
      return blockedWithResolvedRoute(input.route, candidate.reason, candidate.relativePath);
    }
    return blockedWithResolvedRoute(input.route, "candidate-unreadable", canonicalMain);
  }
  const frontmatter = await inspectStepsCompleted(candidate.absolutePath);
  if (!frontmatter.ok) {
    return blockedWithResolvedRoute(input.route, "workflow-frontmatter-invalid", canonicalMain);
  }
  return {
    ...input.route,
    continuation: "continue",
    actualConsumedPath: canonicalMain,
    appendTarget: canonicalMain,
  };
}

type CandidateState =
  | { kind: "missing"; relativePath: string }
  | { kind: "file"; relativePath: string; absolutePath: string }
  | {
      kind: "invalid";
      relativePath: string;
      reason: Exclude<
        UxArtifactRouteReason,
        "artifact-root-resolution-blocked" | "planning-root-missing-or-ambiguous" | "workflow-frontmatter-invalid"
      >;
    };

type CandidateOwner = "canonical-ux" | "legacy-planning" | "project-reference";
type CandidateIntent = "read-existing" | "read-or-write-missing";

type CandidatePolicy = {
  planningRoot: string;
  owner: CandidateOwner;
  intent: CandidateIntent;
};

async function inspectCandidate(
  projectRoot: string,
  candidatePath: string,
  policy: CandidatePolicy,
): Promise<CandidateState> {
  let normalized: { relativePath: string; absolutePath: string };
  try {
    normalized = resolveProjectRelativePath({ projectRoot, relativePath: candidatePath });
  } catch {
    return { kind: "invalid", relativePath: safeAffectedPath(candidatePath), reason: "candidate-path-invalid" };
  }

  const owner = await resolvePhysicalOwner(projectRoot, policy);
  if (!owner.ok) {
    return { kind: "invalid", relativePath: normalized.relativePath, reason: owner.reason };
  }
  if (!isSameOrDescendant(normalized.absolutePath, owner.lexicalRoot)) {
    return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-path-invalid" };
  }

  let entry;
  try {
    entry = await lstat(normalized.absolutePath);
  } catch (error) {
    if (isEnotdir(error)) {
      return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-not-regular-file" };
    }
    if (isMissing(error)) {
      if (policy.intent === "read-existing") {
        return { kind: "missing", relativePath: normalized.relativePath };
      }
      const ancestor = await inspectNearestExistingAncestor(normalized.absolutePath, owner.physicalRoot);
      if (!ancestor.ok) {
        return { kind: "invalid", relativePath: normalized.relativePath, reason: ancestor.reason };
      }
      return { kind: "missing", relativePath: normalized.relativePath };
    }
    return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-unreadable" };
  }
  if (!entry.isFile() && !entry.isSymbolicLink()) {
    return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-not-regular-file" };
  }

  let realTarget: string;
  try {
    await access(normalized.absolutePath, fsConstants.R_OK);
    realTarget = await realpath(normalized.absolutePath);
  } catch (error) {
    return {
      kind: "invalid",
      relativePath: normalized.relativePath,
      reason: isMissing(error) && entry.isSymbolicLink()
        ? "candidate-not-regular-file"
        : "candidate-unreadable",
    };
  }

  if (!isSameOrDescendant(realTarget, owner.physicalRoot)) {
    return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-symlink-escape" };
  }
  try {
    const targetStat = await stat(realTarget);
    if (!targetStat.isFile()) {
      return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-not-regular-file" };
    }
  } catch {
    return { kind: "invalid", relativePath: normalized.relativePath, reason: "candidate-unreadable" };
  }
  return { kind: "file", relativePath: normalized.relativePath, absolutePath: normalized.absolutePath };
}

async function resolvePhysicalOwner(
  projectRoot: string,
  policy: CandidatePolicy,
): Promise<
  | { ok: true; lexicalRoot: string; physicalRoot: string }
  | { ok: false; reason: "candidate-unreadable" | "candidate-not-regular-file" | "candidate-symlink-escape" }
> {
  let realProject: string;
  try {
    realProject = await realpath(projectRoot);
  } catch {
    return { ok: false, reason: "candidate-unreadable" };
  }
  if (policy.owner === "project-reference") {
    return { ok: true, lexicalRoot: path.resolve(projectRoot), physicalRoot: realProject };
  }

  let planning;
  try {
    planning = resolveProjectRelativePath({ projectRoot, relativePath: policy.planningRoot });
  } catch {
    return { ok: false, reason: "candidate-symlink-escape" };
  }
  let planningEntry;
  let realPlanning: string;
  try {
    planningEntry = await stat(planning.absolutePath);
    realPlanning = await realpath(planning.absolutePath);
  } catch {
    return { ok: false, reason: "candidate-unreadable" };
  }
  if (!planningEntry.isDirectory()) return { ok: false, reason: "candidate-not-regular-file" };
  if (!isSameOrDescendant(realPlanning, realProject)) {
    return { ok: false, reason: "candidate-symlink-escape" };
  }
  if (policy.owner === "legacy-planning") {
    return { ok: true, lexicalRoot: planning.absolutePath, physicalRoot: realPlanning };
  }

  const lexicalUxRoot = path.join(planning.absolutePath, "ux");
  const expectedPhysicalUxRoot = path.join(realPlanning, "ux");
  let uxEntry;
  let realUxRoot: string;
  try {
    uxEntry = await stat(lexicalUxRoot);
    realUxRoot = await realpath(lexicalUxRoot);
  } catch {
    return { ok: false, reason: "candidate-unreadable" };
  }
  if (!uxEntry.isDirectory()) return { ok: false, reason: "candidate-not-regular-file" };
  if (path.resolve(realUxRoot) !== path.resolve(expectedPhysicalUxRoot)) {
    return { ok: false, reason: "candidate-symlink-escape" };
  }
  return { ok: true, lexicalRoot: lexicalUxRoot, physicalRoot: realUxRoot };
}

async function inspectNearestExistingAncestor(
  candidateAbsolutePath: string,
  physicalOwnerRoot: string,
): Promise<
  | { ok: true }
  | { ok: false; reason: "candidate-unreadable" | "candidate-not-regular-file" | "candidate-symlink-escape" }
> {
  let current = path.dirname(candidateAbsolutePath);
  while (true) {
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (isEnotdir(error)) return { ok: false, reason: "candidate-not-regular-file" };
      if (!isMissing(error)) return { ok: false, reason: "candidate-unreadable" };
      const parent = path.dirname(current);
      if (parent === current) return { ok: false, reason: "candidate-unreadable" };
      current = parent;
      continue;
    }
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      return { ok: false, reason: "candidate-not-regular-file" };
    }
    try {
      const realAncestor = await realpath(current);
      const dereferenced = await stat(realAncestor);
      if (!dereferenced.isDirectory()) return { ok: false, reason: "candidate-not-regular-file" };
      if (!isSameOrDescendant(realAncestor, physicalOwnerRoot)) {
        return { ok: false, reason: "candidate-symlink-escape" };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: isMissing(error) ? "candidate-not-regular-file" : "candidate-unreadable" };
    }
  }
}

async function inspectStepsCompleted(absolutePath: string): Promise<{ ok: boolean }> {
  let text: string;
  try {
    text = await readFile(absolutePath, "utf8");
  } catch {
    return { ok: false };
  }
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1];
  if (frontmatter === undefined) return { ok: false };
  const value = /^stepsCompleted:\s*\[([^\]]*)\]\s*$/m.exec(frontmatter)?.[1];
  if (value === undefined) return { ok: false };
  const entries = value.split(",").map((entry) => entry.trim()).filter(Boolean);
  return { ok: entries.length > 0 && entries.every((entry) => /^\d+$/.test(entry)) };
}

async function selectLegacySupportingPath(input: {
  projectRoot: string;
  root: ArtifactRootResolution;
  basename: string;
}): Promise<{ ok: true; path: string } | { ok: false; state: Extract<CandidateState, { kind: "invalid" }> }> {
  const legacyPath = `${input.root.resolvedRoot}/${input.basename}`;
  const state = await inspectCandidate(input.projectRoot, legacyPath, {
    planningRoot: input.root.resolvedRoot,
    owner: "legacy-planning",
    intent: "read-existing",
  });
  if (state.kind === "invalid") return { ok: false, state };
  if (state.kind === "missing") {
    const canonicalPath = `${input.root.resolvedRoot}/ux/${input.basename}`;
    const canonicalState = await inspectCandidate(input.projectRoot, canonicalPath, {
      planningRoot: input.root.resolvedRoot,
      owner: "canonical-ux",
      intent: "read-or-write-missing",
    });
    if (canonicalState.kind === "invalid") return { ok: false, state: canonicalState };
    return { ok: true, path: canonicalPath };
  }
  return {
    ok: true,
    path: legacyPath,
  };
}

async function selectCanonicalSupportingPaths(input: {
  projectRoot: string;
  root: ArtifactRootResolution;
}): Promise<
  | { ok: true; color: string; directions: string }
  | { ok: false; state: Extract<CandidateState, { kind: "invalid" }> }
> {
  const color = `${input.root.resolvedRoot}/ux/${UX_COLOR_BASENAME}`;
  const directions = `${input.root.resolvedRoot}/ux/${UX_DIRECTIONS_BASENAME}`;
  for (const candidate of [color, directions]) {
    const state = await inspectCandidate(input.projectRoot, candidate, {
      planningRoot: input.root.resolvedRoot,
      owner: "canonical-ux",
      intent: "read-or-write-missing",
    });
    if (state.kind === "invalid") return { ok: false, state };
  }
  return { ok: true, color, directions };
}

function continued(input: {
  root: ArtifactRootResolution;
  main: string;
  color: string;
  directions: string;
  issues: ArtifactRootResolutionResult["issues"];
}): UxArtifactRouteResult {
  return {
    ok: true,
    continuation: "continue",
    resolvedRoot: input.root.resolvedRoot,
    resolutionMode: input.root.resolutionMode,
    actualConsumedPath: input.main,
    actualColorThemesPath: input.color,
    actualDesignDirectionsPath: input.directions,
    appendTarget: input.main,
    issues: input.issues,
  };
}

function blockedCandidate(
  root: ArtifactRootResolution,
  state: Extract<CandidateState, { kind: "invalid" }>,
  issues: ArtifactRootResolutionResult["issues"],
): UxArtifactRouteResult {
  return blockedWithRoot(root, state.reason, state.relativePath, issues);
}

function blockedWithRoot(
  root: ArtifactRootResolution,
  reason: UxArtifactRouteReason,
  affectedPath: string,
  issues: ArtifactRootResolutionResult["issues"],
): UxArtifactRouteResult {
  return {
    ...blocked(reason, affectedPath, issues),
    resolvedRoot: root.resolvedRoot,
    resolutionMode: root.resolutionMode,
  };
}

function blockedWithResolvedRoute(
  route: UxArtifactRouteResult,
  reason: UxArtifactRouteReason,
  affectedPath: string,
): UxArtifactRouteResult {
  return {
    ...blocked(reason, affectedPath, route.issues),
    resolvedRoot: route.resolvedRoot,
    resolutionMode: route.resolutionMode,
  };
}

function blocked(
  reason: UxArtifactRouteReason,
  affectedPath: string,
  issues: ArtifactRootResolutionResult["issues"],
): UxArtifactRouteResult {
  return {
    ok: false,
    continuation: "block",
    resolvedRoot: null,
    resolutionMode: null,
    actualConsumedPath: null,
    actualColorThemesPath: null,
    actualDesignDirectionsPath: null,
    appendTarget: null,
    issues,
    diagnostic: { reason, affectedPath: safeAffectedPath(affectedPath) },
  };
}

export type UxLocalReferenceResult =
  | { ok: true; localPaths: string[]; ignoredExternalReferences: string[] }
  | {
      ok: false;
      localPaths: [];
      ignoredExternalReferences: string[];
      reason:
        | "malformed-reference"
        | "undefined-reference"
        | "unsupported-local-reference"
        | "local-reference-outside-project"
        | "local-reference-unreadable"
        | "local-reference-not-regular-file"
        | "local-reference-symlink-escape";
      reference: string;
    };

/** Validates the bounded Markdown/HTML local-reference subset used by UX artifacts. */
export async function validateUxLocalReferences(input: {
  projectRoot: string;
  artifactPath: string;
  content: string;
}): Promise<UxLocalReferenceResult> {
  let artifact;
  try {
    artifact = resolveProjectRelativePath({ projectRoot: input.projectRoot, relativePath: input.artifactPath });
  } catch {
    return referenceFailure("local-reference-outside-project", input.artifactPath, []);
  }
  const parsed = parseBoundedReferences(input.content);
  if (!parsed.ok) return referenceFailure(parsed.reason, parsed.reference, parsed.ignoredExternalReferences);

  const localPaths: string[] = [];
  for (const reference of parsed.references) {
    const { raw, source } = reference;
    const classified = classifyReference(raw, source);
    if (classified.kind === "external") continue;
    if (classified.kind === "ignore") continue;
    if (classified.kind === "invalid") {
      return referenceFailure("unsupported-local-reference", raw, parsed.ignoredExternalReferences);
    }
    const targetAbsolute = path.resolve(path.dirname(artifact.absolutePath), classified.path);
    let targetRelative: string;
    try {
      targetRelative = normalizeProjectRelativePosixPath(
        toProjectRelativePosixPath({ projectRoot: input.projectRoot, targetPath: targetAbsolute }),
      );
    } catch {
      return referenceFailure("local-reference-outside-project", raw, parsed.ignoredExternalReferences);
    }
    const state = await inspectCandidate(input.projectRoot, targetRelative, {
      planningRoot: ".",
      owner: "project-reference",
      intent: "read-existing",
    });
    if (state.kind === "missing") {
      return referenceFailure("local-reference-unreadable", raw, parsed.ignoredExternalReferences);
    }
    if (state.kind === "invalid") {
      const reason = state.reason === "candidate-symlink-escape"
        ? "local-reference-symlink-escape"
        : state.reason === "candidate-not-regular-file"
          ? "local-reference-not-regular-file"
          : state.reason === "candidate-path-invalid"
            ? "local-reference-outside-project"
            : "local-reference-unreadable";
      return referenceFailure(reason, raw, parsed.ignoredExternalReferences);
    }
    if (!localPaths.includes(targetRelative)) localPaths.push(targetRelative);
  }
  return { ok: true, localPaths, ignoredExternalReferences: parsed.ignoredExternalReferences };
}

type ParsedReference = { raw: string; source: "markdown" | "html" };

type ParsedReferences =
  | { ok: true; references: ParsedReference[]; ignoredExternalReferences: string[] }
  | {
      ok: false;
      reason: "malformed-reference" | "undefined-reference";
      reference: string;
      ignoredExternalReferences: string[];
    };

function parseBoundedReferences(content: string): ParsedReferences {
  const scannable = content.replace(/```[\s\S]*?```/g, (value) => " ".repeat(value.length));
  const definitions = new Map<string, string>();
  const definitionRanges: Array<[number, number]> = [];
  const definitionPattern = /^\s{0,3}\[([^\]]+)\]:\s*(\S.*)?$/gm;
  for (const match of scannable.matchAll(definitionPattern)) {
    if (match[2] === undefined) {
      return { ok: false, reason: "malformed-reference", reference: match[0], ignoredExternalReferences: [] };
    }
    const destination = parseDestination(match[2]);
    if (destination === null) {
      return { ok: false, reason: "malformed-reference", reference: match[0], ignoredExternalReferences: [] };
    }
    const normalizedLabel = normalizeLabel(match[1] ?? "");
    if (!definitions.has(normalizedLabel)) definitions.set(normalizedLabel, destination);
    definitionRanges.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
  }
  const withoutDefinitions = [...scannable].map((char, index) =>
    definitionRanges.some(([start, end]) => index >= start && index < end) ? " " : char,
  ).join("");
  const references: ParsedReference[] = [];
  const inlinePattern = /!?\[[^\]\n]*\]\(([^)\n]*)\)/g;
  let masked = withoutDefinitions;
  for (const match of withoutDefinitions.matchAll(inlinePattern)) {
    const destination = parseDestination(match[1] ?? "");
    if (destination === null) {
      return { ok: false, reason: "malformed-reference", reference: match[0], ignoredExternalReferences: [] };
    }
    references.push({ raw: destination, source: "markdown" });
    masked = maskRange(masked, match.index ?? 0, (match.index ?? 0) + match[0].length);
  }
  const referencePattern = /!?\[([^\]\n]*)\]\[([^\]\n]+)\]/g;
  for (const match of masked.matchAll(referencePattern)) {
    const label = normalizeLabel(match[2] ?? match[1] ?? "");
    const destination = definitions.get(label);
    if (destination === undefined) {
      return { ok: false, reason: "undefined-reference", reference: match[0], ignoredExternalReferences: [] };
    }
    references.push({ raw: destination, source: "markdown" });
  }
  const htmlMarkers = [...scannable.matchAll(/\b(?:href|src)\s*=/gi)];
  const htmlPattern = /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  const htmlReferences = [...scannable.matchAll(htmlPattern)];
  if (htmlReferences.length !== htmlMarkers.length) {
    const malformed = htmlMarkers.find((marker) =>
      !htmlReferences.some((reference) => reference.index === marker.index),
    );
    return {
      ok: false,
      reason: "malformed-reference",
      reference: malformed?.[0] ?? "html-local-reference",
      ignoredExternalReferences: [],
    };
  }
  for (const match of htmlReferences) {
    references.push({ raw: match[1] ?? match[2] ?? match[3] ?? "", source: "html" });
  }

  const ignoredExternalReferences = references
    .filter((reference) => classifyReference(reference.raw, reference.source).kind === "external")
    .map((reference) => reference.raw);
  return { ok: true, references, ignoredExternalReferences };
}

function parseDestination(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith("<")) {
    const end = trimmed.indexOf(">");
    if (end <= 1) return null;
    return trimmed.slice(1, end);
  }
  const firstWhitespace = trimmed.search(/\s/);
  return firstWhitespace === -1 ? trimmed : trimmed.slice(0, firstWhitespace);
}

function classifyReference(raw: string, source: ParsedReference["source"] = "markdown"):
  | { kind: "external" }
  | { kind: "ignore" }
  | { kind: "invalid" }
  | { kind: "local"; path: string } {
  const trimmed = raw.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("?") || trimmed.length === 0) return { kind: "ignore" };
  if (/^[A-Za-z]:[\\/]/.test(trimmed)) return { kind: "invalid" };
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)) return { kind: "external" };
  if (source === "html" && trimmed.includes("&")) return { kind: "invalid" };
  const cutoff = [trimmed.indexOf("?"), trimmed.indexOf("#")]
    .filter((index) => index >= 0)
    .reduce((minimum, index) => Math.min(minimum, index), trimmed.length);
  const encodedPath = trimmed.slice(0, cutoff);
  if (
    encodedPath.startsWith("//")
    || encodedPath.startsWith("/")
    || encodedPath.includes("\\")
    || /^[A-Za-z]:/.test(encodedPath)
    || /%(?:2f|5c)/i.test(encodedPath)
  ) return { kind: "invalid" };
  let decoded: string;
  try {
    decoded = decodeURIComponent(encodedPath);
  } catch {
    return { kind: "invalid" };
  }
  if (decoded.length === 0 || decoded.includes("\\") || path.posix.isAbsolute(decoded) || /^[A-Za-z]:/.test(decoded)) {
    return { kind: "invalid" };
  }
  return { kind: "local", path: decoded };
}

export function isUxArtifactTargetAllowed(input: {
  targetPath: string;
  owner: "ux-workflow" | "public-docs" | "project-knowledge";
  planningRoot: string;
  projectKnowledgeRoot: string;
}): boolean {
  let target: string;
  try {
    target = normalizeProjectRelativePosixPath(input.targetPath);
  } catch {
    return false;
  }
  const allowedRoot = input.owner === "ux-workflow"
    ? `${normalizeProjectRelativePosixPath(input.planningRoot)}/ux`
    : input.owner === "public-docs"
      ? "docs"
      : normalizeProjectRelativePosixPath(input.projectKnowledgeRoot);
  return target === allowedRoot || target.startsWith(`${allowedRoot}/`);
}

function referenceFailure(
  reason: Extract<UxLocalReferenceResult, { ok: false }>["reason"],
  reference: string,
  ignoredExternalReferences: string[],
): Extract<UxLocalReferenceResult, { ok: false }> {
  return { ok: false, localPaths: [], ignoredExternalReferences, reason, reference };
}

function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

function maskRange(value: string, start: number, end: number): string {
  return `${value.slice(0, start)}${" ".repeat(end - start)}${value.slice(end)}`;
}

function safeAffectedPath(value: string): string {
  try {
    return normalizeProjectRelativePosixPath(value);
  } catch {
    return ".";
  }
}

function isSameOrDescendant(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function isEnotdir(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOTDIR";
}
