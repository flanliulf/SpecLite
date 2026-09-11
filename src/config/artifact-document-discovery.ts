import { constants as fsConstants } from "node:fs";
import { access, lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { toProjectRelativePosixPath } from "../fs/path-normalizer.js";
import type { ArtifactRootResolution } from "./artifact-root-resolver.js";

export const ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION =
  "speclite.resolve.artifact-documents.v1" as const;

export type ArtifactDocumentSubject = "prd" | "epics" | "architecture";
export type ArtifactDocumentSelection = "whole" | "sharded";
export type ArtifactDocumentDiscoveryShape =
  | "whole-only"
  | "sharded-only"
  | "whole+sharded"
  | "invalid-sharded"
  | "subject-missing";
export type ArtifactDocumentAmbiguityStatus =
  | "not-ambiguous"
  | "selection-required"
  | "resolved-by-explicit-selection";

export type ArtifactDocumentDiscoveryResult = {
  schemaVersion: typeof ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION;
  ok: boolean;
  subject: ArtifactDocumentSubject;
  resolvedRoot: string;
  resolutionMode: ArtifactRootResolution["resolutionMode"];
  subjectDirectory: string;
  canonicalWholePath: string;
  shardedIndexPath: string;
  actualConsumedPath: string | null;
  consumedPaths: string[];
  declaredShardPaths: string[];
  discoveryShape: ArtifactDocumentDiscoveryShape;
  ambiguityStatus: ArtifactDocumentAmbiguityStatus;
  selection: {
    value: ArtifactDocumentSelection | null;
    source: "none" | "invocation";
  };
  unselectedPath: string | null;
  continuation: "continue" | "block";
  issues: ValidationIssue[];
};

const SUBJECTS: Record<
  ArtifactDocumentSubject,
  { rootField: ArtifactRootResolution["field"]; wholeName: string }
> = {
  prd: { rootField: "planning_artifacts", wholeName: "prd.md" },
  epics: { rootField: "planning_artifacts", wholeName: "epics.md" },
  architecture: { rootField: "solutioning_artifacts", wholeName: "architecture.md" },
};

export async function resolveArtifactDocument(input: {
  projectRoot: string;
  subject: ArtifactDocumentSubject;
  root: ArtifactRootResolution;
  planningRoot?: ArtifactRootResolution;
  selection?: ArtifactDocumentSelection;
}): Promise<ArtifactDocumentDiscoveryResult> {
  const definition = SUBJECTS[input.subject];
  const subjectDirectory = `${input.root.resolvedRoot}/${input.subject}`;
  const canonicalWholePath = `${subjectDirectory}/${definition.wholeName}`;
  const shardedIndexPath = `${subjectDirectory}/index.md`;
  const selection = {
    value: input.selection ?? null,
    source: input.selection === undefined ? "none" as const : "invocation" as const,
  };
  const base = {
    schemaVersion: ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION,
    subject: input.subject,
    resolvedRoot: input.root.resolvedRoot,
    resolutionMode: input.root.resolutionMode,
    subjectDirectory,
    canonicalWholePath,
    shardedIndexPath,
    selection,
  };

  if (input.root.field !== definition.rootField) {
    return blocked(base, {
      discoveryShape: "subject-missing",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.config-artifact-mismatch",
        affectedPath: subjectDirectory,
        reason: "config-artifact-mismatch",
        details: {
          field: definition.rootField,
          configuredRoot: input.root.resolvedRoot,
          resolvedRoot: input.root.resolvedRoot,
          actualConsumedPath: subjectDirectory,
          resolutionMode: input.root.resolutionMode,
          mismatchReason: "subject-root-field-mismatch",
        },
      }),
    });
  }

  const subjectAbsolutePath = path.join(input.projectRoot, subjectDirectory);
  if (await isSymbolicLink(subjectAbsolutePath)) {
    return symlinkEscapeBlocked(base, input.root, subjectDirectory);
  }
  const wholeState = await inspectReadableSubjectFile({
    projectRoot: input.projectRoot,
    subjectAbsolutePath,
    relativePath: canonicalWholePath,
  });
  if (wholeState.state === "symlink-escape") {
    return symlinkEscapeBlocked(base, input.root, canonicalWholePath);
  }
  if (wholeState.state === "unreadable") {
    return blocked(base, {
      discoveryShape: "subject-missing",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.subject-document-missing",
        affectedPath: canonicalWholePath,
        reason: "canonical-whole-unreadable",
        details: {
          resolvedRoot: input.root.resolvedRoot,
          resolutionMode: input.root.resolutionMode,
          actualConsumedPath: canonicalWholePath,
          discoveryShape: "subject-missing",
          ambiguityStatus: "not-ambiguous",
          selectionSource: selection.source,
          entryKind: "canonical-whole",
          entryState: "unreadable",
        },
      }),
    });
  }
  const indexState = await inspectReadableSubjectFile({
    projectRoot: input.projectRoot,
    subjectAbsolutePath,
    relativePath: shardedIndexPath,
  });
  if (indexState.state === "symlink-escape") {
    return symlinkEscapeBlocked(base, input.root, shardedIndexPath);
  }
  if (indexState.state === "unreadable") {
    return blocked(base, {
      discoveryShape: "invalid-sharded",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.broken-shard-reference",
        affectedPath: shardedIndexPath,
        reason: "unreadable-shard",
        details: {
          resolvedRoot: input.root.resolvedRoot,
          resolutionMode: input.root.resolutionMode,
          actualConsumedPath: shardedIndexPath,
          discoveryShape: "invalid-sharded",
          ambiguityStatus: "not-ambiguous",
          selectionSource: selection.source,
          referenceKind: "unreadable-shard",
        },
      }),
    });
  }
  const wholePresent = wholeState.state === "readable";
  const indexPresent = indexState.state === "readable";
  const shardCandidateScan = indexPresent
    ? { ok: true as const, files: [] }
    : await listMarkdownFiles({
        projectRoot: input.projectRoot,
        directory: path.join(input.projectRoot, subjectDirectory),
      });
  if (!shardCandidateScan.ok) {
    return blocked(base, {
      discoveryShape: "invalid-sharded",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.invalid-sharded-document-shape",
        affectedPath: shardCandidateScan.failedDirectory,
        reason: "shard-candidate-scan-unreadable",
        details: {
          resolvedRoot: input.root.resolvedRoot,
          resolutionMode: input.root.resolutionMode,
          actualConsumedPath: shardCandidateScan.failedDirectory,
          discoveryShape: "invalid-sharded",
          ambiguityStatus: "not-ambiguous",
          selectionSource: selection.source,
          entryKind: "shard-candidate-scan",
          entryState: "unreadable",
        },
      }),
    });
  }
  const shardCandidates = shardCandidateScan.files.filter(
    (relative) => relative !== definition.wholeName && relative !== "index.md",
  );

  let declaredShardPaths: string[] = [];
  const skipUnselectedIndexGraph = wholePresent && indexPresent && input.selection === "whole";
  if (indexPresent && !skipUnselectedIndexGraph) {
    const shardResolution = await resolveDeclaredShards({
      projectRoot: input.projectRoot,
      subjectDirectory,
      shardedIndexPath,
    });
    if (!shardResolution.ok) {
      return blocked(base, {
        discoveryShape: "invalid-sharded",
        ambiguityStatus: "not-ambiguous",
        issue: issue({
          issueId: "artifact-path.broken-shard-reference",
          affectedPath: shardedIndexPath,
          reason: shardResolution.reason,
          details: {
            resolvedRoot: input.root.resolvedRoot,
            resolutionMode: input.root.resolutionMode,
            actualConsumedPath: shardedIndexPath,
            discoveryShape: "invalid-sharded",
            ambiguityStatus: "not-ambiguous",
            selectionSource: selection.source,
            referenceKind: shardResolution.reason,
          },
        }),
      });
    }
    declaredShardPaths = shardResolution.paths;
  } else if (!indexPresent && shardCandidates.length > 0) {
    return blocked(base, {
      discoveryShape: "invalid-sharded",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.invalid-sharded-document-shape",
        affectedPath: subjectDirectory,
        reason: "shards-without-index",
        details: {
          resolvedRoot: input.root.resolvedRoot,
          resolutionMode: input.root.resolutionMode,
          actualConsumedPath: subjectDirectory,
          discoveryShape: "invalid-sharded",
          ambiguityStatus: "not-ambiguous",
          selectionSource: selection.source,
        },
      }),
    });
  }

  if (!wholePresent && !indexPresent) {
    const mismatchCandidates = await findLegacyMismatchCandidates({
      projectRoot: input.projectRoot,
      subject: input.subject,
      root: input.root,
      planningRoot: input.planningRoot,
    });
    if (mismatchCandidates.length > 0) {
      return blocked(base, {
        discoveryShape: "subject-missing",
        ambiguityStatus: "not-ambiguous",
        issue: issue({
          issueId: "artifact-path.config-artifact-mismatch",
          affectedPath: subjectDirectory,
          reason: "config-artifact-mismatch",
          details: {
            field: definition.rootField,
            configuredRoot: input.root.resolvedRoot,
            resolvedRoot: input.root.resolvedRoot,
            actualConsumedPath: mismatchCandidates[0],
            candidatePaths: mismatchCandidates,
            resolutionMode: input.root.resolutionMode,
            discoveryShape: "subject-missing",
            ambiguityStatus: "not-ambiguous",
            selectionSource: selection.source,
            mismatchReason: "legacy-artifact-outside-configured-subject",
          },
        }),
      });
    }
    return blocked(base, {
      discoveryShape: "subject-missing",
      ambiguityStatus: "not-ambiguous",
      issue: issue({
        issueId: "artifact-path.subject-document-missing",
        affectedPath: subjectDirectory,
        reason: "subject-document-missing",
        details: {
          resolvedRoot: input.root.resolvedRoot,
          resolutionMode: input.root.resolutionMode,
          actualConsumedPath: subjectDirectory,
          discoveryShape: "subject-missing",
          ambiguityStatus: "not-ambiguous",
          selectionSource: selection.source,
        },
      }),
    });
  }

  if (wholePresent && indexPresent) {
    if (input.selection === undefined) {
      return blocked(base, {
        discoveryShape: "whole+sharded",
        ambiguityStatus: "selection-required",
        declaredShardPaths,
        issue: issue({
          issueId: "artifact-path.ambiguous-subject-document-shape",
          affectedPath: subjectDirectory,
          reason: "explicit-selection-required",
          details: {
            resolvedRoot: input.root.resolvedRoot,
            resolutionMode: input.root.resolutionMode,
            actualConsumedPath: subjectDirectory,
            discoveryShape: "whole+sharded",
            ambiguityStatus: "selection-required",
            selectionSource: "none",
          },
        }),
      });
    }

    return continued(base, {
      discoveryShape: "whole+sharded",
      ambiguityStatus: "resolved-by-explicit-selection",
      actualConsumedPath: input.selection === "whole" ? canonicalWholePath : shardedIndexPath,
      consumedPaths:
        input.selection === "whole"
          ? [canonicalWholePath]
          : [shardedIndexPath, ...declaredShardPaths],
      declaredShardPaths,
      unselectedPath: input.selection === "whole" ? shardedIndexPath : canonicalWholePath,
    });
  }

  if (wholePresent) {
    if (input.selection === "sharded") {
      return unavailableSelection(base, "sharded", "whole-only");
    }
    return continued(base, {
      discoveryShape: "whole-only",
      ambiguityStatus: "not-ambiguous",
      actualConsumedPath: canonicalWholePath,
      consumedPaths: [canonicalWholePath],
      declaredShardPaths: [],
      unselectedPath: null,
    });
  }

  if (input.selection === "whole") {
    return unavailableSelection(base, "whole", "sharded-only", declaredShardPaths);
  }
  return continued(base, {
    discoveryShape: "sharded-only",
    ambiguityStatus: "not-ambiguous",
    actualConsumedPath: shardedIndexPath,
    consumedPaths: [shardedIndexPath, ...declaredShardPaths],
    declaredShardPaths,
    unselectedPath: null,
  });
}

