import sys
sys.path.insert(0, '.')
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'cotidomo_backend.settings'
import django
django.setup()

from core.models import User
from pedidos_servicio.models import PedidoServicio
from django.db.models import Q

# Buscar usuarios del grupo Comercial
users = User.objects.filter(groups__name__icontains='comercial')

print('Usuarios en grupo Comercial:')
print('='*70)
for u in users:
    print(f'  - ID: {u.id} | {u.get_full_name()} ({u.username}) | Email: {u.email}')
    print(f'    Grupos: {", ".join([g.name for g in u.groups.all()])}')
    print(f'    Tiene personal_manufactura: {hasattr(u, "personal_manufactura")}')

print('\n' + '='*70)
print('PEDIDOS CREADOS POR CADA USUARIO:')
print('='*70)

for u in users:
    pedidos = PedidoServicio.objects.filter(usuario_creacion=u)
    print(f'\nUsuario: {u.get_full_name()} (ID: {u.id})')
    print(f'Pedidos creados: {pedidos.count()}')
    
    if pedidos.exists():
        for p in pedidos:
            cliente = p.cliente.nombre if p.cliente else "Sin cliente"
            print(f'  - {p.numero_pedido} | {cliente} | {p.get_estado_display()}')
    else:
        print('  (ninguno)')

# Ver todos los pedidos para comparar
print('\n' + '='*70)
print('TODOS LOS PEDIDOS EN EL SISTEMA:')
print('='*70)
all_pedidos = PedidoServicio.objects.all()
print(f'Total: {all_pedidos.count()}')
for p in all_pedidos:
    cliente = p.cliente.nombre if p.cliente else "Sin cliente"
    creador = p.usuario_creacion.get_full_name() if p.usuario_creacion else "Sin creador"
    print(f'  - {p.numero_pedido} | {cliente} | Creador: {creador} | {p.get_estado_display()}')
