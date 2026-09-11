#!/usr/bin/env node

import { constants as fsConstants } from "node:fs";
import { access, lstat, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Execute the private Create UX filesystem primitive.
 *
 * `__testOnlyInterposeBeforeCommit` is available only to repository import
 * tests. The direct CLI parser never accepts it through argv, stdin, or env.
 */
export async function executeUxArtifactOperation(input) {
  const targetPath = safeTargetPath(input?.targetPath);
  if (!isOperationInput(input)) {
    return failure(targetPath, "invalid-operation-input");
  }

  const initial = await inspectMissingCanonicalTarget(input);
  if (!initial.ok) return initial;

  await input.__testOnlyInterposeBeforeCommit?.();

  const commitState = await inspectMissingCanonicalTarget(input);
  if (!commitState.ok) return commitState;

  try {
    if (input.operation.kind === "create-file") {
      await writeFile(commitState.absolutePath, input.operation.content, { flag: "wx" });
    } else {
      await mkdir(commitState.absolutePath);
    }
  } catch (error) {
    return failure(commitState.targetPath, filesystemFailureReason(error));
  }

  return {
    ok: true,
    targetPath: commitState.targetPath,
    operation: input.operation.kind,
  };
}

async function inspectMissingCanonicalTarget(input) {
  const normalizedProject = await resolveProjectRoot(input.projectRoot);
  if (!normalizedProject.ok) return failure(safeTargetPath(input.targetPath), normalizedProject.reason);

  const planning = resolvePortableProjectPath(
    normalizedProject.lexicalRoot,
    input.planningRoot,
  );
  if (!planning.ok) return failure(safeTargetPath(input.targetPath), planning.reason);

  const target = resolvePortableProjectPath(
    normalizedProject.lexicalRoot,
    input.targetPath,
  );
  if (!target.ok) return failure(safeTargetPath(input.targetPath), target.reason);

  let planningPhysical;
  try {
    const planningStat = await stat(planning.absolutePath);
    if (!planningStat.isDirectory()) return failure(target.relativePath, "candidate-not-regular-file");
    planningPhysical = await realpath(planning.absolutePath);
  } catch (error) {
    return failure(target.relativePath, filesystemInspectionReason(error));
  }
  if (!isSameOrDescendant(planningPhysical, normalizedProject.physicalRoot)) {
    return failure(target.relativePath, "candidate-symlink-escape");
  }

  const lexicalUxRoot = path.join(planning.absolutePath, "ux");
  const expectedPhysicalUxRoot = path.join(planningPhysical, "ux");
  let physicalUxRoot;
  try {
    const uxStat = await stat(lexicalUxRoot);
    if (!uxStat.isDirectory()) return failure(target.relativePath, "candidate-not-regular-file");
    physicalUxRoot = await realpath(lexicalUxRoot);
  } catch (error) {
    return failure(target.relativePath, filesystemInspectionReason(error));
  }
  if (
    path.resolve(physicalUxRoot) !== path.resolve(expectedPhysicalUxRoot) ||
    !isSameOrDescendant(physicalUxRoot, normalizedProject.physicalRoot)
  ) {
    return failure(target.relativePath, "candidate-symlink-escape");
  }
  if (
    path.resolve(target.absolutePath) === path.resolve(lexicalUxRoot) ||
    !isSameOrDescendant(target.absolutePath, lexicalUxRoot)
  ) {
    return failure(target.relativePath, "candidate-path-invalid");
  }

  try {
    await lstat(target.absolutePath);
    return failure(target.relativePath, "candidate-path-invalid");
  } catch (error) {
    if (isEnotdir(error)) return failure(target.relativePath, "candidate-not-regular-file");
    if (!isMissing(error)) return failure(target.relativePath, "candidate-unreadable");
  }

  const ancestor = await inspectNearestExistingAncestor(target.absolutePath, physicalUxRoot);
  if (!ancestor.ok) return failure(target.relativePath, ancestor.reason);
  return { ok: true, targetPath: target.relativePath, absolutePath: target.absolutePath };
}

async function inspectNearestExistingAncestor(candidateAbsolutePath, physicalOwnerRoot) {
  let current = path.dirname(candidateAbsolutePath);
  while (true) {
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (isEnotdir(error)) return { ok: false, reason: "candidate-not-regular-file" };
      if (!isMissing(error)) return { ok: false, reason: "candidate-unreadable" };
      const parent = path.dirname(current);
      if (parent === current) return { ok: false, reason: "candidate-unreadable" };
      current = parent;
      continue;
    }
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      return { ok: false, reason: "candidate-not-regular-file" };
    }
    try {
      const realAncestor = await realpath(current);
      const ancestorStat = await stat(realAncestor);
      if (!ancestorStat.isDirectory()) return { ok: false, reason: "candidate-not-regular-file" };
      if (!isSameOrDescendant(realAncestor, physicalOwnerRoot)) {
        return { ok: false, reason: "candidate-symlink-escape" };
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: isMissing(error) ? "candidate-not-regular-file" : "candidate-unreadable",
      };
    }
  }
}

