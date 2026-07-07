import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const flowGateRoot = path.join(
  process.cwd(),
  "assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate",
);

describe("speclite-flow-gate canonical contract", () => {
  it("preserves PASS_EQUIVALENT regression coverage for guidance path drift", async () => {
    const workflow = await readFile(path.join(flowGateRoot, "references/workflow-details.md"), "utf8");
    const regression = await readFile(
      path.join(flowGateRoot, "references/regression-scenarios.md"),
      "utf8",
    );

    expect(workflow).toContain("PASS_EQUIVALENT");
    expect(workflow).toContain("Guidance Anchor");
    expect(workflow).toContain("Contract -> Functional -> Evidence");
    expect(regression).toContain("centralized module");
    expect(regression).toContain("owning SPEC does not require those exact split files");
    expect(regression).toContain("The gate must output `PASS_EQUIVALENT`");
    expect(regression).toContain("result is `FAIL_CONTRACT`");
    expect(regression).toContain("result is `FAIL_FUNCTION`");
    expect(regression).toContain("result is `FAIL_EVIDENCE`");
  });

  it("requires story kickoff foundation handoff metadata for downstream consumers", async () => {
    const workflow = await readFile(path.join(flowGateRoot, "references/workflow-details.md"), "utf8");
    const template = await readFile(path.join(flowGateRoot, "assets/report-template.md"), "utf8");

    expect(template).toContain('schemaVersion: "speclite.flow-gate-report.v2"');
    expect(template).toContain('handoffContractVersion: "speclite.story-kickoff-handoff.v1"');

    for (const field of [
      "foundationPrerequisiteStatus",
      "foundationPrerequisiteRefs",
      "closureOwnerCheckStatus",
      "closureOwnerRefs",
    ]) {
      expect(workflow).toContain(field);
      expect(template).toContain(field);
    }
    expect(workflow).toContain("future-closure owner");
    expect(workflow).toContain("Downstream hooks and workflow runners treat missing status fields");
  });

  it("uses project handoff source index instead of project-specific default paths", async () => {
    const workflow = await readFile(path.join(flowGateRoot, "references/workflow-details.md"), "utf8");

    expect(workflow).toContain("foundation_handoff_source_index");
    expect(workflow).toContain("speclite.foundation-handoff-source-index.v1");
    expect(workflow).toContain("{implementation_artifacts}/foundation-handoff/source-index.json");
    expect(workflow).toContain("_speclite/custom/speclite-flow-gate.toml");
    expect(workflow).not.toContain("packages/shared-schema/fixtures/foundation");
  });
});
