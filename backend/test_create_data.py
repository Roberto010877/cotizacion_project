#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from clientes.models import Cliente
from manufactura.models import Manufactura
from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio, AsignacionTarea
from common.models import Pais
from datetime import date, timedelta

# Obtener o crear país (Argentina)
pais, _ = Pais.objects.get_or_create(codigo='AR', defaults={'nombre': 'Argentina'})

# Crear cliente
cliente = Cliente.objects.create(
    pais=pais,
    nombre="Test Cliente",
    numero_documento="12345678",
    email="cliente@test.com",
    telefono="1122334455"
)

# Crear instaladores
instalador1, _ = Manufactura.objects.get_or_create(
    documento="98765432",
    defaults={
        'nombre': 'Diego',
        'apellido': 'Pérez',
        'email': 'diego@test.com',
        'telefono': '1198765432'
    }
)

instalador2, _ = Manufactura.objects.get_or_create(
    documento="87654321",
    defaults={
        'nombre': 'João',
        'apellido': 'Silva',
        'email': 'joao@test.com',
        'telefono': '1187654321'
    }
)

# Crear pedido
print("Creando pedido...")
print(f"PedidoServicio fields: {[f.name for f in PedidoServicio._meta.get_fields()]}")

pedido = PedidoServicio(
    cliente=cliente,
    solicitante="Rita",
    supervisor="Juan",
    fecha_inicio=date.today(),
    fecha_fin=date.today() + timedelta(days=7),
    estado='ACEPTADO'
)

print(f"Pedido instance dict: {pedido.__dict__}")
print("Attempting save...")
pedido.save()
print(f"✓ Pedido creado: {pedido.numero_pedido}")

# Crear item
item = ItemPedidoServicio.objects.create(
    pedido_servicio=pedido,
    numero_item=1,
    ambiente="Varanda",
    modelo="Rolô",
    tejido="Screen 3% branco",
    largura=2.5,
    altura=1.8,
    acionamiento="MANUAL",
    lado_comando="DERECHO",
    cantidad_piezas=1
)

# Crear asignaciones
asign_fab = AsignacionTarea.objects.create(
    pedido=pedido,
    instalador=instalador1,
    tipo_tarea='FABRICACION'
)

asign_inst = AsignacionTarea.objects.create(
    pedido=pedido,
    instalador=instalador2,
    tipo_tarea='INSTALACION'
)

print(f"✓ Cliente: {cliente.nombre}")
print(f"✓ Items: {pedido.items.count()}")
print(f"✓ Asignaciones: {pedido.asignaciones.count()}")
