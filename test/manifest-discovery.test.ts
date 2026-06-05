import { describe, expect, it } from "vitest";
import {
  CANONICAL_TARGET_ORDER,
  getIdeAdapterRegistry,
} from "../src/ide/adapter-registry.js";
import { renderPhaseCoverageEvidence } from "../src/diagnostics/output.js";
import {
  createArtifactContract,
  createInstalledSkillActivationTarget,
  createPhaseCoverage,
  getPhaseLabel,
  type ArtifactRootContext,
} from "../src/manifest/manifest-generator.js";
import {
  HelpIndexEntrySchema,
  PhaseCoverageRowSchema,
  type PhaseCoverageRow,
} from "../src/manifest/manifest-schema.js";

const artifactRoots: ArtifactRootContext = {
  output_folder: "_speclite-output",
  planning_artifacts: "_speclite-output/planning-artifacts",
  implementation_artifacts: "_speclite-output/implementation-artifacts",
  devops_artifacts: "_speclite-output/devops-artifacts",
  project_knowledge: "docs",
};

describe("methodology discovery metadata generation", () => {
  it("keeps the MVP IDE adapter registry constrained to canonical target order", () => {
    const registry = getIdeAdapterRegistry();

    expect(CANONICAL_TARGET_ORDER).toEqual(["claude", "agents"]);
    expect(registry.map((adapter) => adapter.id)).toEqual(["claude", "agents"]);
    expect(registry.map((adapter) => adapter.targetDirectory)).toEqual([
      ".claude/skills",
      ".agents/skills",
    ]);
    expect(registry).toEqual([
      expect.objectContaining({
        id: "claude",
        entryType: "self-contained-skill",
        sharedTargetPolicy: "dedupe-by-canonical-skill-id",
        commandPointerBehavior: "none",
        targetOrder: 0,
      }),
      expect.objectContaining({
        id: "agents",
        entryType: "self-contained-skill",
        sharedTargetPolicy: "dedupe-by-canonical-skill-id",
        commandPointerBehavior: "none",
        targetOrder: 1,
      }),
    ]);
    expect(JSON.stringify(registry)).not.toContain("copilot");
    expect(JSON.stringify(registry)).not.toContain("cursor");
    expect(JSON.stringify(registry)).not.toContain("command-pointer");
  });

  it("normalizes eligible artifact contracts and omits non-workflow output locations", () => {
    expect(
      createArtifactContract({
        outputLocation: "{planning_artifacts}",
        outputArtifactType: "prd",
        artifactRoots,
      }),
    ).toEqual({
      artifactType: "prd",
      defaultOutputPath: "_speclite-output/planning-artifacts",
      requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
    });
    expect(
      createArtifactContract({
        outputLocation: "{implementation_artifacts}/story-reviews",
        outputArtifactType: "story review summary",
        artifactRoots,
      }),
    ).toEqual({
      artifactType: "story-review-summary",
      defaultOutputPath: "_speclite-output/implementation-artifacts/story-reviews",
      requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
    });
    expect(
      createArtifactContract({
        outputLocation: "{output_folder}/./reports\\weekly",
        outputArtifactType: "weekly report",
        artifactRoots,
      }),
    ).toEqual({
      artifactType: "weekly-report",
      defaultOutputPath: "_speclite-output/reports/weekly",
      requiredMetadata: ["workflowType", "sourceSkill", "generatedAt"],
    });
    expect(
      createArtifactContract({
        outputLocation: "{planning_artifacts}|{project_knowledge}",
        outputArtifactType: "research documents",
        artifactRoots,
      }),
    ).toBeUndefined();
    expect(
      createArtifactContract({
        outputLocation: "{project-root}/_speclite/custom",
        outputArtifactType: "TOML override files",
        artifactRoots,
      }),
    ).toBeUndefined();
  });

  it("omits artifact contracts for escaping paths and unstable artifact types", () => {
    expect(
      createArtifactContract({
        outputLocation: "{output_folder}/../outside",
        outputArtifactType: "report",
        artifactRoots,
      }),
    ).toBeUndefined();
    expect(
      createArtifactContract({
        outputLocation: "{project_knowledge}",
        outputArtifactType: "*",
        artifactRoots,
      }),
    ).toBeUndefined();
    expect(
      createArtifactContract({
        outputLocation: "{project-root}/_speclite/_memory",
        outputArtifactType: "memory",
        artifactRoots,
      }),
    ).toBeUndefined();
    expect(
      createArtifactContract({
        outputLocation: "{planning_artifacts}",
        outputArtifactType: "*",
        artifactRoots,
      }),
    ).toBeUndefined();
  });

  it("sorts phase coverage rows by contract keys and keeps phase labels centralized", () => {
    const rows: PhaseCoverageRow[] = [
      createRow("4-implementation", "sdlc", "speclite-dev-story"),
      createRow("2-planning", "sdlc", "speclite-create-prd"),
      createRow("3-solutioning", "sdlc", "speclite-check-implementation-readiness"),
    ];

    expect(createPhaseCoverage(rows).rows.map((row) => row.canonicalSkillId)).toEqual([
      "speclite-create-prd",
      "speclite-check-implementation-readiness",
      "speclite-dev-story",
    ]);
    expect(getPhaseLabel("2-planning")).toBe("Planning");
    expect(getPhaseLabel("3-solutioning")).toBe("Solutioning");
    expect(getPhaseLabel("4-implementation")).toBe("Implementation");
  });

  it("validates installed activation targets as project-relative SKILL.md paths", () => {
    expect(
      createInstalledSkillActivationTarget({
        targetId: "claude",
        canonicalSkillId: "speclite-dev-story",
      }),
    ).toBe(".claude/skills/speclite-dev-story/SKILL.md");
    expect(
      HelpIndexEntrySchema.safeParse({
        schemaVersion: "speclite.help-index.v1",
        phaseId: "4-implementation",
        entryLabel: "Dev Story",
        canonicalSkillId: "speclite-dev-story",
        activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        targetIds: ["claude", "agents"],
      }).success,
    ).toBe(true);

    for (const activationTarget of [
      ".claude/skills/speclite-dev-story",
      "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story/SKILL.md",
      "/tmp/speclite-dev-story/SKILL.md",
      "C:/workspace/.claude/skills/speclite-dev-story/SKILL.md",
      ".claude\\skills\\speclite-dev-story\\SKILL.md",
      "../.claude/skills/speclite-dev-story/SKILL.md",
    ]) {
      expect(
        HelpIndexEntrySchema.safeParse({
          schemaVersion: "speclite.help-index.v1",
          phaseId: "4-implementation",
          entryLabel: "Dev Story",
          canonicalSkillId: "speclite-dev-story",
          activationTarget,
          targetIds: ["claude"],
        }).success,
      ).toBe(false);
    }
  });

  it("keeps installed phase coverage status vocabulary separate from other target layers", () => {
    const validRow = createRow("4-implementation", "sdlc", "speclite-dev-story");

    for (const status of ["mapped", "unsupported", "failed"]) {
      expect(
        PhaseCoverageRowSchema.safeParse({
          ...validRow,
          ideTargets: [{ ...validRow.ideTargets[0], status }],
        }).success,
      ).toBe(true);
    }

    for (const status of ["planned", "not-configured", "configured", "partial"]) {
      expect(
        PhaseCoverageRowSchema.safeParse({
          ...validRow,
          ideTargets: [{ ...validRow.ideTargets[0], status }],
        }).success,
      ).toBe(false);
    }
  });

  it("renders phase coverage evidence without recomputing coverage or branded targets", () => {
    const output = renderPhaseCoverageEvidence(
      createPhaseCoverage([
        createRow("4-implementation", "sdlc", "speclite-dev-story"),
        {
          ...createRow("4-implementation", "sdlc", "speclite-qa-generate-e2e-tests"),
          ideTargets: [
            {
              targetId: "agents",
              entryPath: ".agents/skills/speclite-qa-generate-e2e-tests",
              activationTarget: ".agents/skills/speclite-qa-generate-e2e-tests/SKILL.md",
              status: "unsupported",
            },
          ],
        },
      ]),
    );

    expect(output).toContain("Phase coverage evidence");
    expect(output).toContain("phase=4-implementation");
    expect(output).toContain("target=claude");
    expect(output).toContain("entryPath=.claude/skills/speclite-dev-story");
    expect(output).toContain("activationTarget=.claude/skills/speclite-dev-story/SKILL.md");
    expect(output).toContain("status=unsupported");
    expect(output).toContain("nextAction=Run speclite validate");
    expect(output).not.toContain("Copilot");
    expect(output).not.toContain("Cursor");
    expect(output).not.toContain("%");
  });
});

function createRow(
  phaseId: string,
  moduleId: string,
  canonicalSkillId: string,
): PhaseCoverageRow {
  return {
    schemaVersion: "speclite.phase-coverage.v1",
    phaseId,
    phaseLabel: getPhaseLabel(phaseId),
    moduleId,
    canonicalSkillId,
    ideTargets: [
      {
        targetId: "claude",
        entryPath: `.claude/skills/${canonicalSkillId}`,
        activationTarget: `.claude/skills/${canonicalSkillId}/SKILL.md`,
        status: "mapped",
      },
      {
        targetId: "agents",
        entryPath: `.agents/skills/${canonicalSkillId}`,
        activationTarget: `.agents/skills/${canonicalSkillId}/SKILL.md`,
        status: "mapped",
      },
    ],
  };
}
