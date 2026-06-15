import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  InstallCommandResultSchema,
  StatusCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import {
  renderInstallHumanOutput,
  renderStatusHumanOutput,
} from "../src/diagnostics/output.js";
import { discoverBundledSourceDescriptor } from "../src/source/source-discovery.js";
import { SourceDescriptorSchema } from "../src/source/source-descriptor-schema.js";

const commitSha = "0123456789abcdef0123456789abcdef01234567";

describe("SourceDescriptor executable schema", () => {
  it("rejects non-blocked descriptors without reproducible integrity evidence", () => {
    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "npm",
        version: "1.2.3",
        integrityEvidence: [],
        trustStatus: "unverified",
      }).success,
    ).toBe(false);

    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "git",
        version: commitSha,
        resolvedRoot: "redacted-git-remote",
        integrityEvidence: [],
        trustStatus: "trusted",
      }).success,
    ).toBe(false);
  });

  it("enforces source-specific contentHash and public-safe resolvedRoot boundaries", () => {
    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "local",
        resolvedRoot: "local-source",
        integrityEvidence: [
          {
            kind: "content-hash",
            algorithm: "sha256",
            value: "sha256:abc",
            verified: false,
          },
        ],
        trustStatus: "unverified",
      }).success,
    ).toBe(false);

    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "git",
        version: commitSha,
        resolvedRoot: "redacted-git-remote",
        contentHash: "sha256:abc",
        integrityEvidence: [
          {
            kind: "git-commit",
            commitSha,
            verified: false,
          },
        ],
        trustStatus: "unverified",
      }).success,
    ).toBe(false);

    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "local",
        resolvedRoot: path.join(os.homedir(), "private-source"),
        contentHash: "sha256:abc",
        integrityEvidence: [
          {
            kind: "content-hash",
            algorithm: "sha256",
            value: "sha256:abc",
            verified: false,
          },
        ],
        trustStatus: "unverified",
      }).success,
    ).toBe(false);
  });

  it("requires SourceIntegrityEvidence to use canonical ordering", () => {
    expect(
      SourceDescriptorSchema.safeParse({
        sourceType: "npm",
        version: "1.2.3",
        integrityEvidence: [
          {
            kind: "version-lock",
            packageName: "@acme/source",
            version: "1.2.3",
            lockPath: "source-lock.json",
            verified: true,
          },
          {
            kind: "registry-integrity",
            packageName: "@acme/source",
            version: "1.2.3",
            integrity: "sha512-source",
            verified: false,
          },
        ],
        trustStatus: "trusted",
      }).success,
    ).toBe(false);
  });
});

describe("bundled source trust reporting", () => {
  it("matches the bundled-packaging-trusted fixture when package lock evidence exists", async () => {
    const descriptor = await discoverBundledSourceDescriptor({
      projectRoot: process.cwd(),
    });
    const expected = JSON.parse(
      await readFile(
        "test/fixtures/source-integrity/bundled-packaging-trusted/expected/source-descriptor.json",
        "utf8",
      ),
    );

    expect(descriptor).toEqual(expected);
    expect(JSON.stringify(descriptor)).not.toContain(process.cwd());
    expect(JSON.stringify(descriptor)).not.toContain(os.homedir());
  });
});

describe("redacted SourceDescriptor human reporting", () => {
  it("shows confirmed external access for resolved Git install summaries", () => {
    const result = InstallCommandResultSchema.parse({
      schemaVersion: "speclite.command-result.v1",
      status: "success",
      command: "install",
      targetProject: "git-confirmed",
      summary: "SpecLite install completed.",
      issues: [],
      nextActions: ["Run speclite status to inspect the installed-state summary."],
      data: {
        sourceDescriptor: {
          sourceType: "git",
          requestedVersion: "main",
          version: commitSha,
          resolvedRoot: "redacted-git-remote",
          integrityEvidence: [
            {
              kind: "git-commit",
              commitSha,
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
        manifestVersion: "speclite.manifest.v1",
        installedModules: ["core"],
        ideTargets: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
        completedSteps: ["source-discovery", "ready-check", "ready-summary"],
        pendingSteps: [],
      },
    });

    const output = renderInstallHumanOutput(result);

    expect(output).toContain("sourceType=git");
    expect(output).toContain(`version=${commitSha}`);
    expect(output).toContain("trustStatus=unverified");
    expect(output).toContain("evidence=git-commit:unverified");
    expect(output).toContain("confirmationState=confirmed");
    expect(output).not.toContain("confirmationState=pending");
    expect(output).not.toContain(os.homedir());
  });

  it("projects status source descriptor with trust and evidence summary", () => {
    const result = StatusCommandResultSchema.parse({
      schemaVersion: "speclite.command-result.v1",
      status: "success",
      command: "status",
      targetProject: "installed",
      summary: "SpecLite installed-state summary is configured.",
      issues: [],
      nextActions: ["Run speclite validate when deeper local validation is needed."],
      data: {
        sourceDescriptor: {
          sourceType: "private-registry",
          channel: "internal",
          version: "2.0.0",
          integrityEvidence: [
            {
              kind: "registry-integrity",
              packageName: "@acme/source",
              version: "2.0.0",
              integrity: "sha512-source",
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
        manifestPresent: true,
        manifestVersion: "speclite.manifest.v1",
        installedModules: ["core"],
        ideTargets: [],
        highLevelHealth: "configured",
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      },
    });

    const output = renderStatusHumanOutput(result);

    expect(output).toContain("来源：sourceType=private-registry");
    expect(output).toContain("channel=internal");
    expect(output).toContain("version=2.0.0");
    expect(output).toContain("trustStatus=unverified");
    expect(output).toContain("evidence=registry-integrity:unverified");
  });
});
