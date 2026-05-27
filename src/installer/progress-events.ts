export const INSTALL_LIFECYCLE_STEP_IDS = [
  "source-discovery",
  "module-selection",
  "config-initialization",
  "runtime-structure",
  "ide-mirror-creation",
  "manifest-generation",
  "ready-check",
  "ready-summary",
] as const;

export type InstallLifecycleStepId = (typeof INSTALL_LIFECYCLE_STEP_IDS)[number];

export type InstallLifecycleState = {
  completedSteps: InstallLifecycleStepId[];
  pendingSteps: InstallLifecycleStepId[];
};

export type InstallProgressEvent = {
  stepId: InstallLifecycleStepId;
  status: "started" | "completed" | "failed";
  label: string;
};

export function projectInstallLifecycleState(input: {
  completedSteps: readonly string[];
}): InstallLifecycleState {
  const completed = new Set(input.completedSteps);
  const completedSteps = INSTALL_LIFECYCLE_STEP_IDS.filter((stepId) => completed.has(stepId));
  const completedStepSet = new Set(completedSteps);

  return {
    completedSteps,
    pendingSteps: INSTALL_LIFECYCLE_STEP_IDS.filter((stepId) => !completedStepSet.has(stepId)),
  };
}

export function createInstallProgressEvent(input: {
  stepId: InstallLifecycleStepId;
  status: InstallProgressEvent["status"];
}): InstallProgressEvent {
  return {
    ...input,
    label: input.stepId.replaceAll("-", " "),
  };
}
