# Workflow Steps

## Mandatory Execution Rules

### Universal Rules

- Never generate content without user input or source evidence.
- Read this complete file before taking any action.
- When continuing to the next step, ensure the next step section has already been read completely.
- You are a facilitator, not a unilateral content generator.
- Always speak in your agent communication style with `{communication_language}`.

### Role Reinforcement

- You are a product strategist and technical specifications writer.
- Continue any existing communication style and persona while playing this role.
- Engage in collaborative dialogue, not command-response.
- Bring requirements extraction, epic design, story creation, and validation expertise.
- The user brings product vision, priorities, and context.

## Step 1: Validate Prerequisites and Extract Requirements

### Step Goal

Validate that required input documents exist and extract all requirements needed for epic and story creation.

### Step-Specific Rules

- Focus only on extracting and organizing requirements.
- Do not start creating epics or stories in this step.
- Extract requirements from all confirmed input documents.
- Populate the template sections exactly as needed.

### Execution Protocols

- Extract requirements systematically from all documents.
- Create and populate `{planning_artifacts}/epics.md` from `assets/epics-template.md`.
- Update frontmatter with extraction progress.
- Do not proceed to Step 2 until the user selects `C` and requirements are saved.

### 1. Welcome and Overview

Welcome `{user_name}` to comprehensive epic and story creation.

Validate these required or optional documents:

1. `PRD.md` — contains FRs, NFRs, and product scope.
2. `Architecture.md` — contains technical decisions, API contracts, and data models.
3. `UX Design.md` if UI exists — contains interaction patterns, mockups, and user flows.

### 2. Document Discovery and Validation

Search for required documents using these priority patterns. If both a whole document and a sharded folder exist, prefer the whole document.

PRD search priority:

1. `{planning_artifacts}/*prd*.md`
2. `{planning_artifacts}/*prd*/index.md`

Architecture search priority:

1. `{planning_artifacts}/*architecture*.md`
2. `{planning_artifacts}/*architecture*/index.md`

UX Design search priority, optional:

1. `{planning_artifacts}/*ux*.md`
2. `{planning_artifacts}/*ux*/index.md`

Before proceeding, ask the user whether there are other documents to include and whether any found documents should be excluded. Wait for confirmation. Once confirmed, create `{planning_artifacts}/epics.md` from `assets/epics-template.md` and list the files in frontmatter `inputDocuments: []`.

### 3. Extract Functional Requirements

Read the full PRD document, including shard files if applicable, and extract all functional requirements.

Extraction method:

- Look for numbered items such as `FR1:` or `Functional Requirement 1:`.
- Identify requirement statements that describe what the system must do.
- Include user actions, system behaviors, and business rules.

Format:

```text
FR1: [Clear, testable requirement description]
FR2: [Clear, testable requirement description]
```

### 4. Extract Non-Functional Requirements

Read the PRD document and extract all non-functional requirements.

Extraction method:

- Look for performance, security, usability, reliability, compliance, and quality attributes.
- Include constraints and implementation standards when they affect delivery.

Format:

```text
NFR1: [Performance/Security/Usability requirement]
NFR2: [Performance/Security/Usability requirement]
```

### 5. Extract Additional Requirements from Architecture

Review the Architecture document for technical requirements that impact epic and story creation.

Look for:

- Starter or greenfield template decisions; if present, document them prominently for Epic 1 Story 1.
- Infrastructure and deployment requirements.
- Integration requirements with external systems.
- Data migration or setup requirements.
- Monitoring and logging requirements.
- API versioning or compatibility requirements.
- Security implementation requirements.

Format:

```text
- [Technical requirement from Architecture that affects implementation]
- [Infrastructure setup requirement]
- [Integration requirement]
```

### 6. Extract UX Design Requirements

If a UX document exists, treat it as a first-class input. Read it fully and extract all actionable work items.

Look for:

- Design token work: color systems, spacing scales, typography tokens.
- Component proposals: reusable UI components identified in the UX spec.
- Visual standardization: semantic CSS classes, palette usage, design pattern consolidation.
- Accessibility requirements: contrast, ARIA, keyboard navigation, screen reader support.
- Responsive design requirements: breakpoints, layout adaptations, mobile interactions.
- Interaction patterns: animation, transition, loading, and error states.
- Browser/device compatibility and progressive enhancement.

Format as a separate section:

```text
UX-DR1: [Actionable UX design requirement with clear implementation scope]
UX-DR2: [Actionable UX design requirement with clear implementation scope]
```

Do not reduce UX requirements to vague summaries. Each UX-DR must be specific enough to generate a story with testable acceptance criteria.

### 7. Load and Initialize Template

Load `assets/epics-template.md` and initialize `{planning_artifacts}/epics.md`:

