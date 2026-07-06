---
name: speclite-npm-package-project-auditor
description: "Audit npm package project facts before release planning. Use for npm package projects, package.json, package surface, tarball smoke, npx smoke, library entrypoints, CLI bins, publish metadata, or release-gate readiness. This is an evidence audit companion and does not run npm publish."
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

# Speclite Npm Package Project Auditor

[Overview]
    This workflow audits npm package project facts for a selected `ecosystem-other-npm-package` module. It focuses on `package.json`, package manager evidence, publish metadata, package surface, tarball / `npx` smoke planning, and release-gate readiness.

[Workflow]
    1. Confirm `{project-root}`, package root, and output location. Ask for the package root when a monorepo has multiple packages.
    2. Gather evidence from `package.json`, lockfiles, workspace config, README, LICENSE, source entrypoints, dist files, CI, and release scripts.
    3. Do not infer package manager, registry, exports, bin, files, or version facts without project evidence or command output.
    4. Write an audit note covering package surface, tarball / `npx` / library smoke plan, release gate readiness, unknowns, and handoff.
    5. If the user wants to publish, stop this workflow and hand off to `speclite-npm-publisher`.

[Boundaries]
    This Skill does not migrate or replace `speclite-npm-publisher`; it is a project-shape-specific audit companion.
