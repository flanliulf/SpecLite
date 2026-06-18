import { describe, expect, it } from "vitest";
import { createFilesIndexEntry } from "../src/manifest/manifest-generator.js";
import { hashBytes } from "../src/manifest/hash.js";
import {
  classifyOwnership,
  isVolatileInstalledStatePath,
} from "../src/update/ownership-model.js";

describe("ownership model path classifier", () => {
  it("classifies installer-owned runtime config, control files and IDE mirror projections", () => {
    for (const relativePath of [
      "_speclite/config.toml",
      "_speclite/config.user.toml",
      "_speclite/_config/manifest.yaml",
      "_speclite/_config/files-index.json",
      "_speclite/scripts/resolve_customization.py",
      ".claude/skills/speclite-help/SKILL.md",
      ".agents/skills/speclite-help/SKILL.md",
      ".claude/settings.json",
      ".codex/hooks.json",
    ]) {
      expect(classifyOwnership({ relativePath })).toMatchObject({
        relativePath,
        ownership: "installer-owned",
        protected: false,
      });
    }
  });

  it("classifies project-level and skill-specific custom TOML as protected human-owned files", () => {
    for (const relativePath of [
      ".gitignore",
      "_speclite/custom/config.toml",
      "_speclite/custom/config.user.toml",
      "_speclite/custom/speclite-help.toml",
      "_speclite/custom/speclite-help.user.toml",
    ]) {
      expect(classifyOwnership({ relativePath })).toMatchObject({
        relativePath,
        ownership: "human-owned",
        protected: true,
      });
    }
  });

  it("classifies default and configured artifact roots as protected workflow-owned files", () => {
    expect(classifyOwnership({ relativePath: "_speclite-output/review/report.md" })).toMatchObject({
      ownership: "workflow-owned",
      protected: true,
    });
    expect(
      classifyOwnership({
        relativePath: ".artifacts/implementation/story.md",
        artifactRoot: ".artifacts",
      }),
    ).toMatchObject({
      ownership: "workflow-owned",
      protected: true,
    });
  });

  it("keeps unknown and path-escape candidates protected instead of defaulting to installer-owned", () => {
    for (const relativePath of ["README.md", "../outside.md", "/tmp/outside.md", "C:/tmp/outside.md"]) {
      const classification = classifyOwnership({ relativePath });
      expect(classification.ownership).toBe("unknown");
      expect(classification.protected).toBe(true);
    }
  });

  it("excludes volatile lock and safe-write temporary paths from files index projection", () => {
    expect(isVolatileInstalledStatePath("_speclite/.lock")).toBe(true);
    expect(isVolatileInstalledStatePath("_speclite/.speclite-tmp-12345")).toBe(true);
    expect(isVolatileInstalledStatePath("_speclite/_config/files-index.json")).toBe(false);
  });
});

describe("files index ownership projection", () => {
  it("projects ownership, raw-byte hash, executable intent and stable source references", () => {
    const entry = createFilesIndexEntry({
      path: "_speclite/config.toml",
      bytes: Buffer.from("line one\r\nline two\n", "utf8"),
      executable: false,
      artifactKind: "runtime-config",
      sourceRef: "installed-state:runtime-config",
    });

    expect(entry).toEqual({
      schemaVersion: "speclite.files-index.v1",
      path: "_speclite/config.toml",
      ownership: "installer-owned",
      hash: hashBytes(Buffer.from("line one\r\nline two\n", "utf8")),
      hashAlgorithm: "sha256",
      executable: false,
      artifactKind: "runtime-config",
      sourceRef: "installed-state:runtime-config",
    });
  });
}
);
