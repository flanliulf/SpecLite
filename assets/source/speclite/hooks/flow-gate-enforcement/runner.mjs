#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ALLOWING_RESULTS = new Set(["PASS", "PASS_EQUIVALENT"]);
const ALLOWING_FOUNDATION_STATUSES = new Set(["PASS", "NOT_APPLICABLE"]);
const FOUNDATION_GATE_STATUS_KEYS = ["foundationPrerequisiteStatus", "closureOwnerCheckStatus"];
const REQUIRED_REPORT_SCHEMA_VERSION = "speclite.flow-gate-report.v2";
const LEGACY_REPORT_SCHEMA_VERSION = "speclite.flow-gate-report.v1";
const REQUIRED_HANDOFF_CONTRACT_VERSION = "speclite.story-kickoff-handoff.v1";
const MAX_METADATA_AGE_DAYS = 30;

const stdin = await readStdin();
const event = stdin.trim().length === 0 ? {} : JSON.parse(stdin);
const runtimeOptions = resolveRuntimeOptions(process.argv.slice(2));
const result = await evaluate({
  event,
  projectRoot: event.projectRoot ?? event.cwd ?? process.cwd(),
  now: new Date(),
});
emitHookResult(result, runtimeOptions.platform);

async function evaluate(input) {
  const prompt = extractPrompt(input.event);
  if (prompt === undefined || !/\b(?:speclite-dev-story|bmad-dev-story)\b/.test(prompt)) {
    return allow("No speclite-dev-story intent detected.");
  }

  const implementationArtifacts = await resolveImplementationArtifacts(input.projectRoot);
  const storyKey = await resolveStoryKey({
    projectRoot: input.projectRoot,
    implementationArtifacts,
    prompt,
  });
  if (storyKey === undefined) {
    return block("Unable to resolve exactly one Story for speclite-dev-story. Specify one Story key before development.");
  }

  const metadataPath = path.join(
    input.projectRoot,
    implementationArtifacts,
    "flow-gates",
    `${storyKey}-story-kickoff-gate.md`,
  );
  const metadata = await readFlowGateMetadata(metadataPath);
  if (metadata === undefined) return block(`Missing Flow Gate metadata for ${storyKey}. ${nextAction(storyKey)}`);
  if (metadata.mode !== "story-kickoff") {
    return block(`Flow Gate mode ${String(metadata.mode)} does not allow development for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (metadata.storyKey !== storyKey || metadata.target !== storyKey) {
    return block(`Flow Gate metadata target mismatch for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (!ALLOWING_RESULTS.has(String(metadata.result))) {
    return block(`Flow Gate result ${String(metadata.result)} does not allow development for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (isStaleGeneratedAt(metadata.generatedAt, input.now)) {
    return block(`Flow Gate metadata is stale for ${storyKey}. ${nextAction(storyKey)}`);
  }
  const handoffContractStatus = evaluateHandoffContractStatus(metadata);
  if (handoffContractStatus.status === "legacy") {
    return block(`Legacy Flow Gate report v1 must be regenerated for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (handoffContractStatus.status === "schema-mismatch") {
    return block(`Flow Gate schemaVersion ${String(handoffContractStatus.value)} does not allow development for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (handoffContractStatus.status === "missing-handoff-contract-version") {
    return block(`Flow Gate handoff contract version is missing for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (handoffContractStatus.status === "handoff-contract-version-mismatch") {
    return block(`Flow Gate handoff contract version ${String(handoffContractStatus.value)} does not allow development for ${storyKey}. ${nextAction(storyKey)}`);
  }
  const foundationGateStatus = evaluateFoundationGateStatus(metadata);
  if (foundationGateStatus.status === "missing") {
    return block(`Flow Gate foundation prerequisite metadata is missing for ${storyKey}. ${nextAction(storyKey)}`);
  }
  if (foundationGateStatus.status === "blocked") {
    return block(`Flow Gate ${foundationGateStatus.key} ${String(foundationGateStatus.value)} does not allow development for ${storyKey}. ${nextAction(storyKey)}`);
  }

  return allow(`Flow Gate story-kickoff evidence passed for ${storyKey}.`);
}

function extractPrompt(event) {
  const prompt = event.prompt ?? event.userPrompt ?? event.input ?? event.command;
  return typeof prompt === "string" ? prompt : undefined;
}

async function resolveImplementationArtifacts(projectRoot) {
  const config = parseSimpleToml(await readFile(path.join(projectRoot, "_speclite/config.toml"), "utf8"));
  return resolvePortableProjectPath(
    config["modules.sdlc.implementation_artifacts"] ?? `${config["core.output_folder"] ?? "_speclite-output"}/implementation-artifacts`,
  );
}

function resolvePortableProjectPath(value) {
  const token = "{project-root}/";
  return value.startsWith(token) ? value.slice(token.length) : value;
}

async function resolveStoryKey(input) {
  const matches = [...new Set(input.prompt.match(/\b\d+-\d+(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\b/g) ?? [])];
  if (matches.length !== 1) return undefined;
  const candidate = matches[0];
  if (/^\d+-\d+-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)) return candidate;
  let entries;
  try {
    entries = await readdir(path.join(input.projectRoot, input.implementationArtifacts, "stories"));
  } catch {
    return undefined;
  }
  const expanded = entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => entry.slice(0, -3))
    .filter((storyKey) => storyKey === candidate || storyKey.startsWith(`${candidate}-`));
  return expanded.length === 1 ? expanded[0] : undefined;
}

async function readFlowGateMetadata(filePath) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
  if (!contents.startsWith("---\n")) return undefined;
  const end = contents.indexOf("\n---", 4);
  if (end < 0) return undefined;
  return parseSimpleYamlFrontmatter(contents.slice(4, end));
}

function isStaleGeneratedAt(value, now) {
  if (typeof value !== "string") return true;
  const generatedAt = new Date(value);
  if (!Number.isFinite(generatedAt.getTime())) return true;
  return now.getTime() - generatedAt.getTime() > MAX_METADATA_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function evaluateHandoffContractStatus(metadata) {
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

function evaluateFoundationGateStatus(metadata) {
  for (const key of FOUNDATION_GATE_STATUS_KEYS) {
    const value = metadata[key];
    if (typeof value !== "string" || value.trim().length === 0) return { status: "missing" };
    if (!ALLOWING_FOUNDATION_STATUSES.has(value)) return { status: "blocked", key, value };
  }
  return { status: "allowed" };
}

function nextAction(storyKey) {
  return `Run speclite-flow-gate mode=story-kickoff target=${storyKey} before dev-story.`;
}

function allow(reason) {
  return { decision: "allow", reason, exitCode: 0 };
}

function block(reason) {
  return { decision: "block", reason, exitCode: 2 };
}

function emitHookResult(result, platform) {
  if (platform === "claude") {
    if (result.decision === "block") {
      process.stdout.write(`${JSON.stringify({ decision: "block", reason: result.reason })}\n`);
    }
    process.exitCode = 0;
    return;
  }

  process.stdout.write(`${JSON.stringify({ decision: result.decision, reason: result.reason })}\n`);
  process.exitCode = result.exitCode;
}

function resolveRuntimeOptions(args) {
  const platformIndex = args.indexOf("--platform");
  return {
    platform: platformIndex >= 0 ? args[platformIndex + 1] : undefined,
  };
}

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function parseSimpleToml(contents) {
  const values = {};
  let section = "";
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const sectionMatch = trimmed.match(/^\[([A-Za-z0-9_.-]+)\]$/);
    if (sectionMatch !== null) {
      section = sectionMatch[1];
      continue;
    }
    const assignmentMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]*)"$/);
    if (assignmentMatch !== null) {
      values[`${section}.${assignmentMatch[1]}`] = assignmentMatch[2];
    }
  }
  return values;
}

function parseSimpleYamlFrontmatter(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*"?([^"]*)"?\s*$/);
    if (match !== null) values[match[1]] = match[2];
  }
  return values;
}
