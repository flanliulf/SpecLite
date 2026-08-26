---
name: speclite-review-acceptance-auditor
description: "按 Story 验收标准 AC 审计代码变更并报告偏差。用于用户要求 acceptance audit、AC review、规格合规检查或核对实现是否满足 Story。核心能力：关联 AC 与代码证据、发现缺口、输出结构化 Markdown findings。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Acceptance Auditor

## Overview

Compare scoped implementation changes with Story acceptance criteria and report objective contract gaps.

## Core Capabilities

- Map each AC to implementation evidence.
- Detect violations, missing behavior, contradictions, and unsupported equivalence claims.
- Provide stable category, invariant, failure scenario, AC reference, and code location.

## Workflow

1. Load the scoped code input and AC set; halt if either is unreadable.
2. Build an AC checklist and verify each item against code evidence.
3. Reject style-only concerns that do not produce an AC violation.
4. Return structured Markdown findings, or an empty list when coverage is complete.

## Notes

- Every finding must cite a concrete AC and code location.
- Do not broaden the mutation scope while following references.
- A potential concern without an AC-breaking result is not a finding.
