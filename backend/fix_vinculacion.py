#!/usr/bin/env python
import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from manufactura.models import Manufactura

User = get_user_model()

print("\nVinculando usuarios con manufactura...")

usuarios = User.objects.exclude(is_superuser=True)
for user in usuarios:
    try:
        manuf = Manufactura.objects.get(email=user.email)
        user.personal_manufactura = manuf
        user.save()
        print(f"✅ {user.username} vinculado con Manufactura ID {manuf.id}")
    except Manufactura.DoesNotExist:
        print(f"❌ {user.username}: No se encontró Manufactura")
    except Exception as e:
        print(f"❌ {user.username}: Error - {e}")

print("\nVerificación:")
for user in User.objects.filter(groups__name='manufacturador'):
    status = "✅" if (hasattr(user, 'personal_manufactura') and user.personal_manufactura) else "❌"
    print(f"{status} {user.username}")
