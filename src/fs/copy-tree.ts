import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { FilesIndexEntry } from "../manifest/manifest-schema.js";
import { hashFile, isExecutableMode, listFiles } from "../manifest/hash.js";
import { ensureSafeDirectory, safeWriteFile } from "./safe-write.js";

export async function copyCanonicalPackage(input: {
  projectRoot: string;
  sourcePackageRoot: string;
  sourceRefRoot: string;
  targetEntryRoot: string;
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
  const copiedFiles: FilesIndexEntry[] = [];

  const targetRoot = await ensureSafeDirectory({
    projectRoot: input.projectRoot,
    relativePath: input.targetEntryRoot,
    component: "ide-mirror-writer",
  });
  if (!targetRoot.ok) return targetRoot;

  for (const relativeFile of sourceFiles) {
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
