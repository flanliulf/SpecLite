import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseToml } from "toml";
import { parse as parseYaml } from "yaml";
import { resolvePortableProjectPath } from "../config/config-schema.js";

const ALLOWING_RESULTS = new Set(["PASS", "PASS_EQUIVALENT"]);
const ALLOWING_FOUNDATION_STATUSES = new Set(["PASS", "NOT_APPLICABLE"]);
const FOUNDATION_GATE_STATUS_KEYS = ["foundationPrerequisiteStatus", "closureOwnerCheckStatus"] as const;
const REQUIRED_REPORT_SCHEMA_VERSION = "speclite.flow-gate-report.v2";
const LEGACY_REPORT_SCHEMA_VERSION = "speclite.flow-gate-report.v1";
const REQUIRED_HANDOFF_CONTRACT_VERSION = "speclite.story-kickoff-handoff.v1";
const MAX_METADATA_AGE_DAYS = 30;

export type FlowGateHookDecision = {
  decision: "allow" | "block";
  reason: string;
  exitCode: 0 | 2;
};

export async function evaluateFlowGateHookEvent(input: {
  projectRoot: string;
  event: unknown;
  now?: Date;
}): Promise<FlowGateHookDecision> {
  const prompt = extractPrompt(input.event);
  if (prompt === undefined || !isDevStoryIntent(prompt)) {
    return {
      decision: "allow",
      reason: "No speclite-dev-story intent detected.",
      exitCode: 0,
    };
  }

  const projectRoot = extractProjectRoot(input.event) ?? input.projectRoot;
  const implementationArtifacts = await resolveImplementationArtifacts(projectRoot);
  const storyResolution = await resolveStoryKey({
    projectRoot,
    implementationArtifacts,
    prompt,
  });
  if (storyResolution.status !== "resolved") {
    return {
      decision: "block",
      reason: "Unable to resolve exactly one Story for speclite-dev-story. Specify one Story key before development.",
      exitCode: 2,
    };
  }

  const metadataPath = path.join(
    projectRoot,
    implementationArtifacts,
    "flow-gates",
    `${storyResolution.storyKey}-story-kickoff-gate.md`,
  );
  const metadata = await readFlowGateMetadata(metadataPath);
  if (metadata === undefined) {
    return block(
      `Missing Flow Gate metadata for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }

  if (metadata.mode !== "story-kickoff") {
    return block(
      `Flow Gate mode ${String(metadata.mode)} does not allow development for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (metadata.storyKey !== storyResolution.storyKey || metadata.target !== storyResolution.storyKey) {
    return block(
      `Flow Gate metadata target mismatch for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (!ALLOWING_RESULTS.has(String(metadata.result))) {
    return block(
      `Flow Gate result ${String(metadata.result)} does not allow development for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (isStaleGeneratedAt(metadata.generatedAt, input.now ?? new Date())) {
    return block(
      `Flow Gate metadata is stale for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  const handoffContractStatus = evaluateHandoffContractStatus(metadata);
  if (handoffContractStatus.status === "legacy") {
    return block(
      `Legacy Flow Gate report v1 must be regenerated for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (handoffContractStatus.status === "schema-mismatch") {
    return block(
      `Flow Gate schemaVersion ${String(handoffContractStatus.value)} does not allow development for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (handoffContractStatus.status === "missing-handoff-contract-version") {
    return block(
      `Flow Gate handoff contract version is missing for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (handoffContractStatus.status === "handoff-contract-version-mismatch") {
    return block(
      `Flow Gate handoff contract version ${String(handoffContractStatus.value)} does not allow development for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  const foundationGateStatus = evaluateFoundationGateStatus(metadata);
  if (foundationGateStatus.status === "missing") {
    return block(
      `Flow Gate foundation prerequisite metadata is missing for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }
  if (foundationGateStatus.status === "blocked") {
    return block(
      `Flow Gate ${foundationGateStatus.key} ${String(foundationGateStatus.value)} does not allow development for ${storyResolution.storyKey}. ${nextAction(storyResolution.storyKey)}`,
    );
  }

  return {
    decision: "allow",
    reason: `Flow Gate story-kickoff evidence passed for ${storyResolution.storyKey}.`,
    exitCode: 0,
  };
}

function extractPrompt(event: unknown): string | undefined {
  if (!isRecord(event)) return undefined;
  const prompt = event.prompt ?? event.userPrompt ?? event.input ?? event.command;
  return typeof prompt === "string" ? prompt : undefined;
}

function extractProjectRoot(event: unknown): string | undefined {
  if (!isRecord(event)) return undefined;
  const projectRoot = event.projectRoot ?? event.cwd ?? event.workspaceRoot;
  return typeof projectRoot === "string" && projectRoot.trim().length > 0 ? projectRoot : undefined;
}

function isDevStoryIntent(prompt: string): boolean {
  return /\b(?:speclite-dev-story|bmad-dev-story)\b/.test(prompt);
}

async function resolveImplementationArtifacts(projectRoot: string): Promise<string> {
  const configPath = path.join(projectRoot, "_speclite/config.toml");
  const config = parseToml(await readFile(configPath, "utf8")) as {
    core?: { output_folder?: string };
    modules?: { sdlc?: { implementation_artifacts?: string } };
  };

  return resolvePortableProjectPath(
    config.modules?.sdlc?.implementation_artifacts ??
      `${config.core?.output_folder ?? "_speclite-output"}/implementation-artifacts`,
  );
}

async function resolveStoryKey(input: {
  projectRoot: string;
  implementationArtifacts: string;
  prompt: string;
}): Promise<{ status: "resolved"; storyKey: string } | { status: "ambiguous" }> {
  const storyKeys = extractStoryKeyCandidates(input.prompt);
  if (storyKeys.length !== 1) return { status: "ambiguous" };
  const candidate = storyKeys[0];
  if (candidate === undefined) return { status: "ambiguous" };
  if (/^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)) {
    return { status: "resolved", storyKey: candidate };
  }

  const resolved = await expandStoryPrefix({
    projectRoot: input.projectRoot,
    implementationArtifacts: input.implementationArtifacts,
    prefix: candidate,
  });
  return resolved === undefined ? { status: "ambiguous" } : { status: "resolved", storyKey: resolved };
}

function extractStoryKeyCandidates(prompt: string): string[] {
  const matches = prompt.match(/\b\d+-\d+(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\b/g) ?? [];
  return [...new Set(matches)];
}

async function expandStoryPrefix(input: {
  projectRoot: string;
  implementationArtifacts: string;
  prefix: string;
}): Promise<string | undefined> {
  const storyRoot = path.join(input.projectRoot, input.implementationArtifacts, "stories");
  let entries: string[];
  try {
    entries = await readdir(storyRoot);
  } catch {
    return undefined;
  }
  const matches = entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => entry.slice(0, -".md".length))
    .filter((storyKey) => storyKey === input.prefix || storyKey.startsWith(`${input.prefix}-`));
  return matches.length === 1 ? matches[0] : undefined;
}

async function readFlowGateMetadata(filePath: string): Promise<Record<string, unknown> | undefined> {
  let contents: string;
  try {
    contents = await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
  if (!contents.startsWith("---\n")) return undefined;
  const end = contents.indexOf("\n---", 4);
  if (end < 0) return undefined;
  const parsed = parseYaml(contents.slice(4, end));
  return isRecord(parsed) ? parsed : undefined;
}

function evaluateHandoffContractStatus(
  metadata: Record<string, unknown>,
):
  | { status: "allowed" }
  | { status: "legacy" }
  | { status: "schema-mismatch"; value: unknown }
  | { status: "missing-handoff-contract-version" }
  | { status: "handoff-contract-version-mismatch"; value: unknown } {
  if (metadata.schemaVersion === LEGACY_REPORT_SCHEMA_VERSION) return { status: "legacy" };
  if (metadata.schemaVersion !== REQUIRED_REPORT_SCHEMA_VERSION) {
    return { status: "schema-mismatch", value: metadata.schemaVersion };
  }

  const handoffContractVersion = metadata.handoffContractVersion;
  if (typeof handoffContractVersion !== "string" || handoffContractVersion.trim().length === 0) {
    return { status: "missing-handoff-contract-version" };
  }
  if (handoffContractVersion !== REQUIRED_HANDOFF_CONTRACT_VERSION) {
    return { status: "handoff-contract-version-mismatch", value: handoffContractVersion };
  }
  return { status: "allowed" };
}

function evaluateFoundationGateStatus(
  metadata: Record<string, unknown>,
):
  | { status: "allowed" }
  | { status: "missing" }
  | { status: "blocked"; key: (typeof FOUNDATION_GATE_STATUS_KEYS)[number]; value: unknown } {
  for (const key of FOUNDATION_GATE_STATUS_KEYS) {
    const value = metadata[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      return { status: "missing" };
    }
    if (!ALLOWING_FOUNDATION_STATUSES.has(value)) {
      return { status: "blocked", key, value };
    }
  }
  return { status: "allowed" };
}

function isStaleGeneratedAt(value: unknown, now: Date): boolean {
  if (typeof value !== "string") return true;
  const generatedAt = new Date(value);
  if (!Number.isFinite(generatedAt.getTime())) return true;
  const ageMs = now.getTime() - generatedAt.getTime();
  return ageMs > MAX_METADATA_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function block(reason: string): FlowGateHookDecision {
  return {
    decision: "block",
    reason,
    exitCode: 2,
  };
}

function nextAction(storyKey: string): string {
  return `Run speclite-flow-gate mode=story-kickoff target=${storyKey} before dev-story.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
