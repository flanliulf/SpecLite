import { describe, expect, it } from "vitest";
import { validateMenuTargets } from "../src/validation/rules/menu-target.js";
import type {
  HelpIndex,
  PhaseCoverage,
  SkillIndex,
} from "../src/manifest/manifest-schema.js";

const skillIndex: SkillIndex = {
  schemaVersion: "speclite.skill-index.v1",
  entries: [
    {
      schemaVersion: "speclite.skill-index.v1",
      canonicalSkillId: "speclite-dev-story",
      moduleId: "sdlc",
      sourcePackagePath: "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
      canonicalPackageHash: "sha256:dev",
      installedTargets: ["claude", "agents"],
      phaseIds: ["4-implementation"],
    },
  ],
};

describe("menu target validation", () => {
  it("accepts a help entry that resolves to exactly one installed SKILL.md target", () => {
    expect(
      validateMenuTargets({
        skillIndex,
        helpIndex: createHelpIndex({
          canonicalSkillId: "speclite-dev-story",
          activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        }),
        phaseCoverage: createPhaseCoverage([
          {
            targetId: "claude",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
          {
            targetId: "agents",
            activationTarget: ".agents/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
        ]),
      }),
    ).toEqual([]);
  });

  it("reports reserved diagnostics for missing, ambiguous, unknown and no-mapped targets", () => {
    expect(
      validateMenuTargets({
        skillIndex,
        helpIndex: createHelpIndex({
          canonicalSkillId: "missing-skill",
          activationTarget: ".claude/skills/missing-skill/SKILL.md",
        }),
        phaseCoverage: createPhaseCoverage([]),
      }).map((issue) => issue.issueId),
    ).toContain("menu-target.unknown-skill");

    expect(
      validateMenuTargets({
        skillIndex,
        helpIndex: createHelpIndex({
          canonicalSkillId: "speclite-dev-story",
          activationTarget: ".claude/skills/speclite-dev-story",
        }),
        phaseCoverage: createPhaseCoverage([
          {
            targetId: "claude",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
        ]),
      }).map((issue) => issue.issueId),
    ).toContain("menu-target.missing-target");

    expect(
      validateMenuTargets({
        skillIndex,
        helpIndex: createHelpIndex({
          canonicalSkillId: "speclite-dev-story",
          activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        }),
        phaseCoverage: createPhaseCoverage([
          {
            targetId: "claude",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
          {
            targetId: "claude",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "mapped",
          },
        ]),
      }).map((issue) => issue.issueId),
    ).toContain("menu-target.ambiguous-target");

    expect(
      validateMenuTargets({
        skillIndex,
        helpIndex: createHelpIndex({
          canonicalSkillId: "speclite-dev-story",
          activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        }),
        phaseCoverage: createPhaseCoverage([
          {
            targetId: "claude",
            activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
            status: "unsupported",
          },
        ]),
      }).map((issue) => issue.issueId),
    ).toContain("menu-target.no-mapped-target");
  });

  it("rejects help and phase targets that are not present in skill-index installedTargets", () => {
    const agentsOnlySkillIndex: SkillIndex = {
      ...skillIndex,
      entries: [
        {
          ...skillIndex.entries[0]!,
          installedTargets: ["agents"],
        },
      ],
    };

    const issues = validateMenuTargets({
      skillIndex: agentsOnlySkillIndex,
      helpIndex: createHelpIndex({
        canonicalSkillId: "speclite-dev-story",
        activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
        targetIds: ["claude"],
      }),
      phaseCoverage: createPhaseCoverage([
        {
          targetId: "claude",
          activationTarget: ".claude/skills/speclite-dev-story/SKILL.md",
          status: "mapped",
        },
      ]),
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/help-index.json",
          details: expect.objectContaining({
            activationTargetId: "claude",
            reason: "uninstalled-target",
          }),
        }),
        expect.objectContaining({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/phase-coverage.json",
          details: expect.objectContaining({
            targetId: "claude",
            reason: "uninstalled-target",
          }),
        }),
      ]),
    );
  });

  it("rejects help and phase targets that point at another canonical skill directory", () => {
    const issues = validateMenuTargets({
      skillIndex,
      helpIndex: createHelpIndex({
        canonicalSkillId: "speclite-dev-story",
        activationTarget: ".claude/skills/other-skill/SKILL.md",
        targetIds: ["claude"],
      }),
      phaseCoverage: createPhaseCoverage([
        {
          targetId: "claude",
          entryPath: ".claude/skills/other-skill",
          activationTarget: ".claude/skills/other-skill/SKILL.md",
          status: "mapped",
        },
      ]),
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/help-index.json",
          details: expect.objectContaining({
            activationSkillDirectory: "other-skill",
            reason: "skill-id-mismatch",
          }),
        }),
        expect.objectContaining({
          issueId: "menu-target.missing-target",
          affectedPath: "_speclite/_config/phase-coverage.json",
          details: expect.objectContaining({
            entrySkillDirectory: "other-skill",
            activationSkillDirectory: "other-skill",
            reason: "skill-id-mismatch",
          }),
        }),
      ]),
    );
  });
});

function createHelpIndex(input: {
  canonicalSkillId: string;
  activationTarget: string;
  targetIds?: Array<"claude" | "agents">;
}): HelpIndex {
  return {
    schemaVersion: "speclite.help-index.v1",
    entries: [
      {
        schemaVersion: "speclite.help-index.v1",
        phaseId: "4-implementation",
        entryLabel: "Dev Story",
        canonicalSkillId: input.canonicalSkillId,
        activationTarget: input.activationTarget,
        targetIds: input.targetIds ?? ["claude", "agents"],
      },
    ],
  };
}

function createPhaseCoverage(
  targets: Array<{
    targetId: "claude" | "agents";
    entryPath?: string;
    activationTarget: string;
    status: "mapped" | "unsupported" | "failed";
  }>,
): PhaseCoverage {
  return {
    schemaVersion: "speclite.phase-coverage.v1",
    rows: [
      {
        schemaVersion: "speclite.phase-coverage.v1",
        phaseId: "4-implementation",
        phaseLabel: "Implementation",
        moduleId: "sdlc",
        canonicalSkillId: "speclite-dev-story",
        ideTargets: targets.map((target) => ({
          targetId: target.targetId,
          entryPath:
            target.entryPath ??
            `.${target.targetId === "claude" ? "claude" : "agents"}/skills/speclite-dev-story`,
          activationTarget: target.activationTarget,
          status: target.status,
        })),
      },
    ],
  };
}
