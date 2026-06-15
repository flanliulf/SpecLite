import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { InstallCommandResultSchema } from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import {
  createSourceResolutionPlan,
  normalizeSourceSelection,
  SOURCE_TYPE_VALUES,
} from "../src/source/source-selection.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("source selection model", () => {
  it("keeps the MVP source type vocabulary explicit and canonical", () => {
    expect(SOURCE_TYPE_VALUES).toEqual([
      "bundled",
      "npm",
      "private-registry",
      "local-tarball",
      "offline-bundle",
      "git",
      "local",
    ]);
  });

  it("defaults to bundled source with no external access intent", () => {
    const selection = normalizeSourceSelection({});
    expect(selection.ok).toBe(true);
    if (!selection.ok) return;

    const plan = createSourceResolutionPlan({ selection: selection.selection, confirmed: true });

    expect(plan).toEqual({
      requestedSourceType: "bundled",
      requestedSourceValue: "assets/source/speclite",
      externalAccesses: [],
      requiresConfirmation: false,
      confirmed: true,
    });
  });

  it("captures custom source requestedVersion and channel without resolving them", () => {
    const selection = normalizeSourceSelection({
      sourceType: "npm",
      sourceValue: "@acme/speclite-source",
      requestedVersion: "^1.2.0",
      channel: "beta",
    });
    expect(selection.ok).toBe(true);
    if (!selection.ok) return;

    const plan = createSourceResolutionPlan({ selection: selection.selection, confirmed: false });

    expect(selection.selection).toMatchObject({
      sourceType: "npm",
      requestedSourceValue: "@acme/speclite-source",
      requestedVersion: "^1.2.0",
      channel: "beta",
    });
    expect(plan.externalAccesses).toEqual([
      {
        sourceType: "npm",
        sourceValue: "@acme/speclite-source",
        reason: "Resolve npm package metadata before selecting an installable SpecLite source.",
        confirmationState: "pending",
      },
    ]);
    expect(plan.confirmed).toBe(false);
  });

  it("returns stable source-integrity diagnostics for invalid source input", () => {
    const invalidType = normalizeSourceSelection({
      sourceType: "container-image",
      sourceValue: "example",
    });
    const missingValue = normalizeSourceSelection({ sourceType: "git" });

    expect(invalidType).toMatchObject({
      ok: false,
      issue: {
        issueId: "source-integrity.unsupported-source",
        category: "source-integrity",
        severity: "error",
        component: "source-selection",
        details: {
          reason: "invalid-source-type",
        },
      },
    });
    expect(missingValue).toMatchObject({
      ok: false,
      issue: {
        issueId: "source-integrity.unsupported-source",
        category: "source-integrity",
        severity: "error",
        component: "source-selection",
        details: {
          reason: "missing-source-value",
          requestedSourceType: "git",
        },
      },
    });
  });

  it("redacts credentials, private registry hosts and local absolute paths from public source labels", () => {
    const cases = [
      normalizeSourceSelection({
        sourceType: "private-registry",
        sourceValue: "https://token:secret@registry.example.test/@acme/source?token=secret",
        requestedVersion: "https://token:secret@registry.example.test/@acme/source?token=secret",
        channel: path.join(os.homedir(), "private-channel"),
      }),
      normalizeSourceSelection({
        sourceType: "git",
        sourceValue: "https://token:secret@git.example.test/acme/source.git",
        requestedVersion: "main",
      }),
      normalizeSourceSelection({
        sourceType: "local",
        sourceValue: path.join(os.homedir(), "private/source"),
      }),
    ];

    for (const result of cases) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      const plan = createSourceResolutionPlan({ selection: result.selection, confirmed: false });
      const publicText = JSON.stringify({ selection: result.selection, plan });

      expect(publicText).not.toContain(os.homedir());
      expect(publicText).not.toContain("token");
      expect(publicText).not.toContain("secret");
      expect(publicText).not.toContain("registry.example.test");
      expect(publicText).not.toContain("git.example.test");
      expect(publicText).not.toContain("\\");
      expect(publicText).not.toMatch(/[A-Za-z]:\//);
    }
  });

  it("redacts npm package selectors with private query strings from selection and external access intent", () => {
    const selection = normalizeSourceSelection({
      sourceType: "npm",
      sourceValue: "@scope/pkg?token=secret",
      requestedVersion: "latest",
    });
    expect(selection.ok).toBe(true);
    if (!selection.ok) return;

    const plan = createSourceResolutionPlan({ selection: selection.selection, confirmed: false });
    const publicText = JSON.stringify({ selection: selection.selection, plan });

    expect(selection.selection).toMatchObject({
      sourceType: "npm",
      requestedSourceValue: "redacted-npm-package",
      requestedVersion: "latest",
    });
    expect(plan.externalAccesses).toEqual([
      {
        sourceType: "npm",
        sourceValue: "redacted-npm-package",
        reason: "Resolve npm package metadata before selecting an installable SpecLite source.",
        confirmationState: "pending",
      },
    ]);
    expect(publicText).not.toContain("@scope/pkg?token=secret");
    expect(publicText).not.toContain("?token=secret");
    expect(publicText).not.toContain("token");
    expect(publicText).not.toContain("secret");
  });
});

