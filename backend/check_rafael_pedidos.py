import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import User
from pedidos_servicio.models import PedidoServicio

# Obtener usuario Rafael Mendoza
try:
    user = User.objects.get(id=4)
    print(f"Usuario: {user.get_full_name()} ({user.username})")
    print(f"Email: {user.email}")
    print(f"Grupos: {', '.join([g.name for g in user.groups.all()])}")
    print("="*60)
    
    # Pedidos como creador
    pedidos_creados = PedidoServicio.objects.filter(usuario_creacion=user)
    print(f"\nPedidos como CREADOR (usuario_creacion): {pedidos_creados.count()}")
    if pedidos_creados.exists():
        for p in pedidos_creados:
            cliente = p.cliente.nombre if p.cliente else "Sin cliente"
            print(f"  - {p.numero_pedido} | {cliente} | {p.get_estado_display()}")
    
    # Pedidos como manufacturador
    pedidos_manuf = PedidoServicio.objects.filter(manufacturador__usuario=user)
    print(f"\nPedidos como MANUFACTURADOR: {pedidos_manuf.count()}")
    if pedidos_manuf.exists():
        for p in pedidos_manuf:
            cliente = p.cliente.nombre if p.cliente else "Sin cliente"
            print(f"  - {p.numero_pedido} | {cliente} | {p.get_estado_display()}")
    
    # Pedidos como instalador
    pedidos_inst = PedidoServicio.objects.filter(instalador__usuario=user)
    print(f"\nPedidos como INSTALADOR: {pedidos_inst.count()}")
    if pedidos_inst.exists():
        for p in pedidos_inst:
            cliente = p.cliente.nombre if p.cliente else "Sin cliente"
            print(f"  - {p.numero_pedido} | {cliente} | {p.get_estado_display()}")
    
    # Total
    total = pedidos_creados.count() + pedidos_manuf.count() + pedidos_inst.count()
    print("="*60)
    print(f"TOTAL PEDIDOS RELACIONADOS: {total}")
    
    # Verificar si tiene personal de manufactura vinculado
    if hasattr(user, 'personal_manufactura'):
        print(f"\nPersonal de manufactura vinculado: SÍ")
        print(f"  - Cargo: {user.personal_manufactura.get_cargo_display()}")
        print(f"  - Estado: {user.personal_manufactura.get_estado_display()}")
    else:
        print(f"\nPersonal de manufactura vinculado: NO")

except User.DoesNotExist:
    print("Usuario con id=4 no existe")
