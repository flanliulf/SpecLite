import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { findProjectBoundarySymlinkEscape, resolveProjectRelativePath } from "../fs/path-normalizer.js";

export const CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION = "speclite.resolve.cr-directory.v1" as const;

export const CR_DIRECTORY_AMBIGUOUS_RESUME_ROOT_ISSUE_ID = "cr-directory.ambiguous-resume-root" as const;

const STORY_ID_PATTERN = /^[1-9]\d*[.-][1-9]\d*$/;
const REVIEW_SERIES_PATTERN = /^[a-z0-9][a-z0-9-]{0,31}$/;

export type CrDirectoryCompatibilityMode = "canonical" | "legacy-resume";

export type CrDirectoryIssueId =
  | typeof CR_DIRECTORY_AMBIGUOUS_RESUME_ROOT_ISSUE_ID
  | "cr-directory.invalid-story-id"
  | "cr-directory.invalid-review-series"
  | "cr-directory.invalid-implementation-artifacts"
  | "cr-directory.symlink-escape"
  | "cr-directory.unreadable-candidate";

export type CrDirectoryIssueCategory = "identity" | "lifecycle" | "path-safety";

/**
 * CR workflow-local continuation issue. Owned by the shared CR contract, not by the
 * SPEC 07 project validation taxonomy, so it carries its own category enum.
 */
export type CrDirectoryIssue = {
  issueId: CrDirectoryIssueId;
  category: CrDirectoryIssueCategory;
  severity: "error";
  continuation: "block";
  affectedPath?: string;
  component: "cr-directory-resolver";
  details: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
};

export type CrDirectoryRoundEvidence = {
  crDir: string;
  summaryRounds: number[];
  finalizerRounds: number[];
  unfinished: boolean;
};

export type CrDirectoryResolution = {
  schemaVersion: typeof CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION;
  ok: boolean;
  storyId: string | null;
  reviewSeries: string | null;
  crDir: string | null;
  canonicalCrDir: string | null;
  compatibilityMode: CrDirectoryCompatibilityMode | null;
  legacyCrDirs: string[];
  roundEvidence: CrDirectoryRoundEvidence[];
  continuation: "continue" | "block";
  issues: CrDirectoryIssue[];
};

export function normalizeCrStoryId(
  input: string,
): { ok: true; storyId: string } | { ok: false; reason: "invalid-story-id" } {
  if (!STORY_ID_PATTERN.test(input)) return { ok: false, reason: "invalid-story-id" };
  return { ok: true, storyId: input.replace(".", "-") };
}

export function isValidCrReviewSeries(input: string): boolean {
  return REVIEW_SERIES_PATTERN.test(input);
}

/**
 * Resolves the single CR directory for a Story + review series by looking only at
 * directory and file names under `{implementationArtifacts}/code-reviews/`. It never
 * reads artifact contents and never creates, moves, or deletes anything.
 */
