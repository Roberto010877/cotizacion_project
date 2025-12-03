import sys
sys.path.insert(0, '.')
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'cotidomo_backend.settings'
import django
django.setup()

from core.models import User
from manufactura.models import Manufactura
from pedidos_servicio.models import PedidoServicio

# Buscar Raúl
users = User.objects.filter(first_name__icontains='ra')
print('Usuarios con "Ra" en el nombre:')
for u in users:
    print(f'  ID: {u.id} | {u.get_full_name()} ({u.username})')
    print(f'  Grupos: {[g.name for g in u.groups.all()]}')
    if hasattr(u, 'personal_manufactura'):
        p = u.personal_manufactura
        print(f'  Personal Manufactura ID: {p.id} | Cargo: {p.get_cargo_display()}')
    print()

print('\n' + '='*70)
print('PEDIDOS EN EL SISTEMA:')
for pedido in PedidoServicio.objects.all():
    print(f'{pedido.numero_pedido} | {pedido.get_estado_display()}')
    if pedido.manufacturador:
        print(f'  Manufacturador: {pedido.manufacturador.get_full_name()} (ID: {pedido.manufacturador.id})')
    if pedido.instalador:
        print(f'  Instalador: {pedido.instalador.get_full_name()} (ID: {pedido.instalador.id})')
