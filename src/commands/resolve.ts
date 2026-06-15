import type { Command } from "commander";
import process from "node:process";
import { formatCliMessage, getCliMessage, resolveCliLocale, type CliLocale } from "../cli/messages.js";
import { resolveProjectConfig } from "../config/config-reader.js";
import { resolveSkillCustomization, type ResolverResult } from "../config/customization-reader.js";
import { createResolveIssue } from "../config/resolve-diagnostics.js";
import type { ResolveHumanOutcome } from "../config/resolve-output-schema.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";

export type ResolveCommandIo = {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  setExitCode: (code: number) => void;
};

type ResolveConfigOptions = {
  projectRoot?: string;
  key?: string[];
  human?: boolean;
  locale?: string;
};

type ResolveCustomizationOptions = ResolveConfigOptions & {
  skill?: string;
};

export function registerResolveCommand(program: Command, io: ResolveCommandIo): void {
  const resolve = program
    .command("resolve")
    .description("Resolve SpecLite runtime config or skill customization as machine-readable JSON.");

  resolve
    .command("config")
    .description("Resolve _speclite config layers.")
    .option("--project-root <projectRoot>", "Project root containing _speclite.")
    .option("--key <dottedKey>", "Dotted key to select from the merged config.", collectKey, [])
    .option("--human", "Render opt-in human-readable resolver support output.")
    .option("--locale <locale>", "Render human-readable resolve output with locale: zh-CN or en-US.")
    .action(async (options: ResolveConfigOptions) => {
      const locale = resolveCliLocale({ flag: options.locale, env: process.env });
      if (options.projectRoot === undefined) {
        writeFailure(io, missingOptionIssue("--project-root"), {
          human: options.human ?? false,
          locale,
          command: "config",
          requestedKeys: options.key ?? [],
        });
        return;
      }

      const result = await resolveProjectConfig({
        projectRoot: options.projectRoot,
        keys: options.key ?? [],
      });
      writeResolveResult(io, result, {
        human: options.human ?? false,
        locale,
        command: "config",
        requestedKeys: options.key ?? [],
        sourcePaths: [
          "_speclite/config.toml",
          "_speclite/config.user.toml",
          "_speclite/custom/config.toml",
          "_speclite/custom/config.user.toml",
        ],
        resolvedLayer: "merged config layers",
      });
    });

  resolve
    .command("customization")
    .description("Resolve installed skill customization layers.")
    .option("--skill <skillDir>", "Installed skill directory containing customize.toml.")
    .option("--project-root <projectRoot>", "Project root containing _speclite.")
    .option("--key <dottedKey>", "Dotted key to select from the merged customization.", collectKey, [])
    .option("--human", "Render opt-in human-readable resolver support output.")
    .option("--locale <locale>", "Render human-readable resolve output with locale: zh-CN or en-US.")
    .action(async (options: ResolveCustomizationOptions) => {
      const locale = resolveCliLocale({ flag: options.locale, env: process.env });
      if (options.skill === undefined) {
        writeFailure(io, missingOptionIssue("--skill"), {
          human: options.human ?? false,
          locale,
          command: "customization",
          requestedKeys: options.key ?? [],
        });
        return;
      }

      const skillName = basename(options.skill);
      const result = await resolveSkillCustomization({
        skillDir: options.skill,
        ...(options.projectRoot === undefined ? {} : { projectRoot: options.projectRoot }),
        keys: options.key ?? [],
      });
      writeResolveResult(io, result, {
        human: options.human ?? false,
        locale,
        command: "customization",
        requestedKeys: options.key ?? [],
        sourcePaths: [
          "customize.toml",
          `_speclite/custom/${skillName}.toml`,
          `_speclite/custom/${skillName}.user.toml`,
        ],
        resolvedLayer: "merged customization layers",
        fallbackWarning: options.projectRoot === undefined ? "project root search" : undefined,
      });
    });
}

