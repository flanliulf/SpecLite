#!/usr/bin/env python3
"""
extract_data_models.py — 数据模型提取

扫描项目中的 ORM 模型、Schema 定义、Migration 文件，提取数据模型清单。
支持 Sequelize/TypeORM/Prisma/Mongoose/SQLAlchemy/Django ORM/JPA 等。

用法:
    python extract_data_models.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/data-model-inventory.json
    <output_dir>/evidence/schema-migration-index.json

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

# --- Model detection patterns ---

# TypeORM: @Entity(), class User { @Column() name: string }
TYPEORM_ENTITY = re.compile(r"@Entity\s*\(\s*(?:['\"](\w+)['\"])?\s*\)")
TYPEORM_COLUMN = re.compile(r"@(?:Column|PrimaryGeneratedColumn|PrimaryColumn|CreateDateColumn|UpdateDateColumn)\s*\(([^)]*)\)\s*\n\s*(\w+)")

# Sequelize: Model.init({ name: DataTypes.STRING }, ...)
SEQUELIZE_MODEL = re.compile(r"class\s+(\w+)\s+extends\s+Model")
SEQUELIZE_FIELD = re.compile(r"(\w+)\s*:\s*\{?\s*type\s*:\s*DataTypes\.(\w+)")

# Prisma: model User { id Int @id }
PRISMA_MODEL = re.compile(r"model\s+(\w+)\s*\{")
PRISMA_FIELD = re.compile(r"^\s+(\w+)\s+(String|Int|Float|Boolean|DateTime|BigInt|Decimal|Bytes|Json|\w+)(\[\])?\s*(.*)", re.MULTILINE)

# Mongoose: new Schema({ name: { type: String } })
MONGOOSE_SCHEMA = re.compile(r"(?:new\s+(?:mongoose\.)?Schema|(\w+)Schema)\s*\(")

# SQLAlchemy/Django: class User(Base/Model): name = Column(String)
PYTHON_MODEL = re.compile(r"class\s+(\w+)\s*\(\s*(?:Base|Model|db\.Model|models\.Model|DeclarativeBase)")
PYTHON_COLUMN = re.compile(r"(\w+)\s*=\s*(?:Column|db\.Column|models\.)\s*\(\s*(?:db\.)?(\w+)")

# JPA: @Entity @Table(name="users") class User
JPA_ENTITY = re.compile(r"@Entity")
JPA_TABLE = re.compile(r'@Table\s*\(\s*name\s*=\s*"(\w+)"')
JPA_CLASS = re.compile(r"class\s+(\w+)")
JPA_COLUMN = re.compile(r"(?:private|protected)\s+(\w+(?:<[^>]+>)?)\s+(\w+)\s*;")

# MyBatis Plus: @TableName("users") class User { @TableId Long id; @TableField("name") String name; }
MBP_TABLENAME = re.compile(r'@TableName\s*\(\s*(?:value\s*=\s*)?["\']([\w_]+)["\']')
MBP_TABLEID = re.compile(r"@TableId")
MBP_TABLEFIELD = re.compile(r'@TableField\s*\(\s*(?:value\s*=\s*)?["\']([\w_]+)["\']')

# Migration file patterns
MIGRATION_PATTERNS = {
    "sql": re.compile(r"\d{8,14}.*\.sql$", re.IGNORECASE),
    "js_ts": re.compile(r"\d{8,14}.*\.(js|ts)$"),
    "py": re.compile(r"\d{4}_.*\.py$"),
    "prisma": re.compile(r"\d{8,14}.*migration\.sql$"),
}


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_model_file(filepath):
    """Check if file likely contains model definitions."""
    name = os.path.basename(filepath).lower()
    parts = Path(filepath).parts
    if any(p in IGNORE_DIRS for p in parts):
        return False
    dir_lower = "/".join(parts).lower()
    ext = os.path.splitext(name)[1]

    if ext == ".prisma":
        return True

    model_indicators = ("model", "entity", "schema", "orm", "table", "do", "po")
    dir_indicators = ("models", "entities", "entity", "model", "schemas", "orm", "db", "database", "prisma", "dao", "domain")

    if ext in (".ts", ".js", ".py", ".java", ".kt"):
        if any(ind in name for ind in model_indicators):
            return True
        if any(ind in dir_lower for ind in dir_indicators):
            return True
    return False


def is_migration_file(filepath):
    """Check if file is a migration."""
    name = os.path.basename(filepath)
    dir_lower = "/".join(Path(filepath).parts).lower()
    if "migration" in dir_lower or "migrate" in dir_lower:
        return True
    for pattern in MIGRATION_PATTERNS.values():
        if pattern.match(name):
            return True
    return False


def extract_models(filepath, root):
    """Extract model definitions from a file."""
    models = []
    rel_path = os.path.relpath(filepath, root).replace("\\", "/")
    ext = os.path.splitext(filepath)[1].lower()

    try:
        content = Path(filepath).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return models

    # Prisma schema
    if ext == ".prisma":
        for m in PRISMA_MODEL.finditer(content):
            model_name = m.group(1)
            # Extract fields until next model or end
            start = m.end()
            brace_count = 1
            pos = start
            while pos < len(content) and brace_count > 0:
                if content[pos] == "{":
                    brace_count += 1
                elif content[pos] == "}":
                    brace_count -= 1
                pos += 1
            block = content[start:pos]

            fields = []
            for fm in PRISMA_FIELD.finditer(block):
                field_name = fm.group(1)
                if field_name in ("@@", "//"):
                    continue
                is_list = fm.group(3) == "[]"
                attrs = fm.group(4) or ""
                fields.append({
                    "name": field_name,
                    "type": fm.group(2) + ("[]" if is_list else ""),
                    "nullable": "?" in attrs,
                    "primary_key": "@id" in attrs,
                })

            models.append({
                "name": model_name,
                "type": "schema_definition",
                "file": rel_path,
                "table_name": _to_snake_case(model_name) + "s",
                "fields": fields,
                "relationships": [],
                "source_of_truth": "code",
                "confidence": "high",
            })

    # TypeORM
    elif ext in (".ts", ".js") and "@Entity" in content:
        table_match = TYPEORM_ENTITY.search(content)
        class_match = re.search(r"class\s+(\w+)", content)
        if class_match:
            model_name = class_match.group(1)
            table_name = table_match.group(1) if table_match and table_match.group(1) else _to_snake_case(model_name) + "s"
            fields = []
            for cm in TYPEORM_COLUMN.finditer(content):
                fields.append({
                    "name": cm.group(2),
                    "type": "unknown",
                    "nullable": "nullable: true" in cm.group(1) if cm.group(1) else False,
                    "primary_key": "PrimaryGeneratedColumn" in content[:cm.start() + 50] or "PrimaryColumn" in content[:cm.start() + 50],
                })
            models.append({
                "name": model_name,
                "type": "orm_entity",
                "file": rel_path,
                "table_name": table_name,
                "fields": fields,
                "relationships": [],
                "source_of_truth": "code",
                "confidence": "high",
            })

    # Sequelize
    elif ext in (".ts", ".js") and "extends Model" in content:
        for sm in SEQUELIZE_MODEL.finditer(content):
            model_name = sm.group(1)
            fields = []
            for fm in SEQUELIZE_FIELD.finditer(content):
                fields.append({
                    "name": fm.group(1),
                    "type": fm.group(2),
                    "nullable": False,
                    "primary_key": False,
                })
            models.append({
                "name": model_name,
                "type": "orm_entity",
                "file": rel_path,
                "table_name": _to_snake_case(model_name) + "s",
                "fields": fields,
                "relationships": [],
                "source_of_truth": "code",
                "confidence": "high",
            })

    # Python (SQLAlchemy / Django)
    elif ext == ".py":
        for pm in PYTHON_MODEL.finditer(content):
            model_name = pm.group(1)
            fields = []
            for cm in PYTHON_COLUMN.finditer(content[pm.start():]):
                fields.append({
                    "name": cm.group(1),
                    "type": cm.group(2),
                    "nullable": False,
                    "primary_key": "primary_key" in content[cm.start():cm.end() + 100],
                })
            models.append({
                "name": model_name,
                "type": "orm_entity",
                "file": rel_path,
                "table_name": _to_snake_case(model_name) + "s",
                "fields": fields,
                "relationships": [],
                "source_of_truth": "code",
                "confidence": "high",
            })

    # Java JPA
    elif ext in (".java", ".kt") and "@Entity" in content:
        class_match = JPA_CLASS.search(content)
        table_match = JPA_TABLE.search(content)
        if class_match:
            model_name = class_match.group(1)
            table_name = table_match.group(1) if table_match else _to_snake_case(model_name) + "s"
            fields = []
            for cm in JPA_COLUMN.finditer(content):
                fields.append({
                    "name": cm.group(2),
                    "type": cm.group(1),
                    "nullable": False,
                    "primary_key": cm.group(2) == "id",
                })
            models.append({
                "name": model_name,
                "type": "orm_entity",
                "orm": "jpa",
                "file": rel_path,
                "table_name": table_name,
                "fields": fields,
                "relationships": [],
                "source_of_truth": "code",
                "confidence": "high",
            })

    # Java/Kotlin MyBatis Plus: @TableName(value="...") + Lombok @Data
    if ext in (".java", ".kt") and "@TableName" in content:
        tn = MBP_TABLENAME.search(content)
        class_match = JPA_CLASS.search(content)
        if tn and class_match:
            model_name = class_match.group(1)
            table_name = tn.group(1)
            fields = []
            # Field type extraction reuses JPA_COLUMN regex (private/protected <Type> <name>;)
            for cm in JPA_COLUMN.finditer(content):
                fname = cm.group(2)
                # Detect @TableId proximity (within 200 chars before declaration)
                start = max(0, cm.start() - 200)
                window = content[start:cm.start()]
                is_pk = bool(MBP_TABLEID.search(window)) or fname == "id"
                # @TableField column-name override
                tf = MBP_TABLEFIELD.search(window)
                column_name = tf.group(1) if tf else fname
                fields.append({
                    "name": fname,
                    "column": column_name,
                    "type": cm.group(1),
                    "nullable": True,
                    "primary_key": is_pk,
                })
            # Avoid duplicate emission if a previous JPA pass already produced this name+file
            already = any(m["name"] == model_name and m["file"] == rel_path for m in models)
            if not already:
                models.append({
                    "name": model_name,
                    "type": "orm_entity",
                    "orm": "mybatis-plus",
                    "file": rel_path,
                    "table_name": table_name,
                    "fields": fields,
                    "relationships": [],
                    "source_of_truth": "code",
                    "confidence": "high",
                })

    return models


def extract_migrations(root):
    """Find and index migration files."""
    migrations = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            if is_migration_file(fpath):
                rel_path = os.path.relpath(fpath, root).replace("\\", "/")
                # Try to extract timestamp from filename
                ts_match = re.search(r"(\d{4,14})", fname)
                timestamp = ts_match.group(1) if ts_match else ""
                migrations.append({
                    "file": rel_path,
                    "timestamp": timestamp,
                    "description": fname,
                })
    migrations.sort(key=lambda m: m["timestamp"])
    return migrations


def _to_snake_case(name):
    """Convert CamelCase to snake_case."""
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Data Model Extractor")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory (relative to project root)")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    all_models = []
    coverage_gaps = []
    scanned_files = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            if is_model_file(fpath):
                scanned_files += 1
                models = extract_models(fpath, root)
                if not models:
                    rel = os.path.relpath(fpath, root).replace("\\", "/")
                    coverage_gaps.append({
                        "file": rel,
                        "reason": "matched model heuristic but 0 models extracted",
                        "framework_hint": "jpa/mybatis-plus/typeorm/sequelize/prisma/sqlalchemy/django",
                    })
                all_models.extend(models)

    migrations = extract_migrations(root)

    # Deduplicate models by name+file
    seen = set()
    unique_models = []
    for m in all_models:
        key = (m["name"], m["file"])
        if key not in seen:
            seen.add(key)
            unique_models.append(m)

    inventory = {
        "models": unique_models,
        "migrations": migrations,
        "total_models": len(unique_models),
        "total_migrations": len(migrations),
        "coverage": {
            "scanned": scanned_files,
            "with_extractions": scanned_files - len(coverage_gaps),
            "gaps": len(coverage_gaps),
            "gap_ratio": round((len(coverage_gaps) / scanned_files) if scanned_files else 0.0, 4),
            "gap_threshold": 0.05,
            "status": "ok" if (not scanned_files or len(coverage_gaps) / scanned_files <= 0.05) else "warn",
        },
        "scan_timestamp": now_iso(),
    }

    inv_path = os.path.join(evidence_dir, "data-model-inventory.json")
    with open(inv_path, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    # Coverage Contract sibling (Mechanism 1)
    gaps_path = os.path.join(evidence_dir, "data-model-inventory.gaps.json")
    with open(gaps_path, "w", encoding="utf-8") as f:
        json.dump({
            "extractor": "extract_data_models.py",
            "files_scanned": scanned_files,
            "files_with_extractions": scanned_files - len(coverage_gaps),
            "gap_count": len(coverage_gaps),
            "gap_ratio": round((len(coverage_gaps) / scanned_files) if scanned_files else 0.0, 4),
            "gap_threshold": 0.05,
            "status": "ok" if (not scanned_files or len(coverage_gaps) / scanned_files <= 0.05) else "warn",
            "gaps": coverage_gaps,
            "scan_timestamp": now_iso(),
        }, f, indent=2, ensure_ascii=False)

    mig_index = {
        "migrations": migrations,
        "total_count": len(migrations),
        "scan_timestamp": now_iso(),
    }

    mig_path = os.path.join(evidence_dir, "schema-migration-index.json")
    with open(mig_path, "w", encoding="utf-8") as f:
        json.dump(mig_index, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "ok",
        "models_found": len(unique_models),
        "migrations_found": len(migrations),
        "outputs": [inv_path, mig_path],
    }, indent=2))


if __name__ == "__main__":
    main()
