"""
Script para crear el grupo COMERCIAL y asignar permisos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from core.models import User

def crear_grupo_comercial():
    """
    Crea el grupo COMERCIAL y asigna todos los permisos necesarios
    """
    print("🔧 Creando grupo COMERCIAL...")
    
    # Crear o obtener el grupo
    grupo_comercial, created = Group.objects.get_or_create(name='Comercial')
    
    if created:
        print("✅ Grupo 'Comercial' creado exitosamente")
    else:
        print("ℹ️  Grupo 'Comercial' ya existe")
    
    # Limpiar permisos existentes
    grupo_comercial.permissions.clear()
    
    # PERMISOS PARA CLIENTES (todos los permisos)
    permisos_clientes = Permission.objects.filter(
        content_type__app_label='clientes',
        codename__in=[
            'view_cliente',
            'add_cliente',
            'change_cliente',
            'delete_cliente',
        ]
    )
    print(f"\n📋 Asignando {permisos_clientes.count()} permisos de Clientes...")
    for perm in permisos_clientes:
        grupo_comercial.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    # PERMISOS PARA PEDIDOS DE SERVICIO (todos los permisos)
    permisos_pedidos = Permission.objects.filter(
        content_type__app_label='pedidos_servicio',
        codename__in=[
            'view_pedidoservicio',
            'add_pedidoservicio',
            'change_pedidoservicio',
            'delete_pedidoservicio',
            'view_itempedidoservicio',
            'add_itempedidoservicio',
            'change_itempedidoservicio',
            'delete_itempedidoservicio',
        ]
    )
    print(f"\n📋 Asignando {permisos_pedidos.count()} permisos de Pedidos de Servicio...")
    for perm in permisos_pedidos:
        grupo_comercial.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    # PERMISOS PARA MANUFACTURA (solo ver)
    permisos_manufactura = Permission.objects.filter(
        content_type__app_label='manufactura',
        codename__in=[
            'view_manufactura',
        ]
    )
    print(f"\n📋 Asignando {permisos_manufactura.count()} permisos de Manufactura...")
    for perm in permisos_manufactura:
        grupo_comercial.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    # PERMISOS ADICIONALES
    # Países, tipos de documento, etc.
    permisos_adicionales = Permission.objects.filter(
        content_type__app_label='clientes',
        codename__in=[
            'view_pais',
            'view_tipodocumentoconfig',
        ]
    )
    print(f"\n📋 Asignando {permisos_adicionales.count()} permisos adicionales...")
    for perm in permisos_adicionales:
        grupo_comercial.permissions.add(perm)
        print(f"  ✓ {perm.codename}")
    
    print(f"\n✅ Total de permisos asignados: {grupo_comercial.permissions.count()}")
    
    # Asignar usuarios con rol COMERCIAL al grupo
    print("\n👥 Asignando usuarios COMERCIAL al grupo...")
    usuarios_comercial = User.objects.filter(role='COMERCIAL')
    
    for usuario in usuarios_comercial:
        usuario.groups.add(grupo_comercial)
        print(f"  ✓ Usuario '{usuario.username}' agregado al grupo Comercial")
    
    print(f"\n✅ Total de usuarios agregados: {usuarios_comercial.count()}")
    
    return grupo_comercial

if __name__ == '__main__':
    print("=" * 60)
    print("CREACIÓN DE GRUPO COMERCIAL Y ASIGNACIÓN DE PERMISOS")
    print("=" * 60)
    
    grupo = crear_grupo_comercial()
    
    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"Grupo: {grupo.name}")
    print(f"Permisos totales: {grupo.permissions.count()}")
    print(f"Usuarios en el grupo: {grupo.user_set.count()}")
    print("\n✅ Configuración completada exitosamente")
    print("\nAhora los usuarios COMERCIAL pueden:")
    print("  • Ver, crear, editar y eliminar clientes")
    print("  • Ver, crear, editar y eliminar pedidos de servicio")
    print("  • Ver fabricadores e instaladores")
    print("  • Ver países y tipos de documento")
