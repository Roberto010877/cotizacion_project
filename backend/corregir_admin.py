import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from core.models import User

print("=== CORRECCIÓN DE ROL ADMIN ===\n")

# Buscar usuarios que deberían ser ADMIN
admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)

for user in admin_users:
    if user.role != 'ADMIN':
        print(f"⚙️  Cambiando {user.username} de {user.role} → ADMIN")
        user.role = 'ADMIN'
        user.save()
        print(f"   ✅ Actualizado")

print("\n📋 VERIFICACIÓN FINAL:")
for user in User.objects.all():
    tipo = "🔴 ADMIN" if user.role == 'ADMIN' else "🔵 COMERCIAL"
    print(f"   {tipo} - {user.username} (superuser={user.is_superuser}, staff={user.is_staff})")

print("\n✅ Corrección completada")
