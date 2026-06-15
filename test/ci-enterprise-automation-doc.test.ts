import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findUnsafeIssueValue } from "../src/validation/issue-model.js";

describe("CI and enterprise automation guide", () => {
  it("documents stable JSON fields without requiring human-readable output parsing", async () => {
    const guide = await readFile(path.join("docs/how-to/ci-enterprise-automation.md"), "utf8");

    expect(guide).toContain("status.data.highLevelHealth");
    expect(guide).toContain("validate.data.issueCounts");
    expect(guide).toContain("validate.data.checkedCategories");
    expect(guide).toContain("validate.data.checkedTargets");
    expect(guide).toContain("validate.data.validatedPaths");
    expect(guide).toContain("update.data.updatePlan.actions");
    expect(guide).toContain("update.data.changedPaths");
    expect(guide).toContain("update.data.skippedPaths");
    expect(guide).toContain("update.data.conflicts");
    expect(guide).toContain("CommandResult.status");
    expect(guide).toContain("speclite.command-result.v1");
    expect(guide).toContain("不要解析 human-readable output");
    expect(guide).toContain("不得定义企业私有 status semantics");
    expect(guide).not.toMatch(/\u001b\[[0-9;]*m/);
    expect(guide).not.toMatch(/[✅❌⚠️]/u);
    expect(guide).not.toMatch(/\/Users\/|C:\\|~\/|node_modules|\.cache|\/tmp\/|token=|password=|credential=/i);
  });

  it("keeps automation artifact diagnostics inside the existing redaction guard", () => {
    const safeArtifact = {
      statusHealth: "configured",
      checkedPath: "_speclite/_config/manifest.yaml",
      sourceLabel: "redacted-git-remote",
      conflictPath: ".agents/skills/speclite-help/SKILL.md",
    };
    const unsafeArtifacts = [
      { path: "/private/build/spec-lite/_speclite/config.toml" },
      { path: "~/work/spec-lite/_speclite/config.toml" },
      { path: "C:\\Users\\alice\\spec-lite\\_speclite\\config.toml" },
      { source: "https://user:secret@example.invalid/repo.git" },
      { source: "https://example.invalid/repo.git?token=secret" },
      { temp: "workspace/tmp/extracted-source" },
    ];

    expect(findUnsafeIssueValue(safeArtifact)).toBeUndefined();
    for (const artifact of unsafeArtifacts) {
      expect(findUnsafeIssueValue(artifact)).toBeDefined();
    }
  });
});
