#!/usr/bin/env python3
"""
extract_api_inventory.py — API 清单提取

扫描项目源码中的路由定义文件，提取已实现的 API 端点清单。
支持 Express/Koa/Fastify/NestJS/Flask/FastAPI/Django/Spring Boot 等常见框架。

用法:
    python extract_api_inventory.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/api-inventory.json

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
from datetime import datetime, timezone
from pathlib import Path


IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode", "build", "dist", "target", ".next", ".nuxt",
    ".cache", "vendor", "Pods"
}

# --- Pattern definitions per framework ---

# Express/Koa/Fastify: router.get('/path', handler) or app.post('/path', ...)
JS_ROUTE_PATTERN = re.compile(
    r"""(?:app|router|server)\s*\.\s*(get|post|put|patch|delete|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]""",
    re.IGNORECASE
)

# NestJS: @Get('/path'), @Post('/path'), etc.
NESTJS_DECORATOR_PATTERN = re.compile(
    r"""@(Get|Post|Put|Patch|Delete|Options|Head)\s*\(\s*['"`]?([^'"`\)]*?)['"`]?\s*\)""",
    re.IGNORECASE
)

# NestJS Controller: @Controller('/prefix')
NESTJS_CONTROLLER_PATTERN = re.compile(
    r"""@Controller\s*\(\s*['"`]([^'"`]*)['"`]\s*\)""",
    re.IGNORECASE
)

# Flask: @app.route('/path', methods=['GET'])
FLASK_ROUTE_PATTERN = re.compile(
    r"""@\w+\.route\s*\(\s*['"]([^'"]+)['"](?:\s*,\s*methods\s*=\s*\[([^\]]+)\])?""",
    re.IGNORECASE
)

# FastAPI: @app.get('/path'), @router.post('/path')
FASTAPI_PATTERN = re.compile(
    r"""@\w+\.\s*(get|post|put|patch|delete|options|head)\s*\(\s*['"]([^'"]+)['"]""",
    re.IGNORECASE
)

# Django urls: path('route/', view, name='name')
DJANGO_URL_PATTERN = re.compile(
    r"""path\s*\(\s*['"]([^'"]+)['"]""",
    re.IGNORECASE
)

# Spring Boot: @GetMapping("/path"), @PostMapping, @RequestMapping
SPRING_MAPPING_PATTERN = re.compile(
    r"""@(Get|Post|Put|Patch|Delete|Request)Mapping\s*\(\s*(?:value\s*=\s*)?['"]([^'"]+)['"]""",
    re.IGNORECASE
)

# Spring class declaration; we anchor class-level @RequestMapping detection on this.
SPRING_CLASS_PATTERN = re.compile(
    r"^\s*(?:public\s+|abstract\s+|final\s+)*class\s+\w+",
    re.MULTILINE
)
# Class-level @RequestMapping value/path; supports value= and path= forms.
SPRING_CLASS_MAPPING_PATTERN = re.compile(
    r"@RequestMapping\s*\(\s*(?:(?:value|path)\s*=\s*)?(?:\{\s*)?['\"]([^'\"]+)['\"]"
)

# Go net/http or Gin/Echo: r.GET("/path", handler)
GO_ROUTE_PATTERN = re.compile(
    r"""\.\s*(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|Handle|HandleFunc)\s*\(\s*['"]([^'"]+)['"]""",
    re.IGNORECASE
)


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def should_scan(filepath):
    """Determine if file likely contains route definitions."""
    name = os.path.basename(filepath).lower()
    parts = Path(filepath).parts
    if any(p in IGNORE_DIRS for p in parts):
        return False
    route_indicators = ("route", "router", "controller", "endpoint", "api", "urls", "handler", "view")
    ext = os.path.splitext(name)[1]
    if ext in (".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".kt", ".go"):
        if any(ind in name for ind in route_indicators):
            return True
        # Also scan files in typical route directories
        dir_lower = "/".join(parts[:-1]).lower()
        if any(ind in dir_lower for ind in ("route", "controller", "endpoint", "api", "handler", "view", "urls")):
            return True
    return False


def extract_from_file(filepath, root):
    """Extract API endpoints from a single file."""
    apis = []
    rel_path = os.path.relpath(filepath, root).replace("\\", "/")
    ext = os.path.splitext(filepath)[1].lower()

    try:
        content = Path(filepath).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return apis

    # Detect middleware patterns
    middleware = []
    if re.search(r"auth|authenticate|authorize|jwt|token", content, re.IGNORECASE):
        middleware.append("auth")
    if re.search(r"tenant|multi.?tenant", content, re.IGNORECASE):
        middleware.append("tenantScope")

    # JS/TS Express/Koa/Fastify
    if ext in (".ts", ".js", ".tsx", ".jsx"):
        for m in JS_ROUTE_PATTERN.finditer(content):
            apis.append({
                "endpoint": m.group(2),
                "method": m.group(1).upper(),
                "handler_file": rel_path,
                "framework_hint": "express/koa/fastify",
            })

        # NestJS
        controller_prefix = ""
        cm = NESTJS_CONTROLLER_PATTERN.search(content)
        if cm:
            controller_prefix = cm.group(1).rstrip("/")

        for m in NESTJS_DECORATOR_PATTERN.finditer(content):
            path = m.group(2) or ""
            full_path = f"{controller_prefix}/{path}".replace("//", "/") if controller_prefix else path
            if not full_path.startswith("/"):
                full_path = "/" + full_path
            apis.append({
                "endpoint": full_path,
                "method": m.group(1).upper(),
                "handler_file": rel_path,
                "framework_hint": "nestjs",
            })

    # Python Flask/FastAPI/Django
    elif ext == ".py":
        for m in FLASK_ROUTE_PATTERN.finditer(content):
            methods_str = m.group(2) or "'GET'"
            methods = re.findall(r"'(\w+)'", methods_str)
            for method in (methods or ["GET"]):
                apis.append({
                    "endpoint": m.group(1),
                    "method": method.upper(),
                    "handler_file": rel_path,
                    "framework_hint": "flask",
                })

        for m in FASTAPI_PATTERN.finditer(content):
            apis.append({
                "endpoint": m.group(2),
                "method": m.group(1).upper(),
                "handler_file": rel_path,
                "framework_hint": "fastapi",
            })

        for m in DJANGO_URL_PATTERN.finditer(content):
            apis.append({
                "endpoint": "/" + m.group(1).lstrip("/"),
                "method": "ANY",
                "handler_file": rel_path,
                "framework_hint": "django",
            })

    # Java/Kotlin Spring Boot
    elif ext in (".java", ".kt"):
        # Detect class-level @RequestMapping prefix: scan everything before the
        # first `class X` declaration. This prevents method-level mappings from
        # being mistaken as class-level. Adapter ref: references/framework-adapters/spring-mvc.md
        class_prefix = ""
        cls_decl = SPRING_CLASS_PATTERN.search(content)
        if cls_decl:
            head = content[:cls_decl.start()]
            cm = SPRING_CLASS_MAPPING_PATTERN.search(head)
            if cm:
                class_prefix = "/" + cm.group(1).strip("/")

        for m in SPRING_MAPPING_PATTERN.finditer(content):
            method = m.group(1).upper()
            if method == "REQUEST":
                method = "ANY"
            method_path = m.group(2)
            # Skip the class-level @RequestMapping itself: it appears before the
            # class declaration and produces a self-mapping like /lucky -> ANY,
            # which we still record but as the root entry once.
            if cls_decl and m.start() < cls_decl.start():
                # This match IS the class-level mapping. Emit a single root entry.
                apis.append({
                    "endpoint": "/" + method_path.strip("/"),
                    "method": "ANY",
                    "handler_file": rel_path,
                    "framework_hint": "spring",
                    "class_prefix": class_prefix,
                    "method_path": "",
                })
                continue
            joined = (class_prefix.rstrip("/") + "/" + method_path.lstrip("/")) if class_prefix else method_path
            joined = "/" + joined.lstrip("/")
            apis.append({
                "endpoint": joined,
                "method": method,
                "handler_file": rel_path,
                "framework_hint": "spring",
                "class_prefix": class_prefix,
                "method_path": method_path,
            })

    # Go
    elif ext == ".go":
        for m in GO_ROUTE_PATTERN.finditer(content):
            method = m.group(1).upper()
            if method in ("HANDLE", "HANDLEFUNC"):
                method = "ANY"
            apis.append({
                "endpoint": m.group(2),
                "method": method,
                "handler_file": rel_path,
                "framework_hint": "go",
            })

    # Enrich common fields
    for api in apis:
        api["module"] = _guess_module(rel_path)
        api["auth_required"] = "auth" in middleware
        api["middleware"] = middleware
        api["source_of_truth"] = "code"
        api["confidence"] = "high"

    return apis


def _guess_framework_from_ext(ext):
    return {
        ".java": "spring/jaxrs", ".kt": "spring/jaxrs",
        ".py": "flask/fastapi/django", ".go": "gin/echo/net-http",
        ".ts": "express/koa/nestjs/fastify", ".js": "express/koa/nestjs/fastify",
        ".tsx": "express/koa/nestjs/fastify", ".jsx": "express/koa/nestjs/fastify",
    }.get(ext, "unknown")


def _guess_module(filepath):
    """Guess module name from file path."""
    parts = Path(filepath).parts
    # Skip common prefixes
    skip = {"src", "app", "routes", "controllers", "handlers", "api", "endpoints", "views"}
    for p in parts:
        p_lower = p.lower().replace(".ts", "").replace(".js", "").replace(".py", "").replace(".java", "").replace(".go", "")
        if p_lower not in skip and p_lower:
            return p_lower
    return os.path.splitext(os.path.basename(filepath))[0]


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — API Inventory Extractor")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    all_apis = []
    scanned_files = 0
    coverage_gaps = []  # files that should_scan() but extracted 0 endpoints

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            if should_scan(fpath):
                scanned_files += 1
                apis = extract_from_file(fpath, root)
                if not apis:
                    rel = os.path.relpath(fpath, root).replace("\\", "/")
                    coverage_gaps.append({
                        "file": rel,
                        "reason": "matched scan heuristic but 0 endpoints extracted",
                        "framework_hint": _guess_framework_from_ext(os.path.splitext(fname)[1].lower()),
                    })
                all_apis.extend(apis)

    # Deduplicate by endpoint+method
    seen = set()
    unique_apis = []
    for api in all_apis:
        key = (api["endpoint"], api["method"], api["handler_file"])
        if key not in seen:
            seen.add(key)
            unique_apis.append(api)

    gap_ratio = (len(coverage_gaps) / scanned_files) if scanned_files else 0.0
    inventory = {
        "apis": unique_apis,
        "total_count": len(unique_apis),
        "files_scanned": scanned_files,
        "coverage": {
            "scanned": scanned_files,
            "with_extractions": scanned_files - len(coverage_gaps),
            "gaps": len(coverage_gaps),
            "gap_ratio": round(gap_ratio, 4),
            "gap_threshold": 0.05,
            "status": "ok" if gap_ratio <= 0.05 else "warn",
        },
        "scan_timestamp": now_iso(),
    }

    out_path = os.path.join(evidence_dir, "api-inventory.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    # Coverage Contract: emit a sibling .gaps.json (Mechanism 1)
    gaps_path = os.path.join(evidence_dir, "api-inventory.gaps.json")
    with open(gaps_path, "w", encoding="utf-8") as f:
        json.dump({
            "extractor": "extract_api_inventory.py",
            "files_scanned": scanned_files,
            "files_with_extractions": scanned_files - len(coverage_gaps),
            "gap_count": len(coverage_gaps),
            "gap_ratio": round(gap_ratio, 4),
            "gap_threshold": 0.05,
            "status": "ok" if gap_ratio <= 0.05 else "warn",
            "gaps": coverage_gaps,
            "scan_timestamp": now_iso(),
        }, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "ok",
        "apis_found": len(unique_apis),
        "files_scanned": scanned_files,
        "coverage_gaps": len(coverage_gaps),
        "gap_ratio": round(gap_ratio, 4),
        "output": out_path,
        "gaps_output": gaps_path,
    }, indent=2))


if __name__ == "__main__":
    main()
