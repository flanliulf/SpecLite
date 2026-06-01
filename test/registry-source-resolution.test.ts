import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import {
  InstallCommandResultSchema,
  ValidateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import { runValidateCommand } from "../src/commands/validate.js";
import { normalizeSourceSelection } from "../src/source/source-selection.js";
import {
  RegistrySourceResolutionError,
  resolveRegistrySource,
  type RegistryMetadataClient,
} from "../src/source/registry-source-resolver.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

describe("registry source resolver", () => {
  it("resolves public npm dist-tag to resolved version and registry integrity evidence", async () => {
    const selection = selectRegistry({
      sourceType: "npm",
      sourceValue: "@acme/speclite-source",
      requestedVersion: "latest",
    });
    const client = registryClient({
      packageName: "@acme/speclite-source",
      distTags: { latest: "1.2.3" },
      versions: {
        "1.2.3": {
          version: "1.2.3",
          integrity: "sha512-public",
        },
      },
    });

    const resolved = await resolveRegistrySource({
      selection,
      registryClient: client,
    });

    expect(resolved).toEqual({
      ok: true,
      descriptor: {
        sourceType: "npm",
        requestedVersion: "latest",
        version: "1.2.3",
        integrityEvidence: [
          {
            kind: "registry-integrity",
            packageName: "@acme/speclite-source",
            version: "1.2.3",
            integrity: "sha512-public",
            verified: false,
          },
        ],
        trustStatus: "unverified",
      },
    });
    expect(client.fetchPackageMetadata).toHaveBeenCalledWith({
      sourceType: "npm",
      packageName: "@acme/speclite-source",
      requestedVersion: "latest",
      registryKind: "public",
    });
  });

  it("resolves public npm caret range while preserving requestedVersion selector", async () => {
    const selection = selectRegistry({
      sourceType: "npm",
      sourceValue: "speclite-source",
      requestedVersion: "^1.2.0",
    });

    const resolved = await resolveRegistrySource({
      selection,
      registryClient: registryClient({
        packageName: "speclite-source",
        versions: {
          "1.2.0": { version: "1.2.0", integrity: "sha512-120" },
          "1.3.0": { version: "1.3.0", integrity: "sha512-130" },
          "2.0.0": { version: "2.0.0", integrity: "sha512-200" },
        },
      }),
    });

    expect(resolved).toMatchObject({
      ok: true,
      descriptor: {
        sourceType: "npm",
        requestedVersion: "^1.2.0",
        version: "1.3.0",
        integrityEvidence: [
          {
            kind: "registry-integrity",
            packageName: "speclite-source",
            version: "1.3.0",
            integrity: "sha512-130",
            verified: false,
          },
        ],
        trustStatus: "unverified",
      },
    });
  });

  it("derives trusted only from expected lock match, not registry kind", async () => {
    const selection = selectRegistry({
      sourceType: "private-registry",
      sourceValue: "@acme/private-source",
      channel: "internal",
    });
    const client = registryClient({
      packageName: "@acme/private-source",
      distTags: { internal: "2.0.0" },
      versions: {
        "2.0.0": {
          version: "2.0.0",
          integrity: "sha512-private",
        },
      },
    });

    const resolved = await resolveRegistrySource({
      selection,
      registryClient: client,
      runtimeConfig: {
        registryKind: "private",
        displaySafeRegistryLabel: "acme-internal-registry",
        packageName: "@acme/private-source",
        channel: "internal",
      },
      expectedLock: {
        packageName: "@acme/private-source",
        version: "2.0.0",
        lockPath: "source-lock.json",
      },
    });

    const expectedDescriptor = JSON.parse(
      await readFile(
        path.join(
          process.cwd(),
          "test/fixtures/source-integrity/registry-lock-trusted/expected/source-descriptor.json",
        ),
        "utf8",
      ),
    );

    expect(resolved).toEqual({
      ok: true,
      descriptor: expectedDescriptor,
    });
    expect(client.fetchPackageMetadata).toHaveBeenCalledWith({
      sourceType: "private-registry",
      packageName: "@acme/private-source",
      channel: "internal",
      registryKind: "private",
      registryLabel: "acme-internal-registry",
    });
  });

  it("requires explicit private registry runtime config before injected metadata access", async () => {
    const selection = selectRegistry({
      sourceType: "private-registry",
      sourceValue: "@acme/private-source",
      channel: "internal",
    });
    const client = registryClient({
      packageName: "@acme/private-source",
      versions: {
        "2.0.0": { version: "2.0.0", integrity: "sha512-private" },
      },
    });

    const resolved = await resolveRegistrySource({
      selection,
      registryClient: client,
    });

    expect(resolved).toMatchObject({
      ok: false,
      descriptor: {
        sourceType: "private-registry",
        channel: "internal",
        resolvedRoot: "@acme/private-source",
        trustStatus: "blocked",
      },
      issues: [
        {
          issueId: "source-integrity.authentication-required",
          details: {
            reason: "private-registry-explicit-config-required",
            sourceType: "private-registry",
            packageName: "@acme/private-source",
            channel: "internal",
            registryKind: "private",
          },
        },
      ],
    });
    expect(client.fetchPackageMetadata).not.toHaveBeenCalled();
  });

  it("blocks missing evidence and lock mismatch with stable source-integrity issues", async () => {
    const selection = selectRegistry({
      sourceType: "npm",
      sourceValue: "speclite-source",
      requestedVersion: "1.0.0",
    });

    const missingEvidence = await resolveRegistrySource({
      selection,
      registryClient: registryClient({
        packageName: "speclite-source",
        versions: {
          "1.0.0": { version: "1.0.0" },
        },
      }),
    });
    const lockMismatch = await resolveRegistrySource({
      selection,
      registryClient: registryClient({
        packageName: "speclite-source",
        versions: {
          "1.0.0": { version: "1.0.0", integrity: "sha512-ok" },
        },
      }),
      expectedLock: {
        packageName: "speclite-source",
        version: "2.0.0",
        lockPath: "source-lock.json",
      },
    });

    expect(missingEvidence).toMatchObject({
      ok: false,
      descriptor: {
        sourceType: "npm",
        requestedVersion: "1.0.0",
        version: "1.0.0",
        integrityEvidence: [],
        trustStatus: "blocked",
      },
      issues: [
        {
          issueId: "source-integrity.missing-evidence",
          category: "source-integrity",
          component: "registry-source-resolution",
          details: {
            reason: "missing-registry-integrity",
            sourceType: "npm",
            packageName: "speclite-source",
            requestedVersion: "1.0.0",
            registryKind: "public",
          },
        },
      ],
    });
    expect(lockMismatch).toMatchObject({
      ok: false,
      descriptor: {
        sourceType: "npm",
        requestedVersion: "1.0.0",
        version: "1.0.0",
        trustStatus: "blocked",
      },
      issues: [
        {
          issueId: "source-integrity.lock-mismatch",
          details: {
            reason: "version-lock-mismatch",
            sourceType: "npm",
            packageName: "speclite-source",
            requestedVersion: "1.0.0",
            registryKind: "public",
          },
        },
      ],
    });
  });

  it("maps registry failures to redaction-safe diagnostics", async () => {
    const selection = selectRegistry({
      sourceType: "private-registry",
      sourceValue: "@acme/private-source",
      requestedVersion: "latest?token=secret",
      channel: "beta#secret",
    });
    const client: RegistryMetadataClient = {
      fetchPackageMetadata: vi.fn(async () => {
        throw new RegistrySourceResolutionError("authentication-required", "raw token leak");
      }),
    };

    const resolved = await resolveRegistrySource({
      selection,
      registryClient: client,
      runtimeConfig: {
        registryKind: "private",
        displaySafeRegistryLabel: "acme-private-registry",
        packageName: "@acme/private-source",
        channel: "redacted-channel",
      },
    });
    const publicText = JSON.stringify(resolved);
    const expectedIssue = JSON.parse(
      await readFile(
        path.join(
          process.cwd(),
          "test/fixtures/source-integrity/source-unreadable-blocked/registry-auth-required/expected/issue.json",
        ),
        "utf8",
      ),
    );

    expect(resolved).toMatchObject({
      ok: false,
      issues: [expectedIssue],
    });
    expect(publicText).not.toContain("token");
    expect(publicText).not.toContain("secret");
    expect(publicText).not.toContain("registry.example.test");
    expect(publicText).not.toContain("?token=");
    expect(publicText).not.toContain("#frag");
  });
});

describe("install registry source boundary", () => {
  it("does not call registry client before explicit source access confirmation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-pending-"));
    const client = registryClient({
      packageName: "@acme/speclite-source",
      versions: {
        "1.0.0": { version: "1.0.0", integrity: "sha512-ok" },
      },
    });

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "npm",
          sourceValue: "@acme/speclite-source",
          requestedVersion: "1.0.0",
        },
        registryClient: client,
        runtime: { ...supportedRuntime, cwd: tempRoot },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(1);
      expect(client.fetchPackageMetadata).not.toHaveBeenCalled();
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          details: {
            reason: "source-access-not-confirmed",
            requestedSourceType: "npm",
          },
        }),
      ]);
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "npm",
        requestedVersion: "1.0.0",
        resolvedRoot: "@acme/speclite-source",
        trustStatus: "blocked",
      });
      expect(outcome.installPlan).toBeUndefined();
      expect(output).not.toContain(tempRoot);
      await expect(readFile(path.join(tempRoot, "_speclite/_config/manifest.yaml"), "utf8")).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("uses confirmed injected registry metadata to produce registry SourceDescriptor without leaking secrets", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-confirmed-"));

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "private-registry",
          sourceValue: "@acme/private-source",
          channel: "internal",
        },
        registryClient: registryClient({
          packageName: "@acme/private-source",
          distTags: { internal: "2.0.0" },
          versions: {
            "2.0.0": { version: "2.0.0", integrity: "sha512-private" },
          },
        }),
        privateRegistryRuntimeConfig: {
          registryKind: "private",
          displaySafeRegistryLabel: "acme-internal-registry",
          packageName: "@acme/private-source",
          channel: "internal",
        },
        confirmSourceAccess: async () => undefined,
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "registry-confirmed" },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const publicText = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;
      const expectedDescriptor = JSON.parse(
        await readFile(
          path.join(
            process.cwd(),
            "test/fixtures/source-integrity/registry-unverified/expected/source-descriptor.json",
          ),
          "utf8",
        ),
      );

      expect(outcome.exitCode).toBe(0);
      expect(parsed.data.sourceDescriptor).toEqual(expectedDescriptor);
      expect(publicText).toContain("sourceType=private-registry");
      expect(publicText).toContain("version=2.0.0");
      expect(publicText).toContain("trustStatus=unverified");
      expect(publicText).not.toContain(tempRoot);
      expect(publicText).not.toContain("registry.example.test");
      expect(publicText).not.toContain("token");
      expect(publicText).not.toContain("secret");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks confirmed private registry install when explicit runtime config is absent", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-private-config-"));
    const client = registryClient({
      packageName: "@acme/private-source",
      versions: {
        "2.0.0": { version: "2.0.0", integrity: "sha512-private" },
      },
    });

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "private-registry",
          sourceValue: "@acme/private-source",
          channel: "internal",
        },
        registryClient: client,
        confirmSourceAccess: async () => undefined,
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "registry-missing-config" },
      });
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));

      expect(outcome.exitCode).toBe(1);
      expect(client.fetchPackageMetadata).not.toHaveBeenCalled();
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.authentication-required",
          details: expect.objectContaining({
            reason: "private-registry-explicit-config-required",
            sourceType: "private-registry",
            packageName: "@acme/private-source",
            channel: "internal",
            registryKind: "private",
          }),
        }),
      ]);
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "private-registry",
        channel: "internal",
        resolvedRoot: "@acme/private-source",
        trustStatus: "blocked",
      });
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