function continued(
  base: Pick<
    ArtifactDocumentDiscoveryResult,
    | "schemaVersion"
    | "subject"
    | "resolvedRoot"
    | "resolutionMode"
    | "subjectDirectory"
    | "canonicalWholePath"
    | "shardedIndexPath"
    | "selection"
  >,
  input: Pick<
    ArtifactDocumentDiscoveryResult,
    | "discoveryShape"
    | "ambiguityStatus"
    | "actualConsumedPath"
    | "consumedPaths"
    | "declaredShardPaths"
    | "unselectedPath"
  >,
): ArtifactDocumentDiscoveryResult {
  return { ...base, ok: true, ...input, continuation: "continue", issues: [] };
}

function blocked(
  base: Pick<
    ArtifactDocumentDiscoveryResult,
    | "schemaVersion"
    | "subject"
    | "resolvedRoot"
    | "resolutionMode"
    | "subjectDirectory"
    | "canonicalWholePath"
    | "shardedIndexPath"
    | "selection"
  >,
  input: {
    discoveryShape: ArtifactDocumentDiscoveryShape;
    ambiguityStatus: ArtifactDocumentAmbiguityStatus;
    issue: ValidationIssue;
    declaredShardPaths?: string[];
  },
): ArtifactDocumentDiscoveryResult {
  return {
    ...base,
    ok: false,
    actualConsumedPath: null,
    consumedPaths: [],
    declaredShardPaths: input.declaredShardPaths ?? [],
    discoveryShape: input.discoveryShape,
    ambiguityStatus: input.ambiguityStatus,
    unselectedPath: null,
    continuation: "block",
    issues: [input.issue],
  };
}

