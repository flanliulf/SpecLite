import { access, lstat, mkdir, mkdtemp, readFile, readdir, readlink, rm, symlink, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { parse as parseToml } from "toml";
import { describe, expect, it } from "vitest";
import { runInstallCommand } from "../src/commands/install.js";
import { runUpdateCommand } from "../src/commands/update.js";
import { hashFile } from "../src/manifest/hash.js";
// @ts-expect-error The canonical private Skill script is intentionally outside the public TS build graph.
import {
  discoverPrdValidationReports,
  executePrdValidationReportOperation,
} from "../assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs";

const supportedRuntime = {
  nodeVersion: "v22.12.0",
  platform: "darwin",
  platformRelease: "23.0.0",
} as const;

const sourceRoot = path.join(
  process.cwd(),
  "assets/source/speclite/sdlc-skills/2-plan-workflows",
);
const validatePrdRoot = path.join(sourceRoot, "speclite-validate-prd");
const editPrdDiscoveryPath = path.join(
  sourceRoot,
  "speclite-edit-prd/references/steps/step-e-01-discovery.md",
);
const readinessDiscoveryPath = path.join(
  sourceRoot,
  "../3-solutioning/speclite-implementation-readiness-check/references/steps/step-01-document-discovery.md",
);
const correctCourseWorkflowPath = path.join(
  sourceRoot,
  "../4-implementation/speclite-correct-course/references/workflow-details.md",
);
const planningRoot = "_speclite-output/2-planning-artifacts";
const reportDate = "2026-07-21";
const reportPath = `${planningRoot}/prd/prd-validate-report-${reportDate}.md`;
const issueId = "artifact-path.prd-validation-report-exists";
const manualAction = "保留并移走或删除既有报告后重新运行";
const downstreamCandidateSafetyContract = "Before loading any canonical or legacy candidate, construct the logical Planning root and logical PRD owner from the portable project-relative resolver result; the logical PRD owner must be exactly `{planning_artifacts}/prd`. Require `realProject` to exist and be a directory. Require the logical Planning root to exist and resolve to a directory, then require `realPlanning` to be the same as or a descendant of `realProject`. Require the logical PRD owner to exist and pass a no-follow `lstat` as a directory or inspected entry, resolve it to the directory `realPrdOwner`, and require the normalized physical path of `realPrdOwner` to equal exactly `realPlanning/prd`; containment inside `realPlanning` alone is insufficient. Only then require the candidate to be a portable project-relative path, exist, have readable bytes, pass a no-follow `lstat` as a regular file and not a symlink, and have its `realpath` remain the same as or a descendant of `realPrdOwner`. Any failed owner-chain or candidate check, including a symlink, non-file, unreadable or missing candidate, external escape, or project-internal cross-space or redirect, must fail closed before content is loaded or parsed and record project-relative rejection evidence.";
const completeLegacyReportNames = [
  "validation-report-old.md",
  "prd-validation-report-2025-01-01.md",
  "prd-validation-old.md",
  "validate-prd-report-old.md",
  "prd-validation-report.md",
] as const;

describe("PRD validation report path contract", () => {
  it("creates only the exact dated canonical target and preserves legacy reports", async () => {
    const projectRoot = await createProject();
    const legacy = [
      "validation-report-2026-07-20.md",
      "prd-validation-report-2026-07-20.md",
      "prd-validation-2026-07-20.md",
      "validate-prd-report-2026-07-20.md",
      "prd-validation-report.md",
    ];
    try {
      for (const name of legacy) {
        await writeFile(path.join(projectRoot, planningRoot, "prd", name), `legacy:${name}\n`);
      }

      const outcome = await executePrdValidationReportOperation({
        projectRoot,
        planningRoot,
        invocationDate: reportDate,
        content: "# PRD Validation Report\n",
      });

      expect(outcome).toEqual({ ok: true, targetPath: reportPath, operation: "create-file" });
      await expect(readFile(path.join(projectRoot, reportPath), "utf8")).resolves.toBe(
        "# PRD Validation Report\n",
      );
      const entries = await readdir(path.join(projectRoot, planningRoot, "prd"));
      expect(entries.sort()).toEqual([...legacy, `prd-validate-report-${reportDate}.md`].sort());
      for (const name of legacy) {
        await expect(readFile(path.join(projectRoot, planningRoot, "prd", name), "utf8")).resolves.toBe(
          `legacy:${name}\n`,
        );
      }

      const observerLink = path.join(projectRoot, planningRoot, "prd", "discovery-observer-link.md");
      await symlink(legacy[0], observerLink);
      const beforeDiscovery = await captureNoFollowTreeSnapshot(
        path.join(projectRoot, planningRoot, "prd"),
      );
      const discovered = await discoverPrdValidationReports({ projectRoot, planningRoot });
      expect(discovered).toEqual({
        ok: true,
        canonicalReports: [reportPath],
        legacyReports: legacy.map((name) => `${planningRoot}/prd/${name}`).sort(),
      });
      await expect(captureNoFollowTreeSnapshot(
        path.join(projectRoot, planningRoot, "prd"),
      )).resolves.toEqual(beforeDiscovery);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("rejects non-canonical dates without creating a report", async () => {
    for (const invocationDate of ["2026-7-21", "26-07-21", "2026-02-30", "2026/07/21"]) {
      const projectRoot = await createProject();
      try {
        const outcome = await executePrdValidationReportOperation({
          projectRoot,
          planningRoot,
          invocationDate,
          content: "invalid date",
        });
        expect(outcome).toMatchObject({ ok: false, targetPath: null, reason: "invalid-invocation-date" });
        await expect(readdir(path.join(projectRoot, planningRoot, "prd"))).resolves.toEqual([]);
      } finally {
        await rm(projectRoot, { recursive: true, force: true });
      }
    }
  });

  it("blocks same-content and different-content existing targets before report or progress mutation", async () => {
    for (const existingContent of ["new report\n", "different report\n"]) {
      const projectRoot = await createProject();
      const target = path.join(projectRoot, reportPath);
      const progress = path.join(projectRoot, planningRoot, "prd", "validation-progress.json");
      try {
        await writeFile(target, existingContent);
        await writeFile(progress, '{"step":1}\n');
        const beforeEntries = await readdir(path.dirname(target));

        const outcome = await executePrdValidationReportOperation({
          projectRoot,
          planningRoot,
          invocationDate: reportDate,
          content: "new report\n",
        });

        expect(outcome).toEqual({
          ok: false,
          targetPath: reportPath,
          reason: "prd-validation-report-exists",
          issue: {
            issueId,
            category: "artifact-path",
            severity: "error",
            continuation: "block",
            affectedPath: reportPath,
            details: { reason: "prd-validation-report-exists" },
            impact: "同日 canonical PRD validation report 已存在，本次 validation 不能生成独立 evidence。",
            suggestedNextStep: manualAction,
          },
        });
        await expect(readFile(target, "utf8")).resolves.toBe(existingContent);
        await expect(readFile(progress, "utf8")).resolves.toBe('{"step":1}\n');
        await expect(readdir(path.dirname(target))).resolves.toEqual(beforeEntries);
        expect(beforeEntries.some((name) => name.includes(".tmp"))).toBe(false);
        expect(beforeEntries.filter((name) => name.startsWith(`prd-validate-report-${reportDate}`))).toEqual([
          `prd-validate-report-${reportDate}.md`,
        ]);
      } finally {
        await rm(projectRoot, { recursive: true, force: true });
      }
    }
  });

  it("rechecks the same canonical target at commit time and never falls back to a suffix", async () => {
    const projectRoot = await createProject();
    const target = path.join(projectRoot, reportPath);
    try {
      const outcome = await executePrdValidationReportOperation({
        projectRoot,
        planningRoot,
        invocationDate: reportDate,
        content: "new report\n",
        __testOnlyInterposeBeforeCommit: async () => {
          await writeFile(target, "racing report\n");
        },
      });
      expect(outcome).toMatchObject({
        ok: false,
        targetPath: reportPath,
        reason: "prd-validation-report-exists",
        issue: { issueId, suggestedNextStep: manualAction },
      });
      await expect(readFile(target, "utf8")).resolves.toBe("racing report\n");
      await expect(readdir(path.dirname(target))).resolves.toEqual([
        `prd-validate-report-${reportDate}.md`,
      ]);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it("keeps pre-existing validation reports byte-identical across install, update and repair", async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-prd-report-lifecycle-"));
    const names = [...completeLegacyReportNames, `prd-validate-report-${reportDate}.md`];
    expect(names.slice(0, -1)).toEqual(completeLegacyReportNames);
    const reportRelativePaths = names.map((name) => `${planningRoot}/prd/${name}`);
    try {
      await mkdir(path.join(projectRoot, planningRoot, "prd"), { recursive: true });
      for (const name of names) {
        const content = `protected:${name}\n`;
        await writeFile(path.join(projectRoot, planningRoot, "prd", name), content);
      }
      const beforeSnapshot = await captureReportSnapshot(projectRoot, names);

      const install = await runInstallCommand({
        options: { json: true, yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "prd-report-lifecycle" },
      });
      expect(install.exitCode).toBe(0);
      expect(install.result.status).toBe("success");
      expect(install.result.command).toBe("install");
      expect(install.installPlan?.writeAuthorized).toBe(true);
      const installPlannedReportPaths = intersectProtectedPaths(
        install.installPlan?.plannedWrites.map((write) => write.path) ?? [],
        reportRelativePaths,
      );
      const installIssueReportPaths = intersectProtectedPaths(
        install.result.issues.map((issue) => issue.affectedPath),
        reportRelativePaths,
      );
      expect(installPlannedReportPaths).toEqual([]);
      expect(installIssueReportPaths).toEqual([]);
      await assertReportSnapshot(projectRoot, names, beforeSnapshot);
      const canonicalScript = path.join(validatePrdRoot, "scripts/prd-validation-report-operation.mjs");
      const canonicalHash = await hashFile(canonicalScript);
      const filesIndex = JSON.parse(
        await readFile(path.join(projectRoot, "_speclite/_config/files-index.json"), "utf8"),
      ) as { entries: Array<{ path: string; hash: string; sourceRef: string; executable: boolean }> };
      for (const target of ["agents", "claude"]) {
        const installedPath = path.join(
          projectRoot,
          `.${target}/skills/speclite-validate-prd/scripts/prd-validation-report-operation.mjs`,
        );
        await expect(hashFile(installedPath)).resolves.toBe(canonicalHash);
        expect((await lstat(installedPath)).mode & 0o111).not.toBe(0);
        expect(filesIndex.entries).toContainEqual(expect.objectContaining({
          path: `.${target}/skills/speclite-validate-prd/scripts/prd-validation-report-operation.mjs`,
          hash: canonicalHash,
          sourceRef: "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/scripts/prd-validation-report-operation.mjs",
          executable: true,
        }));
        const probe = spawnSync(installedPath, [
          "probe",
          "--project-root",
          projectRoot,
          "--planning-root",
          planningRoot,
          "--date",
          reportDate,
        ], { encoding: "utf8" });
        expect(probe.status).toBe(1);
        expect(probe.stderr).toBe("");
        expect(probe.stdout.trim().split("\n")).toHaveLength(1);
        expect(JSON.parse(probe.stdout)).toMatchObject({
          ok: false,
          targetPath: reportPath,
          issue: { issueId, suggestedNextStep: manualAction },
        });
      }

      const update = await runUpdateCommand({
        options: { yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "prd-report-lifecycle" },
      });
      expect(update.exitCode).toBe(0);
      expect(update.result.status).toBe("success");
      expect(update.result.command).toBe("update");
      expect(update.result.data.writeAuthorized).toBe(true);
      const updateChangedReportPaths = intersectProtectedPaths(
        update.result.data.changedPaths,
        reportRelativePaths,
      );
      const updateConflictReportPaths = intersectProtectedPaths(
        update.result.data.conflicts.map((conflict) => conflict.affectedPath),
        reportRelativePaths,
      );
      expect(updateChangedReportPaths).toEqual([]);
      expect(updateConflictReportPaths).toEqual([]);
      await assertReportSnapshot(projectRoot, names, beforeSnapshot);

      const repairableMirrorPath = path.join(
        projectRoot,
        ".agents/skills/speclite-validate-prd/scripts/prd-validation-report-operation.mjs",
      );
      await rm(repairableMirrorPath);

      const repair = await runUpdateCommand({
        options: { repair: true, yes: true },
        runtime: { ...supportedRuntime, cwd: projectRoot, targetProject: "prd-report-lifecycle" },
      });
      expect(repair.exitCode).toBe(0);
      expect(repair.result.status).toBe("success");
      expect(repair.result.command).toBe("update.repair");
      expect(repair.result.data.writeAuthorized).toBe(true);
      expect(repair.result.data.changedPaths).toContain(
        ".agents/skills/speclite-validate-prd/scripts/prd-validation-report-operation.mjs",
      );
      await expect(hashFile(repairableMirrorPath)).resolves.toBe(canonicalHash);
      const repairChangedReportPaths = intersectProtectedPaths(
        repair.result.data.changedPaths,
        reportRelativePaths,
      );
      const repairConflictReportPaths = intersectProtectedPaths(
        repair.result.data.conflicts.map((conflict) => conflict.affectedPath),
        reportRelativePaths,
      );
      expect(repairChangedReportPaths).toEqual([]);
      expect(repairConflictReportPaths).toEqual([]);
      await assertReportSnapshot(projectRoot, names, beforeSnapshot);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("uses one invocation date across filename, initial metadata/body and final metadata after midnight", async () => {
    const activationClockDate = "2026-07-21";
    const afterMidnightClockDate = "2026-07-22";
    const [workflow, discovery, completion] = await Promise.all([
      readFile(path.join(validatePrdRoot, "references/workflow-details.md"), "utf8"),
      readFile(path.join(validatePrdRoot, "references/steps/step-v-01-discovery.md"), "utf8"),
      readFile(path.join(validatePrdRoot, "references/steps/step-v-13-report-complete.md"), "utf8"),
    ]);

    expect(workflow).toContain("store it as `{validationInvocationDate}` for the whole invocation");
    expect(discovery).not.toContain("{current_date}");
    expect(completion).not.toContain("{current_date}");
    expect(discovery).toContain("validationDate: '{validationInvocationDate}'");
    expect(discovery).toContain("**Validation Date:** {validationInvocationDate}");
    expect(completion).toContain("validationDate: '{validationInvocationDate}'");

    const renderAfterMidnight = (content: string) => content
      .replaceAll("{validationInvocationDate}", activationClockDate)
      .replaceAll("{current_date}", afterMidnightClockDate);
    const renderedDiscovery = renderAfterMidnight(discovery);
    const renderedCompletion = renderAfterMidnight(completion);
    expect(`prd-validate-report-${activationClockDate}.md`).toBe("prd-validate-report-2026-07-21.md");
    expect(renderedDiscovery).toContain('--date "2026-07-21"');
    expect(renderedDiscovery).toContain("validationDate: '2026-07-21'");
    expect(renderedDiscovery).toContain("**Validation Date:** 2026-07-21");
    expect(renderedCompletion).toContain("validationDate: '2026-07-21'");
    expect(renderedCompletion).toContain("**Validation Report Saved:** {validationReportPath}");
    expect(`${renderedDiscovery}\n${renderedCompletion}`).not.toContain(afterMidnightClockDate);
  });

  it("keeps every active producer, consumer, help, contract and example surface classified", async () => {
    const stepNames = (await readdir(path.join(validatePrdRoot, "references/steps")))
      .filter((name) => name.endsWith(".md"))
      .sort();
    const inventory = [
      ...["SKILL.md", "SKILL.en.md", "references/workflow-details.md"].map((relativePath) => ({
        relativePath: `validate-prd/${relativePath}`,
        absolutePath: path.join(validatePrdRoot, relativePath),
      })),
      ...stepNames.map((name) => ({
        relativePath: `validate-prd/references/steps/${name}`,
        absolutePath: path.join(validatePrdRoot, "references/steps", name),
      })),
      { relativePath: "validate-prd/customize.toml", absolutePath: path.join(validatePrdRoot, "customize.toml") },
      { relativePath: "validate-prd/config.toml.example", absolutePath: path.join(validatePrdRoot, "config.toml.example") },
      { relativePath: "validate-prd/scripts/prd-validation-report-operation.mjs", absolutePath: path.join(validatePrdRoot, "scripts/prd-validation-report-operation.mjs") },
      { relativePath: "module-help.csv", absolutePath: path.join(process.cwd(), "assets/source/speclite/sdlc-skills/module-help.csv") },
      { relativePath: "docs/reference/skills/sdlc-workflows.md", absolutePath: path.join(process.cwd(), "docs/reference/skills/sdlc-workflows.md") },
      { relativePath: "docs/reference/workflow-artifact-layout.md", absolutePath: path.join(process.cwd(), "docs/reference/workflow-artifact-layout.md") },
      { relativePath: "SPEC-07-zh", absolutePath: path.join(process.cwd(), "_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md") },
      { relativePath: "SPEC-07-en", absolutePath: path.join(process.cwd(), "_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.en.md") },
      { relativePath: "fixture-derived-examples.md", absolutePath: path.join(process.cwd(), "assets/source/speclite/docs/examples/fixture-derived-examples.md") },
      { relativePath: "edit-prd/step-e-01-discovery.md", absolutePath: editPrdDiscoveryPath },
      { relativePath: "implementation-readiness/step-01-document-discovery.md", absolutePath: readinessDiscoveryPath },
      { relativePath: "correct-course/workflow-details.md", absolutePath: correctCourseWorkflowPath },
    ];
    const contents = new Map(
      await Promise.all(inventory.map(async ({ relativePath, absolutePath }) => [relativePath, await readFile(absolutePath, "utf8")] as const)),
    );
    expect([...contents.keys()]).toEqual(expect.arrayContaining([
      "validate-prd/customize.toml",
      "validate-prd/config.toml.example",
      "validate-prd/scripts/prd-validation-report-operation.mjs",
    ]));
    const canonicalContractFiles = [
      "validate-prd/SKILL.md",
      "validate-prd/SKILL.en.md",
      "validate-prd/references/workflow-details.md",
      "validate-prd/references/steps/step-v-01-discovery.md",
      "validate-prd/references/steps/step-v-13-report-complete.md",
      "module-help.csv",
      "docs/reference/skills/sdlc-workflows.md",
      "docs/reference/workflow-artifact-layout.md",
      "SPEC-07-zh",
      "SPEC-07-en",
      "edit-prd/step-e-01-discovery.md",
      "implementation-readiness/step-01-document-discovery.md",
      "correct-course/workflow-details.md",
    ];
    for (const relativePath of canonicalContractFiles) {
      expect(contents.get(relativePath), relativePath).toContain("prd-validate-report-{yyyy-MM-dd}.md");
    }
    expect(contents.get("fixture-derived-examples.md")).toContain("prd-validate-report-2026-07-21.md");
    expect(contents.get("validate-prd/SKILL.md")).toContain("name: speclite-validate-prd");
    expect(contents.get("validate-prd/SKILL.en.md")).toContain("name: speclite-validate-prd");
    expect(contents.get("validate-prd/references/steps/step-v-01-discovery.md")).toContain("scripts/prd-validation-report-operation.mjs");
    expect(contents.get("validate-prd/references/steps/step-v-13-report-complete.md")).toContain("{validationReportPath}");
    expect(contents.get("SPEC-07-zh")).toContain(issueId);
    expect(contents.get("SPEC-07-en")).toContain(issueId);
    expect(contents.get("SPEC-07-zh")).toContain(manualAction);

    const customizationContract = contents.get("validate-prd/customize.toml") ?? "";
    expect(customizationContract).toContain("{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md");
    expect(customizationContract).toContain("Step 13");
    expect(customizationContract).toMatch(/^on_complete = ""$/m);
    expect(customizationContract).not.toMatch(/(?:report|filename|path)[_-]?(?:override|fallback)/i);

    const configReference = contents.get("validate-prd/config.toml.example") ?? "";
    expect(configReference).toContain("field-structure reference only and must not be used as runtime fallback");
    expect(extractManagedBasenameTokens(configReference)).toEqual([]);
    const configAssignmentKeys = extractTomlAssignmentKeys(configReference);
    expect(configAssignmentKeys.filter(isReportTargetOverrideKey)).toEqual([]);
    for (const forbiddenKey of [
      "report",
      "report_path",
      "report_filename",
      "validation_report_target",
      "filename",
      "path_override",
      "workflow.prd_report_filepath",
      "reportPath",
      "reportFilename",
      "validationReportTarget",
      "validation_report",
      "prd_report",
      "report_name",
      "report_output",
      "report_destination",
      "report_directory",
      "prd_report_location",
      "validationReport",
      "prdReportOutput",
      "workflow.prdReportDestination",
      "report_dir",
      "report_folder",
    ]) expect(isReportTargetOverrideKey(forbiddenKey), forbiddenKey).toBe(true);
    for (const configMutant of [
      '[report]\npath = "arbitrary.md"',
      '[validation.report]\noutput = "arbitrary.md"',
      '"workflow"."report_name" = "arbitrary.md"',
      'workflow . report_name = "arbitrary.md"',
      'report_dir = "arbitrary.md"',
      'report_folder = "arbitrary.md"',
    ]) {
      expect(
        extractTomlAssignmentKeys(configMutant).filter(isReportTargetOverrideKey),
        configMutant,
      ).not.toEqual([]);
    }
    for (const allowedKey of ["output_folder", "planning_artifacts", "implementation_artifacts"]) {
      expect(isReportTargetOverrideKey(allowedKey), allowedKey).toBe(false);
    }

    const privateProducer = contents.get("validate-prd/scripts/prd-validation-report-operation.mjs") ?? "";
    expect(extractStringConstant(privateProducer, "REPORT_PREFIX")).toBe("prd-validate-report-");
    expect(extractLegacyPatternsDeclaration(privateProducer)).toBe([
      "const LEGACY_PATTERNS = [",
      "  /^validation-report-.+\\.md$/i,",
      "  /^prd-validation-report(?:-.+)?\\.md$/i,",
      "  /^prd-validation-(?!report-).+\\.md$/i,",
      "  /^validate-prd-report-.+\\.md$/i,",
      "];",
    ].join("\n"));
    expect(privateProducer).toContain("if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;");
    expect(privateProducer).toContain("date.getUTCFullYear() === year");
    const createSection = sliceBetween(
      privateProducer,
      "export async function executePrdValidationReportOperation",
      "/** Read-only early gate",
    );
    expect(createSection).toContain('await writeFile(commitState.absolutePath, input.content, { flag: "wx" });');
    expect(createSection.match(/writeFile\(/g)).toHaveLength(1);
    const discoverySection = sliceBetween(
      privateProducer,
      "export async function discoverPrdValidationReports",
      "async function inspectTarget",
    );
    expect(discoverySection).toContain("else if (LEGACY_PATTERNS.some((pattern) => pattern.test(entry.name))) legacyReports.push(relativePath);");
    expect(discoverySection.match(/LEGACY_PATTERNS/g)).toHaveLength(1);
    expect(discoverySection).not.toContain("writeFile(");
    const producerTargetSection = privateProducer.slice(
      privateProducer.indexOf("async function inspectTarget"),
      privateProducer.indexOf("async function resolveRoots"),
    );
    expect(producerTargetSection).toContain('const basename = `${REPORT_PREFIX}${input.invocationDate}.md`;');
    expect(producerTargetSection.match(/REPORT_PREFIX/g)).toHaveLength(1);
    expect(producerTargetSection).not.toContain("LEGACY_PATTERNS");
    expect(producerTargetSection).not.toMatch(/(?:copy|counter|suffix)/i);
    expect(privateProducer.match(/\bREPORT_PREFIX\b/g)).toHaveLength(2);
    expect(privateProducer.match(/\bLEGACY_PATTERNS\b/g)).toHaveLength(2);
    const mutationPrimitives = [
      "appendFile", "copyFile", "cp", "rename", "rm", "rmdir", "unlink", "truncate",
      "mkdir", "link", "symlink", "open", "createWriteStream", "writeFile",
    ];
    expect(extractFsPromiseBindings(privateProducer).filter((binding) =>
      mutationPrimitives.includes(binding.original)
    )).toEqual([{ original: "writeFile", local: "writeFile" }]);
    const aliasedWriterMutant = `${privateProducer}\nimport { writeFile as emitReport } from "node:fs/promises";\nasync function emitAdditionalReport(target, content) { await emitReport(target, content); }\n`;
    const multilineAliasedWriterMutant = `${privateProducer}\nimport {\n  writeFile as emitReport\n} from "node:fs/promises";\nasync function emitAdditionalReport(target, content) { await emitReport(target, content); }\n`;
    const syncWriterMutant = `${privateProducer}\nimport { writeFileSync as emitReportSync } from "node:fs";\nfunction emitAdditionalReport(target, content) { emitReportSync(target, content); }\n`;
    expect(extractFsPromiseBindings(aliasedWriterMutant).filter((binding) =>
      mutationPrimitives.includes(binding.original)
    )).toEqual([
      { original: "writeFile", local: "emitReport" },
      { original: "writeFile", local: "writeFile" },
    ]);
    expect(extractFsPromiseBindings(multilineAliasedWriterMutant).filter((binding) =>
      mutationPrimitives.includes(binding.original)
    )).toEqual([
      { original: "writeFile", local: "emitReport" },
      { original: "writeFile", local: "writeFile" },
    ]);
    expect(hasOnlyAuthorizedReportWriter(privateProducer, mutationPrimitives)).toBe(true);
    expect(hasOnlyAuthorizedReportWriter(aliasedWriterMutant, mutationPrimitives)).toBe(false);
    expect(hasOnlyAuthorizedReportWriter(multilineAliasedWriterMutant, mutationPrimitives), "multiline named fs import").toBe(false);
    expect(hasOnlyAuthorizedReportWriter(syncWriterMutant, mutationPrimitives), "unapproved fs original binding").toBe(false);
    expect(() => extractFsPromiseBindings(syncWriterMutant)).toThrow(
      "private producer must reject unapproved node:fs binding writeFileSync",
    );
    for (const unsupportedFsImport of [
      privateProducer.concat('\nimport * as fsPromises from "node:fs/promises";\n'),
      privateProducer.concat('\nimport fsPromises from "node:fs/promises";\n'),
      privateProducer.concat('\nconst fsPromises = await import("node:fs/promises");\n'),
    ]) expect(() => extractFsPromiseBindings(unsupportedFsImport)).toThrow();
    const mutationBindings = extractFsPromiseBindings(privateProducer).filter((binding) =>
      mutationPrimitives.includes(binding.original)
    );
    expect(findFunctionCalls(privateProducer, mutationBindings.map((binding) => binding.local))).toEqual(["writeFile"]);
    expect(findFunctionCalls(aliasedWriterMutant, extractFsPromiseBindings(aliasedWriterMutant)
      .filter((binding) => mutationPrimitives.includes(binding.original))
      .map((binding) => binding.local))).toEqual(["emitReport", "writeFile"]);
    expect(privateProducer.match(/\bwriteFile\s*\(/g)).toHaveLength(1);
    expect(findFunctionCalls(discoverySection, [
      ...mutationPrimitives,
      "executePrdValidationReportOperation",
      "inspectPrdValidationReportTarget",
      "inspectTarget",
    ])).toEqual([]);
    expect(findDiscoveryReachableMutations(privateProducer, mutationPrimitives)).toEqual([]);
    const indirectDiscoveryMutant = privateProducer
      .replace(
        "  const canonicalReports = [];",
        "  if (entries.length < 0) await mutateDuringDiscovery(input);\n  const canonicalReports = [];",
      )
      .concat("\nasync function mutateDuringDiscovery(input) { await executePrdValidationReportOperation(input); }\n");
    expect(findDiscoveryReachableMutations(indirectDiscoveryMutant, mutationPrimitives)).toEqual([
      "executePrdValidationReportOperation",
      "inspectTarget",
      "writeFile",
    ]);
    const indentedIndirectDiscoveryMutant = privateProducer
      .replace(
        "  const canonicalReports = [];",
        "  if (entries.length < 0) await mutateDuringDiscovery(input);\n  const canonicalReports = [];",
      )
      .concat("\n  async function mutateDuringDiscovery(input) { await executePrdValidationReportOperation(input); }\n");
    expect(findDiscoveryReachableMutations(indentedIndirectDiscoveryMutant, mutationPrimitives), "leading-whitespace local declaration").toEqual([
      "executePrdValidationReportOperation",
      "inspectTarget",
      "writeFile",
    ]);
    const nestedIndirectDiscoveryMutant = privateProducer.replace(
      "  const canonicalReports = [];",
      "  async function mutateDuringDiscovery(input) { await executePrdValidationReportOperation(input); }\n  await mutateDuringDiscovery(input);\n  const canonicalReports = [];",
    );
    expect(findDiscoveryReachableMutations(nestedIndirectDiscoveryMutant, mutationPrimitives), "nested declaration with declaration-after direct call").toEqual([
      "executePrdValidationReportOperation",
      "inspectTarget",
      "writeFile",
    ]);
    const privateProducerWithoutAuthorizedRoles = removeExactRoleFragments(
      privateProducer,
      [
        { clause: 'const REPORT_PREFIX = "prd-validate-report-";', occurrences: 1 },
        { clause: extractLegacyPatternsDeclaration(privateProducer), occurrences: 1 },
        { clause: 'const REPORT_EXISTS_ISSUE_ID = "artifact-path.prd-validation-report-exists";', occurrences: 1 },
        { clause: 'reason: "prd-validation-report-exists",', occurrences: 1 },
        { clause: 'details: { reason: "prd-validation-report-exists" },', occurrences: 1 },
      ],
      "validate-prd/scripts/prd-validation-report-operation.mjs",
    );
    expect(extractManagedBasenameTokens(privateProducerWithoutAuthorizedRoles)).toEqual([]);

    const legacyAllowlist = new Map<string, string[]>([
      ["edit-prd/step-e-01-discovery.md", ["- Legacy historical discovery must also recognize existing `validation-report-*.md`, `prd-validation-report-*.md`, `prd-validation-*.md`, `validate-prd-report-*.md`, and undated `prd-validation-report.md` files."]],
      ["implementation-readiness/step-01-document-discovery.md", ["- Legacy historical discovery also inventories existing `validation-report-*.md`, `prd-validation-report-*.md`, `prd-validation-*.md`, `validate-prd-report-*.md`, and undated `prd-validation-report.md` in place."]],
      ["correct-course/workflow-details.md", ["For PRD validation evidence, enumerate `{planning_artifacts}/prd/` read-only. Recognize canonical historical `prd-validate-report-{yyyy-MM-dd}.md` with a valid calendar date and legacy historical `validation-report-*.md`, `prd-validation-report-*.md`, `prd-validation-*.md`, `validate-prd-report-*.md`, or undated `prd-validation-report.md`. Load only reports relevant to the change trigger, record project-relative consumed paths, and preserve every report in place; never rename, migrate, overwrite, delete, or reuse a legacy basename as a producer default."]],
    ]);
    const supportReferenceAllowlist = new Map<string, Array<{ clause: string; occurrences: number }>>([
      ["validate-prd/SKILL.md", [{ clause: "- **唯一 dated report 契约**：每次 invocation 只生成一次 `yyyy-MM-dd` 并锁定 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`；通过 private `scripts/prd-validation-report-operation.mjs` 执行 exclusive create，target 已存在时使用 `artifact-path.prd-validation-report-exists` read-only block，不生成 suffix/temp 且不推进 progress。", occurrences: 1 }]],
      ["validate-prd/SKILL.en.md", [{ clause: "- **Single dated report contract**: generate `yyyy-MM-dd` exactly once per invocation and lock `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`; private `scripts/prd-validation-report-operation.mjs` performs exclusive create, and an existing target read-only blocks with `artifact-path.prd-validation-report-exists` without suffix/temp output or progress mutation.", occurrences: 1 }]],
      ["validate-prd/references/workflow-details.md", [
        { clause: "- Before any report, progress, temporary, or suffix write, Step 1 must use private `scripts/prd-validation-report-operation.mjs` to perform the exclusive first write. Report content is supplied on stdin; stdout must be exactly one JSON object. A non-zero exit, invalid JSON, or `ok !== true` HALTs without progress mutation.", occurrences: 1 },
        { clause: '- If the target exists, the private operation returns `artifact-path.prd-validation-report-exists`, the exact project-relative `affectedPath`, `reason: "prd-validation-report-exists"`, and `suggestedNextStep: "保留并移走或删除既有报告后重新运行"`. Matching content is not reusable evidence. Never overwrite, append, truncate, delete, or create a suffix/temp report.', occurrences: 1 },
      ]],
      ["validate-prd/references/steps/step-v-01-discovery.md", [
        { clause: "reportOperation: '../../scripts/prd-validation-report-operation.mjs'", occurrences: 1 },
        { clause: "node \"{skill-root}/scripts/prd-validation-report-operation.mjs\" probe --project-root \"{project-root}\" --planning-root \"{planning_artifacts}\" --date \"{validationInvocationDate}\"", occurrences: 1 },
        { clause: "node \"{skill-root}/scripts/prd-validation-report-operation.mjs\" create --project-root \"{project-root}\" --planning-root \"{planning_artifacts}\" --date \"{validationInvocationDate}\"", occurrences: 1 },
        { clause: '`{planning_artifacts}` 必须传入 resolver 返回的 project-relative Planning root，不得传 absolute path 或 unresolved token。stdout 必须恰为一个 JSON object；non-zero、invalid JSON 或 `ok !== true` 必须 HALT。当 target 已存在时，必须输出 `artifact-path.prd-validation-report-exists`、exact project-relative `affectedPath`、`reason: "prd-validation-report-exists"` 和精确建议“保留并移走或删除既有报告后重新运行”。无论既有内容相同或不同，都不得 reuse、overwrite、append、truncate、delete、生成 suffix/temp report 或更新 progress。', occurrences: 1 },
      ]],
      ["docs/reference/skills/sdlc-workflows.md", [{ clause: "| `speclite-validate-prd` | Workflow | `VP` | `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` | 通过 shared whole/sharded resolver 校验 PRD；invocation date 只生成一次并锁定 exact target。Private `scripts/prd-validation-report-operation.mjs` 在 report/progress write 前 probe 并以 `wx` exclusive create；target 已存在时使用 `artifact-path.prd-validation-report-exists` read-only block，给出“保留并移走或删除既有报告后重新运行”，不 overwrite/reuse/suffix/temp/progress mutation。Legacy report 仅原位 historical discovery，install/update/repair 不迁移。 |", occurrences: 1 }]],
      ["docs/reference/workflow-artifact-layout.md", [{ clause: "| `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` | `speclite-validate-prd` | 每次 invocation 仅生成一次标准日期并锁定 exact path。Private `scripts/prd-validation-report-operation.mjs` 在任何 report/progress/temp/suffix write 前做 read-only probe，并在 commit-time 重验后以 `wx` 创建。Existing target 使用 `artifact-path.prd-validation-report-exists` 阻断，无论内容相同与否都不 overwrite、append、truncate、delete、reuse 或 suffix，不更新 progress；人工处置为“保留并移走或删除既有报告后重新运行”。Legacy names 仅原位 historical discovery，install/update/repair 不迁移。 |", occurrences: 1 }]],
      ["fixture-derived-examples.md", [{ clause: "Source fixture: `test/prd-validation-report-path.test.ts`.", occurrences: 1 }]],
      ["SPEC-07-zh", [{ clause: '`artifact-path.prd-validation-report-exists` 用于 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` 在本次 PRD validation 首次 report/progress write 前已存在的同日冲突。Severity 必须为 `error`，continuation 必须为 `block`，`affectedPath` 必须是该 exact project-relative target，details 必须使用 `reason: "prd-validation-report-exists"`，`suggestedNextStep` 必须精确为“保留并移走或删除既有报告后重新运行”。Producer 不得读取内容后复用、overwrite、append、truncate、delete、产生 suffix/temp report 或更新 progress；即使内容看似相同也必须阻断。', occurrences: 1 }]],
      ["SPEC-07-en", [{ clause: '`artifact-path.prd-validation-report-exists` is the blocking issue for an existing same-day `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md` before the first PRD validation report or progress write. Severity is `error`, continuation is `block`, `affectedPath` is the exact project-relative target, details use `reason: "prd-validation-report-exists"`, and `suggestedNextStep` is exactly `保留并移走或删除既有报告后重新运行`. The producer must not reuse matching content, overwrite, append, truncate, delete, create suffix/temp reports, or mutate progress.', occurrences: 1 }]],
      ["module-help.csv", [
        {
          clause: '"Writes the exact dated prd-validate-report-{yyyy-MM-dd}.md and blocks an existing same-day target without suffix or overwrite."',
          occurrences: 1,
        },
      ]],
    ]);
    const skillZh = contents.get("validate-prd/SKILL.md") ?? "";
    const supportReferenceClause = "- **唯一 dated report 契约**：每次 invocation 只生成一次 `yyyy-MM-dd` 并锁定 `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`；通过 private `scripts/prd-validation-report-operation.mjs` 执行 exclusive create，target 已存在时使用 `artifact-path.prd-validation-report-exists` read-only block，不生成 suffix/temp 且不推进 progress。";
    const roleSwapMutant = skillZh.replace(
      supportReferenceClause,
      "- **默认 report filename**：通过 private `scripts/prd-validation-report-operation.mjs` 执行 exclusive create。",
    );
    expect(() => removeExactRoleFragments(
      roleSwapMutant,
      supportReferenceAllowlist.get("validate-prd/SKILL.md") ?? [],
      "validate-prd/SKILL.md role-swap mutant",
    )).toThrow(
      "validate-prd/SKILL.md role-swap mutant: exact role clause count",
    );
    for (const [relativePath, content] of contents) {
      let activeContent = content;
      for (const clause of legacyAllowlist.get(relativePath) ?? []) {
        expect(activeContent, `${relativePath}: missing exact legacy allowlist clause`).toContain(clause);
        activeContent = activeContent.replace(clause, "");
      }
      activeContent = removeExactRoleFragments(
        activeContent,
        supportReferenceAllowlist.get(relativePath) ?? [],
        relativePath,
      );
      if (relativePath === "validate-prd/scripts/prd-validation-report-operation.mjs") {
        continue;
      }
      for (const token of extractManagedBasenameTokens(activeContent)) {
        expect(isAllowedCanonicalBasename(token), `${relativePath}: unexpected managed basename ${token}`).toBe(true);
      }
    }

    for (const adversarial of [
      "prd-validate-report-{yyyy-MM-dd}-备份.md",
      "prd-validate-report-{yyyy-MM-dd}-backup copy.md",
      "prd-validate-report-{yyyy-MM-dd}-(copy).md",
      "prd-validate-report-${date}.md",
      "prd-validate-report-{yyyy-MM-dd}.md.bak",
      "prd-validate-report-{yyyy-MM-dd}.md-1",
      "prd-validate-report.md",
      "prd-validation-report-旧.md",
      "validation-report-旧.md",
    ]) {
      expect(extractManagedBasenameTokens(`value = "${adversarial}"`), adversarial).toEqual([adversarial]);
      expect(isAllowedCanonicalBasename(adversarial), adversarial).toBe(false);
    }
    expect(
      extractManagedBasenameTokens("{prd-validation-report-old.md}"),
      "brace-wrapped managed basename",
    ).toEqual(["prd-validation-report-old.md}"]);
    for (const framedAdversarial of [
      "prd-validate-report-{yyyy-MM-dd}.md backup",
      "prd-validate-report-{yyyy-MM-dd}.md,backup",
      "prd-validate-report-{yyyy-MM-dd}.md;backup",
      "prd-validate-report-{yyyy-MM-dd}.md|backup",
      "prd-validate-report-{yyyy-MM-dd}.md（备份）",
      "prd-validate-report-{yyyy-MM-dd}",
      "prefix prd-validate-report-{yyyy-MM-dd}.md backup",
      "prefix prd-validate-report-{yyyy-MM-dd}.md and prd-validation-report-old.md",
    ]) {
      const expectedCandidate = framedAdversarial.startsWith("prefix ")
        ? framedAdversarial.slice("prefix ".length)
        : framedAdversarial;
      expect(
        extractManagedBasenameTokens(`value = "${framedAdversarial}"`),
        `framed:${framedAdversarial}`,
      ).toEqual([expectedCandidate]);
      expect(isAllowedCanonicalBasename(expectedCandidate), expectedCandidate).toBe(false);
    }
    expect(extractManagedBasenameTokens("REPORT=prd-validation-report-old.md")).toEqual([
      "prd-validation-report-old.md",
    ]);
    expect(extractManagedBasenameTokens("url?report=prd-validation-report-old.md")).toEqual([
      "prd-validation-report-old.md",
    ]);
    for (const delimited of [
      "items=ok,prd-validation-report-old.md",
      "old;prd-validation-report-old.md",
      "old|prd-validation-report-old.md",
      "url?prd-validation-report-old.md",
      "x=1&prd-validation-report-old.md",
    ]) {
      expect(extractManagedBasenameTokens(delimited), delimited).toEqual([
        "prd-validation-report-old.md",
      ]);
    }
    expect(extractManagedBasenameTokens("xprd-validation-report-old.md")).toEqual([]);
    expect(extractManagedBasenameTokens('report filename = "prd-validation-report-path.test.ts"')).toEqual([
      "prd-validation-report-path.test.ts",
    ]);
    expect(isAllowedCanonicalBasename("prd-validate-report-{yyyy-MM-dd}.md")).toBe(true);
    expect(isAllowedCanonicalBasename("prd-validate-report-2026-07-21.md")).toBe(true);
    expect(isAllowedCanonicalBasename("prd-validate-report-2026-02-30.md")).toBe(false);
  });

  it("binds every active validation step to the invocation-locked report path", async () => {
    const stepNames = (await readdir(path.join(validatePrdRoot, "references/steps")))
      .filter((name) => /^step-v-(?:02|02b|0[3-9]|1[0-3])-.+\.md$/.test(name));
    expect(stepNames).toHaveLength(13);
    const contents: string[] = [];
    for (const name of stepNames) {
      const content = await readFile(path.join(validatePrdRoot, "references/steps", name), "utf8");
      contents.push(content);
      const binding = content.match(/^validationReportPath: '([^']+)'$/m);
      expect(binding?.[0], name).toBe("validationReportPath: '{validationReportPath}'");
      expect(binding?.[1], name).toBe("{validationReportPath}");
      expect(content, name).not.toContain("{validation_report_path}");
      expect(content, name).not.toContain("{current_date}");
      expect(content, name).not.toMatch(/\b(?:Date\.now|new Date)\s*\(/);
    }
    const activePackageContents = await readTextSurfaceTree(validatePrdRoot);
    expect(activePackageContents).not.toContain("{validation_report_path}");
    expect(contents.join("\n").match(/validationReportPath: '\{validationReportPath\}'/g)).toHaveLength(13);
  });

  it("binds all downstream consumers to one fail-closed physical PRD-owner contract", async () => {
    for (const candidatePath of [editPrdDiscoveryPath, readinessDiscoveryPath, correctCourseWorkflowPath]) {
      const content = await readFile(candidatePath, "utf8");
      expect(content).toContain(downstreamCandidateSafetyContract);
      for (const required of [
        "portable project-relative path",
        "no-follow `lstat`",
        "regular file and not a symlink",
        "`realProject` to exist and be a directory",
        "`realPlanning` to be the same as or a descendant of `realProject`",
        "normalized physical path of `realPrdOwner` to equal exactly `realPlanning/prd`",
        "containment inside `realPlanning` alone is insufficient",
        "candidate",
        "its `realpath` remain the same as or a descendant of `realPrdOwner`",
        "non-file",
        "unreadable or missing",
        "external escape",
        "project-internal cross-space or redirect",
        "fail closed before content is loaded or parsed",
        "project-relative rejection evidence",
      ]) expect(content, `${candidatePath}: ${required}`).toContain(required);
    }

    const normal = {
      realProject: "/project",
      realPlanning: "/project/planning",
      realPrdOwner: "/project/planning/prd",
      candidate: "/project/planning/prd/prd-validate-report-2026-07-21.md",
    };
    expect(hasQualifiedPhysicalOwnerChain(normal)).toBe(true);
    for (const rejected of [
      { ...normal, realPlanning: "/external/planning", realPrdOwner: "/external/planning/prd", candidate: "/external/planning/prd/report.md" },
      { ...normal, realPrdOwner: "/external/prd", candidate: "/external/prd/report.md" },
      { ...normal, realPrdOwner: "/project/architecture", candidate: "/project/architecture/report.md" },
      { ...normal, candidate: "/external/report.md" },
      { ...normal, candidate: "/project/architecture/report.md" },
    ]) expect(hasQualifiedPhysicalOwnerChain(rejected), JSON.stringify(rejected)).toBe(false);
  });

  it("inventories every same-basename entry by location and no-follow type", async () => {
    const projectRoot = await createProject();
    const name = `prd-validate-report-${reportDate}.md`;
    try {
      await mkdir(path.join(projectRoot, "outside-symlink"), { recursive: true });
      await mkdir(path.join(projectRoot, "outside-directory", name), { recursive: true });
      await mkdir(path.join(projectRoot, "outside-other"), { recursive: true });
      await symlink(
        path.join(projectRoot, planningRoot, "prd", name),
        path.join(projectRoot, "outside-symlink", name),
      );
      const fifoPath = path.join(projectRoot, "outside-other", name);
      const mkfifo = spawnSync("mkfifo", [fifoPath], { encoding: "utf8" });
      expect(mkfifo.status, mkfifo.stderr).toBe(0);

      expect(await findNamedEntries(projectRoot, new Set([name]))).toEqual([
        { location: `outside-directory/${name}`, type: "directory" },
        { location: `outside-other/${name}`, type: "other" },
        { location: `outside-symlink/${name}`, type: "symlink" },
      ]);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});

function isAllowedCanonicalBasename(value: string): boolean {
  if (value === "prd-validate-report-{yyyy-MM-dd}.md") return true;
  const match = /^prd-validate-report-(\d{4}-\d{2}-\d{2})\.md$/.exec(value);
  if (match === null) return false;
  const [year, month, day] = match[1].split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function extractManagedBasenameTokens(content: string): string[] {
  const framedValues: string[] = [];
  const unframed = content
    .replace(/`([^`\r\n]+)`/g, (_match, value: string) => {
      framedValues.push(value);
      return " ";
    })
    .replace(/(["'])([^"'\r\n]+)\1/g, (_match, _quote: string, value: string) => {
      framedValues.push(value);
      return " ";
    });
  return [
    ...framedValues.flatMap(extractManagedBasenameFromFramedValue),
    ...unframed.split(/\r?\n/).flatMap(extractManagedBasenamesFromValue),
  ];
}

const managedBasenamePrefixes = [
  "prd-validate-report",
  "prd-validation-report",
  "prd-validation-",
  "validate-prd-report",
  "validation-report",
] as const;

function extractManagedBasenameFromFramedValue(value: string): string[] {
  const match = findNextManagedPrefix(value, 0);
  if (match === null) return [];
  return [value.slice(match.index)];
}

function extractManagedBasenamesFromValue(value: string): string[] {
  const tokens: string[] = [];
  let cursor = 0;
  while (cursor < value.length) {
    const match = findNextManagedPrefix(value, cursor);
    if (match === null) break;
    let end = match.index + match.prefix.length;
    while (end < value.length) {
      if (value.startsWith("{yyyy-MM-dd}", end)) {
        end += "{yyyy-MM-dd}".length;
        continue;
      }
      if (isUnframedBoundary(value[end])) break;
      end += 1;
    }
    const candidate = value.slice(match.index, end);
    tokens.push(candidate);
    cursor = end;
  }
  return tokens;
}

function findNextManagedPrefix(
  value: string,
  cursor: number,
): { prefix: string; index: number } | null {
  const lower = value.toLowerCase();
  const matches = managedBasenamePrefixes
    .flatMap((prefix) => {
      const candidates: Array<{ prefix: string; index: number }> = [];
      let index = lower.indexOf(prefix, cursor);
      while (index >= 0) {
        const previous = index === 0 ? "" : value[index - 1];
        if (index === 0 || isUnframedBoundary(previous)) {
          candidates.push({ prefix, index });
          break;
        }
        index = lower.indexOf(prefix, index + prefix.length);
      }
      return candidates;
    })
    .sort((left, right) => left.index - right.index || right.prefix.length - left.prefix.length);
  return matches[0] ?? null;
}

function isUnframedBoundary(value: string): boolean {
  return /[\s{`,;|"'?&/()[\]:=]/.test(value);
}

function extractTomlAssignmentKeys(content: string): string[] {
  return flattenTomlLeafPaths(parseToml(content) as Record<string, unknown>);
}

function flattenTomlLeafPaths(
  value: Record<string, unknown>,
  prefix: string[] = [],
): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const pathParts = [...prefix, key];
    if (nested !== null && typeof nested === "object" && !Array.isArray(nested)) {
      return flattenTomlLeafPaths(nested as Record<string, unknown>, pathParts);
    }
    return [pathParts.join(".")];
  });
}

function isReportTargetOverrideKey(key: string): boolean {
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  const parts = normalized.split("_").filter(Boolean);
  if (normalized.includes("filename")) return true;
  if (normalized === "path_override") return true;
  const hasReport = parts.includes("report") || normalized.includes("report");
  if (["validation_report", "prd_report"].includes(normalized)) return true;
  const hasTargetRole = normalized.includes("filepath") ||
    parts.some((part) => [
      "path", "filename", "file", "target", "override", "name", "output",
      "destination", "directory", "dir", "folder", "location",
    ].includes(part));
  return hasReport && (hasTargetRole || parts.length === 1);
}

function extractStringConstant(content: string, name: string): string {
  const match = new RegExp(`^const ${name} = "([^"]*)";$`, "m").exec(content);
  expect(match, `private producer must retain exact ${name} string constant`).not.toBeNull();
  return match?.[1] ?? "";
}

function sliceBetween(content: string, start: string, end: string): string {
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex + start.length);
  expect(startIndex, `missing section start: ${start}`).toBeGreaterThanOrEqual(0);
  expect(endIndex, `missing section end: ${end}`).toBeGreaterThan(startIndex);
  return content.slice(startIndex, endIndex);
}

function extractLegacyPatternsDeclaration(content: string): string {
  const match = /const LEGACY_PATTERNS = \[[\s\S]*?\n\];/.exec(content);
  expect(match, "private producer must retain an exact LEGACY_PATTERNS declaration").not.toBeNull();
  return match?.[0] ?? "";
}

function extractFsPromiseBindings(content: string): Array<{ original: string; local: string }> {
  expect(content, "private producer must not use dynamic node:fs imports")
    .not.toMatch(/\bimport\s*\(\s*["']node:fs(?:\/promises)?["']\s*\)/);
  const imports = [...content.matchAll(
    /^[ \t]*import\s+(\{[^}]*\})\s+from\s+["']node:fs(?:\/promises)?["'];?[ \t]*$/gm,
  )];
  const staticFsReferences = [...content.matchAll(
    /\bfrom\s+["']node:fs(?:\/promises)?["']/g,
  )];
  expect(imports.length, "private producer must use an auditable named node:fs import").toBeGreaterThan(0);
  expect(imports.length, "every static node:fs import must be fully consumed as named-only").toBe(staticFsReferences.length);
  return imports.flatMap((match) => {
    const specifier = match[1].trim();
    expect(specifier, "private producer node:fs import must be named-only").toMatch(/^\{[^}]+\}$/s);
    return specifier.slice(1, -1).split(",").map((rawBinding) => {
      const [original, local = original] = rawBinding.trim().split(/\s+as\s+/);
      expect([
        "lstat", "readFile", "readdir", "realpath", "stat", "writeFile",
      ], `private producer must reject unapproved node:fs binding ${original}`).toContain(original);
      return { original, local };
    });
  }).sort((left, right) => left.local.localeCompare(right.local) || left.original.localeCompare(right.original));
}

function findFunctionCalls(content: string, functionNames: string[]): string[] {
  return functionNames
    .filter((name) => new RegExp(`\\b${name}\\s*\\(`).test(content))
    .sort();
}

function hasOnlyAuthorizedReportWriter(content: string, mutationPrimitives: string[]): boolean {
  let mutationBindings: Array<{ original: string; local: string }>;
  try {
    mutationBindings = extractFsPromiseBindings(content)
      .filter((binding) => mutationPrimitives.includes(binding.original));
  } catch {
    return false;
  }
  if (mutationBindings.length !== 1) return false;
  const [binding] = mutationBindings;
  return binding.original === "writeFile" &&
    binding.local === "writeFile" &&
    findFunctionCalls(content, [binding.local]).length === 1 &&
    content.match(/\bwriteFile\s*\(/g)?.length === 1;
}

function findDiscoveryReachableMutations(
  content: string,
  mutationPrimitives: string[],
): string[] {
  const declarationStarts = [...content.matchAll(
    /^[ \t]*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm,
  )];
  const declarations = [...content.matchAll(
    /^[ \t]*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^()\r\n]*\)\s*\{/gm,
  )];
  expect(declarations.length, "every local declaration must use the supported simple parameter shape")
    .toBe(declarationStarts.length);
  const sections = new Map<string, string>();
  declarations.forEach((declaration) => {
    const openingBrace = (declaration.index ?? 0) + declaration[0].lastIndexOf("{");
    const end = findDeclaredFunctionBodyEnd(content, openingBrace);
    expect(sections.has(declaration[1]), `duplicate local declaration ${declaration[1]}`).toBe(false);
    sections.set(declaration[1], content.slice(declaration.index ?? 0, end));
  });
  expect(sections.has("discoverPrdValidationReports"), "private producer must declare discovery").toBe(true);

  const protectedProducers = [
    "executePrdValidationReportOperation",
    "inspectPrdValidationReportTarget",
    "inspectTarget",
  ];
  const mutationBindings = extractFsPromiseBindings(content)
    .filter((binding) => mutationPrimitives.includes(binding.original))
    .map((binding) => binding.local);
  const localFunctionNames = [...sections.keys()];
  const reachable = ["discoverPrdValidationReports"];
  const visited = new Set<string>();
  const violations = new Set<string>();
  while (reachable.length > 0) {
    const functionName = reachable.shift() ?? "";
    if (visited.has(functionName)) continue;
    visited.add(functionName);
    const section = sections.get(functionName) ?? "";
    for (const call of findFunctionCalls(section, [...mutationBindings, ...protectedProducers])) {
      violations.add(call);
    }
    for (const call of findFunctionCalls(section, localFunctionNames)) {
      if (!visited.has(call)) reachable.push(call);
    }
  }
  return [...violations].sort();
}

function findDeclaredFunctionBodyEnd(content: string, openingBrace: number): number {
  let depth = 0;
  let quote: "\"" | "'" | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = openingBrace; index < content.length; index += 1) {
    const current = content[index];
    const next = content[index + 1];
    if (lineComment) {
      if (current === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (current === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote !== null) {
      if (escaped) escaped = false;
      else if (current === "\\") escaped = true;
      else if (current === quote) quote = null;
      continue;
    }
    if (current === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (current === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (current === "\"" || current === "'" || current === "`") {
      quote = current;
      continue;
    }
    if (current === "{") depth += 1;
    else if (current === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
      if (depth < 0) break;
    }
  }
  throw new Error("declared function body must have a supported, balanced brace span");
}

function removeExactRoleFragments(
  content: string,
  roles: Array<{ clause: string; occurrences: number }>,
  relativePath: string,
): string {
  let remaining = content;
  for (const { clause, occurrences } of roles) {
    expect(remaining.split(clause).length - 1, `${relativePath}: exact role clause count`).toBe(occurrences);
    remaining = remaining.replaceAll(clause, "");
  }
  return remaining;
}

function hasQualifiedPhysicalOwnerChain(input: {
  realProject: string;
  realPlanning: string;
  realPrdOwner: string;
  candidate: string;
}): boolean {
  return isSameOrDescendantForContract(input.realPlanning, input.realProject) &&
    path.resolve(input.realPrdOwner) === path.resolve(input.realPlanning, "prd") &&
    isSameOrDescendantForContract(input.candidate, input.realPrdOwner);
}

function isSameOrDescendantForContract(candidate: string, owner: string): boolean {
  const relative = path.relative(path.resolve(owner), path.resolve(candidate));
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function readTextSurfaceTree(root: string): Promise<string> {
  const chunks: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) chunks.push(await readTextSurfaceTree(absolutePath));
    else if (/\.(?:md|mjs|toml|csv)$/.test(entry.name) || entry.name.endsWith(".toml.example")) {
      chunks.push(await readFile(absolutePath, "utf8"));
    }
  }
  return chunks.join("\n");
}

async function createProject(): Promise<string> {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-prd-report-"));
  await mkdir(path.join(projectRoot, planningRoot, "prd"), { recursive: true });
  return projectRoot;
}

type NoFollowTreeEntry = {
  path: string;
  type: "regular" | "symlink" | "directory" | "other";
  bytes?: Buffer;
  hash?: string;
  symlinkTarget?: string;
};

async function captureNoFollowTreeSnapshot(
  root: string,
  relativeDirectory = "",
): Promise<NoFollowTreeEntry[]> {
  const snapshot: NoFollowTreeEntry[] = [];
  for (const entry of await readdir(path.join(root, relativeDirectory), { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(root, relativePath);
    const stats = await lstat(absolutePath);
    if (stats.isSymbolicLink()) {
      snapshot.push({ path: relativePath, type: "symlink", symlinkTarget: await readlink(absolutePath) });
    } else if (stats.isFile()) {
      snapshot.push({
        path: relativePath,
        type: "regular",
        bytes: await readFile(absolutePath),
        hash: await hashFile(absolutePath),
      });
    } else if (stats.isDirectory()) {
      snapshot.push({ path: relativePath, type: "directory" });
      snapshot.push(...await captureNoFollowTreeSnapshot(root, relativePath));
    } else {
      snapshot.push({ path: relativePath, type: "other" });
    }
  }
  return snapshot.sort((left, right) => left.path.localeCompare(right.path));
}

type ReportSnapshot = {
  ownerTree: string[];
  reportInventory: ReportInventoryEntry[];
  reports: Map<string, { bytes: Buffer; hash: string }>;
};

type ReportInventoryEntry = {
  location: string;
  type: "regular" | "symlink" | "directory" | "other";
};

async function captureReportSnapshot(projectRoot: string, names: string[]): Promise<ReportSnapshot> {
  const ownerPath = path.join(projectRoot, planningRoot, "prd");
  const reports = new Map<string, { bytes: Buffer; hash: string }>();
  const expectedInventory = names
    .map((name): ReportInventoryEntry => ({
      location: `${planningRoot}/prd/${name}`,
      type: "regular",
    }))
    .sort((left, right) => left.location.localeCompare(right.location));
  for (const name of names) {
    const projectRelativePath = `${planningRoot}/prd/${name}`;
    const absolutePath = path.join(projectRoot, projectRelativePath);
    const stats = await lstat(absolutePath);
    expect(stats.isFile(), projectRelativePath).toBe(true);
    expect(stats.isSymbolicLink(), projectRelativePath).toBe(false);
    await expect(access(absolutePath, fsConstants.R_OK)).resolves.toBeUndefined();
    reports.set(projectRelativePath, {
      bytes: await readFile(absolutePath),
      hash: await hashFile(absolutePath),
    });
  }
  const reportInventory = await findNamedEntries(projectRoot, new Set(names));
  expect(reportInventory).toEqual(expectedInventory);
  return { ownerTree: (await readdir(ownerPath)).sort(), reportInventory, reports };
}

async function assertReportSnapshot(
  projectRoot: string,
  names: string[],
  expected: ReportSnapshot,
): Promise<void> {
  const actual = await captureReportSnapshot(projectRoot, names);
  expect(actual).toEqual(expected);
}

async function findNamedEntries(
  root: string,
  names: Set<string>,
  relativeDirectory = "",
): Promise<ReportInventoryEntry[]> {
  const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
  const matches: ReportInventoryEntry[] = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const stats = await lstat(path.join(root, relativePath));
    if (names.has(entry.name)) {
      matches.push({
        location: relativePath,
        type: stats.isSymbolicLink()
          ? "symlink"
          : stats.isFile()
            ? "regular"
            : stats.isDirectory()
              ? "directory"
              : "other",
      });
    }
    if (stats.isDirectory()) {
      matches.push(...await findNamedEntries(root, names, relativePath));
    }
  }
  return matches.sort((left, right) => left.location.localeCompare(right.location));
}

function intersectProtectedPaths(
  actualPaths: ReadonlyArray<string | null | undefined>,
  protectedPaths: ReadonlyArray<string>,
): string[] {
  const protectedSet = new Set(protectedPaths);
  return actualPaths
    .filter((candidate): candidate is string => typeof candidate === "string" && protectedSet.has(candidate))
    .sort();
}
