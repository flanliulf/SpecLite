import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = "/Users/fancyliu/Repos/SpecLite";
const crDir = "_bmad-output/implementation-artifacts/code-reviews/11-9-code-review";
const roundDir = `${crDir}/.tmp/evidence-v2-round-5`;
const priorRoundDir = `${crDir}/.tmp/evidence-v2-round-4`;
const priorManifestPath = join(projectRoot, priorRoundDir, "scope-manifest.json");
const baseSha = "ff7528d3f9ec34072bb669ee79f7569345c23d47";
const headSha = "ff7528d3f9ec34072bb669ee79f7569345c23d47";
const summaryPath = `${crDir}/11-9-code-review-summary-20260908-evidence-v2-round-5.md`;
const r5Paths = [
  `${roundDir}/anchor-evidence.md`,
  `${roundDir}/b1-blind-hunter.md`,
  `${roundDir}/b2-edge-case-hunter.json`,
  `${roundDir}/b3-acceptance-auditor.md`,
  `${roundDir}/classified-findings.json`,
  `${roundDir}/finding-seeds.json`,
  `${roundDir}/history-registry.json`,
  `${roundDir}/materialize-review-input.mjs`,
  `${roundDir}/review-input.diff`,
  `${roundDir}/scope-manifest.json`,
  `${roundDir}/spec-content.md`,
  summaryPath,
].sort(bytewise);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: options.encoding ?? "utf8",
    maxBuffer: 100 * 1024 * 1024,
  });
  if (result.status !== options.expectedStatus || result.stderr?.length) {
    throw new Error(`${command} ${args.join(" ")} failed: status=${result.status}; stderr=${result.stderr}`);
  }
  return result.stdout;
}

function bytewise(a, b) {
  return Buffer.from(a).compare(Buffer.from(b));
}

function normalizeText(text) {
  return text.normalize("NFC").replace(/\r\n?/g, "\n").trimEnd();
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function canonicalHashText(text) {
  return `sha256:${sha256(Buffer.from(normalizeText(text), "utf8"))}`;
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort((a, b) => a.codePointAt(0) - b.codePointAt(0) || a.localeCompare(b))
      .map((key) => [key, sortKeys(value[key])]),
  );
}

function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}

