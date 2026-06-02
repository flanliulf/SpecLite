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
});
