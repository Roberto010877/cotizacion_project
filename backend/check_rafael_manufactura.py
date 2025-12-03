import sys
sys.path.insert(0, '.')
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'cotidomo_backend.settings'
import django
django.setup()

from core.models import User
from manufactura.models import Manufactura
from pedidos_servicio.models import PedidoServicio

# Usuario Rafael
user = User.objects.get(id=4)
print(f'Usuario ID: {user.id} - {user.get_full_name()}')

# Buscar registro en manufactura
manuf = Manufactura.objects.filter(usuario=user).first()

if manuf:
    print(f'\nManufactura ID: {manuf.id}')
    print(f'Nombre: {manuf.get_full_name()}')
    print(f'Cargo: {manuf.get_cargo_display()}')
    print(f'Estado: {manuf.get_estado_display()}')
    
    # Buscar pedidos asignados
    pedidos = PedidoServicio.objects.filter(manufacturador_id=manuf.id)
    print(f'\nPedidos con manufacturador_id={manuf.id}: {pedidos.count()}')
    
    if pedidos.exists():
        for p in pedidos:
            print(f'  - Pedido ID: {p.id}')
            print(f'    Número: {p.numero_pedido}')
            print(f'    Cliente: {p.cliente.nombre if p.cliente else "Sin cliente"}')
            print(f'    Estado: {p.get_estado_display()}')
            print()
    else:
        print('  (ninguno)')
else:
    print('\nNo tiene registro en manufactura')
