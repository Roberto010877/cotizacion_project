#!/usr/bin/env python
import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from pedidos_servicio.models import PedidoServicio

User = get_user_model()

print("\n" + "="*70)
print("SIMULACIÓN DEL CÓDIGO DE cambiar_estado")
print("="*70 + "\n")

user = User.objects.get(id=26)
pedido = PedidoServicio.objects.get(id=1)

print(f"Usuario: {user.username}")
print(f"Pedido: {pedido.numero_pedido}")
print(f"Estado actual: {pedido.estado}")
print(f"Nuevo estado: ACEPTADO\n")

# Verificar permiso
nuevo_estado = 'ACEPTADO'
permiso_requerido = 'pedidos_servicio.can_change_to_aceptado'
tiene_permiso = user.has_perm(permiso_requerido)
print(f"¿Tiene permiso {permiso_requerido}? {tiene_permiso}")

# Verificar si es Comercial
es_comercial = user.groups.filter(name='Comercial').exists()
print(f"¿Es Comercial? {es_comercial}")

# Verificar asignación
print(f"\nVerificación de asignación:")
try:
    personal = user.personal_manufactura
    print(f"  personal_manufactura ID: {personal.id}")
    print(f"  pedido.manufacturador ID: {pedido.manufacturador.id if pedido.manufacturador else None}")
    print(f"  pedido.instalador ID: {pedido.instalador.id if pedido.instalador else None}")
    
    # La comparación que hace el código
    if pedido.manufacturador != personal and pedido.instalador != personal:
        print(f"\n  ❌ RECHAZADO: El usuario NO está asignado")
        print(f"     pedido.manufacturador != personal: {pedido.manufacturador != personal}")
        print(f"     pedido.instalador != personal: {pedido.instalador != personal}")
    else:
        print(f"\n  ✅ APROBADO: El usuario está asignado")
        
except Exception as e:
    print(f"  ❌ ERROR: {type(e).__name__}: {e}")
    # Si no tiene personal_manufactura y no es admin, no puede modificar
    if not user.groups.filter(name='Comercial').exists():
        print(f"  ❌ RECHAZADO: Usuario sin manufactura asignada")

print("\n" + "="*70 + "\n")
