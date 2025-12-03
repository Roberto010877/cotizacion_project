#!/usr/bin/env python
import os
import django
import shutil
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")

# Remove old DB
db_path = Path("db.sqlite3")
if db_path.exists():
    db_path.unlink()
    print("✓ BD eliminada")

# Get backend root
backend_root = Path(__file__).parent

# Remove django_migrations tables by recreating DB
# Simply run migrate
os.system(f'cd "{backend_root}" && C:/Users/Roberto/Envs/cotidomo_env/Scripts/python.exe manage.py migrate --no-input')
