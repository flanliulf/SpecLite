# Source Descriptor Contract（来源描述符契约）

## Status（状态）

Draft for MVP implementation.

## Ownership（所有权）

This SPEC is the canonical contract for `SourceDescriptor` and `SourceIntegrityEvidence` semantics across install, update, status, validate, manifest/index, and public command JSON.

`docs/specs/01-command-result-json-contract.en.md` owns the public JSON envelope and command payload shape. This SPEC owns source identity, trust, evidence, write eligibility, and source freshness boundaries.

## Source Descriptor（来源描述符）

MVP source descriptor shape:

```ts
type SourceDescriptor = {
  sourceType:
    | "npm"
    | "private-registry"
    | "local-tarball"
    | "offline-bundle"
    | "git"
    | "local";
  channel?: string;
  requestedVersion?: string;
  version?: string;
  resolvedRoot?: string;
  contentHash?: string;
  integrityEvidence: SourceIntegrityEvidence[];
  trustStatus: "trusted" | "unverified" | "blocked";
};
```

`version` means the resolved installed source version. If the user requested a version range, tag, dist-tag, branch, or other selector and that value must be exposed, it must use `requestedVersion`; it must not overwrite resolved `version`.

`resolvedRoot` represents the resolved canonical source tree root. If it appears in public JSON, it must be a project-relative POSIX path when it points inside the target project, or a redacted/display-safe source label when the resolved source is outside the target project. It must not expose npm cache paths, temporary extraction directories, local absolute source paths, home directories, drive letters, or OS-specific separators.

All path fields must use project-relative POSIX paths when they refer to installed project paths. Source origin values that are not project paths must be represented as redacted/display-safe source metadata and must not leak local absolute paths, credentials, registry tokens, private query strings, or host-specific cache/temp locations into stable public JSON.

## Integrity Evidence（完整性证据）

MVP evidence shape:

```ts
type SourceIntegrityEvidence =
  | {
      kind: "registry-integrity";
      packageName: string;
      version: string;
      integrity: string;
      verified: boolean;
    }
  | {
      kind: "version-lock";
      packageName: string;
      version: string;
      lockPath: string;
      verified: boolean;
    }
  | {
      kind: "content-hash";
      algorithm: "sha256";
      value: string;
      verified: boolean;
    }
  | {
      kind: "git-commit";
      commitSha: string;
      verified: boolean;
    };
```

`verified: false` means evidence is recorded and reproducible but not matched against an expected hash or lock. It must not represent failed verification. Hash mismatch, lock mismatch, unsupported source, floating Git source, or source policy rejection must produce a `source-integrity` issue and `trustStatus: "blocked"`.

## Trust Status（信任状态）

`trusted`:

- Produced only by expected hash or lock match in MVP.
- Not produced merely because a source type is npm, private registry, Git, tarball, offline bundle, or local source.

`unverified`:

- May enter install or update write planning only when the user explicitly selected that source, at least one reproducible integrity evidence entry exists, and no blocking source-integrity problem was detected.
- Represents installable source without a verified trust anchor.

`blocked`:

- Represents hash mismatch, lock mismatch, unsupported source, floating Git source without resolved commit SHA, failed evidence verification, or source policy rejection.
- Must stop install/update before writing.

## Source Type Rules（来源类型规则）

Registry sources:

- `npm` and `private-registry` must record package name, version, and `registry-integrity` or `version-lock` evidence.
- They become `trusted` only when lock or expected hash verification succeeds.
- Registry endpoint URLs, proxy URLs, authentication tokens, and credential-bearing query strings must not enter public JSON. Public source metadata must use package name, resolved version, registry label, or redacted host label.

Tarball and offline bundle:

- Must record `content-hash` evidence.
- `contentHash` is required for content-addressable artifacts.
- MVP requires an artifact hash for the tarball or offline bundle file itself. Tree hash for the unpacked canonical source tree is recommended as input to expected installed state, but it is not the same field as the artifact `contentHash`.
- If an unpacked tree hash is used as expected installed-state input, it must be computed from the canonical source tree allowlist after extraction. It must not be computed over raw extraction directories, cache directories, file mtimes, or platform metadata.
- Public source metadata must not expose local absolute tarball, bundle, cache, or extraction paths.

Git source:

- Must resolve to a concrete commit SHA before install planning or write planning.
- Branch-only, tag-only, or remote-url-only sources are floating sources and must be `blocked`.
- Commit SHA evidence may be `unverified` unless matched against an expected lock/hash.
- Public source metadata must not expose credential-bearing remote URLs. Use a redacted remote label plus resolved commit SHA when display is needed.

Local source:

- Must record snapshot hash or equivalent manifest hash as reproducible evidence.
- Snapshot hash scope is the canonical source tree allowlist only. It must exclude `.git`, temporary files, `node_modules`, fixture output, local cache directories, build output, and editor/OS metadata.
- Local absolute source paths must not enter stable public JSON snapshots.

## Source Staging And Cache（来源暂存与缓存）

Source staging directories, extraction directories, package-manager cache paths, and temporary Git checkout paths are private implementation state.

They must not appear in:

- public command JSON
- `ValidationIssue.details`
- fixture snapshots
- manifest/index files
- files index entries

Public output may use a redacted/display-safe source label instead.

Successful resolution and controlled failures should clean staging directories on a best-effort basis. Crash leftovers are not installer-owned project files and must not be recorded in the files index. `speclite validate` remains local installed-state validation; it must not scan package-manager caches, temporary extraction roots, or remote source origins.

## Source Lock Boundary（Source Lock 边界）

MVP may consume expected hash, version lock, registry integrity, content hash, snapshot hash, or Git commit SHA as minimal trust evidence.

MVP does not generate, refresh, rotate, migrate, or centrally manage a full source lockfile lifecycle. Full source lockfile management, provenance policy, signatures, allowlists, and enterprise source policy are Post-MVP.

## Validation Boundary（验证边界）

`speclite validate` is local-only. It checks recorded source descriptor and evidence shape, local manifest/index, files index, IDE mirrors, runtime path, menu target, artifact path, and local hash baseline.

`validate` must not access npm registries, Git remotes, offline bundle origins, private registry endpoints, or remote provenance services.

Remote freshness or provenance revalidation belongs to explicit install/update source resolution or Post-MVP `doctor`.
