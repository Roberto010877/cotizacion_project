import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group

print("=" * 70)
print("PERMISOS DE GRUPOS")
print("=" * 70)

# Manufacturador
try:
    manufacturador = Group.objects.get(name='manufacturador')
    print(f"\n📦 GRUPO: MANUFACTURADOR")
    print(f"Total permisos: {manufacturador.permissions.count()}")
    if manufacturador.permissions.exists():
        for p in manufacturador.permissions.all():
            print(f"  ✓ {p.content_type.app_label}.{p.codename}")
    else:
        print("  ⚠️  Sin permisos asignados")
except Group.DoesNotExist:
    print("\n❌ Grupo 'manufacturador' NO EXISTE")

# Instalador
try:
    instalador = Group.objects.get(name='instalador')
    print(f"\n🔧 GRUPO: INSTALADOR")
    print(f"Total permisos: {instalador.permissions.count()}")
    if instalador.permissions.exists():
        for p in instalador.permissions.all():
            print(f"  ✓ {p.content_type.app_label}.{p.codename}")
    else:
        print("  ⚠️  Sin permisos asignados")
except Group.DoesNotExist:
    print("\n❌ Grupo 'instalador' NO EXISTE")

print("\n" + "=" * 70)
