import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from pedidos_servicio.models import PedidoServicio

print("="*70)
print("ASIGNANDO PERMISOS A GRUPOS")
print("="*70)

# Obtener el ContentType de PedidoServicio
content_type = ContentType.objects.get_for_model(PedidoServicio)

# Definir permisos por grupo
permisos_por_grupo = {
    'Comercial': [
        'add_pedidoservicio',
        'change_pedidoservicio',
        'delete_pedidoservicio',
        'view_pedidoservicio',
    ],
    'manufacturador': [
        'view_pedidoservicio',
        'can_change_to_aceptado',
        'can_change_to_en_fabricacion',
        'can_change_to_listo_instalar',
        'can_change_to_rechazado',
    ],
    'instalador': [
        'view_pedidoservicio',
        'can_change_to_instalado',
        'can_change_to_completado',
    ],
}

for grupo_name, permisos_codenames in permisos_por_grupo.items():
    try:
        grupo, created = Group.objects.get_or_create(name=grupo_name)
        
        if created:
            print(f"\n✅ Grupo '{grupo_name}' creado")
        else:
            print(f"\n📋 Grupo '{grupo_name}' ya existe")
        
        # Limpiar permisos existentes relacionados con pedidos_servicio
        grupo.permissions.remove(*grupo.permissions.filter(content_type=content_type))
        
        # Asignar nuevos permisos
        permisos_asignados = []
        for codename in permisos_codenames:
            try:
                permiso = Permission.objects.get(
                    codename=codename,
                    content_type=content_type
                )
                grupo.permissions.add(permiso)
                permisos_asignados.append(codename)
            except Permission.DoesNotExist:
                print(f"  ⚠️  Permiso '{codename}' no existe")
        
        print(f"  Permisos asignados: {len(permisos_asignados)}")
        for p in permisos_asignados:
            print(f"    ✓ {p}")
            
    except Exception as e:
        print(f"  ❌ Error con grupo '{grupo_name}': {str(e)}")

print("\n" + "="*70)
print("VERIFICACIÓN DE PERMISOS")
print("="*70)

for grupo_name in permisos_por_grupo.keys():
    try:
        grupo = Group.objects.get(name=grupo_name)
        permisos = grupo.permissions.filter(content_type=content_type)
        print(f"\n{grupo_name}:")
        for p in permisos:
            print(f"  • {p.codename}")
    except Group.DoesNotExist:
        print(f"\n{grupo_name}: ❌ No existe")

print("\n" + "="*70)
print("✅ PROCESO COMPLETADO")
print("="*70)