function unavailableSelection(
  base: Parameters<typeof blocked>[0],
  requestedShape: ArtifactDocumentSelection,
  discoveryShape: "whole-only" | "sharded-only",
  declaredShardPaths: string[] = [],
): ArtifactDocumentDiscoveryResult {
  return blocked(base, {
    discoveryShape,
    ambiguityStatus: "not-ambiguous",
    declaredShardPaths,
    issue: issue({
      issueId: "artifact-path.subject-document-missing",
      affectedPath: base.subjectDirectory,
      reason: "selected-document-shape-missing",
      details: {
        resolvedRoot: base.resolvedRoot,
        resolutionMode: base.resolutionMode,
        actualConsumedPath: base.subjectDirectory,
        discoveryShape,
        ambiguityStatus: "not-ambiguous",
        selectionSource: "invocation",
        requestedShape,
      },
    }),
  });
}

function symlinkEscapeBlocked(
  base: Parameters<typeof blocked>[0],
  root: ArtifactRootResolution,
  affectedPath: string,
): ArtifactDocumentDiscoveryResult {
  return blocked(base, {
    discoveryShape: "invalid-sharded",
    ambiguityStatus: "not-ambiguous",
    issue: issue({
      issueId: "artifact-path.symlink-escape",
      affectedPath,
      reason: "symlink-escape",
      details: {
        resolvedRoot: root.resolvedRoot,
        resolutionMode: root.resolutionMode,
        actualConsumedPath: null,
        discoveryShape: "invalid-sharded",
        ambiguityStatus: "not-ambiguous",
        selectionSource: base.selection.source,
      },
    }),
  });
}

