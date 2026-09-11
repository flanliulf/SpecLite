---
outputFile: '{solutioning_artifacts}/implementation-readiness-report/grill-consistency/implementation-readiness-report-{{date}}.md'
---

Legacy readiness evidence remains discoverable in place. Inventory existing
`{planning_artifacts}/implementation-readiness-report-*.md` and
`{planning_artifacts}/ir-grill/` read-only when present; never migrate, rename,
delete, overwrite, or select those paths as the destination for a new report.

# Step 1: Document Discovery

## STEP GOAL:

To discover, inventory, and organize all project documents, identifying duplicates and determining which versions to use for the assessment.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are an expert Product Manager
- ✅ Your focus is on finding organizing and documenting what exists
- ✅ You identify ambiguities and ask for clarification
- ✅ Success is measured in clear file inventory and conflict resolution

### Step-Specific Rules:

- 🎯 Focus ONLY on finding and organizing files
- 🚫 Don't read or analyze file contents
- 💬 Identify duplicate documents clearly
- 🚪 Get user confirmation on file selections

## EXECUTION PROTOCOLS:

- 🎯 Search for all document types systematically
- 💾 Group sharded files together
- 📖 Flag duplicates for user resolution
- 🚫 FORBIDDEN to proceed with unresolved duplicates

## DOCUMENT DISCOVERY PROCESS:

### 1. Initialize Document Discovery

"Beginning **Document Discovery** to inventory all project files.

I will:

1. Search for all required documents (PRD, Architecture, Epics, UX)
2. Group sharded documents together
3. Identify any duplicates (whole + sharded versions)
4. Present findings for your confirmation"

### 2. Document Search Patterns

在初始化 readiness report 或写入任何 inventory/progress state 前，PRD、Architecture 与 Epics 必须分别运行 `speclite resolve artifact-documents --subject <subject> --project-root {project-root}`，其中 `<subject>` 依次取 `prd`、`architecture`、`epics`。只加载各次 machine JSON 的 `consumedPaths`，并记录 `resolvedRoot`、`resolutionMode`、`actualConsumedPath`、`discoveryShape`、`ambiguityStatus` 与 selection source。若返回 whole+sharded ambiguity，向用户请求当前 invocation 的选择后用 `--selection whole|sharded` 重跑；任何 `continuation=block` 都必须 HALT 并保持 zero artifact write 和 zero progress mutation。不得自行定义 precedence、混合 shapes 或迁移 artifacts。

UX 使用同一 `speclite resolve artifact-roots --project-root {project-root}` 的 Planning root evidence：优先只读检查 `{planning_artifacts}/ux/ux-design-specification.md`，缺失时才检查 legacy `{planning_artifacts}/ux-design-specification.md`。Canonical 与 legacy 同时存在时只消费 canonical；只存在 legacy 时原位消费且不得迁移、复制、重命名、删除或改写 config。记录 Planning root 的 `resolvedRoot`、`resolutionMode` 与所选 project-relative `actualConsumedPath`；UX HTML、design-system、screenshots 与 assets 只从所选 UX document 的同目录/`ux/` 边界按需读取。

Search for each document type using these patterns:

#### A. PRD Documents

- Whole: `{planning_artifacts}/prd/prd.md`
- Sharded: resolver-declared `{planning_artifacts}/prd/index.md` and `consumedPaths`

#### B. Architecture Documents

- Whole: `{solutioning_artifacts}/architecture/architecture.md`
- Sharded: resolver-declared `{solutioning_artifacts}/architecture/index.md` and `consumedPaths`

#### C. Epics & Stories Documents

- Whole: `{planning_artifacts}/epics/epics.md`
- Sharded: resolver-declared `{planning_artifacts}/epics/index.md` and `consumedPaths`

#### D. UX Design Documents

- Canonical: `{planning_artifacts}/ux/ux-design-specification.md`
- Legacy read-only fallback: `{planning_artifacts}/ux-design-specification.md`
- Related canonical outputs: `{planning_artifacts}/ux/ux-color-themes.html`, `{planning_artifacts}/ux/ux-design-directions.html`, and on-demand `{planning_artifacts}/ux/design-system/`

