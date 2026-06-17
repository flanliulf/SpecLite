import { createColors } from "picocolors";
import type { HumanOutputOptions } from "./output.js";

type StyleFn = (value: string) => string;

export type HumanOutputStyle = {
  sectionTitle: StyleFn;
  outcome: StyleFn;
  command: StyleFn;
};

const identity: StyleFn = (value) => value;
const colors = createColors(true);

export function createHumanOutputStyle(options: HumanOutputOptions = {}): HumanOutputStyle {
  if (!shouldUseAnsi(options)) {
    return {
      sectionTitle: identity,
      outcome: identity,
      command: identity,
    };
  }

  return {
    sectionTitle: colors.bold,
    outcome: (value) => styleOutcome(value),
    command: colors.cyan,
  };
}

function shouldUseAnsi(options: HumanOutputOptions): boolean {
  if (process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== "") return false;
  if (process.env.CI !== undefined && process.env.CI !== "") return false;
  if (options.noColor === true) return false;
  if (options.ci === true) return false;
  if (options.isTty === false) return false;

  return options.isTty === true || process.stdout.isTTY === true;
}

function styleOutcome(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("ready") || normalized.includes("valid")) {
    if (normalized.includes("not ready") || normalized.includes("invalid") || normalized.includes("failed")) {
      return colors.red(value);
    }
    if (normalized.includes("prewrite-paused") || normalized.includes("plan-ready")) return colors.cyan(value);
    if (normalized.includes("ready-check-failed")) return colors.red(value);
    return colors.green(value);
  }
  if (normalized.includes("prewrite-paused") || normalized.includes("plan-ready")) return colors.cyan(value);
  if (normalized.includes("blocked") || normalized.includes("failure") || normalized.includes("failed")) return colors.red(value);
  if (normalized.includes("warning") || normalized.includes("partial")) return colors.yellow(value);
  return value;
}