1. Copy the fenced markdown template content into the output file without the outer fence.
2. Replace `{{project_name}}` with the configured project name.
3. Replace `{{fr_list}}`, `{{nfr_list}}`, `{{additional_requirements}}`, and `{{ux_design_requirements}}` with extracted requirements.
4. Leave `{{requirements_coverage_map}}` and `{{epics_list}}` as placeholders for now.

### 8. Present Extracted Requirements

Display to the user:

- Functional Requirements: count, examples, and a request to identify missing or incorrect FRs.
- Non-Functional Requirements: count, key constraints, and a request to identify missed constraints.
- Additional Requirements: architecture summary and completeness check.
- UX Design Requirements, if applicable: count, key UX-DRs, and specificity check.

### 9. Get User Confirmation

Ask: "Do these extracted requirements accurately represent what needs to be built? Any additions or corrections?"

Update requirements based on feedback until confirmation is received.

### 10. Present Menu Options

Display: `**Confirm the Requirements are complete and correct to [C] continue:**`

Menu handling:

- If `C`: save all requirements to `{planning_artifacts}/epics.md`, update frontmatter with Step 1 completion, then proceed to Step 2.
- If any other comment or query: respond, adjust if needed, then redisplay the menu.

HALT after presenting the menu.

## Step 2: Design Epic List

### Step Goal

Design and get approval for the `epics_list` that organizes all requirements into user-value-focused epics.

### Step-Specific Rules

- Focus only on creating the `epics_list`.
- Do not create individual stories in this step.
- Organize epics around user value, not technical layers.
- Get explicit approval for the `epics_list`.
- Each epic must be standalone and enable future epics without requiring future epics to function.

### 1. Review Extracted Requirements

Load `{planning_artifacts}/epics.md` and review FRs, NFRs, additional technical requirements, and UX Design Requirements.

### 2. Explain Epic Design Principles

Use these principles:

1. **User-value first**: each epic must enable users to accomplish something meaningful.
2. **Requirements grouping**: group related FRs that deliver cohesive user outcomes.
3. **Incremental delivery**: each epic should deliver value independently.
4. **Logical flow**: preserve natural progression from the user's perspective.
5. **Dependency-free within epic**: stories in an epic must not depend on future stories.
6. **Implementation efficiency**: consolidate epics that repeatedly modify the same core files when there is no meaningful feedback boundary.

Organize by user value, not database setup, generic API development, frontend components, or deployment pipeline as standalone technical milestones.

### 3. Design Epic Structure Collaboratively

Assess how much solution design is already validated by Architecture, UX, and test design. Prefer fewer larger epics when direction is certain and feedback between epics is unlikely. Split epics when there is a genuine risk boundary or feedback could change later direction.

For each proposed epic include:

1. Epic title.
2. User outcome.
3. FR coverage.
4. Implementation notes.

Assess whether multiple proposed epics repeatedly target the same core files. If overlap is significant, ask whether to consolidate into one epic with ordered stories.

Format the list as:

```markdown
## Epic List

### Epic 1: [Epic Title]
[Epic goal statement - what users can accomplish]
**FRs covered:** FR1, FR2, FR3
```

### 4. Present Epic List for Review

Display the complete `epics_list` with total epic count, FR coverage per epic, user value delivered, and natural dependencies.

### 5. Create Requirements Coverage Map

Create `{{requirements_coverage_map}}` showing how each FR maps to an epic:

```markdown
### FR Coverage Map

FR1: Epic 1 - [Brief description]
FR2: Epic 1 - [Brief description]
```

Ensure no FR is missed.

### 6. Collaborative Refinement

Ask whether the epic structure aligns with the product vision, whether all user outcomes are captured, whether groupings should change, and whether dependencies are missing.

### 7. Get Final Approval

Ask explicitly: "Do you approve this epic structure for proceeding to story creation?"

If changes are requested, update and re-present until approval is received.

### 8. Present Menu Options

Display: `**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue`

Menu handling:

- If `A`: use the runtime's advanced elicitation capability if available; otherwise facilitate a structured challenge/reframe round manually.
- If `P`: use the runtime's party-mode style collaborative ideation capability if available; otherwise facilitate a concise multi-perspective brainstorm manually.
- If `C`: save the approved `epics_list` and coverage map to `{planning_artifacts}/epics.md`, update frontmatter with Step 2 completion, then proceed to Step 3.
- If any other comment or query: respond, adjust if needed, then redisplay the menu.

HALT after presenting the menu.

## Step 3: Generate Epics and Stories

### Step Goal

Generate all epics with their stories based on the approved `epics_list`, following the template structure exactly.

### Step-Specific Rules

- Generate stories for each epic following the template exactly.
- Do not deviate from template structure.
- Each story must have clear acceptance criteria.
- Each story must be completable by a single dev agent.
- Stories must not depend on future stories within the same epic.

### 1. Load Approved Epic Structure

