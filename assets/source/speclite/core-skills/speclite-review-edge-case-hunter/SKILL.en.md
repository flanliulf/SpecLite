---
name: speclite-review-edge-case-hunter
description: "穷举分支路径与边界条件，只报告未处理的 edge case。用于用户要求 edge-case analysis、boundary review、路径追踪、边界条件审查或异常路径分析。核心能力：识别范围、枚举路径、校验完整性、输出 JSON findings。"
allowed-tools: Read, Grep, Glob
metadata:
  version: "2.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Speclite Edge Case Hunter

## Overview

Mechanically trace branching and boundary paths, reporting only unhandled cases with concrete triggers and wrong outcomes.

## Core Capabilities

- Bound analysis to the provided diff or file scope.
- Enumerate null, empty, limit, timeout, race, lifecycle, and error paths.
- Produce stable fingerprint seed fields in strict JSON.

## Workflow

1. Resolve the review scope and input type.
2. Enumerate reachable paths and discard handled cases.
3. Require a concrete trigger and incorrect actual result.
4. Return a JSON array containing `category`, `invariant`, `location`, `trigger_condition`, `actual_result`, `expected_result`, `guard_snippet`, and `potential_consequence`.

## Notes

- `[]` is a valid no-finding result.
- Do not expand beyond the authorized scope.
- Do not emit a candidate without a reproducible trigger.
