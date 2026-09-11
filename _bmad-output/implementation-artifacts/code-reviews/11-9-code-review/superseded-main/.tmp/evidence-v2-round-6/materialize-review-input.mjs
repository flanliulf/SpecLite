import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = "/Users/fancyliu/Repos/SpecLite";
const crDir = "_bmad-output/implementation-artifacts/code-reviews/11-9-code-review";
const roundDir = `${crDir}/.tmp/evidence-v2-round-6`;
const priorRoundDir = `${crDir}/.tmp/evidence-v2-round-5`;
const priorScopePath = `${priorRoundDir}/scope-rebind-2.json`;
const summaryPath = `${crDir}/11-9-code-review-summary-20260908-evidence-v2-round-6.md`;
const storyPath = "_bmad-output/implementation-artifacts/stories/11-9-normalize-code-review-artifact-directories-by-story-id.md";
const gatePath = "_bmad-output/implementation-artifacts/flow-gates/11-9-normalize-code-review-artifact-directories-by-story-id-story-completion-gate.md";
const baseSha = "ff7528d3f9ec34072bb669ee79f7569345c23d47";
const headSha = baseSha;
const sourceMutationAt = "2026-09-08T08:13:09.208Z";
const generatedAt = new Date().toISOString();
const modelUsed = "OpenAI GPT-5.6 Sol (high)";
const r6Paths = [
  `${roundDir}/anchor-evidence.md`,
  `${roundDir}/b1-blind-hunter.md`,
  `${roundDir}/b2-edge-case-hunter.json`,
  `${roundDir}/b3-acceptance-auditor.md`,
  `${roundDir}/classified-findings.json`,
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
  const allowed = options.allowedStatus ?? [0];
  if (!allowed.includes(result.status)) {
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

function scanActual() {
  const tracked = run("git", ["diff", "--name-only", "--no-renames", baseSha, "--"])
    .split("\n")
    .filter(Boolean);
  const staged = run("git", ["diff", "--cached", "--name-only", "--no-renames"])
    .split("\n")
    .filter(Boolean);
  const unstaged = run("git", ["diff", "--name-only", "--no-renames"])
    .split("\n")
    .filter(Boolean);
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean);
  return {
    actual: [...new Set([...tracked, ...staged, ...unstaged, ...untracked])].sort(bytewise),
    counts: {
      committedPlusWorkingTree: new Set(tracked).size,
      staged: new Set(staged).size,
      unstaged: new Set(unstaged).size,
      untracked: new Set(untracked).size,
    },
    untracked: new Set(untracked),
  };
}

if (process.argv.includes("--finalize")) {
  const manifestPath = `${roundDir}/scope-manifest.json`;
  const classifiedPath = `${roundDir}/classified-findings.json`;
  const layerPaths = {
    blind: `${roundDir}/b1-blind-hunter.md`,
    edge: `${roundDir}/b2-edge-case-hunter.json`,
    auditor: `${roundDir}/b3-acceptance-auditor.md`,
  };
  const manifest = JSON.parse(await readFile(join(projectRoot, manifestPath), "utf8"));
  const classified = JSON.parse(await readFile(join(projectRoot, classifiedPath), "utf8"));
  const actual = scanActual().actual;
  if (actual.length !== 660 || manifest.counts.declared !== 41 || manifest.counts.excluded !== 619) {
    throw new Error("final entity scan count drift");
  }
  if (JSON.stringify(actual) !== JSON.stringify(manifest.actualChangedFiles)) {
    throw new Error("final entity scan path-set drift");
  }
  const layerBytes = Object.fromEntries(await Promise.all(
    Object.entries(layerPaths).map(async ([name, path]) => [name, await readFile(join(projectRoot, path))]),
  ));
  const layerRawHashes = Object.fromEntries(Object.entries(layerBytes).map(([name, bytes]) => [name, sha256(bytes)]));
  const expectedLayerHashes = {
    blind: "4de852adcc14934bd1c4682e03f9d539fd14fc763ed2782cad57a651c5de3a53",
    edge: "f8fe73a7f7edd5deb6e45f899d2905ad1a241036ebc205caa332ff77ecc147c7",
    auditor: "f3ce1a8418f58b293a2b83b161297b1b6fa1121a2b45fa08a713edec07ef688e",
  };
  if (JSON.stringify(layerRawHashes) !== JSON.stringify(expectedLayerHashes)) {
    throw new Error(`layer hash drift: ${JSON.stringify(layerRawHashes)}`);
  }
  const edge = JSON.parse(layerBytes.edge.toString("utf8"));
  if (edge.status !== "PASS" || edge.modelUsed !== modelUsed || edge.inputRawSha256 !== manifest.verification.reviewInputRawSha256) {
    throw new Error("edge layer binding invalid");
  }
  for (const [name, bytes] of Object.entries(layerBytes)) {
    const text = bytes.toString("utf8");
    if (!text.includes(modelUsed) || !text.includes(manifest.verification.reviewInputRawSha256)) {
      throw new Error(`${name} layer model/input binding invalid`);
    }
  }
  if (classified.findingSetHash !== `sha256:${sha256(Buffer.from(canonicalJson(classified.findings), "utf8"))}`) {
    throw new Error("findingSetHash drift");
  }
  const expectedCounts = { decisionNeeded: 0, patch: 3, verifyRequired: 0, defer: 2, dismiss: 3 };
  if (JSON.stringify(classified.counts) !== JSON.stringify(expectedCounts)) throw new Error("finding counts drift");
  const generatedAt = new Date().toISOString();
  const findingsBody = classified.findings.map((finding) => `### ${finding.findingId}: ${finding.title}

- 发现指纹：\`${finding.fingerprint}\`
- 类别：\`${finding.category}\`
- 不变量：${finding.invariant}
- 具体失败场景：${finding.concreteFailureScenario}
- 主要位置：\`${finding.primaryLocation}\`
- 来源审查层：\`${finding.sourceLayers.join("+")}\`
- 分类桶：\`${finding.bucket}\`
- 处置：\`${finding.disposition}\`
- 证据：${finding.evidence ?? finding.historicalOwnerEvidence ?? "沿用历史稳定 seed 与 disposition。"}
- 影响：${finding.bucket === "patch" ? "形成待 CR02 独立裁决的 current delivery candidate。" : finding.bucket === "defer" ? "既有非阻塞延期候选，本轮不升级。" : "没有新增 owner 义务或失败场景，不进入修复候选。"}
- 建议下一步：${finding.suggestedNext ?? "交由 CR02 依既有 T2 处置继续裁决。"}
`).join("\n");
  const summary = `---
schemaVersion: speclite.cr-review.v2
artifactType: code-review-summary
storyId: 11-9
storyKey: 11-9-normalize-code-review-artifact-directories-by-story-id
reviewSeries: evidence-v2
round: 6
generatedAt: ${generatedAt}
modelUsed: "${modelUsed}"
verdict: FINDINGS_REPORTED
baseSha: ${baseSha}
headSha: ${headSha}
scopeHash: ${manifest.scopeHash}
sourceMutationAt: ${sourceMutationAt}
inputMode: diff
declaredFiles: ${JSON.stringify(manifest.declaredFiles)}
actualChangedFiles: ${JSON.stringify(manifest.actualChangedFiles)}
excludedFiles: ${JSON.stringify(manifest.excludedFiles)}
scopeExceptions: []
availableLayers: [blind, edge, auditor]
failedLayers: []
acCoverageComplete: true
findingSetHash: ${classified.findingSetHash}
findingCounts:
  decisionNeeded: 0
  patch: 3
  verifyRequired: 0
  defer: 2
  dismiss: 3
---

# Code Review Summary（代码审查总结）

## Scope Manifest（范围清单）

- 声明文件：\`41\`，继承 R5 已批准 exact declared set；41 个 current content digests 全部重新绑定。
- 实际改动文件：\`660\`，由 relative base tracked diff、staged/unstaged \`--no-renames\` 与 untracked 合集完整扫描。
- 排除文件：\`619\`；精确继承 R5 的 608 个排除项，并只新增本轮 11 个授权 mutable workflow outputs。外部 \`speclite-skill-lint/\`、\`speclite-skill-creator/\` 及同包增量继续保留/排除。
- 范围例外：无。
- 基线来源：用户冻结 \`${baseSha}\`；\`HEAD\` 同值。
- 完整 diff：raw SHA-256 \`${manifest.verification.reviewInputRawSha256}\`，\`41/41\` headers，2 个 declared untracked 以 \`git diff --no-index /dev/null\` 纳入，base+diff 重建 \`41/41\` current bytes。
- \`scopeHash\`：\`${manifest.scopeHash}\`；Root 已独立复核路径集、41/41 digests、重建字节与 staged hash。
- resolver：消费 runner 冻结的 canonical context；本 Reviewer 没有重跑 directory resolver。

## Layer Status（审查层状态）

| 审查层 | 状态 | Model | 输出 raw SHA-256 |
|---|---|---|---|
| blind | PASS | ${modelUsed} | \`${layerRawHashes.blind}\` |
| edge | PASS | ${modelUsed} | \`${layerRawHashes.edge}\` |
| auditor | PASS / FINDINGS_REPORTED | ${modelUsed} | \`${layerRawHashes.auditor}\` |

- Quorum：fresh \`3/3\`；Blind 与 Edge 先行，Blind 完成并释放槽位后才启动 Auditor。
- 三层均完整读取同一份 8,054 行 / 497,042-byte diff；Auditor 完成 AC1–AC12 全量覆盖。

## Previous Findings（历史发现）

| 发现指纹 | 历史轮次 | 当前处置 | 证据 |
|---|---:|---|---|
| \`sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3\` | 5 | resolved | fresh Auditor 静态核验 current parser/test；本轮 coordinator focused \`110 passed / 4 todo / 0 failed\`。 |
| \`sha256:246de7037cff9f0b2f51929313785794e67b5066e9c99ba1cd27de5c559efdfd\` | 3 | resolved | exact \`@round\` 场景保持关闭；R6 tilde trigger使用新的具体场景和新指纹，不伪称复发。 |
| \`sha256:6c2824d6e2d973a0d1e630d4d84bf21b9f46b53ed0c95594f0ad4974c06bd7ca\` | 2/3 | dismissed | spaced/explicit duplicate authority key原场景，没有新 owner义务。 |
| \`sha256:dc49d985f86678a2c43f881583f53095f4a7d021d13cc41d22c98ed8f1e077d2\` | 5 | dismissed | quoted tracker key原场景，没有新 owner义务。 |
| \`sha256:f113580e33ce900c8f1516e7cd540b7bac96b7ceafdc5907d243c0ecbaebf1e4\` | 2-5 | dismissed | whole-document YAML validity owner未扩展，invalid \`|0\` 不以语法换皮复活。 |

## Findings（发现）

${findingsBody}
## Acceptance Coverage（验收覆盖）

- \`acCoverageComplete=true\`；Auditor 对 AC1–AC12 逐项审计。
- AC1–AC8、AC10–AC12：PASS。
- AC9：FAIL；对应 \`EVIDENCE-V2-R6-F1\` 的 incomplete-v2 legacy-resume authenticity candidate。
- R5 P1 closure：\`RESOLVED\`。quote 外 comment introducer current source 已 fail-close，current test覆盖6个无效变体、7个合法controls、authentic predecessor与zero-write。
- Completion gate：现存 \`PASS_EQUIVALENT\` gate generatedAt=\`2026-09-07T04:45:00.000Z\`，早于 \`${sourceMutationAt}\`；仅作 stale historical evidence。

## Verification Evidence（验证证据）

### Executed This Round（本轮实际执行）

- \`node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite\`：PASS；只解析 runtime config，不是 directory resolver。
- \`npx --no-install vitest run test/code-review-contract.test.ts --reporter=dot\`：PASS，\`110 passed / 4 todo / 0 failed\`。
- \`node --check assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs\`：PASS。
- scoped \`git diff --check\`（resolver + focused test）：PASS。
- 41 headers、2 untracked拼接、base+diff 41/41重建、current raw/canonical hashes、staged binary hash、live scope/finding/layer hashes：PASS。

### Referenced Historical Evidence（引用历史证据）

- R5 current evaluation raw/canonical：\`c7136aa15d2de2551b115cb0a16c8dcdc71a6368f27aaa0ffaa75d634310659f\` / \`sha256:8aa6fbbc28efe31d8215496aacf1f83e3a0173ca8a3e66d4946804358da589f3\`；\`FIX_REQUIRED\` + completed fixRecord，\`sourceMutationAt=${sourceMutationAt}\`。
- R5 Fixer：clean RED \`1 failed / 109 passed / 4 todo\` → GREEN \`110 passed / 4 todo\`；Root另于16:18:42重跑110/4。这些不是本 Reviewer本轮执行。
- 现存 completion gate：stale historical evidence，不是本轮 fresh gate。

## Convergence Input（收敛输入）

- 新增阻塞指纹候选：\`${classified.findings.filter((finding) => finding.bucket === "patch").map((finding) => finding.fingerprint).join("\`、\`")}\`。
- 复现阻塞指纹候选：无。
- 已关闭指纹：\`sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3\`。
- 反复修改位置：shared resolver仍是审查热点；本轮三个候选分别位于 unfinished evidence authenticity、filename classifier与bounded inline-list，不是同一 accepted fingerprint修后复现。是否构成 convergence stop-loss 由 CR02 独立裁决。
- 架构类别：\`[]\`；Reviewer不预判 Evaluator分类。
- 当前 run \`maxRounds=6\` 来自用户批准的R5单次例外；shared默认仍为5，未来例外未授权。本轮已到Round 6，但 Reviewer不输出STOP_LOSS。

## Reviewer Verdict（Reviewer 结论）

- 裁决：\`FINDINGS_REPORTED\`
- 理由：scope complete、\`scopeExceptions=[]\`、fresh \`3/3\` quorum与AC coverage complete均成立；三项具有新具体失败场景的patch candidates等待独立评估，两项T2原指纹carry，三项历史owner候选保持dismissed。R5唯一accepted P1由fresh Auditor确认resolved。
- 必须执行的下一步：\`speclite-code-review-02-evaluator\`。
- Reviewer边界：本阶段未启动Evaluator/Fixer/CR04/CR05/CR06、未生成fresh completion gate、未修改source/test/Story/tracker/root logs/旧artifact。
`;
  await writeRelative(summaryPath, summary);
  const summaryBytes = await readFile(join(projectRoot, summaryPath));
  const classifiedBytes = await readFile(join(projectRoot, classifiedPath));
  manifest.status = "FINALIZED";
  manifest.finalizedAt = generatedAt;
  manifest.generatedAt = generatedAt;
  manifest.layerEvidence = {
    blind: { status: "PASS", path: layerPaths.blind, modelUsed, rawSha256: layerRawHashes.blind },
    edge: { status: "PASS", path: layerPaths.edge, modelUsed, rawSha256: layerRawHashes.edge },
    auditor: { status: "PASS", path: layerPaths.auditor, modelUsed, rawSha256: layerRawHashes.auditor, acCoverageComplete: true, acPassed: 11, acFailed: 1 },
  };
  manifest.findingEvidence = { findingSetHash: classified.findingSetHash, counts: classified.counts, classifiedRawSha256: sha256(classifiedBytes), classifiedCanonicalSha256: canonicalHashText(classifiedBytes.toString("utf8")), r5AcceptedP1: "resolved" };
  manifest.summaryEvidence = { path: summaryPath, rawSha256: sha256(summaryBytes), canonicalSha256: canonicalHashText(summaryBytes.toString("utf8")), verdict: "FINDINGS_REPORTED" };
  manifest.postWriteVerification = { actual: actual.length, declared: 41, excluded: 619, scopeExceptions: 0, scopeHash: manifest.scopeHash, actualPathSetEqual: true, layerHashesEqual: true, findingSetHashEqual: true };
  await writeRelative(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  const finalActual = scanActual().actual;
  if (JSON.stringify(finalActual) !== JSON.stringify(actual)) throw new Error("post-summary path-set drift");
  process.stdout.write(JSON.stringify({ ok: true, generatedAt, counts: manifest.counts, scopeHash: manifest.scopeHash, findingSetHash: classified.findingSetHash, layerRawHashes, summaryRawSha256: sha256(summaryBytes), summaryCanonicalSha256: canonicalHashText(summaryBytes.toString("utf8")), actualPathSetEqual: true }) + "\n");
  process.exit(0);
}

const priorScope = JSON.parse(await readFile(join(projectRoot, priorScopePath), "utf8"));
const declaredFiles = [...priorScope.declaredFiles].sort(bytewise);
const priorActual = [...priorScope.actualChangedFiles].sort(bytewise);
const priorExcluded = [...priorScope.excludedFiles].sort(bytewise);
if (declaredFiles.length !== 41 || new Set(declaredFiles).size !== 41) {
  throw new Error(`declared files must be unique 41, got ${declaredFiles.length}`);
}
if (priorActual.length !== 649 || priorExcluded.length !== 608 || priorScope.scopeExceptions.length !== 0) {
  throw new Error("Round 5 inherited scope does not match frozen 649/41/608/0");
}
if (run("git", ["rev-parse", "HEAD"]).trim() !== headSha) {
  throw new Error("HEAD drifted from frozen base/head");
}

const before = scanActual();
const allowedBeforeExtra = before.actual.filter((path) => !priorActual.includes(path) && !r6Paths.includes(path));
const missingPrior = priorActual.filter((path) => !before.actual.includes(path));
if (allowedBeforeExtra.length || missingPrior.length) {
  throw new Error(`pre-materialization actual drift: extra=${JSON.stringify(allowedBeforeExtra)} missing=${JSON.stringify(missingPrior)}`);
}

await writeRelative(`${roundDir}/b1-blind-hunter.md`, "PENDING: fresh Blind Hunter 尚未写入。\n");
await writeRelative(`${roundDir}/b2-edge-case-hunter.json`, "{\"status\":\"PENDING\"}\n");
await writeRelative(`${roundDir}/b3-acceptance-auditor.md`, "PENDING: fresh Acceptance Auditor 尚未写入。\n");
await writeRelative(`${roundDir}/classified-findings.json`, "{\"status\":\"PENDING\",\"findings\":[]}\n");
await writeRelative(`${roundDir}/anchor-evidence.md`, "PENDING: current scope freeze 尚未写入。\n");
await writeRelative(`${roundDir}/scope-manifest.json`, "{\"status\":\"PREPARING\"}\n");
await writeRelative(summaryPath, "<!-- PENDING: fresh 3/3 quorum 前不可消费。 -->\n");

const storyText = await readFile(join(projectRoot, storyPath), "utf8");
await writeRelative(
  `${roundDir}/spec-content.md`,
  `# Round 6 Story and AC（第六轮 Story 与验收标准）\n\n- Review series / round: \`evidence-v2 / 6\`\n- Story source: \`${storyPath}\`\n- R5 fixRecord 完成仅是待 fresh 复核输入，不预设 Reviewer 或 Evaluator 结论。\n\n${normalizeText(storyText)}\n`,
);

const priorHistory = JSON.parse(await readFile(join(projectRoot, priorRoundDir, "history-registry.json"), "utf8"));
const history = {
  ...priorHistory,
  currentRound: 6,
  round5: {
    reviewSource: "11-9-code-review-summary-20260908-evidence-v2-round-5.md",
    reviewSourceHash: "sha256:cafb40d7f3cd75e7d4d853c0c6efa6d262f9c7c12a813c0d889b1c763964721c",
    evaluationSource: "11-9-code-review-evaluation-20260908-evidence-v2-round-5.md",
    evaluationSourceHash: "sha256:8aa6fbbc28efe31d8215496aacf1f83e3a0173ca8a3e66d4946804358da589f3",
    fixRecordStatus: "completed-pending-fresh-review",
    sourceMutationAt,
    findings: [
      { fingerprint: "sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3", disposition: "accepted-p1-fixed-pending-fresh-review", category: "artifact-authentication" },
      { fingerprint: "sha256:dc49d985f86678a2c43f881583f53095f4a7d021d13cc41d22c98ed8f1e077d2", disposition: "dismissed", category: "authority" },
      { fingerprint: "sha256:1ea0c8bba570f7b13a62a8bfcced5adc914ca3881e6e4bb41911a2697b55797d", disposition: "dismissed", category: "datetime-validation" },
      { fingerprint: "sha256:a71d3d571a9ff71b09d6f36a00e65148d2ceb2e57c1b1603ecd4cd93ecd31244", disposition: "deferred", category: "freshness", urgency: "T2" },
      { fingerprint: "sha256:cc04b874c8df8002fee766dfe795e7b68aed5e67658359dffd159c66831b6483", disposition: "deferred", category: "lifecycle", urgency: "T2" },
    ],
  },
  constraints: [
    ...(priorHistory.constraints ?? []),
    "R5 accepted inline-list comment fingerprint is fixed pending fresh R6 review; a completed fixRecord is not review closure.",
    "R5 dismissed whole-document YAML/full key grammar/TOCTOU/quoted-key/offset candidates require a new owner obligation and distinct concrete failure scenario before reconsideration.",
    "R2 time precision and superseded ordinal retain their original fingerprints and T2 deferred status.",
    "R4 totality was closed by R5 fresh review/evaluation and must not be revived by wording-only variation.",
    "The current-run maxRounds is 6 under a one-time R5 exception; shared default remains 5 and future exceptions are not authorized.",
  ],
};
await writeRelative(`${roundDir}/history-registry.json`, JSON.stringify(history, null, 2) + "\n");

const trackedDiff = run("git", ["diff", "--binary", "--no-ext-diff", "--no-renames", baseSha, "--", ...declaredFiles]);
let reviewInput = trackedDiff;
const declaredUntracked = declaredFiles.filter((path) => before.untracked.has(path));
if (declaredUntracked.length !== 2) {
  throw new Error(`expected exactly 2 declared untracked files, got ${declaredUntracked.length}`);
}
for (const path of declaredUntracked) {
  reviewInput += run(
    "git",
    ["diff", "--no-index", "--binary", "--no-ext-diff", "--", "/dev/null", path],
    { allowedStatus: [1] },
  );
}
await writeRelative(`${roundDir}/review-input.diff`, reviewInput);

const diffHeaders = [...reviewInput.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)].map((match) => match[2]).sort(bytewise);
if (diffHeaders.length !== 41 || JSON.stringify(diffHeaders) !== JSON.stringify(declaredFiles)) {
  throw new Error(`review input headers mismatch: ${diffHeaders.length}/41`);
}

const reconstructionRoot = await mkdtemp(join(tmpdir(), "speclite-cr-r6-reconstruct-"));
try {
  for (const path of declaredFiles) {
    const exists = spawnSync("git", ["cat-file", "-e", `${baseSha}:${path}`], { cwd: projectRoot }).status === 0;
    if (!exists) continue;
    const bytes = run("git", ["show", `${baseSha}:${path}`], { encoding: null });
    const target = join(reconstructionRoot, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  run("git", ["apply", "--unsafe-paths", "--binary", join(projectRoot, roundDir, "review-input.diff")], { cwd: reconstructionRoot });
  for (const path of declaredFiles) {
    const reconstructed = await readFile(join(reconstructionRoot, path));
    const current = await readFile(join(projectRoot, path));
    if (!reconstructed.equals(current)) throw new Error(`reconstructed bytes drift: ${path}`);
  }
} finally {
  await rm(reconstructionRoot, { recursive: true, force: true });
}

const expectedRawCanonical = [
  ["assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-contract/scripts/resolve-cr-directory.mjs", "0fceb4e0788d99d63ba83d134fcd25a18999f8d5e1fbd6ede9c9b12558aaaf30", "sha256:788a09297696a9ec2e10a4124687832dc44559be934238f9bd3baee1fbba675f"],
  ["test/code-review-contract.test.ts", "fdb534e14c60b5c73ece31ffa73786ebe7ad476dd26c26ef44b14ae8f08ae904", "sha256:6478756ddcfa78d874df12be057cdb6b2894a253fb7f1302f8a10dacabc6f008"],
  ["release/packaging-manifest.json", "82bf17e81ce0ce06cab618084f79c817707bf8537146772e3bf2e69bd4a3c976", "sha256:2e58ae0350722346fb05315094c5331231f9a21293490138edca13c79be15979"],
  [`${crDir}/11-9-code-review-evaluation-20260908-evidence-v2-round-5.md`, "c7136aa15d2de2551b115cb0a16c8dcdc71a6368f27aaa0ffaa75d634310659f", "sha256:8aa6fbbc28efe31d8215496aacf1f83e3a0173ca8a3e66d4946804358da589f3"],
];
for (const [path, expectedRaw, expectedCanonical] of expectedRawCanonical) {
  const bytes = await readFile(join(projectRoot, path));
  if (sha256(bytes) !== expectedRaw || canonicalHashText(bytes.toString("utf8")) !== expectedCanonical) {
    throw new Error(`authoritative hash drift: ${path}`);
  }
}

const after = scanActual();
const expectedActual = [...new Set([...priorActual, ...r6Paths])].sort(bytewise);
if (JSON.stringify(after.actual) !== JSON.stringify(expectedActual)) {
  const extra = after.actual.filter((path) => !expectedActual.includes(path));
  const missing = expectedActual.filter((path) => !after.actual.includes(path));
  throw new Error(`post-materialization actual drift: extra=${JSON.stringify(extra)} missing=${JSON.stringify(missing)}`);
}
const declaredSet = new Set(declaredFiles);
const excludedFiles = after.actual.filter((path) => !declaredSet.has(path));
const expectedExcluded = [...new Set([...priorExcluded, ...r6Paths])].sort(bytewise);
if (JSON.stringify(excludedFiles) !== JSON.stringify(expectedExcluded)) {
  throw new Error("post-materialization excluded set is not inherited exact exclusions plus Round 6 authorized outputs");
}
const scopeExceptions = after.actual.filter((path) => !declaredSet.has(path) && !excludedFiles.includes(path));

const contentDigests = [];
for (const path of declaredFiles) {
  const bytes = await readFile(join(projectRoot, path));
  const text = bytes.toString("utf8");
  contentDigests.push({ path, contentHash: canonicalHashText(text) });
}
const scopeHashInput = {
  actualChangedFiles: after.actual,
  baseSha,
  contentDigests,
  declaredFiles,
  excludedFiles,
  headSha,
  scopeExceptions,
};
const scopeHash = `sha256:${sha256(Buffer.from(canonicalJson(scopeHashInput), "utf8"))}`;
const reviewInputRawSha256 = sha256(Buffer.from(reviewInput, "utf8"));
const stagedBinaryDiff = run("git", ["diff", "--cached", "--binary", "--no-ext-diff"], { encoding: null });
const stagedBinaryDiffRawSha256 = sha256(stagedBinaryDiff);
if (stagedBinaryDiffRawSha256 !== "06426fd385ef8a387cfe9aecb0ac0472274c3c0de69ed2fd107ed0d44f17787f") {
  throw new Error("staged binary diff drifted");
}
const gateText = await readFile(join(projectRoot, gatePath), "utf8");
const gateGeneratedAt = gateText.match(/^generatedAt:\s*(.+)$/m)?.[1]?.trim() ?? "unavailable";
const gateResult = gateText.match(/^result:\s*(.+)$/m)?.[1]?.trim() ?? "unavailable";

const anchorEvidence = `# Round 6 Anchor Evidence（第六轮锚点证据）

- frozen diff raw SHA-256：\`${reviewInputRawSha256}\`；\`41/41\` declared headers，base+diff 重建后的 41 个文件逐字节等于 current workspace；其中 2 个 declared untracked 通过 \`git diff --no-index /dev/null\` 纳入。
- runtime config：本轮独立执行 \`node dist/bin/speclite.js resolve config --project-root /Users/fancyliu/Repos/SpecLite\`，exit 0；directory resolver 未重跑且禁止下游重跑。
- frozen directory evidence：\`ok=true\`、\`issue=null\`、\`crDir=canonicalCrDir=${crDir}\`、\`compatibilityMode=canonical\`、\`legacyArtifactPaths=[]\`。
- base/head：\`${baseSha}\` / \`${headSha}\`；current physical actual=${after.actual.length}、declared=${declaredFiles.length}、excluded=${excludedFiles.length}、scopeExceptions=${scopeExceptions.length}。
- scopeHash：\`${scopeHash}\`；41 个 declared 当前完整内容参与 digest，excluded mutable workflow outputs 只绑定路径以避免自引用。
- R5 current review canonical SHA-256：\`sha256:cafb40d7f3cd75e7d4d853c0c6efa6d262f9c7c12a813c0d889b1c763964721c\`；其 3/3 仅作历史，不复用为 R6 layer evidence。
- R5 current evaluation raw/canonical SHA-256：\`c7136aa15d2de2551b115cb0a16c8dcdc71a6368f27aaa0ffaa75d634310659f\` / \`sha256:8aa6fbbc28efe31d8215496aacf1f83e3a0173ca8a3e66d4946804358da589f3\`；\`verdict=FIX_REQUIRED\`、completed fixRecord、\`sourceMutationAt=${sourceMutationAt}\`。
- R5 accepted P1：\`sha256:f901eda7efb58650982cf9e821fce188a4e6e64468449e0b2ca04493b79ed7e3\`，仅作为待 fresh 核验的 bounded inline-list comment authentication 历史输入，不预定 resolved。
- R5 Fixer 历史证据（非本轮执行）：clean RED \`1 failed / 109 passed / 4 todo\` → GREEN \`110 passed / 4 todo / 0 failed\`；Root 另于 16:18:42 执行 focused \`110 passed / 4 todo\`。本轮 Reviewer 不冒称执行这些历史运行。
- 本轮 CR01 coordinator 实际执行：focused Vitest \`110 passed / 4 todo / 0 failed\`、resolver \`node --check\` PASS、scoped \`git diff --check\` PASS、runtime config resolve PASS、hash/headers/reconstruction/scope validation PASS。
- current source raw/canonical：\`0fceb4e0788d99d63ba83d134fcd25a18999f8d5e1fbd6ede9c9b12558aaaf30\` / \`sha256:788a09297696a9ec2e10a4124687832dc44559be934238f9bd3baee1fbba675f\`；test raw/canonical：\`fdb534e14c60b5c73ece31ffa73786ebe7ad476dd26c26ef44b14ae8f08ae904\` / \`sha256:6478756ddcfa78d874df12be057cdb6b2894a253fb7f1302f8a10dacabc6f008\`。
- shared \`release/packaging-manifest.json\` current raw/canonical：\`82bf17e81ce0ce06cab618084f79c817707bf8537146772e3bf2e69bd4a3c976\` / \`sha256:2e58ae0350722346fb05315094c5331231f9a21293490138edca13c79be15979\`；外部三路径/arrays/packageHash 增量沿用既有归属说明，不在本轮生成或修改。
- staged binary diff raw SHA-256：\`${stagedBinaryDiffRawSha256}\`，与冻结值一致。
- External Package Exclusion：\`speclite-skill-lint/\` 与 \`speclite-skill-creator/\` 两包及同包增量继续完整进入 actual/excluded；三层不得修改、回滚或归入 Story 11.9 成果。
- Completion gate：\`${gatePath}\`，result=\`${gateResult}\`，generatedAt=\`${gateGeneratedAt}\`，raw/canonical=\`${sha256(Buffer.from(gateText, "utf8"))}\` / \`${canonicalHashText(gateText)}\`；它早于 R5 source mutation，是 stale historical evidence，不是本轮 fresh gate。
- 当前 run maxRounds=6 来自用户对 R5 单次例外的明确批准；shared default=5 且未来例外未授权。Reviewer 只输出收敛输入，不预判 CR02。
`;
await writeRelative(`${roundDir}/anchor-evidence.md`, anchorEvidence);

const manifest = {
  schemaVersion: "speclite.cr-scope-manifest.v2",
  status: "FINALIZED",
  generatedAt,
  modelUsed,
  storyId: "11-9",
  storyKey: "11-9-normalize-code-review-artifact-directories-by-story-id",
  reviewSeries: "evidence-v2",
  round: 6,
  baseSha,
  headSha,
  inputMode: "diff",
  sourceMutationAt,
  scopeHash,
  contentDigestPolicy: "Only declared implementation file contents are hashed. Excluded mutable workflow outputs bind by path only under user-approved policy, avoiding self-referential report/manifest hashes.",
  hashCanonicalization: "NFC; LF; trimEnd; byte-wise sorted POSIX lists; code-point-key-sorted compact JSON; UTF-8 SHA-256",
  scopeHashInputKeys: ["actualChangedFiles", "baseSha", "contentDigests", "declaredFiles", "excludedFiles", "headSha", "scopeExceptions"],
  counts: { declared: declaredFiles.length, actual: after.actual.length, excluded: excludedFiles.length, scopeExceptions: scopeExceptions.length },
  actualScanMethod: { trackedFromBase: true, stagedNoRenames: true, unstagedNoRenames: true, untrackedExcludeStandard: true },
  actualScanLayers: { ...after.counts, physicalActual: after.actual.length },
  declaredFiles,
  actualChangedFiles: after.actual,
  excludedFiles,
  scopeExceptions,
  contentDigests,
  inheritedScope: { path: priorScopePath, counts: { declared: 41, actual: 649, excluded: 608, scopeExceptions: 0 }, exactActualSetPreservedBeforeRound6Writes: true, exactExcludedSetPreserved: true },
  addedAuthorizedMutableWorkflowOutputs: r6Paths,
  resolverEvidence: { ok: true, storyId: "11-9", reviewSeries: "evidence-v2", crDir, canonicalCrDir: crDir, compatibilityMode: "canonical", legacyArtifactPaths: [], issue: null },
  trackerBindings: {
    story: { required: true, path: storyPath, key: "Status", expectedTerminalState: "done" },
    sprint: { required: true, path: "_bmad-output/implementation-artifacts/sprint-status.yaml", key: "11-9-normalize-code-review-artifact-directories-by-story-id", expectedTerminalState: "done" },
    workflow: { required: false },
  },
  layerEvidence: {
    blind: { status: "PENDING", path: `${roundDir}/b1-blind-hunter.md`, modelUsed },
    edge: { status: "PENDING", path: `${roundDir}/b2-edge-case-hunter.json`, modelUsed },
    auditor: { status: "PENDING", path: `${roundDir}/b3-acceptance-auditor.md`, modelUsed, acCoverageComplete: false },
  },
  verification: {
    focusedVitest: "PASS: 110 passed / 4 todo / 0 failed",
    nodeCheck: "PASS",
    scopedDiffCheck: "PASS",
    runtimeConfigResolve: "PASS",
    directoryResolverRun: false,
    reviewInputRawSha256,
    reviewInputHeaders: diffHeaders.length,
    declaredUntrackedCount: declaredUntracked.length,
    reconstructedCurrentBytes: "PASS: 41/41",
    sourceRawSha256: expectedRawCanonical[0][1],
    sourceCanonicalSha256: expectedRawCanonical[0][2],
    focusedTestRawSha256: expectedRawCanonical[1][1],
    focusedTestCanonicalSha256: expectedRawCanonical[1][2],
    packagingManifestRawSha256: expectedRawCanonical[2][1],
    packagingManifestCanonicalSha256: expectedRawCanonical[2][2],
    r5EvaluationRawSha256: expectedRawCanonical[3][1],
    r5EvaluationCanonicalSha256: expectedRawCanonical[3][2],
    stagedBinaryDiffRawSha256,
  },
  authorizationSource: `${crDir}/goal-execute-records/evidence-v2-authorization.md`,
  currentRunAuthority: { maxRounds: 6, sharedDefaultMaxRounds: 5, exceptionAppliesTo: "R5 single stop-loss only", futureExceptionAuthorized: false },
};
await writeRelative(`${roundDir}/scope-manifest.json`, JSON.stringify(manifest, null, 2) + "\n");

process.stdout.write(JSON.stringify({
  ok: true,
  counts: manifest.counts,
  scopeHash,
  sourceMutationAt,
  generatedAt,
  reviewInputRawSha256,
  reviewInputHeaders: diffHeaders.length,
  declaredUntrackedCount: declaredUntracked.length,
  reconstructedCurrentBytes: "41/41",
  stagedBinaryDiffRawSha256,
  addedRound6Paths: r6Paths.length,
}) + "\n");
