import path from "node:path";
import process from "node:process";
import type { CommandPathSummary } from "../diagnostics/command-result-schema.js";

export type PathFlavor = "native" | "posix" | "win32";

export type NormalizedTargetDirectory = {
  targetRoot: string;
  displayPath: string;
  targetProject: string;
  paths: Required<CommandPathSummary>;
};

export function normalizeTargetDirectory(input: {
  cwd?: string;
  targetDirectory?: string;
  pathFlavor?: PathFlavor;
}): NormalizedTargetDirectory {
  const flavor = input.pathFlavor ?? "native";
  const pathApi = getPathApi(flavor);
  const cwd = input.cwd ?? process.cwd();
  const rawTarget = input.targetDirectory?.trim();
  const targetRoot =
    rawTarget === undefined || rawTarget.length === 0
      ? pathApi.resolve(cwd)
      : pathApi.isAbsolute(rawTarget)
        ? pathApi.normalize(rawTarget)
        : pathApi.resolve(cwd, rawTarget);

  return {
    targetRoot,
    displayPath: getDisplayPath({ cwd, targetRoot, rawTarget, flavor }),
    targetProject: getSafeBasename(targetRoot, flavor) || "project",
    paths: createInstallPathSummary(),
  };
}

export function createInstallPathSummary(): Required<CommandPathSummary> {
  return {
    projectRoot: ".",
    specliteRoot: "_speclite",
    artifactRoot: "_speclite-output",
    manifestPath: "_speclite/_config/manifest.yaml",
  };
}

export function toProjectRelativePosixPath(input: {
  projectRoot: string;
  targetPath: string;
  pathFlavor?: PathFlavor;
}): "." | string {
  const flavor = input.pathFlavor ?? "native";
  const pathApi = getPathApi(flavor);
  const relative = pathApi.relative(input.projectRoot, input.targetPath);

  if (relative.length === 0) {
    return ".";
  }

  return toPosixPath(relative, flavor);
}

export function normalizeProjectRelativePosixPath(value: string): string {
  const normalized = path.posix.normalize(value.trim().replaceAll("\\", "/"));

  if (
    normalized.length === 0 ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(value)
  ) {
    throw new Error(`Path must stay inside the target project: ${value}`);
  }

  return normalized;
}

export function resolveProjectRelativePath(input: {
  projectRoot: string;
  relativePath: string;
}): {
  relativePath: string;
  absolutePath: string;
} {
  const relativePath = normalizeProjectRelativePosixPath(input.relativePath);
  const absolutePath = path.resolve(input.projectRoot, relativePath);
  const relativeNative = path.relative(input.projectRoot, absolutePath);

  if (
    relativeNative.length === 0 ||
    relativeNative === ".." ||
    relativeNative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeNative)
  ) {
    throw new Error(`Path must stay inside the target project: ${relativePath}`);
  }

  return {
    relativePath,
    absolutePath,
  };
}

function getDisplayPath(input: {
  cwd: string;
  targetRoot: string;
  rawTarget: string | undefined;
  flavor: PathFlavor;
}): string {
  if (input.rawTarget === undefined || input.rawTarget.length === 0) {
    return ".";
  }

  const pathApi = getPathApi(input.flavor);
  if (pathApi.isAbsolute(input.rawTarget)) {
    return getSafeBasename(input.targetRoot, input.flavor) || ".";
  }

  const relative = toPosixPath(pathApi.normalize(input.rawTarget), input.flavor);
  if (relative === "." || relative.startsWith("../") || relative === "..") {
    return getSafeBasename(input.targetRoot, input.flavor) || ".";
  }

  return relative;
}

function getSafeBasename(value: string, flavor: PathFlavor): string {
  return getPathApi(flavor).basename(value.replace(/[\\/]+$/, ""));
}

function toPosixPath(value: string, flavor: PathFlavor): string {
  const normalized = getPathApi(flavor).normalize(value);
  return normalized.split(/[\\/]+/).filter(Boolean).join("/") || ".";
}

function getPathApi(flavor: PathFlavor): typeof path {
  if (flavor === "posix") return path.posix as typeof path;
  if (flavor === "win32") return path.win32 as typeof path;
  return path;
}
