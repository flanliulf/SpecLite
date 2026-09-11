import type { FilesIndexEntry } from "../manifest/manifest-schema.js";
import { isProjectRelativePosixPath } from "../manifest/manifest-schema.js";
import { normalizeProjectRelativePosixPath } from "../fs/path-normalizer.js";

export const FILE_OWNERSHIPS = [
  "installer-owned",
  "human-owned",
  "workflow-owned",
] as const;

export type FileOwnership = (typeof FILE_OWNERSHIPS)[number];
export type ConflictOwnership = FileOwnership | "unknown";

export type OwnershipClassification = {
  relativePath: string;
  ownership: ConflictOwnership;
  protected: boolean;
  reason?:
    | "installer-owned"
    | "human-owned"
    | "workflow-owned"
    | "unknown-ownership"
    | "path-escape";
};

export function classifyOwnership(input: {
  relativePath: string;
  artifactRoot?: string;
  artifactRoots?: readonly string[];
}): OwnershipClassification {
  const normalized = normalizeCandidatePath(input.relativePath);
  if (normalized === undefined) {
    return {
      relativePath: input.relativePath,
      ownership: "unknown",
      protected: true,
      reason: "path-escape",
    };
  }

  if (isHumanOwnedCustomPath(normalized)) {
    return {
      relativePath: normalized,
      ownership: "human-owned",
      protected: true,
      reason: "human-owned",
    };
  }

  if (isInstallerOwnedPath(normalized)) {
    return {
      relativePath: normalized,
      ownership: "installer-owned",
      protected: false,
      reason: "installer-owned",
    };
  }

  const artifactRoots = normalizeArtifactRoots(input);
  if (artifactRoots.some((artifactRoot) => isPathAtOrUnder(normalized, artifactRoot))) {
    return {
      relativePath: normalized,
      ownership: "workflow-owned",
      protected: true,
      reason: "workflow-owned",
    };
  }

  return {
    relativePath: normalized,
    ownership: "unknown",
    protected: true,
    reason: "unknown-ownership",
  };
}

export function ownershipForFilesIndexEntry(input: {
  path: string;
  artifactRoot?: string;
  artifactRoots?: readonly string[];
}): FileOwnership {
  const classification = classifyOwnership({
    relativePath: input.path,
    artifactRoot: input.artifactRoot,
    artifactRoots: input.artifactRoots,
  });
  if (classification.ownership === "unknown") return "installer-owned";
  return classification.ownership;
}

export function isVolatileInstalledStatePath(relativePath: string): boolean {
  const normalized = normalizeCandidatePath(relativePath);
  if (normalized === undefined) return true;
  return normalized === "_speclite/.lock" || /^_speclite\/\.speclite-tmp-[^/]+$/.test(normalized);
}

export function isProtectedOwnership(ownership: ConflictOwnership): boolean {
  return ownership !== "installer-owned";
}

export function normalizeFilesIndexOwnership(entry: FilesIndexEntry): FileOwnership {
  return entry.ownership;
}

function isHumanOwnedCustomPath(relativePath: string): boolean {
  return relativePath === ".gitignore" || /^_speclite\/custom\/[^/]+(?:\.user)?\.toml$/.test(relativePath);
}

function isInstallerOwnedPath(relativePath: string): boolean {
  return (
    relativePath === "_speclite/config.toml" ||
    relativePath === "_speclite/config.user.toml" ||
    relativePath.startsWith("_speclite/_config/") ||
    relativePath.startsWith("_speclite/hooks/") ||
    relativePath.startsWith("_speclite/scripts/") ||
    relativePath.startsWith(".claude/skills/") ||
    relativePath.startsWith(".agents/skills/") ||
    relativePath === ".claude/settings.json" ||
    relativePath === ".codex/hooks.json"
  );
}

function isPathAtOrUnder(relativePath: string, root: string): boolean {
  return relativePath === root || relativePath.startsWith(`${root}/`);
}

function normalizeArtifactRoots(input: {
  artifactRoot?: string;
  artifactRoots?: readonly string[];
}): string[] {
  const candidates = [input.artifactRoot ?? "_speclite-output", ...(input.artifactRoots ?? [])];
  const normalized = new Set<string>();
  for (const candidate of candidates) {
    const root = normalizeCandidatePath(candidate);
    if (root !== undefined) normalized.add(root);
  }
  return [...normalized];
}

function normalizeCandidatePath(value: string): string | undefined {
  try {
    const normalized = normalizeProjectRelativePosixPath(value);
    return isProjectRelativePosixPath(normalized) ? normalized : undefined;
  } catch {
    return undefined;
  }
}
