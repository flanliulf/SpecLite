import * as fs from "node:fs/promises";
import path from "node:path";
import {
  findProjectBoundarySymlinkEscape,
  resolveProjectRelativePath,
} from "../fs/path-normalizer.js";
import type {
  ArtifactRootResolution,
  ArtifactRootResolutionMode,
} from "../config/artifact-root-resolver.js";

export type AnalysisDocumentFamily = "product-brief" | "prfaq";

export type AnalysisDocumentRoute = {
  family: AnalysisDocumentFamily;
  mainArtifact: string;
  distillateArtifact: string;
  artifactDirectory: string;
  selectedSource: "new-subject" | "legacy-root-level";
  legacyDiscoveryEnabled: boolean;
  checkedArtifacts: {
    newSubjectMainArtifact: string;
    legacyRootLevelMainArtifact: string;
  };
};

type AnalysisDocumentRouteDefinition = {
  subjectDirectory: AnalysisDocumentFamily;
  basenamePrefix: AnalysisDocumentFamily;
};

const ANALYSIS_DOCUMENT_ROUTE_DEFINITIONS: Record<
  AnalysisDocumentFamily,
  AnalysisDocumentRouteDefinition
> = {
  "product-brief": {
    subjectDirectory: "product-brief",
    basenamePrefix: "product-brief",
  },
  prfaq: {
    subjectDirectory: "prfaq",
    basenamePrefix: "prfaq",
  },
};

export async function resolveAnalysisDocumentRoute(input: {
  projectRoot: string;
  analysisRoot: Pick<ArtifactRootResolution, "resolvedRoot" | "resolutionMode">;
  family: AnalysisDocumentFamily;
  projectName: string;
}): Promise<AnalysisDocumentRoute> {
  const definition = ANALYSIS_DOCUMENT_ROUTE_DEFINITIONS[input.family];
  const projectName = assertPortableProjectName(input.projectName);
  const subjectDirectory = joinPosix(input.analysisRoot.resolvedRoot, definition.subjectDirectory);
  const mainBasename = `${definition.basenamePrefix}-${projectName}.md`;
  const distillateBasename = `${definition.basenamePrefix}-${projectName}-distillate.md`;
  const newSubjectMainArtifact = joinPosix(subjectDirectory, mainBasename);
  const legacyRootLevelMainArtifact = joinPosix(input.analysisRoot.resolvedRoot, mainBasename);
  const legacyDiscoveryEnabled = input.analysisRoot.resolutionMode === "legacy-compatible";
  const newSubjectExists = await isSafeExistingCandidate(input.projectRoot, newSubjectMainArtifact);
  const legacyRootLevelExists = legacyDiscoveryEnabled && !newSubjectExists
    ? await isSafeExistingCandidate(input.projectRoot, legacyRootLevelMainArtifact)
    : false;
  const selectedSource: AnalysisDocumentRoute["selectedSource"] =
    !newSubjectExists && legacyRootLevelExists ? "legacy-root-level" : "new-subject";
  const artifactDirectory =
    selectedSource === "legacy-root-level" ? input.analysisRoot.resolvedRoot : subjectDirectory;

  return {
    family: input.family,
    mainArtifact:
      selectedSource === "legacy-root-level" ? legacyRootLevelMainArtifact : newSubjectMainArtifact,
    distillateArtifact: joinPosix(artifactDirectory, distillateBasename),
    artifactDirectory,
    selectedSource,
    legacyDiscoveryEnabled,
    checkedArtifacts: {
      newSubjectMainArtifact,
      legacyRootLevelMainArtifact,
    },
  };
}

export function isLegacyCompatibleAnalysisMode(
  mode: ArtifactRootResolutionMode,
): boolean {
  return mode === "legacy-compatible";
}

function assertPortableProjectName(projectName: string): string {
  const trimmed = projectName.trim();
  if (
    trimmed.length === 0 ||
    projectName.includes("/") ||
    projectName.includes("\\") ||
    projectName.includes("\0") ||
    trimmed === "." ||
    trimmed === ".." ||
    path.posix.isAbsolute(trimmed) ||
    path.win32.isAbsolute(trimmed) ||
    /^[A-Za-z]:/.test(trimmed)
  ) {
    throw new Error("projectName must be a portable single filename segment");
  }
  return trimmed;
}

async function isSafeExistingCandidate(projectRoot: string, relativePath: string): Promise<boolean> {
  const candidate = resolveProjectRelativePath({ projectRoot, relativePath });
  const symlinkEscape = await findProjectBoundarySymlinkEscape({
    projectRoot,
    relativePath: candidate.relativePath,
  });
  if (symlinkEscape !== undefined) {
    throw new Error("Analysis artifact candidate must stay inside the target project");
  }

  try {
    const candidateStat = await fs.lstat(candidate.absolutePath);
    if (!candidateStat.isFile() || candidateStat.isSymbolicLink()) {
      throw new Error("Analysis artifact candidate must be a regular non-symlink file");
    }
    const candidateHandle = await fs.open(candidate.absolutePath, "r");
    try {
      return true;
    } finally {
      await candidateHandle.close();
    }
  } catch (error) {
    if (isNodeErrorWithCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

function isNodeErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code;
}

function joinPosix(...segments: string[]): string {
  return path.posix.join(...segments).replace(/\/+$/g, "");
}
