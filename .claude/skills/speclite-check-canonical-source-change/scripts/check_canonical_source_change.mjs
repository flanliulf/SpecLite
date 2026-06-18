#!/usr/bin/env node
import { constants } from "node:fs";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CANONICAL_ROOT = "assets/source/speclite";
const REQUIRED_HOOK_FILES = [
  "README.md",
  "hook-manifest.json",
  "runner.mjs",
  "claude-settings.fragment.json",
  "codex-hooks.fragment.json",
];
const SCAN_DIRS = ["docs", "test", "src", "release"];
const SCAN_FILES = ["README.md", "assets/source/speclite/README.md", "assets/source/speclite/README.en.md"];

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(args.projectRoot ?? ".");
const format = args.format ?? "text";

try {
  const report = await createReport(projectRoot);
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(report));
  }
} catch (error) {
  const report = {
    schemaVersion: "speclite.canonical-source-change-check.v1",
    status: "failure",
    projectRoot: displayPath(projectRoot),
    counts: {
      core: 0,
      sdlc: 0,
      support: 0,
      hooks: 0,
      defaultInstall: { total: 0 },
    },
    findings: [
      {
        id: "checker.unhandled-error",
        severity: "error",
        path: ".",
        message: error instanceof Error ? error.message : String(error),
      },
    ],
    recommendedCommands: createRecommendedCommands(),
  };
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(renderText(report));
  }
}

async function createReport(projectRoot) {
  const canonicalRoot = path.join(projectRoot, CANONICAL_ROOT);
  const coreRoots = await listSkillRoots(path.join(canonicalRoot, "core-skills"));
  const sdlcRoots = await listSkillRoots(path.join(canonicalRoot, "sdlc-skills"));
  const supportRoots = await listSkillRoots(path.join(canonicalRoot, "support-skills"));
  const hooks = await listHookRoots(path.join(canonicalRoot, "hooks"));
  const counts = {
    core: coreRoots.length,
    sdlc: sdlcRoots.length,
    support: supportRoots.length,
    hooks: hooks.length,
    defaultInstall: {
      total: coreRoots.length + sdlcRoots.length,
    },
  };
  const findings = [
    ...(await checkModuleHelp(projectRoot, "core-skills", coreRoots)),
    ...(await checkModuleHelp(projectRoot, "sdlc-skills", sdlcRoots)),
    ...(await checkHookSources(projectRoot, hooks)),
    ...(await checkManifestBaseline(projectRoot, counts.defaultInstall.total)),
    ...(await scanStaleText(projectRoot, counts)),
    ...(await checkPackagingManifest(projectRoot)),
  ];
  findings.sort((left, right) => `${left.severity}:${left.id}:${left.path}`.localeCompare(`${right.severity}:${right.id}:${right.path}`));
  return {
    schemaVersion: "speclite.canonical-source-change-check.v1",
    status: findings.some((finding) => finding.severity === "error") ? "warning" : findings.length > 0 ? "warning" : "ok",
    projectRoot: displayPath(projectRoot),
    counts,
    findings,
    recommendedCommands: createRecommendedCommands(),
  };
}

async function listSkillRoots(root) {
  if (!(await exists(root))) return [];
  const roots = [];
  await walk(root, async (filePath, dirent) => {
    if (!dirent.isFile() || dirent.name !== "SKILL.md") return;
    roots.push(path.dirname(filePath));
  });
  return roots.sort((left, right) => relative(left).localeCompare(relative(right)));
}

