import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("package scaffold", () => {
  it("declares the MVP CLI package contract", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as {
      type?: string;
      bin?: Record<string, string>;
      engines?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    expect(packageJson.type).toBe("module");
    expect(packageJson.bin?.speclite).toBe("./dist/bin/speclite.js");
    expect(packageJson.engines?.node).toBe(">=22");
    expect(packageJson.scripts).toEqual(
      expect.objectContaining({
        build: "tsup",
        test: "vitest run",
        dev: "tsx src/bin/speclite.ts",
        "release:packaging-check": expect.stringContaining("deferred to Epic 6"),
      }),
    );
  });
});

