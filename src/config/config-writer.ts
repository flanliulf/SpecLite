import type { ConfigTomlDocument } from "./config-schema.js";

export const INSTALLER_CONFIG_TOML_HEADER = [
  "# ─────────────────────────────────────────────────────────────────",
  "# 由安装程序管理。每次安装时都会重新生成，请视为只读文件。",
  "#",
  "# 该文件需要提交到代码仓库，适用于项目中的每位开发者。",
  "#",
  "# 直接编辑此文件的内容会在下次安装时被覆盖。",
  "#",
  "# 如需持久修改安装配置，请重新运行安装程序",
  "# （你之前填写的回答会作为默认值保留）。",
  "#",
  "# 如需固定某个值，使其不受安装时回答内容的影响，或添加自定义代理 / 覆盖描述符，请使用：",
  "#   _speclite/custom/config.toml       （团队配置，需提交）",
  "#   _speclite/custom/config.user.toml  （个人配置，已加入 gitignore）",
  "#",
  "# 安装程序绝不会修改这些文件。",
  "# ─────────────────────────────────────────────────────────────────",
].join("\n");

export const INSTALLER_USER_CONFIG_TOML_HEADER = [
  "# ─────────────────────────────────────────────────────────────────",
  "# 由安装程序管理。每次安装时都会重新生成，请视为只读文件。",
  "#",
  "# 该文件不应提交到代码仓库（已加入 gitignore），仅适用于你的本地安装，",
  "# 用于保存与你个人相关的安装回答。",
  "#",
  "# 直接编辑此文件的内容会在下次安装时被覆盖。",
  "#",
  "# 如需持久修改某个回答，请重新运行安装程序",
  "# （你之前填写的回答会作为默认值保留）。",
  "#",
  "# 如需固定覆盖某个值，或添加安装程序未知的自定义配置段，请使用：",
  "#   _speclite/custom/config.user.toml",
  "#",
  "# 安装程序绝不会修改该文件。",
  "# ─────────────────────────────────────────────────────────────────",
].join("\n");

export const TEAM_CUSTOM_CONFIG_TOML_HEADER = [
  "# ─────────────────────────────────────────────────────────────────",
  "# _speclite/config.toml 的团队 / 企业覆盖配置。",
  "#",
  "# 该文件需要提交到代码仓库，适用于项目中的每位开发者。",
  "#",
  "# 表结构会在基础配置之上进行深度合并；键值条目会按 key 合并。",
  "# 示例：覆盖某个 Agent 描述符，或添加一个新 Agent。",
  "#",
  "# [agents.speclite-agent-pm]",
  '# description = "相比叙述式草稿，更偏好简短的项目符号式 PRD。"',
  "# ─────────────────────────────────────────────────────────────────",
].join("\n");

export const PERSONAL_CUSTOM_CONFIG_TOML_HEADER = [
  "# ─────────────────────────────────────────────────────────────────",
  "# _speclite/config.toml 的个人覆盖配置。",
  "#",
  "# 该文件不应提交到代码仓库（已加入 gitignore），仅适用于你的本地安装。",
  "#",
  "# 其优先级高于基础配置和团队覆盖配置。",
  "# ─────────────────────────────────────────────────────────────────",
].join("\n");

export type ConfigTomlHeaderKind =
  | "installer-config"
  | "installer-user-config"
  | "team-custom-config"
  | "personal-custom-config";

export function serializeConfigToml(
  document: ConfigTomlDocument,
  options: { header?: ConfigTomlHeaderKind } = {},
): string {
  const lines: string[] = [];
  const header = options.header === undefined ? undefined : headerForKind(options.header);
  if (header !== undefined) {
    lines.push(...header.split("\n"), "");
  }

  if (document.core !== undefined && Object.keys(document.core).length > 0) {
    appendSection(lines, "core", document.core);
  }

  if (document.modules?.sdlc !== undefined && Object.keys(document.modules.sdlc).length > 0) {
    appendSection(lines, "modules.sdlc", document.modules.sdlc);
  }

  for (const [agentId, descriptor] of sortedEntries(document.agents ?? {})) {
    appendSection(lines, `agents.${agentId}`, descriptor);
  }

  for (const [hookId, descriptor] of sortedEntries(document.hooks ?? {})) {
    appendSection(lines, `hooks.${hookId}`, descriptor);
  }

  return `${lines.join("\n")}\n`;
}

function appendSection(
  lines: string[],
  name: string,
  values: Record<string, string | string[] | undefined>,
): void {
  if (lines.length > 0) {
    lines.push("");
  }

  lines.push(`[${name}]`);
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    lines.push(`${key} = ${quoteTomlValue(value)}`);
  }
}

function quoteTomlValue(value: string | string[]): string {
  if (Array.isArray(value)) {
    return `[${value.map(quoteTomlString).join(", ")}]`;
  }

  return quoteTomlString(value);
}

function quoteTomlString(value: string): string {
  return JSON.stringify(value);
}

function sortedEntries<T>(record: Record<string, T>): Array<[string, T]> {
  return Object.entries(record).sort(([left], [right]) => left.localeCompare(right));
}

function headerForKind(kind: ConfigTomlHeaderKind): string {
  if (kind === "installer-config") return INSTALLER_CONFIG_TOML_HEADER;
  if (kind === "installer-user-config") return INSTALLER_USER_CONFIG_TOML_HEADER;
  if (kind === "team-custom-config") return TEAM_CUSTOM_CONFIG_TOML_HEADER;
  return PERSONAL_CUSTOM_CONFIG_TOML_HEADER;
}
