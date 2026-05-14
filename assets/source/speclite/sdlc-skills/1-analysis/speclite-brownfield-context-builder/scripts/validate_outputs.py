#!/usr/bin/env python3
"""
validate_outputs.py — 产物验证

检查 brownfield 产物的完整性、JSON 合法性、Markdown 基本合法性和链接引用正确性。

用法:
    python validate_outputs.py <project_root> [--output-dir docs/brownfield] [--phase evidence|baseline|planning|all]

输出:
    JSON 格式的验证报告（stdout）

退出码:
    0 — 全部通过
    1 — 存在错误
    2 — 目录不存在
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path


# --- 必需文件定义 ---

EVIDENCE_MVP_FILES = [
    "evidence/repo-manifest.json",
    "evidence/api-inventory.json",
    "evidence/data-model-inventory.json",
    "evidence/dependency-graph.json",
]

EVIDENCE_OPTIONAL_FILES = [
    "evidence/existing-doc-inventory.json",
    "evidence/config-surface.json",
    "evidence/test-surface.json",
    "evidence/historical-docs-index.json",
    "evidence/business-fact-candidates.json",
    "evidence/fact-conflicts.json",
    "evidence/schema-migration-index.json",
    "evidence/tech-stack-strict.json",
    "evidence/api-inventory.gaps.json",
    "evidence/data-model-inventory.gaps.json",
]

# Coverage gap files paired with their primary inventory; used by check_coverage_gaps()
GAP_PAIRS = [
    ("evidence/api-inventory.gaps.json", "evidence/api-inventory.json"),
    ("evidence/data-model-inventory.gaps.json", "evidence/data-model-inventory.json"),
]

# Default coverage-gap red-line ratio: extractor coverage below 95% blocks Phase 3.
GAP_RATIO_THRESHOLD = 0.05

# Anchor format: [anchor:<file>#<jsonpath-or-Lline>]
ANCHOR_PATTERN = re.compile(r"\[anchor:([^\]\s]+)#([^\]\s]+)\]")

# A heuristic: lines that mention concrete technical nouns and need an anchor.
FACTUAL_TOKENS = re.compile(
    r"(?:\b(?:Controller|Entity|Service|Repository|Mapper|Producer|Consumer)\b|"
    r"(?:^|\s)/[a-zA-Z_][\w/{}.\-:]*|"
    r"\b(?:RocketMQ|RabbitMQ|Kafka|Pulsar|Redis|MySQL|PostgreSQL|MongoDB|Elasticsearch|Nacos|Eureka)\b)"
)
# Allowlist for code-fence and template-example sections is handled by skip flags below.

BASELINE_MVP_FILES = [
    "baseline/index.md",
    "baseline/system-overview.md",
    "baseline/as-is-architecture.md",
    "baseline/business-capability-matrix.md",
    "baseline/change-risk-map.md",
    "baseline/api-contracts.md",
]

PLANNING_MVP_FILES = [
    "planning/brownfield-planning-brief.md",
    "planning/prd.md",
    "planning/architecture.md",
    "planning/epics.md",
]

STATE_FILE = "project-scan-report.json"


def check_file_exists(base_dir, rel_path):
    """Check if file exists and is non-empty."""
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return {"status": "missing", "path": rel_path}
    size = os.path.getsize(full_path)
    if size == 0:
        return {"status": "empty", "path": rel_path}
    return {"status": "ok", "path": rel_path, "size": size}


def check_json_valid(base_dir, rel_path):
    """Check if JSON file is valid."""
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return {"status": "missing", "path": rel_path}
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"status": "ok", "path": rel_path, "keys": list(data.keys()) if isinstance(data, dict) else "array"}
    except json.JSONDecodeError as e:
        return {"status": "invalid_json", "path": rel_path, "error": str(e)}
    except OSError as e:
        return {"status": "read_error", "path": rel_path, "error": str(e)}


def check_markdown_valid(base_dir, rel_path):
    """Basic markdown validation: non-empty, has headings."""
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return {"status": "missing", "path": rel_path}
    try:
        content = Path(full_path).read_text(encoding="utf-8", errors="ignore")
    except OSError as e:
        return {"status": "read_error", "path": rel_path, "error": str(e)}

    if not content.strip():
        return {"status": "empty", "path": rel_path}

    has_heading = bool(re.search(r"^#{1,3}\s+", content, re.MULTILINE))
    if not has_heading:
        return {"status": "warning", "path": rel_path, "message": "No headings found"}

    return {"status": "ok", "path": rel_path, "lines": content.count("\n") + 1}


def check_state_file(base_dir):
    """Validate state file structure."""
    result = check_json_valid(base_dir, STATE_FILE)
    if result["status"] != "ok":
        return result

    full_path = os.path.join(base_dir, STATE_FILE)
    with open(full_path, "r", encoding="utf-8") as f:
        state = json.load(f)

    required_fields = ["workflow_version", "mode", "phase", "project_root",
                       "evidence_status", "baseline_status", "planning_status"]
    missing = [f for f in required_fields if f not in state]
    if missing:
        return {"status": "invalid_structure", "path": STATE_FILE, "missing_fields": missing}

    return {"status": "ok", "path": STATE_FILE, "mode": state.get("mode"), "phase": state.get("phase")}


def check_coverage_gaps(base_dir):
    """Mechanism 1: enforce extractor coverage red-line.
    For each (gap_file, primary_file) pair, if gap_ratio exceeds the threshold,
    return an error so Phase 3 cannot proceed.
    """
    issues = []
    for gap_rel, primary_rel in GAP_PAIRS:
        gap_full = os.path.join(base_dir, gap_rel)
        if not os.path.exists(gap_full):
            issues.append({"status": "missing_gaps_file", "path": gap_rel,
                            "hint": "extractor did not emit a coverage contract; rerun extractor"})
            continue
        try:
            with open(gap_full, "r", encoding="utf-8") as f:
                gap_data = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            issues.append({"status": "invalid_gaps_file", "path": gap_rel, "error": str(e)})
            continue
        ratio = gap_data.get("gap_ratio", 0)
        if ratio > GAP_RATIO_THRESHOLD:
            issues.append({
                "status": "coverage_red_line",
                "path": gap_rel,
                "primary": primary_rel,
                "gap_ratio": ratio,
                "gap_threshold": GAP_RATIO_THRESHOLD,
                "gap_count": gap_data.get("gap_count"),
                "hint": "extractor missed too many candidate files; fix extractor before Phase 3",
            })
    return issues


def _strip_code_fences(content):
    """Remove ```...``` blocks so we don't false-positive on examples."""
    return re.sub(r"```.*?```", "", content, flags=re.DOTALL)