function writeResolveResult(
  io: ResolveCommandIo,
  result: ResolverResult,
  context: ResolveHumanContext,
): void {
  if (context.human) {
    io.stdout(renderResolveHumanOutput(result, context));
    io.setExitCode(result.exitCode);
    return;
  }

  if (result.exitCode === 0) {
    io.stdout(`${JSON.stringify(result.value, null, 2)}\n`);
  }
  if (result.issues.length > 0) {
    io.stderr(result.issues.map((issue) => JSON.stringify(issue)).join("\n") + "\n");
  }
  io.setExitCode(result.exitCode);
}

function writeFailure(io: ResolveCommandIo, issue: ValidationIssue, context: ResolveHumanContext): void {
  if (context.human) {
    io.stdout(renderResolveHumanOutput({ value: {}, issues: [issue], exitCode: 1, sources: {} }, context));
    io.setExitCode(1);
    return;
  }

  io.stderr(`${JSON.stringify(issue)}\n`);
  io.setExitCode(1);
}

function missingOptionIssue(optionName: "--project-root" | "--skill"): ValidationIssue {
  return createResolveIssue({
    issueId: "runtime-path.missing-entry",
    severity: "error",
    affectedPath: optionName,
    component: "resolve-command",
    status: "invalid-args",
  });
}

function collectKey(value: string, previous: string[]): string[] {
  return [...previous, value];
}

type ResolveHumanCommand = "config" | "customization";

type ResolveHumanContext = {
  human: boolean;
  locale: CliLocale;
  command: ResolveHumanCommand;
  requestedKeys: string[];
  sourcePaths?: string[];
  resolvedLayer?: string;
  fallbackWarning?: string | undefined;
};

function renderResolveHumanOutput(
  result: ResolverResult,
  context: ResolveHumanContext,
): string {
  const locale = context.locale;
  const outcome = getResolveHumanOutcome(result, context);
  const lines = [
    `SpecLite resolve ${context.command}`,
    `${getCliMessage(locale, "outcome")}: ${outcome}`,
    "",
    getCliMessage(locale, "summary"),
    `${getCliMessage(locale, "completed")}: ${
      result.exitCode === 0 ? getCliMessage(locale, "completedYes") : getCliMessage(locale, "completedNo")
    }`,
    `${getCliMessage(locale, "writes")}: ${getCliMessage(locale, "writeNone")}`,
    `${getCliMessage(locale, "userAction")}: ${
      outcome === "resolved" ? getCliMessage(locale, "actionNotRequired") : getCliMessage(locale, "actionRequired")
    }`,
    formatResolveBullet(locale, "resolveRequestedKey", formatRequestedKeys(context.requestedKeys, locale)),
    formatResolveBullet(
      locale,
      "resolveResolvedLayer",
      result.exitCode === 0
        ? context.resolvedLayer ?? getCliMessage(locale, "resolveMergedResolverLayers")
        : getCliMessage(locale, "resolveResolvedLayerNone"),
    ),
    formatResolveBullet(locale, "resolveSourcePath", formatResolveSourcePath(result, context, outcome, locale)),
    formatResolveBullet(locale, "resolveValueSummary", summarizeResolveValue(result, outcome, locale)),
  ];

  if (context.command === "config" && context.requestedKeys.includes("core.project_name")) {
    lines.push(
      `- ${formatCliMessage(locale, "resolveTechnicalIdentifierNote", { identifier: "core.project_name" })}`,
    );
  }

  lines.push(
    "",
    getCliMessage(locale, "scope"),
    `- command: speclite resolve ${context.command}`,
    formatResolveBullet(locale, "resolveOutputMode", getCliMessage(locale, "resolveOutputModeHuman")),
    formatResolveBullet(locale, "resolveMachineContract", getCliMessage(locale, "resolveMachineContractPureJson")),
    "",
    getCliMessage(locale, "evidence"),
  );

  if (outcome === "invalid-input") {
    lines.push(
      formatResolveBullet(
        locale,
        "resolveLegalCommand",
        "speclite resolve config --project-root <projectRoot> [--key <dottedKey>] [--human]",
      ),
      formatResolveBullet(
        locale,
        "resolveLegalCommand",
        "speclite resolve customization --skill <skillDir> [--project-root <projectRoot>] [--key <dottedKey>] [--human]",
      ),
    );
    for (const issue of result.issues) {
      if (issue.affectedPath !== undefined && issue.affectedPath.startsWith("_speclite/")) {
        lines.push(formatResolveBullet(locale, "resolveFailedLayer", issue.affectedPath));
      }
      lines.push(formatResolveBullet(locale, "resolveReasonCode", issue.issueId));
    }
  } else {
    lines.push(formatResolveBullet(locale, "resolveResolvedKeys", formatResolvedKeys(result.value, locale)));
  }

  if (result.exitCode === 0 && context.sourcePaths !== undefined) {
    lines.push(formatResolveBullet(locale, "resolveSourcePaths", context.sourcePaths.join(", ")));
  }

  if (context.fallbackWarning !== undefined) {
    lines.push(
      formatResolveBullet(
        locale,
        "resolveFallbackSource",
        `${getCliMessage(locale, "resolveFallbackProjectSearch")}; ${locale === "zh-CN" ? "检查" : "check"} ${formatFallbackCheckPath(context)}`,
      ),
    );
  }

  for (const issue of result.issues) {
    if (issue.severity === "warning") {
      lines.push(
        formatResolveBullet(
          locale,
          "resolveFallbackSource",
          `${getCliMessage(locale, "resolveFallbackOptionalLayer")}; ${locale === "zh-CN" ? "检查" : "check"} ${issue.affectedPath ?? getCliMessage(locale, "resolveResolverLayer")}`,
        ),
      );
    }
  }

  lines.push("", getCliMessage(locale, "issues"));
  const issueLines = formatResolveHumanIssues(result, outcome, context);
  lines.push(...issueLines);

  lines.push("", getCliMessage(locale, "nextActions"));
  lines.push(...formatResolveHumanNextActions(result, outcome, context));

  return `${lines.join("\n")}\n`;
}

