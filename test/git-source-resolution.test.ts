import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runStatusCommand } from "../src/commands/status.js";
import { runValidateCommand } from "../src/commands/validate.js";
import {
  InstallCommandResultSchema,
  ValidateCommandResultSchema,
} from "../src/diagnostics/command-result-schema.js";
import { renderCommandResultJson, renderInstallHumanOutput } from "../src/diagnostics/output.js";
import {
  GitSourceResolutionError,
  resolveGitSource,
  type GitClient,
} from "../src/source/git-source-resolver.js";
import { SourceDescriptorSchema } from "../src/source/source-descriptor-schema.js";
import { normalizeSourceSelection } from "../src/source/source-selection.js";
import { validateSourceIntegrity } from "../src/validation/rules/source-integrity.js";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const commitSha = "0123456789abcdef0123456789abcdef01234567";

describe("git source resolver boundary", () => {
  it("resolves branch, tag, full ref and explicit commit selectors to concrete git-commit evidence", async () => {
    const cases = [
      {
        requestedVersion: "main",
        output: `${commitSha}\trefs/heads/main\n`,
      },
      {
        requestedVersion: "v1.2.3",
        output: [
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\trefs/tags/v1.2.3",
          `${commitSha}\trefs/tags/v1.2.3^{}`,
          "",
        ].join("\n"),
      },
      {
        requestedVersion: "refs/heads/release",
        output: `${commitSha}\trefs/heads/release\n`,
      },
      {
        requestedVersion: commitSha,
        output: `${commitSha}\tHEAD\n`,
      },
    ];

    for (const { requestedVersion, output } of cases) {
      const gitClient = {
        lsRemote: vi.fn(async () => output),
        verifyCommit: vi.fn(async () => commitSha),
      };
      const resolved = await resolveGitSource({
        selection: selectGit({
          sourceValue: "https://token:secret@git.example.test/acme/source.git?private=secret",
          requestedVersion,
        }),
        gitClient,
      });
      const publicText = JSON.stringify(resolved);

      expect(resolved).toEqual({
        ok: true,
        descriptor: {
          sourceType: "git",
          requestedVersion,
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
      });
      expect(gitClient.verifyCommit).toHaveBeenCalledWith({
        remoteUrl: "https://token:secret@git.example.test/acme/source.git?private=secret",
        commitish: commitSha,
        requestedRefKind: expect.any(String),
      });
      expect(publicText).not.toContain("token");
      expect(publicText).not.toContain("secret");
      expect(publicText).not.toContain("git.example.test");
    }
  });

  it("dereferences annotated tag objects to verified commit-ish SHA before writing evidence", async () => {
    const annotatedTagObjectOid = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const gitClient = {
      lsRemote: vi.fn(async () => `${annotatedTagObjectOid}\trefs/tags/v2.0.0\n`),
      verifyCommit: vi.fn(async () => commitSha),
    };

    const resolved = await resolveGitSource({
      selection: selectGit({
        sourceValue: "https://git.example.test/acme/source.git",
        requestedVersion: "v2.0.0",
      }),
      gitClient,
    });

    expect(resolved).toMatchObject({
      ok: true,
      descriptor: {
        requestedVersion: "v2.0.0",
        version: commitSha,
        integrityEvidence: [
          {
            kind: "git-commit",
            commitSha,
            verified: false,
          },
        ],
      },
    });
    expect(JSON.stringify(resolved)).not.toContain(annotatedTagObjectOid);
  });

  it("blocks explicit SHA selectors that are not verified as the same commit object", async () => {
    const annotatedTagObjectOid = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const nonCommitObjectOid = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const cases = [
      {
        requestedVersion: annotatedTagObjectOid,
        output: `${annotatedTagObjectOid}\trefs/tags/v1.0.0\n`,
        verifiedCommitSha: commitSha,
      },
      {
        requestedVersion: nonCommitObjectOid,
        output: `${nonCommitObjectOid}\trefs/tags/blob-ish\n`,
        verifiedCommitSha: undefined,
      },
    ];

    for (const { requestedVersion, output, verifiedCommitSha } of cases) {
      const resolved = await resolveGitSource({
        selection: selectGit({
          sourceValue: "https://git.example.test/acme/source.git",
          requestedVersion,
        }),
        gitClient: {
          lsRemote: vi.fn(async () => output),
          verifyCommit: vi.fn(async () => verifiedCommitSha),
        },
      });

      expect(resolved).toMatchObject({
        ok: false,
        descriptor: {
          sourceType: "git",
          requestedVersion,
          integrityEvidence: [],
          trustStatus: "blocked",
        },
        issues: [
          {
            issueId: "source-integrity.floating-git-source",
            details: {
              reason: "git-commit-verification-failed",
              sourceType: "git",
              requestedRefKind: "commit",
              remoteKind: "redacted-git-remote",
              hasResolvedCommit: false,
            },
          },
        ],
      });
    }
  });

  it("blocks branch and tag selectors when commit-ish verification fails", async () => {
    const advertisedOid = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const cases = [
      {
        requestedVersion: "main",
        output: `${advertisedOid}\trefs/heads/main\n`,
        requestedRefKind: "branch",
      },
      {
        requestedVersion: "v1.0.0",
        output: `${advertisedOid}\trefs/tags/v1.0.0\n`,
        requestedRefKind: "tag",
      },
      {
        requestedVersion: "refs/heads/release",
        output: `${advertisedOid}\trefs/heads/release\n`,
        requestedRefKind: "full-ref",
      },
    ];

    for (const { requestedVersion, output, requestedRefKind } of cases) {
      const resolved = await resolveGitSource({
        selection: selectGit({
          sourceValue: "https://git.example.test/acme/source.git",
          requestedVersion,
        }),
        gitClient: {
          lsRemote: vi.fn(async () => output),
          verifyCommit: vi.fn(async () => undefined),
        },
      });

      expect(resolved).toMatchObject({
        ok: false,
        issues: [
          {
            issueId: "source-integrity.floating-git-source",
            details: {
              reason: "git-commit-verification-failed",
              requestedRefKind,
              hasResolvedCommit: false,
            },
          },
        ],
      });
    }
  });

  it("maps commit-ish verification exceptions to stable blocked diagnostics", async () => {
    const resolved = await resolveGitSource({
      selection: selectGit({
        sourceValue: "https://git.example.test/acme/source.git",
        requestedVersion: "main",
      }),
      gitClient: {
        lsRemote: vi.fn(async () => `${commitSha}\trefs/heads/main\n`),
        verifyCommit: vi.fn(async () => {
          throw new Error("raw git verification failure should not leak");
        }),
      },
    });

    expect(resolved).toMatchObject({
      ok: false,
      issues: [
        {
          issueId: "source-integrity.floating-git-source",
          details: {
            reason: "git-commit-verification-failed",
            sourceType: "git",
            requestedRefKind: "branch",
            remoteKind: "redacted-git-remote",
            hasResolvedCommit: false,
          },
        },
      ],
    });
    expect(JSON.stringify(resolved)).not.toContain("raw git verification failure");
  });

  it("derives trusted only from an explicit expected commit trust anchor", async () => {
    const trusted = await resolveGitSource({
      selection: selectGit({
        sourceValue: "https://git.example.test/acme/source.git",
        requestedVersion: "main",
      }),
      gitClient: {
        lsRemote: vi.fn(async () => `${commitSha}\trefs/heads/main\n`),
        verifyCommit: vi.fn(async () => commitSha),
      },
      expectedCommitSha: commitSha,
    });
    const mismatch = await resolveGitSource({
      selection: selectGit({
        sourceValue: "https://git.example.test/acme/source.git",
        requestedVersion: "main",
      }),
      gitClient: {
        lsRemote: vi.fn(async () => `${commitSha}\trefs/heads/main\n`),
        verifyCommit: vi.fn(async () => commitSha),
      },
      expectedCommitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    expect(trusted).toMatchObject({
      ok: true,
      descriptor: {
        trustStatus: "trusted",
        integrityEvidence: [
          {
            kind: "git-commit",
            commitSha,
            verified: true,
          },
        ],
      },
    });
    expect(mismatch).toMatchObject({
      ok: false,
      descriptor: {
        sourceType: "git",
        version: commitSha,
        integrityEvidence: [
          {
            kind: "git-commit",
            commitSha,
            verified: false,
          },
        ],
        trustStatus: "blocked",
      },
      issues: [
        {
          issueId: "source-integrity.hash-mismatch",
          details: {
            reason: "git-commit-hash-mismatch",
            sourceType: "git",
            requestedRefKind: "branch",
            remoteKind: "redacted-git-remote",
            hasResolvedCommit: true,
          },
        },
      ],
    });
  });

  it("blocks unsupported or unresolved Git selectors with stable redacted diagnostics", async () => {
    const unresolved = await resolveGitSource({
      selection: selectGit({
        sourceValue: "ssh://user@git.example.test/acme/source.git",
        requestedVersion: "feature work",
      }),
      gitClient: {
        lsRemote: vi.fn(async () => ""),
        verifyCommit: vi.fn(async () => undefined),
      },
    });
    const unreachable = await resolveGitSource({
      selection: selectGit({
        sourceValue: "ssh://user@git.example.test/acme/source.git",
        requestedVersion: "main",
      }),
      gitClient: {
        lsRemote: vi.fn(async () => {
          throw new GitSourceResolutionError("remote-unreachable", "raw remote should not leak");
        }),
        verifyCommit: vi.fn(async () => undefined),
      },
    });

    expect(unresolved).toMatchObject({
      ok: false,
      issues: [
        {
          issueId: "source-integrity.floating-git-source",
          details: {
            reason: "git-ref-unresolved",
            sourceType: "git",
            requestedRefKind: "symbolic",
            remoteKind: "redacted-git-remote",
            hasResolvedCommit: false,
          },
        },
      ],
    });
    expect(unreachable).toMatchObject({
      ok: false,
      issues: [
        {
          issueId: "source-integrity.unsupported-source",
          details: {
            reason: "remote-unreachable",
            sourceType: "git",
            requestedRefKind: "branch",
            remoteKind: "redacted-git-remote",
            hasResolvedCommit: false,
          },
        },
      ],
    });
    expect(JSON.stringify({ unresolved, unreachable })).not.toContain("git.example.test");
    expect(JSON.stringify({ unresolved, unreachable })).not.toContain("raw remote");
  });

  it("does not call the Git client before explicit source access confirmation", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-pending-"));
    const gitClient = {
      lsRemote: vi.fn(async () => `${commitSha}\trefs/heads/main\n`),
      verifyCommit: vi.fn(async () => commitSha),
    };

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "git",
          sourceValue: "https://token:secret@git.example.test/acme/source.git?private=secret",
          requestedVersion: "main",
        },
        gitClient,
        runtime: { ...supportedRuntime, cwd: tempRoot },
      } as unknown as Parameters<typeof runInstallCommand>[0]);
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(1);
      expect(gitClient.lsRemote).not.toHaveBeenCalled();
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.unsupported-source",
          details: {
            reason: "source-access-not-confirmed",
            requestedSourceType: "git",
          },
        }),
      ]);
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "git",
        requestedVersion: "main",
        resolvedRoot: "redacted-git-remote",
        trustStatus: "blocked",
      });
      expect(output).toContain("- 来源：git");
      expect(output).toContain("  - confirmationState：pending");
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain("git.example.test");
      await expect(access(path.join(tempRoot, "_speclite"))).rejects.toMatchObject({ code: "ENOENT" });
      expect(outcome.installPlan).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("resolves a confirmed Git branch to git-commit evidence without treating the branch as resolved version", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-confirmed-"));
    const gitClient = {
      lsRemote: vi.fn(async () => `${commitSha}\trefs/heads/main\n`),
      verifyCommit: vi.fn(async () => commitSha),
    };

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "git",
          sourceValue: "https://token:secret@git.example.test/acme/source.git?private=secret",
          requestedVersion: "main",
        },
        gitClient,
        confirmSourceAccess: async () => undefined,
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "git-confirmed" },
      } as unknown as Parameters<typeof runInstallCommand>[0]);
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(0);
      expect(gitClient.lsRemote).toHaveBeenCalledWith({
        remoteUrl: "https://token:secret@git.example.test/acme/source.git?private=secret",
        requestedRef: "main",
      });
      expect(parsed.data.sourceDescriptor).toEqual({
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
      });
      expect(output).toContain(`"version": "${commitSha}"`);
      expect(output).toContain("trustStatus=unverified");
      expect(output).toContain("confirmationState=confirmed");
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain("git.example.test");
      expect(output).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("blocks confirmed remote-only Git sources before install planning", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-floating-"));
    const gitClient = { lsRemote: vi.fn(async () => `${commitSha}\tHEAD\n`) };

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "git",
          sourceValue: "https://token:secret@git.example.test/acme/source.git?private=secret",
        },
        gitClient,
        confirmSourceAccess: async () => undefined,
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "git-floating" },
      } as unknown as Parameters<typeof runInstallCommand>[0]);
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(1);
      expect(gitClient.lsRemote).not.toHaveBeenCalled();
      expect(parsed.issues).toEqual([
        await readJsonFixture("test/fixtures/source-integrity/git-floating-blocked/expected/issue.json"),
      ]);
      expect(parsed.data.sourceDescriptor).toMatchObject({
        sourceType: "git",
        resolvedRoot: "redacted-git-remote",
        integrityEvidence: [],
        trustStatus: "blocked",
      });
      expect(parsed.data.completedSteps).toEqual(["source-discovery"]);
      expect(parsed.data.pendingSteps).toContain("module-selection");
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain("git.example.test");
      await expect(access(path.join(tempRoot, "_speclite"))).rejects.toMatchObject({ code: "ENOENT" });
      expect(outcome.installPlan).toBeUndefined();
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("maps Git authentication failures to stable redacted source-integrity diagnostics", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-auth-"));
    const gitClient = {
      lsRemote: vi.fn(async () => {
        throw Object.assign(
          new Error("fatal: Authentication failed for https://token:secret@git.example.test/acme/source.git"),
          { code: "authentication-required" },
        );
      }),
    };

    try {
      const outcome = await runInstallCommand({
        options: {
          json: true,
          yes: true,
          sourceType: "git",
          sourceValue: "https://token:secret@git.example.test/acme/source.git?private=secret",
          requestedVersion: "main",
        },
        gitClient,
        confirmSourceAccess: async () => undefined,
        runtime: { ...supportedRuntime, cwd: tempRoot, targetProject: "git-auth" },
      } as unknown as Parameters<typeof runInstallCommand>[0]);
      const parsed = InstallCommandResultSchema.parse(JSON.parse(renderCommandResultJson(outcome.result)));
      const output = `${renderCommandResultJson(parsed)}\n${renderInstallHumanOutput(parsed)}`;

      expect(outcome.exitCode).toBe(1);
      expect(parsed.issues).toEqual([
        expect.objectContaining({
          issueId: "source-integrity.authentication-required",
          category: "source-integrity",
          component: "git-source-resolution",
          details: {
            reason: "authentication-required",
            sourceType: "git",
            requestedRefKind: "branch",
            remoteKind: "redacted-git-remote",
            hasResolvedCommit: false,
          },
        }),
      ]);
      expect(output).not.toContain("token");
      expect(output).not.toContain("secret");
      expect(output).not.toContain("git.example.test");
      expect(output).not.toContain("fatal:");
      expect(output).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

function selectGit(input: {
  sourceValue: string;
  requestedVersion?: string;
}) {
  const selection = normalizeSourceSelection({
    sourceType: "git",
    sourceValue: input.sourceValue,
    ...(input.requestedVersion === undefined ? {} : { requestedVersion: input.requestedVersion }),
  });
  expect(selection.ok).toBe(true);
  if (!selection.ok) throw new Error("selection failed");
  return selection.selection;
}

async function readJsonFixture(relativePath: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(process.cwd(), relativePath), "utf8"));
}

