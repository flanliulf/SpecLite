# Resolve Parity Fixture

This fixture documents the Story 2.4 release-gate surface for `speclite resolve config` and `speclite resolve customization`.

Layout:

- `input/config/` documents config resolver input grouping.
- `input/customization/` documents customization resolver input grouping.
- `input/config-broken-optional/` documents an otherwise valid config project with a malformed optional human-owned layer.
- `expected/config/` stores pure stdout JSON and stderr JSON Lines diagnostics for config parity cases.
- `expected/customization/` stores pure stdout JSON and stderr JSON Lines diagnostics for customization parity cases.

The executable tests create temporary local project trees from this fixture contract so assertions stay deterministic and do not capture absolute paths, timestamps, random ids, package-manager cache paths, or external network state. Expected stdout files are JSON objects only; they do not wrap `CommandResult` and do not include repair data.
