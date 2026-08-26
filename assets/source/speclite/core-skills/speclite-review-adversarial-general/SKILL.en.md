---
name: speclite-review-adversarial-general
description: "对内容、spec、story、diff 或文档做批判性审查并产出 findings。用于用户要求 critical review、adversarial review、挑刺或风险审查。核心能力：识别输入类型、应用怀疑式分析、给出可修复问题并在空输入时停止。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Adversarial Review General

## Overview

Review diffs, specifications, stories, and documents with professional skepticism. There is no minimum finding quota; zero findings is valid.

## Core Capabilities

- Require first-hand evidence for every material finding.
- Record a stable category, one violated invariant, a concrete input/state-to-failure scenario, and a primary location.
- Reject speculative branches and wording-only novelty.

## Workflow

1. Load and classify the input; halt when it is empty or unreadable.
2. Search for contradictions, missing guarantees, and material risks.
3. Discard candidates without a concrete failure scenario or evidence.
4. Return a Markdown list with `category`, `invariant`, `concrete_failure_scenario`, `primary_location`, and description.

## Notes

- Never manufacture findings to reach a count.
- A zero-finding result is legitimate.
- Keep the tone precise and professional.
