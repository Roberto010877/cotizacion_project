#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio
from pedidos_servicio.serializers import PedidoServicioListSerializer

pedido = PedidoServicio.objects.last()
if pedido:
    print(f"Pedido ID: {pedido.id}")
    print(f"Estado: '{pedido.estado}'")
    print(f"Estado Display: {pedido.get_estado_display()}")
    print(f"\nSerialized data:")
    serializer = PedidoServicioListSerializer(pedido)
    import json
    print(json.dumps(serializer.data, indent=2, ensure_ascii=False))
else:
    print("No pedidos found")
