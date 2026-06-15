import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";
import { DoctorCommandResultSchema } from "../src/diagnostics/command-result-schema.js";

describe("doctor command diagnostics", () => {
  it("reuses ValidationIssue and validate category projection without changing validate local-only behavior", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-doctor-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite/_config"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"Doctor Fixture\"\n", "utf8");

      const result = await runCli(["doctor", tempRoot, "--json"]);
      const parsed = DoctorCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.command).toBe("doctor");
      expect(parsed.targetProject).toBe("Doctor Fixture");
      expect(parsed.data.checkedCategories).toContain("manifest-schema");
      expect(parsed.data.issueCounts.error + parsed.data.issueCounts.critical).toBeGreaterThan(0);
      expect(parsed.issues[0]).toEqual(
        expect.objectContaining({
          category: "manifest-schema",
        }),
      );
      expect(parsed.data.externalAccesses).toEqual([]);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("projects remote source revalidation as explicit pending external access intent", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-doctor-external-"));

    try {
      await mkdir(path.join(tempRoot, "_speclite"), { recursive: true });
      await writeFile(path.join(tempRoot, "_speclite/config.toml"), "[core]\nproject_name = \"External Doctor\"\n", "utf8");

      const result = await runCli(["doctor", tempRoot, "--json", "--revalidate-source"]);
      const parsed = DoctorCommandResultSchema.parse(JSON.parse(result.stdout));

      expect(result.exitCodes).toEqual([1]);
      expect(parsed.status).toBe("failure");
      expect(parsed.data.externalAccesses).toEqual([
        {
          sourceType: "installed-source",
          sourceValue: "manifest-source",
          reason: "doctor remote freshness/provenance revalidation",
          confirmationState: "pending",
        },
      ]);
      expect(parsed.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            issueId: "source-integrity.external-access-not-authorized",
            category: "source-integrity",
            severity: "error",
          }),
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });
});

async function runCli(args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCodes: number[];
}> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const exitCodes: number[] = [];
  const program = createSpecliteProgram({
    io: {
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
      setExitCode: (code) => exitCodes.push(code),
    },
  });

  await program.parseAsync(["node", "speclite", ...args], { from: "node" });

  return {
    stdout: stdout.join(""),
    stderr: stderr.join(""),
    exitCodes,
  };
}
