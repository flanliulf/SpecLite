import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectPackagingPrerequisiteIssues,
  runPackagingCheck,
  validatePackagedDocumentationExamples,
} from "../scripts/release/packaging-check.mjs";

describe("Story 6.7 release packaging gate", () => {
  it("declares scoped public npm package metadata for the first publish", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      name: string;
      version: string;
      license: string;
      bin: Record<string, string>;
      files: string[];
      publishConfig?: Record<string, string>;
      repository?: { type: string; url: string };
      bugs?: { url: string };
      homepage?: string;
      keywords?: string[];
    };

    expect(packageJson).toMatchObject({
      name: "@fancyliu/speclite",
      version: "0.2.0",
      license: "MIT",
      bin: {
        speclite: "dist/bin/speclite.js",
      },
      publishConfig: {
        registry: "https://registry.npmjs.org/",
        access: "public",
      },
      repository: {
        type: "git",
        url: "git+ssh://git@github.com/flanliulf/SpecLite.git",
      },
      bugs: {
        url: "https://github.com/flanliulf/SpecLite/issues",
      },
      homepage: "https://github.com/flanliulf/SpecLite#readme",
    });
    expect(packageJson.files).toEqual([
      "dist/",
      "assets/source/speclite/",
      "docs/quick-start.md",
      "package.json",
      "README.md",
    ]);
    expect(packageJson.keywords).toEqual(
      expect.arrayContaining(["speclite", "ai-coding", "cli", "sdlc"]),
    );
  });

  it("exposes a serial build-first release verification script", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["release:verify"]).toBe("npm run build && npm run release:packaging-check");
    expect(packageJson.scripts["release:check"]).toBe("npm run build && npm test && npm run release:packaging-check");
    expect(packageJson.scripts["release:packaging-check"]).toBe("node scripts/release/packaging-check.mjs");
    expect(packageJson.scripts.prepublishOnly).toBe("npm run release:check");
  });

  it("writes a tracked canonical manifest and a generated runtime manifest", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-packaging-dual-manifest-"));

    try {
      await writeFileAt(
        tempRoot,
        "package.json",
        JSON.stringify({
          name: "@fancyliu/speclite",
          version: "0.2.0",
          license: "MIT",
          bin: {
            speclite: "dist/bin/speclite.js",
          },
          files: ["dist/", "assets/source/speclite/", "package.json"],
          publishConfig: {
            registry: "https://registry.npmjs.org/",
            access: "public",
          },
          engines: {
            node: ">=22",
          },
        }),
      );
      await writeRequiredRuntimeAssets(tempRoot);
      const buildMtime = new Date(Date.now() + 60_000);
      await writeFileWithMtime(tempRoot, "dist/bin/speclite.js", "#!/usr/bin/env node\n", buildMtime);
      await writeFileWithMtime(tempRoot, "dist/bin/speclite.d.ts", "export {};\n", buildMtime);

      runPackagingCheck(tempRoot);

      const canonicalManifest = await readFile(path.join(tempRoot, "release/packaging-manifest.json"), "utf8");
      const runtimeManifest = await readFile(path.join(tempRoot, "dist/packaging-manifest.json"), "utf8");
      const parsed = JSON.parse(canonicalManifest) as {
        files: string[];
      };

      expect(runtimeManifest).toBe(canonicalManifest);
      expect(parsed.files).toContain("dist/packaging-manifest.json");
      expect(parsed.files).not.toContain("release/packaging-manifest.json");
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails fast when required build output is missing", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-packaging-missing-build-"));

    try {
      await writeRequiredRuntimeAssets(tempRoot);

      const issues = collectPackagingPrerequisiteIssues(tempRoot);

      expect(issues).toEqual(
        expect.arrayContaining([
          "missing build output: dist/bin/speclite.js",
          "missing build output: dist/bin/speclite.d.ts",
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("fails fast when build output is older than source input", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "speclite-packaging-stale-build-"));

    try {
      await writeRequiredRuntimeAssets(tempRoot);
      await writeFileWithMtime(tempRoot, "dist/bin/speclite.js", "old build", new Date("2026-06-02T00:00:00Z"));
      await writeFileWithMtime(tempRoot, "dist/bin/speclite.d.ts", "old types", new Date("2026-06-02T00:00:00Z"));
      await writeFileWithMtime(
        tempRoot,
        "src/bin/speclite.ts",
        "new source",
        new Date("2026-06-02T00:01:00Z"),
      );

      const issues = collectPackagingPrerequisiteIssues(tempRoot);

      expect(issues).toEqual(
        expect.arrayContaining([
          "stale build output: dist/bin/speclite.js older than src/bin/speclite.ts",
          "stale build output: dist/bin/speclite.d.ts older than src/bin/speclite.ts",
        ]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires packaged documentation examples to be non-empty and explicitly classified", () => {
    const packageFiles = new Set([
      "assets/source/speclite/docs/examples/fixture-derived-examples.md",
      "dist/bin/speclite.js",
      "package.json",
    ]);
    const validExamples = [
      {
        path: "assets/source/speclite/docs/examples/fixture-derived-examples.md",
        classification: "packaged-documentation-example",
        isReleaseGateFixture: false,
      },
    ];

    expect(validatePackagedDocumentationExamples(validExamples, packageFiles)).toEqual({
      passed: true,
    });
    expect(validatePackagedDocumentationExamples([], packageFiles)).toEqual({
      passed: false,
      reason: "packagedDocumentationExamples must not be empty",
    });
    expect(
      validatePackagedDocumentationExamples(
        [
          {
            path: "assets/source/speclite/docs/examples/missing.md",
            classification: "packaged-documentation-example",
            isReleaseGateFixture: false,
          },
        ],
        packageFiles,
      ),
    ).toEqual({
      passed: false,
      reason: "packaged documentation example is not in package inventory: assets/source/speclite/docs/examples/missing.md",
    });
    expect(
      validatePackagedDocumentationExamples(
        [
          {
            path: "assets/source/speclite/docs/examples/fixture-derived-examples.md",
            classification: "release-gate-fixture",
            isReleaseGateFixture: false,
          },
        ],
        packageFiles,
      ),
    ).toEqual({
      passed: false,
      reason: "packaged documentation example has invalid classification: assets/source/speclite/docs/examples/fixture-derived-examples.md",
    });
    expect(
      validatePackagedDocumentationExamples(
        [
          {
            path: "test/fixtures/path-portability/README.md",
            classification: "packaged-documentation-example",
            isReleaseGateFixture: false,
          },
        ],
        new Set(["test/fixtures/path-portability/README.md"]),
      ),
    ).toEqual({
      passed: false,
      reason: "packaged documentation example path is not allowed: test/fixtures/path-portability/README.md",
    });
  });
});

async function writeRequiredRuntimeAssets(root: string): Promise<void> {
  await writeFileAt(root, "assets/source/speclite/scripts/resolve_config.py", "# resolver\n");
  await writeFileAt(root, "assets/source/speclite/core-skills/module.yaml", "id: core\n");
  await writeFileAt(root, "assets/source/speclite/sdlc-skills/module.yaml", "id: sdlc\n");
  await writeFileAt(root, "assets/source/speclite/docs/examples/fixture-derived-examples.md", "# Example\n");
  await writeFileAt(root, "assets/source/speclite/core-skills/example/SKILL.md", "# Skill\n");
}

async function writeFileWithMtime(root: string, relativePath: string, content: string, mtime: Date): Promise<void> {
  await writeFileAt(root, relativePath, content);
  const absolutePath = path.join(root, relativePath);
  await utimes(absolutePath, mtime, mtime);
}

async function writeFileAt(root: string, relativePath: string, content: string): Promise<void> {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
}
