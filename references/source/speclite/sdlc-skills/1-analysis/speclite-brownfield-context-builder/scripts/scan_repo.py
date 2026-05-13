#!/usr/bin/env python3
"""
scan_repo.py — 仓库结构扫描

扫描项目根目录，识别仓库类型、语言/框架、配置文件、文档文件、测试目录，
输出 repo-manifest.json 和 existing-doc-inventory.json。

用法:
    python scan_repo.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/repo-manifest.json
    <output_dir>/evidence/existing-doc-inventory.json

退出码:
    0 — 成功
    1 — 参数错误
    2 — 目录不存在
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


# --- 常量定义 ---

IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode", ".gradle", "build", "dist", "target",
    ".next", ".nuxt", ".cache", ".tox", ".mypy_cache", ".pytest_cache",
    "vendor", "Pods", ".dart_tool", ".pub-cache"
}

LANGUAGE_MAP = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
    ".tsx": "TypeScript", ".jsx": "JavaScript",
    ".java": "Java", ".kt": "Kotlin", ".kts": "Kotlin",
    ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
    ".php": "PHP", ".cs": "C#", ".swift": "Swift",
    ".dart": "Dart", ".scala": "Scala", ".clj": "Clojure",
    ".vue": "Vue", ".svelte": "Svelte",
    ".sql": "SQL", ".sh": "Shell", ".bash": "Shell",
}

FRAMEWORK_INDICATORS = {}  # populated after function definitions below

PACKAGE_MANAGER_FILES = {
    "package-lock.json": "npm", "yarn.lock": "yarn", "pnpm-lock.yaml": "pnpm",
    "bun.lockb": "bun",
    "requirements.txt": "pip", "Pipfile.lock": "pipenv", "poetry.lock": "poetry",
    "uv.lock": "uv",
    "go.sum": "go", "Cargo.lock": "cargo",
    "Gemfile.lock": "bundler", "composer.lock": "composer",
    "pubspec.lock": "pub",
    "pom.xml": "maven", "build.gradle": "gradle", "build.gradle.kts": "gradle",
}

DOC_EXTENSIONS = {".md", ".rst", ".txt", ".adoc", ".org"}
DOC_PATTERNS = {"readme", "changelog", "contributing", "license", "architecture",
                "design", "api", "guide", "tutorial", "manual", "spec", "docs"}

CONFIG_PATTERNS = {
    ".env", ".env.example", ".env.local", ".env.development", ".env.production",
    "tsconfig.json", "jsconfig.json", "webpack.config", "vite.config",
    "next.config", "nuxt.config", "rollup.config", "esbuild",
    ".eslintrc", ".prettierrc", "babel.config", "jest.config",
    "pytest.ini", "setup.cfg", "setup.py", "pyproject.toml",
    "docker-compose", "Dockerfile", "Makefile", "Procfile",
    "nginx.conf", "application.yml", "application.properties",
    "appsettings.json", "config.yaml", "config.json", "config.toml",
}

TEST_DIR_NAMES = {"test", "tests", "__tests__", "spec", "specs", "test_", "e2e", "integration"}

PART_INDICATORS = {
    "client": {"type": "frontend"},
    "frontend": {"type": "frontend"},
    "web": {"type": "frontend"},
    "app": {"type": "frontend"},
    "server": {"type": "backend"},
    "backend": {"type": "backend"},
    "api": {"type": "backend"},
    "worker": {"type": "worker"},
    "jobs": {"type": "worker"},
    "packages": {"type": "packages"},
    "libs": {"type": "packages"},
    "sdk": {"type": "sdk"},
    "infra": {"type": "infra"},
    "infrastructure": {"type": "infra"},
    "deploy": {"type": "infra"},
    "tools": {"type": "tools"},
    "scripts": {"type": "tools"},
}


def _detect_js_frameworks(content):
    """Detect JS/TS frameworks from package.json content."""
    frameworks = []
    try:
        pkg = json.loads(content)
        deps = {}
        deps.update(pkg.get("dependencies", {}))
        deps.update(pkg.get("devDependencies", {}))
        if "react" in deps:
            frameworks.append("React")
        if "next" in deps:
            frameworks.append("Next.js")
        if "vue" in deps:
            frameworks.append("Vue")
        if "nuxt" in deps:
            frameworks.append("Nuxt")
        if "@angular/core" in deps:
            frameworks.append("Angular")
        if "svelte" in deps:
            frameworks.append("Svelte")
        if "express" in deps:
            frameworks.append("Express")
        if "fastify" in deps:
            frameworks.append("Fastify")
        if "koa" in deps:
            frameworks.append("Koa")
        if "nestjs" in deps or "@nestjs/core" in deps:
            frameworks.append("NestJS")
        if "hono" in deps:
            frameworks.append("Hono")
        if "elysia" in deps:
            frameworks.append("Elysia")
    except (json.JSONDecodeError, KeyError):
        pass
    return frameworks if frameworks else ["Node.js"]


def _detect_python_frameworks(content):
    """Detect Python frameworks from pyproject.toml content."""
    frameworks = ["Python"]
    content_lower = content.lower()
    if "django" in content_lower:
        frameworks.append("Django")
    if "flask" in content_lower:
        frameworks.append("Flask")
    if "fastapi" in content_lower:
        frameworks.append("FastAPI")
    if "starlette" in content_lower:
        frameworks.append("Starlette")
    return frameworks


# --- 修复 forward reference：重新绑定 FRAMEWORK_INDICATORS ---
FRAMEWORK_INDICATORS = {
    "package.json": _detect_js_frameworks,
    "requirements.txt": lambda _: ["Python"],
    "pyproject.toml": _detect_python_frameworks,
    "Pipfile": lambda _: ["Python"],
    "go.mod": lambda _: ["Go"],
    "Cargo.toml": lambda _: ["Rust"],
    "pom.xml": lambda _: ["Maven", "Java"],
    "build.gradle": lambda _: ["Gradle", "Java"],
    "build.gradle.kts": lambda _: ["Gradle", "Kotlin"],
    "Gemfile": lambda _: ["Ruby"],
    "composer.json": lambda _: ["PHP"],
    "pubspec.yaml": lambda _: ["Flutter", "Dart"],
}


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def should_ignore(path_parts):
    """Check if any part of the path is in IGNORE_DIRS."""
    return any(p in IGNORE_DIRS for p in path_parts)


def scan_directory(root):
    """Walk directory tree, collecting file info."""
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root)
        parts = Path(rel_dir).parts if rel_dir != "." else ()

        # Prune ignored directories
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]

        for fname in filenames:
            if fname.startswith(".") and fname not in (".env.example",):
                continue
            rel_path = os.path.join(rel_dir, fname) if rel_dir != "." else fname
            rel_path = rel_path.replace("\\", "/")
            ext = os.path.splitext(fname)[1].lower()
            size = 0
            try:
                size = os.path.getsize(os.path.join(dirpath, fname))
            except OSError:
                pass
            files.append({
                "path": rel_path,
                "name": fname,
                "ext": ext,
                "size": size,
                "dir": rel_dir.replace("\\", "/") if rel_dir != "." else "",
            })
    return files


def detect_languages(files):
    """Count language occurrences."""
    lang_counts = {}
    for f in files:
        lang = LANGUAGE_MAP.get(f["ext"])
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    sorted_langs = sorted(lang_counts.items(), key=lambda x: -x[1])
    return [l[0] for l in sorted_langs]


def detect_frameworks(root, files):
    """Detect frameworks from indicator files."""
    frameworks = []
    for f in files:
        if f["name"] in FRAMEWORK_INDICATORS and f["dir"] in ("", "."):
            detector = FRAMEWORK_INDICATORS[f["name"]]
            try:
                content = Path(os.path.join(root, f["path"])).read_text(encoding="utf-8", errors="ignore")
                detected = detector(content)
                frameworks.extend(detected)
            except OSError:
                pass
    return list(dict.fromkeys(frameworks))  # deduplicate preserving order


def detect_package_manager(files):
    """Detect package manager from lock files."""
    for f in files:
        if f["name"] in PACKAGE_MANAGER_FILES and f["dir"] in ("", "."):
            return PACKAGE_MANAGER_FILES[f["name"]]
    return "unknown"


def detect_repo_type(root, top_dirs):
    """Determine repo type: monolith / monorepo / multi-part."""
    # Check for monorepo indicators
    workspaces_file = os.path.join(root, "package.json")
    if os.path.exists(workspaces_file):
        try:
            pkg = json.loads(Path(workspaces_file).read_text(encoding="utf-8", errors="ignore"))
            if "workspaces" in pkg:
                return "monorepo"
        except (json.JSONDecodeError, OSError):
            pass

    lerna_file = os.path.join(root, "lerna.json")
    if os.path.exists(lerna_file):
        return "monorepo"

    nx_file = os.path.join(root, "nx.json")
    if os.path.exists(nx_file):
        return "monorepo"

    turborepo_file = os.path.join(root, "turbo.json")
    if os.path.exists(turborepo_file):
        return "monorepo"

    # Check for multi-part (multiple distinct service dirs)
    part_dirs = [d for d in top_dirs if d.lower() in PART_INDICATORS]
    if len(part_dirs) >= 2:
        return "multi-part"

    return "monolith"


def detect_parts(root, top_dirs, files):
    """Identify project parts."""
    parts = []
    for d in top_dirs:
        d_lower = d.lower()
        if d_lower in PART_INDICATORS:
            part_info = PART_INDICATORS[d_lower]
            # Try to detect language/framework for this part
            part_files = [f for f in files if f["path"].startswith(d + "/") or f["path"].startswith(d + "\\")]
            part_langs = detect_languages(part_files)
            part_frameworks = detect_frameworks(os.path.join(root, d), part_files)

            # Find entry point
            entry_point = ""
            for f in part_files:
                if f["name"] in ("index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js",
                                 "main.py", "app.py", "__main__.py", "main.go", "Main.java", "Application.java"):
                    entry_point = f["path"]
                    break

            parts.append({
                "name": d,
                "path": d + "/",
                "type": part_info["type"],
                "language": part_langs[0] if part_langs else "",
                "framework": part_frameworks[0] if part_frameworks else "",
                "entry_point": entry_point,
            })
    return parts


def find_config_files(files):
    """Find configuration files."""
    configs = []
    for f in files:
        name_lower = f["name"].lower()
        if any(pat in name_lower for pat in CONFIG_PATTERNS):
            configs.append(f["path"])
        elif f["ext"] in (".yml", ".yaml", ".toml", ".ini", ".cfg") and f["dir"] in ("", "."):
            configs.append(f["path"])
    return configs[:50]  # cap at 50


def find_doc_files(files):
    """Find documentation files."""
    docs = []
    for f in files:
        if f["ext"] in DOC_EXTENSIONS:
            name_lower = f["name"].lower()
            dir_lower = f["dir"].lower()
            if any(pat in name_lower for pat in DOC_PATTERNS) or "doc" in dir_lower:
                docs.append(f["path"])
    return docs[:100]  # cap at 100


def find_test_dirs(files):
    """Find test directories."""
    test_dirs = set()
    for f in files:
        parts = Path(f["path"]).parts
        for p in parts:
            if p.lower() in TEST_DIR_NAMES:
                idx = list(parts).index(p)
                test_dir = "/".join(parts[:idx + 1])
                test_dirs.add(test_dir)
                break
    return sorted(test_dirs)[:20]


def build_doc_inventory(root, doc_files):
    """Build existing document inventory."""
    documents = []
    for path in doc_files:
        full_path = os.path.join(root, path)
        name_lower = os.path.basename(path).lower()

        # Classify document type
        doc_type = "other"
        if "readme" in name_lower:
            doc_type = "readme"
        elif "changelog" in name_lower:
            doc_type = "changelog"
        elif "architect" in name_lower:
            doc_type = "architecture"
        elif "api" in name_lower:
            doc_type = "api"
        elif "deploy" in name_lower or "infra" in name_lower:
            doc_type = "deployment"
        elif "guide" in name_lower or "tutorial" in name_lower:
            doc_type = "guide"
        elif "contributing" in name_lower:
            doc_type = "guide"

        # Extract title from first heading
        title = os.path.splitext(os.path.basename(path))[0]
        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("# "):
                        title = line[2:].strip()
                        break
        except OSError:
            pass

        size = 0
        try:
            size = os.path.getsize(full_path)
        except OSError:
            pass

        documents.append({
            "path": path,
            "type": doc_type,
            "title": title,
            "source_label": "current-doc",
            "size_bytes": size,
        })
    return documents


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Repository Scanner")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    # Scan
    files = scan_directory(root)

    # Top-level dirs
    top_dirs = sorted(set(
        f["path"].split("/")[0] for f in files
        if "/" in f["path"] and f["path"].split("/")[0] not in IGNORE_DIRS
    ))

    # Detect
    languages = detect_languages(files)
    frameworks = detect_frameworks(root, files)
    pkg_manager = detect_package_manager(files)
    repo_type = detect_repo_type(root, top_dirs)
    parts = detect_parts(root, top_dirs, files)
    config_files = find_config_files(files)
    doc_files = find_doc_files(files)
    test_dirs = find_test_dirs(files)

    # Count lines estimate
    total_lines = 0
    code_exts = set(LANGUAGE_MAP.keys())
    for f in files:
        if f["ext"] in code_exts:
            total_lines += max(1, f["size"] // 40)  # rough estimate: 40 bytes per line

    # Build repo-manifest
    manifest = {
        "project_root": root,
        "repo_type": repo_type,
        "primary_language": languages[0] if languages else "unknown",
        "languages": languages,
        "frameworks": frameworks,
        "package_manager": pkg_manager,
        "parts": parts,
        "top_level_dirs": top_dirs,
        "config_files": config_files,
        "doc_files": doc_files,
        "test_dirs": test_dirs,
        "total_files": len(files),
        "total_lines_estimate": total_lines,
        "scan_timestamp": now_iso(),
    }

    manifest_path = os.path.join(evidence_dir, "repo-manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # Build doc inventory
    doc_inventory = {
        "documents": build_doc_inventory(root, doc_files),
        "total_count": len(doc_files),
        "scan_timestamp": now_iso(),
    }

    doc_inv_path = os.path.join(evidence_dir, "existing-doc-inventory.json")
    with open(doc_inv_path, "w", encoding="utf-8") as f:
        json.dump(doc_inventory, f, indent=2, ensure_ascii=False)

    # Summary output
    print(json.dumps({
        "status": "ok",
        "repo_type": repo_type,
        "primary_language": languages[0] if languages else "unknown",
        "total_files": len(files),
        "total_docs": len(doc_files),
        "parts_count": len(parts),
        "outputs": [manifest_path, doc_inv_path],
    }, indent=2))


if __name__ == "__main__":
    main()
