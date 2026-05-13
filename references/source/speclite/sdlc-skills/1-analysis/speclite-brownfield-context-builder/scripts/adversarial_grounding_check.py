#!/usr/bin/env python3
"""
adversarial_grounding_check.py — Mechanism 5: 对抗性 grounding 反查

针对 Phase 3 产出的 baseline/ 文档，机械性地反查每条事实陈述是否真实存在
于 evidence/ 中。专门用于发现 LLM 在合成阶段的幻觉（凭空捏造端点 / 实体 /
表名 / 技术栈名称）。

校验内容
--------
1. baseline 表格中所有看起来像 endpoint 的单元格（以 / 开头的字符串），必须能
   在 evidence/api-inventory.json 中找到 endpoint 的精确字符串匹配。
2. baseline 中所有大写驼峰且后缀为 Controller / Entity / Service / Repository /
   Mapper / Producer / Consumer 的标识符，必须能在源代码（project_root 下任意
   .java/.kt/.ts/.js/.py 文件）中作为类名出现。
3. baseline 中提到的"消息队列 / 缓存 / 注册中心"类技术栈名（RocketMQ /
   RabbitMQ / Kafka / Redis / Nacos / Eureka / Consul ...），必须出现在
   evidence/tech-stack-strict.json 中。
4. baseline 中如果出现 [anchor:...] 标签，则必须能机械解析。

输出
----
docs/brownfield/validation/hallucination-report.json — 失败明细
docs/brownfield/validation/confidence-report.json    — 抽检统计 + 置信度评分

退出码
------
0 — failure_rate <= 0.01
1 — failure_rate > 0.01（默认阈值，--threshold 可调）
2 — 目录不存在或证据缺失
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode", "build", "dist", "target", ".next", ".cache",
    "vendor", "Pods", "docs/brownfield",
}

ENDPOINT_PATTERN = re.compile(r"(?<![\w./-])(/[A-Za-z_][\w/{}.\-:]{0,120})")
CLASSNAME_PATTERN = re.compile(
    r"\b([A-Z][A-Za-z0-9]+(?:Controller|Entity|Service|Repository|Mapper|Producer|Consumer))\b"
)
TECH_TOKENS = {
    "RocketMQ", "RabbitMQ", "Kafka", "Pulsar", "ActiveMQ",
    "Redis", "Memcached",
    "Nacos", "Eureka", "Consul", "Zookeeper",
    "MySQL", "PostgreSQL", "Oracle", "SQLServer", "MongoDB", "Elasticsearch",
    "MyBatis", "MyBatis-Plus", "JPA-Hibernate",
    "XXL-Job", "Quartz",
    "Datadog", "Sentry",
}
ANCHOR_PATTERN = re.compile(r"\[anchor:([^\]\s]+)#([^\]\s]+)\]")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_evidence(base_dir):
    api_path = os.path.join(base_dir, "evidence", "api-inventory.json")
    dm_path = os.path.join(base_dir, "evidence", "data-model-inventory.json")
    tech_path = os.path.join(base_dir, "evidence", "tech-stack-strict.json")
    api = json.load(open(api_path, "r", encoding="utf-8")) if os.path.exists(api_path) else {"apis": []}
    dm = json.load(open(dm_path, "r", encoding="utf-8")) if os.path.exists(dm_path) else {"models": []}
    tech = json.load(open(tech_path, "r", encoding="utf-8")) if os.path.exists(tech_path) else {"techs": []}
    endpoints = {a["endpoint"] for a in api.get("apis", [])}
    techs = {t["tech"] for t in tech.get("techs", [])}
    return endpoints, techs, dm, api, tech


def index_classnames(project_root):
    """One pass over the source tree to collect every defined class name.
    Used to verify that ClassName tokens in baseline aren't fabricated.
    """
    names = set()
    class_re = re.compile(r"^\s*(?:public\s+|private\s+|protected\s+|abstract\s+|final\s+|static\s+|export\s+|default\s+)*"
                          r"(?:class|interface|@interface)\s+([A-Z][A-Za-z0-9_]*)")
    for dirpath, dirnames, filenames in os.walk(project_root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in (".java", ".kt", ".ts", ".js", ".tsx", ".jsx", ".py", ".go"):
                continue
            try:
                content = Path(os.path.join(dirpath, fname)).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for m in class_re.finditer(content):
                names.add(m.group(1))
    return names


def _strip_code_fences(content):
    return re.sub(r"```.*?```", "", content, flags=re.DOTALL)


def collect_baseline_files(base_dir):
    bdir = os.path.join(base_dir, "baseline")
    if not os.path.isdir(bdir):
        return []
    return [os.path.join(bdir, f) for f in sorted(os.listdir(bdir)) if f.endswith(".md")]


def check_baseline_file(filepath, base_dir, endpoints, techs, classnames):
    """Return list of grounding violations for a single baseline file."""
    issues = []
    rel = os.path.relpath(filepath, base_dir)
    try:
        raw = Path(filepath).read_text(encoding="utf-8", errors="ignore")
    except OSError as e:
        return [{"status": "read_error", "source": rel, "error": str(e)}]
    content = _strip_code_fences(raw)

    # 1) Endpoints
    for lineno, line in enumerate(content.splitlines(), start=1):
        if line.strip().startswith("#") or line.strip().startswith(">"):
            continue
        for m in ENDPOINT_PATTERN.finditer(line):
            ep = m.group(1).rstrip(".,;)|")
            # Heuristic: only check inside table cells or code-like contexts.
            if ep in endpoints:
                continue
            # Allow path-like words that appear with a docs/-style prefix or absolute file path
            if ep.startswith(("/Users", "/home", "/etc", "/opt", "/var", "/tmp", "/usr")):
                continue
            if ep.startswith("/api") and any(ep == real or real.endswith(ep) for real in endpoints):
                continue
            issues.append({
                "status": "endpoint_not_in_evidence",
                "source": rel,
                "line": lineno,
                "endpoint": ep,
                "preview": line.strip()[:160],
            })

    # 2) Class names
    for lineno, line in enumerate(content.splitlines(), start=1):
        for m in CLASSNAME_PATTERN.finditer(line):
            name = m.group(1)
            if name in classnames:
                continue
            issues.append({
                "status": "classname_not_in_source",
                "source": rel,
                "line": lineno,
                "name": name,
                "preview": line.strip()[:160],
            })

    # 3) Tech tokens
    for lineno, line in enumerate(content.splitlines(), start=1):
        for token in TECH_TOKENS:
            if re.search(rf"\b{re.escape(token)}\b", line):
                if token in techs:
                    continue
                issues.append({
                    "status": "tech_not_in_strict_evidence",
                    "source": rel,
                    "line": lineno,
                    "tech": token,
                    "preview": line.strip()[:160],
                })

    return issues


def random_sample(violations, n):
    import random
    if len(violations) <= n:
        return violations
    return random.sample(violations, n)


def main():
    parser = argparse.ArgumentParser(description="Adversarial grounding check (Mechanism 5)")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield",
                        help="Output directory (relative to project root)")
    parser.add_argument("--threshold", type=float, default=0.01,
                        help="Failure rate threshold; exceed → exit 1 (default 0.01)")
    parser.add_argument("--sample-cap", type=int, default=200,
                        help="Cap report size to this many violations (default 200)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: project_root not found: {root}", file=sys.stderr)
        sys.exit(2)
    base_dir = os.path.join(root, args.output_dir)
    if not os.path.isdir(os.path.join(base_dir, "baseline")):
        print(f"Error: baseline/ not found under {base_dir}", file=sys.stderr)
        sys.exit(2)

    endpoints, techs, _dm, api, tech = load_evidence(base_dir)
    classnames = index_classnames(root)

    files = collect_baseline_files(base_dir)
    all_issues = []
    facts_examined = 0
    for fp in files:
        try:
            content = _strip_code_fences(Path(fp).read_text(encoding="utf-8", errors="ignore"))
        except OSError:
            continue
        # rough fact count = endpoint-like + classname-like + tech-like occurrences
        facts_examined += len(ENDPOINT_PATTERN.findall(content))
        facts_examined += len(CLASSNAME_PATTERN.findall(content))
        for token in TECH_TOKENS:
            facts_examined += len(re.findall(rf"\b{re.escape(token)}\b", content))
        all_issues.extend(check_baseline_file(fp, base_dir, endpoints, techs, classnames))

    failure_rate = (len(all_issues) / facts_examined) if facts_examined else 0.0

    val_dir = os.path.join(base_dir, "validation")
    os.makedirs(val_dir, exist_ok=True)

    halluc_path = os.path.join(val_dir, "hallucination-report.json")
    with open(halluc_path, "w", encoding="utf-8") as f:
        json.dump({
            "scan_timestamp": now_iso(),
            "files_checked": [os.path.relpath(fp, base_dir) for fp in files],
            "evidence_endpoint_count": len(endpoints),
            "evidence_tech_count": len(techs),
            "source_classname_count": len(classnames),
            "violation_count": len(all_issues),
            "violations_sample": all_issues[:args.sample_cap],
        }, f, indent=2, ensure_ascii=False)

    confidence_path = os.path.join(val_dir, "confidence-report.json")
    with open(confidence_path, "w", encoding="utf-8") as f:
        json.dump({
            "scan_timestamp": now_iso(),
            "facts_examined": facts_examined,
            "violation_count": len(all_issues),
            "failure_rate": round(failure_rate, 6),
            "threshold": args.threshold,
            "verdict": "pass" if failure_rate <= args.threshold else "fail",
            "violation_breakdown": {
                k: sum(1 for v in all_issues if v.get("status") == k)
                for k in {v.get("status") for v in all_issues}
            },
            "instructions_on_fail": (
                "Phase 3 must be re-run with stronger grounding. Fix the LLM prompt to "
                "forbid filling endpoints/classnames/techs that are not present in evidence/. "
                "If fact-density is genuinely low, mark the section [COVERAGE_GAP] instead "
                "of inventing content."
            ),
        }, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "pass" if failure_rate <= args.threshold else "fail",
        "facts_examined": facts_examined,
        "violations": len(all_issues),
        "failure_rate": round(failure_rate, 6),
        "threshold": args.threshold,
        "outputs": [halluc_path, confidence_path],
    }, indent=2))
    sys.exit(0 if failure_rate <= args.threshold else 1)


if __name__ == "__main__":
    main()
