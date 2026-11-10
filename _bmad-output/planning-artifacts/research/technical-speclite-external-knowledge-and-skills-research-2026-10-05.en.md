# External Knowledge and External Skills（外部知识与外部 Skill）

## Document Context（文档背景）

- Date: 2026-10-05.
- Status: Draft. Decisions are open. This document is research evidence. It is not part of a live planning gate. Before implementation, change it into a Story or a SPEC.
- Style: Approximately 80% ASD-STE100. Technical names (SpecLite, Skill, commit) stay as they are. The Chinese version is [technical-speclite-external-knowledge-and-skills-research-2026-10-05.md](technical-speclite-external-knowledge-and-skills-research-2026-10-05.md).
- Origin: The design discussion on 2026-10-04 and 2026-10-05. This is the revised version after a first-principles review.
- Evidence snapshot: SpecLite `44295f0`; SCRM knowledge base `44b2703` (2026-10-04); delivery project `wshoto-ka-vw-anhui` `71a1f1f`.
- The decisions for the knowledge base tasks were made on 2026-10-05: KC-D-00 to KC-D-16 use the recommended options. The plan is in the knowledge base file `planning/knowledge-consumption-plan.md`. Decision KC-D-09 changes section 3.3 of this document: the knowledge base defines the evidence level terms.

## 1. Problem（问题）

SpecLite gives a method for AI coding. The method has phases, steps, and checks.

Each company also has its own knowledge. For example, the SCRM knowledge base contains rules, API contracts, and platform facts. AI agents must use this knowledge to do correct work.

Some users also use Skills from other authors. For example, UI designers use impeccable, taste, ui-ux-pro-max, and frontend-design.

Today, SpecLite has no standard way to connect to these external items. The project `wshoto-ka-vw-anhui` shows the result:

- AGENTS.md contains a full path on one computer. Other computers cannot use this path.
- The team copies the rules file by hand.
- The project mentions the knowledge base 254 times. The references that we examined have no version.
- The tech stack document had four versions in two days. Two of the three updates only followed changes in the knowledge base.

## 2. Basic Facts（基本事实）

We use six basic facts to examine the plan.

| # | Fact | Result for the design |
|---|---|---|
| A1 | An agent can only use the text in its context. The context has a limit. | Give only the related knowledge. Do not give all of it. |
| A2 | An agent does not always obey a rule in its context. A check at a gate always gives the same result. | Check the rules at gates. Do not only load them. |
| A3 | A result is only as strong as its weakest source. | Keep the evidence level with each reference. |
| A4 | Each owner must control only its own side. | Put each interface at an owner boundary. Keep the interface small. |
| A5 | Two people on one project must get the same result. | Lock the version. Make each upgrade a visible change. |
| A6 | Only SpecLite knows the process state: the phase, the Story, the artifacts, and the gates. | SpecLite does only the tasks that need the process state. |

## 3. Changes to the First Plan（对上一版的修改）

### 3.1 Select knowledge by topic, not by phase

**Problem:** The first plan selected knowledge by SDLC phase. But the topic of the work, for example ID Mapping or Open callbacks, decides what knowledge is related. A phase list also ties the knowledge base to SpecLite names.

**Change:**

- The knowledge base gives data only about itself: identity, entry files, reading layers, and a read-only policy.
- SpecLite selects the related knowledge one time, when it creates the Story. At that time, the work scope is small and a person reviews the Story.
- The Story keeps a "Knowledge References" section. dev-story and code-review use this section again.

### 3.2 Check rules, do not only load them

**Problem:** The global rules file has 61 rules. The first plan only put them in the context. The agent can forget them or ignore them.

**Change:**

- Give each rule an ID. Some rules already have IDs (CS-ENG, CS-GAP, GOV). The global rules do not have IDs yet. The knowledge base team must add them.
- Each design decision refers to rule IDs.
- If a decision does not obey a rule, record the exception and the person who approved it.
- The readiness check, Story review, and code review examine the related rules by ID.
- A script can check some rules, for example "Do not listen to internal MQ topics." Make these rules automatic checks.

### 3.3 Keep the evidence level with each reference

**Problem:** The first plan recorded only the location and the commit. But the knowledge base has different evidence levels, for example business confirmed, source checked, machine draft, and not confirmed. If a PRD refers to a machine draft, the next Story can use it as a fixed contract. This is not correct.

