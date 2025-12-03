#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio
from pedidos_servicio.serializers import PedidoServicioDetailSerializer

# Obtener el pedido con asignaciones
pedido = PedidoServicio.objects.filter(numero_pedido='PED-0000013').first()

if pedido:
    serializer = PedidoServicioDetailSerializer(pedido)
    print("Serializer data:")
    print(json.dumps(serializer.data, indent=2, default=str))
else:
    print("Pedido no encontrado")
