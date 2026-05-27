# Resolve Parity Fixture

This fixture documents the Story 2.4 release-gate surface for `speclite resolve config` and `speclite resolve customization`.

The executable tests create temporary local project trees from this fixture contract so assertions stay deterministic and do not capture absolute paths, timestamps, random ids, package-manager cache paths, or external network state.
