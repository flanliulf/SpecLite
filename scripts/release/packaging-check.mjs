#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
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
const stablePackFiles = packResult.files.filter((entry) => entry.path !== "dist/packaging-manifest.json");
const files = Array.from(
  new Set([...stablePackFiles.map((entry) => entry.path), "dist/packaging-manifest.json"]),
)
  .sort((left, right) => left.localeCompare(right));
const fileSet = new Set(files);
const packagedDocumentationExamples = files
  .filter((file) => /^assets\/source\/speclite\/docs\/examples\/[^/]+\.md$/.test(file))
  .map((file) => ({
    path: file,
    classification: "packaged-documentation-example",
    isReleaseGateFixture: false,
  }));
const assertions = [
  {
    id: "package-json-bin-mapping",
    passed: packageJson.bin?.speclite === "./dist/bin/speclite.js" && fileSet.has("package.json"),
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
    passed: packagedDocumentationExamples.every(
      (entry) => entry.classification === "packaged-documentation-example" && entry.isReleaseGateFixture === false,
    ),
  },
];
const failed = assertions.filter((assertion) => !assertion.passed);
const manifest = {
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

mkdirSync(path.join(projectRoot, "dist"), { recursive: true });
writeFileSync(
  path.join(projectRoot, "dist/packaging-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

if (failed.length > 0) {
  throw new Error(`Packaging acceptance failed: ${failed.map((assertion) => assertion.id).join(", ")}`);
}

console.log("Packaging acceptance passed: dist/packaging-manifest.json");

function hashInventory(files) {
  const hash = createHash("sha256");
  for (const file of files.slice().sort((left, right) => left.path.localeCompare(right.path))) {
    hash.update(`${file.path}\n${file.size}\n${file.mode ?? ""}\n`, "utf8");
  }
  return `sha256:${hash.digest("hex")}`;
}
