# ide-drift

Validates diagnostic-only IDE mirror drift detection. The input mutates only an IDE mirror package file; source truth, manifest and indexes remain stable. Expected validate JSON reports one ide-mirror.hash-mismatch issue and does not include repair execution payload.
