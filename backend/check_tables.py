#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'pedidos_servicio%'")
tables = cursor.fetchall()
print(f"✓ Tablas de pedidos_servicio: {tables}")

# Also check if tables have data
from pedidos_servicio.models import PedidoServicio, AsignacionTarea

print(f"✓ PedidoServicio count: {PedidoServicio.objects.count()}")
print(f"✓ AsignacionTarea count: {AsignacionTarea.objects.count()}")