describe("validate/status Git descriptor local-only boundary", () => {
  it("requires installed Git descriptor version and git-commit evidence to use full SHA shape", () => {
    const invalidDescriptors = [
      { version: "main", commitSha: "main", requestedVersion: "main" },
      { version: "0123456", commitSha: "0123456", requestedVersion: "0123456" },
      { version: "v1.2.3", commitSha: "v1.2.3", requestedVersion: "v1.2.3" },
      {
        version: "refs/heads/main",
        commitSha: "refs/heads/main",
        requestedVersion: "refs/heads/main",
      },
      { version: "HEAD", commitSha: "HEAD", requestedVersion: "HEAD" },
    ];

    for (const descriptor of invalidDescriptors) {
      expect(() =>
        SourceDescriptorSchema.parse({
          sourceType: "git",
          requestedVersion: descriptor.requestedVersion,
          version: descriptor.version,
          resolvedRoot: "redacted-git-remote",
          integrityEvidence: [
            {
              kind: "git-commit",
              commitSha: descriptor.commitSha,
              verified: false,
            },
          ],
          trustStatus: "unverified",
        }),
      ).toThrow();

      const result = validateSourceIntegrity({
        manifest: {
          schemaVersion: "speclite.manifest.v1",
          sourceDescriptor: {
            sourceType: "git",
            requestedVersion: descriptor.requestedVersion,
            version: descriptor.version,
            resolvedRoot: "redacted-git-remote",
            integrityEvidence: [
              {
                kind: "git-commit",
                commitSha: descriptor.commitSha,
                verified: false,
              },
            ],
            trustStatus: "unverified",
          },
          installedModules: [],
          targetIds: [],
          paths: {
            projectRoot: ".",
            specliteRoot: "_speclite",
            artifactRoot: "_speclite-output",
            manifestPath: "_speclite/_config/manifest.yaml",
          },
        },
      });

      expect(result).toEqual({
        issues: [
          expect.objectContaining({
            issueId: "source-integrity.floating-git-source",
            affectedPath: "_speclite/_config/manifest.yaml",
            details: expect.objectContaining({
              reason: "invalid-git-commit-evidence-shape",
              sourceType: "git",
              remoteKind: "redacted-git-remote",
              hasResolvedCommit: false,
            }),
          }),
        ],
        validatedPaths: ["_speclite/_config/manifest.yaml"],
      });
    }
  });

  it("checks recorded Git descriptor evidence shape without a Git client", () => {
    const valid = validateSourceIntegrity({
      manifest: {
        schemaVersion: "speclite.manifest.v1",
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
        installedModules: [],
        targetIds: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      },
    });
    const missingEvidence = validateSourceIntegrity({
      manifest: {
        schemaVersion: "speclite.manifest.v1",
        sourceDescriptor: {
          sourceType: "git",
          requestedVersion: "main",
          resolvedRoot: "redacted-git-remote",
          integrityEvidence: [],
          trustStatus: "unverified",
        },
        installedModules: [],
        targetIds: [],
        paths: {
          projectRoot: ".",
          specliteRoot: "_speclite",
          artifactRoot: "_speclite-output",
          manifestPath: "_speclite/_config/manifest.yaml",
        },
      },
    });

    expect(valid).toEqual({
      issues: [],
      validatedPaths: ["_speclite/_config/manifest.yaml"],
    });
    expect(missingEvidence.issues).toEqual([
      expect.objectContaining({
        issueId: "source-integrity.floating-git-source",
        affectedPath: "_speclite/_config/manifest.yaml",
        details: {
          reason: "missing-git-commit-evidence",
          sourceType: "git",
          requestedRefKind: "branch",
          remoteKind: "redacted-git-remote",
          hasResolvedCommit: false,
        },
      }),
    ]);
  });

  it("status and validate read an installed Git descriptor locally without remote freshness checks", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-installed-"));

    try {
      await writeGitInstalledProjection(tempRoot);

      const status = await runStatusCommand({
        options: { json: true },
        runtime: { cwd: tempRoot, targetProject: "git-installed" },
      });
      const validation = await runValidateCommand({
        options: { json: true },
        runtime: { cwd: tempRoot, targetProject: "git-installed" },
      });
      const parsedValidation = ValidateCommandResultSchema.parse(validation.result);

      expect(status.result.status).toBe("success");
      expect(status.result.data.sourceDescriptor).toMatchObject({
        sourceType: "git",
        requestedVersion: "main",
        version: commitSha,
        trustStatus: "unverified",
      });
      expect(parsedValidation.data.checkedCategories).toContain("source-integrity");
      expect(parsedValidation.issues).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: "source-integrity" }),
        ]),
      );
      expect(JSON.stringify({ status, validation })).not.toContain(tempRoot);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function writeGitInstalledProjection(inputRoot: string): Promise<void> {
  await mkdir(path.join(inputRoot, "_speclite/_config"), { recursive: true });
  await writeFile(
    path.join(inputRoot, "_speclite/_config/manifest.yaml"),
    [
      'schemaVersion: "speclite.manifest.v1"',
      "sourceDescriptor:",
      '  sourceType: "git"',
      '  requestedVersion: "main"',
      `  version: "${commitSha}"`,
      '  resolvedRoot: "redacted-git-remote"',
      "  integrityEvidence:",
      '    - kind: "git-commit"',
      `      commitSha: "${commitSha}"`,
      "      verified: false",
      '  trustStatus: "unverified"',
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
    ].join("\n"),
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
