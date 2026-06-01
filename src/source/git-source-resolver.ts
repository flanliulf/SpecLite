import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import {
  FULL_GIT_COMMIT_SHA_PATTERN,
  type SourceDescriptor,
  type SourceIntegrityEvidence,
} from "./source-descriptor-schema.js";
import type { NormalizedSourceSelection } from "./source-selection.js";
import {
  createBlockedGitDescriptor,
  createGitSourceIntegrityIssue,
  type GitRequestedRefKind,
} from "./source-integrity.js";
import { deriveSourceTrustStatus } from "./source-trust.js";

export type GitClient = {
  lsRemote: (input: {
    remoteUrl: string;
    requestedRef: string;
  }) => Promise<string>;
  verifyCommit: (input: {
    remoteUrl: string;
    commitish: string;
    requestedRefKind: GitRequestedRefKind;
  }) => Promise<string | undefined>;
};

export type GitResolutionResult =
  | {
      ok: true;
      descriptor: SourceDescriptor;
    }
  | {
      ok: false;
      descriptor: SourceDescriptor;
      issues: ValidationIssue[];
    };

export class GitSourceResolutionError extends Error {
  constructor(
    public readonly code:
      | "authentication-required"
      | "ref-unresolved"
      | "remote-unreachable"
      | "unsupported-source",
    message: string,
  ) {
    super(message);
    this.name = "GitSourceResolutionError";
  }
}

export async function resolveGitSource(input: {
  selection: NormalizedSourceSelection;
  gitClient: GitClient;
  expectedCommitSha?: string | undefined;
  expectedLockPath?: string | undefined;
}): Promise<GitResolutionResult> {
  if (input.selection.sourceType !== "git") {
    return blocked(input.selection, [
      createGitSourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "unsupported-git-source-type",
        requestedRefKind: "missing",
      }),
    ]);
  }

  const requestedRef = input.selection.requestedVersion;
  const requestedRefKind = classifyRequestedRef(requestedRef);
  if (requestedRef === undefined) {
    return blocked(input.selection, [
      createGitSourceIntegrityIssue({
        issueId: "source-integrity.floating-git-source",
        reason: "floating-git-source",
        requestedRefKind,
      }),
    ]);
  }

  const remoteUrl = input.selection.rawSourceValue;
  if (remoteUrl === undefined || remoteUrl.trim().length === 0) {
    return blocked(input.selection, [
      createGitSourceIntegrityIssue({
        issueId: "source-integrity.unsupported-source",
        reason: "missing-private-git-remote",
        requestedRefKind,
      }),
    ]);
  }

  let output: string;
  try {
    output = await input.gitClient.lsRemote({
      remoteUrl,
      requestedRef,
    });
  } catch (error) {
    return blocked(input.selection, [
      createGitFailureIssue({ error, requestedRefKind }),
    ]);
  }

  const commitish = selectResolvedCommitSha({
    output,
    requestedRef,
    requestedRefKind,
  });
  if (commitish === undefined) {
    return blocked(input.selection, [
      createGitSourceIntegrityIssue({
        issueId: "source-integrity.floating-git-source",
        reason: "git-ref-unresolved",
        requestedRefKind,
      }),
    ]);
  }

  let verifiedCommitSha: string | undefined;
  try {
    verifiedCommitSha = await input.gitClient.verifyCommit({
      remoteUrl,
      commitish,
      requestedRefKind,
    });
  } catch {
    verifiedCommitSha = undefined;
  }
  if (
    verifiedCommitSha === undefined ||
    !FULL_GIT_COMMIT_SHA_PATTERN.test(verifiedCommitSha) ||
    (requestedRefKind === "commit" && verifiedCommitSha.toLowerCase() !== requestedRef.toLowerCase())
  ) {
    return blocked(input.selection, [
      createGitSourceIntegrityIssue({
        issueId: "source-integrity.floating-git-source",
        reason: "git-commit-verification-failed",
        requestedRefKind,
      }),
    ]);
  }

  const commitSha = verifiedCommitSha.toLowerCase();
  const evidence = createGitCommitEvidence({
    commitSha,
    expectedCommitSha: input.expectedCommitSha,
  });
  if (input.expectedCommitSha !== undefined && evidence.verified !== true) {
    return blocked(
      input.selection,
      [
        createGitSourceIntegrityIssue({
          issueId: "source-integrity.hash-mismatch",
          reason: "git-commit-hash-mismatch",
          requestedRefKind,
          hasResolvedCommit: true,
        }),
      ],
      commitSha,
      [evidence],
    );
  }
  if (input.expectedLockPath !== undefined && !isProjectRelativeLockPath(input.expectedLockPath)) {
    return blocked(
      input.selection,
      [
        createGitSourceIntegrityIssue({
          issueId: "source-integrity.lock-mismatch",
          reason: "git-source-lock-mismatch",
          requestedRefKind,
          hasResolvedCommit: true,
        }),
      ],
      commitSha,
      [evidence],
    );
  }

  return {
    ok: true,
    descriptor: {
      sourceType: "git",
      requestedVersion: requestedRef,
      version: commitSha,
      resolvedRoot: "redacted-git-remote",
      integrityEvidence: [evidence],
      trustStatus: deriveSourceTrustStatus({
        integrityEvidence: [evidence],
        explicitlyConfirmed: true,
      }),
    },
  };
}

