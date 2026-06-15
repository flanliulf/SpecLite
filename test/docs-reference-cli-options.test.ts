import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { describe, expect, it } from "vitest";
import { createSpecliteProgram } from "../src/bin/speclite.js";

describe("docs/reference CLI option parity", () => {
  it("keeps documented core command options aligned with CLI help", async () => {
    const reference = await readFile("docs/reference/cli.md", "utf8");
    const program = createSpecliteProgram();
    const cases = [
      { command: "init", heading: "Init" },
      { command: "list", heading: "List" },
      { command: "status", heading: "Status" },
      { command: "validate", heading: "Validate" },
    ];

    for (const item of cases) {
      expect(documentedOptionsFor(reference, item.heading), item.command).toEqual(
        cliHelpOptionsFor(program, item.command),
      );
    }
  });
});

function documentedOptionsFor(reference: string, heading: string): string[] {
  const section = new RegExp(`^## ${heading} Options[^\\n]*\\n([\\s\\S]*?)(?=^## )`, "m").exec(reference)?.[1];
  if (section === undefined) {
    throw new Error(`Missing ${heading} Options section in docs/reference/cli.md`);
  }

  return Array.from(section.matchAll(/^\| `([^`]+)` \|/gm), ([, option]) => option).sort();
}

function cliHelpOptionsFor(program: Command, commandName: string): string[] {
  const command = program.commands.find((candidate) => candidate.name() === commandName);
  if (command === undefined) {
    throw new Error(`Missing ${commandName} command in CLI program`);
  }

  return Array.from(command.helpInformation().matchAll(/^\s{2}(--[\w-]+(?: <[^>]+>)?)/gm), ([, option]) =>
    option.trim(),
  ).sort();
}