describe("validate registry source descriptor local-only boundary", () => {
  it("checks local registry descriptor evidence shape without calling a registry client", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-validate-"));

    try {
      await writeRegistryInstalledProjection(tempRoot, {
        sourceDescriptor: {
          sourceType: "npm",
          requestedVersion: "latest",
          version: "1.2.3",
          integrityEvidence: [],
          trustStatus: "unverified",
        },
      });

      const outcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "registry-local-validate" },
      });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.data.checkedCategories).toEqual(["manifest-schema"]);
      expect(parsed.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          category: "manifest-schema",
          affectedPath: "_speclite/_config/manifest.yaml",
          details: expect.objectContaining({
            reason: "invalid-field",
            artifactKind: "manifest",
            field: "sourceDescriptor.integrityEvidence",
          }),
        }),
      ]));
      expect(JSON.stringify(parsed)).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("flags trusted registry descriptors without verified registry or lock evidence", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-validate-"));

    try {
      await writeRegistryInstalledProjection(tempRoot, {
        sourceDescriptor: {
          sourceType: "npm",
          requestedVersion: "latest",
          version: "1.2.3",
          integrityEvidence: [
            {
              kind: "registry-integrity",
              packageName: "@acme/speclite-source",
              version: "1.2.3",
              integrity: "sha512-public",
              verified: false,
            },
          ],
          trustStatus: "trusted",
        },
      });

      const outcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "registry-local-validate" },
      });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          issueId: "manifest-schema.malformed-field",
          affectedPath: "_speclite/_config/manifest.yaml",
          details: expect.objectContaining({
            reason: "invalid-field",
            artifactKind: "manifest",
            field: "sourceDescriptor.trustStatus",
          }),
        }),
      ]));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("flags blocked installed registry descriptors as local source-integrity issues", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-validate-"));

    try {
      await writeRegistryInstalledProjection(tempRoot, {
        sourceDescriptor: {
          sourceType: "private-registry",
          channel: "internal",
          version: "2.0.0",
          integrityEvidence: [
            {
              kind: "registry-integrity",
              packageName: "@acme/private-source",
              version: "2.0.0",
              integrity: "sha512-private",
              verified: false,
            },
          ],
          trustStatus: "blocked",
        },
      });

      const outcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "registry-local-validate" },
      });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          affectedPath: "_speclite/_config/manifest.yaml",
          details: expect.objectContaining({
            reason: "installed-registry-source-blocked",
            sourceType: "private-registry",
            channel: "internal",
            registryKind: "private",
          }),
        }),
      ]));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("flags unverified registry descriptors that carry failed lock evidence", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-registry-validate-"));

    try {
      await writeRegistryInstalledProjection(tempRoot, {
        sourceDescriptor: {
          sourceType: "private-registry",
          channel: "internal",
          version: "2.0.0",
          integrityEvidence: [
            {
              kind: "version-lock",
              packageName: "@acme/private-source",
              version: "2.0.0",
              lockPath: "source-lock.json",
              verified: false,
            },
          ],
          trustStatus: "unverified",
        },
      });

      const outcome = await runValidateCommand({
        runtime: { cwd: tempRoot, targetProject: "registry-local-validate" },
      });
      const parsed = ValidateCommandResultSchema.parse(outcome.result);

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          issueId: "source-integrity.lock-mismatch",
          affectedPath: "_speclite/_config/manifest.yaml",
          details: expect.objectContaining({
            reason: "unverified-registry-source-with-failed-lock-evidence",
            sourceType: "private-registry",
            channel: "internal",
            registryKind: "private",
          }),
        }),
      ]));
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function selectRegistry(input: {
  sourceType: "npm" | "private-registry";
  sourceValue: string;
  requestedVersion?: string;
  channel?: string;
}) {
  const result = normalizeSourceSelection(input);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("expected valid source selection");
  return result.selection;
}

