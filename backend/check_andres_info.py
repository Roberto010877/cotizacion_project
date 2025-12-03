import sys
sys.path.insert(0, '.')
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'cotidomo_backend.settings'
import django
django.setup()

from core.models import User
from pedidos_servicio.models import PedidoServicio
from django.db.models import Q

u = User.objects.get(id=2)
print(f'Usuario: {u.get_full_name()} (ID: {u.id})')
print(f'Grupos: {[g.name for g in u.groups.all()]}')

if hasattr(u, 'personal_manufactura'):
    p = u.personal_manufactura
    print(f'\nPersonal Manufactura:')
    print(f'  ID: {p.id}')
    print(f'  Cargo: {p.get_cargo_display()}')
    print(f'  Estado: {p.get_estado_display()}')
    
    # Ver en qué pedidos está asignado
    asignados = PedidoServicio.objects.filter(Q(manufacturador=p)|Q(instalador=p))
    print(f'\nPedidos donde está ASIGNADO (manufacturador o instalador): {asignados.count()}')
    if asignados.exists():
        for x in asignados:
            print(f'  - {x.numero_pedido}')
    else:
        print('  (ninguno)')
else:
    print('\nNO tiene personal_manufactura')

# Ver pedidos que CREÓ
creados = PedidoServicio.objects.filter(usuario_creacion=u)
print(f'\nPedidos que CREÓ (usuario_creacion): {creados.count()}')
for x in creados:
    print(f'  - {x.numero_pedido}')
