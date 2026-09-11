#!/usr/bin/env node

import { lstat, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REPORT_PREFIX = "prd-validate-report-";
const REPORT_EXISTS_ISSUE_ID = "artifact-path.prd-validation-report-exists";
const MANUAL_ACTION = "保留并移走或删除既有报告后重新运行";
const LEGACY_PATTERNS = [
  /^validation-report-.+\.md$/i,
  /^prd-validation-report(?:-.+)?\.md$/i,
  /^prd-validation-(?!report-).+\.md$/i,
  /^validate-prd-report-.+\.md$/i,
];

/**
 * Private execution primitive for the PRD validation report's first write.
 * The workflow supplies its invocation-scoped date once; this function derives
 * the only allowed target and performs no progress or suffix writes.
 */
export async function executePrdValidationReportOperation(input) {
  if (!isValidInput(input)) return failure(null, "invalid-operation-input");
  if (!isCanonicalDate(input.invocationDate)) return failure(null, "invalid-invocation-date");

  const prepared = await inspectTarget(input);
  if (!prepared.ok) return prepared;

  await input.__testOnlyInterposeBeforeCommit?.();

  const commitState = await inspectTarget(input);
  if (!commitState.ok) return commitState;

  try {
    await writeFile(commitState.absolutePath, input.content, { flag: "wx" });
  } catch (error) {
    if (isAlreadyExists(error)) return existingTargetFailure(commitState.targetPath);
    return failure(commitState.targetPath, filesystemReason(error));
  }

  return { ok: true, targetPath: commitState.targetPath, operation: "create-file" };
}

/** Read-only early gate used before the workflow gathers or writes progress. */
export async function inspectPrdValidationReportTarget(input) {
  if (input === null || typeof input !== "object") return failure(null, "invalid-operation-input");
  if (!isCanonicalDate(input.invocationDate)) return failure(null, "invalid-invocation-date");
  const state = await inspectTarget(input);
  return state.ok
    ? { ok: true, targetPath: state.targetPath, targetStatus: "absent" }
    : state;
}

/** Read-only discovery for canonical and historical PRD validation evidence. */
export async function discoverPrdValidationReports(input) {
  const roots = await resolveRoots(input?.projectRoot, input?.planningRoot);
  if (!roots.ok) return failure(null, roots.reason);
  const prdRoot = path.join(roots.planningAbsolute, "prd");
  const owner = await inspectPrdOwner(prdRoot, roots.planningPhysical);
  if (!owner.ok) return failure(null, owner.reason);

  let entries;
  try {
    entries = await readdir(prdRoot, { withFileTypes: true });
  } catch (error) {
    return failure(null, filesystemReason(error));
  }

  const canonicalReports = [];
  const legacyReports = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const relativePath = `${roots.planningRelative}/prd/${entry.name}`;
    if (isCanonicalReportBasename(entry.name)) canonicalReports.push(relativePath);
    else if (LEGACY_PATTERNS.some((pattern) => pattern.test(entry.name))) legacyReports.push(relativePath);
  }
  return {
    ok: true,
    canonicalReports: canonicalReports.sort(),
    legacyReports: legacyReports.sort(),
  };
}

async function inspectTarget(input) {
  const roots = await resolveRoots(input.projectRoot, input.planningRoot);
  if (!roots.ok) return failure(null, roots.reason);
  const prdRoot = path.join(roots.planningAbsolute, "prd");
  const owner = await inspectPrdOwner(prdRoot, roots.planningPhysical);
  if (!owner.ok) return failure(null, owner.reason);

  const basename = `${REPORT_PREFIX}${input.invocationDate}.md`;
  const targetPath = `${roots.planningRelative}/prd/${basename}`;
  const absolutePath = path.join(prdRoot, basename);
  try {
    await lstat(absolutePath);
    return existingTargetFailure(targetPath);
  } catch (error) {
    if (!isMissing(error)) return failure(targetPath, filesystemReason(error));
  }
  return { ok: true, targetPath, absolutePath };
}

async function resolveRoots(projectRoot, planningRoot) {
  if (typeof projectRoot !== "string" || !path.isAbsolute(projectRoot)) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  const planning = resolvePortableProjectPath(path.resolve(projectRoot), planningRoot);
  if (!planning.ok) return planning;
  try {
    const projectPhysical = await realpath(projectRoot);
    const projectStat = await stat(projectPhysical);
    const planningStat = await stat(planning.absolutePath);
    if (!projectStat.isDirectory() || !planningStat.isDirectory()) {
      return { ok: false, reason: "candidate-not-directory" };
    }
    const planningPhysical = await realpath(planning.absolutePath);
    if (!isSameOrDescendant(planningPhysical, projectPhysical)) {
      return { ok: false, reason: "candidate-symlink-escape" };
    }
    return {
      ok: true,
      planningAbsolute: planning.absolutePath,
      planningPhysical,
      planningRelative: planning.relativePath,
    };
  } catch (error) {
    return { ok: false, reason: filesystemReason(error) };
  }
}

