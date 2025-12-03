"""
Script para crear grupos de Manufacturador e Instalador con sus permisos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

def crear_grupo_manufacturador():
    """
    Crea el grupo MANUFACTURADOR y asigna permisos
    
    Permisos:
    - Ver y cambiar estado de pedidos asignados (filtrado en backend)
    - Ver manufactura (su propio perfil)
    """
    print("\n🔧 Creando grupo MANUFACTURADOR...")
    
    grupo, created = Group.objects.get_or_create(name='manufacturador')
    
    if created:
        print("✅ Grupo 'manufacturador' creado")
    else:
        print("ℹ️  Grupo 'manufacturador' ya existe")
    
    # Limpiar permisos existentes
    grupo.permissions.clear()
    
    # PERMISOS PARA PEDIDOS DE SERVICIO
    # Solo view (el filtrado por asignaciones se hace en el backend)
    permisos_pedidos = Permission.objects.filter(
        content_type__app_label='pedidos_servicio',
        codename__in=[
            'view_pedidoservicio',
            'view_itempedidoservicio',
            'change_pedidoservicio',  # Para cambiar estados
        ]
    )
    print(f"\n📋 Asignando {permisos_pedidos.count()} permisos de Pedidos...")
    for perm in permisos_pedidos:
        grupo.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    # PERMISOS PARA VER MANUFACTURA
    permisos_manufactura = Permission.objects.filter(
        content_type__app_label='manufactura',
        codename='view_manufactura'
    )
    print(f"\n📋 Asignando {permisos_manufactura.count()} permisos de Manufactura...")
    for perm in permisos_manufactura:
        grupo.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    print(f"\n✅ Total de permisos asignados: {grupo.permissions.count()}")
    return grupo


def crear_grupo_instalador():
    """
    Crea el grupo INSTALADOR y asigna permisos
    
    Permisos:
    - Ver y cambiar estado de pedidos asignados (filtrado en backend)
    - Ver manufactura (su propio perfil)
    """
    print("\n🔧 Creando grupo INSTALADOR...")
    
    grupo, created = Group.objects.get_or_create(name='instalador')
    
    if created:
        print("✅ Grupo 'instalador' creado")
    else:
        print("ℹ️  Grupo 'instalador' ya existe")
    
    # Limpiar permisos existentes
    grupo.permissions.clear()
    
    # PERMISOS PARA PEDIDOS DE SERVICIO
    # Solo view (el filtrado por asignaciones se hace en el backend)
    permisos_pedidos = Permission.objects.filter(
        content_type__app_label='pedidos_servicio',
        codename__in=[
            'view_pedidoservicio',
            'view_itempedidoservicio',
            'change_pedidoservicio',  # Para cambiar estados
        ]
    )
    print(f"\n📋 Asignando {permisos_pedidos.count()} permisos de Pedidos...")
    for perm in permisos_pedidos:
        grupo.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    # PERMISOS PARA VER MANUFACTURA
    permisos_manufactura = Permission.objects.filter(
        content_type__app_label='manufactura',
        codename='view_manufactura'
    )
    print(f"\n📋 Asignando {permisos_manufactura.count()} permisos de Manufactura...")
    for perm in permisos_manufactura:
        grupo.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    print(f"\n✅ Total de permisos asignados: {grupo.permissions.count()}")
    return grupo


if __name__ == '__main__':
    print("=" * 70)
    print("CREACIÓN DE GRUPOS MANUFACTURADOR E INSTALADOR")
    print("=" * 70)
    
    grupo_manufacturador = crear_grupo_manufacturador()
    grupo_instalador = crear_grupo_instalador()
    
    print("\n" + "=" * 70)
    print("RESUMEN")
    print("=" * 70)
    print(f"\n📦 Grupo: {grupo_manufacturador.name}")
    print(f"   Permisos totales: {grupo_manufacturador.permissions.count()}")
    print(f"   Usuarios en el grupo: {grupo_manufacturador.user_set.count()}")
    
    print(f"\n🔧 Grupo: {grupo_instalador.name}")
    print(f"   Permisos totales: {grupo_instalador.permissions.count()}")
    print(f"   Usuarios en el grupo: {grupo_instalador.user_set.count()}")
    
    print("\n✅ Configuración completada exitosamente")
    print("\nAhora los manufacturadores e instaladores pueden:")
    print("  • Ver pedidos asignados a ellos")
    print("  • Cambiar estados de pedidos según su rol")
    print("  • Ver información de manufactura")