async function resolveProjectRoot(projectRoot) {
  if (typeof projectRoot !== "string" || !path.isAbsolute(projectRoot)) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  try {
    const rootStat = await stat(projectRoot);
    if (!rootStat.isDirectory()) return { ok: false, reason: "candidate-not-regular-file" };
    return {
      ok: true,
      lexicalRoot: path.resolve(projectRoot),
      physicalRoot: await realpath(projectRoot),
    };
  } catch (error) {
    return { ok: false, reason: filesystemInspectionReason(error) };
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
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized !== relativePath
  ) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  const absolutePath = path.resolve(projectRoot, ...normalized.split("/"));
  if (!isSameOrDescendant(absolutePath, projectRoot)) {
    return { ok: false, reason: "candidate-path-invalid" };
  }
  return { ok: true, relativePath: normalized, absolutePath };
}

function isOperationInput(input) {
  if (input === null || typeof input !== "object") return false;
  if (typeof input.projectRoot !== "string" || typeof input.planningRoot !== "string") return false;
  if (typeof input.targetPath !== "string" || input.operation === null || typeof input.operation !== "object") {
    return false;
  }
  if (input.operation.kind === "create-directory") return true;
  return input.operation.kind === "create-file" && (
    typeof input.operation.content === "string" || input.operation.content instanceof Uint8Array
  );
}

function isSameOrDescendant(candidate, root) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function safeTargetPath(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function failure(targetPath, reason) {
  return { ok: false, targetPath, reason };
}

function filesystemInspectionReason(error) {
  if (isEnotdir(error)) return "candidate-not-regular-file";
  if (isMissing(error)) return "candidate-unreadable";
  return "candidate-unreadable";
}

function filesystemFailureReason(error) {
  if (isEnotdir(error)) return "candidate-not-regular-file";
  if (isMissing(error)) return "candidate-unreadable";
  return "candidate-path-invalid";
}

function isMissing(error) {
  return error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

function isEnotdir(error) {
  return error !== null && typeof error === "object" && "code" in error && error.code === "ENOTDIR";
}

function parseCli(argv) {
  const [operation, ...rest] = argv;
  const expectedFlags = operation === "create-file"
    ? ["--project-root", "--planning-root", "--target", "--source"]
    : operation === "create-directory"
      ? ["--project-root", "--planning-root", "--target"]
      : null;
  if (expectedFlags === null || rest.length !== expectedFlags.length * 2) {
    return { ok: false, targetPath: extractTarget(rest), reason: "invalid-cli-arguments" };
  }
  const values = {};
  for (let index = 0; index < expectedFlags.length; index += 1) {
    const flag = rest[index * 2];
    const value = rest[index * 2 + 1];
    if (flag !== expectedFlags[index] || typeof value !== "string" || value.length === 0) {
      return { ok: false, targetPath: extractTarget(rest), reason: "invalid-cli-arguments" };
    }
    values[flag.slice(2)] = value;
  }
  return { ok: true, operation, values };
}

function extractTarget(argv) {
  const index = argv.indexOf("--target");
  return index >= 0 && typeof argv[index + 1] === "string" ? argv[index + 1] : null;
}

async function runCli(argv) {
  const parsed = parseCli(argv);
  if (!parsed.ok) return parsed;
  if (parsed.operation === "create-file") {
    let content;
    try {
      const sourceStat = await stat(parsed.values.source);
      if (!sourceStat.isFile()) return failure(parsed.values.target, "source-not-regular-file");
      await access(parsed.values.source, fsConstants.R_OK);
      content = await readFile(parsed.values.source);
    } catch {
      return failure(parsed.values.target, "source-unreadable");
    }
    return executeUxArtifactOperation({
      projectRoot: parsed.values["project-root"],
      planningRoot: parsed.values["planning-root"],
      targetPath: parsed.values.target,
      operation: { kind: "create-file", content },
    });
  }
  return executeUxArtifactOperation({
    projectRoot: parsed.values["project-root"],
    planningRoot: parsed.values["planning-root"],
    targetPath: parsed.values.target,
    operation: { kind: "create-directory" },
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
