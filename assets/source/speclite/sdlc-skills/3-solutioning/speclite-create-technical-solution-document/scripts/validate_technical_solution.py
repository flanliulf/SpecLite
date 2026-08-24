#!/usr/bin/env python3
"""Validate the structure of a human-readable technical solution document.

The validator uses only Python's standard library. It checks deterministic
document structure and finalization signals; it does not claim to validate the
truth of project facts or the full Mermaid grammar.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


REQUIRED_FRONTMATTER = (
    "title",
    "requirementId",
    "status",
    "version",
    "authors",
    "reviewers",
    "updatedAt",
    "targetRelease",
    "generatedBy",
    "sourceDocuments",
)

REQUIRED_HEADINGS = (
    "## Document Control（文档控制）",
    "## Executive Summary（执行摘要）",
    "## Context and Scope（背景与范围）",
    "## Current and Target State（现状与目标态）",
    "## Architecture Overview（架构总览）",
    "## Detailed Design（详细设计）",
    "## Quality Attributes（质量属性）",
    "## Deployment and Migration（部署与迁移）",
    "## Test and Acceptance（测试与验收）",
    "## Risks and Open Questions（风险与开放问题）",
    "## Traceability and Appendices（追溯与附录）",
)

ALLOWED_MERMAID_TYPES = (
    "flowchart",
    "sequenceDiagram",
    "stateDiagram-v2",
    "classDiagram",
    "erDiagram",
    "gantt",
)

GENERATION_MARKER = (
    "*本文档由 speclite-create-technical-solution-document Skill 自动生成*"
)


@dataclass(frozen=True)
class Finding:
    """One deterministic validation finding."""

    severity: str
    rule: str
    message: str
    line: int | None = None


def parse_frontmatter(text: str) -> tuple[dict[str, str], int, list[Finding]]:
    """Extract simple top-level YAML fields without requiring a YAML package."""

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, 0, [Finding("error", "TSD-001", "文档必须以 YAML frontmatter 开始", 1)]

    end = next((index for index in range(1, len(lines)) if lines[index].strip() == "---"), None)
    if end is None:
        return {}, 0, [Finding("error", "TSD-002", "YAML frontmatter 缺少结束标记", 1)]

    fields: dict[str, str] = {}
    for raw_line in lines[1:end]:
        match = re.match(r"^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$", raw_line)
        if match:
            fields[match.group(1)] = (match.group(2) or "").strip().strip('"\'')
    return fields, end + 1, []


def nearest_nonempty(lines: list[str], start: int, direction: int, limit: int = 6) -> str:
    """Return nearby non-empty text before or after a code fence."""

    found: list[str] = []
    index = start
    while 0 <= index < len(lines) and len(found) < limit:
        value = lines[index].strip()
        if value:
            found.append(value)
        index += direction
    return "\n".join(found)


def validate_mermaid(lines: list[str]) -> list[Finding]:
    """Check Mermaid fence balance, supported types, purpose, and conclusion."""

    findings: list[Finding] = []
    open_fence: int | None = None
    mermaid_starts: list[int] = []

    for index, line in enumerate(lines):
        stripped = line.strip()
        if not stripped.startswith("```"):
            continue
        if open_fence is None:
            open_fence = index
            if stripped == "```mermaid":
                mermaid_starts.append(index)
        else:
            open_fence = None

    if open_fence is not None:
        findings.append(Finding("error", "TSD-020", "Markdown code fence 未闭合", open_fence + 1))

    for start in mermaid_starts:
        end = next(
            (index for index in range(start + 1, len(lines)) if lines[index].strip() == "```"),
            None,
        )
        if end is None:
            continue
        first = next((lines[index].strip() for index in range(start + 1, end) if lines[index].strip()), "")
        if not any(first.startswith(diagram_type) for diagram_type in ALLOWED_MERMAID_TYPES):
            findings.append(
                Finding("error", "TSD-021", f"不支持或缺失 Mermaid diagram type：{first or '(empty)'}", start + 1)
            )
        before = nearest_nonempty(lines, start - 1, -1)
        after = nearest_nonempty(lines, end + 1, 1)
        if "图示目的：" not in before:
            findings.append(Finding("warning", "TSD-022", "Mermaid 图前缺少“图示目的：”", start + 1))
        if "关键结论：" not in after:
            findings.append(Finding("warning", "TSD-023", "Mermaid 图后缺少“关键结论：”", end + 1))
    return findings


def validate_text(text: str, mode: str) -> list[Finding]:
    """Validate document text for the requested mode."""

    findings: list[Finding] = []
    fields, _, frontmatter_findings = parse_frontmatter(text)
    findings.extend(frontmatter_findings)
    lines = text.splitlines()

    for field in REQUIRED_FRONTMATTER:
        if field not in fields:
            findings.append(Finding("error", "TSD-003", f"frontmatter 缺少字段：{field}"))

    status = fields.get("status", "")
    if status and status not in {"Draft", "Review", "Approved", "Superseded"}:
        findings.append(Finding("error", "TSD-004", f"不支持的 status：{status}"))
    if mode == "final" and status not in {"Review", "Approved"}:
        findings.append(Finding("error", "TSD-005", "final 模式要求 status 为 Review 或 Approved"))

    for heading in REQUIRED_HEADINGS:
        if heading not in text:
            findings.append(Finding("error", "TSD-010", f"缺少必需章节：{heading}"))

    if "| Source | Type | Version / Commit | Status | Used For |" not in text:
        findings.append(Finding("error", "TSD-011", "缺少 Source Baseline 标准表头"))
    if "| Requirement ID | Design Section | Component or Contract | Verification | Status |" not in text:
        findings.append(Finding("error", "TSD-012", "缺少 Requirement Traceability 标准表头"))
    if GENERATION_MARKER not in text:
        findings.append(Finding("error", "TSD-013", "缺少 Skill 生成标注"))

    for index, line in enumerate(lines, start=1):
        if "暂无" in line:
            findings.append(Finding("error", "TSD-014", "禁止使用无解释的“暂无”；改用 N/A 或 TBD 记录", index))

    placeholders = list(re.finditer(r"\{\{[^{}]+\}\}", text))
    if placeholders:
        severity = "error" if mode == "final" else "warning"
        findings.append(
            Finding(severity, "TSD-015", f"仍有 {len(placeholders)} 个模板占位符未替换")
        )

    if mode == "final":
        for index, line in enumerate(lines, start=1):
            if "TBD" not in line:
                continue
            if re.search(r"\d{4}-\d{2}-\d{2}", line) and line.count("|") >= 4:
                findings.append(Finding("warning", "TSD-016", "final 文档仍有带 owner/due date 的 TBD，请确认非阻塞", index))
            else:
                findings.append(Finding("error", "TSD-017", "final 文档中的 TBD 必须在同一表行记录 owner 与 due date", index))

    findings.extend(validate_mermaid(lines))
    return findings


def render_report(path: str, mode: str, findings: list[Finding], as_json: bool) -> None:
    """Print a deterministic human or JSON report."""

    errors = sum(item.severity == "error" for item in findings)
    warnings = sum(item.severity == "warning" for item in findings)
    if as_json:
        print(
            json.dumps(
                {
                    "path": path,
                    "mode": mode,
                    "errors": errors,
                    "warnings": warnings,
                    "findings": [asdict(item) for item in findings],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return

    print(f"Technical Solution Document Validation: {path}")
    print(f"Mode: {mode} | Errors: {errors} | Warnings: {warnings}")
    for item in findings:
        location = f" line {item.line}" if item.line is not None else ""
        print(f"[{item.severity.upper()}] {item.rule}{location}: {item.message}")


def self_test() -> int:
    """Run in-memory positive and negative checks without writing files."""

    headings = "\n\n".join(REQUIRED_HEADINGS)
    valid = f'''---
title: "Example"
requirementId: "req-1"
status: "Review"
version: "1.0.0"
authors:
reviewers:
updatedAt: "2026-08-21"
targetRelease: "v1"
generatedBy: "speclite-create-technical-solution-document"
sourceDocuments:
---
# Example
{headings}
| Source | Type | Version / Commit | Status | Used For |
|---|---|---|---|---|
| Requirement ID | Design Section | Component or Contract | Verification | Status |
|---|---|---|---|---|
{GENERATION_MARKER}
'''
    invalid = valid.replace('status: "Review"', 'status: "Draft"').replace(GENERATION_MARKER, "{{marker}}")
    valid_findings = validate_text(valid, "final")
    invalid_findings = validate_text(invalid, "final")
    if any(item.severity == "error" for item in valid_findings):
        print("self-test failed: valid fixture produced errors", file=sys.stderr)
        return 1
    if not any(item.severity == "error" for item in invalid_findings):
        print("self-test failed: invalid fixture produced no errors", file=sys.stderr)
        return 1
    print("self-test passed")
    return 0


def main() -> int:
    """CLI entry point."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("document", nargs="?", help="Markdown technical solution document")
    parser.add_argument("--mode", choices=("draft", "final"), default="draft")
    parser.add_argument("--json", action="store_true", help="Emit JSON report")
    parser.add_argument("--self-test", action="store_true", help="Run in-memory self-tests")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if not args.document:
        parser.error("document is required unless --self-test is used")

    path = Path(args.document)
    if not path.is_file():
        print(f"document not found: {path}", file=sys.stderr)
        return 2
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        print(f"unable to read document: {exc}", file=sys.stderr)
        return 2

    findings = validate_text(text, args.mode)
    render_report(str(path), args.mode, findings, args.json)
    return 1 if any(item.severity == "error" for item in findings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
