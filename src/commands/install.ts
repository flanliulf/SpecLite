import process from "node:process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createInstallFailureResult,
  createInstallSuccessResult,
  DEFAULT_INSTALL_MANIFEST_VERSION,
  resolveTargetProjectDisplayName,
} from "../diagnostics/command-result.js";
import type {
  CommandPathSummary,
  IdeTargetStatus,
  InstallCommandResult,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import {
  annotateInstallTargetPresentation,
  type InstallTargetPresentationContext,
} from "../diagnostics/install-presentation-context.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import {
  createConfigInitializationPlan,
  createConfigInitializationPromptInput,
  type ConfigInitializationPromptInput,
  type ConfigInitializationSelection,
} from "../installer/config-initialization.js";
import { createInstallCommandContext } from "../installer/install-context.js";
import {
  InstallPlanSchema,
  type InstallPlan,
  type InstallPlanTargetAdapter,
} from "../installer/install-plan-schema.js";
import { INSTALL_LIFECYCLE_STEP_IDS } from "../installer/progress-events.js";
import { runReadyCheck } from "../installer/ready-check.js";
import { applyInstallPlan } from "../installer/runtime-structure.js";
import { evaluateRuntimeGuard, type RuntimeFacts } from "../installer/runtime-guard.js";
import { inspectTargetDirectory, type TargetDirectoryState } from "../installer/target-directory.js";
import {
  discoverOfficialModules,
  ModuleMetadataError,
  type OfficialModule,
} from "../modules/module-metadata.js";
import { createModuleSelection } from "../modules/module-selection.js";
import {
  createMissingBundledSourceEvidenceIssue,
  discoverBundledSourceDescriptor,
} from "../source/source-discovery.js";
import type { SourceDescriptor } from "../source/source-descriptor-schema.js";
import {
  createBlockedSourceDescriptor,
  createSourceResolutionPlan,
  createUnconfirmedSourceAccessIssue,
  createUnsupportedSourceResolutionIssue,
  normalizeSourceSelection,
  type SourceSelectionInput,
} from "../source/source-selection.js";
import {
  createDefaultRegistryMetadataClient,
  resolveRegistrySource,
  type RegistryMetadataClient,
  type RegistryRuntimeConfig,
} from "../source/registry-source-resolver.js";
import {
  createDefaultGitClient,
  resolveGitSource,
  type GitClient,
} from "../source/git-source-resolver.js";
import { resolveLocalSource } from "../source/local-source-resolver.js";
import { createLocalSourceIntegrityIssue } from "../source/source-integrity.js";

export type { ConfigInitializationPromptInput, ConfigInitializationSelection };

const UNAVAILABLE_INSTALL_MANIFEST_VERSION = "unavailable" as const;
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function createInstallTargetPresentation(input: {
  cwd: string;
  targetDirectory?: string;
  targetRoot: string;
  displayPath: string;
}): InstallTargetPresentationContext {
  const rawTarget = input.targetDirectory?.trim();
  let pathSafeTarget = input.displayPath;
  if (rawTarget !== undefined && rawTarget.length > 0) {
    pathSafeTarget = path.isAbsolute(rawTarget) ? input.targetRoot : rawTarget;
  }

  return {
    commandCwd: input.cwd,
    displayPath: input.displayPath,
    pathSafeTarget,
    targetPath: input.targetRoot,
  };
}

function withInstallTargetPresentation<T extends InstallCommandOutcome>(
  outcome: T,
  context: InstallTargetPresentationContext,
): T {
  annotateInstallTargetPresentation(outcome.result, context);
  return outcome;
}

export type InstallCommandOptions = {
  json?: boolean;
  yes?: boolean;
  sourceType?: string;
  sourceValue?: string;
  requestedVersion?: string;
  channel?: string;
};

export type InstallCommandRuntime = Partial<RuntimeFacts> & {
  cwd?: string;
  targetProject?: string;
};

export type ModuleSelectionPromptInput = {
  modules: OfficialModule[];
  defaultSelectedModuleIds: string[];
  requiredModuleIds: string[];
};

export type InstallCommandOutcome = {
  result: InstallCommandResult;
  exitCode: number;
  installPlan?: InstallPlan;
};

export type PrewriteInstallScopeConfirmationInput = {
  prompt: string;
  localizedPrompts?: Record<string, string>;
};

export type SourceAccessConfirmationInput = {
  prompt: string;
};

export function getCurrentRuntimeFacts(runtime: InstallCommandRuntime = {}): RuntimeFacts {
  return {
    nodeVersion: runtime.nodeVersion ?? process.version,
    platform: runtime.platform ?? process.platform,
    platformRelease: runtime.platformRelease ?? os.release(),
  };
}

