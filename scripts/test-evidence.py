"""Capture genuine command output outside Git with timestamp and exit status."""
import datetime
import json
import os
from pathlib import Path
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
label = sys.argv[1]
command = sys.argv[2:]
root = Path(__file__).resolve().parents[1]
directory = root.parent / '.ccagent-support' / 'evidence' / 'tests'
directory.mkdir(parents=True, exist_ok=True)
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
result = subprocess.run(command, cwd=root, capture_output=True, text=True, encoding='utf-8', errors='replace', shell=os.name == 'nt')
record = dict(label=label, startedAt=started, finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), command=command, exitCode=result.returncode, stdout=result.stdout, stderr=result.stderr)
(directory / f'{label}.json').write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
print(result.stdout)
print(result.stderr)
print(json.dumps(dict(label=label, exitCode=result.returncode)))
sys.exit(result.returncode)