async function resolveDeclaredShards(input: {
  projectRoot: string;
  subjectDirectory: string;
  shardedIndexPath: string;
}): Promise<
  | { ok: true; paths: string[] }
  | {
      ok: false;
      reason:
        | "missing-shard"
        | "outside-subject-directory"
        | "unreadable-shard"
        | "malformed-link-destination"
        | "undefined-reference"
        | "unsupported-local-reference";
      reference: string;
    }
> {
  const indexAbsolutePath = path.join(input.projectRoot, input.shardedIndexPath);
  const markdown = await readFile(indexAbsolutePath, "utf8");
  const references = extractLocalMarkdownReferences(markdown);
  if (!references.ok) return references;
  const subjectAbsolutePath = path.resolve(input.projectRoot, input.subjectDirectory);
  let realSubjectPath: string;
  try {
    realSubjectPath = await realpath(subjectAbsolutePath);
  } catch {
    realSubjectPath = subjectAbsolutePath;
  }
  const resolvedPaths: string[] = [];

  for (const reference of references.references) {
    const targetAbsolutePath = path.resolve(subjectAbsolutePath, reference.path);
    if (!isSameOrDescendant(targetAbsolutePath, subjectAbsolutePath)) {
      return { ok: false, reason: "outside-subject-directory", reference: reference.raw };
    }

    let targetRealPath: string;
    try {
      const targetStat = await lstat(targetAbsolutePath);
      if (!targetStat.isFile() && !targetStat.isSymbolicLink()) {
        return { ok: false, reason: "unreadable-shard", reference: reference.raw };
      }
      await access(targetAbsolutePath, fsConstants.R_OK);
      targetRealPath = await realpath(targetAbsolutePath);
    } catch (error) {
      return {
        ok: false,
        reason: isMissing(error) ? "missing-shard" : "unreadable-shard",
        reference: reference.raw,
      };
    }
    if (!isSameOrDescendant(targetRealPath, realSubjectPath)) {
      return { ok: false, reason: "outside-subject-directory", reference: reference.raw };
    }
    try {
      const targetStat = await stat(targetRealPath);
      if (!targetStat.isFile()) {
        return { ok: false, reason: "unreadable-shard", reference: reference.raw };
      }
    } catch {
      return { ok: false, reason: "unreadable-shard", reference: reference.raw };
    }
    const resolvedPath = toProjectRelativePosixPath({ projectRoot: input.projectRoot, targetPath: targetAbsolutePath });
    if (resolvedPath !== input.shardedIndexPath && !resolvedPaths.includes(resolvedPath)) resolvedPaths.push(resolvedPath);
  }

  return { ok: true, paths: resolvedPaths };
}