export function createDefaultGitClient(): GitClient {
  return {
    lsRemote: async ({ remoteUrl, requestedRef }) => runGitLsRemote({ remoteUrl, requestedRef }),
    verifyCommit: async ({ remoteUrl, commitish }) => runGitVerifyCommit({ remoteUrl, commitish }),
  };
}

function runGitLsRemote(input: {
  remoteUrl: string;
  requestedRef: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "git",
      ["ls-remote", "--quiet", "--exit-code", input.remoteUrl, input.requestedRef],
      {
        timeout: 15_000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          reject(createGitProcessError(error, stderr));
          return;
        }
        resolve(stdout);
      },
    );
    child.stdin?.end();
  });
}

async function runGitVerifyCommit(input: {
  remoteUrl: string;
  commitish: string;
}): Promise<string | undefined> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-git-verify-"));
  try {
    await runGitCommand(["init", "--quiet"], tempRoot);
    await runGitCommand(
      ["fetch", "--quiet", "--depth=1", "--no-tags", input.remoteUrl, input.commitish],
      tempRoot,
    );
    const stdout = await runGitCommand(
      ["rev-parse", "--verify", "--end-of-options", "FETCH_HEAD^{commit}"],
      tempRoot,
    );
    const commitSha = stdout.trim().toLowerCase();
    return FULL_GIT_COMMIT_SHA_PATTERN.test(commitSha) ? commitSha : undefined;
  } catch {
    return undefined;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

function runGitCommand(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      "git",
      args,
      {
        cwd,
        timeout: 15_000,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout) => {
        if (error !== null) {
          reject(error);
          return;
        }
        resolve(stdout);
      },
    );
    child.stdin?.end();
  });
}

function createGitProcessError(error: unknown, stderr: string): GitSourceResolutionError {
  const code = readErrorCode(error);
  const redactedMessage = "Git ls-remote failed.";
  if (code === 2) {
    return new GitSourceResolutionError("ref-unresolved", redactedMessage);
  }
  if (/authentication|permission denied|access denied|could not read username/i.test(stderr)) {
    return new GitSourceResolutionError("authentication-required", redactedMessage);
  }
  return new GitSourceResolutionError("remote-unreachable", redactedMessage);
}