function getResolveHumanOutcome(
  result: { value: Record<string, unknown>; issues: ValidationIssue[]; exitCode: 0 | 1 },
  context: ResolveHumanContext,
): ResolveHumanOutcome {
  if (result.exitCode !== 0) {
    return "invalid-input";
  }
  if (Object.keys(result.value).length === 0) {
    return "unresolved";
  }
  if (result.issues.length > 0 || context.fallbackWarning !== undefined) {
    return "resolved-with-warnings";
  }
  return "resolved";
}

function summarizeResolveValue(
  result: { value: Record<string, unknown>; exitCode: 0 | 1 },
  outcome: ResolveHumanOutcome,
  locale: CliLocale,
): string {
  if (result.exitCode !== 0) return getCliMessage(locale, "resolveValueNotProduced");
  if (outcome === "unresolved") return getCliMessage(locale, "resolveValueEmptyObject");
  const keyCount = Object.keys(result.value).length;
  return formatCliMessage(locale, "resolveValueObjectWithKeys", {
    count: keyCount,
    keyLabel: keyCount === 1 ? "key" : "keys",
  });
}

function formatResolveSourcePath(
  result: ResolverResult,
  context: ResolveHumanContext,
  outcome: ResolveHumanOutcome,
  locale: CliLocale,
): string {
  if (result.exitCode !== 0 || outcome === "unresolved") {
    return getCliMessage(locale, "resolveSourcePathNone");
  }

  const requestedKeys = [...new Set(context.requestedKeys)];
  if (requestedKeys.length === 0) {
    return getCliMessage(locale, "resolveSourcePathMultiple");
  }

  const sourcePaths = requestedKeys
    .map((key) => result.sources[key]?.affectedPath)
    .filter((sourcePath): sourcePath is string => sourcePath !== undefined);
  if (sourcePaths.length === 0) {
    return getCliMessage(locale, "resolveSourcePathUnknown");
  }

  const uniqueSourcePaths = [...new Set(sourcePaths)];
  if (uniqueSourcePaths.length === 1 && sourcePaths.length === requestedKeys.length) {
    return uniqueSourcePaths[0] as string;
  }

  return getCliMessage(locale, "resolveSourcePathMultiple");
}

function formatRequestedKeys(keys: string[], locale: CliLocale): string {
  return keys.length === 0 ? getCliMessage(locale, "resolveRequestedKeyAll") : keys.join(", ");
}

