import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hashFile } from "../src/manifest/hash.js";
import type { FilesIndex } from "../src/manifest/manifest-schema.js";
import { validateFileIntegrity } from "../src/validation/rules/file-integrity.js";

describe("file integrity ownership diagnostics", () => {
  it("reports protected boundary mismatches without suggesting overwrite of human-owned or workflow-owned files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-file-integrity-ownership-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/custom"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/custom/config.toml"), "# human\n", "utf8");
      await writeFile(path.join(tempRoot, "_speclite-output/report.md"), "# workflow\n", "utf8");

      const result = await validateFileIntegrity({
        projectRoot: tempRoot,
        filesIndex: {
          schemaVersion: "speclite.files-index.v1",
          entries: [
            entry({
              path: "_speclite/custom/config.toml",
              ownership: "installer-owned",
              hash: await hashFile(path.join(tempRoot, "_speclite/custom/config.toml")),
            }),
            entry({
              path: "_speclite-output/report.md",
              ownership: "installer-owned",
              hash: await hashFile(path.join(tempRoot, "_speclite-output/report.md")),
            }),
          ],
        },
      });

      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: "_speclite-output/report.md",
          details: expect.objectContaining({
            ownership: "installer-owned",
            classifiedOwnership: "workflow-owned",
            reason: "unsafe-overwrite-risk",
          }),
        }),
        expect.objectContaining({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: "_speclite/custom/config.toml",
          details: expect.objectContaining({
            ownership: "installer-owned",
            classifiedOwnership: "human-owned",
            reason: "unsafe-overwrite-risk",
          }),
        }),
      ]);
      for (const issue of result.issues) {
        expect(issue.suggestedNextStep).not.toMatch(/\b(delete|overwrite|remove)\b/i);
      }
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports stable case-conflict diagnostics before hash checks", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-file-integrity-case-"));

    try {
      const filesIndex: FilesIndex = {
        schemaVersion: "speclite.files-index.v1",
        entries: [
          entry({ path: "_speclite/Config.toml", hash: "sha256:upper" }),
          entry({ path: "_speclite/config.toml", hash: "sha256:lower" }),
        ],
      };

      const result = await validateFileIntegrity({ projectRoot: tempRoot, filesIndex });

      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.case-conflict",
          affectedPath: "_speclite/Config.toml",
          details: expect.objectContaining({
            reason: "case-conflict",
            conflictingPath: "_speclite/config.toml",
          }),
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses configured artifact root for unsafe overwrite diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-file-integrity-artifact-root-"));

    try {
      await mkdir(path.join(tempRoot, ".artifacts"), { recursive: true });
      await writeFile(path.join(tempRoot, ".artifacts/report.md"), "# workflow\n", "utf8");

      const result = await validateFileIntegrity({
        projectRoot: tempRoot,
        artifactRoot: ".artifacts",
        filesIndex: {
          schemaVersion: "speclite.files-index.v1",
          entries: [
            entry({
              path: ".artifacts/report.md",
              ownership: "installer-owned",
              hash: await hashFile(path.join(tempRoot, ".artifacts/report.md")),
            }),
          ],
        },
      });

      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.unsafe-overwrite-risk",
          affectedPath: ".artifacts/report.md",
          details: expect.objectContaining({
            ownership: "installer-owned",
            classifiedOwnership: "workflow-owned",
            reason: "unsafe-overwrite-risk",
          }),
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("validates installed flow gate hook runner presence and drift through files-index", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-file-integrity-hook-"));

    try {
      const runnerPath = "_speclite/hooks/flow-gate-enforcement/runner.mjs";
      await mkdir(path.join(tempRoot, "_speclite/hooks/flow-gate-enforcement"), { recursive: true });
      await writeFile(path.join(tempRoot, runnerPath), "#!/usr/bin/env node\nconsole.log('ok');\n", "utf8");
      const originalHash = await hashFile(path.join(tempRoot, runnerPath));
      await writeFile(path.join(tempRoot, runnerPath), "#!/usr/bin/env node\nconsole.log('drift');\n", "utf8");

      const driftResult = await validateFileIntegrity({
        projectRoot: tempRoot,
        filesIndex: {
          schemaVersion: "speclite.files-index.v1",
          entries: [
            entry({
              path: runnerPath,
              hash: originalHash,
              artifactKind: "hook-runner",
              sourceRef: "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs",
              executable: true,
            }),
          ],
        },
      });

      expect(driftResult.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.hash-mismatch",
          affectedPath: runnerPath,
          details: expect.objectContaining({
            artifactKind: "hook-runner",
            reason: "hash-mismatch",
          }),
        }),
      ]);

      await rm(path.join(tempRoot, runnerPath));
      const missingResult = await validateFileIntegrity({
        projectRoot: tempRoot,
        filesIndex: {
          schemaVersion: "speclite.files-index.v1",
          entries: [
            entry({
              path: runnerPath,
              hash: originalHash,
              artifactKind: "hook-runner",
              sourceRef: "assets/source/speclite/hooks/flow-gate-enforcement/runner.mjs",
              executable: true,
            }),
          ],
        },
      });

      expect(missingResult.issues).toEqual([
        expect.objectContaining({
          issueId: "file-integrity.missing-installer-owned-file",
          affectedPath: runnerPath,
          details: expect.objectContaining({
            artifactKind: "hook-runner",
            reason: "missing-installer-owned-file",
          }),
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function entry(input: {
  path: string;
  hash: string;
  ownership?: "installer-owned" | "human-owned" | "workflow-owned";
  executable?: boolean;
  artifactKind?: string;
  sourceRef?: string;
}): FilesIndex["entries"][number] {
  return {
    schemaVersion: "speclite.files-index.v1",
    path: input.path,
    ownership: input.ownership ?? "installer-owned",
    hash: input.hash,
    hashAlgorithm: "sha256",
    executable: input.executable ?? false,
    artifactKind: input.artifactKind ?? "runtime-config",
    sourceRef: input.sourceRef ?? "installed-state:runtime-config",
  };
}
