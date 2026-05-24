# Manifest And Index Contract Boundary（清单与索引契约边界）

SpecLite treats manifest and index files as installed-state projections, not as source truth and not as informal generated examples. Source-side truth remains module metadata and canonical skill packages under `assets/source/speclite/`; installed-side truth is the manifest/index projection of selected modules, source descriptor, IDE targets, phase coverage, installed files, ownership, and hashes.

This decision makes manifest/index fields, phase coverage matrix, package-level hashes, file-level hashes, and installed projections part of a canonical contract in `docs/specs/manifest-index-contract.md`. Adapter ids, target ids, target order, and adapter status semantics are owned by `docs/specs/ide-adapter-registry-contract.md`; fixture layout and release gate policy are owned by `docs/specs/fixture-contract.md`. ADRs may explain trade-offs, but must not redefine the field schema.
