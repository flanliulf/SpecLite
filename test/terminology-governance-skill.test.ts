import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const validatorPath = path.resolve(
  "assets/source/speclite/core-skills/speclite-terminology-governance/scripts/validate_glossary.py",
);
const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("speclite-terminology-governance validator", () => {
  it("accepts a numbered Epic glossary, scoped inventory variants and a domain-candidate handoff", async () => {
    const root = await createRoot();
    await writeProjectFile(
      root,
      "epic-01-installation.md",
      [
        "# Epic 1: Installation Glossary（安装术语表）",
        "",
        "| Term | 中文直译 | Definition |",
        "|---|---|---|",
        "| **fresh install** | 全新安装 | 首次建立项目 runtime 的安装过程。 |",
        "| **SourceDescriptor** | 来源描述符 | 记录来源类型与验证状态的 schema type。 |",
        "",
      ].join("\n"),
    );
    await writeProjectFile(
      root,
      "terminology-inventory.md",
      [
        "# Terminology Inventory（术语清单）",
        "",
        "| Canonical Term | 中文名称 | Definition | Category | Scope | Sources | Status | Aliases |",
        "|---|---|---|---|---|---|---|---|",
        "| **订单** | 订单 | 客户提交的购买请求。 | Business Domain | Ordering | PRD | approved | Order |",
        "| **订单** | 订单 | 仓库执行的履约对象。 | Business Domain | Fulfillment | Architecture | candidate | — |",
        "",
      ].join("\n"),
    );
    await writeProjectFile(
      root,
      "domain-candidates.md",
      [
        "# Domain Candidates（领域候选）",
        "",
        "| Term | Candidate Kind | Proposed Bounded Context | Evidence | Conflicts | Recommendation |",
        "|---|---|---|---|---|---|",
        "| **Order** | Entity | Ordering | PRD order rules | None | Review with `speclite-domain-modeling` |",
        "",
      ].join("\n"),
    );
    await writeProjectFile(
      root,
      "index.md",
      "| Document | Description |\n|---|---|\n| [Epic glossary](epic-01-installation.md) | Epic 1 terms. |\n",
    );

    const result = runValidator(root);

    expect(result.status).toBe(0);
    expect(result.report).toMatchObject({
      status: "ok",
      epicFiles: 1,
      termTables: 1,
      termRows: 2,
      inventoryRows: 2,
      domainCandidateRows: 1,
      errors: 0,
    });
    await expect(readFile(path.join(root, "CONTEXT.md"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("rejects a missing Chinese name, mismatched Epic number and stale index target", async () => {
    const root = await createRoot();
    await writeProjectFile(
      root,
      "epic-02-validation.md",
      [
        "# Epic 1: Validation Glossary（验证术语表）",
        "",
        "| Term | 中文直译 | Definition |",
        "|---|---|---|",
        "| **fixture** | Fixture | A reusable test input. |",
        "",
      ].join("\n"),
    );
    await writeProjectFile(
      root,
      "index.md",
      "| Document | Description |\n|---|---|\n| [Old glossary](validation.md) | Epic 2 terms. |\n",
    );

    const result = runValidator(root);
    const codes = result.report.findings.map((finding: { code: string }) => finding.code);

    expect(result.status).toBe(1);
    expect(codes).toEqual(
      expect.arrayContaining(["EPIC_NUMBER", "CHINESE_MISSING", "INDEX_BROKEN", "INDEX_EPIC_MISSING", "INDEX_EPIC_STALE"]),
    );
  });

  it("accepts a conflicted inventory row but rejects a row that is also approved", async () => {
    const root = await createRoot();
    await writeProjectFile(
      root,
      "terminology-inventory.md",
      [
        "# Terminology Inventory（术语清单）",
        "",
        "| Canonical Term | 中文名称 | Definition | Category | Scope | Sources | Status | Aliases |",
        "|---|---|---|---|---|---|---|---|",
        "| **account** | 账户 | PRD 与 Story 对该词的边界不同。 | Business Domain | Project | PRD; Story | conflicted / approved | — |",
        "",
      ].join("\n"),
    );

    const result = runValidator(root, false);
    const codes = result.report.findings.map((finding: { code: string }) => finding.code);

    expect(result.status).toBe(1);
    expect(codes).toContain("CONFLICT_APPROVED");
    expect(codes).toContain("INVENTORY_STATUS");
    expect(result.report.warnings).toBe(1);
  });
});

async function createRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "speclite-terminology-governance-"));
  tempRoots.push(root);
  return root;
}

async function writeProjectFile(root: string, relativePath: string, contents: string): Promise<void> {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

function runValidator(root: string, requireIndex = true): { status: number | null; report: any } {
  const args = [validatorPath, root, "--format", "json"];
  if (requireIndex) args.push("--require-index");
  const result = spawnSync("python3", args, { encoding: "utf8" });
  if (!result.stdout.trim()) {
    throw new Error(`validator did not produce JSON: ${result.stderr}`);
  }
  return { status: result.status, report: JSON.parse(result.stdout) };
}
