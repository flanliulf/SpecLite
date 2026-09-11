# Step 1: UX Design Workflow Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER generate content without user input

- 📖 CRITICAL: ALWAYS read the complete step file before taking any action - partial understanding leads to incomplete decisions
- 🔄 CRITICAL: When loading next step with 'C', ensure the entire file is read and understood before proceeding
- ✅ ALWAYS treat this as collaborative discovery between UX facilitator and stakeholder
- 📋 YOU ARE A UX FACILITATOR, not a content generator
- 💬 FOCUS on initialization and setup only - don't look ahead to future steps
- 🚪 DETECT existing workflow state and handle continuation properly
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS:

- 🎯 Show your analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- Input document discovery happens in this step

## YOUR TASK:

Initialize the UX design workflow by detecting continuation state and setting up the design specification document.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, resolve the Planning root through `speclite resolve artifact-roots --project-root {project-root}`. Continue only when the result is `ok: true`, has no blocking issue, and contains exactly one Planning root. Otherwise reuse the resolver diagnostics and HALT with empty consumption and zero artifact/progress mutation. Retain its `resolvedRoot` and `resolutionMode`, then perform this deterministic, read-only discovery:

1. Check the canonical main document `{planning_artifacts}/ux/ux-design-specification.md`.
2. Only when the canonical main document is absent, check the exact legacy main document `{planning_artifacts}/ux-design-specification.md`.
3. If the canonical document exists, set `actualConsumedPath` to its project-relative POSIX path and leave any legacy document untouched.
4. If only the legacy document exists, set `actualConsumedPath` to its project-relative POSIX path. For each supporting HTML basename, select the existing Planning-root legacy sibling in place, or select the exact canonical `{planning_artifacts}/ux/` path when that sibling is absent; record these as `actualColorThemesPath` and `actualDesignDirectionsPath`. Then load `./step-01b-continue.md` and continue the legacy document in place.
5. If the canonical main exists, set both supporting selected paths to their canonical `{planning_artifacts}/ux/` paths; legacy main and siblings remain untouched.
6. If neither main exists, set `actualConsumedPath: null`, select both supporting canonical paths, and treat this as a fresh workflow whose output is the canonical main document.

Record `resolvedRoot`, `resolutionMode`, `actualConsumedPath`, `actualColorThemesPath`, and `actualDesignDirectionsPath` together in workflow discovery state. Legacy discovery is read-only and must not migrate, copy, rename, or delete any legacy main document, sibling `ux-color-themes.html` / `ux-design-directions.html`, asset, directory, or config value. Give every candidate an explicit canonical-write or legacy-read intent. Canonical existing targets and nearest existing ancestors of missing targets must resolve inside the real `{planning_artifacts}/ux` owner; legacy selected files must resolve inside the real Planning owner. An absent/ambiguous owner, `ENOTDIR`, regular-file/FIFO parent, dangling symlink, cross-space/out-of-project symlink, unreadable entry, or dereferenced non-regular file HALTs with empty consumption/append target and zero mutation.

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with a non-empty integer `stepsCompleted` array:

- **STOP here** and load `./step-01b-continue.md` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

If a selected existing document has missing or invalid workflow frontmatter/`stepsCompleted`, HALT with a structured recovery explanation. Preserve the selected document, supporting artifacts, workflow status and progress unchanged. Never enter fresh setup and never copy the template over an existing path.

### 3. Fresh Workflow Setup (If No Document)

Only if neither main document exists:

#### A. Input Document Discovery

Discover and load context documents using smart discovery. Documents can be in the following locations:
- {planning_artifacts}/**
- {output_folder}/**
- {project_knowledge}/**
- {project-root}/docs/**

Also - when searching - documents can be a single markdown file, or a folder with an index and multiple files. For Example, if searching for `*foo*.md` and not found, also search for a folder called *foo*/index.md (which indicates sharded content)

Try to discover the following:
- Product Brief (`*brief*.md`)
- Research Documents (`*prd*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{project_knowledge}` or `docs` folder.)
- Project Context (`**/project-context.md`)

<critical>Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules</critical>

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Create Initial Document

Run `node "{skill-root}/scripts/ux-artifact-operation.mjs" create-file --project-root "{project-root}" --planning-root "{planning_artifacts}" --target "{planning_artifacts}/ux/ux-design-specification.md" --source "{skill-root}/assets/ux-design-template.md"`. This Skill-private operation reruns the canonical physical-owner and nearest-existing-ancestor guard at commit time and immediately performs the exclusive `wx` create; do not accept an approval result and copy later. Require exit `0`, exactly one JSON object on stdout, `ok: true`, the exact target path and `operation: "create-file"`. A non-zero exit, invalid JSON, or `ok !== true` HALTs without creating, truncating, advancing frontmatter/progress, or selecting an append target.
Initialize frontmatter in the template.

After the create and initial frontmatter write succeed, re-probe that exact readable regular file and atomically set both `actualConsumedPath` and the append target to its project-relative POSIX path `{planning_artifacts}/ux/ux-design-specification.md`. Keep both values `null` and HALT if creation or re-probe fails.

#### C. Complete Initialization and Report

Complete setup and report to user:

**Document Setup:**

- Created: `{planning_artifacts}/ux/ux-design-specification.md` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**
Report what was found:
"Welcome {{user_name}}! I've set up your UX design workspace for {{project_name}}.

**Documents Found:**

- PRD: {number of PRD files loaded or "None found"}
- Product brief: {number of brief files loaded or "None found"}
- Other context: {number of other files loaded or "None found"}

**Files loaded:** {list of specific file names or "No additional documents found"}

Do you have any other documents you'd like me to include, or shall we continue to the next step?

[C] Continue to UX discovery"

## NEXT STEP:

After user selects [C] to continue, ensure the selected `actualConsumedPath` has been created or saved (`{planning_artifacts}/ux/ux-design-specification.md` for a fresh workflow; the exact discovered legacy path for legacy continuation), and then load `./step-02-discovery.md` to begin the UX discovery phase.

Remember: Do NOT proceed to step-02 until output file has been updated and user explicitly selects [C] to continue!

## SUCCESS METRICS:

✅ Existing workflow detected and handed off to step-01b correctly
✅ Fresh workflow initialized with template and frontmatter
✅ Input documents discovered and loaded using sharded-first logic
✅ All discovered files tracked in frontmatter `inputDocuments`
✅ User confirmed document setup and can proceed

## FAILURE MODES:

❌ Proceeding with fresh initialization when existing workflow exists
❌ Not updating frontmatter with discovered input documents
❌ Creating document without proper template
❌ Not checking sharded folders first before whole files
❌ Not reporting what documents were found to user

❌ **CRITICAL**: Reading only partial step file - leads to incomplete understanding and poor decisions
❌ **CRITICAL**: Proceeding with 'C' without fully reading and understanding the next step file
❌ **CRITICAL**: Making decisions without complete understanding of step requirements and protocols
