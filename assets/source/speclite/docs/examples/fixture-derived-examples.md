# Fixture-Derived Examples（Fixture 派生示例）

## Fresh Install Tree（Fresh Install 目录树）

Source fixture: `test/fixtures/fresh-install-empty-project/expected/installed-tree.txt`.

```text
_speclite/
_speclite-output/
.claude/skills/
.agents/skills/
```

## Manifest And Index Excerpts（Manifest 与 Index 摘录）

Source fixture: `test/fixtures/fresh-install-empty-project/expected/installed-state/manifest-full.json`.

```json
{
  "schemaVersion": "speclite.manifest.v1",
  "paths": {
    "projectRoot": ".",
    "specliteRoot": "_speclite",
    "artifactRoot": "_speclite-output"
  }
}
```

## Status And Validate Output（Status 与 Validate 输出）

Source fixtures:

- `test/fixtures/path-portability/expected/command-json/status.json`
- `test/fixtures/path-portability/expected/command-json/validate.json`

```text
Status: configured
Validate: checked categories and issues are read from CommandResult data.
```

## Update Protection（Update 保护）

Source fixture: `test/fixtures/existing-install-update/expected/command-json/normal-update-success.json`.

```text
Human-owned custom files and workflow-owned artifacts are skipped by normal update.
```

These examples are packaged documentation examples. They are not release gate fixtures and do not define schema truth.
