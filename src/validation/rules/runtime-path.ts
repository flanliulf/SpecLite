import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { resolveProjectRelativePath } from "../../fs/path-normalizer.js";
import { isProjectRelativePosixPath, type FilesIndex, type Manifest } from "../../manifest/manifest-schema.js";

export type RuntimePathValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
};

type RuntimePathIssueId =
  | "runtime-path.missing-entry"
  | "runtime-path.invalid-script-path"
  | "runtime-path.legacy-resolver-path"
  | "runtime-path.symlink-escape";

const REQUIRED_RUNTIME_PATHS = ["_speclite/config.toml", "_speclite/config.user.toml"] as const;

export async function validateRuntimePaths(input: {
  projectRoot: string;
  manifest: Manifest;
  filesIndex: FilesIndex;
}): Promise<RuntimePathValidationResult> {
  const issues: ValidationIssue[] = [];
  const validatedPaths = new Set<string>(["_speclite/_config/manifest.yaml", "_speclite/_config/files-index.json"]);
  const runtimeEntries = input.filesIndex.entries.filter(isRuntimeEntry);
  const runtimeEntryPaths = new Set(runtimeEntries.map((entry) => entry.path));

  for (const requiredPath of REQUIRED_RUNTIME_PATHS) {
    validatedPaths.add(requiredPath);
    if (!runtimeEntryPaths.has(requiredPath)) {
      issues.push(
        createRuntimePathIssue({
          issueId: "runtime-path.missing-entry",
          affectedPath: requiredPath,
          details: {
            runtimeRefKind: "installed-entry",
            expectedNamespace: "_speclite",
            reason: "missing-entry",
          },
          impact: "Required installed runtime metadata is absent from files-index.json.",
          suggestedNextStep: "Regenerate installed runtime metadata before running Speclite workflows.",
        }),
      );
    }
  }

  if (input.manifest.paths.specliteRoot !== "_speclite") {
    issues.push(
      createRuntimePathIssue({
        issueId: "runtime-path.legacy-resolver-path",
        affectedPath: "_speclite/_config/manifest.yaml",
        details: {
          runtimeRefKind: "manifest",
          namespaceKind: namespaceKind(input.manifest.paths.specliteRoot),
          expectedNamespace: "_speclite",
          reason: "legacy-resolver-path",
        },
        impact: "Installed runtime metadata points at a non-current runtime namespace.",
        suggestedNextStep: "Regenerate installed runtime metadata with the current Speclite namespace.",
      }),
    );
  }

  for (const entry of runtimeEntries) {
    validatedPaths.add(entry.path);
    issues.push(...(await validateRuntimeEntryPath(input.projectRoot, entry.path, "installed-entry")));
    if (isLegacyRuntimeReference(entry.path) || isLegacyRuntimeReference(entry.sourceRef)) {
      issues.push(
        createRuntimePathIssue({
          issueId: "runtime-path.legacy-resolver-path",
          affectedPath: entry.path,
          details: {
            runtimeRefKind: "installed-entry",
            namespaceKind: "legacy",
            expectedNamespace: "_speclite",
            reason: "legacy-resolver-path",
          },
          impact: "An installed runtime entry still references a legacy runtime namespace or resolver path.",
          suggestedNextStep: "Regenerate installed runtime metadata with the current Speclite namespace.",
        }),
      );
    }
  }

  return {
    issues: dedupeIssues(issues),
    validatedPaths: [...validatedPaths],
  };
}

function isRuntimeEntry(entry: FilesIndex["entries"][number]): boolean {
  return (
    entry.path === "_speclite/config.toml" ||
    entry.path === "_speclite/config.user.toml" ||
    entry.path.startsWith("_speclite/custom/") ||
    entry.path.startsWith("_speclite/scripts/") ||
    entry.path.startsWith("_speclite/runtime/") ||
    entry.path.startsWith("_bmad/") ||
    entry.artifactKind.startsWith("runtime-") ||
    entry.artifactKind === "project-custom-stub"
  );
}

