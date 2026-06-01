import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { ExternalAccess, SourceResolutionPlan } from "../installer/install-plan-schema.js";
import {
  BUNDLED_SOURCE_DISPLAY_ROOT,
} from "./source-discovery.js";
import {
  type SourceDescriptor,
  type SourceType,
  SourceTypeSchema,
} from "./source-descriptor-schema.js";

export const SOURCE_TYPE_VALUES = [
  "bundled",
  "npm",
  "private-registry",
  "local-tarball",
  "offline-bundle",
  "git",
  "local",
] as const satisfies SourceType[];

export type SourceSelectionInput = {
  sourceType?: string;
  sourceValue?: string;
  requestedVersion?: string;
  channel?: string;
};

export type NormalizedSourceSelection = {
  sourceType: SourceType;
  requestedSourceValue: string;
  rawSourceValue?: string;
  registryPackageName?: string;
  requestedVersion?: string;
  channel?: string;
};

export type SourceSelectionResult =
  | {
      ok: true;
      selection: NormalizedSourceSelection;
    }
  | {
      ok: false;
      issue: ValidationIssue;
    };

export function normalizeSourceSelection(input: SourceSelectionInput): SourceSelectionResult {
  const rawSourceType = normalizeToken(input.sourceType) ?? "bundled";
  const sourceTypeResult = SourceTypeSchema.safeParse(rawSourceType);
  if (!sourceTypeResult.success) {
    return {
      ok: false,
      issue: createSourceSelectionIssue({
        reason: "invalid-source-type",
        impact: "The requested source type is not part of the SpecLite MVP source vocabulary.",
        suggestedNextStep:
          "Choose bundled, npm, private-registry, local-tarball, offline-bundle, git or local.",
      }),
    };
  }

  const sourceType = sourceTypeResult.data;
  const requestedVersion = normalizeRequestedSelector(input.requestedVersion, "version");
  const channel = normalizeRequestedSelector(input.channel, "channel");
  if (sourceType === "bundled") {
    return {
      ok: true,
      selection: {
        sourceType,
        requestedSourceValue: BUNDLED_SOURCE_DISPLAY_ROOT,
        ...(requestedVersion === undefined ? {} : { requestedVersion }),
        ...(channel === undefined ? {} : { channel }),
      },
    };
  }

  const sourceValue = normalizeOptionalInput(input.sourceValue);
  if (sourceValue === undefined) {
    return {
      ok: false,
      issue: createSourceSelectionIssue({
        reason: "missing-source-value",
        requestedSourceType: sourceType,
        impact: "The selected custom source type needs a source value before resolution can be planned.",
        suggestedNextStep: "Provide a package name, registry source, tarball, bundle, Git source or local source value.",
      }),
    };
  }

  const displaySafeSourceLabel = createDisplaySafeSourceLabel({
    sourceType,
    sourceValue,
  });
  const registryPackageName =
    sourceType === "npm" || sourceType === "private-registry"
      ? normalizeRegistryPackageName(sourceValue)
      : undefined;

  return {
    ok: true,
    selection: withPrivateRawSourceValue({
      sourceType,
      requestedSourceValue: displaySafeSourceLabel,
      ...(registryPackageName === undefined ? {} : { registryPackageName }),
      ...(requestedVersion === undefined ? {} : { requestedVersion }),
      ...(channel === undefined ? {} : { channel }),
    }, sourceValue),
  };
}

export function createSourceResolutionPlan(input: {
  selection: NormalizedSourceSelection;
  confirmed: boolean;
}): SourceResolutionPlan {
  const externalAccesses =
    input.selection.sourceType === "bundled"
      ? []
      : [createExternalAccess(input.selection, input.confirmed)];

  return {
    requestedSourceType: input.selection.sourceType,
    requestedSourceValue: input.selection.requestedSourceValue,
    externalAccesses,
    requiresConfirmation: externalAccesses.length > 0,
    confirmed: externalAccesses.length === 0 ? true : input.confirmed,
  };
}

export function createBlockedSourceDescriptor(
  selection: NormalizedSourceSelection,
): SourceDescriptor {
  return {
    sourceType: selection.sourceType,
    ...(selection.channel === undefined ? {} : { channel: selection.channel }),
    ...(selection.requestedVersion === undefined
      ? {}
      : { requestedVersion: selection.requestedVersion }),
    resolvedRoot: selection.requestedSourceValue,
    integrityEvidence: [],
    trustStatus: "blocked",
  };
}

export function createUnsupportedSourceResolutionIssue(
  selection: NormalizedSourceSelection,
): ValidationIssue {
  return {
    issueId: "source-integrity.unsupported-source",
    category: "source-integrity",
    severity: "error",
    component: "source-resolution",
    details: {
      reason: "source-specific-resolution-not-implemented",
      requestedSourceType: selection.sourceType,
    },
    impact:
      "SpecLite recorded the custom source request and external access intent, but this source-specific resolver is not implemented in Story 5.1.",
    suggestedNextStep:
      "Use bundled source for this Story, or wait for the later source-specific resolver story before installing from this source.",
  };
}

