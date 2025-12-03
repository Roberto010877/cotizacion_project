import sys
sys.path.insert(0, '.')
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'cotidomo_backend.settings'
import django
django.setup()

from pedidos_servicio.models import PedidoServicio

# Consultar pedidos con manufacturador_id=4
pedidos = PedidoServicio.objects.filter(manufacturador_id=4)

print(f'Pedidos con manufacturador_id=4: {pedidos.count()}\n')
print('='*80)

for p in pedidos:
    print(f'\nID: {p.id}')
    print(f'Número Pedido: {p.numero_pedido}')
    print(f'Cliente: {p.cliente.nombre if p.cliente else "Sin cliente"}')
    print(f'Estado: {p.get_estado_display()} ({p.estado})')
    print(f'Manufacturador ID: {p.manufacturador_id}')
    if p.manufacturador:
        print(f'Manufacturador: {p.manufacturador.get_full_name()}')
        print(f'  - Cargo: {p.manufacturador.get_cargo_display()}')
        print(f'  - Usuario vinculado: {p.manufacturador.usuario.username if p.manufacturador.usuario else "No"}')
    else:
        print(f'Manufacturador: N/A')
    
    print(f'Instalador ID: {p.instalador_id}')
    if p.instalador:
        print(f'Instalador: {p.instalador.get_full_name()}')
    else:
        print(f'Instalador: N/A')
    
    print(f'Usuario Creación: {p.usuario_creacion.get_full_name() if p.usuario_creacion else "N/A"}')
    print(f'Fecha Inicio: {p.fecha_inicio}')
    print(f'Fecha Fin: {p.fecha_fin}')
    print(f'Created: {p.created_at.strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'Updated: {p.updated_at.strftime("%Y-%m-%d %H:%M:%S")}')
    print('-'*80)
