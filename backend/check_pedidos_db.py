import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio

print("=== PEDIDOS EN LA BASE DE DATOS ===")
pedidos = PedidoServicio.objects.all()
print(f"Total de pedidos: {pedidos.count()}\n")

for p in pedidos:
    print(f"ID: {p.id}")
    print(f"  Número: {p.numero_pedido}")
    print(f"  Cliente: {p.cliente.nombre if p.cliente else 'N/A'}")
    print(f"  Estado: {p.estado}")
    print(f"  Solicitante: {p.solicitante}")
    print(f"  Items: {p.items.count()}")
    for item in p.items.all():
        print(f"    - Item {item.numero_item}: {item.ambiente} ({item.modelo})")
    print()
