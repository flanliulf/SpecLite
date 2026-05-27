import type { OfficialModule } from "./module-metadata.js";

export type ModuleSelection = {
  availableModules: OfficialModule[];
  selectedModuleIds: string[];
  defaultSelectedModuleIds: string[];
  requiredModuleIds: string[];
  userSelectedModuleIds: string[];
  invalidModuleIds: string[];
};

export function createModuleSelection(input: {
  modules: OfficialModule[];
  userSelectedModuleIds?: string[];
}): ModuleSelection {
  const orderedModuleIds = input.modules.map((module) => module.code);
  const moduleById = new Map(input.modules.map((module) => [module.code, module]));
  const requestedUserIds = [...new Set(input.userSelectedModuleIds ?? [])].sort();
  const invalidModuleIds = requestedUserIds.filter((moduleId) => !moduleById.has(moduleId));
  const userSelectedModuleIds = requestedUserIds.filter((moduleId) => moduleById.has(moduleId));
  const defaultSelectedModuleIds = input.modules
    .filter((module) => module.defaultSelected)
    .map((module) => module.code);
  const requiredModuleIds = input.modules
    .filter((module) => module.required)
    .map((module) => module.code);
  const seedIds =
    userSelectedModuleIds.length > 0
      ? [...requiredModuleIds, ...userSelectedModuleIds]
      : [...requiredModuleIds, ...defaultSelectedModuleIds];
  const selected = new Set<string>();

  for (const moduleId of seedIds) {
    addWithDependencies(moduleId, selected, moduleById);
  }

  return {
    availableModules: input.modules,
    selectedModuleIds: orderedModuleIds.filter((moduleId) => selected.has(moduleId)),
    defaultSelectedModuleIds: orderedModuleIds.filter((moduleId) =>
      defaultSelectedModuleIds.includes(moduleId),
    ),
    requiredModuleIds: orderedModuleIds.filter((moduleId) => requiredModuleIds.includes(moduleId)),
    userSelectedModuleIds: orderedModuleIds.filter((moduleId) =>
      userSelectedModuleIds.includes(moduleId),
    ),
    invalidModuleIds,
  };
}

function addWithDependencies(
  moduleId: string,
  selected: Set<string>,
  moduleById: Map<string, OfficialModule>,
): void {
  const module = moduleById.get(moduleId);
  if (module === undefined || selected.has(moduleId)) {
    return;
  }

  for (const dependencyId of module.requiredDependencies) {
    addWithDependencies(dependencyId, selected, moduleById);
  }
  selected.add(moduleId);
}
