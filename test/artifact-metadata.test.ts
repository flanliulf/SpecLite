import { describe, expect, it } from "vitest";
import { renderArtifactEvidence } from "../src/diagnostics/output.js";
import {
  createWorkflowArtifactMetadata,
  getWorkflowArtifactMetadataLocation,
  isWorkflowOwnedArtifactPath,
  normalizeWorkflowArtifactMetadataForSnapshot,
  parseWorkflowArtifactMetadata,
  readMarkdownWorkflowArtifactMetadata,
  serializeWorkflowArtifactMetadataSidecar,
  writeMarkdownWorkflowArtifactMetadata,
} from "../src/validation/artifact-metadata.js";

describe("workflow artifact metadata encoding", () => {
  const metadata = createWorkflowArtifactMetadata({
    workflowType: "dev-story",
    sourceSkill: "speclite-dev-story",
    generatedAt: "2026-05-27T06:00:00.000Z",
  });

  it("writes required metadata into a single leading Markdown frontmatter block", () => {
    const written = writeMarkdownWorkflowArtifactMetadata({
      contents: "# Story Review\n\n正文保持不变。\n",
      metadata,
    });

    expect(written.startsWith("---\n")).toBe(true);
    expect(written.match(/^---$/gm)).toHaveLength(2);
    expect(written).toContain("workflowType: dev-story");
    expect(written).toContain("sourceSkill: speclite-dev-story");
    expect(written).toContain("generatedAt: 2026-05-27T06:00:00.000Z");
    expect(written.endsWith("# Story Review\n\n正文保持不变。\n")).toBe(true);
    expect(readMarkdownWorkflowArtifactMetadata(written)).toEqual(metadata);
  });

  it("merges existing workflow state frontmatter without creating a second block", () => {
    const written = writeMarkdownWorkflowArtifactMetadata({
      contents: "---\nstatus: draft\nowner: human\n---\n# Existing\n\n保留正文。\n",
      metadata,
    });

    expect(written.match(/^---$/gm)).toHaveLength(2);
    expect(written).toContain("status: draft");
    expect(written).toContain("owner: human");
    expect(written).toContain("workflowType: dev-story");
    expect(written.endsWith("# Existing\n\n保留正文。\n")).toBe(true);
    expect(readMarkdownWorkflowArtifactMetadata(written)).toEqual(metadata);
  });

  it("uses deterministic sidecar paths and excludes generatedAt from stable snapshots", () => {
    expect(
      getWorkflowArtifactMetadataLocation({
        artifactPath: "_speclite-output/report.json",
        artifactKind: "file",
      }),
    ).toEqual({
      locationType: "sidecar",
      metadataPath: "_speclite-output/report.json.metadata.json",
    });
    expect(
      getWorkflowArtifactMetadataLocation({
        artifactPath: "_speclite-output/review-output",
        artifactKind: "directory",
      }),
    ).toEqual({
      locationType: "sidecar",
      metadataPath: "_speclite-output/review-output/metadata.json",
    });

    expect(JSON.parse(serializeWorkflowArtifactMetadataSidecar(metadata))).toEqual(metadata);
    expect(normalizeWorkflowArtifactMetadataForSnapshot(metadata)).toEqual({
      workflowType: "dev-story",
      sourceSkill: "speclite-dev-story",
      generatedAt: "<iso8601>",
    });
  });

  it("rejects display names and invalid timestamps in required metadata fields", () => {
    expect(
      parseWorkflowArtifactMetadata({
        workflowType: "dev-story",
        sourceSkill: "Dev Story",
        generatedAt: "2026-05-27T06:00:00.000Z",
      }).success,
    ).toBe(false);
    expect(
      parseWorkflowArtifactMetadata({
        workflowType: "dev-story",
        sourceSkill: "speclite-dev-story",
        generatedAt: "May 27 2026",
      }).success,
    ).toBe(false);
  });

  it("identifies workflow-owned artifact and sidecar paths inside configured artifact roots", () => {
    const artifactRoots = [
      "_speclite-output",
      "_speclite-output/planning-artifacts",
      "_speclite-output/implementation-artifacts",
    ];

    expect(
      isWorkflowOwnedArtifactPath({
        relativePath: "_speclite-output/planning-artifacts/prd.md",
        artifactRoots,
      }),
    ).toBe(true);
    expect(
      isWorkflowOwnedArtifactPath({
        relativePath: "_speclite-output/planning-artifacts/prd.md.metadata.json",
        artifactRoots,
      }),
    ).toBe(true);
    expect(
      isWorkflowOwnedArtifactPath({
        relativePath: "_speclite/_config/phase-coverage.json",
        artifactRoots,
      }),
    ).toBe(false);
    expect(
      isWorkflowOwnedArtifactPath({
        relativePath: ".claude/skills/speclite-dev-story/SKILL.md",
        artifactRoots,
      }),
    ).toBe(false);
  });
});

describe("artifact evidence output", () => {
  it("renders contracted artifact evidence without dashboard metrics", () => {
    const output = renderArtifactEvidence([
      {
        artifactPath: "_speclite-output/implementation-artifacts/code-reviews/2-5/report.md",
        artifactType: "story-review-summary",
        workflowType: "dev-story",
        sourceSkill: "speclite-dev-story",
        generatedAt: "2026-05-27T06:00:00.000Z",
        configuredRoot: "_speclite-output/implementation-artifacts",
        defaultOutputPath: "_speclite-output/implementation-artifacts/code-reviews",
        metadataLocation: "frontmatter",
      },
    ]);

    expect(output).toContain("Artifact evidence");
    expect(output).toContain(
      "artifactPath=_speclite-output/implementation-artifacts/code-reviews/2-5/report.md",
    );
    expect(output).toContain("metadataLocation=frontmatter");
    expect(output).toContain("sourceSkill=speclite-dev-story");
    expect(output).not.toContain("%");
    expect(output).not.toContain("dashboard");
  });
});