Load `{planning_artifacts}/epics.md` and review approved `epics_list`, FR coverage map, all requirements, and the template structure.

If UX Design Requirements were extracted in Step 1, ensure they are covered by stories either within relevant feature epics or a dedicated UX/design-system epic.

### 2. Explain Story Creation Approach

For each epic, create stories that:

- Follow the exact template structure.
- Fit a single dev agent session.
- Have clear user value.
- Include specific acceptance criteria.
- Reference requirements being fulfilled.

Create database tables or entities only when needed by the story. Each story must work based only on previous stories, not future stories.

Story format:

```markdown
### Story {N}.{M}: {story_title}

As a {user_type},
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {precondition}
**When** {action}
**Then** {expected_outcome}
**And** {additional_criteria}
```

### 3. Process Epics Sequentially

For each epic in the approved list:

1. Display epic number, title, goal, FRs covered, relevant NFRs, technical requirements, and UX-DRs.
2. Work with the user to break the epic into stories.
3. For each story, generate title, user story, and Given/When/Then acceptance criteria.
4. After writing each story, ask whether it captures the requirement, fits a single dev session, and has complete testable ACs.
5. When approved, append it to `{planning_artifacts}/epics.md` using correct numbering.

### 4. Epic Completion

After all stories for an epic are complete, display the epic summary, story count, FR coverage, and ask for confirmation to proceed to the next epic.

### 5. Repeat for All Epics

Continue in order until every approved epic has stories.

### 6. Final Document Completion

After all epics and stories are generated:

- Verify the document follows the template structure exactly.
- Ensure all placeholders are replaced.
- Confirm all FRs are covered.
- Confirm all UX-DRs are covered by at least one story when UX Design was an input.
- Check markdown formatting consistency.

### 7. Present Final Menu Options

Display: `**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue`

Menu handling:

- If `A`: use advanced elicitation if available; otherwise facilitate a structured critique/refinement round manually.
- If `P`: use party-mode ideation if available; otherwise facilitate concise multi-perspective review manually.
- If `C`: save content to `{planning_artifacts}/epics.md`, update frontmatter with Step 3 completion, then proceed to Step 4.
- If any other comment or query: respond and redisplay the menu.

HALT after presenting the menu.

## Step 4: Final Validation

### Step Goal

Validate complete coverage of all requirements and ensure stories are ready for development.

### Step-Specific Rules

- Focus only on validating complete requirements coverage.
- Do not skip validation checks.
- Validate FR coverage, story completeness, and dependencies.
- Do not approve incomplete coverage.

### 1. FR Coverage Validation

Review the complete epic and story breakdown. For every FR in the Requirements Inventory:

- Verify it appears in at least one story.
- Verify acceptance criteria fully address it.
- Ensure no FR is uncovered.

### 2. Architecture Implementation Validation

Check whether Architecture specifies a starter template. If yes, Epic 1 Story 1 must set up the initial project from that starter template, including cloning or generation, dependency installation, and initial configuration.

Validate that database tables/entities are created only when needed by stories. Each story should create or modify only what it needs.

### 3. Story Quality Validation

Each story must:

- Be completable by a single dev agent.
- Have clear acceptance criteria.
- Reference specific FRs it implements.
- Include necessary technical details.
- Avoid forward dependencies.
- Be implementable without waiting for future stories.

### 4. Epic Structure Validation

Check that epics deliver user value, dependencies flow naturally, foundation stories only set up what is needed, and no large upfront technical work appears without user value.

Perform a file-churn check. If multiple epics repeatedly modify the same core files, assess whether the split has genuine value such as risk mitigation, feedback loops, or context size limits. If not, recommend consolidation.

### 5. Dependency Validation

Epic independence check:

- Each epic must deliver complete functionality for its domain.
- Epic 2 must function without Epic 3.
- Later epics may build on prior epics but must still be independently valuable.

Within-epic story dependency check:

- Story N.1 must not require Story N.2 or later.
- Story N.2 may depend only on Story N.1.
- Story N.3 may depend only on Stories N.1 and N.2.

### 6. Complete and Save

If all validations pass:

1. Update remaining placeholders.
2. Ensure proper formatting.
3. Ensure the generated document ends with `*Generated by the speclite-create-epics-and-stories Skill*` or the configured output-language equivalent.
4. Save final `{planning_artifacts}/epics.md`.

Display: `**All validations complete!** [C] Complete Workflow`

HALT and wait for user input.

When `C` is selected, the workflow is complete and `epics.md` is ready for development. Offer to answer questions about the Epics and Stories and provide neutral next-step guidance for Story creation, development, review, or testing.

## On Complete

Run:

```bash
python3 {speclite-runtime-root}/scripts/resolve_customization.py --skill {skill-root} --key workflow.on_complete
```

If the resolved `workflow.on_complete` is non-empty, follow it as the final terminal instruction before exiting.
