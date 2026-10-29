"""Check preparation artifacts and repository hygiene without third-party packages."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    "README.md",
    "CONSTITUTION.md",
    "AGENTS.md",
    "docs/waves/P0/PLAN.md",
    "docs/README.md",
    "docs/waves/README.md",
    "docs/product/REQUIREMENTS.zh.md",
    "docs/product/changes/README.md",
    "docs/product/changes/2026-10-26.md",
    "docs/templates/requirement-change.md",
    "specs/architecture.md",
    "specs/adaptive-learning.md",
    "specs/contracts/domain.md",
    "specs/acceptance.md",
    "docs/waves/P0/state.json",
    "docs/references/upstream-baseline.json",
)
LINK = re.compile(r"\[[^\]\n]+\]\(([^)\n]+)\)")
REQUIREMENT_ID = re.compile(r"\bCC-[A-Z]+-\d{3}\b")
SECRET_PATTERNS = (
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"\b(?:ghp_|github_pat_|sk-)[A-Za-z0-9_]{20,}\b"),
    re.compile(r"https?://[^\s/:]+:[^\s/@]+@"),
)
BLOCKED_SUFFIXES = {".csv", ".xlsx", ".xls", ".db", ".sqlite", ".pem", ".key"}
BLOCKED_PARTS = {"node_modules", ".venv", "runtime", "sessions", "generated-skills"}


def repository_files() -> list[Path]:
    """Include tracked files and nonignored new files; never walk private ignored data."""
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT,
        capture_output=True,
        check=False,
    )
    if result.returncode:
        raise RuntimeError("Initialize the Git repository before running verification.")
    return sorted({ROOT / p.decode("utf-8") for p in result.stdout.split(b"\0") if p})


def check_local_links(path: Path, content: str, errors: list[str]) -> int:
    checked = 0
    for match in LINK.finditer(content):
        target = match.group(1).strip().strip("<>")
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
            continue
        relative = unquote(target.split("#", 1)[0])
        resolved = (path.parent / relative).resolve()
        if not resolved.is_relative_to(ROOT) or not resolved.is_file():
            errors.append(f"{path.relative_to(ROOT)}: invalid local file link: {relative}")
        checked += 1
    return checked


def main() -> int:
    errors: list[str] = []
    for name in REQUIRED:
        if not (ROOT / name).is_file():
            errors.append(f"Missing required artifact: {name}")
    for plan in ROOT.glob("P*-PLAN.md"):
        errors.append(f"Wave plans belong in docs/waves/<wave>/PLAN.md: {plan.name}")
    series = json.loads((ROOT / "docs/waves/P4/state.json").read_text(encoding="utf-8"))
    waves = {"P0", "P1", "P2", "P3"}
    for iteration in series["iterations"]:
        wave = iteration["waveId"]
        if not re.fullmatch(r"P\d+(?:\.\d+)?", wave):
            errors.append("Invalid wave ID in the iteration registry")
            continue
        waves.add(wave)
        if iteration.get("plan") != f"docs/waves/{wave}/PLAN.md":
            errors.append(f"Noncanonical plan path for {wave}")
    for wave in sorted(waves):
        if not (ROOT / f"docs/waves/{wave}/PLAN.md").is_file():
            errors.append(f"Missing wave plan: {wave}")
    files = repository_files()
    requirements = ROOT / "docs/product/REQUIREMENTS.zh.md"
    known_ids = set(REQUIREMENT_ID.findall(requirements.read_text(encoding="utf-8")))
    links = 0
    for path in files:
        relative = path.relative_to(ROOT)
        if path.suffix in BLOCKED_SUFFIXES or BLOCKED_PARTS.intersection(relative.parts):
            errors.append(f"Private/runtime artifact must stay outside Git: {relative}")
        if path.name in {".env", "secrets.env", "server-login.json"} or (
            path.name.startswith(".env.") and path.name != ".env.example"
        ):
            errors.append(f"Private configuration must stay outside Git: {relative}")
        if not path.is_file():
            errors.append(f"Missing or unsupported repository entry: {relative}")
            continue
        raw = path.read_bytes()
        if b"\0" in raw:
            errors.append(f"Unexpected binary file in preparation: {relative}")
            continue
        try:
            content = raw.decode("utf-8")
        except UnicodeDecodeError:
            errors.append(f"Non-UTF-8 file: {relative}")
            continue
        if b"\r" in raw or content.startswith("\ufeff"):
            errors.append(f"Use UTF-8 without BOM and LF endings: {relative}")
        if raw and not raw.endswith(b"\n"):
            errors.append(f"Missing final newline: {relative}")
        if any(line.rstrip() != line for line in content.splitlines()):
            errors.append(f"Trailing whitespace: {relative}")
        if any(pattern.search(content) for pattern in SECRET_PATTERNS):
            errors.append(f"Potential credential found; inspect privately: {relative}")
        if path.suffix == ".md":
            links += check_local_links(path, content, errors)
            unknown = set(REQUIREMENT_ID.findall(content)) - known_ids
            if unknown:
                errors.append(f"Unknown requirement references in {relative}: {sorted(unknown)}")
            if len(re.findall(r"^```", content, re.MULTILINE)) % 2:
                errors.append(f"Unbalanced fenced blocks: {relative}")
        if path.suffix in {".json", ".jsonl"}:
            chunks = content.splitlines() if path.suffix == ".jsonl" else [content]
            for number, chunk in enumerate(chunks, 1):
                try:
                    json.loads(chunk)
                except json.JSONDecodeError:
                    errors.append(f"Invalid JSON at {relative}, item {number}")
        if path.name == ".env.example":
            for line in content.splitlines():
                if re.match(r"\w*(?:KEY|PASSWORD|TOKEN)=.+", line):
                    errors.append("Credential placeholders in .env.example must be empty")

    state = json.loads((ROOT / "docs/waves/P0/state.json").read_text(encoding="utf-8"))
    if state["phase"] == "preparation":
        for field in ("executionStatus", "productAcceptanceStatus", "modelApiStatus", "deploymentStatus"):
            if state[field] not in {"not_started", "not_run"}:
                errors.append(f"Preparation state cannot claim product execution: {field}")
    for task_id in state["taskIds"]:
        if not (ROOT / f"docs/waves/P0/tasks/{task_id}.md").is_file():
            errors.append(f"Missing task packet: {task_id}")

    print(json.dumps({
        "check": "preparation-repository-only",
        "files": len(files),
        "localLinks": links,
        "requirementIds": len(known_ids),
        "errors": errors,
        "productTests": "not_run",
    }, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
