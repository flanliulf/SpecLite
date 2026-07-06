---
name: speclite-cli-tool-contract-auditor
description: "Audit CLI tool project contracts from repository evidence. Use for bin entries, command surface, TTY or non-TTY output, exit codes, JSON contracts, shell portability, install smoke, or CLI command compatibility."
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

# Speclite CLI Tool Contract Auditor

[Overview]
    This workflow audits CLI tool project contracts for a selected `ecosystem-other-cli-tool` module. It focuses on bin entries, command surface, TTY / non-TTY behavior, exit codes, JSON contracts, shell portability, and install smoke evidence.

[Workflow]
    1. Confirm `{project-root}`, CLI package root, target command, and output location.
    2. Gather evidence from manifest `bin`, entry files, command parser, README, tests, fixtures, CI, and install instructions.
    3. Do not infer command behavior without code, tests, docs, or command output evidence.
    4. Write a CLI contract audit note covering command surface, I/O behavior, install smoke plan, compatibility risks, and unknowns.
    5. Hand implementation or repair work back to SDLC workflows.

[Boundaries]
    This Skill does not replace generic CLI human-output, Dev Story, Quick Dev, or Code Review workflows.
