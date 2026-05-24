# Source Descriptor Contract（来源描述符契约）

## Status（状态）

MVP implementation 草案。

## Ownership（所有权）

本 SPEC 是 install、update、status、validate、manifest/index 和 public command JSON 中 `SourceDescriptor` 与 `SourceIntegrityEvidence` semantics 的 canonical contract。

`docs/specs/01-command-result-json-contract.md` 负责 public JSON envelope 和 command payload shape。本 SPEC 负责 source identity、trust、evidence、write eligibility 和 source freshness boundaries。

## Source Descriptor（来源描述符）

MVP source descriptor shape：

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

`version` 表示 resolved installed source version。如果用户请求的是 version range、tag、dist-tag、branch 或其他 selector，且该值必须暴露，则必须使用 `requestedVersion`；它不得覆盖 resolved `version`。

`resolvedRoot` 表示 resolved canonical source tree root。如果它出现在 public JSON 中，当它指向 target project 内部时必须是 project-relative POSIX path；当 resolved source 位于 target project 外部时，必须是 redacted/display-safe source label。它不得暴露 npm cache paths、temporary extraction directories、local absolute source paths、home directories、drive letters 或 OS-specific separators。

所有 path fields 在引用 installed project paths 时必须使用 project-relative POSIX paths。不是 project paths 的 source origin values 必须表示为 redacted/display-safe source metadata，并且不得把 local absolute paths、credentials、registry tokens、private query strings 或 host-specific cache/temp locations 泄露到 stable public JSON。

## Integrity Evidence（完整性证据）

MVP evidence shape：

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

`verified: false` 表示 evidence 已记录且可复现，但未与 expected hash 或 lock 匹配。它不得表示 failed verification。Hash mismatch、lock mismatch、unsupported source、floating Git source 或 source policy rejection 必须产生 `source-integrity` issue 和 `trustStatus: "blocked"`。

## Trust Status（信任状态）

`trusted`：

- 在 MVP 中只能由 expected hash 或 lock match 产生。
- 不得仅因为 source type 是 npm、private registry、Git、tarball、offline bundle 或 local source 就产生。

`unverified`：

- 只有当用户显式选择该 source、至少存在一个 reproducible integrity evidence entry，且没有检测到 blocking source-integrity problem 时，才可以进入 install 或 update write planning。
- 表示没有 verified trust anchor 的 installable source。

`blocked`：

- 表示 hash mismatch、lock mismatch、unsupported source、没有 resolved commit SHA 的 floating Git source、failed evidence verification 或 source policy rejection。
- 必须在写入前停止 install/update。

## Source Type Rules（来源类型规则）

Registry sources：

- `npm` 和 `private-registry` 必须记录 package name、version，以及 `registry-integrity` 或 `version-lock` evidence。
- 只有当 lock 或 expected hash verification 成功时，它们才会变为 `trusted`。
- Registry endpoint URLs、proxy URLs、authentication tokens 和 credential-bearing query strings 不得进入 public JSON。Public source metadata 必须使用 package name、resolved version、registry label 或 redacted host label。

Tarball and offline bundle：

- 必须记录 `content-hash` evidence。
- 对 content-addressable artifacts，`contentHash` 是 required。
- MVP 要求 tarball 或 offline bundle 文件本身具备 artifact hash。推荐将 unpacked canonical source tree 的 tree hash 作为 expected installed state 的输入，但它不是 artifact `contentHash` 字段。
- 如果使用 unpacked tree hash 作为 expected installed-state input，则必须在 extraction 后基于 canonical source tree allowlist 计算。不得基于 raw extraction directories、cache directories、file mtimes 或 platform metadata 计算。
- Public source metadata 不得暴露 local absolute tarball、bundle、cache 或 extraction paths。

Git source：

- 在 install planning 或 write planning 前，必须 resolve 到具体 commit SHA。
- Branch-only、tag-only 或 remote-url-only sources 是 floating sources，必须为 `blocked`。
- 除非与 expected lock/hash 匹配，否则 Commit SHA evidence 可以是 `unverified`。
- Public source metadata 不得暴露 credential-bearing remote URLs。需要显示时，使用 redacted remote label 加 resolved commit SHA。

Local source：

- 必须记录 snapshot hash 或等价的 manifest hash 作为 reproducible evidence。
- Snapshot hash scope 仅限 canonical source tree allowlist。它必须排除 `.git`、temporary files、`node_modules`、fixture output、local cache directories、build output 和 editor/OS metadata。
- Local absolute source paths 不得进入 stable public JSON snapshots。

## Source Staging And Cache（来源暂存与缓存）

Source staging directories、extraction directories、package-manager cache paths 和 temporary Git checkout paths 是 private implementation state。

它们不得出现在：

- public command JSON
- `ValidationIssue.details`
- fixture snapshots
- manifest/index files
- files index entries

Public output 可以改用 redacted/display-safe source label。

Successful resolution 和 controlled failures 应在 best-effort 基础上清理 staging directories。Crash leftovers 不是 installer-owned project files，且不得记录到 files index。`speclite validate` 仍然是 local installed-state validation；它不得扫描 package-manager caches、temporary extraction roots 或 remote source origins。

## Source Lock Boundary（Source Lock 边界）

MVP 可以消费 expected hash、version lock、registry integrity、content hash、snapshot hash 或 Git commit SHA，作为 minimal trust evidence。

MVP 不生成、刷新、轮换、迁移或集中管理完整 source lockfile lifecycle。完整 source lockfile management、provenance policy、signatures、allowlists 和 enterprise source policy 属于 Post-MVP。

## Validation Boundary（验证边界）

`speclite validate` 仅限 local。它检查 recorded source descriptor 和 evidence shape、local manifest/index、files index、IDE mirrors、runtime path、menu target、artifact path 和 local hash baseline。

`validate` 不得访问 npm registries、Git remotes、offline bundle origins、private registry endpoints 或 remote provenance services。

Remote freshness 或 provenance revalidation 属于显式 install/update source resolution，或 Post-MVP `doctor`。