export async function resolveCrDirectory(input: {
  projectRoot: string;
  implementationArtifacts: string;
  storyId: string;
  reviewSeries: string;
}): Promise<CrDirectoryResolution> {
  const base: CrDirectoryResolution = {
    schemaVersion: CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION,
    ok: false,
    storyId: null,
    reviewSeries: null,
    crDir: null,
    canonicalCrDir: null,
    compatibilityMode: null,
    legacyCrDirs: [],
    roundEvidence: [],
    continuation: "block",
    issues: [],
  };

  const normalized = normalizeCrStoryId(input.storyId);
  if (!normalized.ok) {
    return blocked(base, issue({
      issueId: "cr-directory.invalid-story-id",
      category: "identity",
      details: { reason: "invalid-story-id" },
    }));
  }
  const storyId = normalized.storyId;
  base.storyId = storyId;

  if (!isValidCrReviewSeries(input.reviewSeries)) {
    return blocked(base, issue({
      issueId: "cr-directory.invalid-review-series",
      category: "identity",
      details: { storyId, reason: "invalid-review-series" },
    }));
  }
  const reviewSeries = input.reviewSeries;
  base.reviewSeries = reviewSeries;

  let implementationRoot: string;
  try {
    implementationRoot = resolveProjectRelativePath({
      projectRoot: input.projectRoot,
      relativePath: input.implementationArtifacts,
    }).relativePath;
  } catch {
    return blocked(base, issue({
      issueId: "cr-directory.invalid-implementation-artifacts",
      category: "path-safety",
      details: { storyId, reviewSeries, reason: "implementation-artifacts-outside-project" },
    }));
  }

  const codeReviewsDir = `${implementationRoot}/code-reviews`;
  const canonicalCrDir = `${codeReviewsDir}/${storyId}-code-review`;
  base.canonicalCrDir = canonicalCrDir;

  const symlinkEscape = (candidate: string): CrDirectoryIssue =>
    issue({
      issueId: "cr-directory.symlink-escape",
      category: "path-safety",
      affectedPath: candidate,
      details: { storyId, reviewSeries, canonicalCrDir, reason: "symlink-escape" },
    });
  const unreadable = (candidate: string, code: string): CrDirectoryIssue =>
    issue({
      issueId: "cr-directory.unreadable-candidate",
      category: "path-safety",
      affectedPath: candidate,
      details: { storyId, reviewSeries, canonicalCrDir, errorCode: code, reason: "unreadable-candidate" },
    });

  const boundaryBlock = async (candidate: string): Promise<CrDirectoryIssue | undefined> => {
    const outcome = await checkBoundary(input.projectRoot, candidate);
    if (outcome === "inside") return undefined;
    return outcome === "escape" ? symlinkEscape(candidate) : unreadable(candidate, outcome.errorCode);
  };

  // Boundary check runs before any directory listing so an escaping `code-reviews`
  // never has its (outside) contents enumerated into the result.
  const codeReviewsBlock = await boundaryBlock(codeReviewsDir);
  if (codeReviewsBlock !== undefined) return blocked(base, codeReviewsBlock);

  const legacyPattern = new RegExp(`^${escapeRegExp(storyId)}-.+-code-review$`);
  const legacyCrDirs: string[] = [];
  let entries: Dirent[];
  try {
    entries = await readdir(path.join(input.projectRoot, codeReviewsDir), { withFileTypes: true });
  } catch (error) {
    if (!isMissing(error)) return blocked(base, unreadable(codeReviewsDir, errorCode(error)));
    entries = [];
  }
  for (const entry of entries) {
    if (!legacyPattern.test(entry.name)) continue;
    if (entry.isDirectory()) {
      legacyCrDirs.push(`${codeReviewsDir}/${entry.name}`);
      continue;
    }
    if (!entry.isSymbolicLink()) continue;
    const candidate = `${codeReviewsDir}/${entry.name}`;
    const candidateBlock = await boundaryBlock(candidate);
    if (candidateBlock !== undefined) return blocked(base, candidateBlock);
    // A symlink only counts as a legacy directory when it points at a directory.
    try {
      if (!(await stat(path.join(input.projectRoot, candidate))).isDirectory()) continue;
    } catch (error) {
      if (!isMissing(error)) return blocked(base, unreadable(candidate, errorCode(error)));
    }
    legacyCrDirs.push(candidate);
  }
  legacyCrDirs.sort(compareBytewise);
  base.legacyCrDirs = legacyCrDirs;

  const canonicalBlock = await boundaryBlock(canonicalCrDir);
  if (canonicalBlock !== undefined) return blocked(base, canonicalBlock);

  const roundEvidence: CrDirectoryRoundEvidence[] = [];
  for (const crDir of [canonicalCrDir, ...legacyCrDirs]) {
    const evidence = await collectRoundEvidence({
      projectRoot: input.projectRoot,
      crDir,
      storyId,
      reviewSeries,
    });
    if (evidence === undefined) continue;
    if ("errorCode" in evidence) return blocked(base, unreadable(crDir, evidence.errorCode));
    roundEvidence.push(evidence);
  }
  base.roundEvidence = roundEvidence;

  const canonicalUnfinished = roundEvidence.some((item) => item.crDir === canonicalCrDir && item.unfinished);
  const unfinishedLegacy = roundEvidence.filter((item) => item.crDir !== canonicalCrDir && item.unfinished);

  if (unfinishedLegacy.length === 0) {
    return continued(base, canonicalCrDir, "canonical");
  }
  if (unfinishedLegacy.length === 1 && !canonicalUnfinished) {
    return continued(base, unfinishedLegacy[0]!.crDir, "legacy-resume");
  }

  return blocked(base, issue({
    issueId: CR_DIRECTORY_AMBIGUOUS_RESUME_ROOT_ISSUE_ID,
    category: "lifecycle",
    affectedPath: codeReviewsDir,
    details: {
      storyId,
      canonicalCrDir,
      legacyCrDirs,
      reviewSeries,
      roundEvidence,
      reason: "multiple-unfinished-run-roots",
    },
  }));
}

