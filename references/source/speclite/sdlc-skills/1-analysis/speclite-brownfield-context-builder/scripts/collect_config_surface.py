#!/usr/bin/env python3
"""
collect_config_surface.py — 配置面收集

扫描项目中的环境变量、配置文件、Feature Flag、第三方服务配置。

用法:
    python collect_config_surface.py <project_root> [--output-dir docs/brownfield]

输出:
    <output_dir>/evidence/config-surface.json

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


IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode", "build", "dist", "target", ".next", ".cache", "vendor"
}

# Env var patterns: process.env.X, os.environ["X"], os.getenv("X"), ENV["X"]
ENV_PATTERNS = [
    re.compile(r"process\.env\.(\w+)"),
    re.compile(r"process\.env\[['\"]([\w]+)['\"]\]"),
    re.compile(r"os\.environ(?:\.get)?\s*\(\s*['\"]([\w]+)['\"]"),
    re.compile(r"os\.getenv\s*\(\s*['\"]([\w]+)['\"]"),
    re.compile(r"ENV\[['\"]([\w]+)['\"]\]"),
    re.compile(r"System\.getenv\s*\(\s*['\"]([\w]+)['\"]"),
    re.compile(r"@Value\s*\(\s*['\"\$]\{([\w.]+)\}"),
]

# Config file indicators
CONFIG_FILES = {
    ".env", ".env.example", ".env.local", ".env.development", ".env.production",
    ".env.staging", ".env.test",
}

CONFIG_EXTENSIONS = {".yml", ".yaml", ".toml", ".ini", ".cfg", ".properties", ".conf"}

# Feature flag patterns
FEATURE_FLAG_PATTERNS = [
    re.compile(r"(?:feature[_-]?flag|feature[_-]?toggle|is[_-]?enabled|flag)\s*[=(:\[]\s*['\"]?([\w.-]+)", re.IGNORECASE),
    re.compile(r"FEATURE_(\w+)\s*=", re.IGNORECASE),
]

# Third-party service indicators
SERVICE_PATTERNS = {
    "AWS": re.compile(r"AWS_|aws-sdk|boto3|@aws-sdk", re.IGNORECASE),
    "Redis": re.compile(r"REDIS_|redis://|ioredis|redis\.create", re.IGNORECASE),
    "PostgreSQL": re.compile(r"POSTGRES_|PG_|postgresql://|pg\.Pool", re.IGNORECASE),
    "MySQL": re.compile(r"MYSQL_|mysql://|mysql2", re.IGNORECASE),
    "MongoDB": re.compile(r"MONGO_|mongodb://|mongoose\.connect", re.IGNORECASE),
    "Elasticsearch": re.compile(r"ELASTIC_|elasticsearch", re.IGNORECASE),
    "RabbitMQ": re.compile(r"RABBIT_|AMQP_|amqp://|amqplib", re.IGNORECASE),
    "Kafka": re.compile(r"KAFKA_|kafka", re.IGNORECASE),
    "Stripe": re.compile(r"STRIPE_|stripe", re.IGNORECASE),
    "SendGrid": re.compile(r"SENDGRID_|sendgrid", re.IGNORECASE),
    "Twilio": re.compile(r"TWILIO_|twilio", re.IGNORECASE),
    "Sentry": re.compile(r"SENTRY_|@sentry", re.IGNORECASE),
    "Datadog": re.compile(r"DD_|datadog", re.IGNORECASE),
    "Auth0": re.compile(r"AUTH0_|auth0", re.IGNORECASE),
    "Firebase": re.compile(r"FIREBASE_|firebase", re.IGNORECASE),
    "GCP": re.compile(r"GOOGLE_|GCP_|@google-cloud", re.IGNORECASE),
    "Azure": re.compile(r"AZURE_|@azure", re.IGNORECASE),
}

# Mechanism: dependency whitelist (Mechanism 7 — Tech Stack Strict).
# Maps a canonical tech name to the artifact/import id substrings that prove its
# presence. Match is anchored on dependency manifests (pom.xml, build.gradle,
# package.json, requirements.txt, go.mod, Cargo.toml, Gemfile) so it cannot be
# fooled by passing string mentions in source files. The output is written to
# evidence/tech-stack-strict.json and is the single source of truth for
# baseline §"技术栈" / §"外部依赖" sections — the LLM is forbidden from
# substituting a canonical name during synthesis.
TECH_WHITELIST = {
    # Messaging — these often get confused with each other
    "RocketMQ": ["rocketmq", "rocketmq-spring-boot-starter", "rocketmq-stream-boot-starter",
                  "rocketmq-client", "org.apache.rocketmq"],
    "RabbitMQ": ["spring-boot-starter-amqp", "amqp-client", "rabbitmq", "amqplib"],
    "Kafka": ["spring-kafka", "kafka-clients", "kafkajs", "confluent-kafka"],
    "Pulsar": ["pulsar-client", "apache.pulsar"],
    "ActiveMQ": ["activemq-client", "spring-boot-starter-activemq"],
    # Cache / KV
    "Redis": ["spring-boot-starter-data-redis", "redisson", "lettuce-core", "jedis", "ioredis"],
    # RDB
    "MySQL": ["mysql-connector-j", "mysql-connector-java", "mysql2"],
    "PostgreSQL": ["postgresql", "pg-jdbc", "psycopg2", "node-postgres", "pg"],
    "Oracle": ["ojdbc"],
    "SQLServer": ["mssql-jdbc"],
    # NoSQL
    "MongoDB": ["spring-boot-starter-data-mongodb", "mongodb-driver", "mongoose", "pymongo"],
    "Elasticsearch": ["spring-boot-starter-data-elasticsearch", "elasticsearch-rest-client"],
    # Service registry / config
    "Nacos": ["nacos-discovery", "nacos-config", "spring-cloud-starter-alibaba-nacos"],
    "Eureka": ["spring-cloud-starter-netflix-eureka", "eureka-client"],
    "Consul": ["spring-cloud-starter-consul", "consul-api"],
    # Scheduling
    "XXL-Job": ["xxl-job-core", "xxl-job-spring-boot-starter"],
    "Quartz": ["spring-boot-starter-quartz", "org.quartz"],
    # ORM / DAL
    "MyBatis": ["mybatis-spring-boot-starter", "mybatis-spring", "mybatis"],
    "MyBatis-Plus": ["mybatis-plus-boot-starter", "mybatis-plus"],
    "JPA-Hibernate": ["spring-boot-starter-data-jpa", "hibernate-core"],
    # Web
    "SpringBoot": ["spring-boot-starter-web", "spring-boot-starter-webflux"],
    "Express": ["express"],
    "NestJS": ["@nestjs/core"],
    "FastAPI": ["fastapi"],
    "Flask": ["Flask", "flask"],
    "Django": ["Django", "django"],
    # Misc
    "Datadog": ["dd-java-agent", "datadog", "@datadog/browser-rum"],
    "Sentry": ["sentry-spring-boot-starter", "@sentry/", "sentry-sdk"],
}

# Manifest filenames whose content is read verbatim for whitelist matching.
DEPENDENCY_MANIFESTS = (
    "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts",
    "package.json", "requirements.txt", "Pipfile", "pyproject.toml",
    "go.mod", "Cargo.toml", "Gemfile",
)


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_env_file(filepath):
    """Parse .env file for variable names."""
    vars_found = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    match = re.match(r"^(\w+)\s*=", line)
                    if match:
                        vars_found.append(match.group(1))
    except OSError:
        pass
    return vars_found


def scan_tech_whitelist(root):
    """Mechanism 7: deterministic tech-stack identification.
    Walks dependency manifests only and matches each canonical tech against
    its declared artifact substrings. Returns a list of evidence records:
        [{tech: "RocketMQ", manifest: "...pom.xml", line: 60, hit: "rocketmq-stream-boot-starter"}, ...]
    Only manifest files are scanned, so passing string mentions in code or
    comments cannot trigger a false positive.
    """
    hits = []
    manifests_seen = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            if fname not in DEPENDENCY_MANIFESTS:
                continue
            fpath = os.path.join(dirpath, fname)
            rel = os.path.relpath(fpath, root).replace("\\", "/")
            manifests_seen.append(rel)
            try:
                lines = Path(fpath).read_text(encoding="utf-8", errors="ignore").splitlines()
            except OSError:
                continue
            for tech, needles in TECH_WHITELIST.items():
                for lineno, line in enumerate(lines, start=1):
                    lower = line.lower()
                    for needle in needles:
                        if needle.lower() in lower:
                            hits.append({
                                "tech": tech,
                                "manifest": rel,
                                "line": lineno,
                                "hit": needle,
                                "snippet": line.strip()[:160],
                            })
                            break  # one needle per (tech,line) is enough
    # Deduplicate by (tech, manifest, line)
    seen = set()
    deduped = []
    for h in hits:
        k = (h["tech"], h["manifest"], h["line"])
        if k in seen:
            continue
        seen.add(k)
        deduped.append(h)
    return manifests_seen, deduped


def main():
    parser = argparse.ArgumentParser(description="Brownfield Context Builder — Config Surface Collector")
    parser.add_argument("project_root", help="Project root directory")
    parser.add_argument("--output-dir", default="docs/brownfield", help="Output directory")
    args = parser.parse_args()

    root = os.path.abspath(args.project_root)
    if not os.path.isdir(root):
        print(f"Error: directory does not exist: {root}", file=sys.stderr)
        sys.exit(2)

    evidence_dir = os.path.join(root, args.output_dir, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)

    env_vars = set()
    config_files = []
    feature_flags = set()
    third_party_services = set()
    code_exts = {".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".kt", ".go", ".rb"}

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for fname in filenames:
            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, root).replace("\\", "/")
            ext = os.path.splitext(fname)[1].lower()

            # .env files
            if fname.lower() in CONFIG_FILES or fname.lower().startswith(".env"):
                config_files.append({"path": rel_path, "type": "env"})
                found_vars = parse_env_file(fpath)
                env_vars.update(found_vars)
                continue

            # Config files
            if ext in CONFIG_EXTENSIONS:
                config_files.append({"path": rel_path, "type": "config"})
                continue

            # Source code scanning
            if ext in code_exts:
                try:
                    content = Path(fpath).read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue

                # Env vars in code
                for pat in ENV_PATTERNS:
                    for m in pat.finditer(content):
                        env_vars.add(m.group(1))

                # Feature flags
                for pat in FEATURE_FLAG_PATTERNS:
                    for m in pat.finditer(content):
                        feature_flags.add(m.group(1))

                # Third-party services
                for service, pat in SERVICE_PATTERNS.items():
                    if pat.search(content):
                        third_party_services.add(service)

    result = {
        "env_vars": sorted(env_vars),
        "config_files": config_files[:100],
        "feature_flags": sorted(feature_flags),
        "third_party_services": sorted(third_party_services),
        "summary": {
            "total_env_vars": len(env_vars),
            "total_config_files": len(config_files),
            "total_feature_flags": len(feature_flags),
            "total_services": len(third_party_services),
        },
        "scan_timestamp": now_iso(),
    }

    out_path = os.path.join(evidence_dir, "config-surface.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # Mechanism 7: emit deterministic tech-stack evidence.
    manifests_seen, tech_hits = scan_tech_whitelist(root)
    techs = {}
    for h in tech_hits:
        techs.setdefault(h["tech"], []).append(h)
    strict = {
        "scan_strategy": "dependency-manifest only (pom.xml, package.json, ...)",
        "manifests_scanned": manifests_seen,
        "manifest_count": len(manifests_seen),
        "tech_count": len(techs),
        "techs": [
            {
                "tech": tech,
                "evidence_count": len(records),
                "evidence": records,
                "confidence": "high",
                "source_of_truth": "dependency-manifest",
            }
            for tech, records in sorted(techs.items())
        ],
        "notes": (
            "This file is the canonical answer for technology-stack questions in baseline "
            "synthesis. The LLM MUST NOT rename, translate, or substitute these values "
            "(e.g. RocketMQ ↔ RabbitMQ). Add a [anchor:evidence/tech-stack-strict.json#/techs/<idx>] "
            "next to every tech mention in baseline."
        ),
        "scan_timestamp": now_iso(),
    }
    strict_path = os.path.join(evidence_dir, "tech-stack-strict.json")
    with open(strict_path, "w", encoding="utf-8") as f:
        json.dump(strict, f, indent=2, ensure_ascii=False)

    print(json.dumps({
        "status": "ok",
        "env_vars": len(env_vars),
        "config_files": len(config_files),
        "feature_flags": len(feature_flags),
        "services": sorted(third_party_services),
        "tech_strict_count": len(techs),
        "techs_strict": sorted(techs.keys()),
        "output": out_path,
        "tech_strict_output": strict_path,
    }, indent=2))


if __name__ == "__main__":
    main()
