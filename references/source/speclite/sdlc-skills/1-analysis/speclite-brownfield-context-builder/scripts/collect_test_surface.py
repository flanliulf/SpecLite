#!/usr/bin/env python3
"""
collect_test_surface.py — 测试面收集

识别项目中的测试文件、测试类型、覆盖率配置和关键模块测试覆盖。

用法:
    python collect_test_surface.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/test-surface.json

退出码:
    0 — 成功
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
    ".idea", ".vscode", "build", "dist", "target", ".next", ".cache", "vendor"
}

TEST_FILE_PATTERNS = [
    re.compile(r".*\.test\.\w+$"),
    re.compile(r".*\.spec\.\w+$"),
    re.compile(r".*_test\.\w+$"),
    re.compile(r"test_.*\.py$"),
    re.compile(r".*Test\.java$"),
    re.compile(r".*Test\.kt$"),
    re.compile(r".*_test\.go$"),
]

TEST_DIR_NAMES = {"test", "tests", "__tests__", "spec", "specs", "e2e", "integration", "unit"}

COVERAGE_CONFIG_FILES = {
    "jest.config.js", "jest.config.ts", "jest.config.json",
    ".nycrc", ".nycrc.json", "nyc.config.js",
    ".coveragerc", "coverage.config", "pytest.ini", "setup.cfg",
    "codecov.yml", ".codecov.yml",
    "karma.conf.js", "vitest.config.ts", "vitest.config.js",
    "jacoco.gradle", "jacoco.xml",
}


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_test_file(filepath):
    name = os.path.basename(filepath)
    return any(p.match(name) for p in TEST_FILE_PATTERNS)


def classify_test_type(filepath):
    """Classify test as unit, integration, or e2e."""
    path_lower = filepath.lower()
    if "e2e" in path_lower or "end-to-end" in path_lower or "cypress" in path_lower or "playwright" in path_lower:
        return "e2e"
    if "integration" in path_lower or "integ" in path_lower:
        return "integration"
    return "unit"


def guess_module_under_test(test_path):
    """Guess which module/file a test covers."""
    name = os.path.basename(test_path)
    # Remove test suffixes
    cleaned = re.sub(r"\.test\.|\.spec\.|_test\.|Test\.", ".", name)
    cleaned = re.sub(r"^test_", "", cleaned)
    return os.path.splitext(cleaned)[0]


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Test Surface Collector")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    test_files = []
    type_counts = defaultdict(int)
    module_coverage = defaultdict(list)
    coverage_configs = []
    test_dirs_found = set()

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        rel_dir = os.path.relpath(dirpath, root).replace("\\", "/")

        # Track test directories
        dir_name = os.path.basename(dirpath).lower()
        if dir_name in TEST_DIR_NAMES:
            test_dirs_found.add(rel_dir)

        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, root).replace("\\", "/")

            # Coverage config files
            if fname in COVERAGE_CONFIG_FILES:
                coverage_configs.append(rel_path)
                continue

            # Test files
            if is_test_file(fpath) or dir_name in TEST_DIR_NAMES:
                ext = os.path.splitext(fname)[1].lower()
                if ext not in (".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".kt", ".go", ".rb"):
                    continue

                test_type = classify_test_type(rel_path)
                module = guess_module_under_test(rel_path)
                type_counts[test_type] += 1
                module_coverage[module].append(rel_path)

                test_files.append({
                    "path": rel_path,
                    "type": test_type,
                    "module_under_test": module,
                })

    result = {
        "test_files": test_files[:500],  # cap
        "test_dirs": sorted(test_dirs_found),
        "coverage_configs": coverage_configs,
        "type_summary": dict(type_counts),
        "module_coverage": {k: v for k, v in sorted(module_coverage.items()) if len(v) <= 50},
        "summary": {
            "total_test_files": len(test_files),
            "total_test_dirs": len(test_dirs_found),
            "unit": type_counts.get("unit", 0),
            "integration": type_counts.get("integration", 0),
            "e2e": type_counts.get("e2e", 0),
            "has_coverage_config": len(coverage_configs) > 0,
        },
        "scan_timestamp": now_iso(),
    }

    out_path = os.path.join(evidence_dir, "test-surface.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "ok",
        "total_test_files": len(test_files),
        "types": dict(type_counts),
        "output": out_path,
    }, indent=2))


if __name__ == "__main__":
    main()
