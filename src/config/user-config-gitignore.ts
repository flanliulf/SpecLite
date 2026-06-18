export const USER_SCOPED_CONFIG_IGNORE_RULES = [
  "_speclite/config.user.toml",
  "_speclite/custom/config.user.toml",
] as const;

export function hasUserConfigGitignoreCoverage(contents: string): boolean {
  const lines = new Set(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#")),
  );

  return USER_SCOPED_CONFIG_IGNORE_RULES.every((rule) => lines.has(rule));
}

export function appendUserConfigGitignoreRules(contents: string): string {
  const lines = new Set(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#")),
  );
  const missing = USER_SCOPED_CONFIG_IGNORE_RULES.filter((rule) => !lines.has(rule));
  if (missing.length === 0) return contents;

  const prefix = contents.length === 0 ? "" : contents.endsWith("\n") ? contents : `${contents}\n`;
  return `${prefix}${missing.join("\n")}\n`;
}
