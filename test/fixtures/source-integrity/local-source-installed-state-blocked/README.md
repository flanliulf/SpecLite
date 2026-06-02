# local-source-installed-state-blocked

Source type: local.
TrustStatus expectation: blocked.
Expected issues: source-integrity.local-source-self-reference.
Write planning eligibility: blocked before writes.
Redaction assertions: public fixture files use display-safe labels and omit machine-specific paths, secrets, temporary locations, dependency roots, build roots, raw errors and stack traces.
Owning SPEC references: 01-command-result-json-contract.md, 02-source-descriptor-contract.md, 03-install-plan-contract.md, 07-validation-issue-taxonomy.md, 08-fixture-contract.md.
