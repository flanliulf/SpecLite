import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { SourceDescriptor, SourceIntegrityEvidence } from "./source-descriptor-schema.js";
import type { NormalizedSourceSelection } from "./source-selection.js";
import {
  createBlockedLocalDescriptor,
  createLocalSourceIntegrityIssue,
  type LocalBlockedRootKind,
} from "./source-integrity.js";
import { deriveSourceTrustStatus } from "./source-trust.js";

export type LocalSourceResolutionResult =
  | {
      ok: true;
      descriptor: SourceDescriptor;
      installSourceRoot?: string;
    }
  | {
      ok: false;
      descriptor: SourceDescriptor;
      issues: ValidationIssue[];
    };

export async function resolveLocalSource(input: {
  selection: NormalizedSourceSelection;
  sourceValue: string;
  targetProjectRoot: string;
  sourceBaseRoot?: string | undefined;
  expectedHash?: string | undefined;
  privateStagingRoot?: string | undefined;
}): Promise<LocalSourceResolutionResult> {
  if (input.selection.sourceType === "local-tarball") {
    return resolveLocalArtifact({
      selection: input.selection,
      sourceValue: input.sourceValue,
      sourceBaseRoot: input.sourceBaseRoot ?? input.targetProjectRoot,
      expectedHash: input.expectedHash,
      issueId: "source-integrity.tarball-unreadable",
      unreadableReason: "local-tarball-unreadable",
    });
  }

  if (input.selection.sourceType === "offline-bundle") {
    return resolveLocalArtifact({
      selection: input.selection,
      sourceValue: input.sourceValue,
      sourceBaseRoot: input.sourceBaseRoot ?? input.targetProjectRoot,
      expectedHash: input.expectedHash,
      issueId: "source-integrity.offline-bundle-unreadable",
      unreadableReason: "offline-bundle-unreadable",
    });
  }

  if (input.selection.sourceType === "local") {
    return resolveLocalPathSource({
      selection: input.selection,
      sourceValue: input.sourceValue,
      targetProjectRoot: input.targetProjectRoot,
      sourceBaseRoot: input.sourceBaseRoot ?? input.targetProjectRoot,
      expectedHash: input.expectedHash,
    });
  }

  return blocked(input.selection, [
    createLocalSourceIntegrityIssue({
      issueId: "source-integrity.unsupported-source",
      reason: "unsupported-local-source-type",
      sourceType: input.selection.sourceType,
    }),
  ]);
}

async function resolveLocalArtifact(input: {
  selection: NormalizedSourceSelection;
  sourceValue: string;
  sourceBaseRoot: string;
  expectedHash?: string | undefined;
  issueId: "source-integrity.tarball-unreadable" | "source-integrity.offline-bundle-unreadable";
  unreadableReason: "local-tarball-unreadable" | "offline-bundle-unreadable";
}): Promise<LocalSourceResolutionResult> {
  const artifactPath = resolveSourcePath(input.sourceBaseRoot, input.sourceValue);
  let bytes: Buffer;
  try {
    const artifactStat = await stat(artifactPath);
    if (!artifactStat.isFile()) {
      return blocked(input.selection, [
        createLocalSourceIntegrityIssue({
          issueId: input.issueId,
          reason: "local-artifact-not-regular-file",
          sourceType: input.selection.sourceType,
        }),
      ]);
    }
    bytes = await readFile(artifactPath);
  } catch {
    return blocked(input.selection, [
      createLocalSourceIntegrityIssue({
        issueId: input.issueId,
        reason: input.unreadableReason,
        sourceType: input.selection.sourceType,
      }),
    ]);
  }

  const contentHash = hashBytes(bytes);
  const evidence = createContentHashEvidence(contentHash, input.expectedHash);
  if (input.expectedHash !== undefined && input.expectedHash !== contentHash) {
    return blocked(
      input.selection,
      [
        createLocalSourceIntegrityIssue({
          issueId: "source-integrity.hash-mismatch",
          reason: "local-artifact-hash-mismatch",
          sourceType: input.selection.sourceType,
        }),
      ],
      contentHash,
      [evidence],
    );
  }

  return {
    ok: true,
    descriptor: {
      sourceType: input.selection.sourceType,
      ...(input.selection.channel === undefined ? {} : { channel: input.selection.channel }),
      ...(input.selection.requestedVersion === undefined
        ? {}
        : { requestedVersion: input.selection.requestedVersion }),
      resolvedRoot: input.selection.requestedSourceValue,
      contentHash,
      integrityEvidence: [evidence],
      trustStatus: deriveSourceTrustStatus({
        integrityEvidence: [evidence],
        explicitlyConfirmed: true,
      }),
    },
  };
}

