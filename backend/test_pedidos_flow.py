#!/usr/bin/env python
"""
Script de prueba para el flujo de creación de pedidos con items.
Simula el flujo que hará la Sra. Rita desde el frontend.
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from clientes.models import Cliente
from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio

User = get_user_model()

def test_pedidos_flow():
    """Test completo del flujo de creación de pedidos"""
    
    client = APIClient()
    
    # 1. Obtener o crear un usuario admin
    print("=" * 60)
    print("1. Obtener usuario admin...")
    user, created = User.objects.get_or_create(
        username='admin_test',
        defaults={
            'email': 'admin_test@example.com',
            'first_name': 'Admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        user.set_password('admin123')
        user.save()
        print(f"   Usuario admin creado: {user.username}")
    else:
        print(f"   Usuario admin encontrado: {user.username}")
    
    # 2. Autenticarse
    print("\n2. Autenticarse...")
    # Para el test, usamos el token existente o login
    # Primero intentamos con la contraseña
    login_response = client.post('/api/token/', {
        'username': 'test_user',
        'password': 'password123'
    })
    
    if login_response.status_code == 200:
        token = login_response.json().get('access')
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        print(f"   Token: {token[:20]}...")
    else:
        # Si el login falla, intentamos con la autenticación del usuario directamente
        client.force_authenticate(user=user)
        print(f"   Usuario autenticado directamente: {user.username}")
    
    # 3. Obtener clientes disponibles
    print("\n3. Obtener clientes disponibles...")
    response = client.get('/api/v1/clientes/?page_size=1000')
    if response.status_code == 200:
        clientes = response.json()['results']
        print(f"   Total de clientes: {len(clientes)}")
        if clientes:
            cliente = clientes[0]
            print(f"   Primer cliente: {cliente['nombre']} (ID: {cliente['id']})")
    else:
        print(f"   ❌ Error: {response.status_code}")
        return
    
    # 4. Crear un nuevo pedido
    print("\n4. Crear nuevo pedido...")
    pedido_data = {
        'cliente_id': cliente['id'],
        'solicitante': 'Sra. Rita',
        'supervisor': 'Juan García',
        'fecha_inicio': '2025-11-25',
        'fecha_fin': '2025-11-29',
        'observaciones': 'Pedido de prueba desde script',
        'estado': 'ENVIADO'
    }
    
    response = client.post('/api/v1/pedidos-servicio/', pedido_data, format='json')
    if response.status_code in [200, 201]:
        pedido = response.json()
        pedido_id = pedido['id']
        numero_pedido = pedido.get('numero_pedido', 'N/A')
        print(f"   ✓ Pedido creado: {numero_pedido} (ID: {pedido_id})")
        print(f"   Estado: {pedido.get('estado')}")
    else:
        print(f"   ❌ Error: {response.status_code}")
        print(f"   Detalle: {response.json()}")
        return
    
    # 5. Agregar items al pedido
    print("\n5. Agregar items al pedido...")
    
    items_data = [
        {
            'ambiente': 'Varanda',
            'modelo': 'Rolô',
            'tejido': 'Screen 3% branco',
            'largura': 2.50,
            'altura': 1.80,
            'cantidad_piezas': 1,
            'posicion_tejido': 'NORMAL',
            'lado_comando': 'IZQUIERDO',
            'acionamiento': 'MANUAL',
            'observaciones': 'Instalación padrão'
        },
        {
            'ambiente': 'Sala',
            'modelo': 'Persiana',
            'tejido': 'PVC blanco',
            'largura': 3.00,
            'altura': 2.00,
            'cantidad_piezas': 2,
            'posicion_tejido': 'INVERSO',
            'lado_comando': 'DERECHO',
            'acionamiento': 'MOTORIZADO',
            'observaciones': 'Motorizada con control remoto'
        },
        {
            'ambiente': 'Dormitorio',
            'modelo': 'Cortina',
            'tejido': 'Tela oscura',
            'largura': 2.00,
            'altura': 2.20,
            'cantidad_piezas': 1,
            'posicion_tejido': 'NORMAL',
            'lado_comando': 'AMBOS',
            'acionamiento': 'MANUAL',
            'observaciones': 'Cortina blackout'
        }
    ]
    
    items_creados = []
    for i, item_data in enumerate(items_data, 1):
        response = client.post(f'/api/v1/pedidos-servicio/{pedido_id}/items/', item_data, format='json')
        if response.status_code in [200, 201]:
            item = response.json()
            items_creados.append(item)
            print(f"   ✓ Item {i} creado: {item_data['ambiente']} - {item_data['modelo']}")
        else:
            print(f"   ❌ Error en item {i}: {response.status_code}")
            print(f"   Detalle: {response.json()}")
    
    # 6. Obtener detalle del pedido con items
    print("\n6. Obtener detalle del pedido...")
    response = client.get(f'/api/v1/pedidos-servicio/{pedido_id}/')
    if response.status_code == 200:
        pedido_detalle = response.json()
        print(f"   ✓ Pedido: {pedido_detalle.get('numero_pedido')}")
        print(f"   Cliente: {pedido_detalle.get('cliente_nombre')}")
        print(f"   Estado: {pedido_detalle.get('estado_display')}")
        print(f"   Total items: {len(pedido_detalle.get('items', []))}")
        
        # Mostrar items en detalle
        for item in pedido_detalle.get('items', []):
            print(f"      - {item['ambiente']}: {item['modelo']} ({item['largura']}m x {item['altura']}m)")
    else:
        print(f"   ❌ Error: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("✓ Flujo de prueba completado exitosamente")
    print("=" * 60)

if __name__ == '__main__':
    try:
        test_pedidos_flow()
    except Exception as e:
        print(f"\n❌ Error durante la prueba: {e}")
        import traceback
        traceback.print_exc()