type ParsedMarkdownReference = { raw: string; path: string };
type MarkdownReferenceDefinition =
  | { kind: "local-md"; path: string }
  | { kind: "defined-but-ignore" };

function extractLocalMarkdownReferences(markdown: string):
  | { ok: true; references: ParsedMarkdownReference[] }
  | {
      ok: false;
      reason: "malformed-link-destination" | "undefined-reference" | "unsupported-local-reference";
      reference: string;
    } {
  const references: ParsedMarkdownReference[] = [];
  const definitions = new Map<string, MarkdownReferenceDefinition>();
  let scannableMarkdown = maskFencedCode(markdown);
  const definitionPattern = /^\s{0,3}\[([^\]]+)\]:\s*(\S.*)?$/gm;
  for (const match of scannableMarkdown.matchAll(definitionPattern)) {
    const label = normalizeReferenceLabel(match[1] ?? "");
    if (definitions.has(label)) {
      scannableMarkdown = maskRange(scannableMarkdown, match.index ?? 0, (match.index ?? 0) + match[0].length);
      continue;
    }
    if (match[2] === undefined || match[2].trim().length === 0) {
      return { ok: false, reason: "malformed-link-destination", reference: match[0] };
    }
    const destination = parseMarkdownLinkDestination(match[2] ?? "");
    if (!destination.ok) return { ok: false, reason: destination.reason, reference: match[0] };
    if (destination.kind === "unsupported-local") {
      return { ok: false, reason: "unsupported-local-reference", reference: match[0] };
    }
    definitions.set(label, destination.kind === "local-md"
      ? { kind: "local-md", path: destination.path }
      : { kind: "defined-but-ignore" });
    scannableMarkdown = maskRange(scannableMarkdown, match.index ?? 0, (match.index ?? 0) + match[0].length);
  }

  for (let cursor = 0; cursor < scannableMarkdown.length; cursor += 1) {
    if (
      scannableMarkdown[cursor] !== "["
      || scannableMarkdown[cursor - 1] === "!"
      || isEscapedOpeningBracket(scannableMarkdown, cursor)
    ) continue;
    const text = scanBracketed(scannableMarkdown, cursor);
    if (text === null) continue;
    const afterText = text.end + 1;

    if (scannableMarkdown[afterText] === "(") {
      const closing = scanInlineDestinationEnd(scannableMarkdown, afterText);
      if (closing < 0) {
        return {
          ok: false,
          reason: "malformed-link-destination",
          reference: scannableMarkdown.slice(cursor, text.end + 2),
        };
      }
      const raw = scannableMarkdown.slice(afterText + 1, closing);
      const destination = parseMarkdownLinkDestination(raw);
      if (!destination.ok) return { ok: false, reason: destination.reason, reference: raw };
      if (destination.kind === "unsupported-local") {
        return { ok: false, reason: "unsupported-local-reference", reference: raw };
      }
      if (destination.kind === "local-md") addUniqueReference(references, { raw, path: destination.path });
      cursor = closing;
      continue;
    }

    if (scannableMarkdown[afterText] === "[") {
      const label = scanBracketed(scannableMarkdown, afterText);
      if (label === null) continue;
      const rawLabel = label.content.length === 0 ? text.content : label.content;
      const definition = definitions.get(normalizeReferenceLabel(rawLabel));
      if (definition === undefined) {
        return {
          ok: false,
          reason: "undefined-reference",
          reference: scannableMarkdown.slice(cursor, label.end + 1),
        };
      }
      if (definition.kind === "defined-but-ignore") {
        cursor = label.end;
        continue;
      }
      addUniqueReference(references, {
        raw: scannableMarkdown.slice(cursor, label.end + 1),
        path: definition.path,
      });
      cursor = label.end;
      continue;
    }

    const shortcutDefinition = definitions.get(normalizeReferenceLabel(text.content));
    if (shortcutDefinition !== undefined) {
      if (shortcutDefinition.kind === "defined-but-ignore") {
        cursor = text.end;
        continue;
      }
      addUniqueReference(references, {
        raw: scannableMarkdown.slice(cursor, text.end + 1),
        path: shortcutDefinition.path,
      });
      cursor = text.end;
    }
  }

  return { ok: true, references };
}

