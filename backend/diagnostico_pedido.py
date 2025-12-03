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
from manufactura.models import Manufactura

User = get_user_model()

print("\n" + "="*70)
print("DIAGNÓSTICO DE PEDIDO Y USUARIO")
print("="*70 + "\n")

# Usuario Andrés Pérez
try:
    user = User.objects.get(id=26)
    print(f"👤 USUARIO:")
    print(f"  ID: {user.id}")
    print(f"  Username: {user.username}")
    print(f"  Nombre: {user.first_name} {user.last_name}")
    print(f"  Grupos: {[g.name for g in user.groups.all()]}")
    
    # Verificar manufactura vinculada
    if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
        manuf = user.personal_manufactura
        print(f"\n  ✅ Manufactura vinculada:")
        print(f"     ID: {manuf.id}")
        print(f"     Cargo: {manuf.cargo}")
        print(f"     Nombre: {manuf.nombre} {manuf.apellido}")
    else:
        print(f"\n  ❌ SIN manufactura vinculada")
    
    # Verificar permisos
    print(f"\n  📋 Permisos:")
    permisos = [
        'pedidos_servicio.view_pedidoservicio',
        'pedidos_servicio.can_change_to_aceptado',
    ]
    for perm in permisos:
        tiene = user.has_perm(perm)
        status = "✅" if tiene else "❌"
        print(f"     {status} {perm}")
    
except User.DoesNotExist:
    print("❌ Usuario con ID 26 no existe")

print("\n" + "="*70)

# Pedido ID 1
try:
    pedido = PedidoServicio.objects.get(id=1)
    print(f"\n📦 PEDIDO:")
    print(f"  ID: {pedido.id}")
    print(f"  Número: {pedido.numero_pedido}")
    print(f"  Estado: {pedido.estado}")
    print(f"  Creado por: {pedido.usuario_creacion.username if pedido.usuario_creacion else 'N/A'}")
    
    if pedido.manufacturador:
        print(f"\n  🏭 Manufacturador asignado:")
        print(f"     Manufactura ID: {pedido.manufacturador.id}")
        print(f"     Nombre: {pedido.manufacturador.nombre} {pedido.manufacturador.apellido}")
        if pedido.manufacturador.usuario:
            print(f"     Usuario vinculado: {pedido.manufacturador.usuario.username} (ID: {pedido.manufacturador.usuario.id})")
        else:
            print(f"     ❌ SIN usuario vinculado")
    else:
        print(f"\n  ❌ Sin manufacturador asignado")
    
    if pedido.instalador:
        print(f"\n  🔧 Instalador asignado:")
        print(f"     Manufactura ID: {pedido.instalador.id}")
        print(f"     Nombre: {pedido.instalador.nombre} {pedido.instalador.apellido}")
        if pedido.instalador.usuario:
            print(f"     Usuario vinculado: {pedido.instalador.usuario.username} (ID: {pedido.instalador.usuario.id})")
    
    # Verificar si el usuario puede modificar este pedido
    print(f"\n  🔍 VERIFICACIÓN DE AUTORIZACIÓN:")
    if user.is_superuser:
        print(f"     ✅ Usuario es superusuario")
    elif hasattr(user, 'personal_manufactura') and user.personal_manufactura:
        personal = user.personal_manufactura
        print(f"     Usuario manufactura ID: {personal.id}")
        print(f"     Pedido manufacturador ID: {pedido.manufacturador.id if pedido.manufacturador else 'N/A'}")
        print(f"     Pedido instalador ID: {pedido.instalador.id if pedido.instalador else 'N/A'}")
        
        if pedido.manufacturador and pedido.manufacturador.id == personal.id:
            print(f"     ✅ Usuario ES el manufacturador asignado")
        elif pedido.instalador and pedido.instalador.id == personal.id:
            print(f"     ✅ Usuario ES el instalador asignado")
        else:
            print(f"     ❌ Usuario NO está asignado a este pedido")
    
except PedidoServicio.DoesNotExist:
    print("❌ Pedido con ID 1 no existe")

print("\n" + "="*70 + "\n")
