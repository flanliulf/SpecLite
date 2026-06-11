#!/usr/bin/env python3
"""
Check SpecLite Agent Skill packages.

Usage:
    python3 scripts/check_agent_skill.py <agent-dir> [<agent-dir> ...]
    python3 scripts/check_agent_skill.py --all assets/source/speclite/sdlc-skills

Exit codes:
    0: completed, even when findings are reported
    1: invalid arguments
    2: target path does not exist
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python < 3.11 fallback message
    tomllib = None


SEVERITIES = ("Critical", "Major", "Minor", "Observation")
RESIDUE_PATTERN = re.compile(r"_bmad|config\.yaml|/bmad:")
SOURCE_RUNTIME_PATTERN = re.compile(
    r"assets/source/speclite/(scripts|custom)|forge/speclite/(scripts|custom)"
)
NEW_SECTION_TITLES = [
    "[Overview（技能说明）]",
    "[Core Capabilities（核心能力）]",
    "[Workflow（执行流程）]",
    "[Notes（注意事项）]",
]
OLD_SECTION_TITLES = ["[技能说明]", "[核心能力]", "[执行流程]", "[注意事项]"]
ACTIVATION_MARKERS = [
    "resolve_customization.py",
    "--key agent",
    "{skill-root}/customize.toml",
    "{speclite-runtime-root}/custom/{skill-name}.toml",
    "{speclite-runtime-root}/custom/{skill-name}.user.toml",
    "agent.persistent_facts",
    "_speclite/config.toml",
    "agent.menu",
    "dismiss",
]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return Path.cwd()


def split_frontmatter(text: str) -> tuple[dict, str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end == -1:
        return {}, text
    raw = text[4:end]
    body = text[end + 4 :].lstrip("\n")
    data: dict[str, object] = {}
    current_map = None
    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("  ") and current_map:
            key, _, value = line.strip().partition(":")
            data.setdefault(current_map, {})[key.strip()] = clean_yaml_scalar(value)
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value == "":
            data[key] = {}
            current_map = key
        else:
            data[key] = clean_yaml_scalar(value)
            current_map = None
    return data, body


def clean_yaml_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def latest_changelog_version(path: Path) -> str | None:
    if not path.exists():
        return None
    match = re.search(r"^## \[([^\]]+)\] - \d{4}-\d{2}-\d{2}", read_text(path), re.MULTILINE)
    return match.group(1) if match else None


def load_toml(path: Path) -> tuple[dict, str | None]:
    text = read_text(path)
    if tomllib is None:
        try:
            return parse_agent_toml_subset(text), None
        except Exception as exc:  # noqa: BLE001 - report parse error to caller
            return {}, str(exc)
    try:
        with path.open("rb") as handle:
            return tomllib.load(handle), None
    except Exception as exc:  # noqa: BLE001 - report parse error to caller
        return {}, str(exc)


def parse_agent_toml_subset(text: str) -> dict:
    """Parse the limited TOML shape used by SpecLite Agent customize.toml files."""
    data: dict[str, object] = {}
    current: dict[str, object] | None = None
    lines = text.splitlines()
    index = 0

    while index < len(lines):
        raw = lines[index]
        line = raw.strip()
        index += 1
        if not line or line.startswith("#"):
            continue
        if line == "[agent]":
            data.setdefault("agent", {})
            current = data["agent"]  # type: ignore[assignment]
            continue
        if line == "[[agent.menu]]":
            agent = data.setdefault("agent", {})
            menus = agent.setdefault("menu", [])  # type: ignore[union-attr]
            item: dict[str, object] = {}
            menus.append(item)  # type: ignore[union-attr]
            current = item
            continue
        if current is None or "=" not in line:
            continue

        key, value = [part.strip() for part in line.split("=", 1)]
        if value == "[":
            values: list[str] = []
            while index < len(lines):
                item_line = lines[index].strip()
                index += 1
                if item_line.startswith("]"):
                    break
                match = re.search(r'"([^"]*)"', item_line)
                if match:
                    values.append(match.group(1))
            current[key] = values
        elif value == "[]":
            current[key] = []
        elif value.startswith("[") and value.endswith("]"):
            current[key] = re.findall(r'"([^"]*)"', value)
        else:
            current[key] = clean_yaml_scalar(value.rstrip(","))

    return data


def add_finding(findings: list[dict], severity: str, file: Path, rule: str, message: str) -> None:
    findings.append(
        {
            "severity": severity,
            "rule": rule,
            "file": str(file),
            "message": message,
        }
    )


def markdown_files(skill_dir: Path) -> list[Path]:
    return sorted(path for path in skill_dir.rglob("*.md") if path.is_file())


def resolve_prompt_path(skill_dir: Path, prompt: str) -> Path | None:
    match = re.search(r"\{skill-root\}/([^\s`\"']+)", prompt)
    if not match:
        return None
    return skill_dir / match.group(1).rstrip(".,)")


def target_skill_exists(repo_root: Path, skill_name: str) -> bool:
    search_root = repo_root / "assets" / "source" / "speclite"
    if not search_root.exists():
        return False
    return any(search_root.glob(f"**/{skill_name}/SKILL.md"))


def inspect_agent(skill_dir: Path, repo_root: Path) -> dict:
    findings: list[dict] = []
    skill_dir = skill_dir.resolve()
    skill_name = skill_dir.name
    skill_md = skill_dir / "SKILL.md"
    skill_en = skill_dir / "SKILL.en.md"
    changelog = skill_dir / "CHANGELOG.md"
    customize = skill_dir / "customize.toml"

    if not skill_md.exists():
        add_finding(findings, "Critical", skill_md, "FILE-01", "Missing SKILL.md.")
        return result_for(skill_dir, findings)
    if not changelog.exists():
        add_finding(findings, "Major", changelog, "FILE-02", "Missing CHANGELOG.md.")
    if not customize.exists():
        add_finding(findings, "Critical", customize, "AGENT-01", "Missing customize.toml.")

    skill_text = read_text(skill_md)
    frontmatter, body = split_frontmatter(skill_text)
    metadata = frontmatter.get("metadata", {}) if isinstance(frontmatter.get("metadata"), dict) else {}

    if frontmatter.get("name") != skill_name:
        add_finding(
            findings,
            "Major",
            skill_md,
            "YML-01",
            f"name must match directory basename {skill_name!r}.",
        )
    if metadata.get("catalog") != "speclite":
        add_finding(findings, "Major", skill_md, "YML-02", "metadata.catalog must be speclite.")
    if not metadata.get("author"):
        add_finding(findings, "Minor", skill_md, "VER-01", "metadata.author is missing or empty.")

    changelog_version = latest_changelog_version(changelog)
    if changelog.exists() and metadata.get("version") != changelog_version:
        add_finding(
            findings,
            "Major",
            skill_md,
            "VER-02",
            f"metadata.version {metadata.get('version')!r} does not match latest CHANGELOG version {changelog_version!r}.",
        )

    missing_new_sections = [title for title in NEW_SECTION_TITLES if title not in body]
    if missing_new_sections:
        if all(title in body for title in OLD_SECTION_TITLES):
            add_finding(
                findings,
                "Minor",
                skill_md,
                "BODY-01",
                "Uses legacy section titles; update to English（中文） section titles.",
            )
        else:
            add_finding(
                findings,
                "Major",
                skill_md,
                "BODY-01",
                "Missing required Agent Skill sections: " + ", ".join(missing_new_sections),
            )

    for marker in ACTIVATION_MARKERS:
        if marker not in body:
            add_finding(
                findings,
                "Major",
                skill_md,
                "ACT-01",
                f"Activation flow does not mention required marker: {marker}.",
            )

    root_markdown = [
        path.name
        for path in skill_dir.glob("*.md")
        if path.name not in {"SKILL.md", "SKILL.en.md", "CHANGELOG.md"}
    ]
    if root_markdown:
        add_finding(
            findings,
            "Major",
            skill_dir,
            "FILE-03",
            "Root Markdown files must move to references/ or assets/: " + ", ".join(sorted(root_markdown)),
        )

    if customize.exists():
        inspect_customize(customize, skill_dir, repo_root, findings)

    if skill_en.exists():
        inspect_english_entry(skill_md, skill_en, findings)

    inspect_residue(skill_dir, findings)
    return result_for(skill_dir, findings)


def inspect_customize(customize: Path, skill_dir: Path, repo_root: Path, findings: list[dict]) -> None:
    data, error = load_toml(customize)
    if error:
        add_finding(findings, "Critical", customize, "AGENT-02", f"Unable to parse TOML: {error}")
        return

    agent = data.get("agent")
    if not isinstance(agent, dict):
        add_finding(findings, "Critical", customize, "AGENT-03", "customize.toml must contain [agent].")
        return
    if "workflow" in data:
        add_finding(findings, "Major", customize, "AGENT-04", "Agent package must not use [workflow] as main customization.")

    required_scalars = ["name", "title", "role", "identity", "communication_style"]
    for field in required_scalars:
        if not isinstance(agent.get(field), str) or not agent.get(field, "").strip():
            add_finding(findings, "Major", customize, "AGENT-05", f"Missing or empty agent.{field}.")
    if not agent.get("icon"):
        add_finding(findings, "Minor", customize, "AGENT-06", "agent.icon is missing.")

    for field in ["principles", "persistent_facts", "activation_steps_prepend", "activation_steps_append"]:
        if not isinstance(agent.get(field), list):
            add_finding(findings, "Major", customize, "AGENT-07", f"agent.{field} must be an array.")
    if isinstance(agent.get("principles"), list) and not agent.get("principles"):
        add_finding(findings, "Major", customize, "AGENT-08", "agent.principles must not be empty.")

    menus = agent.get("menu", [])
    if menus is None:
        menus = []
    if not isinstance(menus, list):
        add_finding(findings, "Major", customize, "MENU-01", "agent.menu must be an array of tables.")
        return

    seen_codes: set[str] = set()
    for index, item in enumerate(menus, start=1):
        if not isinstance(item, dict):
            add_finding(findings, "Major", customize, "MENU-02", f"menu item #{index} must be a table.")
            continue
        code = item.get("code")
        if not isinstance(code, str) or not code.strip():
            add_finding(findings, "Major", customize, "MENU-03", f"menu item #{index} missing code.")
        elif code in seen_codes:
            add_finding(findings, "Major", customize, "MENU-04", f"duplicate menu code {code!r}.")
        else:
            seen_codes.add(code)

        if not isinstance(item.get("description"), str) or not item.get("description", "").strip():
            add_finding(findings, "Minor", customize, "MENU-05", f"menu item {code or index!r} missing description.")

        has_skill = bool(item.get("skill"))
        has_prompt = bool(item.get("prompt"))
        if has_skill == has_prompt:
            add_finding(
                findings,
                "Major",
                customize,
                "MENU-06",
                f"menu item {code or index!r} must contain exactly one of skill or prompt.",
            )
            continue
        if has_skill:
            target = str(item["skill"])
            if target.startswith("bmad-"):
                add_finding(findings, "Major", customize, "MENU-07", f"menu target still points to {target!r}.")
            elif not target_skill_exists(repo_root, target):
                add_finding(findings, "Major", customize, "MENU-08", f"menu target {target!r} was not found.")
        if has_prompt:
            prompt = str(item["prompt"])
            prompt_path = resolve_prompt_path(skill_dir, prompt)
            if prompt_path is None:
                add_finding(
                    findings,
                    "Major",
                    customize,
                    "MENU-09",
                    f"prompt for menu item {code or index!r} does not contain a resolvable {{skill-root}} path.",
                )
            elif not prompt_path.exists():
                add_finding(
                    findings,
                    "Major",
                    customize,
                    "MENU-10",
                    f"prompt file does not exist: {prompt_path.relative_to(skill_dir)}.",
                )


def inspect_english_entry(skill_md: Path, skill_en: Path, findings: list[dict]) -> None:
    source_fm, _ = split_frontmatter(read_text(skill_md))
    english_fm, english_body = split_frontmatter(read_text(skill_en))
    source_metadata = source_fm.get("metadata", {}) if isinstance(source_fm.get("metadata"), dict) else {}
    english_metadata = english_fm.get("metadata", {}) if isinstance(english_fm.get("metadata"), dict) else {}

    for key in ["name", "allowed-tools"]:
        if source_fm.get(key) != english_fm.get(key):
            add_finding(findings, "Major", skill_en, "EN-01", f"{key} differs from SKILL.md.")
    for key in ["version", "catalog"]:
        if source_metadata.get(key) != english_metadata.get(key):
            add_finding(findings, "Major", skill_en, "EN-02", f"metadata.{key} differs from SKILL.md.")
    for residue in ["_bmad", "config.yaml", "/bmad:"]:
        if residue in english_body:
            add_finding(findings, "Critical", skill_en, "EN-03", f"English entry contains runtime residue: {residue}.")


def inspect_residue(skill_dir: Path, findings: list[dict]) -> None:
    for path in markdown_files(skill_dir) + sorted(skill_dir.glob("*.toml")):
        text = read_text(path)
        if path.name == "CHANGELOG.md":
            continue
        if RESIDUE_PATTERN.search(text):
            add_finding(
                findings,
                "Critical",
                path,
                "RUNTIME-01",
                "Current instructions contain BMad runtime residue.",
            )
        if SOURCE_RUNTIME_PATTERN.search(text):
            add_finding(
                findings,
                "Major",
                path,
                "RUNTIME-02",
                "Current instructions appear to use source directories as runtime dependencies.",
            )


def result_for(skill_dir: Path, findings: list[dict]) -> dict:
    summary = {severity: 0 for severity in SEVERITIES}
    for finding in findings:
        summary[finding["severity"]] += 1
    return {
        "skill_dir": str(skill_dir),
        "status": "fail" if summary["Critical"] or summary["Major"] else "pass_with_warnings" if summary["Minor"] else "pass",
        "summary": summary,
        "findings": findings,
    }


def discover_agents(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("speclite-agent-*")
        if path.is_dir() and (path / "SKILL.md").exists()
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Check SpecLite Agent Skill packages.")
    parser.add_argument("targets", nargs="*", help="Agent Skill directories")
    parser.add_argument("--all", dest="all_root", help="Scan all speclite-agent-* directories under this root")
    args = parser.parse_args()

    if bool(args.all_root) == bool(args.targets):
        print("error: provide either target directories or --all <root>", file=sys.stderr)
        return 1

    repo_root = find_repo_root(Path.cwd())
    if args.all_root:
        root = Path(args.all_root)
        if not root.exists():
            print(f"error: target path does not exist: {root}", file=sys.stderr)
            return 2
        targets = discover_agents(root)
    else:
        targets = [Path(target) for target in args.targets]
        for target in targets:
            if not target.exists():
                print(f"error: target path does not exist: {target}", file=sys.stderr)
                return 2

    results = [inspect_agent(target, repo_root) for target in targets]
    aggregate = {severity: sum(result["summary"][severity] for result in results) for severity in SEVERITIES}
    output = {
        "checked": len(results),
        "aggregate": aggregate,
        "results": results,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
