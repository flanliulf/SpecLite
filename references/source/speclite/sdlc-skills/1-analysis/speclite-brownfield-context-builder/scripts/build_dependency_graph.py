#!/usr/bin/env python3
"""
build_dependency_graph.py — 模块依赖图构建

分析项目中的 import/require 语句，构建模块间依赖关系图。
支持 JS/TS (import/require)、Python (import/from)、Java/Kotlin (import)、Go (import)。

用法:
    python build_dependency_graph.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/dependency-graph.json

退出码:
    0 — 成功
    1 — 参数错误
    2 — 目录不存在
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode", "build", "dist", "target", ".next", ".nuxt",
    ".cache", "vendor", "Pods"
}

CODE_EXTENSIONS = {".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".kt", ".go"}

# --- Import patterns ---

# JS/TS: import X from './path'  or  require('./path')
JS_IMPORT = re.compile(r"""(?:import\s+.*?\s+from\s+|import\s+|require\s*\(\s*)['"]([^'"]+)['"]""")

# Python: from package import X  or  import package
PY_IMPORT = re.compile(r"""^(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))""", re.MULTILINE)

# Java/Kotlin: import com.example.Class
JAVA_IMPORT = re.compile(r"""^import\s+([\w.]+);?""", re.MULTILINE)

# Go: import "package" or import ( "package" )
GO_IMPORT = re.compile(r"""["\s]([\w./]+)["]\s*""")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_local_import(imp, ext):
    """Check if import is a local/relative import (not external package)."""
    if ext in (".ts", ".js", ".tsx", ".jsx"):
        return imp.startswith(".") or imp.startswith("@/") or imp.startswith("~/")
    elif ext == ".py":
        return not imp.startswith(("os", "sys", "re", "json", "typing", "collections",
                                   "datetime", "pathlib", "io", "functools", "itertools",
                                   "abc", "enum", "dataclasses", "logging", "unittest",
                                   "pytest", "flask", "django", "fastapi", "sqlalchemy",
                                   "requests", "httpx", "aiohttp", "celery", "redis",
                                   "boto3", "numpy", "pandas", "pydantic"))
    elif ext in (".java", ".kt"):
        # Consider internal if matches common project package patterns
        return not imp.startswith(("java.", "javax.", "kotlin.", "org.springframework",
                                   "org.junit", "org.apache", "org.slf4j", "com.google",
                                   "com.fasterxml", "io.swagger", "lombok"))
    elif ext == ".go":
        return not ("/" in imp and not imp.startswith("."))
    return False


def resolve_import(imp, source_file, root, ext):
    """Try to resolve import to a file path."""
    source_dir = os.path.dirname(source_file)

    if ext in (".ts", ".js", ".tsx", ".jsx"):
        if imp.startswith("."):
            base = os.path.normpath(os.path.join(source_dir, imp))
            for candidate_ext in (".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"):
                candidate = base + candidate_ext
                if os.path.exists(os.path.join(root, candidate)):
                    return candidate.replace("\\", "/")
        elif imp.startswith("@/") or imp.startswith("~/"):
            cleaned = imp.lstrip("@~/")
            for prefix in ("src/", ""):
                base = os.path.join(prefix, cleaned)
                for candidate_ext in (".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"):
                    candidate = base + candidate_ext
                    if os.path.exists(os.path.join(root, candidate)):
                        return candidate.replace("\\", "/")
    elif ext == ".py":
        module_path = imp.replace(".", "/")
        for candidate_ext in (".py", "/__init__.py"):
            candidate = module_path + candidate_ext
            if os.path.exists(os.path.join(root, candidate)):
                return candidate.replace("\\", "/")

    return imp  # return raw import if can't resolve


def extract_imports(filepath, root):
    """Extract imports from a source file."""
    rel_path = os.path.relpath(filepath, root).replace("\\", "/")
    ext = os.path.splitext(filepath)[1].lower()

    try:
        content = Path(filepath).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return rel_path, []

    imports = []

    if ext in (".ts", ".js", ".tsx", ".jsx"):
        for m in JS_IMPORT.finditer(content):
            imp = m.group(1)
            if is_local_import(imp, ext):
                resolved = resolve_import(imp, rel_path, root, ext)
                imports.append(resolved)

    elif ext == ".py":
        for m in PY_IMPORT.finditer(content):
            imp = m.group(1) or m.group(2)
            if is_local_import(imp, ext):
                resolved = resolve_import(imp, rel_path, root, ext)
                imports.append(resolved)

    elif ext in (".java", ".kt"):
        for m in JAVA_IMPORT.finditer(content):
            imp = m.group(1)
            if is_local_import(imp, ext):
                imports.append(imp)

    elif ext == ".go":
        for m in GO_IMPORT.finditer(content):
            imp = m.group(1)
            if is_local_import(imp, ext):
                imports.append(imp)

    return rel_path, imports


def guess_module(filepath):
    """Guess module name from first meaningful directory."""
    parts = Path(filepath).parts
    skip = {"src", "app", "lib", "main", "java", "kotlin", "python", "go", "pkg", "internal", "cmd"}
    for p in parts[:-1]:  # exclude filename
        if p.lower() not in skip and not p.startswith("."):
            return p.lower()
    return os.path.splitext(os.path.basename(filepath))[0].lower()


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Dependency Graph Builder")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    # Collect all edges
    nodes_data = {}  # filepath -> {imports_count, imported_by_count, module}
    edges = []
    imported_by = defaultdict(set)

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in CODE_EXTENSIONS:
                continue
            fpath = os.path.join(dirpath, fname)
            rel_path, imports = extract_imports(fpath, root)

            if rel_path not in nodes_data:
                nodes_data[rel_path] = {
                    "imports_count": 0,
                    "imported_by_count": 0,
                    "module": guess_module(rel_path),
                }

            nodes_data[rel_path]["imports_count"] = len(imports)

            for imp in imports:
                edges.append({"from": rel_path, "to": imp, "type": "import"})
                imported_by[imp].add(rel_path)

    # Update imported_by counts
    for target, sources in imported_by.items():
        if target in nodes_data:
            nodes_data[target]["imported_by_count"] = len(sources)

    # Identify high coupling nodes (imported by >= 10 files)
    HIGH_COUPLING_THRESHOLD = 10
    high_coupling_nodes = [
        fp for fp, data in nodes_data.items()
        if data["imported_by_count"] >= HIGH_COUPLING_THRESHOLD
    ]

    # Build nodes list
    nodes = []
    for fp, data in nodes_data.items():
        ext = os.path.splitext(fp)[1]
        ftype = "unknown"
        name_lower = os.path.basename(fp).lower()
        if "route" in name_lower or "controller" in name_lower:
            ftype = "controller"
        elif "service" in name_lower:
            ftype = "service"
        elif "model" in name_lower or "entity" in name_lower:
            ftype = "model"
        elif "middleware" in name_lower:
            ftype = "middleware"
        elif "util" in name_lower or "helper" in name_lower:
            ftype = "utility"
        elif "test" in name_lower or "spec" in name_lower:
            ftype = "test"
        elif "config" in name_lower:
            ftype = "config"

        nodes.append({
            "id": fp,
            "module": data["module"],
            "type": ftype,
            "imports_count": data["imports_count"],
            "imported_by_count": data["imported_by_count"],
            "is_high_coupling": fp in high_coupling_nodes,
        })

    # Module summary
    module_edges = defaultdict(lambda: {"internal": 0, "external": 0, "files": 0})
    for node in nodes:
        mod = node["module"]
        module_edges[mod]["files"] += 1

    for edge in edges:
        from_mod = nodes_data.get(edge["from"], {}).get("module", "")
        to_mod = nodes_data.get(edge["to"], {}).get("module", "")
        if from_mod and to_mod:
            if from_mod == to_mod:
                module_edges[from_mod]["internal"] += 1
            else:
                module_edges[from_mod]["external"] += 1

    module_summary = []
    for mod, data in module_edges.items():
        total = data["internal"] + data["external"]
        coupling = round(data["external"] / total, 2) if total > 0 else 0
        module_summary.append({
            "module": mod,
            "files": data["files"],
            "internal_edges": data["internal"],
            "external_edges": data["external"],
            "coupling_score": coupling,
        })
    module_summary.sort(key=lambda m: -m["coupling_score"])

    graph = {
        "nodes": nodes,
        "edges": edges[:5000],  # cap edges to avoid huge files
        "high_coupling_nodes": high_coupling_nodes,
        "module_summary": module_summary,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "scan_timestamp": now_iso(),
    }

    out_path = os.path.join(evidence_dir, "dependency-graph.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "ok",
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "high_coupling_nodes": len(high_coupling_nodes),
        "modules": len(module_summary),
        "output": out_path,
    }, indent=2))


if __name__ == "__main__":
    main()