export async function runInstallCommand(input: {
  options?: InstallCommandOptions;
  runtime?: InstallCommandRuntime;
  projectRoot?: string;
  selectModuleIds?: (input: ModuleSelectionPromptInput) => Promise<string[]>;
  configureProject?: (
    input: ConfigInitializationPromptInput,
  ) => Promise<ConfigInitializationSelection>;
  confirmSourceAccess?: (input: SourceAccessConfirmationInput) => Promise<void>;
  confirmPrewriteInstallScope?: (
    input: PrewriteInstallScopeConfirmationInput,
  ) => Promise<void>;
  registryClient?: RegistryMetadataClient;
  gitClient?: GitClient;
  privateRegistryRuntimeConfig?: RegistryRuntimeConfig;
  targetDirectory?: string;
} = {}): Promise<InstallCommandOutcome> {
  const projectRoot = input.projectRoot ?? PACKAGE_ROOT;
  const runtimeFacts = getCurrentRuntimeFacts(input.runtime);
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetPresentation = createInstallTargetPresentation({
    cwd,
    targetRoot: normalizedTarget.targetRoot,
    displayPath: normalizedTarget.displayPath,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const guardResult = evaluateRuntimeGuard(runtimeFacts);

  if (!guardResult.ok) {
    const result = createInstallFailureResult({
      targetProject,
      issues: [guardResult.issue],
      completedSteps: [],
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: guardResult.nextActions,
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const targetDirectoryState = await inspectTargetDirectory({
    targetRoot: normalizedTarget.targetRoot,
  });
  const completedSteps: string[] = [];
  const pendingSteps = [...INSTALL_LIFECYCLE_STEP_IDS];
  const context = createInstallCommandContext({
    cwd,
    targetProject,
    projectRootDisplay: normalizedTarget.displayPath,
    paths: normalizedTarget.paths,
    runtime: runtimeFacts,
    completedSteps: guardResult.completedSteps,
    requiresConfirmation: true,
    writeAuthorized: input.options?.yes ?? false,
  });

  if (targetDirectoryState.issues.length > 0) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: targetDirectoryState.issues,
      completedSteps,
      pendingSteps,
      nextActions: [
        "Run speclite validate or inspect the existing manifest before continuing.",
        "Do not run fresh install until existing installed state is understood.",
      ],
      summary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
      data: createTargetStateData(targetDirectoryState, normalizedTarget.paths),
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  if (shouldStopBeforeSourceSelection(targetDirectoryState, context.writeAuthorized)) {
    const result = createInstallSuccessResult({
      targetProject: context.targetProject,
      completedSteps,
      pendingSteps,
      summary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
      nextActions: createTargetNextActions(
        targetDirectoryState,
        context.writeAuthorized,
        normalizedTarget.displayPath,
      ),
      data: createTargetStateData(targetDirectoryState, normalizedTarget.paths),
    });

    return withInstallTargetPresentation({ result, exitCode: 0 }, targetPresentation);
  }

  const sourceSelection = normalizeSourceSelection(createSourceSelectionInput(input.options));
  if (!sourceSelection.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [sourceSelection.issue],
      completedSteps,
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: [
        "Choose one of the supported source types before continuing install.",
        "No source resolver, operation lock or project write was started.",
      ],
      summary:
        "SpecLite install stopped during source selection because the requested source input is invalid. No project files were changed.",
      data: createTargetStateData(targetDirectoryState, normalizedTarget.paths),
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  let sourceResolutionPlan = createSourceResolutionPlan({
    selection: sourceSelection.selection,
    confirmed: sourceSelection.selection.sourceType === "bundled",
  });
  if (sourceSelection.selection.sourceType !== "bundled") {
    if (input.confirmSourceAccess !== undefined) {
      await input.confirmSourceAccess({
        prompt: createSourceAccessConfirmationPrompt(sourceResolutionPlan),
      });
      sourceResolutionPlan = createSourceResolutionPlan({
        selection: sourceSelection.selection,
        confirmed: true,
      });
    }
  }

  if (sourceSelection.selection.sourceType !== "bundled" && !sourceResolutionPlan.confirmed) {
    const sourceDescriptor = createBlockedSourceDescriptor(sourceSelection.selection);
    const unconfirmedAccessKind = isRegistrySource(sourceSelection.selection.sourceType)
      ? "registry"
      : "source";
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createUnconfirmedSourceAccessIssue(sourceSelection.selection)],
      completedSteps: ["source-discovery"],
      pendingSteps: [
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      nextActions: [
        `Confirm external access intent before enabling ${sourceSelection.selection.sourceType} source resolution.`,
        unconfirmedAccessKind === "registry"
          ? "No registry metadata, operation lock or project write was started."
          : "No source artifact, operation lock or project write was started.",
      ],
      summary:
        unconfirmedAccessKind === "registry"
          ? "SpecLite install recorded source selection and external access intent, then stopped before registry source access. No project files were changed."
          : "SpecLite install recorded source selection and external access intent, then stopped before source access. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  if (isRegistrySource(sourceSelection.selection.sourceType)) {
    const registryResolution = await resolveRegistrySource({
      selection: sourceSelection.selection,
      registryClient: input.registryClient ?? createDefaultRegistryMetadataClient(),
      ...(sourceSelection.selection.sourceType === "private-registry" &&
      input.privateRegistryRuntimeConfig !== undefined
        ? { runtimeConfig: input.privateRegistryRuntimeConfig }
        : {}),
    });
    if (!registryResolution.ok) {
      const result = createInstallFailureResult({
        targetProject: context.targetProject,
        issues: registryResolution.issues,
        completedSteps: ["source-discovery"],
        pendingSteps: [
          "module-selection",
          "config-initialization",
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        nextActions: [
          "Resolve the source-integrity issue before enabling install planning.",
          "No operation lock or project write was started.",
        ],
        summary:
          "SpecLite install stopped during registry source resolution. No project files were changed.",
        data: {
          ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
          sourceDescriptor: registryResolution.descriptor,
        },
      });

      return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
    }

    const registryInstallOutcome = await continueInstallWithSourceDescriptor({
      input,
      projectRoot,
      targetDirectoryState,
      normalizedTarget,
      context,
      completedSteps,
      sourceResolutionPlan,
      sourceDescriptor: registryResolution.descriptor,
    });
    return withInstallTargetPresentation(registryInstallOutcome, targetPresentation);
  }

  if (isLocalArtifactOrPathSource(sourceSelection.selection.sourceType)) {
    const localResolution = await resolveLocalSource({
      selection: sourceSelection.selection,
      sourceValue: input.options?.sourceValue ?? "",
      targetProjectRoot: normalizedTarget.targetRoot,
      sourceBaseRoot: cwd,
    });
    if (!localResolution.ok) {
      const result = createInstallFailureResult({
        targetProject: context.targetProject,
        issues: localResolution.issues,
        completedSteps: ["source-discovery"],
        pendingSteps: [
          "module-selection",
          "config-initialization",
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        nextActions: [
          "Resolve the source-integrity issue before enabling install planning.",
          "No operation lock or project write was started.",
        ],
        summary:
          "SpecLite install stopped during local source resolution. No project files were changed.",
        data: {
          ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
          sourceDescriptor: localResolution.descriptor,
        },
      });

      return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
    }

    if (localResolution.installSourceRoot === undefined) {
      const result = createInstallFailureResult({
        targetProject: context.targetProject,
        issues: [
          createLocalSourceIntegrityIssue({
            issueId: "source-integrity.unsupported-source",
            reason: "local-artifact-install-source-unavailable",
            sourceType: sourceSelection.selection.sourceType,
          }),
        ],
        completedSteps: ["source-discovery"],
        pendingSteps: [
          "module-selection",
          "config-initialization",
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        nextActions: [
          "Use a local canonical source tree or add extractor staging before enabling install planning.",
          "No operation lock or project write was started.",
        ],
        summary:
          "SpecLite install stopped after local source resolution because this local artifact does not provide a canonical source tree for install planning. No project files were changed.",
        data: {
          ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
          sourceDescriptor: localResolution.descriptor,
        },
      });

      return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
    }

    const localInstallOutcome = await continueInstallWithSourceDescriptor({
      input,
      projectRoot,
      targetDirectoryState,
      normalizedTarget,
      context,
      completedSteps,
      sourceResolutionPlan,
      sourceDescriptor: localResolution.descriptor,
      installSourceRoot: localResolution.installSourceRoot,
      ...(localResolution.descriptor.resolvedRoot === undefined
        ? {}
        : { installSourceRefRoot: localResolution.descriptor.resolvedRoot }),
    });
    return withInstallTargetPresentation(localInstallOutcome, targetPresentation);
  }

  if (sourceSelection.selection.sourceType === "git") {
    const gitResolution = await resolveGitSource({
      selection: sourceSelection.selection,
      gitClient: input.gitClient ?? createDefaultGitClient(),
    });
    if (!gitResolution.ok) {
      const result = createInstallFailureResult({
        targetProject: context.targetProject,
        issues: gitResolution.issues,
        completedSteps: ["source-discovery"],
        pendingSteps: [
          "module-selection",
          "config-initialization",
          "runtime-structure",
          "ide-mirror-creation",
          "manifest-generation",
          "ready-check",
          "ready-summary",
        ],
        nextActions: [
          "Resolve the source-integrity issue before enabling install planning.",
          "No operation lock or project write was started.",
        ],
        summary:
          "SpecLite install stopped during Git source resolution. No project files were changed.",
        data: {
          ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
          sourceDescriptor: gitResolution.descriptor,
        },
      });

      return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
    }

    const gitInstallOutcome = await continueInstallWithSourceDescriptor({
      input,
      projectRoot,
      targetDirectoryState,
      normalizedTarget,
      context,
      completedSteps,
      sourceResolutionPlan,
      sourceDescriptor: gitResolution.descriptor,
    });
    return withInstallTargetPresentation(gitInstallOutcome, targetPresentation);
  }

  if (sourceSelection.selection.sourceType !== "bundled") {
    const sourceDescriptor = createBlockedSourceDescriptor(sourceSelection.selection);
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createUnsupportedSourceResolutionIssue(sourceSelection.selection)],
      completedSteps: ["source-discovery"],
      pendingSteps: [
        "module-selection",
        "config-initialization",
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
        "ready-check",
        "ready-summary",
      ],
      nextActions: [
        `Review external access intent before enabling ${sourceSelection.selection.sourceType} source resolution.`,
        "Use bundled source or a supported Story 5.3 local source type.",
      ],
      summary:
        "SpecLite install recorded source selection and external access intent, then stopped before source-specific resolution. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const sourceDescriptor = await discoverBundledSourceDescriptor({ projectRoot });
  if (sourceDescriptor.trustStatus === "blocked") {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createMissingBundledSourceEvidenceIssue()],
      completedSteps,
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: [
        "Restore bundled source packaging evidence before continuing.",
        "Rerun speclite install --yes after the package evidence anchor is available.",
      ],
      summary:
        "SpecLite install stopped before module selection because bundled source integrity evidence is missing. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const modulesResult = await discoverModulesForInstall({ projectRoot });
  if (!modulesResult.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [modulesResult.issue],
      completedSteps,
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: ["Fix bundled official module metadata before continuing install."],
      summary:
        "SpecLite install stopped before module selection because official modules could not be discovered. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const defaultModuleSelection = createModuleSelection({ modules: modulesResult.modules });
  const userSelectedModuleIds =
    input.options?.json === true || input.selectModuleIds === undefined
      ? undefined
      : await input.selectModuleIds({
          modules: modulesResult.modules,
          defaultSelectedModuleIds: defaultModuleSelection.defaultSelectedModuleIds,
          requiredModuleIds: defaultModuleSelection.requiredModuleIds,
        });
  const moduleSelection = createModuleSelection({
    modules: modulesResult.modules,
    ...(userSelectedModuleIds === undefined ? {} : { userSelectedModuleIds }),
  });
  const moduleSelectionCompletedSteps = ["source-discovery", "module-selection"];
  const moduleSelectionPendingSteps = [
    "config-initialization",
    "runtime-structure",
    "ide-mirror-creation",
    "manifest-generation",
    "ready-check",
    "ready-summary",
  ];
  const selectedModules = modulesResult.modules.filter((module) =>
    moduleSelection.selectedModuleIds.includes(module.code),
  );
  const defaultTargetAdapters = createDefaultTargetAdapters();

  if (moduleSelection.invalidModuleIds.length > 0) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createInvalidModuleSelectionIssue(moduleSelection.invalidModuleIds)],
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: [
        "Choose one or more module ids from the displayed official module list.",
        "Rerun speclite install after correcting the module selection.",
      ],
      summary:
        "SpecLite install stopped before write planning because the module selection contains unknown module ids. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const configPromptInput = createConfigInitializationPromptInput({
    selectedModules,
    targetAdapters: defaultTargetAdapters,
  });
  const configSelection =
    input.options?.json === true || input.configureProject === undefined
      ? undefined
      : await input.configureProject({
          ...configPromptInput,
          prompt: createPrewriteModuleSummary({
            selectedModules,
            sourceDescriptor,
            targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
            configPrompt: configPromptInput.prompt,
          }),
        });
  const unsupportedTargetIds = findUnsupportedTargetIds(
    configSelection?.ideTargetIds,
    defaultTargetAdapters,
  );
  if (unsupportedTargetIds.length > 0) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createUnsupportedTargetSelectionIssue(unsupportedTargetIds, defaultTargetAdapters)],
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: [
        "Select IDE targets from the supported adapter registry: claude or agents.",
        "Dedicated Copilot, Cursor or other branded IDE targets are outside the MVP adapter registry.",
      ],
      summary:
        "SpecLite install stopped before write planning because the selected IDE target is unsupported. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }
  const finalSelectedModuleIds = selectKnownIds({
    requestedIds: configSelection?.selectedModuleIds,
    defaultIds: moduleSelection.selectedModuleIds,
    allowedIds: moduleSelection.selectedModuleIds,
  });
  const finalSelectedModules = modulesResult.modules.filter((module) =>
    finalSelectedModuleIds.includes(module.code),
  );
  const finalTargetAdapters = selectTargetAdapters(
    defaultTargetAdapters,
    configSelection?.ideTargetIds,
  );
  const configPlan = await createConfigInitializationPlan({
    targetRoot: normalizedTarget.targetRoot,
    targetProject: context.targetProject,
    selectedModules: finalSelectedModules,
    mode: configSelection?.mode ?? "quick",
    ...(configSelection?.values === undefined ? {} : { values: configSelection.values }),
    selectedModuleIds: finalSelectedModuleIds,
    ideTargetIds: finalTargetAdapters.map((adapter) => adapter.targetId),
    targetAdapters: finalTargetAdapters,
  });

  if (!configPlan.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: configPlan.issues,
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: configPlan.nextActions,
      summary: configPlan.summary,
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1 }, targetPresentation);
  }

  const configInitializationCompletedSteps = [...moduleSelectionCompletedSteps, "config-initialization"];
  const finalPrewriteSummary = createFinalPrewriteInstallScopeSummary({
    selectedModules: finalSelectedModules,
    sourceDescriptor,
    targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
    configPlan,
    targetAdapters: finalTargetAdapters,
  });
  if (input.options?.json !== true && input.confirmPrewriteInstallScope !== undefined) {
    await input.confirmPrewriteInstallScope({
      prompt: finalPrewriteSummary,
      localizedPrompts: {
        "zh-CN": createFinalPrewriteInstallScopeSummary({
          selectedModules: finalSelectedModules,
          sourceDescriptor,
          targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
          configPlan,
          targetAdapters: finalTargetAdapters,
          locale: "zh-CN",
        }),
      },
    });
  }
  const installPlan = InstallPlanSchema.parse({
    sourceDescriptor,
    selectedModules: finalSelectedModuleIds,
    targetAdapters: finalTargetAdapters,
    externalAccesses: sourceResolutionPlan.externalAccesses,
    plannedWrites: configPlan.plannedWrites,
    requiresConfirmation: context.requiresConfirmation,
    writeAuthorized: context.writeAuthorized,
  });

  const applyResult = await applyInstallPlan({
    targetRoot: normalizedTarget.targetRoot,
    packageRoot: projectRoot,
    sourceDescriptor,
    installPlan,
    selectedModules: finalSelectedModules,
    configPlan,
  });

  if (!applyResult.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [applyResult.issue],
      completedSteps: [...configInitializationCompletedSteps, ...applyResult.completedSteps],
      pendingSteps: applyResult.pendingSteps,
      nextActions: [
        "Resolve the reported write-phase blocker and rerun speclite install --yes.",
        ...(applyResult.changedPaths.length === 0
          ? []
          : [`Review completed changed paths before rerun: ${applyResult.changedPaths.join(", ")}`]),
        "Do not treat the install as ready until Story 1.6 ReadyCheck runs successfully.",
      ],
      summary:
        "SpecLite install stopped during runtime structure, artifact directory, IDE mirror or manifest/index creation. ReadyCheck and ready summary remain pending.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1, installPlan }, targetPresentation);
  }

  const readyCheck = await runReadyCheck({
    projectRoot: normalizedTarget.targetRoot,
    sourceDescriptor,
    installedModules: applyResult.installedModules,
    selectedModules: finalSelectedModules,
    ideTargets: applyResult.ideTargets,
    paths: applyResult.paths,
  });

  if (!readyCheck.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [readyCheck.issue],
      completedSteps: [
        ...configInitializationCompletedSteps,
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
      ],
      pendingSteps: readyCheck.pendingSteps,
      nextActions: [
        "Resolve the reported local readiness blocker and rerun speclite install --yes.",
        "Do not treat the install as ready until ReadyCheck runs successfully.",
      ],
      summary:
        "SpecLite install completed write phases, but ReadyCheck failed. Ready summary remains pending.",
      data: {
        manifestVersion: DEFAULT_INSTALL_MANIFEST_VERSION,
        installedModules: applyResult.installedModules,
        ideTargets: applyResult.ideTargets,
        paths: applyResult.paths,
        sourceDescriptor,
      },
    });

    return withInstallTargetPresentation({ result, exitCode: 1, installPlan }, targetPresentation);
  }

  const result = createInstallSuccessResult({
    targetProject: context.targetProject,
    completedSteps: [
      ...configInitializationCompletedSteps,
      "runtime-structure",
      "ide-mirror-creation",
      "manifest-generation",
      "ready-check",
      "ready-summary",
    ],
    pendingSteps: [],
    summary: createInstalledReadySummary({
      selectedModules: finalSelectedModules,
      sourceDescriptor,
      paths: readyCheck.paths,
      configPlan,
      ideTargets: readyCheck.ideTargets,
    }),
    nextActions: [
      "Open installed skills in .claude/skills or .agents/skills from your configured IDE.",
      "For Codex, review and trust project-local hooks with /hooks before relying on Flow Gate enforcement.",
      "Run speclite status to inspect the installed-state summary.",
      "Run speclite validate for deeper local validation when needed.",
    ],
    data: {
      manifestVersion: readyCheck.manifestVersion,
      installedModules: readyCheck.installedModules,
      ideTargets: readyCheck.ideTargets,
      paths: readyCheck.paths,
      sourceDescriptor,
    },
  });
  annotateInstallReadyPresentation(result, {
    installFlow: configSelection === undefined ? "default-no-prompt" : "explicit-interactive",
    configMode: configPlan.mode,
  });

  return withInstallTargetPresentation({ result, exitCode: 0, installPlan }, targetPresentation);
}

async function continueInstallWithSourceDescriptor(input: {
  input: {
    options?: InstallCommandOptions;
    selectModuleIds?: (input: ModuleSelectionPromptInput) => Promise<string[]>;
    configureProject?: (
      input: ConfigInitializationPromptInput,
    ) => Promise<ConfigInitializationSelection>;
    confirmPrewriteInstallScope?: (
      input: PrewriteInstallScopeConfirmationInput,
    ) => Promise<void>;
  };
  projectRoot: string;
  targetDirectoryState: TargetDirectoryState;
  normalizedTarget: ReturnType<typeof normalizeTargetDirectory>;
  context: ReturnType<typeof createInstallCommandContext>;
  completedSteps: string[];
  sourceResolutionPlan: ReturnType<typeof createSourceResolutionPlan>;
  sourceDescriptor: SourceDescriptor;
  installSourceRoot?: string;
  installSourceRefRoot?: string;
}): Promise<InstallCommandOutcome> {
  const {
    input: commandInput,
    projectRoot,
    targetDirectoryState,
    normalizedTarget,
    context,
    completedSteps,
    sourceResolutionPlan,
    sourceDescriptor,
    installSourceRoot,
    installSourceRefRoot,
  } = input;

  const modulesResult = await discoverModulesForInstall({
    projectRoot,
    ...(installSourceRoot === undefined ? {} : { sourceRoot: installSourceRoot }),
  });
  if (!modulesResult.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [modulesResult.issue],
      completedSteps,
      pendingSteps: [...INSTALL_LIFECYCLE_STEP_IDS],
      nextActions: ["Fix bundled official module metadata before continuing install."],
      summary:
        "SpecLite install stopped before module selection because official modules could not be discovered. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1 };
  }

  const defaultModuleSelection = createModuleSelection({ modules: modulesResult.modules });
  const userSelectedModuleIds =
    commandInput.options?.json === true || commandInput.selectModuleIds === undefined
      ? undefined
      : await commandInput.selectModuleIds({
          modules: modulesResult.modules,
          defaultSelectedModuleIds: defaultModuleSelection.defaultSelectedModuleIds,
          requiredModuleIds: defaultModuleSelection.requiredModuleIds,
        });
  const moduleSelection = createModuleSelection({
    modules: modulesResult.modules,
    ...(userSelectedModuleIds === undefined ? {} : { userSelectedModuleIds }),
  });
  const moduleSelectionCompletedSteps = ["source-discovery", "module-selection"];
  const moduleSelectionPendingSteps = [
    "config-initialization",
    "runtime-structure",
    "ide-mirror-creation",
    "manifest-generation",
    "ready-check",
    "ready-summary",
  ];
  const selectedModules = modulesResult.modules.filter((module) =>
    moduleSelection.selectedModuleIds.includes(module.code),
  );
  const defaultTargetAdapters = createDefaultTargetAdapters();

  if (moduleSelection.invalidModuleIds.length > 0) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createInvalidModuleSelectionIssue(moduleSelection.invalidModuleIds)],
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: [
        "Choose one or more module ids from the displayed official module list.",
        "Rerun speclite install after correcting the module selection.",
      ],
      summary:
        "SpecLite install stopped before write planning because the module selection contains unknown module ids. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1 };
  }

  const configPromptInput = createConfigInitializationPromptInput({
    selectedModules,
    targetAdapters: defaultTargetAdapters,
  });
  const configSelection =
    commandInput.options?.json === true || commandInput.configureProject === undefined
      ? undefined
      : await commandInput.configureProject({
          ...configPromptInput,
          prompt: createPrewriteModuleSummary({
            selectedModules,
            sourceDescriptor,
            targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
            configPrompt: configPromptInput.prompt,
          }),
        });
  const unsupportedTargetIds = findUnsupportedTargetIds(
    configSelection?.ideTargetIds,
    defaultTargetAdapters,
  );
  if (unsupportedTargetIds.length > 0) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [createUnsupportedTargetSelectionIssue(unsupportedTargetIds, defaultTargetAdapters)],
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: [
        "Select IDE targets from the supported adapter registry: claude or agents.",
        "Dedicated Copilot, Cursor or other branded IDE targets are outside the MVP adapter registry.",
      ],
      summary:
        "SpecLite install stopped before write planning because the selected IDE target is unsupported. No project files were changed.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1 };
  }
  const finalSelectedModuleIds = selectKnownIds({
    requestedIds: configSelection?.selectedModuleIds,
    defaultIds: moduleSelection.selectedModuleIds,
    allowedIds: moduleSelection.selectedModuleIds,
  });
  const finalSelectedModules = modulesResult.modules.filter((module) =>
    finalSelectedModuleIds.includes(module.code),
  );
  const finalTargetAdapters = selectTargetAdapters(
    defaultTargetAdapters,
    configSelection?.ideTargetIds,
  );
  const configPlan = await createConfigInitializationPlan({
    targetRoot: normalizedTarget.targetRoot,
    targetProject: context.targetProject,
    selectedModules: finalSelectedModules,
    mode: configSelection?.mode ?? "quick",
    ...(configSelection?.values === undefined ? {} : { values: configSelection.values }),
    selectedModuleIds: finalSelectedModuleIds,
    ideTargetIds: finalTargetAdapters.map((adapter) => adapter.targetId),
    targetAdapters: finalTargetAdapters,
  });

  if (!configPlan.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: configPlan.issues,
      completedSteps: moduleSelectionCompletedSteps,
      pendingSteps: moduleSelectionPendingSteps,
      nextActions: configPlan.nextActions,
      summary: configPlan.summary,
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1 };
  }

  const configInitializationCompletedSteps = [...moduleSelectionCompletedSteps, "config-initialization"];
  const finalPrewriteSummary = createFinalPrewriteInstallScopeSummary({
    selectedModules: finalSelectedModules,
    sourceDescriptor,
    targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
    configPlan,
    targetAdapters: finalTargetAdapters,
  });
  if (commandInput.options?.json !== true && commandInput.confirmPrewriteInstallScope !== undefined) {
    await commandInput.confirmPrewriteInstallScope({
      prompt: finalPrewriteSummary,
      localizedPrompts: {
        "zh-CN": createFinalPrewriteInstallScopeSummary({
          selectedModules: finalSelectedModules,
          sourceDescriptor,
          targetSummary: createTargetSummary(targetDirectoryState, normalizedTarget.displayPath),
          configPlan,
          targetAdapters: finalTargetAdapters,
          locale: "zh-CN",
        }),
      },
    });
  }
  const installPlan = InstallPlanSchema.parse({
    sourceDescriptor,
    selectedModules: finalSelectedModuleIds,
    targetAdapters: finalTargetAdapters,
    externalAccesses: sourceResolutionPlan.externalAccesses,
    plannedWrites: configPlan.plannedWrites,
    requiresConfirmation: context.requiresConfirmation,
    writeAuthorized: context.writeAuthorized,
  });

  const applyResult = await applyInstallPlan({
    targetRoot: normalizedTarget.targetRoot,
    packageRoot: projectRoot,
    ...(installSourceRoot === undefined ? {} : { sourceRoot: installSourceRoot }),
    ...(installSourceRefRoot === undefined ? {} : { sourceRefRoot: installSourceRefRoot }),
    sourceDescriptor,
    installPlan,
    selectedModules: finalSelectedModules,
    configPlan,
  });

  if (!applyResult.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [applyResult.issue],
      completedSteps: [...configInitializationCompletedSteps, ...applyResult.completedSteps],
      pendingSteps: applyResult.pendingSteps,
      nextActions: [
        "Resolve the reported write-phase blocker and rerun speclite install --yes.",
        ...(applyResult.changedPaths.length === 0
          ? []
          : [`Review completed changed paths before rerun: ${applyResult.changedPaths.join(", ")}`]),
        "Do not treat the install as ready until Story 1.6 ReadyCheck runs successfully.",
      ],
      summary:
        "SpecLite install stopped during runtime structure, artifact directory, IDE mirror or manifest/index creation. ReadyCheck and ready summary remain pending.",
      data: {
        ...createTargetStateData(targetDirectoryState, normalizedTarget.paths),
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1, installPlan };
  }

  const readyCheck = await runReadyCheck({
    projectRoot: normalizedTarget.targetRoot,
    sourceDescriptor,
    installedModules: applyResult.installedModules,
    selectedModules: finalSelectedModules,
    ideTargets: applyResult.ideTargets,
    paths: applyResult.paths,
  });

  if (!readyCheck.ok) {
    const result = createInstallFailureResult({
      targetProject: context.targetProject,
      issues: [readyCheck.issue],
      completedSteps: [
        ...configInitializationCompletedSteps,
        "runtime-structure",
        "ide-mirror-creation",
        "manifest-generation",
      ],
      pendingSteps: readyCheck.pendingSteps,
      nextActions: [
        "Resolve the reported local readiness blocker and rerun speclite install --yes.",
        "Do not treat the install as ready until ReadyCheck runs successfully.",
      ],
      summary:
        "SpecLite install completed write phases, but ReadyCheck failed. Ready summary remains pending.",
      data: {
        manifestVersion: DEFAULT_INSTALL_MANIFEST_VERSION,
        installedModules: applyResult.installedModules,
        ideTargets: applyResult.ideTargets,
        paths: applyResult.paths,
        sourceDescriptor,
      },
    });

    return { result, exitCode: 1, installPlan };
  }

  const result = createInstallSuccessResult({
    targetProject: context.targetProject,
    completedSteps: [
      ...configInitializationCompletedSteps,
      "runtime-structure",
      "ide-mirror-creation",
      "manifest-generation",
      "ready-check",
      "ready-summary",
    ],
    pendingSteps: [],
    summary: createInstalledReadySummary({
      selectedModules: finalSelectedModules,
      sourceDescriptor,
      paths: readyCheck.paths,
      configPlan,
      ideTargets: readyCheck.ideTargets,
    }),
    nextActions: [
      "Open installed skills in .claude/skills or .agents/skills from your configured IDE.",
      "For Codex, review and trust project-local hooks with /hooks before relying on Flow Gate enforcement.",
      "Run speclite status to inspect the installed-state summary.",
      "Run speclite validate for deeper local validation when needed.",
    ],
    data: {
      manifestVersion: readyCheck.manifestVersion,
      installedModules: readyCheck.installedModules,
      ideTargets: readyCheck.ideTargets,
      paths: readyCheck.paths,
      sourceDescriptor,
    },
  });
  annotateInstallReadyPresentation(result, {
    installFlow: configSelection === undefined ? "default-no-prompt" : "explicit-interactive",
    configMode: configPlan.mode,
  });

  return { result, exitCode: 0, installPlan };
}