async function validateRuntimeEntryPath(
  projectRoot: string,
  relativePath: string,
  runtimeRefKind: "manifest" | "skill-index" | "installed-entry" | "resolver-metadata",
): Promise<ValidationIssue[]> {
  if (!isProjectRelativePosixPath(relativePath)) {
    return [
      createRuntimePathIssue({
        issueId: "runtime-path.invalid-script-path",
        affectedPath: "runtime:path",
        details: {
          runtimeRefKind,
          namespaceKind: "unknown",
          expectedNamespace: "_speclite",
          reason: "invalid-script-path",
        },
        impact: "A runtime path is not a project-relative POSIX path inside the target project.",
        suggestedNextStep: "Regenerate installed runtime metadata with project-relative POSIX runtime paths.",
      }),
    ];
  }

  let resolved: ReturnType<typeof resolveProjectRelativePath>;
  try {
    resolved = resolveProjectRelativePath({ projectRoot, relativePath });
  } catch {
    return [
      createRuntimePathIssue({
        issueId: "runtime-path.invalid-script-path",
        affectedPath: relativePath,
        details: {
          runtimeRefKind,
          namespaceKind: namespaceKind(relativePath),
          expectedNamespace: "_speclite",
          reason: "invalid-script-path",
        },
        impact: "A runtime path escapes the target project boundary.",
        suggestedNextStep: "Regenerate installed runtime metadata with project-contained runtime paths.",
      }),
    ];
  }

  const symlinkIssue = await findSymlinkSegment(projectRoot, resolved.relativePath, runtimeRefKind);
  return symlinkIssue === undefined ? [] : [symlinkIssue];
}

async function findSymlinkSegment(
  projectRoot: string,
  relativePath: string,
  runtimeRefKind: "manifest" | "skill-index" | "installed-entry" | "resolver-metadata",
): Promise<ValidationIssue | undefined> {
  const realProjectRoot = await realpath(projectRoot);
  let current = projectRoot;
  for (const segment of relativePath.split("/")) {
    current = path.join(current, segment);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) {
        const realSegment = await realpath(current);
        if (isSameOrDescendantNativePath(realSegment, realProjectRoot)) continue;

        return createRuntimePathIssue({
          issueId: "runtime-path.symlink-escape",
          affectedPath: relativePath,
          details: {
            runtimeRefKind,
            namespaceKind: namespaceKind(relativePath),
            expectedNamespace: "_speclite",
            reason: "symlink-escape",
          },
          impact: "A runtime path crosses a symlink and cannot be proven to stay inside the target project.",
          suggestedNextStep: "Replace symlinked runtime path segments with real project-local files.",
        });
      }
    } catch (error) {
      if (isMissingPathError(error)) return undefined;
      throw error;
    }
  }
  return undefined;
}

function isSameOrDescendantNativePath(candidatePath: string, containerPath: string): boolean {
  const relative = path.relative(containerPath, candidatePath);
  return relative.length === 0 || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function namespaceKind(relativePath: string): "speclite" | "legacy" | "external" | "unknown" {
  if (relativePath.startsWith("_speclite/") || relativePath === "_speclite") return "speclite";
  if (isLegacyRuntimeReference(relativePath)) return "legacy";
  if (relativePath.startsWith("assets/source/")) return "external";
  return "unknown";
}

function isLegacyRuntimeReference(value: string): boolean {
  return (
    value === "_bmad" ||
    value.startsWith("_bmad/") ||
    value.includes("legacy-resolver") ||
    value.includes("resolve_config.py") ||
    value.includes("resolve_customization.py")
  );
}

function createRuntimePathIssue(input: {
  issueId: RuntimePathIssueId;
  affectedPath: string;
  details: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "runtime-path",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "runtime-path-validator",
    details: input.details,
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = JSON.stringify({
      issueId: issue.issueId,
      affectedPath: issue.affectedPath,
      details: issue.details,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
