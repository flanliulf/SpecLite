#!/usr/bin/env python3
"""Validate terminology-governance Markdown outputs.

The validator checks Epic filename/title parity, three-column term tables,
Chinese display names, duplicates, inventory statuses, and glossary index links.
It never edits files. Exit code 0 means no errors; exit code 1 means validation
errors; exit code 2 means invocation or filesystem failure.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


EPIC_FILE_RE = re.compile(r"^epic-(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$")
EPIC_TITLE_RE = re.compile(r"^# Epic (\d+): .+ Glossary（.+术语表）$")
CJK_RE = re.compile(r"[\u3400-\u9fff]")
SEPARATOR_RE = re.compile(r"^:?-{3,}:?$")
ALLOWED_STATUSES = {"candidate", "approved", "conflicted", "deprecated"}
TERM_HEADER = ["Term", "中文直译", "Definition"]
INVENTORY_HEADER = [
    "Canonical Term",
    "中文名称",
    "Definition",
    "Category",
    "Scope",
    "Sources",
    "Status",
    "Aliases",
]
DOMAIN_HEADER = [
    "Term",
    "Candidate Kind",
    "Proposed Bounded Context",
    "Evidence",
    "Conflicts",
    "Recommendation",
]


@dataclass(frozen=True)
class Finding:
    severity: str
    code: str
    file: str
    line: int
    message: str


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate terminology-governance Markdown outputs.")
    parser.add_argument("glossary_root", type=Path, help="Directory containing glossary Markdown files.")
    parser.add_argument("--require-index", action="store_true", help="Require index.md and Epic links.")
    parser.add_argument("--format", choices=("human", "json"), default="human", dest="output_format")
    return parser.parse_args(argv)


def split_markdown_row(line: str) -> list[str] | None:
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return None
    cells: list[str] = []
    current: list[str] = []
    escaped = False
    for char in stripped[1:-1]:
        if escaped:
            current.append(char)
            escaped = False
        elif char == "\\":
            current.append(char)
            escaped = True
        elif char == "|":
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(char)
    cells.append("".join(current).strip())
    return cells


def is_separator(cells: list[str] | None, width: int) -> bool:
    return bool(cells and len(cells) == width and all(SEPARATOR_RE.fullmatch(cell) for cell in cells))


def strip_bold(value: str) -> str:
    value = value.strip()
    return value[2:-2].strip() if value.startswith("**") and value.endswith("**") else value


def is_technical_identifier(term: str, chinese_name: str) -> bool:
    raw_term = strip_bold(term).strip("`")
    raw_name = chinese_name.strip().strip("`")
    if raw_name != raw_term:
        return False
    if term.strip().startswith("`") and term.strip().endswith("`"):
        return True
    if re.search(r"[._/:@#]", raw_term) or raw_term.startswith("--"):
        return True
    if re.search(r"[a-z][A-Z]", raw_term) or re.fullmatch(r"[A-Z][A-Z0-9_-]+", raw_term):
        return True
    return False


def add_finding(
    findings: list[Finding], severity: str, code: str, path: Path, line: int, message: str
) -> None:
    findings.append(Finding(severity, code, path.as_posix(), line, message))


def table_rows(lines: list[str], header_index: int, width: int) -> Iterable[tuple[int, list[str]]]:
    for index in range(header_index + 2, len(lines)):
        cells = split_markdown_row(lines[index])
        if cells is None or len(cells) != width:
            break
        yield index, cells


def validate_epic_file(path: Path, findings: list[Finding]) -> tuple[int, int]:
    match = EPIC_FILE_RE.fullmatch(path.name)
    if not match:
        return (0, 0)
    expected_number = int(match.group(1))
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or not EPIC_TITLE_RE.fullmatch(lines[0]):
        add_finding(findings, "error", "EPIC_TITLE", path, 1, "H1 does not match the Epic glossary title contract.")
    else:
        title_number = int(EPIC_TITLE_RE.fullmatch(lines[0]).group(1))  # type: ignore[union-attr]
        if title_number != expected_number:
            add_finding(
                findings,
                "error",
                "EPIC_NUMBER",
                path,
                1,
                f"Filename Epic {expected_number} does not match H1 Epic {title_number}.",
            )

    table_count = 0
    row_count = 0
    seen_terms: dict[str, int] = {}
    for index, line in enumerate(lines):
        cells = split_markdown_row(line)
        if cells != TERM_HEADER:
            continue
        table_count += 1
        if index + 1 >= len(lines) or not is_separator(split_markdown_row(lines[index + 1]), 3):
            add_finding(findings, "error", "TERM_SEPARATOR", path, index + 2, "Term table separator is invalid.")
            continue
        local_rows = 0
        for row_index, row in table_rows(lines, index, 3):
            local_rows += 1
            row_count += 1
            term = strip_bold(row[0])
            chinese_name = row[1].strip()
            definition = row[2].strip()
            if not term:
                add_finding(findings, "error", "TERM_EMPTY", path, row_index + 1, "Term is empty.")
            if not chinese_name:
                add_finding(findings, "error", "CHINESE_EMPTY", path, row_index + 1, f"Chinese name is empty for {term!r}.")
            elif not CJK_RE.search(chinese_name) and not is_technical_identifier(row[0], chinese_name):
                add_finding(
                    findings,
                    "error",
                    "CHINESE_MISSING",
                    path,
                    row_index + 1,
                    f"Chinese name for {term!r} has no Chinese text and is not an exact technical identifier.",
                )
            if not definition:
                add_finding(findings, "error", "DEFINITION_EMPTY", path, row_index + 1, f"Definition is empty for {term!r}.")
            normalized = term.casefold()
            if normalized in seen_terms:
                add_finding(
                    findings,
                    "error",
                    "TERM_DUPLICATE",
                    path,
                    row_index + 1,
                    f"Duplicate term {term!r}; first seen at line {seen_terms[normalized]}.",
                )
            else:
                seen_terms[normalized] = row_index + 1
        if local_rows == 0:
            add_finding(findings, "error", "TERM_TABLE_EMPTY", path, index + 1, "Term table has no rows.")
    if table_count == 0:
        add_finding(findings, "error", "TERM_TABLE_MISSING", path, 1, "Epic glossary has no Term table.")
    return table_count, row_count


def validate_inventory(path: Path, findings: list[Finding]) -> int:
    if not path.exists():
        return 0
    lines = path.read_text(encoding="utf-8").splitlines()
    rows_total = 0
    seen: dict[tuple[str, str], int] = {}
    for index, line in enumerate(lines):
        cells = split_markdown_row(line)
        if cells != INVENTORY_HEADER:
            continue
        if index + 1 >= len(lines) or not is_separator(split_markdown_row(lines[index + 1]), 8):
            add_finding(findings, "error", "INVENTORY_SEPARATOR", path, index + 2, "Inventory separator is invalid.")
            continue
        for row_index, row in table_rows(lines, index, 8):
            rows_total += 1
            term = strip_bold(row[0])
            scope = row[4].strip()
            status = row[6].strip()
            status_tokens = set(re.split(r"[\s,|/]+", status))
            if {"conflicted", "approved"}.issubset(status_tokens):
                add_finding(findings, "error", "CONFLICT_APPROVED", path, row_index + 1, "A conflicted row cannot be approved.")
            if status not in ALLOWED_STATUSES:
                add_finding(
                    findings,
                    "error",
                    "INVENTORY_STATUS",
                    path,
                    row_index + 1,
                    f"Status {status!r} is not one of {sorted(ALLOWED_STATUSES)}.",
                )
            key = (term.casefold().replace("-", " "), scope.casefold())
            if key in seen:
                add_finding(
                    findings,
                    "error",
                    "INVENTORY_DUPLICATE",
                    path,
                    row_index + 1,
                    f"Duplicate canonical term and scope; first seen at line {seen[key]}.",
                )
            else:
                seen[key] = row_index + 1
    return rows_total


def validate_domain_candidates(path: Path, findings: list[Finding]) -> int:
    if not path.exists():
        return 0
    lines = path.read_text(encoding="utf-8").splitlines()
    rows_total = 0
    for index, line in enumerate(lines):
        cells = split_markdown_row(line)
        if cells != DOMAIN_HEADER:
            continue
        if index + 1 >= len(lines) or not is_separator(split_markdown_row(lines[index + 1]), 6):
            add_finding(findings, "error", "DOMAIN_SEPARATOR", path, index + 2, "Domain candidate separator is invalid.")
            continue
        for row_index, row in table_rows(lines, index, 6):
            rows_total += 1
            if any(not cell.strip() for cell in row[:4]):
                add_finding(findings, "error", "DOMAIN_REQUIRED", path, row_index + 1, "Domain candidate required fields are empty.")
    if "CONTEXT.md" in path.read_text(encoding="utf-8") and "speclite-domain-modeling" not in path.read_text(encoding="utf-8"):
        add_finding(
            findings,
            "warning",
            "DOMAIN_HANDOFF",
            path,
            1,
            "CONTEXT.md is referenced without an explicit speclite-domain-modeling handoff.",
        )
    return rows_total


def validate_index(root: Path, epic_files: list[Path], findings: list[Finding], required: bool) -> None:
    index_path = root / "index.md"
    if not index_path.exists():
        if required:
            add_finding(findings, "error", "INDEX_MISSING", index_path, 1, "index.md is required.")
        return
    contents = index_path.read_text(encoding="utf-8")
    links = re.findall(r"\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]+)?\)", contents)
    link_set = set(links)
    for target in links:
        if not (root / target).exists():
            add_finding(findings, "error", "INDEX_BROKEN", index_path, 1, f"Index target does not exist: {target}")
    for epic_path in epic_files:
        if epic_path.name not in link_set:
            add_finding(findings, "error", "INDEX_EPIC_MISSING", index_path, 1, f"Epic glossary is not linked: {epic_path.name}")
    for row_number, line in enumerate(contents.splitlines(), start=1):
        match = re.search(r"\]\(([^)]+\.md)\).*\bEpic\s+(\d+)\b", line)
        if not match:
            continue
        target, number = match.group(1), int(match.group(2))
        expected_prefix = f"epic-{number:02d}-"
        if not Path(target).name.startswith(expected_prefix):
            add_finding(
                findings,
                "error",
                "INDEX_EPIC_STALE",
                index_path,
                row_number,
                f"Epic {number} link does not use {expected_prefix} prefix: {target}",
            )


def render_human(report: dict[str, object]) -> str:
    lines = [
        f"status={report['status']}",
        f"epicFiles={report['epicFiles']} termTables={report['termTables']} termRows={report['termRows']}",
        f"inventoryRows={report['inventoryRows']} domainCandidateRows={report['domainCandidateRows']}",
    ]
    for finding in report["findings"]:  # type: ignore[union-attr]
        lines.append(
            f"{finding['severity'].upper()} {finding['code']} {finding['file']}:{finding['line']} {finding['message']}"
        )
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    root = args.glossary_root.resolve()
    if not root.is_dir():
        print(f"glossary root is not a directory: {root}", file=sys.stderr)
        return 2

    findings: list[Finding] = []
    epic_files = sorted(path for path in root.glob("epic-*.md") if EPIC_FILE_RE.fullmatch(path.name))
    term_tables = 0
    term_rows = 0
    for path in epic_files:
        tables, rows = validate_epic_file(path, findings)
        term_tables += tables
        term_rows += rows
    if not epic_files:
        add_finding(findings, "warning", "EPIC_FILES_MISSING", root, 1, "No epic-{NN}-{slug}.md files found.")

    inventory_rows = validate_inventory(root / "terminology-inventory.md", findings)
    domain_rows = validate_domain_candidates(root / "domain-candidates.md", findings)
    validate_index(root, epic_files, findings, args.require_index)

    errors = sum(1 for finding in findings if finding.severity == "error")
    warnings = sum(1 for finding in findings if finding.severity == "warning")
    report: dict[str, object] = {
        "schemaVersion": "speclite.terminology-governance-validation.v1",
        "status": "error" if errors else "ok",
        "glossaryRoot": root.as_posix(),
        "epicFiles": len(epic_files),
        "termTables": term_tables,
        "termRows": term_rows,
        "inventoryRows": inventory_rows,
        "domainCandidateRows": domain_rows,
        "errors": errors,
        "warnings": warnings,
        "findings": [asdict(finding) for finding in findings],
    }
    if args.output_format == "json":
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(render_human(report))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
