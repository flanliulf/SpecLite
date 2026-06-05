#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REQUIRED_BUILD_OUTPUTS = ["dist/bin/speclite.js", "dist/bin/speclite.d.ts"];
const REQUIRED_RUNTIME_ASSETS = [
  "assets/source/speclite/scripts/resolve_config.py",
  "assets/source/speclite/core-skills/module.yaml",
  "assets/source/speclite/sdlc-skills/module.yaml",
  "assets/source/speclite/docs/examples/fixture-derived-examples.md",
];
const BUILD_INPUT_ROOTS = ["src"];
const BUILD_INPUT_FILES = ["package.json", "tsconfig.json", "tsup.config.ts"];
const PACKAGED_DOCUMENTATION_EXAMPLE_PATH = /^assets\/source\/speclite\/docs\/examples\/[^/]+\.md$/;

export function collectPackagingPrerequisiteIssues(projectRoot) {
  const issues = [];
  for (const relativePath of REQUIRED_BUILD_OUTPUTS) {
    if (!existsSync(path.join(projectRoot, relativePath))) {
      issues.push(`missing build output: ${relativePath}`);
    }
  }
  for (const relativePath of REQUIRED_RUNTIME_ASSETS) {
    if (!existsSync(path.join(projectRoot, relativePath))) {
      issues.push(`missing runtime asset: ${relativePath}`);
    }
  }

  const newestBuildInput = findNewestBuildInput(projectRoot);
  if (newestBuildInput !== undefined) {
    for (const relativePath of REQUIRED_BUILD_OUTPUTS) {
      const absolutePath = path.join(projectRoot, relativePath);
      if (existsSync(absolutePath) && statSync(absolutePath).mtimeMs < newestBuildInput.mtimeMs) {
        issues.push(`stale build output: ${relativePath} older than ${newestBuildInput.relativePath}`);
      }
    }
  }

  return issues;
}

export function validatePackagedDocumentationExamples(entries, packageFiles) {
  if (entries.length === 0) {
    return {
      passed: false,
      reason: "packagedDocumentationExamples must not be empty",
    };
  }

  for (const entry of entries) {
    if (!PACKAGED_DOCUMENTATION_EXAMPLE_PATH.test(entry.path)) {
      return {
        passed: false,
        reason: `packaged documentation example path is not allowed: ${entry.path}`,
      };
    }
    if (!packageFiles.has(entry.path)) {
      return {
        passed: false,
        reason: `packaged documentation example is not in package inventory: ${entry.path}`,
      };
    }
    if (entry.classification !== "packaged-documentation-example" || entry.isReleaseGateFixture !== false) {
      return {
        passed: false,
        reason: `packaged documentation example has invalid classification: ${entry.path}`,
      };
    }
  }

  return { passed: true };
}

