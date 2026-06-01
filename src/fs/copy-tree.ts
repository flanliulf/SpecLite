import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { FilesIndexEntry } from "../manifest/manifest-schema.js";
import { hashFile, isExecutableMode, listFiles } from "../manifest/hash.js";
import { ensureSafeDirectory, safeWriteFile } from "./safe-write.js";

const REQUIRED_CANONICAL_PACKAGE_FILE = "SKILL.md";
const OPTIONAL_CANONICAL_PACKAGE_FILES = new Set(["CHANGELOG.md", "config.toml.example", "customize.toml"]);
const OPTIONAL_CANONICAL_PACKAGE_DIRECTORIES = ["references/", "assets/", "scripts/"] as const;

export async function copyCanonicalPackage(input: {
  projectRoot: string;
  sourcePackageRoot: string;
  sourceRefRoot: string;
  targetEntryRoot: string;
  onChangedPath?: (relativePath: string) => void;
}): Promise<
  | {
      ok: true;
      files: FilesIndexEntry[];
    }
  | {
      ok: false;
      issue: import("../diagnostics/command-result-schema.js").ValidationIssue;
    }
> {
  const sourceFiles = await listFiles(input.sourcePackageRoot);
  if (!sourceFiles.includes(REQUIRED_CANONICAL_PACKAGE_FILE)) {
    return {
      ok: false,
      issue: {
        issueId: "menu-target.missing-target",
        category: "menu-target",
        severity: "error",
        affectedPath: input.sourceRefRoot,
        component: "ide-mirror-writer",
        details: {
          reason: "missing-skill-md",
        },
        impact: "The canonical skill package cannot be mapped because SKILL.md is missing.",
        suggestedNextStep: "Restore SKILL.md in the canonical source package before installing IDE skill entries.",
      },
    };
  }
  const copiedSourceFiles = sourceFiles.filter(isInstallableCanonicalPackageFile);
  const copiedFiles: FilesIndexEntry[] = [];

  const targetRoot = await ensureSafeDirectory({
    projectRoot: input.projectRoot,
    relativePath: input.targetEntryRoot,
    component: "ide-mirror-writer",
  });
  if (!targetRoot.ok) return targetRoot;

  for (const relativeFile of copiedSourceFiles) {
    const sourceFile = path.join(input.sourcePackageRoot, relativeFile);
    const targetPath = `${input.targetEntryRoot}/${relativeFile}`;
    const sourceStat = await stat(sourceFile);
    const executable = isExecutableMode(sourceStat.mode);
    const contents = await readFile(sourceFile);
    const write = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: targetPath,
      contents,
      executable,
      component: "ide-mirror-writer",
    });

    if (!write.ok) return write;
    input.onChangedPath?.(write.path);

    copiedFiles.push({
      schemaVersion: "speclite.files-index.v1",
      path: targetPath,
      ownership: "installer-owned",
      hash: await hashFile(sourceFile),
      hashAlgorithm: "sha256",
      executable,
      artifactKind: "ide-skill-package",
      sourceRef: `${input.sourceRefRoot}/${relativeFile}`,
    });
  }

  return {
    ok: true,
    files: copiedFiles,
  };
}

export function isInstallableCanonicalPackageFile(relativeFile: string): boolean {
  if (relativeFile === REQUIRED_CANONICAL_PACKAGE_FILE) return true;
  if (OPTIONAL_CANONICAL_PACKAGE_FILES.has(relativeFile)) return true;
  return OPTIONAL_CANONICAL_PACKAGE_DIRECTORIES.some((directory) =>
    relativeFile.startsWith(directory),
  );
}