**Change:**

- The knowledge base defines the evidence level terms. SpecLite only uses these terms. SpecLite does not define its own levels.
- Each reference shows its evidence level.
- If the level is machine draft, not confirmed, or not checked, the artifact adds the item to its list of open questions.
- If the agent cannot find the level, it uses "not confirmed".
- **Limit:** The knowledge base has no machine-readable level data now. The agent must read the level from the text. The knowledge base will first make a list of terms (knowledge base plan KC-4).

### 3.4 Lock the version and upgrade on purpose

**Problem:** In the first plan, the agent read the newest local copy. Two developers can have different copies, so the agent gives different results.

**Change:**

- The project locks the knowledge base to one commit.
- An upgrade is a visible change that a person reviews.
- During an upgrade, SpecLite finds the changed rules. Then it finds the decisions and Stories that refer to these rules. It shows the list that people must examine again.
- Git submodule is the best way to do this. It gives a fixed path, a locked version, and a clear diff.
- If many projects share one local copy, SpecLite records the commit that the agent read. If this commit is not the locked commit, SpecLite shows a warning.

### 3.5 Record knowledge gaps when they occur

**Problem:** The first plan sent feedback to the knowledge base only at the retrospective. This is late, and much detail is lost.

**Change:**

- When the agent does not have sufficient data, it stops and asks a person.
- At that time, record a knowledge gap. Record the question, the answer, the person who answered, the scope (this project or all projects), and the related rule IDs.
- At the retrospective, only collect and sort these records.

### 3.6 Connect external Skills at the artifact, not at the command

**Problem:** The first plan connected a SpecLite step to a specified command of an external Skill. External Skills change often. For example, taste had a full rewrite from v1 to v2. Each rewrite can break this type of connection.

**Change:**

- SpecLite defines what each extension point must produce. For example, a UX visual direction document must contain design tokens, fonts, colors, and component rules.
- Any provider can produce the artifact: impeccable, taste, a designer, or a Figma export.
- The knowledge base already has a good example: the task-handoff contract for scrm-skills. It defines the inputs and the outputs. dev-story can use this contract directly.
- **Gap:** SpecLite customization has no named step hooks now. SpecLite must add named extension points to its workflows.

### 3.7 Craft Skills belong to the person, not to the project

**Problem:** A designer uses impeccable or taste, but a backend developer does not need them. Each installed Skill adds its description to the context on each turn. It also increases the risk that the wrong Skill starts.

**Change:**

- Install personal Skills at the user level, for example `~/.claude/skills`.
- The project declares only the external Skills that a gate needs.
- Only these Skills need a declaration, a version lock, and a doctor check.
- The catalog and profiles from the first plan become a recommendation document.

### 3.8 Use one model for both questions

**Problem:** The first plan had six new concepts. But external knowledge and external Skills need the same things: identity, location, version lock, trust level, read-only ownership, and a health check.

**Change:**

- Use one model: External Dependency.
- The content type decides the use. The agent reads knowledge, checks rules, and calls Skills.
- There are three trust levels:
  - An internal, reviewed knowledge base has the highest trust.
  - A locked community Skill is next.
  - An unlocked community Skill has the lowest trust.
- A Skill with scripts runs code on the computer. Examine these Skills carefully.

### 3.9 Give SpecLite only the tasks that need process state

| Task | Needs process state? | Owner |
|---|---|---|
| Find the knowledge base path | No | SpecLite resolve (small) |
| Search inside the knowledge base | No | The knowledge base |
| Install external Skills | No | The original channels |
| Select related knowledge for a Story | Yes | SpecLite (create-story) |
| Check rules at gates | Yes | SpecLite |
| Analyze an upgrade | Yes | SpecLite |
| Define artifact contracts | Yes | SpecLite |
| Commands and prompts of external Skills | No | The upstream author |

AGENTS.md is the base layer, and all agents read it. SpecLite does not replace it. SpecLite adds only what AGENTS.md cannot do: a portable location, Story-level knowledge, gate checks, evidence levels, and a version lock.

### 3.10 Define how to measure success

**Problem:** The first plan did not say how to know that the design helps.

**Change:**

- Do a comparison test:
  1. Use one completed Story from `wshoto-ka-vw-anhui`.
  2. Run create-story and code-review two times, one time with the knowledge connection and one time without it.
  3. Compare the rule problems that each run finds.