export function createPackagingManifest(packResult, packageJson) {
  const stablePackFiles = packResult.files.filter((entry) => entry.path !== "dist/packaging-manifest.json");
  const files = Array.from(
    new Set([...stablePackFiles.map((entry) => entry.path), "dist/packaging-manifest.json"]),
  )
    .sort((left, right) => left.localeCompare(right));
  const fileSet = new Set(files);
  const packagedDocumentationExamples = files
    .filter((file) => PACKAGED_DOCUMENTATION_EXAMPLE_PATH.test(file))
    .map((file) => ({
      path: file,
      classification: "packaged-documentation-example",
      isReleaseGateFixture: false,
    }));
  const docsExampleValidation = validatePackagedDocumentationExamples(packagedDocumentationExamples, fileSet);
  const assertions = [
    {
      id: "package-json-bin-mapping",
      passed: packageJson.bin?.speclite === "dist/bin/speclite.js" && fileSet.has("package.json"),
    },
    {
      id: "scoped-public-package-metadata",
      passed:
        packageJson.name === "@fancyliu/speclite" &&
        packageJson.version !== "0.0.0" &&
        packageJson.license === "MIT" &&
        packageJson.publishConfig?.registry === "https://registry.npmjs.org/" &&
        packageJson.publishConfig?.access === "public",
    },
    {
      id: "cli-bin-included",
      passed: fileSet.has("dist/bin/speclite.js"),
    },
    {
      id: "bundled-source-included",
      passed: files.some((file) => file.startsWith("assets/source/speclite/")),
    },
    {
      id: "runtime-schemas-included",
      passed: fileSet.has("dist/bin/speclite.js") && fileSet.has("dist/bin/speclite.d.ts"),
    },
    {
      id: "runtime-assets-included",
      passed:
        fileSet.has("dist/bin/speclite.js") &&
        files.some((file) => file === "assets/source/speclite/scripts/resolve_config.py") &&
        files.some((file) => file === "assets/source/speclite/core-skills/module.yaml") &&
        files.some((file) => file === "assets/source/speclite/sdlc-skills/module.yaml") &&
        files.some((file) => file.endsWith("/SKILL.md")),
    },
    {
      id: "release-fixtures-excluded",
      passed: !files.some((file) => file.startsWith("test/fixtures/") || file.startsWith("fixtures/")),
    },
    {
      id: "packaging-manifest-included-in-package-inventory",
      passed: fileSet.has("dist/packaging-manifest.json"),
    },
    {
      id: "packaged-documentation-examples-classified",
      passed: docsExampleValidation.passed,
      ...(docsExampleValidation.reason === undefined ? {} : { reason: docsExampleValidation.reason }),
    },
  ];

  return {
    schemaVersion: "speclite.packaging-manifest.v1",
    generatedAtPolicy: "normalized-self-entry-excluded-from-package-hash",
    source: "npm-pack-dry-run-json",
    packageJson: {
      name: packageJson.name,
      version: packageJson.version,
      bin: packageJson.bin,
      engines: packageJson.engines,
      files: packageJson.files,
    },
    packageHash: hashInventory(stablePackFiles),
    files,
    includedRuntimeAssets: files.filter(
      (file) =>
        file.startsWith("dist/") ||
        file.startsWith("assets/source/speclite/") ||
        file === "package.json",
    ),
    excludedFixtureDirectories: ["test/fixtures/", "fixtures/"],
    packagedDocumentationExamples,
    assertions,
  };
}

export function runPackagingCheck(projectRoot = process.cwd()) {
  const prerequisiteIssues = collectPackagingPrerequisiteIssues(projectRoot);
  if (prerequisiteIssues.length > 0) {
    throw new Error(
      `Packaging prerequisite failed: ${prerequisiteIssues.join("; ")}. Run npm run build before npm run release:packaging-check.`,
    );
  }

  const rawPack = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const [packResult] = JSON.parse(rawPack);
  if (packResult === undefined || !Array.isArray(packResult.files)) {
    throw new Error("npm pack --dry-run --json did not return a package inventory.");
  }

  const packageJson = JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  const manifest = createPackagingManifest(packResult, packageJson);
  const failed = manifest.assertions.filter((assertion) => !assertion.passed);

  mkdirSync(path.join(projectRoot, "dist"), { recursive: true });
  writeFileSync(
    path.join(projectRoot, "dist/packaging-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  if (failed.length > 0) {
    throw new Error(`Packaging acceptance failed: ${failed.map((assertion) => assertion.id).join(", ")}`);
  }

  return manifest;
}

if (isDirectRun()) {
  try {
    runPackagingCheck();
    console.log("Packaging acceptance passed: dist/packaging-manifest.json");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function findNewestBuildInput(projectRoot) {
  const candidates = [];
  for (const relativePath of BUILD_INPUT_FILES) {
    const absolutePath = path.join(projectRoot, relativePath);
    if (existsSync(absolutePath)) candidates.push({ relativePath, mtimeMs: statSync(absolutePath).mtimeMs });
  }
  for (const root of BUILD_INPUT_ROOTS) {
    const absoluteRoot = path.join(projectRoot, root);
    if (existsSync(absoluteRoot)) collectBuildInputs(projectRoot, root, candidates);
  }

  return candidates.sort((left, right) => right.mtimeMs - left.mtimeMs)[0];
}

function collectBuildInputs(projectRoot, relativeDirectory, candidates) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(projectRoot, relativePath);
    if (entry.isDirectory()) {
      collectBuildInputs(projectRoot, relativePath, candidates);
    } else if (/\.(c|m)?tsx?$/.test(entry.name)) {
      candidates.push({ relativePath, mtimeMs: statSync(absolutePath).mtimeMs });
    }
  }
}

function isDirectRun() {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
}

function hashInventory(files) {
  const hash = createHash("sha256");
  for (const file of files.slice().sort((left, right) => left.path.localeCompare(right.path))) {
    hash.update(`${file.path}\n${file.size}\n${file.mode ?? ""}\n`, "utf8");
  }
  return `sha256:${hash.digest("hex")}`;
}
