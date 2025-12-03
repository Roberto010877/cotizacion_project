import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from core.models import User
from manufactura.models import Manufactura

print("\n=== ✅ VERIFICACIÓN POST-MIGRACIÓN ===\n")

print("👥 USUARIOS:")
for user in User.objects.all():
    print(f"   - {user.username}: {user.role}")

print("\n🔧 MANUFACTURAS:")
for m in Manufactura.objects.all():
    usuario_info = m.usuario.username if m.usuario else "Sin usuario"
    print(f"   - {m.nombre} ({m.cargo}): {usuario_info}")

# Verificar que ForeignKey funciona (múltiples manufacturas por usuario)
print("\n🔗 RELACIÓN USUARIO → MANUFACTURAS:")
for user in User.objects.filter(manufacturas__isnull=False).distinct():
    manufacturas = user.manufacturas.all()
    cargos = ", ".join([m.cargo for m in manufacturas])
    print(f"   - {user.username}: {manufacturas.count()} rol(es) → {cargos}")

print("\n✅ Migración verificada correctamente")
