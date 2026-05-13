#!/usr/bin/env python3
"""
merge_historical_facts.py — 历史文档摄取与候选事实合并

扫描历史文档目录，为每份文档建立索引、提取候选事实、识别潜在冲突。
历史文档不直接覆盖当前事实，只生成候选事实供后续交叉验证。

用法:
    python merge_historical_facts.py <project_root> [--history-dir docs/history] [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/historical-docs-index.json
    <output_dir>/evidence/business-fact-candidates.json
    <output_dir>/evidence/fact-conflicts.json

退出码:
    0 — 成功
    2 — 目录不存在
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


DOC_EXTENSIONS = {".md", ".rst", ".txt", ".adoc"}

# Document type classification keywords
DOC_TYPE_KEYWORDS = {
    "prd": ["prd", "产品需求", "product requirement", "需求文档", "需求说明"],
    "tsd": ["tsd", "技术方案", "technical spec", "技术设计", "technical design"],
    "add": ["add", "架构文档", "architecture doc", "架构设计"],
    "adr": ["adr", "架构决策", "architecture decision", "决策记录"],
    "epic": ["epic", "史诗"],
    "story": ["story", "故事", "用户故事"],
    "analysis": ["analysis", "分析", "调研", "研究", "report", "报告"],
}

# Patterns for extracting facts from documents
CAPABILITY_PATTERNS = [
    re.compile(r"(?:系统|平台|应用|模块)(?:支持|提供|实现|具备|包含)\s*(.+?)(?:[。，；\n])", re.IGNORECASE),
    re.compile(r"(?:support|provide|implement|enable|allow)\s+(.+?)(?:[.,;\n])", re.IGNORECASE),
]

MODULE_PATTERNS = [
    re.compile(r"(?:模块|服务|组件|系统)\s*[：:]\s*(.+?)(?:[。，；\n])"),
    re.compile(r"(?:module|service|component)\s*[：:]\s*(.+?)(?:[.,;\n])", re.IGNORECASE),
]

DATE_PATTERNS = [
    re.compile(r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})"),
    re.compile(r"(\d{4}年\d{1,2}月)"),
]


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def classify_doc_type(filepath, content):
    """Classify document type based on filename and content."""
    name_lower = os.path.basename(filepath).lower()
    content_lower = content[:2000].lower()

    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower or kw in content_lower:
                return doc_type
    return "other"


def extract_date(content):
    """Try to extract a date from document content."""
    for pat in DATE_PATTERNS:
        m = pat.search(content[:1000])
        if m:
            return m.group(1)
    return ""


def extract_title(content):
    """Extract title from first heading."""
    for line in content.split("\n")[:20]:
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def extract_module_scope(content):
    """Extract mentioned modules from content."""
    modules = set()
    for pat in MODULE_PATTERNS:
        for m in pat.finditer(content[:5000]):
            modules.add(m.group(1).strip()[:50])
    return list(modules)[:10]


def extract_capabilities(content):
    """Extract capability statements as candidate facts."""
    facts = []
    for pat in CAPABILITY_PATTERNS:
        for m in pat.finditer(content):
            statement = m.group(1).strip()
            if 5 < len(statement) < 200:
                facts.append(statement)
    return facts[:20]  # cap per document


def find_related_code_hints(content):
    """Find code path hints in document."""
    code_paths = set()
    # File path patterns
    path_pattern = re.compile(r"(?:src|app|server|client|lib|packages?)/[\w/.-]+\.\w+")
    for m in path_pattern.finditer(content):
        code_paths.add(m.group(0))
    return list(code_paths)[:20]


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Historical Facts Merger")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--history-dir", default="docs/history", help="History docs directory (relative to project root)")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: project root does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    history_path = os.path.join(root, args.history_dir)
    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    doc_index = []
    all_facts = []
    conflicts = []
    fact_counter = 0

    if not os.path.isdir(history_path):
        # No history directory — output empty results
        _write_outputs(evidence_dir, doc_index, all_facts, conflicts)
        print(json.dumps({
            "status": "ok",
            "message": f"History directory not found: {args.history_dir}. Empty outputs generated.",
            "docs_found": 0,
            "facts_extracted": 0,
        }, indent=2))
        return

    for dirpath, dirnames, filenames in os.walk(history_path):
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in DOC_EXTENSIONS:
                continue

            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, root).replace("\\", "/")

            try:
                content = Path(fpath).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue

            doc_type = classify_doc_type(rel_path, content)
            title = extract_title(content) or os.path.splitext(fname)[0]
            date_estimate = extract_date(content)
            module_scope = extract_module_scope(content)
            capabilities = extract_capabilities(content)
            code_hints = find_related_code_hints(content)

            # Build document index entry
            doc_entry = {
                "path": rel_path,
                "doc_type": doc_type,
                "title": title,
                "date_estimate": date_estimate,
                "module_scope": module_scope,
                "related_capabilities": capabilities[:5],
                "facts_extracted": len(capabilities),
            }
            doc_index.append(doc_entry)

            # Generate candidate facts
            for cap in capabilities:
                fact_counter += 1
                fact = {
                    "fact_id": f"BF-{fact_counter:03d}",
                    "statement": cap,
                    "source_type": "historical-doc",
                    "source_file": rel_path,
                    "related_code_paths": code_hints[:5],
                    "status": "UNVERIFIED",
                    "confidence": "low",
                    "notes": "",
                }
                all_facts.append(fact)

    # Simple conflict detection: find facts with similar statements
    seen_statements = {}
    for fact in all_facts:
        key = fact["statement"][:30].lower()
        if key in seen_statements:
            conflicts.append({
                "conflict_id": f"FC-{len(conflicts) + 1:03d}",
                "description": f"Similar claims from different sources",
                "fact_a": {"source": seen_statements[key], "claim": fact["statement"]},
                "fact_b": {"source": fact["source_file"], "claim": fact["statement"]},
                "resolution": "pending",
                "resolved_as": "",
            })
        else:
            seen_statements[key] = fact["source_file"]

    _write_outputs(evidence_dir, doc_index, all_facts, conflicts)

    print(json.dumps({
        "status": "ok",
        "docs_found": len(doc_index),
        "facts_extracted": len(all_facts),
        "conflicts_detected": len(conflicts),
    }, indent=2))


def _write_outputs(evidence_dir, doc_index, all_facts, conflicts):
    ts = now_iso()

    # historical-docs-index.json
    idx = {"documents": doc_index, "total_count": len(doc_index), "scan_timestamp": ts}
    with open(os.path.join(evidence_dir, "historical-docs-index.json"), "w", encoding="utf-8") as f:
        json.dump(idx, f, indent=2, ensure_ascii=False)

    # business-fact-candidates.json
    status_summary = {}
    for fact in all_facts:
        s = fact["status"]
        status_summary[s] = status_summary.get(s, 0) + 1

    facts_out = {
        "facts": all_facts,
        "total_count": len(all_facts),
        "status_summary": status_summary,
        "scan_timestamp": ts,
    }
    with open(os.path.join(evidence_dir, "business-fact-candidates.json"), "w", encoding="utf-8") as f:
        json.dump(facts_out, f, indent=2, ensure_ascii=False)

    # fact-conflicts.json
    conflicts_out = {
        "conflicts": conflicts,
        "total_count": len(conflicts),
        "pending_count": sum(1 for c in conflicts if c["resolution"] == "pending"),
        "scan_timestamp": ts,
    }
    with open(os.path.join(evidence_dir, "fact-conflicts.json"), "w", encoding="utf-8") as f:
        json.dump(conflicts_out, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
