import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseToml } from "toml";
import { parse as parseYaml } from "yaml";

const ALLOWING_RESULTS = new Set(["PASS", "PASS_EQUIVALENT"]);
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

  return (
    config.modules?.sdlc?.implementation_artifacts ??
    `${config.core?.output_folder ?? "_speclite-output"}/implementation-artifacts`
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
