import { constants } from "node:fs";
import { access, lstat, realpath } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import {
  isProjectRelativePosixPath,
  WorkflowArtifactMetadataSchema,
  type WorkflowArtifactMetadata,
} from "../../manifest/manifest-schema.js";
import { resolveProjectRelativePath } from "../../fs/path-normalizer.js";

export type ArtifactPathIssueId =
  | "artifact-path.escapes-project"
  | "artifact-path.symlink-escape"
  | "artifact-path.missing-required-directory"
  | "artifact-path.unwritable-directory"
  | "artifact-path.fixture-write-failed"
  | "artifact-path.missing-required-metadata"
  | "artifact-path.invalid-required-metadata";

type ArtifactPathRole = "configuredRoot" | "defaultOutputPath" | "actualArtifactPath";
type MetadataLocation = "frontmatter" | "sidecar" | "directory";

export async function validateArtifactPathContract(input: {
  projectRoot: string;
  configuredRoot: string;
  defaultOutputPath: string;
  actualArtifactPath?: string;
  artifactType: string;
  metadata?: Partial<WorkflowArtifactMetadata> | Record<string, unknown>;
  metadataLocation: MetadataLocation;
  expectedSourceSkill?: string;
}): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const configuredRoot = await validateProjectPathRole({
    projectRoot: input.projectRoot,
    relativePath: input.configuredRoot,
    pathRole: "configuredRoot",
    requireDirectory: true,
  });
  issues.push(...configuredRoot.issues);

  const defaultOutputPath = await validateProjectPathRole({
    projectRoot: input.projectRoot,
    relativePath: input.defaultOutputPath,
    pathRole: "defaultOutputPath",
    requireDirectory: false,
  });
  issues.push(...defaultOutputPath.issues);

  if (configuredRoot.relativePath !== undefined && defaultOutputPath.relativePath !== undefined) {
    issues.push(
      ...validateContainedArtifactPath({
        containerPath: configuredRoot.relativePath,
        containedPath: defaultOutputPath.relativePath,
        pathRole: "defaultOutputPath",
        reason: "outside-configured-root",
      }),
    );
  }

  if (input.actualArtifactPath !== undefined) {
    const actualArtifactPath = await validateProjectPathRole({
      projectRoot: input.projectRoot,
      relativePath: input.actualArtifactPath,
      pathRole: "actualArtifactPath",
      requireDirectory: false,
    });
    issues.push(...actualArtifactPath.issues);
    if (configuredRoot.relativePath !== undefined && actualArtifactPath.relativePath !== undefined) {
      issues.push(
        ...validateContainedArtifactPath({
          containerPath: configuredRoot.relativePath,
          containedPath: actualArtifactPath.relativePath,
          pathRole: "actualArtifactPath",
          reason: "path-escapes-project",
        }),
      );
    }
  }

  if (input.metadata !== undefined) {
    issues.push(...validateRequiredMetadata(input));
  }

  return dedupeIssues(issues);
}

async function validateProjectPathRole(input: {
  projectRoot: string;
  relativePath: string;
  pathRole: ArtifactPathRole;
  requireDirectory: boolean;
}): Promise<{ issues: ValidationIssue[]; relativePath?: string }> {
  if (!isProjectRelativePosixPath(input.relativePath)) {
    return {
      issues: [
        createArtifactPathIssue({
          issueId: "artifact-path.escapes-project",
          affectedPath: `artifact:${input.pathRole}`,
          details: {
            pathRole: input.pathRole,
            reason: "invalid-project-relative-posix-path",
          },
          impact: "A workflow artifact path is not a project-relative POSIX artifact path.",
          suggestedNextStep: "Use a project-relative POSIX artifact path inside the configured artifact root.",
        }),
      ],
    };
  }

  let resolved: ReturnType<typeof resolveProjectRelativePath>;
  try {
    resolved = resolveProjectRelativePath({
      projectRoot: input.projectRoot,
      relativePath: input.relativePath,
    });
  } catch {
    return {
      issues: [
        createArtifactPathIssue({
          issueId: "artifact-path.escapes-project",
          affectedPath: `artifact:${input.pathRole}`,
          details: {
            pathRole: input.pathRole,
            reason: "path-escapes-project",
          },
          impact: "A workflow artifact path is not safely contained inside the target project.",
          suggestedNextStep: "Use a project-relative POSIX artifact path inside the configured artifact root.",
        }),
      ],
    };
  }

  const symlinkIssue = await findSymlinkSegment({
    projectRoot: input.projectRoot,
    relativePath: resolved.relativePath,
    pathRole: input.pathRole,
  });
  if (symlinkIssue !== undefined) return { issues: [symlinkIssue] };

  if (!input.requireDirectory) return { issues: [], relativePath: resolved.relativePath };

  try {
    const stat = await lstat(resolved.absolutePath);
    if (!stat.isDirectory()) {
      return {
        issues: [
          createArtifactPathIssue({
            issueId: "artifact-path.missing-required-directory",
            affectedPath: `artifact:${input.pathRole}`,
            details: {
              pathRole: input.pathRole,
              reason: "not-directory",
            },
            impact: "The configured workflow artifact root is missing or is not a directory.",
            suggestedNextStep: "Create the configured artifact root before writing workflow artifacts.",
          }),
        ],
        relativePath: resolved.relativePath,
      };
    }
    await access(resolved.absolutePath, constants.W_OK);
  } catch (error) {
    if (isMissingPathError(error)) {
      return {
        issues: [
          createArtifactPathIssue({
            issueId: "artifact-path.missing-required-directory",
            affectedPath: `artifact:${input.pathRole}`,
            details: {
              pathRole: input.pathRole,
              reason: "missing-directory",
            },
            impact: "The configured workflow artifact root does not exist.",
            suggestedNextStep: "Create the configured artifact root before writing workflow artifacts.",
          }),
        ],
        relativePath: resolved.relativePath,
      };
    }

    return {
      issues: [
        createArtifactPathIssue({
          issueId: "artifact-path.unwritable-directory",
          affectedPath: `artifact:${input.pathRole}`,
          details: {
            pathRole: input.pathRole,
            reason: "directory-not-writable",
          },
          impact: "The configured workflow artifact root exists but is not writable.",
          suggestedNextStep: "Fix artifact root permissions before writing workflow artifacts.",
        }),
      ],
      relativePath: resolved.relativePath,
    };
  }

  return { issues: [], relativePath: resolved.relativePath };
}