function registryClient(metadata: {
  packageName: string;
  distTags?: Record<string, string>;
  versions: Record<string, { version: string; integrity?: string }>;
}): RegistryMetadataClient {
  return {
    fetchPackageMetadata: vi.fn(async () => metadata),
  };
}

async function writeRegistryInstalledProjection(inputRoot: string, input: {
  sourceDescriptor: {
    sourceType: "npm" | "private-registry";
    requestedVersion?: string;
    channel?: string;
    version?: string;
    resolvedRoot?: string;
    integrityEvidence: unknown[];
    trustStatus: "trusted" | "unverified" | "blocked";
  };
}): Promise<void> {
  await mkdir(path.join(inputRoot, "_speclite/_config"), { recursive: true });
  await writeFile(
    path.join(inputRoot, "_speclite/_config/manifest.yaml"),
    [
      'schemaVersion: "speclite.manifest.v1"',
      "sourceDescriptor:",
      `  sourceType: "${input.sourceDescriptor.sourceType}"`,
      input.sourceDescriptor.channel === undefined
        ? undefined
        : `  channel: "${input.sourceDescriptor.channel}"`,
      input.sourceDescriptor.requestedVersion === undefined
        ? undefined
        : `  requestedVersion: "${input.sourceDescriptor.requestedVersion}"`,
      input.sourceDescriptor.version === undefined
        ? undefined
        : `  version: "${input.sourceDescriptor.version}"`,
      input.sourceDescriptor.resolvedRoot === undefined
        ? undefined
        : `  resolvedRoot: "${input.sourceDescriptor.resolvedRoot}"`,
      ...serializeIntegrityEvidence(input.sourceDescriptor.integrityEvidence),
      `  trustStatus: "${input.sourceDescriptor.trustStatus}"`,
      "installedModules:",
      '  - "core"',
      "targetIds:",
      '  - "claude"',
      "paths:",
      '  projectRoot: "."',
      '  specliteRoot: "_speclite"',
      '  artifactRoot: "_speclite-output"',
      '  manifestPath: "_speclite/_config/manifest.yaml"',
      "",
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n"),
    "utf8",
  );
  await writeFile(
    path.join(inputRoot, "_speclite/_config/skill-index.json"),
    JSON.stringify({ schemaVersion: "speclite.skill-index.v1", entries: [] }),
    "utf8",
  );
  await writeFile(
    path.join(inputRoot, "_speclite/_config/help-index.json"),
    JSON.stringify({ schemaVersion: "speclite.help-index.v1", entries: [] }),
    "utf8",
  );
  await writeFile(
    path.join(inputRoot, "_speclite/_config/files-index.json"),
    JSON.stringify({ schemaVersion: "speclite.files-index.v1", entries: [] }),
    "utf8",
  );
  await writeFile(
    path.join(inputRoot, "_speclite/_config/phase-coverage.json"),
    JSON.stringify({ schemaVersion: "speclite.phase-coverage.v1", rows: [] }),
    "utf8",
  );
}

function serializeIntegrityEvidence(evidence: unknown[]): string[] {
  if (evidence.length === 0) return ["  integrityEvidence: []"];
  return [
    "  integrityEvidence:",
    ...evidence.flatMap((entry) => serializeIntegrityEvidenceEntry(entry)),
  ];
}

function serializeIntegrityEvidenceEntry(entry: unknown): string[] {
  if (!isRecord(entry)) throw new Error("expected integrity evidence object");
  return Object.entries(entry).map(([key, value], index) => {
    const prefix = index === 0 ? "    - " : "      ";
    return `${prefix}${key}: ${JSON.stringify(value)}`;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
