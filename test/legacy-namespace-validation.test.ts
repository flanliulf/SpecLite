import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateLegacyNamespace } from "../src/validation/rules/legacy-namespace.js";
import type { FilesIndex, SkillIndex } from "../src/manifest/manifest-schema.js";

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

describe("legacy namespace validation", () => {
  it("reports overlapping legacy runtime residue, stale skill entries and legacy config references without deleting files", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-legacy-namespace-"));

    try {
      await mkdir(path.join(tempRoot, "_bmad"), { recursive: true });
      await writeFile(path.join(tempRoot, "_bmad/config.yaml"), "legacy: true\n", "utf8");
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-dev-story-legacy"), { recursive: true });
      await writeFile(
        path.join(tempRoot, ".claude/skills/speclite-dev-story-legacy/SKILL.md"),
        "# Legacy\n",
        "utf8",
      );
      await mkdir(path.join(tempRoot, ".claude/skills/unrelated-history"), { recursive: true });

      const issues = await validateLegacyNamespace({
        projectRoot: tempRoot,
        skillIndex,
        filesIndex: createFilesIndex(),
      });

      expect(issues.issues.map((issue) => issue.issueId)).toEqual([
        "legacy-namespace.runtime-residue",
        "legacy-namespace.legacy-config-reference",
        "legacy-namespace.stale-skill-entry",
      ]);
      expect(issues.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            details: expect.objectContaining({
              manualActionRequired: true,
              verificationCommand: "speclite validate",
            }),
          }),
        ]),
      );
      await expect(writeFile(path.join(tempRoot, "_bmad/config.yaml"), "still here\n", "utf8")).resolves.toBeUndefined();
      expect(JSON.stringify(issues)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("reports legacy config references inside installed canonical skill entries", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-legacy-installed-skill-"));

    try {
      await mkdir(path.join(tempRoot, ".claude/skills/speclite-dev-story"), { recursive: true });
      await writeFile(
        path.join(tempRoot, ".claude/skills/speclite-dev-story/SKILL.md"),
        "# Dev Story\n\nRead _bmad/config.yaml before running.\n",
        "utf8",
      );

      const result = await validateLegacyNamespace({
        projectRoot: tempRoot,
        skillIndex,
        filesIndex: {
          schemaVersion: "speclite.files-index.v1",
          entries: [],
        },
      });

      expect(result.issues).toEqual([
        expect.objectContaining({
          issueId: "legacy-namespace.legacy-config-reference",
          affectedPath: ".claude/skills/speclite-dev-story/SKILL.md",
          details: expect.objectContaining({
            legacyKind: "config-reference",
            overlapKind: "config-path",
          }),
        }),
      ]);
      expect(JSON.stringify(result)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function createFilesIndex(): FilesIndex {
  return {
    schemaVersion: "speclite.files-index.v1",
    entries: [
      {
        schemaVersion: "speclite.files-index.v1",
        path: "_bmad/config.yaml",
        ownership: "installer-owned",
        hash: "sha256:legacy",
        hashAlgorithm: "sha256",
        executable: false,
        artifactKind: "runtime-config",
        sourceRef: "_bmad/config.yaml",
      },
    ],
  };
}
