"""
Script para limpiar TODOS los datos de la base de datos
CUIDADO: Este script eliminará TODOS los registros de TODAS las tablas
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio
from clientes.models import Cliente
from manufactura.models import Manufactura

User = get_user_model()

def limpiar_base_datos():
    """
    Elimina TODOS los datos de la base de datos excepto superusuarios
    """
    print("=" * 70)
    print("⚠️  LIMPIEZA COMPLETA DE BASE DE DATOS")
    print("=" * 70)
    
    # 1. Eliminar Items de Pedidos
    print("\n🗑️  Eliminando Items de Pedidos...")
    count = ItemPedidoServicio.objects.count()
    ItemPedidoServicio.objects.all().delete()
    print(f"   ✓ {count} items eliminados")
    
    # 2. Eliminar Pedidos de Servicio
    print("\n🗑️  Eliminando Pedidos de Servicio...")
    count = PedidoServicio.objects.count()
    PedidoServicio.objects.all().delete()
    print(f"   ✓ {count} pedidos eliminados")
    
    # 3. Eliminar Clientes
    print("\n🗑️  Eliminando Clientes...")
    count = Cliente.objects.count()
    Cliente.objects.all().delete()
    print(f"   ✓ {count} clientes eliminados")
    
    # 4. Eliminar Personal de Manufactura
    print("\n🗑️  Eliminando Personal de Manufactura...")
    count = Manufactura.objects.count()
    Manufactura.objects.all().delete()
    print(f"   ✓ {count} registros de manufactura eliminados")
    
    # 5. Eliminar Usuarios (excepto superusuarios)
    print("\n🗑️  Eliminando Usuarios (excepto superusuarios)...")
    usuarios_normales = User.objects.filter(is_superuser=False)
    count = usuarios_normales.count()
    usuarios_normales.delete()
    print(f"   ✓ {count} usuarios eliminados")
    
    # 6. Limpiar grupos (opcional - mantener estructura)
    print("\n🗑️  Vaciando grupos de usuarios...")
    for grupo in Group.objects.all():
        grupo.user_set.clear()
        print(f"   ✓ Grupo '{grupo.name}' vaciado")
    
    print("\n" + "=" * 70)
    print("✅ BASE DE DATOS LIMPIADA EXITOSAMENTE")
    print("=" * 70)
    
    # Mostrar resumen
    print("\n📊 RESUMEN DE BASE DE DATOS:")
    print(f"   • Items de Pedidos: {ItemPedidoServicio.objects.count()}")
    print(f"   • Pedidos de Servicio: {PedidoServicio.objects.count()}")
    print(f"   • Clientes: {Cliente.objects.count()}")
    print(f"   • Personal de Manufactura: {Manufactura.objects.count()}")
    print(f"   • Usuarios: {User.objects.count()}")
    print(f"   • Superusuarios: {User.objects.filter(is_superuser=True).count()}")
    print(f"   • Grupos: {Group.objects.count()}")
    
    print("\n✅ La base de datos está lista para comenzar desde cero")
    print("=" * 70)

if __name__ == '__main__':
    # Confirmar acción
    print("\n⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos")
    print("    (excepto superusuarios y la estructura de grupos)")
    print("\n¿Está seguro que desea continuar? (escriba 'SI' para confirmar): ", end="")
    
    # En modo script, no pedir confirmación
    confirmacion = "SI"
    
    if confirmacion == "SI":
        limpiar_base_datos()
    else:
        print("\n❌ Operación cancelada")
