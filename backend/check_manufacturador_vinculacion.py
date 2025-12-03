#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from pedidos_servicio.models import PedidoServicio

User = get_user_model()

# Verificar usuarios manufacturadores
print("\n" + "="*70)
print("VERIFICACIÓN DE USUARIOS MANUFACTURADORES")
print("="*70 + "\n")

manufacturadores = User.objects.filter(groups__name='manufacturador')
print(f"Total manufacturadores: {manufacturadores.count()}\n")

for user in manufacturadores:
    print(f"Usuario: {user.username} (ID: {user.id})")
    print(f"  Nombre: {user.first_name} {user.last_name}")
    print(f"  Email: {user.email}")
    print(f"  Grupos: {[g.name for g in user.groups.all()]}")
    
    # Verificar vinculación con Manufactura
    if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
        print(f"  ✅ Manufactura ID: {user.personal_manufactura.id}")
        print(f"     Cargo: {user.personal_manufactura.cargo}")
        print(f"     Nombre: {user.personal_manufactura.nombre} {user.personal_manufactura.apellido}")
    else:
        print(f"  ❌ NO tiene personal_manufactura vinculado")
    
    # Verificar permisos
    permisos_cambio = [
        'pedidos_servicio.can_change_to_aceptado',
        'pedidos_servicio.can_change_to_en_fabricacion',
        'pedidos_servicio.can_change_to_listo_instalar',
        'pedidos_servicio.can_change_to_rechazado',
    ]
    print(f"  Permisos de cambio de estado:")
    for perm in permisos_cambio:
        tiene = user.has_perm(perm)
        status = "✅" if tiene else "❌"
        print(f"    {status} {perm}")
    
    print()

# Verificar pedidos
print("\n" + "="*70)
print("PEDIDOS EN LA BASE DE DATOS")
print("="*70 + "\n")

pedidos = PedidoServicio.objects.all()
print(f"Total pedidos: {pedidos.count()}\n")

for pedido in pedidos:
    print(f"Pedido: {pedido.numero_pedido} (ID: {pedido.id})")
    print(f"  Estado: {pedido.estado}")
    print(f"  Creado por: {pedido.usuario_creacion.username if pedido.usuario_creacion else 'N/A'}")
    
    if pedido.manufacturador:
        print(f"  Manufacturador: {pedido.manufacturador.nombre} {pedido.manufacturador.apellido} (ID: {pedido.manufacturador.id})")
    else:
        print(f"  Manufacturador: NO ASIGNADO")
    
    if pedido.instalador:
        print(f"  Instalador: {pedido.instalador.nombre} {pedido.instalador.apellido} (ID: {pedido.instalador.id})")
    else:
        print(f"  Instalador: NO ASIGNADO")
    
    print()

print("="*70 + "\n")