async function inspectPrdOwner(prdRoot, planningPhysical) {
  try {
    const entry = await lstat(prdRoot);
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      return { ok: false, reason: "candidate-not-directory" };
    }
    const physical = await realpath(prdRoot);
    const expected = path.join(planningPhysical, "prd");
    if (path.resolve(physical) !== path.resolve(expected)) {
      return { ok: false, reason: "candidate-symlink-escape" };
    }
    const physicalStat = await stat(physical);
    return physicalStat.isDirectory()
      ? { ok: true }
      : { ok: false, reason: "candidate-not-directory" };
  } catch (error) {
    return { ok: false, reason: filesystemReason(error) };
  }
}

function resolvePortableProjectPath(projectRoot, relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath.includes("\\") ||
    relativePath.includes("\0") ||
    path.posix.isAbsolute(relativePath)
  ) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  const normalized = path.posix.normalize(relativePath);
  if (normalized === "." || normalized === ".." || normalized.startsWith("../") || normalized !== relativePath) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  const absolutePath = path.resolve(projectRoot, ...normalized.split("/"));
  if (!isSameOrDescendant(absolutePath, projectRoot)) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  return { ok: true, relativePath: normalized, absolutePath };
}

function isValidInput(input) {
  return input !== null &&
    typeof input === "object" &&
    typeof input.projectRoot === "string" &&
    typeof input.planningRoot === "string" &&
    typeof input.invocationDate === "string" &&
    (typeof input.content === "string" || input.content instanceof Uint8Array);
}

function isCanonicalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isCanonicalReportBasename(value) {
  const match = /^prd-validate-report-(\d{4}-\d{2}-\d{2})\.md$/.exec(value);
  return match !== null && isCanonicalDate(match[1]);
}

function existingTargetFailure(targetPath) {
  return {
    ok: false,
    targetPath,
    reason: "prd-validation-report-exists",
    issue: {
      issueId: REPORT_EXISTS_ISSUE_ID,
      category: "artifact-path",
      severity: "error",
      continuation: "block",
      affectedPath: targetPath,
      details: { reason: "prd-validation-report-exists" },
      impact: "同日 canonical PRD validation report 已存在，本次 validation 不能生成独立 evidence。",
      suggestedNextStep: MANUAL_ACTION,
    },
  };
}

function failure(targetPath, reason) {
  return { ok: false, targetPath, reason };
}

function filesystemReason(error) {
  if (isMissing(error)) return "candidate-unreadable";
  if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOTDIR") {
    return "candidate-not-directory";
  }
  return "candidate-unreadable";
}

function isMissing(error) {
  return error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

function isAlreadyExists(error) {
  return error !== null && typeof error === "object" && "code" in error && error.code === "EEXIST";
}

function isSameOrDescendant(candidate, root) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function parseCli(argv) {
  const [operation, ...rest] = argv;
  const expected = operation === "create" || operation === "probe"
    ? ["--project-root", "--planning-root", "--date"]
    : operation === "discover"
      ? ["--project-root", "--planning-root"]
      : null;
  if (expected === null || rest.length !== expected.length * 2) {
    return { ok: false, targetPath: null, reason: "invalid-cli-arguments" };
  }
  const values = {};
  for (let index = 0; index < expected.length; index += 1) {
    if (rest[index * 2] !== expected[index] || !rest[index * 2 + 1]) {
      return { ok: false, targetPath: null, reason: "invalid-cli-arguments" };
    }
    values[expected[index].slice(2)] = rest[index * 2 + 1];
  }
  return { ok: true, operation, values };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function runCli(argv) {
  const parsed = parseCli(argv);
  if (!parsed.ok) return parsed;
  if (parsed.operation === "discover") {
    return discoverPrdValidationReports({
      projectRoot: parsed.values["project-root"],
      planningRoot: parsed.values["planning-root"],
    });
  }
  if (parsed.operation === "probe") {
    return inspectPrdValidationReportTarget({
      projectRoot: parsed.values["project-root"],
      planningRoot: parsed.values["planning-root"],
      invocationDate: parsed.values.date,
    });
  }
  return executePrdValidationReportOperation({
    projectRoot: parsed.values["project-root"],
    planningRoot: parsed.values["planning-root"],
    invocationDate: parsed.values.date,
    content: await readStdin(),
  });
}

const invokedDirectly = process.argv[1] !== undefined && await isDirectInvocation(process.argv[1]);
if (invokedDirectly) {
  const result = await runCli(process.argv.slice(2)).catch(() => failure(null, "operation-failed"));
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}

async function isDirectInvocation(argvPath) {
  try {
    return await realpath(argvPath) === await realpath(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
