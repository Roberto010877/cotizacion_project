#!/usr/bin/env python
import os
import django
import sqlite3
from pathlib import Path

# Remove db.sqlite3
db_path = Path("db.sqlite3")
if db_path.exists():
    try:
        db_path.unlink()
        print("✓ BD eliminada")
    except Exception as e:
        print(f"Error eliminando BD: {e}")

# Now run migrate
import subprocess
result = subprocess.run(
    ["C:/Users/Roberto/Envs/cotidomo_env/Scripts/python.exe", "manage.py", "migrate", "--no-input"],
    cwd=str(Path(__file__).parent)
)
print(f"Migrate exit code: {result.returncode}")