async function resolveLocalPathSource(input: {
  selection: NormalizedSourceSelection;
  sourceValue: string;
  targetProjectRoot: string;
  sourceBaseRoot: string;
  expectedHash?: string | undefined;
}): Promise<LocalSourceResolutionResult> {
  const sourceRoot = resolveSourcePath(input.sourceBaseRoot, input.sourceValue);
  const blockedRootKind = classifyBlockedLocalSourceRoot({
    targetProjectRoot: input.targetProjectRoot,
    sourceRoot,
  });
  if (blockedRootKind !== undefined) {
    return blocked(input.selection, [
      createLocalSourceIntegrityIssue({
        issueId: "source-integrity.local-source-self-reference",
        reason: "local-source-self-reference",
        sourceType: "local",
        blockedRootKind,
      }),
    ]);
  }

  let snapshot: LocalSnapshot;
  try {
    const sourceStat = await stat(sourceRoot);
    if (!sourceStat.isDirectory()) {
      return blocked(input.selection, [
        createLocalSourceIntegrityIssue({
          issueId: "source-integrity.unsupported-source",
          reason: "local-source-not-directory",
          sourceType: "local",
        }),
      ]);
    }
    snapshot = await hashLocalSourceSnapshot(sourceRoot);
  } catch {
    return blocked(input.selection, [
      createLocalSourceIntegrityIssue({
        issueId: "source-integrity.missing-evidence",
        reason: "local-source-unreadable",
        sourceType: "local",
      }),
    ]);
  }

  if (snapshot.includedFiles.length === 0) {
    return blocked(input.selection, [
      createLocalSourceIntegrityIssue({
        issueId: "source-integrity.missing-evidence",
        reason: "local-source-snapshot-empty",
        sourceType: "local",
      }),
    ]);
  }

  const evidence = createContentHashEvidence(snapshot.hash, input.expectedHash);
  if (input.expectedHash !== undefined && input.expectedHash !== snapshot.hash) {
    return blocked(
      input.selection,
      [
        createLocalSourceIntegrityIssue({
          issueId: "source-integrity.hash-mismatch",
          reason: "local-source-snapshot-hash-mismatch",
          sourceType: "local",
        }),
      ],
      snapshot.hash,
      [evidence],
    );
  }

  return withPrivateInstallSourceRoot({
    ok: true,
    descriptor: {
      sourceType: "local",
      ...(input.selection.channel === undefined ? {} : { channel: input.selection.channel }),
      ...(input.selection.requestedVersion === undefined
        ? {}
        : { requestedVersion: input.selection.requestedVersion }),
      resolvedRoot: input.selection.requestedSourceValue,
      contentHash: snapshot.hash,
      integrityEvidence: [evidence],
      trustStatus: deriveSourceTrustStatus({
        integrityEvidence: [evidence],
        explicitlyConfirmed: true,
      }),
    },
  }, sourceRoot);
}

type LocalSnapshot = {
  hash: string;
  includedFiles: string[];
};

async function hashLocalSourceSnapshot(sourceRoot: string): Promise<LocalSnapshot> {
  const files = await collectAllowlistedSourceFiles(sourceRoot, ".");
  const hash = createHash("sha256");
  for (const relativePath of files) {
    const bytes = await readFile(path.join(sourceRoot, relativePath));
    hash.update(relativePath);
    hash.update("\0");
    hash.update(bytes);
    hash.update("\0");
  }

  return {
    hash: `sha256:${hash.digest("hex")}`,
    includedFiles: files,
  };
}

async function collectAllowlistedSourceFiles(
  sourceRoot: string,
  relativeDirectory: string,
): Promise<string[]> {
  const absoluteDirectory =
    relativeDirectory === "." ? sourceRoot : path.join(sourceRoot, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath =
      relativeDirectory === "." ? entry.name : `${relativeDirectory}/${entry.name}`;
    const normalizedPath = relativePath.split(path.sep).join("/");
    if (isExcludedLocalSourcePath(normalizedPath)) continue;

    if (entry.isDirectory()) {
      files.push(...await collectAllowlistedSourceFiles(sourceRoot, normalizedPath));
      continue;
    }

    if (entry.isFile() && isAllowlistedLocalSourceFile(normalizedPath)) {
      files.push(normalizedPath);
    }
  }

  return files.sort();
}

