#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.db import connection
from django.db.migrations.recorder import MigrationRecorder

# Delete pedidos_servicio migrations from the history
recorder = MigrationRecorder(connection)

# Get all recorded migrations
migrations_to_delete = recorder.Migration.objects.filter(app='pedidos_servicio')
count = migrations_to_delete.count()
migrations_to_delete.delete()

print(f"✓ Deleted {count} migration records for pedidos_servicio")

# Now run the migration
from django.core.management import call_command
call_command('migrate', 'pedidos_servicio', verbosity=1)
print("✓ Migration applied successfully!")
