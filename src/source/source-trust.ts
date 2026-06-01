import type { SourceIntegrityEvidence } from "./source-descriptor-schema.js";

export type SourceTrustStatus = "trusted" | "unverified" | "blocked";

export function deriveSourceTrustStatus(input: {
  integrityEvidence: SourceIntegrityEvidence[];
  explicitlyConfirmed: boolean;
  hasBlockingIssue?: boolean | undefined;
}): SourceTrustStatus {
  if (input.hasBlockingIssue === true || input.integrityEvidence.length === 0) {
    return "blocked";
  }

  if (input.integrityEvidence.some((evidence) => evidence.verified)) {
    return "trusted";
  }

  return input.explicitlyConfirmed ? "unverified" : "blocked";
}
