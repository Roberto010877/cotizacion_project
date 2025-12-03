#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from core.models import User
from clientes.models import Cliente
from manufactura.models import Manufactura
from pedidos_servicio.models import PedidoServicio, AsignacionTarea
from common.models import Pais

# Create test data
try:
    # Get or create admin user
    admin_user = User.objects.get(username='admin')
    
    # Get or create a cliente - use existing if available
    existing_clientes = Cliente.objects.all()
    if existing_clientes.exists():
        cliente = existing_clientes.first()
        print(f"✓ Using existing client: {cliente.nombre}")
    else:
        # Get a country
        pais = Pais.objects.first()
        if not pais:
            print("✗ No countries available in database")
            exit(1)
        
        cliente = Cliente.objects.create(
            nombre='Cliente Prueba',
            email='cliente@test.com',
            pais=pais
        )
        print(f"✓ Cliente creado: {cliente.nombre}")
    
    # Create a PedidoServicio
    pedido = PedidoServicio.objects.create(
        numero_pedido='PED-001-2025',
        cliente=cliente,
        descripcion='Instalación de sistema de climatización en salón principal',
        estado='PENDIENTE',
        fecha_inicio=datetime.now(),
        fecha_fin=datetime.now() + timedelta(days=7),
        valor_total=5000000,
        observaciones='Cliente requiere instalación urgente',
        creado_por=admin_user
    )
    
    print(f"✓ Pedido creado: {pedido.numero_pedido}")
    
    # Try to get an Instalador
    try:
        instalador = Manufactura.objects.first()
        if instalador:
            # Create AsignacionTarea
            tarea = AsignacionTarea.objects.create(
                pedido=pedido,
                instalador=instalador,
                tipo_tarea='INSTALACION',
                estado='PENDIENTE',
                descripcion_tarea='Instalación completa del sistema',
                fecha_entrega_esperada=datetime.now() + timedelta(days=7)
            )
            print(f"✓ Tarea asignada: {tarea.id}")
        else:
            print("⚠ No hay instaladores disponibles")
    except Exception as e:
        print(f"⚠ Error al crear tarea: {e}")
    
    print(f"✓ Total PedidoServicio: {PedidoServicio.objects.count()}")
    print(f"✓ Total AsignacionTarea: {AsignacionTarea.objects.count()}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