#### E. PRD Validation Evidence

- Canonical historical report: `{planning_artifacts}/prd/prd-validate-report-{yyyy-MM-dd}.md`, with a valid calendar date.
- Legacy historical discovery also inventories existing `validation-report-*.md`, `prd-validation-report-*.md`, `prd-validation-*.md`, `validate-prd-report-*.md`, and undated `prd-validation-report.md` in place.
- Before loading any canonical or legacy candidate, construct the logical Planning root and logical PRD owner from the portable project-relative resolver result; the logical PRD owner must be exactly `{planning_artifacts}/prd`. Require `realProject` to exist and be a directory. Require the logical Planning root to exist and resolve to a directory, then require `realPlanning` to be the same as or a descendant of `realProject`. Require the logical PRD owner to exist and pass a no-follow `lstat` as a directory or inspected entry, resolve it to the directory `realPrdOwner`, and require the normalized physical path of `realPrdOwner` to equal exactly `realPlanning/prd`; containment inside `realPlanning` alone is insufficient. Only then require the candidate to be a portable project-relative path, exist, have readable bytes, pass a no-follow `lstat` as a regular file and not a symlink, and have its `realpath` remain the same as or a descendant of `realPrdOwner`. Any failed owner-chain or candidate check, including a symlink, non-file, unreadable or missing candidate, external escape, or project-internal cross-space or redirect, must fail closed before content is loaded or parsed and record project-relative rejection evidence.
- This inventory is read-only evidence discovery. Preserve all matches; do not rename, migrate, overwrite, delete, or use a legacy basename as a new producer default.

### 3. Organize Findings

For each document type found:

```
## [Document Type] Files Found

**Whole Documents:**
- [filename.md] ([size], [modified date])

**Sharded Documents:**
- Folder: [foldername]/
  - index.md
  - [other files in folder]
```

### 4. Identify Critical Issues

#### Duplicates (CRITICAL)

If both whole and sharded versions exist:

```
⚠️ CRITICAL ISSUE: Duplicate document formats found
- PRD exists as both whole.md AND prd/ folder
- YOU MUST choose which version to use
- Rerun the shared resolver with invocation-scoped `--selection whole|sharded`
- Preserve the unselected version; do not remove, rename, merge, or migrate it
```

#### Missing Documents (WARNING)

If required documents not found:

```
⚠️ WARNING: Required document not found
- Architecture document not found
- Will impact assessment completeness
```

### 5. Add Initial Report Section

Initialize {outputFile} with ../templates/readiness-report-template.md.

### 6. Present Findings and Get Confirmation

Display findings and ask:
"**Document Discovery Complete**

[Show organized file list]

**Issues Found:**

- [List any duplicates requiring resolution]
- [List any missing documents]

**Required Actions:**

- If whole+sharded exists: ask for invocation-scoped selection; do not remove or rename either version
- Confirm which documents to use for assessment

**Ready to proceed?** [C] Continue after resolving issues"

### 7. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue to File Validation

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed with 'C' selection
- If duplicates identified, insist on resolution first
- User can clarify file locations or request additional searches

#### Menu Handling Logic:

- IF C: Save document inventory to {outputFile}, update frontmatter with completed step and files being included, and then read fully and follow: ./step-02-prd-analysis.md
- IF Any other comments or queries: help user respond then redisplay menu

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN C is selected and document inventory is saved will you load ./step-02-prd-analysis.md to begin file validation.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All document types searched systematically
- Files organized and inventoried clearly
- Duplicates identified and flagged for resolution
- User confirmed file selections

### ❌ SYSTEM FAILURE:

- Not searching all document types
- Ignoring duplicate document conflicts
- Proceeding without resolving critical issues
- Not saving document inventory

**Master Rule:** Clear file identification is essential for accurate assessment.