function isAllowlistedLocalSourceFile(relativePath: string): boolean {
  const basename = path.posix.basename(relativePath);
  if (
    [
      "module.yaml",
      "module-help.csv",
      "SKILL.md",
      "SKILL.en.md",
      "README.md",
      "README.en.md",
      "CHANGELOG.md",
      "customize.toml",
      "config.toml.example",
    ].includes(basename)
  ) {
    return true;
  }

  return relativePath.split("/").some((segment) =>
    ["references", "scripts", "assets", "templates", "data"].includes(segment),
  );
}

function isExcludedLocalSourcePath(relativePath: string): boolean {
  const segments = relativePath.split("/");
  const basename = segments.at(-1) ?? "";
  if ([".DS_Store", "Thumbs.db"].includes(basename)) return true;
  if (basename.endsWith(".swp") || basename.endsWith(".tmp") || basename.endsWith("~")) return true;
  return segments.some((segment) =>
    [
      ".git",
      ".hg",
      ".svn",
      "node_modules",
      "_speclite",
      "_speclite-output",
      "_bmad-output",
      "dist",
      "build",
      "out",
      "coverage",
      ".cache",
      "cache",
      ".tmp",
      "tmp",
      "temp",
    ].includes(segment),
  );
}

function classifyBlockedLocalSourceRoot(input: {
  targetProjectRoot: string;
  sourceRoot: string;
}): LocalBlockedRootKind | undefined {
  const relativePath = path.relative(
    path.resolve(input.targetProjectRoot),
    path.resolve(input.sourceRoot),
  );
  if (
    relativePath.length === 0 ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return classifyBlockedPathSegments(toPosixPath(input.sourceRoot).split("/"));
  }

  return classifyBlockedPathSegments(toPosixPath(relativePath).split("/"));
}

function classifyBlockedPathSegments(segments: string[]): LocalBlockedRootKind | undefined {
  const joined = segments.join("/");
  if (segments[0] === "_speclite") return "installed-state";
  if (joined.startsWith(".claude/skills") || joined.startsWith(".agents/skills")) {
    return "execution-plane";
  }
  if (
    segments[0] === "_speclite-output" ||
    segments[0] === "_bmad-output" ||
    joined.startsWith("fixtures/") ||
    joined.startsWith("test/fixtures/")
  ) {
    return "workflow-output";
  }
  if (segments.includes("node_modules")) return "dependency";
  if (segments.some((segment) => [".cache", "cache", ".npm"].includes(segment))) return "cache";
  if (segments.some((segment) => [".tmp", "tmp", "temp"].includes(segment))) return "temporary";
  if (segments.some((segment) => ["dist", "build", "out", "coverage"].includes(segment))) {
    return "build-output";
  }
  return undefined;
}

function blocked(
  selection: NormalizedSourceSelection,
  issues: ValidationIssue[],
  contentHash?: string,
  integrityEvidence?: SourceDescriptor["integrityEvidence"],
): LocalSourceResolutionResult {
  return {
    ok: false,
    descriptor: createBlockedLocalDescriptor({
      sourceType: selection.sourceType,
      requestedSourceValue: selection.requestedSourceValue,
      requestedVersion: selection.requestedVersion,
      channel: selection.channel,
      contentHash,
      integrityEvidence,
    }),
    issues,
  };
}

function createContentHashEvidence(
  contentHash: string,
  expectedHash: string | undefined,
): SourceIntegrityEvidence {
  return {
    kind: "content-hash",
    algorithm: "sha256",
    value: contentHash,
    verified: expectedHash !== undefined && expectedHash === contentHash,
  };
}

function hashBytes(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function resolveSourcePath(baseRoot: string, sourceValue: string): string {
  return path.isAbsolute(sourceValue)
    ? path.normalize(sourceValue)
    : path.resolve(baseRoot, sourceValue);
}

function toPosixPath(value: string): string {
  return value.split(/[\\/]+/).filter(Boolean).join("/");
}

function withPrivateInstallSourceRoot(
  result: Extract<LocalSourceResolutionResult, { ok: true }>,
  installSourceRoot: string,
): Extract<LocalSourceResolutionResult, { ok: true }> {
  Object.defineProperty(result, "installSourceRoot", {
    value: installSourceRoot,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return result;
}
