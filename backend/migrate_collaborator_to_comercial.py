"""
Script para migrar roles de COLLABORATOR a COMERCIAL
y cambiar OneToOneField a ForeignKey en Manufactura
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from core.models import User
from manufactura.models import Manufactura

print("=== MIGRACIÓN DE ROLES ===\n")

# 1. Actualizar roles de usuarios
print("1️⃣ Actualizando roles de COLLABORATOR a COMERCIAL...")
users_updated = User.objects.filter(role='COLLABORATOR').update(role='COMERCIAL')
print(f"   ✅ {users_updated} usuarios actualizados\n")

# 2. Verificar usuarios
print("2️⃣ Verificando usuarios:")
for user in User.objects.all():
    print(f"   - {user.username}: {user.role}")

print("\n3️⃣ Verificando relaciones Manufactura:")
for manufactura in Manufactura.objects.all():
    usuario_info = f"{manufactura.usuario.username}" if manufactura.usuario else "Sin usuario"
    print(f"   - {manufactura.nombre} ({manufactura.cargo}): {usuario_info}")

print("\n✅ Migración completada")
print("\n⚠️  IMPORTANTE: Ahora debes ejecutar:")
print("   python manage.py makemigrations")
print("   python manage.py migrate")
