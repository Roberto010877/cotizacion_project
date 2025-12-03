#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio, AsignacionTarea

# Verificar último pedido
pedido = PedidoServicio.objects.last()
if pedido:
    print(f"Último Pedido: {pedido.numero_pedido}")
    print(f"Asignaciones: {pedido.asignaciones.count()}")
    for asig in pedido.asignaciones.all():
        print(f"  - {asig.tipo_tarea}: {asig.instalador.get_full_name()}")
else:
    print("No hay pedidos")

# Verificar todas las asignaciones
print(f"\nTotal Asignaciones en DB: {AsignacionTarea.objects.count()}")
for asig in AsignacionTarea.objects.all():
    print(f"  - {asig.pedido.numero_pedido}: {asig.tipo_tarea} - {asig.instalador.get_full_name()}")
