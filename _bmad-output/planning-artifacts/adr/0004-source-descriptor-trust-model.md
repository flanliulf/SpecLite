# Source Descriptor Trust Model（来源描述符信任模型）

SpecLite MVP separates source identity, integrity evidence, and write eligibility into a stable `SourceDescriptor` contract. A source is `trusted` only when expected hash, lock verification, or the bundled source equivalent packaging manifest / package hash / package lock match succeeds; `unverified` can still enter write planning only when the user explicitly selected the source and at least one reproducible evidence entry exists; `blocked` stops install/update before writing.

This decision keeps MVP usable for local tarballs, offline bundles, pinned Git commits, and local source snapshots without pretending they are fully trusted. It also avoids expanding MVP into full enterprise supply-chain governance. Full source lockfile lifecycle management, signatures, provenance checks, allowlists, and source policy enforcement remain Post-MVP. The semantic contract lives in `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md`.
