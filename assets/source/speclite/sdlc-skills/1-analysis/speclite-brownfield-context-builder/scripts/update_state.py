#!/usr/bin/env python3
"""
update_state.py — Brownfield Context Builder 状态文件管理

管理 project-scan-report.json 的创建、更新和读取。

用法:
    python update_state.py init --project-root /path/to/project [--output-dir docs/brownfield] [--mode initial_scan] [--scan-level deep] [--history-sources docs/history/]
    python update_state.py update --phase phase_2_evidence [--step phase_2_extract_api] [--output evidence/api-inventory.json] [--evidence-status api-inventory=done] [--baseline-status system-overview=done] [--planning-status prd=done] [--resume "Continue from phase_2"]
    python update_state.py get [--field phase]

退出码:
    0 — 成功
    1 — 参数错误
    2 — 状态文件不存在（get/update 时）
    3 — 写入失败
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone


WORKFLOW_VERSION = "1.0.0"
STATE_FILENAME = "project-scan-report.json"

VALID_MODES = ["initial_scan", "full_rescan", "targeted_deep_dive", "planning_generation"]
VALID_PHASES = [
    "phase_0_routing", "phase_1_classification", "phase_2_evidence",
    "phase_3_baseline", "phase_4_deep_dive", "phase_5_planning", "completed"
]
VALID_SCAN_LEVELS = ["quick", "deep", "exhaustive"]
VALID_STATUS_VALUES = ["done", "pending", "in_progress", "skipped", "error"]

EVIDENCE_KEYS = [
    "repo-manifest", "tech-stack-inventory", "entry-points",
    "config-surface", "dependency-graph", "integration-surface", "test-surface",
    "api-inventory", "api-contract-candidates",
    "data-model-inventory", "schema-migration-index",
    "existing-doc-inventory", "historical-docs-index",
    "business-fact-candidates", "fact-conflicts"
]

BASELINE_KEYS = [
    "index", "system-overview", "source-tree-analysis",
    "as-is-architecture", "domain-model", "business-capability-matrix",
    "integration-map", "development-guide", "change-risk-map",
    "reuse-opportunities", "constraints-and-invariants",
    "api-contracts", "api-governance", "data-models"
]

PLANNING_KEYS = [
    "brownfield-planning-brief", "feature-entry-points",
    "candidate-change-slices", "prd", "architecture", "epics", "stories"
]


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def state_path(project_root, output_dir):
    return os.path.join(project_root, output_dir, STATE_FILENAME)


def create_initial_state(project_root, output_dir, mode, scan_level, history_sources):
    return {
        "workflow_version": WORKFLOW_VERSION,
        "mode": mode,
        "phase": "phase_0_routing",
        "scan_level": scan_level,
        "project_root": os.path.abspath(project_root),
        "output_dir": output_dir,
        "history_sources": history_sources,
        "project_parts": [],
        "completed_steps": [],
        "outputs_generated": [],
        "evidence_status": {k: "pending" for k in EVIDENCE_KEYS},
        "baseline_status": {k: "pending" for k in BASELINE_KEYS},
        "deep_dive_targets": [],
        "deep_dive_status": {},
        "planning_status": {k: "pending" for k in PLANNING_KEYS},
        "fact_conflicts_pending": 0,
        "resume_instructions": f"Start {mode} from phase_0_routing",
        "created_at": now_iso(),
        "updated_at": now_iso()
    }


def load_state(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(filepath, state):
    state["updated_at"] = now_iso()
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    tmp = filepath + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp, filepath)


def parse_kv(kv_str):
    """Parse 'key=value' string."""
    if "=" not in kv_str:
        print(f"Error: invalid key=value format: {kv_str}", file=sys.stderr)
        sys.exit(1)
    k, v = kv_str.split("=", 1)
    return k.strip(), v.strip()


def cmd_init(args):
    if args.mode not in VALID_MODES:
        print(f"Error: invalid mode '{args.mode}', must be one of {VALID_MODES}", file=sys.stderr)
        sys.exit(1)
    if args.scan_level not in VALID_SCAN_LEVELS:
        print(f"Error: invalid scan_level '{args.scan_level}', must be one of {VALID_SCAN_LEVELS}", file=sys.stderr)
        sys.exit(1)
    if not os.path.isdir(args.project_root):
        print(f"Error: project_root does not exist: {args.project_root}", file=sys.stderr)
        sys.exit(1)

    filepath = state_path(args.project_root, args.output_dir)
    history = [s.strip() for s in args.history_sources.split(",") if s.strip()] if args.history_sources else []

    existing = load_state(filepath)
    if existing and not args.force:
        print(f"State file already exists: {filepath}")
        print(f"  mode={existing['mode']}, phase={existing['phase']}")
        print("Use --force to overwrite.")
        sys.exit(0)

    state = create_initial_state(args.project_root, args.output_dir, args.mode, args.scan_level, history)
    save_state(filepath, state)
    print(json.dumps({"status": "ok", "action": "init", "file": filepath}, indent=2))


def cmd_update(args):
    filepath = state_path(args.project_root, args.output_dir)
    state = load_state(filepath)
    if state is None:
        print(f"Error: state file not found: {filepath}", file=sys.stderr)
        sys.exit(2)

    if args.phase:
        if args.phase not in VALID_PHASES:
            print(f"Error: invalid phase '{args.phase}', must be one of {VALID_PHASES}", file=sys.stderr)
            sys.exit(1)
        state["phase"] = args.phase

    if args.mode:
        if args.mode not in VALID_MODES:
            print(f"Error: invalid mode '{args.mode}'", file=sys.stderr)
            sys.exit(1)
        state["mode"] = args.mode

    if args.step:
        state["completed_steps"].append({"step": args.step, "timestamp": now_iso()})

    if args.output:
        for o in args.output:
            if o not in state["outputs_generated"]:
                state["outputs_generated"].append(o)

    if args.evidence_status:
        for kv in args.evidence_status:
            k, v = parse_kv(kv)
            if v not in VALID_STATUS_VALUES:
                print(f"Error: invalid status '{v}' for evidence key '{k}'", file=sys.stderr)
                sys.exit(1)
            state["evidence_status"][k] = v

    if args.baseline_status:
        for kv in args.baseline_status:
            k, v = parse_kv(kv)
            if v not in VALID_STATUS_VALUES:
                print(f"Error: invalid status '{v}' for baseline key '{k}'", file=sys.stderr)
                sys.exit(1)
            state["baseline_status"][k] = v

    if args.planning_status:
        for kv in args.planning_status:
            k, v = parse_kv(kv)
            if v not in VALID_STATUS_VALUES:
                print(f"Error: invalid status '{v}' for planning key '{k}'", file=sys.stderr)
                sys.exit(1)
            state["planning_status"][k] = v

    if args.parts_json:
        state["project_parts"] = json.loads(args.parts_json)

    if args.deep_dive_target:
        for t in args.deep_dive_target:
            if t not in state["deep_dive_targets"]:
                state["deep_dive_targets"].append(t)
            state["deep_dive_status"][t] = "pending"

    if args.deep_dive_status:
        for kv in args.deep_dive_status:
            k, v = parse_kv(kv)
            state["deep_dive_status"][k] = v

    if args.fact_conflicts_pending is not None:
        state["fact_conflicts_pending"] = args.fact_conflicts_pending

    if args.resume:
        state["resume_instructions"] = args.resume

    save_state(filepath, state)
    print(json.dumps({"status": "ok", "action": "update", "phase": state["phase"]}, indent=2))


def cmd_get(args):
    filepath = state_path(args.project_root, args.output_dir)
    state = load_state(filepath)
    if state is None:
        print(f"Error: state file not found: {filepath}", file=sys.stderr)
        sys.exit(2)

    if args.field:
        value = state.get(args.field)
        if value is None:
            print(f"Error: field '{args.field}' not found in state", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(value, indent=2, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value))
    else:
        print(json.dumps(state, indent=2, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — State Manager")
    parser.add_argument("--project-root", default=".", help="Project root directory (default: .)")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory relative to project root (default: docs/brownfield)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = subparsers.add_parser("init", help="Initialize state file")
    p_init.add_argument("--mode", default="initial_scan", help="Run mode")
    p_init.add_argument("--scan-level", default="deep", help="Scan level: quick/deep/exhaustive")
    p_init.add_argument("--history-sources", default="", help="Comma-separated history doc paths")
    p_init.add_argument("--force", action="store_true", help="Overwrite existing state file")

    # update
    p_update = subparsers.add_parser("update", help="Update state file")
    p_update.add_argument("--phase", help="Set current phase")
    p_update.add_argument("--mode", help="Set current mode")
    p_update.add_argument("--step", help="Record a completed step")
    p_update.add_argument("--output", action="append", help="Record a generated output file (repeatable)")
    p_update.add_argument("--evidence-status", action="append", help="Set evidence status: key=value (repeatable)")
    p_update.add_argument("--baseline-status", action="append", help="Set baseline status: key=value (repeatable)")
    p_update.add_argument("--planning-status", action="append", help="Set planning status: key=value (repeatable)")
    p_update.add_argument("--parts-json", help="Set project_parts as JSON string")
    p_update.add_argument("--deep-dive-target", action="append", help="Add deep-dive target (repeatable)")
    p_update.add_argument("--deep-dive-status", action="append", help="Set deep-dive status: area=value (repeatable)")
    p_update.add_argument("--fact-conflicts-pending", type=int, help="Set pending conflict count")
    p_update.add_argument("--resume", help="Set resume instructions")

    # get
    p_get = subparsers.add_parser("get", help="Read state file")
    p_get.add_argument("--field", help="Get specific field value")

    args = parser.parse_args()

    if args.command == "init":
        cmd_init(args)
    elif args.command == "update":
        cmd_update(args)
    elif args.command == "get":
        cmd_get(args)


if __name__ == "__main__":
    main()