function parseMarkdownLinkDestination(rawDestination: string):
  | { ok: true; kind: "ignore" | "unsupported-local" }
  | { ok: true; kind: "local-md"; path: string }
  | { ok: false; reason: "malformed-link-destination" } {
  const raw = rawDestination.trim();
  if (raw.length === 0 || raw.startsWith("#")) return { ok: true, kind: "ignore" };

  let destination = raw;
  if (raw.startsWith("<")) {
    const closingIndex = raw.indexOf(">");
    if (closingIndex < 0) return { ok: false, reason: "malformed-link-destination" };
    if (raw.slice(closingIndex + 1).trim().length > 0) {
      return { ok: false, reason: "malformed-link-destination" };
    }
    const angleBody = raw.slice(1, closingIndex);
    if (angleBody.length === 0 || angleBody !== angleBody.trim()) {
      return { ok: false, reason: "malformed-link-destination" };
    }
    destination = angleBody;
  } else {
    destination = raw.split(/\s+/, 1)[0] ?? "";
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(stripQueryAndFragment(destination));
  } catch {
    return { ok: false, reason: "malformed-link-destination" };
  }
  if (decoded.length === 0 || decoded.startsWith("#")) return { ok: true, kind: "ignore" };
  if (/^[A-Za-z]:[\\/]/.test(decoded)) return { ok: true, kind: "unsupported-local" };
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(decoded) || decoded.startsWith("//")) {
    return { ok: true, kind: "ignore" };
  }
  if (decoded.includes("\\")) return { ok: true, kind: "unsupported-local" };
  if (!decoded.toLowerCase().endsWith(".md")) return { ok: true, kind: "unsupported-local" };
  return { ok: true, kind: "local-md", path: decoded };
}

