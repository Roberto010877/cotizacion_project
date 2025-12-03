"""
Script para probar el filtrado de pedidos según usuario
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from pedidos_servicio.models import PedidoServicio
from manufactura.models import Manufactura

User = get_user_model()

print("\n" + "="*70)
print("PRUEBA DE FILTRADO DE PEDIDOS POR USUARIO")
print("="*70 + "\n")

# Obtener usuario instalador
try:
    usuario_instalador = User.objects.get(username='instalador')
    print(f"✅ Usuario encontrado: {usuario_instalador.username}")
    
    # Verificar si tiene personal vinculado
    if hasattr(usuario_instalador, 'manufacturas'):
        personal = usuario_instalador.manufacturas.first()
        if personal:
            print(f"✅ Personal vinculado: {personal.get_full_name()}")
            print(f"   Cargo: {personal.cargo}")
            print(f"   ID: {personal.id}")
        
        # Buscar pedidos asignados
        pedidos_como_fabricador = PedidoServicio.objects.filter(fabricador=personal)
        pedidos_como_instalador = PedidoServicio.objects.filter(instalador=personal)
        
        print(f"\n📋 Pedidos asignados:")
        print(f"   Como fabricador: {pedidos_como_fabricador.count()}")
        print(f"   Como instalador: {pedidos_como_instalador.count()}")
        
        print(f"\n📝 Detalle de pedidos como INSTALADOR:")
        for pedido in pedidos_como_instalador:
            print(f"   - {pedido.numero_pedido} | Estado: {pedido.estado}")
            print(f"     Cliente: {pedido.cliente.nombre}")
            if pedido.fabricador:
                print(f"     Fabricador: {pedido.fabricador.get_full_name()}")
            print()
        
        # Simular queryset filtrado
        from django.db.models import Q
        pedidos_totales = PedidoServicio.objects.filter(
            Q(fabricador=personal) | Q(instalador=personal)
        )
        print(f"\n✅ Total pedidos que vería este usuario: {pedidos_totales.count()}")
        
    else:
        print(f"❌ Usuario NO tiene personal de manufactura vinculado")
        
except User.DoesNotExist:
    print("❌ Usuario 'instalador' no encontrado")

print("\n" + "="*70)
print("RESUMEN DE TODOS LOS PEDIDOS Y ASIGNACIONES")
print("="*70 + "\n")

todos_pedidos = PedidoServicio.objects.all().select_related('fabricador', 'instalador', 'cliente')

print(f"Total de pedidos en el sistema: {todos_pedidos.count()}\n")

for pedido in todos_pedidos:
    print(f"📦 {pedido.numero_pedido} - {pedido.estado}")
    print(f"   Cliente: {pedido.cliente.nombre}")
    print(f"   Fabricador: {pedido.fabricador.get_full_name() if pedido.fabricador else 'Sin asignar'}")
    print(f"   Instalador: {pedido.instalador.get_full_name() if pedido.instalador else 'Sin asignar'}")
    print()

print("="*70 + "\n")
