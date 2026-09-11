import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const priorManifestPath = new URL("../evidence-v2-round-3/scope-manifest.json", import.meta.url);
const outputPath = new URL("./review-input.diff", import.meta.url);
const priorManifest = JSON.parse(await readFile(priorManifestPath, "utf8"));
const trackedResult = spawnSync(
  "git",
  [
    "diff",
    "--binary",
    "--no-ext-diff",
    "ff7528d3f9ec34072bb669ee79f7569345c23d47",
    "--",
    ...priorManifest.declaredFiles,
  ],
  { cwd: "/Users/fancyliu/Repos/SpecLite", encoding: "utf8", maxBuffer: 100 * 1024 * 1024 },
);
if (trackedResult.status !== 0 || trackedResult.stderr !== "") {
  throw new Error(`git diff failed: status=${trackedResult.status}; stderr=${trackedResult.stderr}`);
}
const untracked = new Set(
  spawnSync("git", ["ls-files", "--others", "--exclude-standard", "-z"], {
    cwd: "/Users/fancyliu/Repos/SpecLite",
    encoding: "utf8",
  }).stdout.split("\0").filter(Boolean),
);
const declaredUntracked = priorManifest.declaredFiles.filter((path) => untracked.has(path));
let reviewInput = trackedResult.stdout;
for (const path of declaredUntracked) {
  const untrackedResult = spawnSync(
    "git",
    ["diff", "--no-index", "--binary", "--no-ext-diff", "--", "/dev/null", path],
    { cwd: "/Users/fancyliu/Repos/SpecLite", encoding: "utf8", maxBuffer: 100 * 1024 * 1024 },
  );
  if (untrackedResult.status !== 1 || untrackedResult.stderr !== "") {
    throw new Error(`untracked diff failed for ${path}: status=${untrackedResult.status}; stderr=${untrackedResult.stderr}`);
  }
  reviewInput += untrackedResult.stdout;
}
await writeFile(outputPath, reviewInput, "utf8");
