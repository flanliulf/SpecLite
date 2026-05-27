import type { ValidationIssue } from "../diagnostics/command-result-schema.js";

export type ResolverComponent = "resolve-command" | "config-resolver" | "customization-resolver";

export type ResolverLayerKind = "config" | "customization";

export type ResolverLayerRole =
  | "required-config"
  | "optional-config"
  | "skill-defaults"
  | "team-custom"
  | "user-custom";

export function createResolveIssue(input: {
  issueId: "runtime-path.missing-entry" | "runtime-path.invalid-script-path" | "manifest-schema.malformed-field";
  severity: ValidationIssue["severity"];
  affectedPath: string;
  component: ResolverComponent;
  layerKind?: ResolverLayerKind;
  layerRole?: ResolverLayerRole;
  status: "missing" | "read-failed" | "parse-failed" | "invalid-args";
}): ValidationIssue {
  return {
    issueId: input.issueId,
    category: input.issueId.startsWith("manifest-schema.") ? "manifest-schema" : "runtime-path",
    severity: input.severity,
    affectedPath: input.affectedPath,
    component: input.component,
    details: {
      ...(input.layerKind === undefined ? {} : { layerKind: input.layerKind }),
      ...(input.layerRole === undefined ? {} : { layerRole: input.layerRole }),
      status: input.status,
    },
    impact: createImpact(input),
    suggestedNextStep: createSuggestedNextStep(input),
  };
}

function createImpact(input: { severity: ValidationIssue["severity"]; status: string }): string {
  if (input.severity === "warning") {
    return "An optional resolver layer could not be used and was treated as an empty object.";
  }
  if (input.status === "invalid-args") {
    return "The resolver command cannot determine the requested runtime input.";
  }
  return "A required resolver layer is unavailable, so no resolved output can be produced safely.";
}

function createSuggestedNextStep(input: { status: string }): string {
  if (input.status === "parse-failed") {
    return "Fix the TOML syntax in the affected layer and rerun the resolver.";
  }
  if (input.status === "invalid-args") {
    return "Pass the required resolver option explicitly and rerun the command.";
  }
  return "Restore the required resolver layer or choose a customization-capable installed skill.";
}
