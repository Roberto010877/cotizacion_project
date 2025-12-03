#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from pedidos_servicio.models import PedidoServicio, AsignacionTarea
from manufactura.models import Manufactura
from clientes.models import Cliente

# Obtener o crear datos necesarios
cliente = Cliente.objects.first()
instalador = Manufactura.objects.first()

if not cliente or not instalador:
    print("❌ No hay clientes o manufactura disponibles")
    sys.exit(1)

# Crear un nuevo pedido de prueba
print(f"Creando pedido de prueba...")
pedido = PedidoServicio.objects.create(
    cliente=cliente,
    solicitante="Test Solicitante",
    supervisor="Test Supervisor",
    estado='ENVIADO'
)

print(f"✅ Pedido creado: {pedido.numero_pedido}")

# Crear asignaciones
print(f"Creando asignaciones...")
asignacion_fab = AsignacionTarea.objects.create(
    pedido=pedido,
    instalador=instalador,
    tipo_tarea='FABRICACION'
)

asignacion_inst = AsignacionTarea.objects.create(
    pedido=pedido,
    instalador=instalador,
    tipo_tarea='INSTALACION'
)

print(f"✅ Asignaciones creadas")

# Ahora obtener el token y hacer la petición
response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    data={'username': 'admin', 'password': 'admin123'}
)

if response.status_code != 200:
    print(f"❌ Error obteniendo token: {response.status_code}")
    sys.exit(1)

token = response.json()['access']

# Obtener el pedido con los nuevos campos
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
    f'http://127.0.0.1:8000/api/v1/pedidos-servicio/{pedido.id}/',
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print("\n✅ Campos devueltos en el pedido:")
    print(json.dumps({
        'numero_pedido': data.get('numero_pedido'),
        'fabricador_nombre': data.get('fabricador_nombre'),
        'fabricador_id': data.get('fabricador_id'),
        'instalador_nombre': data.get('instalador_nombre'),
        'instalador_id': data.get('instalador_id'),
    }, indent=2))
    
    if data.get('fabricador_id') and data.get('instalador_id'):
        print("\n✅ Los IDs se están devolviendo correctamente!")
    else:
        print("\n❌ Los IDs NO se están devolviendo")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

# Limpiar
print("\nLimpiando datos de prueba...")
asignacion_fab.delete()
asignacion_inst.delete()
pedido.delete()
print("✅ Datos de prueba eliminados")
