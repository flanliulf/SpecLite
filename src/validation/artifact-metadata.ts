import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import {
  isProjectRelativePosixPath,
  WorkflowArtifactMetadataSchema,
  type WorkflowArtifactMetadata,
} from "../manifest/manifest-schema.js";

export type WorkflowArtifactKind = "markdown" | "file" | "directory";
export type WorkflowArtifactMetadataLocation =
  | {
      locationType: "frontmatter";
      metadataPath: "artifact";
    }
  | {
      locationType: "sidecar";
      metadataPath: string;
    };

export function createWorkflowArtifactMetadata(input: {
  workflowType: string;
  sourceSkill: string;
  generatedAt?: string;
  now?: () => Date;
}): WorkflowArtifactMetadata {
  return WorkflowArtifactMetadataSchema.parse({
    workflowType: input.workflowType,
    sourceSkill: input.sourceSkill,
    generatedAt: input.generatedAt ?? (input.now ?? (() => new Date()))().toISOString(),
  });
}

export function parseWorkflowArtifactMetadata(value: unknown) {
  return WorkflowArtifactMetadataSchema.safeParse(value);
}

export function normalizeWorkflowArtifactMetadataForSnapshot(
  metadata: WorkflowArtifactMetadata,
): {
  workflowType: string;
  sourceSkill: string;
  generatedAt: "<iso8601>";
} {
  const parsed = WorkflowArtifactMetadataSchema.parse(metadata);
  return {
    workflowType: parsed.workflowType,
    sourceSkill: parsed.sourceSkill,
    generatedAt: "<iso8601>",
  };
}

export function writeMarkdownWorkflowArtifactMetadata(input: {
  contents: string;
  metadata: WorkflowArtifactMetadata;
}): string {
  const parsedMetadata = WorkflowArtifactMetadataSchema.parse(input.metadata);
  const frontmatter = readLeadingFrontmatter(input.contents);
  const existing = frontmatter?.data ?? {};
  const merged = {
    ...existing,
    workflowType: parsedMetadata.workflowType,
    sourceSkill: parsedMetadata.sourceSkill,
    generatedAt: parsedMetadata.generatedAt,
  };
  const body = frontmatter?.body ?? input.contents;

  return `---\n${stringifyYaml(merged, { sortMapEntries: true }).trimEnd()}\n---\n${body}`;
}

export function readMarkdownWorkflowArtifactMetadata(contents: string): WorkflowArtifactMetadata {
  const frontmatter = readLeadingFrontmatter(contents);
  if (frontmatter === undefined) {
    throw new Error("Markdown workflow artifact metadata is missing leading frontmatter.");
  }

  return WorkflowArtifactMetadataSchema.parse(pickWorkflowArtifactMetadata(frontmatter.data));
}

export function getWorkflowArtifactMetadataLocation(input: {
  artifactPath: string;
  artifactKind: WorkflowArtifactKind;
}): WorkflowArtifactMetadataLocation {
  if (input.artifactKind === "markdown") {
    return {
      locationType: "frontmatter",
      metadataPath: "artifact",
    };
  }

  if (input.artifactKind === "directory") {
    return {
      locationType: "sidecar",
      metadataPath: `${input.artifactPath.replace(/\/+$/g, "")}/metadata.json`,
    };
  }

  return {
    locationType: "sidecar",
    metadataPath: `${input.artifactPath}.metadata.json`,
  };
}

export function serializeWorkflowArtifactMetadataSidecar(metadata: WorkflowArtifactMetadata): string {
  const parsed = WorkflowArtifactMetadataSchema.parse(metadata);
  return `${JSON.stringify(
    {
      workflowType: parsed.workflowType,
      sourceSkill: parsed.sourceSkill,
      generatedAt: parsed.generatedAt,
    },
    null,
    2,
  )}\n`;
}

export function isWorkflowOwnedArtifactPath(input: {
  relativePath: string;
  artifactRoots: string[];
}): boolean {
  if (!isProjectRelativePosixPath(input.relativePath)) return false;
  const normalizedPath = input.relativePath.replace(/\/+$/g, "");

  return input.artifactRoots
    .filter(isProjectRelativePosixPath)
    .map((root) => root.replace(/\/+$/g, ""))
    .some((root) => normalizedPath === root || normalizedPath.startsWith(`${root}/`));
}

function readLeadingFrontmatter(contents: string):
  | {
      data: Record<string, unknown>;
      body: string;
    }
  | undefined {
  if (!contents.startsWith("---\n")) return undefined;

  const close = contents.indexOf("\n---", 4);
  if (close === -1) return undefined;

  const afterClose = close + "\n---".length;
  const next = contents[afterClose];
  if (next !== "\n" && next !== undefined) return undefined;

  const raw = contents.slice(4, close);
  const parsed = parseYaml(raw);
  const data = isPlainRecord(parsed) ? parsed : {};
  const body = contents.slice(next === "\n" ? afterClose + 1 : afterClose);

  return { data, body };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickWorkflowArtifactMetadata(value: Record<string, unknown>): Record<string, unknown> {
  return {
    workflowType: value.workflowType,
    sourceSkill: value.sourceSkill,
    generatedAt: value.generatedAt,
  };
}
