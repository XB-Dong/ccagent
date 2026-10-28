"""Reject accidental private deployment data in public tracked files."""

import ipaddress
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
IPV4 = re.compile(r"(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])")
EXAMPLES = [ipaddress.ip_network(value) for value in
            ["127.0.0.0/8", "192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24"]]
PERSONAL_PATH = re.compile(r"[A-Za-z]:[/\\](?:Users|project)[/\\]", re.I)
KEY = re.compile(r"\b(?:ghp_|github_pat_|sk-)[A-Za-z0-9_]{20,}\b")


def inspect_text(content: str) -> set[str]:
    issues = set()
    for match in IPV4.finditer(content):
        try:
            address = ipaddress.ip_address(match.group())
        except ValueError:
            continue
        if not address.is_unspecified and not any(address in network for network in EXAMPLES):
            issues.add("non-example IP address")
    if PERSONAL_PATH.search(content):
        issues.add("personal absolute path")
    if KEY.search(content):
        issues.add("possible credential")
    return issues


def main() -> int:
    names = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=ROOT
    ).split(b"\0")
    errors = []
    for name in sorted(set(names) - {b""}):
        path = ROOT / name.decode("utf-8")
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for issue in sorted(inspect_text(text)):
            errors.append({"file": name.decode("utf-8"), "issue": issue})
    state = json.loads((ROOT / "docs/waves/P4/state.json").read_text(encoding="utf-8"))
    if state.get("feedbackRevisions") or state.get("pendingFeedbackCheck"):
        errors.append({"file": "docs/waves/P4/state.json", "issue": "private feedback registry"})
    print(json.dumps({"check": "public-source-privacy", "errors": errors}, indent=2))
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
