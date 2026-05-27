import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveProjectConfig } from "../src/config/config-reader.js";
import { resolveSkillCustomization } from "../src/config/customization-reader.js";
import { ResolveStdoutObjectSchema, ResolveStderrJsonLineSchema } from "../src/config/resolve-output-schema.js";

describe("resolve config reader", () => {
  it("merges four config layers and selects repeated dotted keys after merge", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-reader-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", [
        "[core]",
        'project_name = "Base"',
        'communication_language = "中文"',
        "",
        "[[modules.sdlc.agents]]",
        'code = "dev"',
        'label = "Base Dev"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/config.user.toml", [
        "[core]",
        'project_name = "User"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", [
        "[core]",
        'user_name = "Team"',
        "",
        "[[modules.sdlc.agents]]",
        'code = "dev"',
        'label = "Team Dev"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/config.user.toml", [
        "[core]",
        'document_output_language = "Mandarin"',
      ].join("\n"));

      const result = await resolveProjectConfig({
        projectRoot: tempRoot,
        keys: ["core.project_name", "missing.value", "modules.sdlc.agents"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.issues).toEqual([]);
      expect(ResolveStdoutObjectSchema.parse(result.value)).toEqual({
        "core.project_name": "User",
        "modules.sdlc.agents": [{ code: "dev", label: "Team Dev" }],
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("returns warning diagnostics for optional parse failures and blocks required failures", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-failures-"));
    try {
      await writeProjectFile(tempRoot, "_speclite/config.toml", "[core]\nproject_name = \"Base\"\n");
      await writeProjectFile(tempRoot, "_speclite/custom/config.toml", "[core\nbroken = true\n");

      const warningResult = await resolveProjectConfig({ projectRoot: tempRoot });
      expect(warningResult.exitCode).toBe(0);
      expect(warningResult.value).toEqual({ core: { project_name: "Base" } });
      expect(warningResult.issues).toHaveLength(1);
      expect(ResolveStderrJsonLineSchema.parse(warningResult.issues[0])).toMatchObject({
        issueId: "manifest-schema.malformed-field",
        severity: "warning",
        affectedPath: "_speclite/custom/config.toml",
      });
      expect(JSON.stringify(warningResult.issues[0])).not.toContain(tempRoot);

      const missingRequiredRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-config-missing-"));
      const errorResult = await resolveProjectConfig({ projectRoot: missingRequiredRoot });
      expect(errorResult.exitCode).toBe(1);
      expect(errorResult.value).toEqual({});
      expect(errorResult.issues[0]).toMatchObject({
        issueId: "runtime-path.missing-entry",
        severity: "error",
        affectedPath: "_speclite/config.toml",
      });
      await rm(missingRequiredRoot, { recursive: true, force: true });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("resolve customization reader", () => {
  it("merges skill defaults with basename-keyed team and user custom layers", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-custom-reader-"));
    try {
      const skillDir = path.join(tempRoot, ".claude/skills/speclite-create-story");
      await writeProjectFile(tempRoot, ".claude/skills/speclite-create-story/customize.toml", [
        "[workflow]",
        'on_complete = "base"',
        'persistent_facts = ["base"]',
        "",
        "[[workflow.activation_steps_prepend]]",
        'code = "load"',
        'text = "base"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-create-story.toml", [
        "[workflow]",
        'persistent_facts = ["team"]',
        "",
        "[[workflow.activation_steps_prepend]]",
        'code = "load"',
        'text = "team"',
      ].join("\n"));
      await writeProjectFile(tempRoot, "_speclite/custom/speclite-create-story.user.toml", [
        "[workflow]",
        'on_complete = "用户完成"',
      ].join("\n"));

      const result = await resolveSkillCustomization({
        skillDir,
        projectRoot: tempRoot,
        keys: ["workflow.on_complete", "workflow.persistent_facts", "missing.value"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.issues).toEqual([]);
      expect(result.value).toEqual({
        "workflow.on_complete": "用户完成",
        "workflow.persistent_facts": ["base", "team"],
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails missing customization defaults instead of manufacturing synthetic defaults", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-custom-missing-"));
    try {
      await mkdir(path.join(tempRoot, ".agents/skills/plain-skill"), { recursive: true });
      const result = await resolveSkillCustomization({
        skillDir: path.join(tempRoot, ".agents/skills/plain-skill"),
        projectRoot: tempRoot,
      });

      expect(result.exitCode).toBe(1);
      expect(result.value).toEqual({});
      expect(result.issues[0]).toMatchObject({
        issueId: "runtime-path.missing-entry",
        affectedPath: "customize.toml",
        severity: "error",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeProjectFile(projectRoot: string, relativePath: string, contents: string): Promise<void> {
  const filePath = path.join(projectRoot, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${contents}\n`, "utf8");
}