const INSTALL_READY_PRESENTATION_KEY = "__specliteInstallReadyPresentation";

type InstallReadyPresentation = {
  installFlow: "default-no-prompt" | "explicit-interactive";
  configMode: "quick" | "detailed";
};

function annotateInstallReadyPresentation(
  result: ReturnType<typeof createInstallSuccessResult>,
  presentation: InstallReadyPresentation,
): void {
  Object.defineProperty(result, INSTALL_READY_PRESENTATION_KEY, {
    value: presentation,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

function createSourceSelectionInput(
  options: InstallCommandOptions | undefined,
): SourceSelectionInput {
  return {
    ...(options?.sourceType === undefined ? {} : { sourceType: options.sourceType }),
    ...(options?.sourceValue === undefined ? {} : { sourceValue: options.sourceValue }),
    ...(options?.requestedVersion === undefined
      ? {}
      : { requestedVersion: options.requestedVersion }),
    ...(options?.channel === undefined ? {} : { channel: options.channel }),
  };
}

function isRegistrySource(sourceType: string): sourceType is "npm" | "private-registry" {
  return sourceType === "npm" || sourceType === "private-registry";
}

function isLocalArtifactOrPathSource(
  sourceType: string,
): sourceType is "local-tarball" | "offline-bundle" | "local" {
  return sourceType === "local-tarball" || sourceType === "offline-bundle" || sourceType === "local";
}

function createSourceAccessConfirmationPrompt(sourceResolutionPlan: ReturnType<typeof createSourceResolutionPlan>): string {
  const externalAccessLines = sourceResolutionPlan.externalAccesses.map((access) =>
    [
      `sourceType=${access.sourceType}`,
      `sourceValue=${access.sourceValue}`,
      `reason=${access.reason}`,
      `confirmationState=${access.confirmationState}`,
    ].join("; "),
  );

  return [
    "Confirm source access before SpecLite reads external metadata or local artifacts.",
    ...externalAccessLines,
    "No operation lock or project write has started.",
  ].join("\n");
}

function createInstalledReadySummary(input: {
  selectedModules: OfficialModule[];
  sourceDescriptor: SourceDescriptor;
  paths: CommandPathSummary;
  configPlan: Extract<Awaited<ReturnType<typeof createConfigInitializationPlan>>, { ok: true }>;
  ideTargets: IdeTargetStatus[];
}): string {
  const selectedModuleDetails = input.selectedModules
    .map((module) => `${module.code} (${module.name} ${module.version})`)
    .join(", ");
  const selectedModuleIds = input.selectedModules.map((module) => module.code).join(", ");

  return [
    `Source: ${input.sourceDescriptor.sourceType} ${input.sourceDescriptor.resolvedRoot ?? "unknown"}.`,
    "Final configuration summary confirmed.",
    `Config mode: ${input.configPlan.mode}.`,
    `Project name: ${input.configPlan.model.core.project_name}.`,
    `User display name: ${input.configPlan.model.core.user_name}.`,
    `Languages: communication=${input.configPlan.model.core.communication_language}, document=${input.configPlan.model.core.document_output_language}.`,
    `Selected modules: ${selectedModuleIds}.`,
    `Canonical package roots: ${formatModulePackageRootCounts(input.selectedModules)}.`,
    `Installed modules: ${selectedModuleDetails}.`,
    `IDE targets: ${input.ideTargets.map((target) => `${target.id} (${target.skillCount ?? 0} skills at ${target.targetPath ?? "not-configured"})`).join(", ")}.`,
    `Runtime path: ${input.paths.specliteRoot ?? "_speclite"}.`,
    `Artifact root: ${input.paths.artifactRoot ?? "_speclite-output"}.`,
    `Manifest path: ${input.paths.manifestPath ?? "_speclite/_config/manifest.yaml"}.`,
    "Runtime structure, artifact directories, IDE mirrors, manifest/index projections and ReadyCheck passed.",
  ].join(" ");
}

function createFinalPrewriteInstallScopeSummary(input: {
  selectedModules: OfficialModule[];
  sourceDescriptor: SourceDescriptor;
  targetSummary: string;
  configPlan: Extract<Awaited<ReturnType<typeof createConfigInitializationPlan>>, { ok: true }>;
  targetAdapters: InstallPlanTargetAdapter[];
  locale?: "en-US" | "zh-CN";
}): string {
  const locale = input.locale ?? "en-US";
  const selectedModuleDetails = input.selectedModules
    .map((module) => `${module.code} (${module.name} ${module.version})`)
    .join(", ");
  const capabilityScope = input.selectedModules
    .map((module) => `${module.code}: ${module.capabilitySummary.join(", ") || module.description}`)
    .join("; ");
  const plannedConfigWrites = input.configPlan.plannedWrites
    .map((write) => `${write.path}=${write.action}`)
    .join(", ");
  const targetIds = input.targetAdapters
    .map((adapter) => `${adapter.targetId} (${adapter.targetDirectory})`)
    .join(", ");
  const heading = locale === "zh-CN"
    ? "Step 3/4 Final pre-write review（最终写入前复核）"
    : "Step 3/4 Final pre-write review";
  const labels = locale === "zh-CN"
    ? {
      reviewState: "Review state（复核状态）",
      target: "Target（目标）",
      sourceDescriptor: "Source descriptor（来源描述）",
      configMode: "Config mode（配置模式）",
      selectedModules: "Selected modules（已选模块）",
      ideTargets: "IDE targets（IDE 目标）",
      plannedWrites: "Planned writes（计划写入）",
      pendingPhases: "Pending phases（待处理阶段）",
      writeBoundary: "Write boundary（写入边界）",
    }
    : {
      reviewState: "Review state",
      target: "Target",
      sourceDescriptor: "Source descriptor",
      configMode: "Config mode",
      selectedModules: "Selected modules",
      ideTargets: "IDE targets",
      plannedWrites: "Planned writes",
      pendingPhases: "Pending phases",
      writeBoundary: "Write boundary",
    };

  return [
    heading,
    "",
    labels.reviewState,
    "projectFilesWritten=false",
    "writeStartsAfterConfirmation=true",
    "",
    labels.target,
    input.targetSummary,
    "",
    labels.sourceDescriptor,
    `sourceType=${input.sourceDescriptor.sourceType}`,
    `resolvedRoot=${input.sourceDescriptor.resolvedRoot ?? "unknown"}`,
    `trustStatus=${input.sourceDescriptor.trustStatus}`,
    "",
    labels.configMode,
    `mode=${input.configPlan.mode}`,
    "",
    labels.selectedModules,
    selectedModuleDetails,
    `canonicalPackageRoots=${formatModulePackageRootCounts(input.selectedModules)}`,
    `capabilityScope=${capabilityScope}`,
    "",
    labels.ideTargets,
    targetIds,
    "",
    labels.plannedWrites,
    plannedConfigWrites,
    "",
    labels.pendingPhases,
    "config-initialization, runtime-structure, artifact-directory, ide-mirror-creation, manifest-generation, ready-check, ready-summary",
    "",
    labels.writeBoundary,
    "confirmationWillWrite=_speclite/, _speclite-output/, IDE mirrors, manifest/index",
  ].join("\n");
}

function formatModulePackageRootCounts(modules: OfficialModule[]): string {
  const total = modules.reduce((sum, module) => sum + module.packageRoots.length, 0);
  const perModule = modules
    .map((module) => `${module.code}=${module.packageRoots.length}`)
    .join(", ");

  return `${perModule}, total=${total}`;
}

function shouldStopBeforeSourceSelection(
  state: TargetDirectoryState,
  writeAuthorized: boolean,
): boolean {
  return (
    !writeAuthorized ||
    state.kind === "regular-file" ||
    state.kind === "unsafe-symlink" ||
    state.kind === "existing-install"
  );
}

function createTargetSummary(state: TargetDirectoryState, displayPath: string): string {
  const publicDisplayPath = formatTargetDisplayPath(displayPath);
  switch (state.kind) {
    case "missing":
      return `Target: ${publicDisplayPath}. Directory state: missing. After confirmation, the target directory can be created by a later install stage; no project files were changed.`;
    case "empty":
      return `Target: ${publicDisplayPath}. Directory state: empty. After confirmation, later install stages may create SpecLite runtime files; no project files were changed.`;
    case "non-empty":
      return `Target: ${publicDisplayPath}. Directory state: non-empty. After confirmation, later install stages may continue against this project root; no project files were changed.`;
    case "regular-file":
      return `Target: ${publicDisplayPath}. Directory state: regular-file. Choose a directory target before install continues; no project files were changed.`;
    case "unsafe-symlink":
      return `Target: ${publicDisplayPath}. Directory state: unsafe-symlink. Symlink targets are not inspected as project roots because they can escape the project boundary; no project files were changed.`;
    case "existing-install":
      return [
        `Target: ${publicDisplayPath}.`,
        "Directory state: existing-install.",
        `Detected runtime: ${state.detectedRuntime ? "present" : "not-present"}.`,
        `Manifest version: ${state.manifestVersion ?? UNAVAILABLE_INSTALL_MANIFEST_VERSION}.`,
        `IDE targets: ${formatIdeTargets(state.ideTargets)}.`,
        "Next action: review the existing SpecLite install before continuing.",
        "No project files were changed.",
      ].join(" ");
  }
}

function formatTargetDisplayPath(displayPath: string): string {
  return displayPath === "." ? "current directory" : displayPath;
}

function createTargetNextActions(
  state: TargetDirectoryState,
  writeAuthorized: boolean,
  targetDisplayPath: string,
): string[] {
  if (state.kind === "existing-install") {
    return [
      "Review the existing SpecLite install before continuing.",
      "Run speclite status or speclite validate for installed-state details.",
    ];
  }

  if (state.kind === "regular-file") {
    return ["Choose a directory target before continuing with install."];
  }

  if (state.kind === "unsafe-symlink") {
    return ["Choose a real project directory before continuing with install."];
  }

  if (!writeAuthorized) {
    return [
      `Run speclite install ${targetDisplayPath} --yes to install with defaults.`,
      `Run speclite install ${targetDisplayPath} --yes --interactive to customize installation.`,
    ];
  }

  return ["Target directory is confirmed; continue with source selection in the next install stage."];
}

function createTargetStateData(
  state: TargetDirectoryState,
  paths: ReturnType<typeof normalizeTargetDirectory>["paths"],
): {
  manifestVersion: string;
  installedModules: string[];
  ideTargets: IdeTargetStatus[];
  paths: CommandPathSummary;
} {
  return {
    manifestVersion:
      state.kind === "existing-install"
        ? (state.manifestVersion ?? UNAVAILABLE_INSTALL_MANIFEST_VERSION)
        : DEFAULT_INSTALL_MANIFEST_VERSION,
    installedModules: state.kind === "existing-install" ? state.installedModules : [],
    ideTargets: state.kind === "existing-install" ? state.ideTargets : [],
    paths,
  };
}

async function discoverModulesForInstall(input: { projectRoot: string; sourceRoot?: string }): Promise<
  | {
      ok: true;
      modules: OfficialModule[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  try {
    const modules = await discoverOfficialModules(input);
    if (modules.length === 0) {
      return {
        ok: false,
        issue: createUnsupportedSourceIssue({
          reason: "no-official-modules",
          impact: "No valid installable official modules were found in bundled source metadata.",
          suggestedNextStep: "Restore bundled module.yaml and SKILL.md package roots.",
        }),
      };
    }

    return { ok: true, modules };
  } catch (error) {
    if (error instanceof ModuleMetadataError && error.code === "module-metadata.unknown-help-skill") {
      return {
        ok: false,
        issue: {
          issueId: "menu-target.unknown-skill",
          category: "menu-target",
          severity: "error",
          component: "official-module-discovery",
          details: {
            reason: error.code,
          },
          impact: "Bundled help/menu metadata references a canonical skill package that is not installed from source.",
          suggestedNextStep: "Fix module-help.csv so every skill entry references exactly one bundled SKILL.md package root.",
        },
      };
    }

    return {
      ok: false,
      issue: createUnsupportedSourceIssue({
        reason: error instanceof ModuleMetadataError ? error.code : "module-metadata-unreadable",
        impact: "Bundled official module metadata is invalid or unreadable.",
        suggestedNextStep: "Fix bundled module.yaml, module-help.csv and SKILL.md package roots.",
      }),
    };
  }
}

function createUnsupportedSourceIssue(input: {
  reason: string;
  impact: string;
  suggestedNextStep: string;
}): ValidationIssue {
  return {
    issueId: "source-integrity.unsupported-source",
    category: "source-integrity",
    severity: "error",
    component: "official-module-discovery",
    details: {
      reason: input.reason,
    },
    impact: input.impact,
    suggestedNextStep: input.suggestedNextStep,
  };
}

function createInvalidModuleSelectionIssue(invalidModuleIds: string[]): ValidationIssue {
  return {
    issueId: "source-integrity.unsupported-source",
    category: "source-integrity",
    severity: "error",
    component: "official-module-selection",
    details: {
      invalidModuleIds,
    },
    impact: "The requested official module selection contains unknown module ids.",
    suggestedNextStep: "Select only module ids from the displayed official module list.",
  };
}

function findUnsupportedTargetIds(
  requestedTargetIds: string[] | undefined,
  targetAdapters: InstallPlanTargetAdapter[],
): string[] {
  if (requestedTargetIds === undefined) {
    return [];
  }

  const supportedTargetIds = new Set<string>(targetAdapters.map((adapter) => adapter.targetId));
  return [
    ...new Set(requestedTargetIds.filter((targetId) => !supportedTargetIds.has(targetId))),
  ].sort();
}

function createUnsupportedTargetSelectionIssue(
  unsupportedTargetIds: string[],
  targetAdapters: InstallPlanTargetAdapter[],
): ValidationIssue {
  return {
    issueId: "ide-mirror.unsupported-target",
    category: "ide-mirror",
    severity: "error",
    component: "adapter-registry",
    details: {
      unsupportedTargetIds,
      supportedTargetIds: targetAdapters.map((adapter) => adapter.targetId),
    },
    impact: "The selected IDE target is not supported by the MVP self-contained skill entry adapter registry.",
    suggestedNextStep: "Use claude or agents as the IDE target for MVP installs.",
  };
}

function createDefaultTargetAdapters(): InstallPlanTargetAdapter[] {
  return getIdeAdapterRegistry().map((adapter) => ({
    targetId: adapter.id,
    targetDirectory: adapter.targetDirectory,
    status: "planned",
  }));
}

function selectKnownIds(input: {
  requestedIds: string[] | undefined;
  defaultIds: string[];
  allowedIds: string[];
}): string[] {
  if (input.requestedIds === undefined) {
    return input.defaultIds;
  }

  const requested = new Set(input.requestedIds);
  const selectedIds = input.allowedIds.filter((id) => requested.has(id));
  return selectedIds.length === 0 ? input.defaultIds : selectedIds;
}

function selectTargetAdapters(
  targetAdapters: InstallPlanTargetAdapter[],
  requestedTargetIds: string[] | undefined,
): InstallPlanTargetAdapter[] {
  if (requestedTargetIds === undefined) {
    return targetAdapters;
  }

  const requested = new Set(requestedTargetIds);
  const selectedAdapters = targetAdapters.filter((adapter) => requested.has(adapter.targetId));
  return selectedAdapters.length === 0 ? targetAdapters : selectedAdapters;
}

function createPrewriteModuleSummary(input: {
  selectedModules: OfficialModule[];
  sourceDescriptor: SourceDescriptor;
  targetSummary: string;
  configPrompt: string;
}): string {
  const selectedModules = input.selectedModules
    .map((module) => `${module.code} (${module.name} ${module.version})`)
    .join(", ");
  const capabilityScope = input.selectedModules
    .map((module) => `${module.code}: ${module.capabilitySummary.join(", ") || module.description}`)
    .join("; ");

  return [
    input.targetSummary,
    `Source: ${input.sourceDescriptor.sourceType} ${input.sourceDescriptor.resolvedRoot ?? "unknown"}.`,
    `Selected modules: ${selectedModules}.`,
    `Canonical package roots: ${formatModulePackageRootCounts(input.selectedModules)}.`,
    `Capability scope: ${capabilityScope}.`,
    input.configPrompt,
    "Pending: runtime structure creation, IDE mirror creation, manifest/index generation, ReadyCheck and ready summary have not happened.",
    "No project files were changed.",
  ].join(" ");
}

function formatIdeTargets(ideTargets: IdeTargetStatus[]): string {
  if (ideTargets.length === 0) {
    return "none";
  }

  return ideTargets
    .map((target) =>
      target.targetPath === undefined
        ? `${target.id}=${target.status}`
        : `${target.id}=${target.status} (${target.targetPath})`,
    )
    .join(", ");
}
