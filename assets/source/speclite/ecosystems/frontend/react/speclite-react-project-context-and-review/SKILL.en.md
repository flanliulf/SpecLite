---
name: speclite-react-project-context-and-review
description: "Analyze a React project from repository evidence and write a framework-specific context and review note. Use for React project context, architecture review, component review, migration review, routing, state, accessibility, and testing strategy. Version and API claims must come from target project files, lockfiles, official docs, or user-provided materials."
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

# Speclite React Project Context And Review

[Overview]
    This React ecosystem workflow builds an evidence-linked project context and review note for a selected React frontend project. It focuses on component architecture, state, routing, testing, accessibility, build wiring, and migration risks.

[Workflow]
    1. Confirm `{project-root}` and output location. Ask before writing if no output path is provided.
    2. Gather evidence from `package.json`, lockfiles, package manager output, framework config, source entrypoints, tests, CI, official docs, and user-provided materials.
    3. Do not invent framework versions or API behavior. If evidence is missing, record it under `Unknowns`.
    4. Review component, route, state, test, build, accessibility, and migration dimensions with file-path evidence.
    5. Write a Markdown note, usually under `{project_knowledge}/frontend/react-project-context-and-review.md`.

[Boundaries]
    Generic UX, PRD, Architecture, Story creation, and Code Review workflows remain in `sdlc`. This Skill does not create a SpecLite Web UI, dashboard, browser runtime, or GUI product scope.
