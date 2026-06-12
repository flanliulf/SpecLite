export type CliLocale = "zh-CN" | "en-US";

export type CliLocaleInput = {
  flag?: string | undefined;
  env?: NodeJS.ProcessEnv | undefined;
};

const SUPPORTED_LOCALES = new Set<CliLocale>(["zh-CN", "en-US"]);

export function resolveCliLocale(input: CliLocaleInput = {}): CliLocale {
  const requested = input.flag ?? input.env?.SPECLITE_LOCALE;
  return isCliLocale(requested) ? requested : "zh-CN";
}

function isCliLocale(value: string | undefined): value is CliLocale {
  return value !== undefined && SUPPORTED_LOCALES.has(value as CliLocale);
}
