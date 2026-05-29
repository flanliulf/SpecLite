import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateRuntimePaths } from "../src/validation/rules/runtime-path.js";
import type { FilesIndex, Manifest } from "../src/manifest/manifest-schema.js";

const manifest: Manifest = {
  schemaVersion: "speclite.manifest.v1",
  sourceDescriptor: {
    sourceType: "bundled",
    channel: "stable",
    version: "0.0.0",
    resolvedRoot: "assets/source/speclite",
    integrityEvidence: [],
    trustStatus: "trusted",
  },
  installedModules: ["core"],
  targetIds: ["claude", "agents"],
  paths: {
    projectRoot: ".",
    specliteRoot: "_speclite",
    artifactRoot: "_speclite-output",
    manifestPath: "_speclite/_config/manifest.yaml",
  },
};

describe("runtime path validation", () => {
  it("accepts current _speclite runtime metadata entries", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-path-ok-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.user.toml"), "", "utf8");

      await expect(
        validateRuntimePaths({
          projectRoot: tempRoot,
          manifest,
          filesIndex: createFilesIndex(),
        }),
      ).resolves.toMatchObject({ issues: [] });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports missing, invalid, legacy and symlink runtime path diagnostics without leaking absolute paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-path-bad-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-path-outside-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await symlink(outsideRoot, path.join(tempRoot, "_speclite/link"));
      const result = await validateRuntimePaths({
        projectRoot: tempRoot,
        manifest: {
          ...manifest,
          paths: {
            ...manifest.paths,
            specliteRoot: "_bmad" as "_speclite",
          },
        },
        filesIndex: createFilesIndex([
          {
            path: "C:/runtime/resolve.js",
            artifactKind: "runtime-script",
            sourceRef: "installed-state:runtime",
          },
          {
            path: "_bmad/config.yaml",
            artifactKind: "runtime-config",
            sourceRef: "_bmad/config.yaml",
          },
          {
            path: "_speclite/link/config.toml",
            artifactKind: "runtime-config",
            sourceRef: "installed-state:runtime",
          },
        ] as Array<Partial<FilesIndex["entries"][number]>>),
      });

      expect(result.issues.map((issue) => issue.issueId)).toEqual(
        expect.arrayContaining([
          "runtime-path.missing-entry",
          "runtime-path.invalid-script-path",
          "runtime-path.legacy-resolver-path",
          "runtime-path.symlink-escape",
        ]),
      );
      expect(JSON.stringify(result)).not.toContain(tempRoot);
      expect(JSON.stringify(result)).not.toContain(outsideRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("does not classify project-internal symlinks as runtime path escapes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-runtime-path-internal-link-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/real"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/config.user.toml"), "", "utf8");
      await writeFile(path.join(tempRoot, "_speclite/real/config.toml"), "", "utf8");
      await symlink("real", path.join(tempRoot, "_speclite/link"));

      const result = await validateRuntimePaths({
        projectRoot: tempRoot,
        manifest,
        filesIndex: createFilesIndex([
          { path: "_speclite/config.toml", artifactKind: "runtime-config" },
          { path: "_speclite/config.user.toml", artifactKind: "runtime-config" },
          {
            path: "_speclite/link/config.toml",
            artifactKind: "runtime-config",
            sourceRef: "installed-state:runtime",
          },
        ]),
      });

      expect(result.issues).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function createFilesIndex(
  entries: Array<Partial<FilesIndex["entries"][number]>> = [
    { path: "_speclite/config.toml", artifactKind: "runtime-config" },
    { path: "_speclite/config.user.toml", artifactKind: "runtime-config" },
  ],
): FilesIndex {
  return {
    schemaVersion: "speclite.files-index.v1",
    entries: entries.map((entry, index) => ({
      schemaVersion: "speclite.files-index.v1",
      path: entry.path ?? `_speclite/runtime-${index}.js`,
      ownership: entry.ownership ?? "installer-owned",
      hash: entry.hash ?? `sha256:runtime-${index}`,
      hashAlgorithm: "sha256",
      executable: entry.executable ?? false,
      artifactKind: entry.artifactKind ?? "runtime-config",
      sourceRef: entry.sourceRef ?? "installed-state:runtime",
    })),
  };
}