function isEscapedOpeningBracket(markdown: string, openingIndex: number): boolean {
  let backslashes = 0;
  for (let index = openingIndex - 1; index >= 0 && markdown[index] === "\\"; index -= 1) backslashes += 1;
  return backslashes % 2 === 1;
}

function maskFencedCode(markdown: string): string {
  const lines = markdown.match(/.*(?:\n|$)/g) ?? [];
  let fence: { marker: "`" | "~"; length: number } | null = null;
  return lines.map((line) => {
    const content = line.endsWith("\n") ? line.slice(0, -1) : line;
    if (fence === null) {
      const opening = content.match(/^ {0,3}(`{3,}|~{3,})/);
      if (opening === null) return line;
      const run = opening[1];
      if (run[0] === "`" && content.slice((opening.index ?? 0) + opening[0].length).includes("`")) return line;
      fence = { marker: run[0] as "`" | "~", length: run.length };
      return maskLine(line);
    }

    const closing = content.match(/^ {0,3}(`+|~+)\s*$/);
    const closes = closing !== null && closing[1][0] === fence.marker && closing[1].length >= fence.length;
    const masked = maskLine(line);
    if (closes) fence = null;
    return masked;
  }).join("");
}

function maskLine(line: string): string {
  return line.endsWith("\n") ? `${" ".repeat(line.length - 1)}\n` : " ".repeat(line.length);
}

function maskRange(value: string, start: number, end: number): string {
  const masked = value.slice(start, end).replace(/[^\n]/g, " ");
  return `${value.slice(0, start)}${masked}${value.slice(end)}`;
}

function scanBracketed(markdown: string, openingIndex: number): { content: string; end: number } | null {
  let depth = 0;
  for (let index = openingIndex; index < markdown.length; index += 1) {
    const character = markdown[index];
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === "[") depth += 1;
    else if (character === "]") {
      depth -= 1;
      if (depth === 0) return { content: markdown.slice(openingIndex + 1, index), end: index };
    }
    if (character === "\n" && depth > 0) return null;
  }
  return null;
}

function scanInlineDestinationEnd(markdown: string, openingIndex: number): number {
  let depth = 1;
  let angle = false;
  for (let index = openingIndex + 1; index < markdown.length; index += 1) {
    const character = markdown[index];
    if (character === "\\") {
      index += 1;
      continue;
    }
    if (character === "\n") return -1;
    if (character === "<" && depth === 1) angle = true;
    else if (character === ">" && angle) angle = false;
    else if (!angle && character === "(") depth += 1;
    else if (!angle && character === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function stripQueryAndFragment(destination: string): string {
  const queryIndex = destination.indexOf("?");
  const fragmentIndex = destination.indexOf("#");
  const indexes = [queryIndex, fragmentIndex].filter((index) => index >= 0);
  return indexes.length === 0 ? destination : destination.slice(0, Math.min(...indexes));
}

function addUniqueReference(references: ParsedMarkdownReference[], reference: ParsedMarkdownReference): void {
  if (!references.some((candidate) => candidate.path === reference.path)) references.push(reference);
}

function normalizeReferenceLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

type MarkdownFileScanResult =
  | { ok: true; files: string[] }
  | { ok: false; failedDirectory: string };

async function listMarkdownFiles(input: {
  projectRoot: string;
  directory: string;
  prefix?: string;
}): Promise<MarkdownFileScanResult> {
  let entries;
  try {
    entries = await readdir(input.directory, { withFileTypes: true });
  } catch (error) {
    if (isMissing(error)) return { ok: true, files: [] };
    return {
      ok: false,
      failedDirectory: toProjectRelativePosixPath({
        projectRoot: input.projectRoot,
        targetPath: input.directory,
      }),
    };
  }
  const files: string[] = [];
  for (const entry of entries) {
    const prefix = input.prefix ?? "";
    const relative = prefix.length === 0 ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      const nested = await listMarkdownFiles({
        projectRoot: input.projectRoot,
        directory: path.join(input.directory, entry.name),
        prefix: relative,
      });
      if (!nested.ok) return nested;
      files.push(...nested.files);
    }
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(relative);
  }
  return { ok: true, files: files.sort((left, right) => left.localeCompare(right)) };
}

async function inspectReadableSubjectFile(input: {
  projectRoot: string;
  subjectAbsolutePath: string;
  relativePath: string;
}): Promise<{ state: "missing" | "unreadable" | "readable" | "symlink-escape" }> {
  const absolutePath = path.join(input.projectRoot, input.relativePath);
  let realSubjectPath: string;
  try {
    realSubjectPath = await realpath(input.subjectAbsolutePath);
  } catch {
    realSubjectPath = input.subjectAbsolutePath;
  }
  try {
    const fileStat = await lstat(absolutePath);
    if (!fileStat.isFile() && !fileStat.isSymbolicLink()) return { state: "unreadable" };
    const realFilePath = await realpath(absolutePath);
    if (!isSameOrDescendant(realFilePath, realSubjectPath)) return { state: "symlink-escape" };
    if (!(await stat(realFilePath)).isFile()) return { state: "unreadable" };
    await access(absolutePath, fsConstants.R_OK);
    return { state: "readable" };
  } catch (error) {
    return { state: isMissing(error) ? "missing" : "unreadable" };
  }
}

async function findLegacyMismatchCandidates(input: {
  projectRoot: string;
  subject: ArtifactDocumentSubject;
  root: ArtifactRootResolution;
  planningRoot?: ArtifactRootResolution;
}): Promise<string[]> {
  const candidates =
    input.subject === "prd"
      ? [`${input.root.resolvedRoot}/prd.md`]
      : input.subject === "epics"
        ? [`${input.root.resolvedRoot}/epics.md`]
        : architectureMismatchCandidates(input.root, input.planningRoot);
  const readable: string[] = [];
  for (const candidate of candidates) {
    const state = await inspectReadableSubjectFile({
      projectRoot: input.projectRoot,
      subjectAbsolutePath: path.dirname(path.join(input.projectRoot, candidate)),
      relativePath: candidate,
    });
    if (state.state === "readable" && !readable.includes(candidate)) readable.push(candidate);
  }
  return readable;
}

function architectureMismatchCandidates(
  root: ArtifactRootResolution,
  planningRoot?: ArtifactRootResolution,
): string[] {
  if (planningRoot === undefined) return [];
  const planningArchitectureSubject = `${planningRoot.resolvedRoot}/architecture`;
  const candidates = [`${planningRoot.resolvedRoot}/architecture.md`];
  if (root.resolutionMode === "explicit-config") {
    candidates.push(
      `${planningArchitectureSubject}/architecture.md`,
      `${planningArchitectureSubject}/index.md`,
    );
  }
  return candidates;
}

async function isSymbolicLink(targetPath: string): Promise<boolean> {
  try {
    return (await lstat(targetPath)).isSymbolicLink();
  } catch (error) {
    if (isMissing(error)) return false;
    throw error;
  }
}

function isSameOrDescendant(candidate: string, container: string): boolean {
  const relative = path.relative(container, candidate);
  return relative.length === 0 || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function issue(input: {
  issueId:
    | "artifact-path.ambiguous-subject-document-shape"
    | "artifact-path.invalid-sharded-document-shape"
    | "artifact-path.broken-shard-reference"
    | "artifact-path.subject-document-missing"
    | "artifact-path.config-artifact-mismatch"
    | "artifact-path.symlink-escape";
  affectedPath: string;
  reason: string;
  details: Record<string, unknown>;
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: "artifact-path",
    severity: "error",
    affectedPath: input.affectedPath,
    component: "artifact-document-discovery",
    details: { ...input.details, reason: input.reason },
    impact: "The requested planning or solutioning document shape cannot be consumed deterministically.",
    suggestedNextStep: "Repair the subject document shape or provide an explicit invocation selection, then retry.",
  };
}