function validateContainedArtifactPath(input: {
  containerPath: string;
  containedPath: string;
  pathRole: ArtifactPathRole;
  reason: "outside-configured-root" | "path-escapes-project";
}): ValidationIssue[] {
  if (isSameOrDescendantPath(input.containedPath, input.containerPath)) return [];

  return [
    createArtifactPathIssue({
      issueId: "artifact-path.escapes-project",
      affectedPath: `artifact:${input.pathRole}`,
      details: {
        pathRole: input.pathRole,
        reason: input.reason,
      },
      impact: "A workflow artifact path is outside the configured workflow artifact output root.",
      suggestedNextStep: "Write workflow artifacts under the configured artifact root or a configured allowed output path.",
    }),
  ];
}

function isSameOrDescendantPath(candidatePath: string, containerPath: string): boolean {
  return candidatePath === containerPath || candidatePath.startsWith(`${containerPath}/`);
}

function validateRequiredMetadata(input: {
  artifactType: string;
  metadata?: Partial<WorkflowArtifactMetadata> | Record<string, unknown>;
  metadataLocation: MetadataLocation;
  expectedSourceSkill?: string;
}): ValidationIssue[] {
  const metadata = isRecord(input.metadata) ? input.metadata : {};
  const requiredKeys = ["workflowType", "sourceSkill", "generatedAt"] as const;
  const missingKeys = requiredKeys.filter((key) => !(key in metadata)).sort();
  if (missingKeys.length > 0) {
    return [
      createArtifactPathIssue({
        issueId: "artifact-path.missing-required-metadata",
        affectedPath: "artifact:metadata",
        details: {
          artifactType: input.artifactType,
          metadataKeys: missingKeys,
          metadataLocation: input.metadataLocation,
        },
        impact: "Workflow artifact metadata is missing required MVP fields.",
        suggestedNextStep: "Write workflowType, sourceSkill and generatedAt metadata before validation.",
      }),
    ];
  }

  const parsed = WorkflowArtifactMetadataSchema.safeParse(metadata);
  if (parsed.success) {
    if (
      input.expectedSourceSkill !== undefined &&
      parsed.data.sourceSkill !== input.expectedSourceSkill
    ) {
      return [
        createArtifactPathIssue({
          issueId: "artifact-path.invalid-required-metadata",
          affectedPath: "artifact:metadata",
          details: {
            artifactType: input.artifactType,
            metadataKeys: ["sourceSkill"],
            metadataLocation: input.metadataLocation,
          },
          impact: "Workflow artifact metadata sourceSkill does not match the installed canonical skill id.",
          suggestedNextStep: "Regenerate artifact metadata using the installed canonical skill id.",
        }),
      ];
    }

    return [];
  }

  const metadataKeys = [
    ...new Set(
      parsed.error.issues
        .map((issue) => issue.path[0])
        .filter((key): key is string => typeof key === "string"),
    ),
  ].sort();

  return [
    createArtifactPathIssue({
      issueId: "artifact-path.invalid-required-metadata",
      affectedPath: "artifact:metadata",
      details: {
        artifactType: input.artifactType,
        metadataKeys,
        metadataLocation: input.metadataLocation,
      },
      impact: "Workflow artifact metadata contains invalid required field values.",
      suggestedNextStep: "Regenerate artifact metadata with stable workflowType, canonical sourceSkill and ISO generatedAt.",
    }),
  ];
}

async function findSymlinkSegment(input: {
  projectRoot: string;
  relativePath: string;
  pathRole: ArtifactPathRole;
}): Promise<ValidationIssue | undefined> {
  const realProjectRoot = await realpath(input.projectRoot);
  const segments = input.relativePath.split("/");
  let current = input.projectRoot;

  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink()) {
        const realSegment = await realpath(current);
        if (isSameOrDescendantNativePath(realSegment, realProjectRoot)) continue;

        return createArtifactPathIssue({
          issueId: "artifact-path.symlink-escape",
          affectedPath: `artifact:${input.pathRole}`,
          details: {
            pathRole: input.pathRole,
            reason: "symlink-escape",
          },
          impact: "A workflow artifact path crosses a symlink and cannot be proven to stay inside the target project.",
          suggestedNextStep: "Replace the symlinked path segment with a real project directory before continuing.",
        });
      }
    } catch (error) {
      if (isMissingPathError(error)) return undefined;
      throw error;
    }
  }

  return undefined;
}

function isSameOrDescendantNativePath(candidatePath: string, containerPath: string): boolean {
  const relative = path.relative(containerPath, candidatePath);
  return relative.length === 0 || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function createArtifactPathIssue(input: {
  issueId: ArtifactPathIssueId;
  affectedPath: string;
  details: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "artifact-path",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "artifact-path-validator",
    details: input.details,
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = JSON.stringify({
      issueId: issue.issueId,
      affectedPath: issue.affectedPath,
      details: issue.details,
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}
