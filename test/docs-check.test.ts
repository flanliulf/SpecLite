import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("docs governance check", () => {
  it("keeps the docs check exposed and passing for the current public documentation", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(packageJson.scripts["docs:check"]).toBe("node scripts/docs/check.mjs");
    expect(workflow).toContain("npm run docs:check");

    const { stdout } = await execFileAsync(process.execPath, ["scripts/docs/check.mjs"], {
      cwd: process.cwd(),
    });
    expect(stdout).toContain("docs:check passed");
  });
});
