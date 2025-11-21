#!/usr/bin/env python
"""Test script para crear un pedido de servicio"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from clientes.models import Cliente
from instaladores.models import Instalador
import json

User = get_user_model()

# Obtener primer cliente existente
cliente = Cliente.objects.first()
if not cliente:
    print("❌ ERROR: No hay clientes en la base de datos")
    sys.exit(1)

# Obtener instalador
instalador = Instalador.objects.first()

# Crear usuario de prueba
user, _ = User.objects.get_or_create(
    username='testuser',
    defaults={
        'email': 'testuser@test.com',
        'is_staff': True,
    }
)

# Crear cliente API
client = APIClient()

# Obtener token (si es necesario)
# response = client.post('/api/token/', {'username': 'testuser', 'password': 'test'}, format='json')
# token = response.data['access']
# client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

# Forzar autenticación
client.force_authenticate(user=user)

# Datos del pedido
payload = {
    "cliente_id": cliente.id,
    "solicitante": "Sra. Rita",
    "colaborador_id": instalador.id if instalador else None,
    "supervisor": "Juan Supervisor",
    "fecha_inicio": "2025-01-15",
    "fecha_fin": "2025-01-20",
    "observaciones": "Test pedido desde script",
    "items_data": [
        {
            "ambiente": "Dormitorio Principal",
            "modelo": "Motorizada Z-Wave",
            "tejido": "Blackout 100%",
            "largura": 2.5,
            "altura": 1.8,
            "cantidad_piezas": 1,
            "posicion_tejido": "NORMAL",
            "lado_comando": "DERECHO",
            "acionamiento": "MOTORIZADO",
            "observaciones": "Item de prueba 1"
        },
        {
            "ambiente": "Sala",
            "modelo": "Manual Standard",
            "tejido": "Sheer 50%",
            "largura": 3.0,
            "altura": 2.0,
            "cantidad_piezas": 2,
            "posicion_tejido": "INVERTIDA",
            "lado_comando": "IZQUIERDO",
            "acionamiento": "MANUAL",
            "observaciones": "Item de prueba 2"
        }
    ]
}

print("=" * 70)
print("TEST: Crear Pedido de Servicio")
print("=" * 70)
print(f"\n📋 Datos del payload:")
print(json.dumps(payload, indent=2, ensure_ascii=False))

print(f"\n📤 Enviando POST a /api/v1/pedidos-servicio/...")

response = client.post('/api/v1/pedidos-servicio/', payload, format='json')

print(f"\n✓ Status Code: {response.status_code}")

if response.status_code in [200, 201]:
    print("\n✅ ¡ÉXITO!")
    print(f"\n📊 Response data:")
    print(json.dumps(response.data, indent=2, ensure_ascii=False))
else:
    print("\n❌ ERROR")
    print(f"\n📊 Response data:")
    print(json.dumps(response.data, indent=2, ensure_ascii=False))

print("\n" + "=" * 70)