function createGitFailureIssue(input: {
  error: unknown;
  requestedRefKind: GitRequestedRefKind;
}): ValidationIssue {
  const rawCode =
    input.error instanceof GitSourceResolutionError
      ? input.error.code
      : readObjectCode(input.error);
  const code =
    rawCode === "authentication-required"
      ? "authentication-required"
      : rawCode === "ref-unresolved"
        ? "ref-unresolved"
        : rawCode === "unsupported-source"
          ? "unsupported-source"
          : "remote-unreachable";
  const issueId =
    code === "authentication-required"
      ? "source-integrity.authentication-required"
      : "source-integrity.unsupported-source";

  return createGitSourceIntegrityIssue({
    issueId,
    reason: code === "ref-unresolved" ? "git-ref-unresolved" : code,
    requestedRefKind: input.requestedRefKind,
  });
}

function selectResolvedCommitSha(input: {
  output: string;
  requestedRef: string;
  requestedRefKind: GitRequestedRefKind;
}): string | undefined {
  const refs = parseLsRemoteOutput(input.output);
  if (refs.length === 0) return undefined;
  if (input.requestedRefKind === "commit") {
    return refs.some((entry) => entry.oid.toLowerCase() === input.requestedRef.toLowerCase())
      ? input.requestedRef.toLowerCase()
      : undefined;
  }

  const candidates = createRefCandidates(input.requestedRef);
  for (const candidate of candidates) {
    const matched = refs.find((entry) => entry.ref === candidate);
    if (matched !== undefined) return matched.oid.toLowerCase();
  }
  return undefined;
}

function parseLsRemoteOutput(output: string): Array<{ oid: string; ref: string }> {
  const refs: Array<{ oid: string; ref: string }> = [];
  for (const line of output.split(/\r?\n/)) {
    if (line.trim().length === 0) continue;
    const match = /^([a-f0-9]{40})\t([^\t]+)$/.exec(line);
    if (match === null) continue;
    const [, oid, ref] = match;
    if (oid === undefined || ref === undefined) continue;
    refs.push({ oid: oid.toLowerCase(), ref });
  }
  return refs;
}

function createRefCandidates(requestedRef: string): string[] {
  if (requestedRef.startsWith("refs/")) return [requestedRef, `${requestedRef}^{}`];
  return [
    `refs/heads/${requestedRef}`,
    `refs/tags/${requestedRef}^{}`,
    `refs/tags/${requestedRef}`,
    requestedRef,
  ];
}

function createGitCommitEvidence(input: {
  commitSha: string;
  expectedCommitSha?: string | undefined;
}): SourceIntegrityEvidence {
  return {
    kind: "git-commit",
    commitSha: input.commitSha,
    verified:
      input.expectedCommitSha !== undefined &&
      input.expectedCommitSha.toLowerCase() === input.commitSha.toLowerCase(),
  };
}

function classifyRequestedRef(requestedRef: string | undefined): GitRequestedRefKind {
  if (requestedRef === undefined) return "missing";
  if (FULL_GIT_COMMIT_SHA_PATTERN.test(requestedRef)) return "commit";
  if (requestedRef.startsWith("refs/")) return "full-ref";
  if (/^v?\d+(?:\.\d+){1,3}(?:[-+][a-z0-9._-]+)?$/i.test(requestedRef)) return "tag";
  if (/^[A-Za-z0-9._/-]+$/.test(requestedRef)) return "branch";
  return "symbolic";
}

function blocked(
  selection: NormalizedSourceSelection,
  issues: ValidationIssue[],
  version?: string,
  integrityEvidence?: SourceDescriptor["integrityEvidence"],
): GitResolutionResult {
  return {
    ok: false,
    descriptor: createBlockedGitDescriptor({
      requestedVersion: selection.requestedVersion,
      version,
      integrityEvidence,
    }),
    issues,
  };
}

function isProjectRelativeLockPath(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("\\") &&
    !value.startsWith("/") &&
    !value.startsWith("~") &&
    !/^[A-Za-z]:(?:\/|$)/.test(value) &&
    value !== "." &&
    value !== ".." &&
    !value.startsWith("../") &&
    !value.includes("/../")
  );
}

function readErrorCode(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "number" ? code : undefined;
  }
  return undefined;
}

function readObjectCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}
