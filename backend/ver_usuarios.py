import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from core.models import User
from manufactura.models import Manufactura

print("=== USUARIOS ADMIN ===")
admins = User.objects.filter(is_superuser=True)
for admin in admins:
    print(f"  - {admin.username} (email: {admin.email})")

print("\n=== USUARIOS COLABORADORES ===")
colaboradores = User.objects.filter(is_superuser=False, is_staff=False)
for col in colaboradores:
    try:
        inst = Manufactura.objects.get(user=col)
        print(f"  - {col.username} → {inst.get_full_name()}")
    except Manufactura.DoesNotExist:
        print(f"  - {col.username} (sin instalador asociado)")

print("\n=== INSTALADORES SIN USER ===")
instaladores_sin_user = Manufactura.objects.filter(user__isnull=True)
print(f"  Total: {instaladores_sin_user.count()}")
for inst in instaladores_sin_user[:5]:
    print(f"    - {inst.get_full_name()}")
