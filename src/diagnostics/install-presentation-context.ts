import type { InstallCommandResult } from "./command-result-schema.js";

const INSTALL_TARGET_PRESENTATION_KEY = "__specliteInstallTargetPresentation";

export type InstallTargetPresentationContext = {
  commandCwd: string;
  displayPath: string;
  pathSafeTarget: string;
  targetPath: string;
};

export function annotateInstallTargetPresentation(
  result: InstallCommandResult,
  context: InstallTargetPresentationContext,
): void {
  Object.defineProperty(result, INSTALL_TARGET_PRESENTATION_KEY, {
    value: context,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export function getInstallTargetPresentation(
  result: InstallCommandResult,
): InstallTargetPresentationContext | undefined {
  return (result as InstallCommandResult & {
    [INSTALL_TARGET_PRESENTATION_KEY]?: InstallTargetPresentationContext;
  })[INSTALL_TARGET_PRESENTATION_KEY];
}
