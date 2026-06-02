# Rule Consistency Findings（规则一致性发现）

- 生成时间：2026-05-28T04:04:26.592Z
- Variant policy：`assets/source/speclite/canonical-data-variant-policy.json`
- Finding 数量：0
- Accepted Variant 数量：6

未发现脚本可判定的一致性候选。
## Accepted Variants（已声明变体）

### accepted-basename-variant

- Basename：`domain-complexity.csv`
- Variant Count：2
- Reason：PRD and validation skills use domain compliance guidance; create-architecture keeps a phase-specific architecture complexity and research topic mapping.
  - `speclite-create-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/domain-complexity.csv`
  - `speclite-validate-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/domain-complexity.csv`
  - `speclite-create-architecture` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/domain-complexity.csv`

### accepted-basename-variant

- Basename：`project-types.csv`
- Variant Count：2
- Reason：Product planning skills share the PRD discovery schema; create-architecture keeps a phase-specific starter mapping schema under the same legacy basename.
  - `speclite-document-project` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/project-types.csv`
  - `speclite-create-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/project-types.csv`
  - `speclite-edit-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/data/project-types.csv`
  - `speclite-validate-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/project-types.csv`
  - `speclite-create-architecture` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/project-types.csv`

### accepted-basename-variant

- Basename：`speclite-manifest.json`
- Variant Count：2
- Reason：Each skill-local manifest describes that skill's capability registration and is expected to differ by skill.
  - `speclite-prfaq` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq/data/speclite-manifest.json`
  - `speclite-product-brief` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief/data/speclite-manifest.json`

### accepted-local-config-key-context-variant

- Basename：`domain-complexity.csv`
- Value：`suggested_workflow`
- Skill Count：3
- Reason：The field is scoped by domain-complexity.csv variant policy.
  - `speclite-create-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/domain-complexity.csv:1`
  - `speclite-validate-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/domain-complexity.csv:1`
  - `speclite-create-architecture` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/domain-complexity.csv:1`

### accepted-local-config-key-context-variant

- Basename：`domain-complexity.csv`
- Value：`web_searches`
- Skill Count：3
- Reason：The field is scoped by domain-complexity.csv variant policy.
  - `speclite-create-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/domain-complexity.csv:1`
  - `speclite-validate-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/domain-complexity.csv:1`
  - `speclite-create-architecture` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/domain-complexity.csv:1`

### accepted-local-config-key-context-variant

- Basename：`project-types.csv`
- Value：`detection_signals`
- Skill Count：5
- Reason：The field is scoped by project-types.csv variant policy.
  - `speclite-document-project` -> `assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project/data/project-types.csv:1`
  - `speclite-create-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd/data/project-types.csv:1`
  - `speclite-edit-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd/data/project-types.csv:1`
  - `speclite-validate-prd` -> `assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd/data/project-types.csv:1`
  - `speclite-create-architecture` -> `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture/data/project-types.csv:1`