function formatResolvedKeys(value: Record<string, unknown>, locale: CliLocale): string {
  const keys = Object.keys(value);
  return keys.length === 0 ? getCliMessage(locale, "resolveResolvedKeysNone") : keys.join(", ");
}

function formatResolveHumanIssues(
  result: { issues: ValidationIssue[] },
  outcome: ResolveHumanOutcome,
  context: ResolveHumanContext,
): string[] {
  const locale = context.locale;
  if (outcome === "resolved") {
    return [getCliMessage(locale, "noIssues")];
  }
  if (outcome === "unresolved") {
    return [
      formatResolveBullet(locale, "resolveReasonCode", getCliMessage(locale, "resolveUnresolvedReason")),
      formatResolveBullet(locale, "resolveMissingKey", formatRequestedKeys(context.requestedKeys, locale)),
    ];
  }

  return result.issues.map((issue) => {
    if (locale === "zh-CN") {
      const location = issue.affectedPath ?? issue.component ?? "command-level";
      const affectedPath = issue.affectedPath === undefined ? "" : ` affectedPath=${issue.affectedPath}`;
      return `- [${issue.severity}] severity=${issue.severity} category=${issue.category} issueId=${issue.issueId} location=${location}${affectedPath}${formatResolveIssueDetails(issue.details)} impact=${getCliMessage(locale, "issueImpactSummary")}`;
    }

    const affectedPath = issue.affectedPath === undefined ? "" : ` ${issue.affectedPath}`;
    return `- [${issue.severity}] ${issue.issueId}${affectedPath}: ${issue.impact}`;
  });
}

function formatResolveHumanNextActions(
  result: { issues: ValidationIssue[] },
  outcome: ResolveHumanOutcome,
  context: ResolveHumanContext,
): string[] {
  const locale = context.locale;
  if (outcome === "resolved") {
    return [`- ${getCliMessage(locale, "nextActionNone")}`];
  }
  if (outcome === "resolved-with-warnings") {
    return [`- ${getCliMessage(locale, "resolveActionWarnings")}`];
  }
  if (outcome === "unresolved") {
    return [`- ${getCliMessage(locale, "resolveActionUnresolved")}`];
  }

  const actions = result.issues.map((issue) => formatResolveIssueAction(issue, context));
  if (actions.length === 0) {
    return [`- ${getCliMessage(locale, "resolveActionSupportedShape")}`];
  }
  return [...new Set(actions)].map((action) => `- ${action}`);
}

function formatResolveIssueAction(issue: ValidationIssue, context: ResolveHumanContext): string {
  if (context.locale === "en-US") return issue.suggestedNextStep;

  return formatCliMessage(context.locale, "issueActionBlocking", {
    issueId: issue.issueId,
    affectedPath: issue.affectedPath ?? issue.component ?? "command-level",
    reason: getResolveIssueReasonCode(issue),
    command: `speclite resolve ${context.command} --human`,
  });
}

function getResolveIssueReasonCode(issue: ValidationIssue): string {
  const reason = issue.details?.reason;
  if (typeof reason === "string" && reason.length > 0) return reason;
  const status = issue.details?.status;
  if (typeof status === "string" && status.length > 0) return status;
  return issue.issueId;
}

function formatResolveIssueDetails(details: ValidationIssue["details"]): string {
  if (details === undefined) return "";
  const fields = Object.entries(details)
    .filter(([, value]) => value === null || ["string", "number", "boolean"].includes(typeof value))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`);
  return fields.length === 0 ? "" : ` details=${fields.join(";")}`;
}

function formatResolveBullet(
  locale: CliLocale,
  key: Parameters<typeof getCliMessage>[1],
  value: string,
): string {
  return locale === "zh-CN"
    ? `- ${getCliMessage(locale, key)}：${value}`
    : `- ${getCliMessage(locale, key)}: ${value}`;
}

function formatFallbackCheckPath(context: ResolveHumanContext): string {
  return context.sourcePaths?.find((sourcePath) => sourcePath.startsWith("_speclite/custom/")) ?? "_speclite/custom";
}

function basename(inputPath: string): string {
  const normalized = inputPath.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").pop() ?? inputPath;
}
