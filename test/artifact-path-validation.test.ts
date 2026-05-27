import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateArtifactPathContract } from "../src/validation/rules/artifact-path.js";

describe("artifact path validation", () => {
  it("accepts project-relative artifact paths and required metadata value domains", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-ok-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite-output/planning-artifacts/prd.md"), "# PRD\n", "utf8");

      await expect(
        validateArtifactPathContract({
          projectRoot: tempRoot,
          configuredRoot: "_speclite-output/planning-artifacts",
          defaultOutputPath: "_speclite-output/planning-artifacts",
          actualArtifactPath: "_speclite-output/planning-artifacts/prd.md",
          artifactType: "prd",
          metadata: {
            workflowType: "create-prd",
            sourceSkill: "speclite-create-prd",
            generatedAt: "2026-05-27T06:00:00.000Z",
          },
          metadataLocation: "frontmatter",
        }),
      ).resolves.toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports reserved artifact-path diagnostics for escaping and symlink paths", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-bad-"));
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-outside-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output"), { recursive: true });
      await symlink(outsideRoot, path.join(tempRoot, "_speclite-output/link"));

      const escaping = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output",
        defaultOutputPath: "_speclite-output",
        actualArtifactPath: "../outside/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "dev-story",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-05-27T06:00:00.000Z",
        },
        metadataLocation: "frontmatter",
      });
      expect(escaping).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:actualArtifactPath",
          details: expect.objectContaining({
            pathRole: "actualArtifactPath",
          }),
        }),
      ]);
      expect(JSON.stringify(escaping)).not.toContain(tempRoot);

      const symlinkIssue = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output",
        defaultOutputPath: "_speclite-output",
        actualArtifactPath: "_speclite-output/link/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "dev-story",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-05-27T06:00:00.000Z",
        },
        metadataLocation: "frontmatter",
      });
      expect(symlinkIssue.map((issue) => issue.issueId)).toContain("artifact-path.symlink-escape");
      expect(JSON.stringify(symlinkIssue)).not.toContain(outsideRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
      await rm(outsideRoot, { recursive: true, force: true });
    }
  });

  it("reports missing directories and metadata violations with deterministic details", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-metadata-bad-"));

    try {
      const issues = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/reports",
        defaultOutputPath: "_speclite-output/reports",
        actualArtifactPath: "_speclite-output/reports/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "",
          sourceSkill: "Display Name",
          generatedAt: "not-a-date",
        },
        metadataLocation: "frontmatter",
      });

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "artifact-path.missing-required-directory",
            details: expect.objectContaining({
              pathRole: "configuredRoot",
            }),
          }),
          expect.objectContaining({
            issueId: "artifact-path.invalid-required-metadata",
            details: expect.objectContaining({
              metadataKeys: ["generatedAt", "sourceSkill", "workflowType"],
              artifactType: "report",
              metadataLocation: "frontmatter",
            }),
          }),
        ]),
      );
      expect(JSON.stringify(issues)).not.toContain(tempRoot);
      expect(JSON.stringify(issues)).not.toContain("not-a-date");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports artifact paths outside the configured artifact root", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-root-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/other"), { recursive: true });

      const issues = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/planning-artifacts",
        defaultOutputPath: "_speclite-output/planning-artifacts",
        actualArtifactPath: "_speclite-output/other/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "dev-story",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-05-27T06:00:00.000Z",
        },
        metadataLocation: "frontmatter",
      });

      expect(issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:actualArtifactPath",
          details: {
            pathRole: "actualArtifactPath",
            reason: "outside-configured-root",
          },
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("accepts configured-root sibling artifact paths outside the default output path", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-sibling-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/implementation-artifacts/story-reviews"), { recursive: true });
      await mkdir(path.join(tempRoot, "_speclite-output/implementation-artifacts/code-reviews"), { recursive: true });

      await expect(
        validateArtifactPathContract({
          projectRoot: tempRoot,
          configuredRoot: "_speclite-output/implementation-artifacts",
          defaultOutputPath: "_speclite-output/implementation-artifacts/story-reviews",
          actualArtifactPath: "_speclite-output/implementation-artifacts/code-reviews/2-5.md",
          artifactType: "code-review",
          metadata: {
            workflowType: "code-review",
            sourceSkill: "speclite-code-review-01-reviewer",
            generatedAt: "2026-05-27T06:00:00.000Z",
          },
          metadataLocation: "frontmatter",
        }),
      ).resolves.toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports non-POSIX public artifact paths before filesystem normalization", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-path-posix-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/planning-artifacts"), { recursive: true });

      const baseInput = {
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/planning-artifacts",
        defaultOutputPath: "_speclite-output/planning-artifacts",
        actualArtifactPath: "_speclite-output/planning-artifacts/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "dev-story",
          sourceSkill: "speclite-dev-story",
          generatedAt: "2026-05-27T06:00:00.000Z",
        },
        metadataLocation: "frontmatter" as const,
      };

      const configuredRootIssues = await validateArtifactPathContract({
        ...baseInput,
        configuredRoot: "_speclite-output\\planning-artifacts",
      });
      expect(configuredRootIssues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:configuredRoot",
          details: {
            pathRole: "configuredRoot",
            reason: "invalid-project-relative-posix-path",
          },
        }),
      ]);

      const defaultOutputPathIssues = await validateArtifactPathContract({
        ...baseInput,
        defaultOutputPath: "_speclite-output\\planning-artifacts",
      });
      expect(defaultOutputPathIssues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:defaultOutputPath",
          details: {
            pathRole: "defaultOutputPath",
            reason: "invalid-project-relative-posix-path",
          },
        }),
      ]);

      const actualArtifactPathIssues = await validateArtifactPathContract({
        ...baseInput,
        actualArtifactPath: "_speclite-output\\planning-artifacts\\report.md",
      });
      expect(actualArtifactPathIssues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.escapes-project",
          affectedPath: "artifact:actualArtifactPath",
          details: {
            pathRole: "actualArtifactPath",
            reason: "invalid-project-relative-posix-path",
          },
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses missing-required-metadata when required metadata is absent", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-artifact-metadata-missing-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite-output/reports"), { recursive: true });
      const issues = await validateArtifactPathContract({
        projectRoot: tempRoot,
        configuredRoot: "_speclite-output/reports",
        defaultOutputPath: "_speclite-output/reports",
        actualArtifactPath: "_speclite-output/reports/report.md",
        artifactType: "report",
        metadata: {
          workflowType: "dev-story",
        },
        metadataLocation: "frontmatter",
      });

      expect(issues).toEqual([
        expect.objectContaining({
          issueId: "artifact-path.missing-required-metadata",
          details: {
            artifactType: "report",
            metadataKeys: ["generatedAt", "sourceSkill"],
            metadataLocation: "frontmatter",
          },
        }),
      ]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