export function createUnconfirmedSourceAccessIssue(
  selection: NormalizedSourceSelection,
): ValidationIssue {
  return {
    issueId: "source-integrity.unsupported-source",
    category: "source-integrity",
    severity: "error",
    component: "source-resolution",
    details: {
      reason: "source-access-not-confirmed",
      requestedSourceType: selection.sourceType,
    },
    impact:
      "SpecLite recorded the external access intent, but source access was not explicitly confirmed.",
    suggestedNextStep:
      "Confirm the selected source before registry resolution, operation lock acquisition or project writes.",
  };
}

function createExternalAccess(
  selection: NormalizedSourceSelection,
  confirmed: boolean,
): ExternalAccess {
  return {
    sourceType: selection.sourceType,
    sourceValue: selection.requestedSourceValue,
    reason: getExternalAccessReason(selection.sourceType),
    confirmationState: confirmed ? "confirmed" : "pending",
  };
}

function getExternalAccessReason(sourceType: SourceType): string {
  switch (sourceType) {
    case "npm":
      return "Resolve npm package metadata before selecting an installable SpecLite source.";
    case "private-registry":
      return "Resolve private registry package metadata before selecting an installable SpecLite source.";
    case "local-tarball":
      return "Read local tarball metadata before selecting an installable SpecLite source.";
    case "offline-bundle":
      return "Read offline bundle metadata before selecting an installable SpecLite source.";
    case "git":
      return "Resolve Git source metadata before selecting an installable SpecLite source.";
    case "local":
      return "Read local source metadata before selecting an installable SpecLite source.";
    case "bundled":
      return "Bundled source does not require external access.";
  }
}

function createDisplaySafeSourceLabel(input: {
  sourceType: SourceType;
  sourceValue: string;
}): string {
  switch (input.sourceType) {
    case "npm":
      return sanitizePackageLabel(input.sourceValue);
    case "private-registry":
      return normalizeRegistryPackageName(input.sourceValue) ?? "redacted-private-registry";
    case "local-tarball":
      return "local-tarball";
    case "offline-bundle":
      return "offline-bundle";
    case "git":
      return "redacted-git-remote";
    case "local":
      return "local-source";
    case "bundled":
      return BUNDLED_SOURCE_DISPLAY_ROOT;
  }
}

function normalizeRegistryPackageName(value: string): string | undefined {
  const normalized = value.trim().replaceAll("\\", "/");
  if (
    hasUnsafeDisplayValue(value) ||
    containsSecretLikeToken(value) ||
    hasSelectorPayloadDelimiter(normalized) ||
    !isNpmPackageNameLabel(normalized)
  ) {
    return undefined;
  }
  return normalized;
}

function sanitizePackageLabel(value: string): string {
  return normalizeRegistryPackageName(value) ?? "redacted-npm-package";
}

function hasSelectorPayloadDelimiter(value: string): boolean {
  return value.includes("?") || value.includes("#");
}

function isNpmPackageNameLabel(value: string): boolean {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i.test(value);
}

function createSourceSelectionIssue(input: {
  reason: "invalid-source-type" | "missing-source-value";
  requestedSourceType?: SourceType;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: "source-integrity.unsupported-source",
    category: "source-integrity",
    severity: "error",
    component: "source-selection",
    details: {
      reason: input.reason,
      ...(input.requestedSourceType === undefined
        ? {}
        : { requestedSourceType: input.requestedSourceType }),
    },
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function normalizeToken(value: string | undefined): string | undefined {
  const normalized = normalizeOptionalInput(value)?.toLowerCase();
  if (normalized === "registry") return "npm";
  if (normalized === "private") return "private-registry";
  if (normalized === "tarball") return "local-tarball";
  if (normalized === "offline") return "offline-bundle";
  if (normalized === "path") return "local";
  return normalized;
}

function normalizeOptionalInput(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}

function normalizeRequestedSelector(
  value: string | undefined,
  selectorKind: "channel" | "version",
): string | undefined {
  const normalized = normalizeOptionalInput(value);
  if (normalized === undefined) return undefined;
  if (
    !hasUnsafeDisplayValue(normalized) &&
    !containsSecretLikeToken(normalized) &&
    !hasSelectorPayloadDelimiter(normalized)
  ) {
    return normalized;
  }
  return selectorKind === "channel" ? "redacted-channel" : "redacted-selector";
}

function hasUnsafeDisplayValue(value: string): boolean {
  return (
    value.includes("\\") ||
    value.includes("://") ||
    value.includes("@") && /[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value) ||
    value.startsWith("/") ||
    value.startsWith("~/") ||
    /^[A-Za-z]:[\\/]/.test(value)
  );
}

function containsSecretLikeToken(value: string): boolean {
  return /(?:token|secret|password|credential|auth|key)=/i.test(value);
}

function withPrivateRawSourceValue<TSelection extends NormalizedSourceSelection>(
  selection: TSelection,
  rawSourceValue: string,
): TSelection {
  Object.defineProperty(selection, "rawSourceValue", {
    value: rawSourceValue,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return selection;
}
