import { z } from "zod";

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
      commitSha: z.string().min(1),
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
  .strict();

export type SourceType = z.infer<typeof SourceTypeSchema>;
export type SourceIntegrityEvidence = z.infer<typeof SourceIntegrityEvidenceSchema>;
export type SourceDescriptor = z.infer<typeof SourceDescriptorSchema>;

export const PREWRITE_BUNDLED_SOURCE_DESCRIPTOR: SourceDescriptor = {
  sourceType: "bundled",
  resolvedRoot: "assets/source/speclite",
  integrityEvidence: [],
  trustStatus: "blocked",
};

