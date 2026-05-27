import type { ConfigTomlDocument } from "./config-schema.js";

export function serializeConfigToml(document: ConfigTomlDocument): string {
  const lines: string[] = [];

  if (document.core !== undefined && Object.keys(document.core).length > 0) {
    appendSection(lines, "core", document.core);
  }

  if (document.modules?.sdlc !== undefined && Object.keys(document.modules.sdlc).length > 0) {
    appendSection(lines, "modules.sdlc", document.modules.sdlc);
  }

  return `${lines.join("\n")}\n`;
}

function appendSection(lines: string[], name: string, values: Record<string, string | undefined>): void {
  if (lines.length > 0) {
    lines.push("");
  }

  lines.push(`[${name}]`);
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    lines.push(`${key} = ${quoteTomlString(value)}`);
  }
}

function quoteTomlString(value: string): string {
  return JSON.stringify(value);
}
