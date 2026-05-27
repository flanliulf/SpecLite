import { describe, expect, it } from "vitest";
import { deepMergeTomlDocuments } from "../src/config/merge-rules.js";

describe("resolver structural merge rules", () => {
  it("overrides scalars and recursively merges tables", () => {
    expect(
      deepMergeTomlDocuments(
        {
          core: {
            project_name: "Base",
            communication_language: "Chinese",
          },
        },
        {
          core: {
            project_name: "Override",
            document_output_language: "中文",
          },
        },
      ),
    ).toEqual({
      core: {
        project_name: "Override",
        communication_language: "Chinese",
        document_output_language: "中文",
      },
    });
  });

  it("replaces whole array table items by shared code key", () => {
    expect(
      deepMergeTomlDocuments(
        {
          steps: [
            { code: "a", label: "Base A", keep: true },
            { code: "b", label: "Base B" },
          ],
        },
        {
          steps: [
            { code: "a", label: "Override A" },
            { code: "c", label: "Override C" },
          ],
        },
      ),
    ).toEqual({
      steps: [
        { code: "a", label: "Override A" },
        { code: "b", label: "Base B" },
        { code: "c", label: "Override C" },
      ],
    });
  });

  it("replaces whole array table items by shared id key", () => {
    expect(
      deepMergeTomlDocuments(
        { agents: [{ id: "dev", prompt: "base" }] },
        { agents: [{ id: "dev", prompt: "override" }] },
      ),
    ).toEqual({
      agents: [{ id: "dev", prompt: "override" }],
    });
  });

  it("falls back to append for mixed keys, missing keys, and non-table items", () => {
    expect(
      deepMergeTomlDocuments(
        {
          mixed: [{ code: "a" }],
          partial: [{ code: "a" }],
          values: ["base"],
        },
        {
          mixed: [{ id: "b" }],
          partial: [{ label: "missing key" }],
          values: ["override"],
        },
      ),
    ).toEqual({
      mixed: [{ code: "a" }, { id: "b" }],
      partial: [{ code: "a" }, { label: "missing key" }],
      values: ["base", "override"],
    });
  });

  it("does not implement deletion semantics", () => {
    expect(
      deepMergeTomlDocuments(
        { flags: [{ code: "default", enabled: true }] },
        { flags: [{ code: "default", enabled: false, remove: true }] },
      ),
    ).toEqual({
      flags: [{ code: "default", enabled: false, remove: true }],
    });
  });
});
