#!/usr/bin/env python3
"""
run_golden.py — Mechanism 6: 黄金集回归 runner

对 {skill-root}/golden/ 下每个 fixture：
1. 运行 extract_api_inventory.py / extract_data_models.py
2. 与 expected/*.expected.json 做子集匹配
3. 任何 expected 条目不在实际抽取中 → 失败

用法:
    python run_golden.py [golden_dir]

默认 golden_dir = 脚本所在目录的兄弟目录 ../golden
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_GOLDEN = SCRIPT_DIR.parent / "golden"


def run_extractor(script_name, project_root, output_dir):
    cmd = ["python3", str(SCRIPT_DIR / script_name), str(project_root),
           "--output-dir", str(output_dir)]
    return subprocess.run(cmd, capture_output=True, text=True)


def load_actual_inventory(project_root, output_dir, filename):
    p = Path(project_root) / output_dir / "evidence" / filename
    if not p.exists():
        return None
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def check_endpoints(expected, actual):
    """Subset match: every expected endpoint+method must be in actual.apis."""
    actual_set = {(a.get("endpoint"), a.get("method")) for a in actual.get("apis", [])}
    missing = []
    for exp in expected.get("expected_endpoints", []):
        key = (exp.get("endpoint"), exp.get("method"))
        if key not in actual_set:
            missing.append(exp)
    return missing


def check_models(expected, actual):
    # Tolerate both "model_name" and "name" key conventions on the actual side.
    actual_set = {
        (m.get("model_name") or m.get("name"), m.get("table_name"), m.get("orm"))
        for m in actual.get("models", [])
    }
    missing = []
    for exp in expected.get("expected_models", []):
        key = (exp.get("model_name") or exp.get("name"),
               exp.get("table_name"), exp.get("orm"))
        if key not in actual_set:
            missing.append(exp)
    return missing


def run_fixture(fixture_dir):
    name = fixture_dir.name
    expected_dir = fixture_dir / "expected"
    if not expected_dir.is_dir():
        return {"fixture": name, "status": "skip", "reason": "no expected/"}

    # Run extractors against the fixture as project_root, with isolated output dir
    out_dir = "_golden_out"
    out_path = fixture_dir / out_dir
    if out_path.exists():
        shutil.rmtree(out_path)

    results = {"fixture": name, "checks": []}

    # API inventory check
    api_expected = expected_dir / "api-inventory.expected.json"
    if api_expected.exists():
        run_extractor("extract_api_inventory.py", fixture_dir, out_dir)
        actual = load_actual_inventory(fixture_dir, out_dir, "api-inventory.json")
        if actual is None:
            results["checks"].append({"kind": "api", "status": "fail", "reason": "no actual inventory produced"})
        else:
            with open(api_expected, "r", encoding="utf-8") as f:
                exp = json.load(f)
            missing = check_endpoints(exp, actual)
            results["checks"].append({
                "kind": "api",
                "status": "pass" if not missing else "fail",
                "missing": missing,
                "associated_kfp": exp.get("associated_kfp"),
            })

    # Data model inventory check
    dm_expected = expected_dir / "data-model-inventory.expected.json"
    if dm_expected.exists():
        run_extractor("extract_data_models.py", fixture_dir, out_dir)
        actual = load_actual_inventory(fixture_dir, out_dir, "data-model-inventory.json")
        if actual is None:
            results["checks"].append({"kind": "model", "status": "fail", "reason": "no actual inventory produced"})
        else:
            with open(dm_expected, "r", encoding="utf-8") as f:
                exp = json.load(f)
            missing = check_models(exp, actual)
            results["checks"].append({
                "kind": "model",
                "status": "pass" if not missing else "fail",
                "missing": missing,
                "associated_kfp": exp.get("associated_kfp"),
            })

    # Cleanup output dir
    if out_path.exists():
        shutil.rmtree(out_path)

    results["status"] = "pass" if all(c["status"] == "pass" for c in results["checks"]) else "fail"
    return results


def main():
    golden = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_GOLDEN
    if not golden.is_dir():
        print(f"Error: golden dir not found: {golden}", file=sys.stderr)
        sys.exit(2)

    fixtures = [p for p in sorted(golden.iterdir()) if p.is_dir() and (p / "expected").is_dir()]
    if not fixtures:
        print(json.dumps({"status": "skip", "reason": "no fixtures found"}, indent=2))
        sys.exit(0)

    all_results = [run_fixture(f) for f in fixtures]
    overall = "pass" if all(r["status"] == "pass" for r in all_results) else "fail"
    print(json.dumps({
        "status": overall,
        "fixture_count": len(all_results),
        "results": all_results,
    }, indent=2, ensure_ascii=False))
    sys.exit(0 if overall == "pass" else 1)


if __name__ == "__main__":
    main()
