#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("VERIFICACIÓN DE USUARIOS EN LA BASE DE DATOS")
print("=" * 60)

usuarios = User.objects.all()

if not usuarios.exists():
    print("\n❌ NO HAY USUARIOS EN LA BASE DE DATOS")
    print("\nNecesitas crear un usuario admin. Ejecuta:")
    print("  python manage.py createsuperuser")
else:
    print(f"\n✅ USUARIOS ENCONTRADOS: {usuarios.count()}\n")
    for user in usuarios:
        status = "✓ ACTIVO" if user.is_active else "✗ INACTIVO"
        tipo = "ADMIN" if user.is_superuser else "USER"
        print(f"  [{tipo}] {user.username}")
        print(f"       Email: {user.email}")
        print(f"       Estado: {status}")
        print()

print("=" * 60)
print("PRUEBA DE AUTENTICACIÓN")
print("=" * 60)

admin_user = User.objects.filter(username='admin').first()

if admin_user:
    print(f"\n✅ Usuario 'admin' encontrado")
    print(f"   Email: {admin_user.email}")
    print(f"   Es superuser: {admin_user.is_superuser}")
    print(f"   Activo: {admin_user.is_active}")
else:
    print(f"\n⚠️  Usuario 'admin' NO encontrado")
    print("   Usuarios disponibles:")
    for user in usuarios:
        print(f"     - {user.username}")

print("\n" + "=" * 60)