async function writeRelative(path, content) {
  const absolute = join(projectRoot, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

const priorManifest = JSON.parse(await readFile(priorManifestPath, "utf8"));
const declaredFiles = [...priorManifest.declaredFiles].sort(bytewise);
if (declaredFiles.length !== 41 || new Set(declaredFiles).size !== 41) {
  throw new Error(`declared files must be unique 41, got ${declaredFiles.length}`);
}
if (run("git", ["rev-parse", "HEAD"], { expectedStatus: 0 }).trim() !== headSha) {
  throw new Error("HEAD drifted from the user-specified baseline");
}

await writeRelative(`${roundDir}/b1-blind-hunter.md`, "PENDING: fresh Blind Hunter 尚未写入。\n");
await writeRelative(`${roundDir}/b2-edge-case-hunter.json`, "{\"status\":\"PENDING\"}\n");
await writeRelative(`${roundDir}/b3-acceptance-auditor.md`, "PENDING: fresh Acceptance Auditor 尚未写入。\n");
await writeRelative(`${roundDir}/classified-findings.json`, "[]\n");
await writeRelative(`${roundDir}/finding-seeds.json`, "[]\n");
await writeRelative(`${roundDir}/anchor-evidence.md`, "PENDING: current scope freeze 尚未写入。\n");
await writeRelative(`${roundDir}/scope-manifest.json`, "{\"status\":\"PENDING\"}\n");
await writeRelative(summaryPath, "<!-- PENDING: fresh 3/3 quorum 前不可消费。 -->\n");

let specContent = await readFile(join(projectRoot, priorRoundDir, "spec-content.md"), "utf8");
specContent = specContent
  .replace("Review series / round: `evidence-v2 / 4`", "Review series / round: `evidence-v2 / 5`")
  .replace(
    "- Round 3 F1（selected-series `@round` malformed intent）与 F2（bounded inline-list 非法 double-quoted escape）已完成两文件 authorized fix，本轮须 fresh 复核，不能预设通过。",
    "- Round 3 F1（selected-series `@round` malformed intent）与 F2（bounded inline-list 非法 double-quoted escape）已由 Round 4 fresh review/evaluation 确认 resolved；无分隔 series+round 候选因合法 other-series 反证 dismissed，不得复用 R3 fingerprint。\n- Round 4 F1（terminal-state preflight/matcher totality）已完成 resolver/test 两文件 authorized fix；本轮须 fresh 核验合法内部 pipe scalar 与首位 block indicator/comment/duplicate/missing/substring/non-terminal 边界，不能预设 resolved。",
  );
await writeRelative(`${roundDir}/spec-content.md`, normalizeText(specContent) + "\n");

const history = JSON.parse(await readFile(join(projectRoot, priorRoundDir, "history-registry.json"), "utf8"));
history.currentRound = 5;
history.round3.findings = history.round3.findings.map((finding) =>
  [
    "sha256:246de7037cff9f0b2f51929313785794e67b5066e9c99ba1cd27de5c559efdfd",
    "sha256:c51fd1f311e9dbfd75b522ce77000dbbd2731670a1160c0634c492ccd7f3051e",
  ].includes(finding.fingerprint)
    ? { ...finding, disposition: "resolved" }
    : finding,
);
history.round4 = {
  reviewSource: "11-9-code-review-summary-20260908-evidence-v2-round-4.md",
  reviewSourceHash: "sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634",
  evaluationSource: "11-9-code-review-evaluation-20260908-evidence-v2-round-4.md",
  evaluationSourceHash: "sha256:6227dfe46266657df0000b822976a402bfb5a937bb510f5fc090811d97512189",
  fixRecordStatus: "completed",
  sourceMutationAt: "2026-09-08T03:15:11Z",
  findings: [
    { fingerprint: "sha256:13ca7c2e80fa880328288c79731adb48aa04f1ffdacdb94ebb93e7886dccafaa", disposition: "accepted-p1-fixed-pending-fresh-review", category: "totality" },
    { fingerprint: "sha256:a71d3d571a9ff71b09d6f36a00e65148d2ceb2e57c1b1603ecd4cd93ecd31244", disposition: "deferred", category: "freshness", urgency: "T2" },
    { fingerprint: "sha256:cc04b874c8df8002fee766dfe795e7b68aed5e67658359dffd159c66831b6483", disposition: "deferred", category: "lifecycle", urgency: "T2" },
    { fingerprint: "sha256:f113580e33ce900c8f1516e7cd540b7bac96b7ceafdc5907d243c0ecbaebf1e4", disposition: "dismissed", category: "authority" },
  ],
};
history.constraints = [
  "R1 six findings, R2 F6, and R3 exact @round/illegal-escape findings are resolved by completed fix records plus fresh evaluation evidence.",
  "R4 terminal-state preflight/matcher totality requires fresh verification; completed fixRecord is evidence, not a pre-decided Reviewer verdict.",
  "R2 time precision and superseded ordinal retain original fingerprints and T2 deferred status.",
  "The R4 no-delimiter series+round candidate was dismissed because a legal other-series interpretation exists; it must not reuse the R3 fingerprint.",
  "Whole-document YAML validity, full YAML key grammar, raw-byte vs canonical hash, live backlog authentication, evaluator closure replay, and concurrent TOCTOU remain evaluator-dismissed absent a new explicit owner obligation and concrete failure scenario.",
  "Round 4 was a one-time stop-loss exception; maxRounds=5 remains active and Reviewer does not pre-decide the Evaluator outcome.",
];
await writeRelative(`${roundDir}/history-registry.json`, JSON.stringify(history, null, 2) + "\n");

const trackedDiff = run(
  "git",
  ["diff", "--binary", "--no-ext-diff", "--no-renames", baseSha, "--", ...declaredFiles],
  { expectedStatus: 0 },
);
const untracked = new Set(
  run("git", ["ls-files", "--others", "--exclude-standard", "-z"], { expectedStatus: 0 })
    .split("\0")
    .filter(Boolean),
);
let reviewInput = trackedDiff;
for (const path of declaredFiles.filter((path) => untracked.has(path))) {
  reviewInput += run(
    "git",
    ["diff", "--no-index", "--binary", "--no-ext-diff", "--", "/dev/null", path],
    { expectedStatus: 1 },
  );
}
await writeRelative(`${roundDir}/review-input.diff`, reviewInput);

const diffHeaders = [...reviewInput.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)].map((match) => match[2]).sort(bytewise);
if (diffHeaders.length !== 41 || JSON.stringify(diffHeaders) !== JSON.stringify(declaredFiles)) {
  throw new Error(`review input headers mismatch: ${diffHeaders.length}/41`);
}

const reconstructionRoot = await mkdtemp(join(tmpdir(), "speclite-cr-r5-reconstruct-"));
try {
  for (const path of declaredFiles) {
    const existsAtBase = spawnSync("git", ["cat-file", "-e", `${baseSha}:${path}`], { cwd: projectRoot }).status === 0;
    if (!existsAtBase) continue;
    const bytes = run("git", ["show", `${baseSha}:${path}`], { expectedStatus: 0, encoding: null });
    const target = join(reconstructionRoot, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  const patchAbsolute = join(projectRoot, roundDir, "review-input.diff");
  run("git", ["apply", "--unsafe-paths", "--binary", patchAbsolute], { cwd: reconstructionRoot, expectedStatus: 0 });
  for (const path of declaredFiles) {
    const reconstructed = await readFile(join(reconstructionRoot, path));
    const current = await readFile(join(projectRoot, path));
    if (!reconstructed.equals(current)) throw new Error(`reconstructed bytes drift: ${path}`);
  }
} finally {
  await rm(reconstructionRoot, { recursive: true, force: true });
}

const priorReviewInputPath = join(projectRoot, priorRoundDir, "review-input.diff");
const priorReconstructionRoot = await mkdtemp(join(tmpdir(), "speclite-cr-r4-manifest-"));
let priorPackaging;
try {
  const target = join(priorReconstructionRoot, "release/packaging-manifest.json");
  await mkdir(dirname(target), { recursive: true });
  const baseBytes = run("git", ["show", `${baseSha}:release/packaging-manifest.json`], { expectedStatus: 0, encoding: null });
  await writeFile(target, baseBytes);
  run(
    "git",
    ["apply", "--unsafe-paths", "--binary", "--include=release/packaging-manifest.json", priorReviewInputPath],
    { cwd: priorReconstructionRoot, expectedStatus: 0 },
  );
  const priorText = await readFile(target, "utf8");
  if (canonicalHashText(priorText) !== "sha256:f6304cb3c36f227100460c5099eb569c80fc44c824a536467bb761340b184f15") {
    throw new Error("R4 reconstructed packaging manifest canonical hash mismatch");
  }
  priorPackaging = JSON.parse(priorText);
} finally {
  await rm(priorReconstructionRoot, { recursive: true, force: true });
}
const currentPackaging = JSON.parse(await readFile(join(projectRoot, "release/packaging-manifest.json"), "utf8"));
const externalManifestPaths = [
  "assets/source/speclite/support-skills/speclite-skill-lint/references/rule-registry.json",
  "assets/source/speclite/support-skills/speclite-skill-lint/scripts/list_rules.py",
  "assets/source/speclite/support-skills/speclite-skill-lint/scripts/test_skill_tools.py",
];
const strippedPackaging = structuredClone(currentPackaging);
strippedPackaging.packageHash = priorPackaging.packageHash;
for (const key of ["files", "includedRuntimeAssets"]) {
  strippedPackaging[key] = strippedPackaging[key].filter((path) => !externalManifestPaths.includes(path));
}
if (JSON.stringify(strippedPackaging) !== JSON.stringify(priorPackaging)) {
  throw new Error("packaging manifest drift exceeds the authorized external three-path/packageHash delta");
}
for (const key of ["files", "includedRuntimeAssets"]) {
  for (const path of externalManifestPaths) {
    if (currentPackaging[key].filter((item) => item === path).length !== 1) {
      throw new Error(`packaging manifest ${key} does not contain exactly one ${path}`);
    }
  }
}

const currentR4Review = await readFile(join(projectRoot, crDir, "11-9-code-review-summary-20260908-evidence-v2-round-4.md"), "utf8");
const currentR4Evaluation = await readFile(join(projectRoot, crDir, "11-9-code-review-evaluation-20260908-evidence-v2-round-4.md"), "utf8");
if (canonicalHashText(currentR4Review) !== "sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634") {
  throw new Error("R4 current review canonical hash mismatch");
}
if (canonicalHashText(currentR4Evaluation) !== "sha256:6227dfe46266657df0000b822976a402bfb5a937bb510f5fc090811d97512189") {
  throw new Error("R4 current evaluation canonical hash mismatch");
}

const trackedActual = run("git", ["diff", "--name-only", "--no-renames", baseSha, "--"], { expectedStatus: 0 })
  .split("\n")
  .filter(Boolean);
const untrackedActual = run("git", ["ls-files", "--others", "--exclude-standard"], { expectedStatus: 0 })
  .split("\n")
  .filter(Boolean);
const actualChangedFiles = [...new Set([...trackedActual, ...untrackedActual])].sort(bytewise);
const declaredSet = new Set(declaredFiles);
const excludedFiles = actualChangedFiles.filter((path) => !declaredSet.has(path));
const oldAuthorized = new Set(priorManifest.excludedFiles);
const exactNewAuthorized = new Set([
  `${crDir}/11-9-code-review-evaluation-20260908-evidence-v2-round-4-superseded-1.md`,
  `${crDir}/11-9-code-review-evaluation-20260908-evidence-v2-round-4.md`,
  ...r5Paths,
]);
const unexpectedExcluded = excludedFiles.filter(
  (path) =>
    !oldAuthorized.has(path) &&
    !exactNewAuthorized.has(path) &&
    !path.startsWith("assets/source/speclite/support-skills/speclite-skill-lint/") &&
    !path.startsWith("assets/source/speclite/support-skills/speclite-skill-creator/"),
);
if (unexpectedExcluded.length) {
  throw new Error(`unexpected scope paths: ${JSON.stringify(unexpectedExcluded)}`);
}
const missingR5 = r5Paths.filter((path) => !actualChangedFiles.includes(path));
if (missingR5.length) throw new Error(`non-materialized R5 paths: ${JSON.stringify(missingR5)}`);
const scopeExceptions = actualChangedFiles.filter((path) => !declaredSet.has(path) && !excludedFiles.includes(path));

const contentDigests = [];
for (const path of declaredFiles) {
  const bytes = await readFile(join(projectRoot, path));
  const text = bytes.toString("utf8");
  contentDigests.push({ path, contentHash: canonicalHashText(text) });
}
const scopeHashInput = {
  actualChangedFiles,
  baseSha,
  contentDigests,
  declaredFiles,
  excludedFiles,
  headSha,
  scopeExceptions,
};
const scopeHash = `sha256:${sha256(Buffer.from(canonicalJson(scopeHashInput), "utf8"))}`;

let latestMutationMs = 0;
for (const path of declaredFiles) {
  const fileStat = await stat(join(projectRoot, path));
  latestMutationMs = Math.max(latestMutationMs, fileStat.mtimeMs);
}
const sourceMutationAt = new Date(latestMutationMs).toISOString();
const scan = (args) =>
  new Set(
    run("git", args, { expectedStatus: 0 })
      .split("\n")
      .filter(Boolean),
  ).size;
const rawReviewInputSha256 = sha256(Buffer.from(reviewInput, "utf8"));
const resolverBytes = await readFile(join(projectRoot, "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs"));
const focusedTestBytes = await readFile(join(projectRoot, "test/code-review-contract.test.ts"));
const packagingText = await readFile(join(projectRoot, "release/packaging-manifest.json"), "utf8");
const stagedBinaryDiff = run("git", ["diff", "--cached", "--binary", "--no-ext-diff"], { expectedStatus: 0, encoding: null });

const anchorEvidence = `# Round 5 Anchor Evidence（第五轮锚点证据）

- frozen diff raw SHA-256：\`${rawReviewInputSha256}\`；\`41/41\` declared headers，重建后的 41 个文件逐字节等于 current workspace；路径：\`.tmp/evidence-v2-round-5/review-input.diff\`。
- runtime config：本轮独立执行 \`node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite\`，exit 0；directory resolver 未重跑且禁止下游重跑。
- frozen directory evidence：\`ok=true\`、\`issue=null\`、\`crDir=canonicalCrDir=${crDir}\`、\`compatibilityMode=canonical\`、\`legacyArtifactPaths=[]\`。
- base/head：\`${baseSha}\` / \`${headSha}\`；当前 physical actual=${actualChangedFiles.length}、declared=41、excluded=${excludedFiles.length}、scopeExceptions=0。
- scopeHash：\`${scopeHash}\`；content digests 只绑定 41 个 declared 当前完整内容，excluded mutable workflow outputs 仅绑定 path，避免自引用。
- R4 current review canonical SHA-256：\`sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634\`。
- R4 current evaluation canonical SHA-256：\`sha256:6227dfe46266657df0000b822976a402bfb5a937bb510f5fc090811d97512189\`；\`fixRecord.status=completed\`、\`sourceMutationAt=2026-09-08T03:15:11Z\`。
- R4 accepted P1：\`sha256:13ca7c2e80fa880328288c79731adb48aa04f1ffdacdb94ebb93e7886dccafaa\`，本轮只作为待 fresh 核验的 terminal-state grammar totality 历史输入，不能预定 resolved。
- R4 Fixer 历史证据（非本轮执行）：resolver/test raw hashes 为 \`bead9645ba0be21d542e1b1891b88e52b81f9bdd4ae27bdcbfe30251a17db409\` / \`397b122fb52c85a4c6fc46da5a8e6f65642bd08f36c42711f6ded0212263d462\`；canonical hashes 为 \`9808caa6094dff231dec606c91fe29f40016b174fbfa2d0c75a1141ccadfc417\` / \`52625c33884f44163e97df15a7a6e4cf25cd61bb07adccf7b3b590b7a8afcbb4\`；\`108 passed / 4 todo\` 是 Fixer 证据，不冒称本轮执行。
- 本轮 fresh focused verification：\`npx --no-install vitest run test/code-review-contract.test.ts --reporter=dot\` PASS，\`108 passed / 4 todo / 0 failed\`；\`node --check\` 与 root \`git diff --check\` PASS。
- 当前 resolver raw/canonical SHA-256：\`${sha256(resolverBytes)}\` / \`${canonicalHashText(resolverBytes.toString("utf8")).slice(7)}\`；focused test raw/canonical SHA-256：\`${sha256(focusedTestBytes)}\` / \`${canonicalHashText(focusedTestBytes.toString("utf8")).slice(7)}\`。
- shared \`release/packaging-manifest.json\` 当前 raw/canonical SHA-256：\`${sha256(Buffer.from(packagingText, "utf8"))}\` / \`${canonicalHashText(packagingText).slice(7)}\`；相对 R4 canonical \`f6304cb3c36f227100460c5099eb569c80fc44c824a536467bb761340b184f15\` 仅 \`files\` / \`includedRuntimeAssets\` 各新增 external skill-lint 的 \`rule-registry.json\`、\`list_rules.py\`、\`test_skill_tools.py\` 并更新 \`packageHash\`，完整字节继续纳入 declared hash，但不作为 11.9 实现成果或提交授权。
- External Package Exclusion：\`speclite-skill-lint/\` 与 \`speclite-skill-creator/\` 两包及同包增量完整进入 actual/excluded；三层不得修改、回滚或把它们计作 11.9 成果。
- Completion gate：现存 gate 是历史 stale evidence，不是本轮 fresh completion gate；Auditor 必须完成 12/12 AC coverage。
- Round 4 是单次 stop-loss 例外；\`maxRounds=5\` 仍有效，Reviewer 不预设 Evaluator 裁决。三层禁止 tests/build/packaging/full-suite/writer，只写各自输出。
`;
await writeRelative(`${roundDir}/anchor-evidence.md`, anchorEvidence);

const generatedAt = new Date().toISOString();
const manifest = {
  schemaVersion: "speclite.cr-scope-manifest.v2",
  status: "FINALIZED",
  generatedAt,
  storyId: "11-9",
  storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id",
  reviewSeries: "evidence-v2",
  round: 5,
  baseSha,
  headSha,
  inputMode: "diff",
  sourceMutationAt,
  scopeHash,
  contentDigestPolicy: "Only declared implementation file contents are hashed. Excluded mutable workflow outputs bind by path only under user-approved policy, avoiding self-referential report/manifest hashes.",
  hashCanonicalization: "NFC; LF; trimEnd; byte-wise sorted POSIX lists; code-point-key-sorted compact JSON; UTF-8 SHA-256",
  counts: { declared: declaredFiles.length, actual: actualChangedFiles.length, excluded: excludedFiles.length, scopeExceptions: scopeExceptions.length },
  actualScanLayers: {
    committed: 0,
    staged: scan(["diff", "--cached", "--name-only", "--no-renames"]),
    unstaged: scan(["diff", "--name-only", "--no-renames"]),
    untracked: untrackedActual.length,
    physicalActual: actualChangedFiles.length,
  },
  declaredFiles,
  actualChangedFiles,
  excludedFiles,
  scopeExceptions,
  contentDigests,
  materializedPaths: r5Paths,
  pendingPlannedPaths: [],
  authorizedNewPaths: {
    round4WorkflowOutputs: [
      `${crDir}/11-9-code-review-evaluation-20260908-evidence-v2-round-4-superseded-1.md`,
      `${crDir}/11-9-code-review-evaluation-20260908-evidence-v2-round-4.md`,
    ],
    externalPackagePrefixes: [
      "assets/source/speclite/support-skills/speclite-skill-creator/",
      "assets/source/speclite/support-skills/speclite-skill-lint/",
    ],
    round5WorkflowOutputs: r5Paths,
  },
  sharedDeclaredExternalDelta: {
    path: "release/packaging-manifest.json",
    r4CanonicalHash: "sha256:f6304cb3c36f227100460c5099eb569c80fc44c824a536467bb761340b184f15",
    currentCanonicalHash: canonicalHashText(packagingText),
    exactAddedPathsPerArray: externalManifestPaths,
    changedArrays: ["files", "includedRuntimeAssets"],
    packageHashChanged: priorPackaging.packageHash !== currentPackaging.packageHash,
    otherDifference: false,
    storyOutcomeAttribution: false,
    commitAuthorization: false,
  },
  resolverEvidence: {
    ok: true,
    storyId: "11-9",
    reviewSeries: "evidence-v2",
    canonicalCrDir: crDir,
    crDir,
    compatibilityMode: "canonical",
    legacyArtifactPaths: [],
    issue: null,
  },
  trackerBindings: {
    story: { required: true, path: "_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md", key: "Status", expectedTerminalState: "done" },
    sprint: { required: true, path: "_bmad-output/implementation-artifacts/sprint-status.yaml", key: "11-9-normalize-code-review-artifact-directories-by-story-id", expectedTerminalState: "done" },
    workflow: { required: false },
  },
  layerEvidence: {
    blind: { status: "PENDING", path: `${roundDir}/b1-blind-hunter.md` },
    edge: { status: "PENDING", path: `${roundDir}/b2-edge-case-hunter.json` },
    auditor: { status: "PENDING", path: `${roundDir}/b3-acceptance-auditor.md`, acCoverageComplete: false },
  },
  invalidAttempts: [
    {
      attempt: 1,
      status: "HALTED_BEFORE_LAYER_START",
      reason: "anchor-evidence.md and scope-manifest.json were not yet physically materialized and therefore could not be counted as actual/excluded",
      resolution: "materialize both placeholder paths before the actual scan, then rerun the complete freeze",
    },
  ],
  verification: {
    focusedVitest: "PASS: 108 passed / 4 todo / 0 failed",
    nodeCheck: "PASS",
    rootDiffCheck: "PASS",
    reviewInputRawSha256: rawReviewInputSha256,
    reviewInputHeaders: diffHeaders.length,
    reconstructedCurrentBytes: "PASS: 41/41",
    r4ReviewCanonicalSha256: "sha256:89fcdab79e86493a2d9cbf60ae992c45865824ed5f5035959d9b434dea28b634",
    r4EvaluationCanonicalSha256: "sha256:6227dfe46266657df0000b822976a402bfb5a937bb510f5fc090811d97512189",
    resolverRawSha256: sha256(resolverBytes),
    resolverCanonicalSha256: canonicalHashText(resolverBytes.toString("utf8")),
    focusedTestRawSha256: sha256(focusedTestBytes),
    focusedTestCanonicalSha256: canonicalHashText(focusedTestBytes.toString("utf8")),
    packagingManifestRawSha256: sha256(Buffer.from(packagingText, "utf8")),
    packagingManifestCanonicalSha256: canonicalHashText(packagingText),
    packagingManifestAuthorizedDeltaVerified: true,
    stagedBinaryDiffRawSha256: sha256(stagedBinaryDiff),
  },
  authorizationSource: `${crDir}/goal-execute-records/evidence-v2-authorization.md`,
};
await writeRelative(`${roundDir}/scope-manifest.json`, JSON.stringify(manifest, null, 2) + "\n");

process.stdout.write(
  JSON.stringify({
    ok: true,
    declared: declaredFiles.length,
    actual: actualChangedFiles.length,
    excluded: excludedFiles.length,
    scopeExceptions: scopeExceptions.length,
    scopeHash,
    sourceMutationAt,
    reviewInputRawSha256: rawReviewInputSha256,
    reviewInputHeaders: diffHeaders.length,
    reconstructedCurrentBytes: "41/41",
    r5MaterializedPaths: r5Paths.length,
  }) + "\n",
);