- Measure these values over time:
  - Rule problems found at gates, compared with rule problems found after merge.
  - The percentage of decisions that refer to a rule ID.
  - The number of manual sync changes.
  - The number of stop-and-ask events, and how many of them go back to the knowledge base.

## 4. The New Design（新设计）

| Part | Contents | It replaces |
|---|---|---|
| **External Dependency** | Team declaration (in Git), local location (not in Git), locked version, content type, trust level, read-only ownership, doctor check | knowledge source, companion, external ownership |
| **Extension Point** | A named step in a workflow, with an artifact contract. A person, an external Skill, or a knowledge base Skill can do the step. | slot, profile, binding |
| **Reference rule** | Dependency ID + location or rule ID + version + evidence level. Each Story has a "Knowledge References" section. Each knowledge gap has a record. | citation, drift |

## 5. Steps（落地步骤）

**Step 1: Test the value with small changes.**

1. Add one global customization layer for all Skills.
2. Add a path variable from the user config, for example `{dependency:wshoto-scrm}`.
3. Add a "Knowledge References" section to the create-story template.
4. Add a rule ID check to code-review.
5. Do the comparison test on the next Story in `wshoto-ka-vw-anhui`.
6. If the Story references do not find more problems than AGENTS.md alone, stop here.

**Step 2: Add the version lock and the upgrade analysis.**

1. Ask the knowledge base team to add IDs to the global rules.
2. Add the version lock.
3. Add the upgrade impact analysis.
4. Add the knowledge gap records.

**Step 3: Add extension points and artifact contracts.**

1. Start with two contracts: UX visual direction and UI review findings.
2. Declare and lock an external Skill only when a gate needs that Skill.

## 6. What Does Not Change（保持不变的决定）

- SpecLite does not keep, copy, or change the knowledge base.
- SpecLite does not copy external Skills into its own source.
- The original channels install external Skills, for example `npx skills`, the Claude Code marketplace, or the Skill's own tool.

## Evidence References（证据索引）

| Evidence | Location |
|---|---|
| Customization has three layers for each Skill. It has no global layer for all Skills. | [src/config/customization-reader.ts](../../../src/config/customization-reader.ts) |
| SDLC `customize.toml` files contain only `activation_steps_prepend/append`, `persistent_facts`, and `on_complete`. They have no named step hooks. | `assets/source/speclite/sdlc-skills/*/*/customize.toml` |
| The path prefixes `.claude/skills/` and `.agents/skills/` are installer-owned. There is no external category. | [src/update/ownership-model.ts](../../../src/update/ownership-model.ts) |
| An earlier study said that external Skill sources need a lockfile or a hash. | [technical-speclite-bmad-tooling-system-design-research-2026-05-11.md](technical-speclite-bmad-tooling-system-design-research-2026-05-11.md) |
| Source trust model | [ADR 0004](../adr/0004-source-descriptor-trust-model.md) |
| Global rules file (61 rules; 48 start with "must" or "must not") | Knowledge base `instructions/scrm-global-development-guidelines.md` |
| Existing rule IDs: `CS-ENG-*`, `CS-GAP-*`, `GOV-*` | Knowledge base `docs/03-wshoto-scrm-delivery/custom-services/`, `planning/system-consistency-todo.md` |
| task-handoff contract (inputs and outputs of scrm-skills) | Knowledge base `docs/90-wshoto-scrm-support/contracts/task-handoff.md` |
| `knowledge_root` and `target_root` are separate inputs | Knowledge base `scrm-skills/plugins/scrm-skills/skills/scrm-skills-overview/references/SCRM上下文契约.md` |
| Full path and copied rules file | Delivery project `AGENTS.md`, `wshoto-scrm-base-knowledge/instructions/scrm-global-development-guidelines.md` |
| Manual sync with the knowledge base | Delivery project `_speclite/backend-tech-stack.md` (v1.0 to v1.3) |
| taste v2 rewrite | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) |
| Project-level `skills-lock.json` for `npx skills` | [vercel-labs/skills sync](https://www.mintlify.com/vercel-labs/skills/commands/sync) |
| Claude Code project-level `enabledPlugins` and plugin dependencies | [Claude Code plugin settings for organizations](https://code.claude.com/docs/de/plugins/org), [plugin dependencies](https://code.claude.com/docs/de/plugins/dependencies.md) |
