import { z } from "zod";

export const FULL_GIT_COMMIT_SHA_PATTERN = /^[a-f0-9]{40}$/i;
export const GitCommitShaSchema = z.string().regex(FULL_GIT_COMMIT_SHA_PATTERN);

export const SourceTypeSchema = z.enum([
  "npm",
  "private-registry",
  "local-tarball",
  "offline-bundle",
  "git",
  "bundled",
  "local",
]);

export const SourceIntegrityEvidenceSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("registry-integrity"),
      packageName: z.string().min(1),
      version: z.string().min(1),
      integrity: z.string().min(1),
      verified: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("version-lock"),
      packageName: z.string().min(1),
      version: z.string().min(1),
      lockPath: z.string().min(1),
      verified: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("content-hash"),
      algorithm: z.literal("sha256"),
      value: z.string().min(1),
      verified: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("git-commit"),
      commitSha: GitCommitShaSchema,
      verified: z.boolean(),
    })
    .strict(),
]);

export const SourceDescriptorSchema = z
  .object({
    sourceType: SourceTypeSchema,
    channel: z.string().min(1).optional(),
    requestedVersion: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    resolvedRoot: z.string().min(1).optional(),
    contentHash: z.string().min(1).optional(),
    integrityEvidence: z.array(SourceIntegrityEvidenceSchema),
    trustStatus: z.enum(["trusted", "unverified", "blocked"]),
  })
  .strict()
  .superRefine((descriptor, context) => {
    if (descriptor.trustStatus !== "blocked" && descriptor.integrityEvidence.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Non-blocked source descriptors must include reproducible integrity evidence.",
        path: ["integrityEvidence"],
      });
    }

    if (
      descriptor.trustStatus === "trusted" &&
      !descriptor.integrityEvidence.some((evidence) => evidence.verified)
    ) {
      context.addIssue({
        code: "custom",
        message: "Trusted source descriptors require a verified trust anchor.",
        path: ["trustStatus"],
      });
    }

    if (!isCanonicalEvidenceOrder(descriptor.integrityEvidence)) {
      context.addIssue({
        code: "custom",
        message: "integrityEvidence must use canonical source descriptor ordering.",
        path: ["integrityEvidence"],
      });
    }

    if (descriptor.resolvedRoot !== undefined && !isPublicSafeResolvedRoot(descriptor.resolvedRoot)) {
      context.addIssue({
        code: "custom",
        message: "resolvedRoot must be project-relative POSIX or a display-safe source label.",
        path: ["resolvedRoot"],
      });
    }

    if (
      (descriptor.sourceType === "npm" ||
        descriptor.sourceType === "private-registry" ||
        descriptor.sourceType === "git") &&
      descriptor.contentHash !== undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "Registry and Git source descriptors must not expose contentHash.",
        path: ["contentHash"],
      });
    }

    if (
      descriptor.trustStatus !== "blocked" &&
      isContentAddressableSourceType(descriptor.sourceType)
    ) {
      if (descriptor.contentHash === undefined) {
        context.addIssue({
          code: "custom",
          message: "Content-addressable source descriptors require contentHash.",
          path: ["contentHash"],
        });
      }
      if (
        descriptor.contentHash !== undefined &&
        !descriptor.integrityEvidence.some(
          (evidence) => evidence.kind === "content-hash" && evidence.value === descriptor.contentHash,
        )
      ) {
        context.addIssue({
          code: "custom",
          message: "contentHash must match a content-hash integrity evidence entry.",
          path: ["integrityEvidence"],
        });
      }
    }

    if (
      descriptor.sourceType === "git" &&
      descriptor.version !== undefined &&
      !FULL_GIT_COMMIT_SHA_PATTERN.test(descriptor.version)
    ) {
      context.addIssue({
        code: "custom",
        message: "Git source descriptor version must be a full commit SHA.",
        path: ["version"],
      });
    }
  });

export type SourceType = z.infer<typeof SourceTypeSchema>;
export type SourceIntegrityEvidence = z.infer<typeof SourceIntegrityEvidenceSchema>;
export type SourceDescriptor = z.infer<typeof SourceDescriptorSchema>;

export const PREWRITE_BUNDLED_SOURCE_DESCRIPTOR: SourceDescriptor = {
  sourceType: "bundled",
  resolvedRoot: "assets/source/speclite",
  integrityEvidence: [],
  trustStatus: "blocked",
};

export function sortSourceIntegrityEvidence(
  evidence: SourceIntegrityEvidence[],
): SourceIntegrityEvidence[] {
  return [...evidence].sort((left, right) => {
    const leftKey = evidenceKey(left);
    const rightKey = evidenceKey(right);
    return evidenceOrder(left.kind) - evidenceOrder(right.kind) || leftKey.localeCompare(rightKey);
  });
}

function isCanonicalEvidenceOrder(evidence: SourceIntegrityEvidence[]): boolean {
  const sorted = sortSourceIntegrityEvidence(evidence);
  return evidence.every((entry, index) => evidenceKey(entry) === evidenceKey(sorted[index]!) &&
    evidenceOrder(entry.kind) === evidenceOrder(sorted[index]!.kind));
}

function evidenceOrder(kind: SourceIntegrityEvidence["kind"]): number {
  switch (kind) {
    case "registry-integrity":
      return 0;
    case "version-lock":
      return 1;
    case "content-hash":
      return 2;
    case "git-commit":
      return 3;
  }
}

function evidenceKey(evidence: SourceIntegrityEvidence): string {
  if (evidence.kind === "registry-integrity") {
    return `${evidence.packageName}:${evidence.version}:${evidence.integrity}`;
  }
  if (evidence.kind === "version-lock") {
    return `${evidence.packageName}:${evidence.version}:${evidence.lockPath}`;
  }
  if (evidence.kind === "content-hash") return evidence.value;
  return evidence.commitSha.toLowerCase();
}

function isContentAddressableSourceType(sourceType: SourceType): boolean {
  return sourceType === "local-tarball" || sourceType === "offline-bundle" || sourceType === "local";
}

function isPublicSafeResolvedRoot(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.includes("\\") || trimmed.includes("://") || trimmed.includes("?") || trimmed.includes("#")) {
    return false;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("~/") || trimmed.startsWith("~")) return false;
  if (/^[A-Za-z]:(?:\/|\\|$)/.test(trimmed)) return false;
  if (/(?:token|secret|password|credential|auth)=/i.test(trimmed)) return false;
  const segments = trimmed.split("/");
  if (
    segments.some((segment) =>
      [".npm", ".cache", "cache", ".tmp", "tmp", "temp", "node_modules"].includes(segment),
    )
  ) {
    return false;
  }
  return true;
}
