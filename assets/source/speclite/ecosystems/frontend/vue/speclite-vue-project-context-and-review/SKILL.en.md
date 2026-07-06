---
name: speclite-vue-project-context-and-review
description: "Analyze a Vue project from repository evidence and write a framework-specific context and review note. Use for Vue project context, SFC structure, Composition API, routing, state, accessibility, testing strategy, and migration review. Version and API claims must come from target project files, lockfiles, official docs, or user-provided materials."
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Vue Project Context And Review

[Overview]
    This Vue ecosystem workflow builds an evidence-linked project context and review note for a selected Vue frontend project. It focuses on SFC structure, Composition API usage, state, routing, testing, accessibility, build wiring, and migration risks.

[Workflow]
    1. Confirm `{project-root}` and output location. Ask before writing if no output path is provided.
    2. Gather evidence from `package.json`, lockfiles, package manager output, Vue/Nuxt/Vite config, source entrypoints, tests, CI, official docs, and user-provided materials.
    3. Do not invent framework versions or API behavior. If evidence is missing, record it under `Unknowns`.
    4. Review SFC, composable, route, state, test, build, accessibility, and migration dimensions with file-path evidence.
    5. Write a Markdown note, usually under `{project_knowledge}/frontend/vue-project-context-and-review.md`.

[Boundaries]
    Generic UX, PRD, Architecture, Story creation, and Code Review workflows remain in `sdlc`. This Skill does not create a SpecLite Web UI, dashboard, browser runtime, or GUI product scope.
