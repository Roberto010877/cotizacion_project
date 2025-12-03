"""
Script para resetear la base de datos de desarrollo.
- Elimina todos los datos
- Crea usuario admin con password admin123
- Crea grupos básicos
- Asigna permisos a grupos
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import connection
from pedidos_servicio.models import PedidoServicio, ItemPedidoServicio
from clientes.models import Cliente
from manufactura.models import Manufactura

User = get_user_model()

print("="*80)
print("🔄 RESETEO DE BASE DE DATOS DE DESARROLLO")
print("="*80)

# 1. Eliminar todos los datos
print("\n📦 Eliminando datos...")

try:
    ItemPedidoServicio.objects.all().delete()
    print("  ✓ Items de pedidos eliminados")
except Exception as e:
    print(f"  ⚠️  Error eliminando items: {e}")

try:
    PedidoServicio.objects.all().delete()
    print("  ✓ Pedidos de servicio eliminados")
except Exception as e:
    print(f"  ⚠️  Error eliminando pedidos: {e}")

try:
    Cliente.objects.all().delete()
    print("  ✓ Clientes eliminados")
except Exception as e:
    print(f"  ⚠️  Error eliminando clientes: {e}")

try:
    Manufactura.objects.all().delete()
    print("  ✓ Personal de manufactura eliminado")
except Exception as e:
    print(f"  ⚠️  Error eliminando manufactura: {e}")

try:
    # Eliminar usuarios excepto superusuarios (por seguridad)
    User.objects.filter(is_superuser=False).delete()
    print("  ✓ Usuarios no-admin eliminados")
except Exception as e:
    print(f"  ⚠️  Error eliminando usuarios: {e}")

# Resetear secuencias de auto-increment
try:
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='pedidos_servicio_pedidoservicio'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='pedidos_servicio_itempedidoservicio'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='clientes_cliente'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='manufactura_manufactura'")
    print("  ✓ Secuencias reseteadas")
except Exception as e:
    print(f"  ⚠️  Error reseteando secuencias: {e}")

# 2. Crear/actualizar usuario admin
print("\n👤 Creando usuario admin...")

try:
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@cotidomo.com',
            'first_name': 'Admin',
            'last_name': 'System',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    
    # Establecer password
    admin_user.set_password('admin123')
    admin_user.save()
    
    if created:
        print(f"  ✅ Usuario admin creado")
    else:
        print(f"  ✅ Usuario admin actualizado")
    
    print(f"     Username: admin")
    print(f"     Password: admin123")
    print(f"     Email: admin@cotidomo.com")
except Exception as e:
    print(f"  ❌ Error creando admin: {e}")

# 3. Crear grupos
print("\n👥 Creando grupos...")

grupos = ['Comercial', 'manufacturador', 'instalador']

for grupo_name in grupos:
    try:
        grupo, created = Group.objects.get_or_create(name=grupo_name)
        if created:
            print(f"  ✅ Grupo '{grupo_name}' creado")
        else:
            print(f"  ℹ️  Grupo '{grupo_name}' ya existe")
    except Exception as e:
        print(f"  ❌ Error con grupo '{grupo_name}': {e}")

# 4. Asignar permisos a grupos
print("\n🔐 Asignando permisos a grupos...")

content_type = ContentType.objects.get_for_model(PedidoServicio)

permisos_por_grupo = {
    'Comercial': [
        'add_pedidoservicio',
        'change_pedidoservicio',
        'delete_pedidoservicio',
        'view_pedidoservicio',
        'add_itempedidoservicio',
        'change_itempedidoservicio',
        'delete_itempedidoservicio',
        'view_itempedidoservicio',
    ],
    'manufacturador': [
        'view_pedidoservicio',
        'view_itempedidoservicio',
        'can_change_to_aceptado',
        'can_change_to_en_fabricacion',
        'can_change_to_listo_instalar',
        'can_change_to_rechazado',
    ],
    'instalador': [
        'view_pedidoservicio',
        'view_itempedidoservicio',
        'can_change_to_instalado',
        'can_change_to_completado',
    ],
}

for grupo_name, permisos_codenames in permisos_por_grupo.items():
    try:
        grupo = Group.objects.get(name=grupo_name)
        
        # Limpiar permisos de pedidos_servicio
        grupo.permissions.remove(*grupo.permissions.filter(
            content_type__app_label='pedidos_servicio'
        ))
        
        permisos_asignados = 0
        for codename in permisos_codenames:
            try:
                permiso = Permission.objects.get(
                    codename=codename,
                    content_type__app_label='pedidos_servicio'
                )
                grupo.permissions.add(permiso)
                permisos_asignados += 1
            except Permission.DoesNotExist:
                print(f"  ⚠️  Permiso '{codename}' no existe")
        
        print(f"  ✅ {grupo_name}: {permisos_asignados} permisos asignados")
    except Group.DoesNotExist:
        print(f"  ❌ Grupo '{grupo_name}' no existe")
    except Exception as e:
        print(f"  ❌ Error con grupo '{grupo_name}': {e}")

# 5. Agregar permisos de clientes a Comercial
print("\n📋 Asignando permisos de clientes a Comercial...")

try:
    comercial_group = Group.objects.get(name='Comercial')
    cliente_content_type = ContentType.objects.get(app_label='clientes', model='cliente')
    
    permisos_cliente = Permission.objects.filter(content_type=cliente_content_type)
    for permiso in permisos_cliente:
        comercial_group.permissions.add(permiso)
    
    print(f"  ✅ Permisos de clientes asignados a Comercial")
except Exception as e:
    print(f"  ❌ Error: {e}")

# 6. Agregar permisos de manufactura a manufacturador
print("\n🏭 Asignando permisos de manufactura...")

try:
    manufacturador_group = Group.objects.get(name='manufacturador')
    manufactura_content_type = ContentType.objects.get(app_label='manufactura', model='manufactura')
    
    # Solo view para manufacturador
    view_manufactura = Permission.objects.get(
        codename='view_manufactura',
        content_type=manufactura_content_type
    )
    manufacturador_group.permissions.add(view_manufactura)
    
    print(f"  ✅ Permiso view_manufactura asignado a manufacturador")
except Exception as e:
    print(f"  ❌ Error: {e}")

print("\n" + "="*80)
print("✅ RESETEO COMPLETADO")
print("="*80)
print("\n📝 Información de acceso:")
print("   URL: http://localhost:8000/admin/")
print("   Username: admin")
print("   Password: admin123")
print("\n💡 La base de datos está limpia y lista para pruebas")
print("="*80)
