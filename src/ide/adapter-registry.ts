export const CANONICAL_TARGET_ORDER = ["claude", "agents"] as const;

export type IdeTargetId = (typeof CANONICAL_TARGET_ORDER)[number];

export type IdeAdapterDefinition = {
  id: IdeTargetId;
  targetDirectory: ".claude/skills" | ".agents/skills";
  entryType: "self-contained-skill";
  supportedActivationTargets: string[];
  sharedTargetPolicy: "dedupe-by-canonical-skill-id";
  commandPointerBehavior: "none" | "unsupported";
  knownLimitations: string[];
  validationChecks: string[];
  targetOrder: number;
};

export const IDE_ADAPTER_REGISTRY: readonly IdeAdapterDefinition[] = [
  {
    id: "claude",
    targetDirectory: ".claude/skills",
    entryType: "self-contained-skill",
    supportedActivationTargets: ["skills"],
    sharedTargetPolicy: "dedupe-by-canonical-skill-id",
    commandPointerBehavior: "none",
    knownLimitations: [],
    validationChecks: ["entry-has-skill-md", "canonical-skill-id-directory"],
    targetOrder: 0,
  },
  {
    id: "agents",
    targetDirectory: ".agents/skills",
    entryType: "self-contained-skill",
    supportedActivationTargets: ["skills"],
    sharedTargetPolicy: "dedupe-by-canonical-skill-id",
    commandPointerBehavior: "none",
    knownLimitations: [],
    validationChecks: ["entry-has-skill-md", "canonical-skill-id-directory"],
    targetOrder: 1,
  },
] as const;

export function getIdeAdapterRegistry(): readonly IdeAdapterDefinition[] {
  return IDE_ADAPTER_REGISTRY;
}