async function listHookRoots(root) {
  if (!(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .sort((left, right) => relative(left).localeCompare(relative(right)));
}

async function checkModuleHelp(projectRoot, group, skillRoots) {
  const csvPath = path.join(projectRoot, CANONICAL_ROOT, group, "module-help.csv");
  const relativeCsvPath = toProjectRelative(projectRoot, csvPath);
  if (!(await exists(csvPath))) {
    return [
      {
        id: "module-help.missing-file",
        severity: "error",
        path: relativeCsvPath,
        message: `${group}/module-help.csv is missing.`,
      },
    ];
  }

  const rows = parseCsv(await readFile(csvPath, "utf8"));
  const skillColumn = rows.headers.indexOf("skill");
  const actionColumn = rows.headers.indexOf("action");
  const menuCodeColumn = rows.headers.indexOf("menu-code");
  if (skillColumn < 0) {
    return [
      {
        id: "module-help.missing-skill-column",
        severity: "error",
        path: relativeCsvPath,
        message: `${group}/module-help.csv has no skill column.`,
      },
    ];
  }

  const packageIds = new Set(skillRoots.map((root) => path.basename(root)));
  const seenSkills = new Set();
  const seenRows = new Map();
  const findings = [];
  for (const row of rows.rows) {
    const skillId = row[skillColumn]?.trim();
    if (skillId === undefined || skillId.length === 0 || skillId === "_meta") continue;
    seenSkills.add(skillId);
    const action = actionColumn >= 0 ? row[actionColumn]?.trim() ?? "" : "";
    const menuCode = menuCodeColumn >= 0 ? row[menuCodeColumn]?.trim() ?? "" : "";
    const duplicateKey = `${skillId}\u0000${action}\u0000${menuCode}`;
    const count = seenRows.get(duplicateKey) ?? 0;
    seenRows.set(duplicateKey, count + 1);
  }

  for (const [duplicateKey, count] of seenRows.entries()) {
    const [skillId, action, menuCode] = duplicateKey.split("\u0000");
    if (count > 1) {
      findings.push({
        id: "module-help.duplicate-row",
        severity: "error",
        path: relativeCsvPath,
        message: `${group}/module-help.csv contains duplicate rows for ${skillId} action=${action} menu-code=${menuCode}.`,
        details: { skillId, action, menuCode, count },
      });
    }
  }

  for (const skillId of [...seenSkills].sort()) {
    if (!packageIds.has(skillId)) {
      findings.push({
        id: "module-help.unknown-row",
        severity: "warning",
        path: relativeCsvPath,
        message: `${group}/module-help.csv contains ${skillId}, but no matching SKILL.md package root exists.`,
        details: { skillId },
      });
    }
  }

  for (const skillId of [...packageIds].sort()) {
    if (!seenSkills.has(skillId)) {
      findings.push({
        id: "module-help.missing-row",
        severity: "warning",
        path: relativeCsvPath,
        message: `${group}/module-help.csv is missing a row for ${skillId}.`,
        details: { skillId },
      });
    }
  }

  return findings;
}

async function checkHookSources(projectRoot, hookRoots) {
  const findings = [];
  for (const hookRoot of hookRoots) {
    const hookId = path.basename(hookRoot);
    for (const fileName of REQUIRED_HOOK_FILES) {
      const filePath = path.join(hookRoot, fileName);
      if (!(await exists(filePath))) {
        findings.push({
          id: "hook-source.missing-required-file",
          severity: "error",
          path: toProjectRelative(projectRoot, filePath),
          message: `${hookId} hook source is missing ${fileName}.`,
          details: { hookId, fileName },
        });
      }
    }

    const manifestPath = path.join(hookRoot, "hook-manifest.json");
    if (!(await exists(manifestPath))) continue;
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      if (manifest.hookId !== hookId) {
        findings.push({
          id: "hook-source.manifest-id-mismatch",
          severity: "error",
          path: toProjectRelative(projectRoot, manifestPath),
          message: `hook-manifest.json hookId must be ${hookId}.`,
          details: { hookId, actualHookId: manifest.hookId },
        });
      }
      if (manifest.protectedSkill === undefined && manifest.protectedSurface === undefined) {
        findings.push({
          id: "hook-source.missing-protected-target",
          severity: "warning",
          path: toProjectRelative(projectRoot, manifestPath),
          message: `${hookId} should declare protectedSkill or protectedSurface.`,
          details: { hookId },
        });
      }
    } catch (error) {
      findings.push({
        id: "hook-source.invalid-manifest-json",
        severity: "error",
        path: toProjectRelative(projectRoot, manifestPath),
        message: error instanceof Error ? error.message : String(error),
        details: { hookId },
      });
    }
  }
  return findings;
}

async function checkManifestBaseline(projectRoot, expectedCount) {
  const filePath = path.join(projectRoot, "src/validation/rules/manifest-schema.ts");
  if (!(await exists(filePath))) return [];
  const contents = await readFile(filePath, "utf8");
  const match = contents.match(/CORE_SDLC_BASELINE_ENTRY_COUNT\s*=\s*(\d+)/);
  if (match === null) return [];
  const actualCount = Number.parseInt(match[1], 10);
  if (actualCount === expectedCount) return [];
  return [
    {
      id: "manifest-schema.stale-core-sdlc-baseline",
      severity: "warning",
      path: toProjectRelative(projectRoot, filePath),
      message: `CORE_SDLC_BASELINE_ENTRY_COUNT is ${actualCount}, expected ${expectedCount}.`,
      details: { actualCount, expectedCount },
    },
  ];
}

async function scanStaleText(projectRoot, counts) {
  const files = [];
  for (const dir of SCAN_DIRS) {
    files.push(...(await listTextFiles(path.join(projectRoot, dir))));
  }
  for (const file of SCAN_FILES) {
    const filePath = path.join(projectRoot, file);
    if (await exists(filePath)) files.push(filePath);
  }

  const findings = [];
  const uniqueFiles = [...new Set(files)].sort();
  for (const filePath of uniqueFiles) {
    const contents = await safeReadText(filePath);
    if (contents === undefined) continue;
    const relativePath = toProjectRelative(projectRoot, filePath);
    if (/sdlc\s*=\s*44\s*,?\s*total\s*=\s*57|total\s*=\s*57|sdlc\s*=\s*44/i.test(contents)) {
      findings.push({
        id: "docs.stale-canonical-count",
        severity: "warning",
        path: relativePath,
        message: `Found stale core/sdlc count text; current counts are core=${counts.core}, sdlc=${counts.sdlc}, total=${counts.defaultInstall.total}.`,
      });
    }
    const supportCountMatch = contents.match(/Support skill package roots\s*\|\s*(\d+)/);
    if (supportCountMatch !== null && Number.parseInt(supportCountMatch[1], 10) !== counts.support) {
      findings.push({
        id: "docs.stale-canonical-count",
        severity: "warning",
        path: relativePath,
        message: `Found stale support skill count ${supportCountMatch[1]}; current support count is ${counts.support}.`,
      });
    }
    if (relativePath.endsWith("codex-hooks.fragment.json") && /"hooks"\s*:\s*\[\s*\{/.test(contents)) {
      findings.push({
        id: "codex-hook-config.legacy-array-shape",
        severity: "warning",
        path: relativePath,
        message: "Codex hook fragment still uses legacy hooks array shape; expected event-keyed hooks object.",
      });
    }
  }
  return findings;
}

async function checkPackagingManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, "release/packaging-manifest.json");
  const canonicalRoot = path.join(projectRoot, CANONICAL_ROOT);
  if (!(await exists(manifestPath)) || !(await exists(canonicalRoot))) return [];
  const findings = [];
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    return [
      {
        id: "packaging-manifest.invalid-json",
        severity: "error",
        path: "release/packaging-manifest.json",
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
  const packagedFiles = new Set(Array.isArray(manifest.files) ? manifest.files : []);
  const requiredFiles = [];
  await walk(canonicalRoot, async (filePath, dirent) => {
    if (dirent.isFile()) requiredFiles.push(toProjectRelative(projectRoot, filePath));
  });
  for (const filePath of requiredFiles.sort()) {
    if (!packagedFiles.has(filePath)) {
      findings.push({
        id: "packaging-manifest.missing-canonical-file",
        severity: "warning",
        path: "release/packaging-manifest.json",
        message: `release/packaging-manifest.json does not include ${filePath}.`,
        details: { filePath },
      });
    }
  }
  return findings;
}

async function listTextFiles(root) {
  if (!(await exists(root))) return [];
  const files = [];
  await walk(root, async (filePath, dirent) => {
    if (!dirent.isFile()) return;
    if (/\.(?:md|json|ts|tsx|js|mjs|csv|toml|yaml|yml|txt)$/.test(filePath)) files.push(filePath);
  });
  return files;
}

async function walk(root, visitor) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === ".DS_Store") {
      continue;
    }
    const filePath = path.join(root, entry.name);
    await visitor(filePath, entry);
    if (entry.isDirectory()) await walk(filePath, visitor);
  }
}

