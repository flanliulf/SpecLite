import { mkdir, mkdtemp, readFile, readdir, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runValidateCommand } from "../src/commands/validate.js";
import { isInstallableCanonicalPackageFile } from "../src/fs/copy-tree.js";
import { isCanonicalPackageHashFile } from "../src/validation/rules/ide-mirror.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const sourceRoot = path.join(process.cwd(), "assets/source/speclite");
const targetRoots = [".claude/skills", ".agents/skills"] as const;

describe("installed skill root-level data projection", () => {
  it("uses the same installable surface for copy and package hash predicates", () => {
    expect(isInstallableCanonicalPackageFile("data/project-types.csv")).toBe(true);
    expect(isCanonicalPackageHashFile("data/project-types.csv")).toBe(true);
    expect(isInstallableCanonicalPackageFile("data/domain-complexity.csv")).toBe(true);
    expect(isCanonicalPackageHashFile("data/domain-complexity.csv")).toBe(true);
    expect(isInstallableCanonicalPackageFile("references/data/prd-purpose.md")).toBe(true);
    expect(isCanonicalPackageHashFile("references/data/prd-purpose.md")).toBe(true);
    expect(isInstallableCanonicalPackageFile("SKILL.en.md")).toBe(false);
    expect(isCanonicalPackageHashFile("SKILL.en.md")).toBe(false);
  });

  it("installs every canonical root-level data file into both IDE entries and files-index", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-installed-data-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "installed-data-surface",
        },
      });

      expect(outcome.exitCode).toBe(0);
      const filesIndex = await readJson<{
        entries: Array<{
          path: string;
          ownership: string;
          artifactKind: string;
          sourceRef: string;
        }>;
      }>(path.join(tempRoot, "_speclite/_config/files-index.json"));
      const filesByPath = new Map(filesIndex.entries.map((entry) => [entry.path, entry]));
      const rootDataFiles = await discoverRootDataFiles();

      expect(rootDataFiles.length).toBe(11);
      expect(rootDataFiles.map((entry) => `${entry.canonicalSkillId}/${entry.relativeFile}`)).toEqual([
        "speclite-document-project/data/documentation-requirements.csv",
        "speclite-document-project/data/project-types.csv",
        "speclite-prfaq/data/speclite-manifest.json",
        "speclite-product-brief/data/speclite-manifest.json",
        "speclite-create-prd/data/domain-complexity.csv",
        "speclite-create-prd/data/project-types.csv",
        "speclite-edit-prd/data/project-types.csv",
        "speclite-validate-prd/data/domain-complexity.csv",
        "speclite-validate-prd/data/project-types.csv",
        "speclite-create-architecture/data/domain-complexity.csv",
        "speclite-create-architecture/data/project-types.csv",
      ]);

      for (const dataFile of rootDataFiles) {
        const sourceBytes = await readFile(path.join(sourceRoot, dataFile.sourcePackagePath, dataFile.relativeFile));
        for (const targetRoot of targetRoots) {
          const installedPath = `${targetRoot}/${dataFile.canonicalSkillId}/${dataFile.relativeFile}`;
          await expect(readFile(path.join(tempRoot, installedPath))).resolves.toEqual(sourceBytes);
          expect(filesByPath.get(installedPath)).toMatchObject({
            path: installedPath,
            ownership: "installer-owned",
            artifactKind: "ide-skill-package",
            sourceRef: `assets/source/speclite/${dataFile.sourcePackagePath}/${dataFile.relativeFile}`,
          });
        }
      }

      for (const targetRoot of targetRoots) {
        expect(filesByPath.get(`${targetRoot}/speclite-create-prd/data/domain-complexity.csv`)).toBeDefined();
        expect(filesByPath.get(`${targetRoot}/speclite-create-prd/data/project-types.csv`)).toBeDefined();
        expect(filesByPath.get(`${targetRoot}/speclite-validate-prd/data/domain-complexity.csv`)).toBeDefined();
        expect(filesByPath.get(`${targetRoot}/speclite-validate-prd/data/project-types.csv`)).toBeDefined();
        expect(filesByPath.get(`${targetRoot}/speclite-create-prd/references/data/prd-purpose.md`)).toBeDefined();
      }

      const validate = await runValidateCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "installed-data-surface",
        },
      });
      expect(validate.result.issues.filter((issue) => issue.category === "ide-mirror")).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("reports ide mirror drift when an installed root-level data file is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-installed-data-drift-"));

    try {
      await writeFile(path.join(tempRoot, "README.md"), "project notes\n", "utf8");
      const install = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "installed-data-drift",
        },
      });
      expect(install.exitCode).toBe(0);

      await unlink(path.join(tempRoot, ".claude/skills/speclite-create-prd/data/project-types.csv"));
      const validate = await runValidateCommand({
        runtime: {
          cwd: tempRoot,
          targetProject: "installed-data-drift",
        },
      });

      expect(validate.exitCode).toBe(1);
      expect(validate.result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "ide-mirror.hash-mismatch",
            category: "ide-mirror",
            severity: "error",
            affectedPath: ".claude/skills/speclite-create-prd",
            details: expect.objectContaining({
              targetId: "claude",
              canonicalSkillId: "speclite-create-prd",
              reason: "hash-mismatch",
            }),
          }),
          expect.objectContaining({
            issueId: "file-integrity.missing-installer-owned-file",
            category: "file-integrity",
            affectedPath: ".claude/skills/speclite-create-prd/data/project-types.csv",
          }),
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }, 15_000);
});

async function discoverRootDataFiles(): Promise<Array<{
  canonicalSkillId: string;
  sourcePackagePath: string;
  relativeFile: string;
}>> {
  const skillRoots: Array<{ canonicalSkillId: string; sourcePackagePath: string }> = [];
  await collectSkillRoots(sourceRoot, "", skillRoots);
  const dataFiles = (
    await Promise.all(skillRoots.map(async (skillRoot) => {
      const dataRoot = path.join(sourceRoot, skillRoot.sourcePackagePath, "data");
      const files = await listRegularFiles(dataRoot, "data");
      return files.map((relativeFile) => ({
        ...skillRoot,
        relativeFile,
      }));
    }))
  ).flat();

  return dataFiles.sort((left, right) =>
    `${left.sourcePackagePath}/${left.relativeFile}`.localeCompare(
      `${right.sourcePackagePath}/${right.relativeFile}`,
    ),
  );
}

async function collectSkillRoots(
  absoluteRoot: string,
  relativeRoot: string,
  result: Array<{ canonicalSkillId: string; sourcePackagePath: string }>,
): Promise<void> {
  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
    result.push({
      canonicalSkillId: path.posix.basename(relativeRoot),
      sourcePackagePath: relativeRoot,
    });
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const childRelative = relativeRoot === "" ? entry.name : `${relativeRoot}/${entry.name}`;
    await collectSkillRoots(path.join(absoluteRoot, entry.name), childRelative, result);
  }
}

async function listRegularFiles(absoluteRoot: string, relativeRoot: string): Promise<string[]> {
  try {
    const entries = await readdir(absoluteRoot, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const childAbsolute = path.join(absoluteRoot, entry.name);
      const childRelative = `${relativeRoot}/${entry.name}`;
      if (entry.isDirectory()) return listRegularFiles(childAbsolute, childRelative);
      if (entry.isFile()) return [childRelative];
      return [];
    }));
    return files.flat().sort();
  } catch {
    return [];
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}
