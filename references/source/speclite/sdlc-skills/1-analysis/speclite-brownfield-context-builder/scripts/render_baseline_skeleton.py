#!/usr/bin/env python3
"""
render_baseline_skeleton.py — Mechanism 3: 骨架渲染器

从 evidence/ 机械性地渲染 baseline/*.md 的"事实骨架"。
LLM 只能在 <!-- DESC: ... --> 占位符中填写描述性文字，
不能新增/删除/修改表格中的端点、实体、技术名（这些都来自 evidence）。

用法:
    python render_baseline_skeleton.py <project_root> [--output-dir docs/brownfield]

输出（覆盖写入 baseline/_skeleton/ 子目录，避免误覆盖人工产物）:
    baseline/_skeleton/api-contracts.md
    baseline/_skeleton/business-capability-matrix.md
    baseline/_skeleton/system-overview.md
    baseline/_skeleton/as-is-architecture.md

退出码:
    0 — 成功
    2 — 证据缺失
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return default


def render_api_contracts(api_inv, out_path):
    apis = api_inv.get("apis", [])
    by_file = defaultdict(list)
    for idx, a in enumerate(apis):
        by_file[a.get("handler_file", "unknown")].append((idx, a))

    lines = [
        "# API 契约（骨架，禁止 LLM 增删行）",
        "",
        f"> 自动生成于 {now_iso()}；共 {len(apis)} 个端点；按 handler_file 分组。",
        "> **行规则**：表格行严格来自 `evidence/api-inventory.json`；",
        "> LLM 只能在 `<!-- DESC: ... -->` 占位符中补描述。",
        "",
    ]
    for fp in sorted(by_file.keys()):
        rows = by_file[fp]
        lines.append(f"## `{fp}`")
        lines.append("")
        if not rows:
            lines.append("> ⚠️ 该文件无端点（覆盖率盲区，参考 api-inventory.gaps.json）")
            lines.append("")
            continue
        if len(rows) <= 2:
            lines.append("> ⚠️ 证据稀疏：本 Controller 仅识别 {} 个端点，可能存在抽取盲区".format(len(rows)))
            lines.append("")
        lines.append("| Endpoint | Method | Auth | Anchor | 描述 |")
        lines.append("|:---------|:-------|:-----|:-------|:-----|")
        for idx, a in rows:
            ep = a.get("endpoint", "")
            method = a.get("method", "")
            auth = "auth" if a.get("auth_required") else "—"
            anchor = f"[anchor:evidence/api-inventory.json#/apis/{idx}]"
            lines.append(f"| `{ep}` | {method} | {auth} | {anchor} | <!-- DESC:{ep}:{method} --> |")
        lines.append("")

    Path(out_path).write_text("\n".join(lines), encoding="utf-8")


def render_business_capability_matrix(api_inv, out_path):
    apis = api_inv.get("apis", [])
    by_module = defaultdict(list)
    for idx, a in enumerate(apis):
        by_module[a.get("module", "unknown")].append((idx, a))

    lines = [
        "# 业务能力矩阵（骨架）",
        "",
        f"> 自动生成于 {now_iso()}。模块来源：`evidence/api-inventory.json#/apis[*].module`。",
        "",
        "| 模块 | 端点数 | 代表端点 | 描述（待补） |",
        "|:-----|:------:|:---------|:-------------|",
    ]
    for mod in sorted(by_module.keys()):
        rows = by_module[mod]
        first_idx, first_api = rows[0]
        sample_anchor = f"[anchor:evidence/api-inventory.json#/apis/{first_idx}]"
        lines.append(
            f"| {mod} | {len(rows)} | `{first_api.get('method','')} {first_api.get('endpoint','')}` {sample_anchor} | <!-- DESC:module:{mod} --> |"
        )
    lines.append("")
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")


def render_system_overview(api_inv, dm_inv, tech_strict, out_path):
    apis = api_inv.get("apis", [])
    models = dm_inv.get("models", [])
    techs = tech_strict.get("techs", [])

    lines = [
        "# 系统总览（骨架）",
        "",
        f"> 自动生成于 {now_iso()}。所有数字与技术名来自 evidence/，不可改写。",
        "",
        "## 1. 规模指标",
        "",
        f"- API 端点总数：**{len(apis)}** [anchor:evidence/api-inventory.json#/total_count]",
        f"- 数据实体总数：**{len(models)}** [anchor:evidence/data-model-inventory.json#/total_count]",
        f"- 严格识别技术栈数：**{len(techs)}** [anchor:evidence/tech-stack-strict.json#/tech_count]",
        "",
        "## 2. 技术栈（严格白名单识别）",
        "",
        "| 技术 | 证据数 | Anchor |",
        "|:-----|:------:|:-------|",
    ]
    for i, t in enumerate(techs):
        lines.append(f"| {t['tech']} | {t.get('evidence_count', 0)} | [anchor:evidence/tech-stack-strict.json#/techs/{i}] |")
    lines.append("")
    lines.append("## 3. 业务说明（LLM 待补，禁止改动上方表格）")
    lines.append("")
    lines.append("<!-- DESC:system-overview-narrative -->")
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")


def render_as_is_architecture(api_inv, dm_inv, tech_strict, out_path):
    apis = api_inv.get("apis", [])
    by_module = defaultdict(int)
    for a in apis:
        by_module[a.get("module", "unknown")] += 1

    lines = [
        "# As-Is 架构（骨架）",
        "",
        f"> 自动生成于 {now_iso()}。模块拓扑、技术依赖均来自 evidence/。",
        "",
        "## 1. 模块拓扑（按端点密度）",
        "",
        "| 模块 | 端点数 |",
        "|:-----|:------:|",
    ]
    for mod, cnt in sorted(by_module.items(), key=lambda kv: (-kv[1], kv[0])):
        lines.append(f"| {mod} | {cnt} |")
    lines.append("")
    lines.append("## 2. 关键中间件依赖（来自 tech-stack-strict）")
    lines.append("")
    middleware_kinds = {"RocketMQ", "RabbitMQ", "Kafka", "Redis", "Nacos", "Eureka", "XXL-Job", "Quartz"}
    for i, t in enumerate(tech_strict.get("techs", [])):
        if t["tech"] in middleware_kinds:
            lines.append(f"- {t['tech']}（证据 {t.get('evidence_count', 0)} 条）[anchor:evidence/tech-stack-strict.json#/techs/{i}]")
    lines.append("")
    lines.append("## 3. 架构叙述（LLM 待补）")
    lines.append("")
    lines.append("<!-- DESC:architecture-narrative -->")
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Mechanism 3 — Baseline Skeleton Renderer")
    parser.add_argument("project_root")
    parser.add_argument("--output-dir", default="docs/brownfield")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    base_dir = os.path.join(root, args.output_dir)
    if not os.path.isdir(base_dir):
        print(f"Error: {base_dir} not found", file=sys.stderr)
        sys.exit(2)

    api_inv = load_json(os.path.join(base_dir, "evidence", "api-inventory.json"), {"apis": []})
    dm_inv = load_json(os.path.join(base_dir, "evidence", "data-model-inventory.json"), {"models": []})
    tech_strict = load_json(os.path.join(base_dir, "evidence", "tech-stack-strict.json"), {"techs": []})

    skel_dir = os.path.join(base_dir, "baseline", "_skeleton")
    os.makedirs(skel_dir, exist_ok=True)

    out_paths = {
        "api-contracts.md": os.path.join(skel_dir, "api-contracts.md"),
        "business-capability-matrix.md": os.path.join(skel_dir, "business-capability-matrix.md"),
        "system-overview.md": os.path.join(skel_dir, "system-overview.md"),
        "as-is-architecture.md": os.path.join(skel_dir, "as-is-architecture.md"),
    }

    render_api_contracts(api_inv, out_paths["api-contracts.md"])
    render_business_capability_matrix(api_inv, out_paths["business-capability-matrix.md"])
    render_system_overview(api_inv, dm_inv, tech_strict, out_paths["system-overview.md"])
    render_as_is_architecture(api_inv, dm_inv, tech_strict, out_paths["as-is-architecture.md"])

    print(json.dumps({
        "status": "ok",
        "skeletons_written": list(out_paths.keys()),
        "skeleton_dir": skel_dir,
        "apis": len(api_inv.get("apis", [])),
        "models": len(dm_inv.get("models", [])),
        "techs": len(tech_strict.get("techs", [])),
        "scan_timestamp": now_iso(),
    }, indent=2))


if __name__ == "__main__":
    main()