describe("install source selection boundary", () => {
  it("reports bundled source summary in JSON and human output without external access", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-source-bundled-"));

    try {
      const outcome = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const humanOutput = renderInstallHumanOutput(parsed, { locale: "en-US" });

      expect(parsed.status).toBe("success");
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "bundled",
        resolvedRoot: "assets/source/speclite",
      });
      expect(humanOutput).toContain("Source");
      expect(humanOutput).toContain("sourceType=bundled");
      expect(humanOutput).toContain("resolvedRoot=assets/source/speclite");
      expect(humanOutput).toContain("External Access");
      expect(humanOutput).toContain("No external source access requested.");
      expect(humanOutput).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("stops custom source before resolution, lock acquisition or writes", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-source-custom-"));

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "private-registry",
          sourceValue: "https://token:secret@registry.example.test/@acme/source?token=secret",
          requestedVersion: "latest",
          channel: "beta",
        },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          category: "source-integrity",
          component: "source-resolution",
          details: {
            reason: "source-access-not-confirmed",
            requestedSourceType: "private-registry",
          },
        }),
      ]);
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "private-registry",
        channel: "beta",
        requestedVersion: "latest",
        trustStatus: "blocked",
      });
      expect(parsed.data.completedSteps).toEqual(["source-discovery"]);
      expect(parsed.data.pendingSteps).toContain("module-selection");
      expect(output).toContain("外部访问");
      expect(output).toContain("sourceType=private-registry");
      expect(output).toContain("confirmationState=pending");
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain("registry.example.test");
      expect(output).not.toContain(tempRoot);
      await expect(access(path.join(tempRoot, "_speclite"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      expect(outcome.installPlan).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("redacts npm private query strings from install JSON and human output", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-source-npm-redaction-"));

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "npm",
          sourceValue: "@scope/pkg?token=secret",
          requestedVersion: "latest",
        },
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const jsonOutput = renderCommandResultJson(parsed);
      const humanOutput = renderInstallHumanOutput(parsed);
      const output = `${jsonOutput}\n${humanOutput}`;

      expect(outcome.exitCode).toBe(1);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "npm",
        requestedVersion: "latest",
        resolvedRoot: "redacted-npm-package",
        trustStatus: "blocked",
      });
      expect(output).toContain("sourceType=npm");
      expect(output).toContain("sourceValue=redacted-npm-package");
      expect(output).not.toContain("@scope/pkg?token=secret");
      expect(output).not.toContain("?token=secret");
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain(tempRoot);
      await expect(access(path.join(tempRoot, "_speclite"))).rejects.toMatchObject({
        code: "ENOENT",
      });
      expect(outcome.installPlan).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("matches the focused source-integrity fixture for unsupported private registry selection", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-source-fixture-"));

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "private-registry",
          sourceValue: "https://token:secret@registry.example.test/@acme/source?token=secret",
          requestedVersion: "latest",
          channel: "beta",
        },
        runtime: {
          ...supportedRuntime,
          cwd: tempRoot,
          targetProject: "source-integrity",
        },
      });
      const expected = JSON.parse(
        await readFile(
          path.join(
            process.cwd(),
            "test/fixtures/source-integrity/unsupported-private-registry/expected/command-json.json",
          ),
          "utf8",
        ),
      );

      expect(JSON.parse(renderCommandResultJson(outcome.result))).toEqual(expected);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});