def _resolve_anchor(base_dir, target, frag):
    """Resolve an [anchor:target#frag] reference.
    target = a path relative to either the project root or docs/brownfield/.
    frag   = JSON-pointer-like (#/apis/42) or line ref (#L27).
    Returns dict with status: ok | missing_target | invalid_fragment.
    """
    # Try project root first, then base_dir
    candidates = []
    proj_root = os.path.dirname(base_dir.rstrip("/"))  # one level up from docs/brownfield
    candidates.append(os.path.normpath(os.path.join(base_dir, target)))
    candidates.append(os.path.normpath(os.path.join(proj_root, target)))
    target_path = next((c for c in candidates if os.path.exists(c)), None)
    if not target_path:
        return {"status": "missing_target", "target": target}

    if frag.startswith("L") and frag[1:].isdigit():
        line_no = int(frag[1:])
        try:
            with open(target_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
            if 1 <= line_no <= len(lines):
                return {"status": "ok"}
            return {"status": "invalid_fragment", "target": target,
                    "fragment": frag, "reason": f"line {line_no} out of range (file has {len(lines)} lines)"}
        except OSError as e:
            return {"status": "read_error", "target": target, "error": str(e)}

    if frag.startswith("/"):
        # JSON pointer; only meaningful for JSON files
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            return {"status": "invalid_fragment", "target": target,
                    "fragment": frag, "error": str(e)}
        node = data
        for part in frag[1:].split("/"):
            if part == "":
                continue
            try:
                if isinstance(node, list):
                    node = node[int(part)]
                elif isinstance(node, dict):
                    node = node[part]
                else:
                    return {"status": "invalid_fragment", "target": target,
                            "fragment": frag, "reason": f"cannot descend into {type(node).__name__} at {part!r}"}
            except (KeyError, IndexError, ValueError):
                return {"status": "invalid_fragment", "target": target,
                        "fragment": frag, "reason": f"pointer segment not found: {part!r}"}
        return {"status": "ok"}

    return {"status": "invalid_fragment", "target": target, "fragment": frag,
            "reason": "unrecognized fragment scheme; use #/json/pointer or #L<line>"}


def check_anchors(base_dir, rel_path):
    """Mechanism 4: every anchor in baseline must resolve mechanically.
    Returns list of issues for unresolved anchors.
    """
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return []
    try:
        content = Path(full_path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []

    issues = []
    for m in ANCHOR_PATTERN.finditer(content):
        target, frag = m.group(1), m.group(2)
        result = _resolve_anchor(base_dir, target, frag)
        if result["status"] != "ok":
            issues.append({
                "status": "anchor_unresolved",
                "source": rel_path,
                "anchor": m.group(0),
                "detail": result,
            })
    return issues


def check_unanchored_facts(base_dir, rel_path):
    """Mechanism 4 (companion): factual lines must carry an [anchor:...] tag.
    A line is considered factual when it matches FACTUAL_TOKENS and is NOT inside
    a code fence, an HTML comment, or a heading.
    """
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return []
    try:
        raw = Path(full_path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []
    content = _strip_code_fences(raw)

    issues = []
    for lineno, line in enumerate(content.splitlines(), start=1):
        s = line.strip()
        if not s:
            continue
        if s.startswith("#") or s.startswith(">") or s.startswith("|---") or s.startswith("---"):
            continue
        if "<!--" in s and "-->" in s:
            continue
        # Skip table-header rows (the line right after a header) — they list column names
        if FACTUAL_TOKENS.search(line) and "[anchor:" not in line and "evidence/" not in line:
            issues.append({
                "status": "unanchored_fact",
                "source": rel_path,
                "line": lineno,
                "preview": s[:120],
            })
    # Cap to 50 issues per file to keep reports usable
    return issues[:50]


def check_markdown_links(base_dir, rel_path):
    """Check if markdown internal links point to existing files."""
    full_path = os.path.join(base_dir, rel_path)
    if not os.path.exists(full_path):
        return []

    content = Path(full_path).read_text(encoding="utf-8", errors="ignore")
    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    broken_links = []

    doc_dir = os.path.dirname(full_path)
    for m in link_pattern.finditer(content):
        target = m.group(2)
        if target.startswith("http") or target.startswith("#"):
            continue
        target_path = os.path.normpath(os.path.join(doc_dir, target))
        if not os.path.exists(target_path):
            broken_links.append({"source": rel_path, "link_text": m.group(1), "target": target})

    return broken_links


def validate_phase(base_dir, phase):
    """Validate outputs for a specific phase."""
    results = {"phase": phase, "errors": [], "warnings": [], "passed": []}

    if phase in ("evidence", "all"):
        for f in EVIDENCE_MVP_FILES:
            r = check_json_valid(base_dir, f)
            if r["status"] == "ok":
                results["passed"].append(r)
            else:
                results["errors"].append(r)

        for f in EVIDENCE_OPTIONAL_FILES:
            r = check_json_valid(base_dir, f)
            if r["status"] == "ok":
                results["passed"].append(r)
            elif r["status"] == "missing":
                results["warnings"].append(r)
            else:
                results["errors"].append(r)

        # Mechanism 1: extractor coverage red-line
        for issue in check_coverage_gaps(base_dir):
            if issue["status"] == "missing_gaps_file":
                results["warnings"].append(issue)
            else:
                results["errors"].append(issue)

    if phase in ("baseline", "all"):
        for f in BASELINE_MVP_FILES:
            r = check_markdown_valid(base_dir, f)
            if r["status"] == "ok":
                results["passed"].append(r)
            elif r["status"] == "warning":
                results["warnings"].append(r)
            else:
                results["errors"].append(r)

        # Check links in baseline files
        for f in BASELINE_MVP_FILES:
            broken = check_markdown_links(base_dir, f)
            for link in broken:
                results["warnings"].append({"status": "broken_link", **link})

        # Mechanism 4: anchor resolution and unanchored-fact detection
        for f in BASELINE_MVP_FILES:
            for issue in check_anchors(base_dir, f):
                results["errors"].append(issue)
            for issue in check_unanchored_facts(base_dir, f):
                # Treat unanchored facts as warnings by default; promote to error
                # in strict mode (--strict-anchors).
                results["warnings"].append(issue)

    if phase in ("planning", "all"):
        for f in PLANNING_MVP_FILES:
            r = check_markdown_valid(base_dir, f)
            if r["status"] == "ok":
                results["passed"].append(r)
            elif r["status"] == "warning":
                results["warnings"].append(r)
            else:
                results["errors"].append(r)

    if phase == "all":
        state_result = check_state_file(base_dir)
        if state_result["status"] == "ok":
            results["passed"].append(state_result)
        else:
            results["errors"].append(state_result)

    return results


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Output Validator")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    parser.add_argument("--phase", default="all", choices=["evidence", "baseline", "planning", "all"],
                        help="Which phase to validate")
    parser.add_argument("--strict-anchors", action="store_true",
                        help="Promote unanchored-fact warnings to errors (Mechanism 4 strict mode).")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    base_dir = os.path.join(root, args.output_dir)
    if not os.path.isdir(base_dir):
        print(json.dumps({
            "status": "error",
            "message": f"Output directory not found: {args.output_dir}",
            "errors": 1, "warnings": 0, "passed": 0,
        }, indent=2))
        sys.exit(1)

    results = validate_phase(base_dir, args.phase)

    if args.strict_anchors:
        promoted = [w for w in results["warnings"] if w.get("status") == "unanchored_fact"]
        results["warnings"] = [w for w in results["warnings"] if w.get("status") != "unanchored_fact"]
        results["errors"].extend(promoted)

    summary = {
        "status": "pass" if not results["errors"] else "fail",
        "phase": results["phase"],
        "errors": len(results["errors"]),
        "warnings": len(results["warnings"]),
        "passed": len(results["passed"]),
        "error_details": results["errors"],
        "warning_details": results["warnings"][:20],
    }

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    sys.exit(0 if not results["errors"] else 1)


if __name__ == "__main__":
    main()
