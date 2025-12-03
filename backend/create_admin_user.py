#!/usr/bin/env python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")
django.setup()

from core.models import User
from django.contrib.auth.models import Group
from manufactura.models import Manufactura

email = 'roberto.melgar@outlook.com'
password = 'admin123'

# Crear grupos si no existen
group_colaborador, _ = Group.objects.get_or_create(name='colaborador')
group_instalador, _ = Group.objects.get_or_create(name='instalador')

print("Creando usuarios...\n")

# 1. Usuario ADMIN
if User.objects.filter(username='admin').exists():
    admin_user = User.objects.get(username='admin')
    admin_user.set_password(password)
    admin_user.email = email
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print("✓ Usuario admin actualizado")
else:
    admin_user = User.objects.create_superuser('admin', email, password)
    print("✓ Usuario admin creado")

# 2. Usuario COLABORADOR
if User.objects.filter(username='colaborador').exists():
    collab_user = User.objects.get(username='colaborador')
    collab_user.set_password(password)
    collab_user.email = email
    collab_user.save()
    print("✓ Usuario colaborador actualizado")
else:
    collab_user = User.objects.create_user('colaborador', email, password)
    collab_user.groups.add(group_colaborador)
    collab_user.save()
    print("✓ Usuario colaborador creado")

# 3. Usuario INSTALADOR
if User.objects.filter(username='instalador').exists():
    inst_user = User.objects.get(username='instalador')
    inst_user.set_password(password)
    inst_user.email = email
    inst_user.save()
    print("✓ Usuario instalador actualizado")
else:
    inst_user = User.objects.create_user('instalador', email, password)
    inst_user.groups.add(group_instalador)
    inst_user.save()
    print("✓ Usuario instalador creado")
    
    # Crear perfil de Manufactura para el usuario
    Manufactura.objects.get_or_create(
        usuario=inst_user,
        defaults={
            'nombre': 'Instalador',
            'apellido': 'Test',
            'telefono': '+1234567890',
            'email': email
        }
    )
    print("✓ Perfil de Manufactura creado")

print(f"\n✓ Todos los usuarios tienen contraseña: {password}")
print(f"✓ Email: {email}")
print("\nUsuarios creados:")
print("  1. admin (superusuario)")
print("  2. colaborador (grupo: colaborador)")
print("  3. instalador (grupo: instalador)")