function parseCsv(contents) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;
  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index];
    const next = contents[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }
  row.push(current);
  if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
  return {
    headers: rows[0] ?? [],
    rows: rows.slice(1),
  };
}

function createRecommendedCommands() {
  return [
    "node assets/source/speclite/support-skills/speclite-check-canonical-source-change/scripts/check_canonical_source_change.mjs --project-root . --scope all --format json",
    "python3 assets/source/speclite/support-skills/speclite-skill-lint/scripts/check_skill_density.py assets/source/speclite/support-skills/speclite-check-canonical-source-change",
    "npm test -- test/hook-artifact-install.test.ts test/config-initialization.test.ts test/runtime-structure.test.ts test/fixture-release-gates.test.ts test/story-6-4-path-portability.test.ts test/source-and-modules.test.ts",
    "npm run build",
    "npm test",
    "npm run release:packaging-check",
    "git diff --check",
  ];
}

function renderText(report) {
  const lines = [
    `status: ${report.status}`,
    `counts: core=${report.counts.core}, sdlc=${report.counts.sdlc}, support=${report.counts.support}, hooks=${report.counts.hooks}, total=${report.counts.defaultInstall.total}`,
  ];
  if (report.findings.length === 0) {
    lines.push("findings: none");
  } else {
    lines.push("findings:");
    for (const finding of report.findings) {
      lines.push(`- [${finding.severity}] ${finding.id} ${finding.path}: ${finding.message}`);
    }
  }
  lines.push("recommended commands:");
  for (const command of report.recommendedCommands) lines.push(`- ${command}`);
  return `${lines.join("\n")}\n`;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project-root") {
      parsed.projectRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--scope") {
      parsed.scope = argv[index + 1];
      index += 1;
    } else if (arg === "--format") {
      parsed.format = argv[index + 1];
      index += 1;
    } else if (arg === "--mode") {
      parsed.mode = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function safeReadText(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile() || fileStat.size > 2_000_000) return undefined;
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function toProjectRelative(projectRoot, filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join("/");
}

function displayPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function relative(filePath) {
  return filePath.split(path.sep).join("/");
}