async function collectRoundEvidence(input: {
  projectRoot: string;
  crDir: string;
  storyId: string;
  reviewSeries: string;
}): Promise<CrDirectoryRoundEvidence | { errorCode: string } | undefined> {
  const prefix = `${escapeRegExp(input.storyId)}-`;
  const series = escapeRegExp(input.reviewSeries);
  const summaryPattern = new RegExp(`^${prefix}code-review-summary-\\d{8}-${series}-round-([1-9]\\d*)\\.md$`);
  const finalizerPattern = new RegExp(`^${prefix}cr-finalizer-\\d{8}-${series}-round-([1-9]\\d*)\\.md$`);

  let entries;
  try {
    entries = await readdir(path.join(input.projectRoot, input.crDir), { withFileTypes: true });
  } catch (error) {
    if (isMissing(error)) return undefined;
    return { errorCode: errorCode(error) };
  }

  const summaryRounds: number[] = [];
  const finalizerRounds: number[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const summary = summaryPattern.exec(entry.name);
    if (summary !== null) summaryRounds.push(Number(summary[1]));
    const finalizer = finalizerPattern.exec(entry.name);
    if (finalizer !== null) finalizerRounds.push(Number(finalizer[1]));
  }
  summaryRounds.sort((left, right) => left - right);
  finalizerRounds.sort((left, right) => left - right);

  return {
    crDir: input.crDir,
    summaryRounds,
    finalizerRounds,
    unfinished: summaryRounds.length > 0 && finalizerRounds.length === 0,
  };
}

function continued(
  base: CrDirectoryResolution,
  crDir: string,
  compatibilityMode: CrDirectoryCompatibilityMode,
): CrDirectoryResolution {
  return { ...base, ok: true, crDir, compatibilityMode, continuation: "continue", issues: [] };
}

function blocked(base: CrDirectoryResolution, blockingIssue: CrDirectoryIssue): CrDirectoryResolution {
  return { ...base, ok: false, crDir: null, compatibilityMode: null, continuation: "block", issues: [blockingIssue] };
}

function issue(input: {
  issueId: CrDirectoryIssueId;
  category: CrDirectoryIssueCategory;
  affectedPath?: string;
  details: Record<string, unknown>;
}): CrDirectoryIssue {
  return {
    issueId: input.issueId,
    category: input.category,
    severity: "error",
    continuation: "block",
    ...(input.affectedPath === undefined ? {} : { affectedPath: input.affectedPath }),
    component: "cr-directory-resolver",
    details: input.details,
    impact: IMPACTS[input.issueId],
    suggestedNextStep: NEXT_STEPS[input.issueId],
  };
}

const IMPACTS: Record<CrDirectoryIssueId, string> = {
  "cr-directory.ambiguous-resume-root":
    "More than one CR directory holds an unfinished run of this review series, so the resume root cannot be chosen deterministically.",
  "cr-directory.invalid-story-id":
    "The Story id is not a canonical numeric identity, so no CR directory can be derived from it.",
  "cr-directory.invalid-review-series":
    "The review series is not a stable series token, so no canonical CR filename can be derived from it.",
  "cr-directory.invalid-implementation-artifacts":
    "The implementation artifacts root does not stay inside the project, so no CR directory can be derived safely.",
  "cr-directory.symlink-escape":
    "A CR directory candidate resolves outside the project boundary, so it cannot be used as a write root.",
  "cr-directory.unreadable-candidate":
    "A CR directory candidate is not a readable directory, so ownership cannot be judged from its entries.",
};

const NEXT_STEPS: Record<CrDirectoryIssueId, string> = {
  "cr-directory.ambiguous-resume-root":
    "Finish or archive the extra unfinished run so exactly one directory holds this series, then rerun the resolver. Do not merge or split rounds.",
  "cr-directory.invalid-story-id":
    "Pass the Story id as N.N or N-N using the canonical numeric identity only, then rerun the resolver.",
  "cr-directory.invalid-review-series":
    "Pass a review series matching ^[a-z0-9][a-z0-9-]{0,31}$, then rerun the resolver.",
  "cr-directory.invalid-implementation-artifacts":
    "Fix modules.sdlc.implementation_artifacts so it is a project-relative POSIX path, then rerun the resolver.",
  "cr-directory.symlink-escape":
    "Replace the escaping symlink with an in-project directory, then rerun the resolver.",
  "cr-directory.unreadable-candidate":
    "Make the candidate a readable directory (or remove the stray file / symlink), then rerun the resolver.",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compareBytewise(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Wraps the shared boundary helper so lstat / realpath failures other than ENOENT
 * (ENOTDIR, ELOOP, EACCES, ...) surface as a structured block instead of an exception.
 */
async function checkBoundary(
  projectRoot: string,
  relativePath: string,
): Promise<"inside" | "escape" | { errorCode: string }> {
  try {
    return (await findProjectBoundarySymlinkEscape({ projectRoot, relativePath })) === undefined ? "inside" : "escape";
  } catch (error) {
    if (isMissing(error)) return "inside";
    return { errorCode: errorCode(error) };
  }
}

function errorCode(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? (error as { code?: unknown }).code : undefined;
  return typeof code === "string" && code.length > 0 ? code : "UNKNOWN";
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}
