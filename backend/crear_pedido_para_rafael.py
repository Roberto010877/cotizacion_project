"""
Script para crear pedido de prueba asignado a Rafael Reyes
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio
from manufactura.models import Manufactura
from clientes.models import Cliente
from django.utils import timezone

# Buscar Rafael Reyes (instalador)
rafael = Manufactura.objects.get(documento='DOC75156100')
print(f"✅ Instalador: {rafael.get_full_name()}")

# Buscar un fabricador
fabricador = Manufactura.objects.filter(cargo='FABRICADOR').first()
print(f"✅ Fabricador: {fabricador.get_full_name()}")

# Buscar un cliente
cliente = Cliente.objects.first()
print(f"✅ Cliente: {cliente.nombre}")

# Crear pedido
pedido = PedidoServicio.objects.create(
    solicitante="Rita (Prueba Vinculación)",
    fabricador=fabricador,
    instalador=rafael,  # Asignar a Rafael Reyes
    cliente=cliente,
    estado='LISTO_INSTALAR',
    observaciones='Pedido de prueba para verificar vinculación usuario-instalador'
)

print(f"\n🎉 Pedido creado: {pedido.numero_pedido}")
print(f"   Instalador asignado: {rafael.get_full_name()}")
print(f"   Usuario vinculado: {rafael.usuario.username}")
print(f"\n✅ Ahora cuando 'instalador' haga login, verá este pedido en /mis-tareas")
