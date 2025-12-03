#!/usr/bin/env python
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")
django.setup()

from core.models import User
from django.contrib.auth.models import Group
from manufactura.models import Manufactura

# Datos de usuarios
usuarios_datos = [
    {
        'username': 'admin',
        'email': 'roberto.melgar@outlook.com',
        'password': 'admin123',
        'is_superuser': True,
        'is_staff': True,
        'grupo': None,
    },
    {
        'username': 'colaborador',
        'email': 'melgar.robertocarlos@gmail.com',
        'password': 'admin123',
        'is_superuser': False,
        'is_staff': False,
        'grupo': 'colaborador',
    },
    {
        'username': 'instalador',
        'email': 'roberto.melgar@outlook.com',
        'password': 'admin123',
        'is_superuser': False,
        'is_staff': False,
        'grupo': 'instalador',
    },
    {
        'username': 'manufacturador',
        'email': 'robertocarlos.melgar@gmail.com',
        'password': 'admin123',
        'is_superuser': False,
        'is_staff': False,
        'grupo': 'manufacturador',
    },
]

print("Creando grupos...")
# Crear grupos si no existen
grupos_nombres = ['colaborador', 'instalador', 'manufacturador']
for grupo_nombre in grupos_nombres:
    grupo, created = Group.objects.get_or_create(name=grupo_nombre)
    if created:
        print(f"✓ Grupo '{grupo_nombre}' creado")
    else:
        print(f"✓ Grupo '{grupo_nombre}' ya existe")

print("\nCreando usuarios...")
# Crear usuarios
for datos in usuarios_datos:
    username = datos['username']
    email = datos['email']
    password = datos['password']
    is_superuser = datos['is_superuser']
    is_staff = datos['is_staff']
    grupo_nombre = datos['grupo']
    
    # Crear o actualizar usuario
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_superuser': is_superuser,
            'is_staff': is_staff,
        }
    )
    
    if created:
        user.set_password(password)
        user.save()
        print(f"✓ Usuario '{username}' creado")
    else:
        user.email = email
        user.set_password(password)
        user.is_superuser = is_superuser
        user.is_staff = is_staff
        user.save()
        print(f"✓ Usuario '{username}' actualizado")
    
    # Asignar grupo si corresponde
    if grupo_nombre:
        grupo = Group.objects.get(name=grupo_nombre)
        user.groups.add(grupo)
        print(f"  → Asignado al grupo '{grupo_nombre}'")
    
    # Crear perfil de Manufactura para instaladores y manufacturadores
    if username in ['instalador', 'manufacturador']:
        cargo = 'INSTALADOR' if username == 'instalador' else 'FABRICADOR'
        manufactura, created = Manufactura.objects.get_or_create(
            usuario=user,
            defaults={
                'nombre': username.capitalize(),
                'apellido': 'Test',
                'documento': f'DOC{username}123',
                'email': email,
                'telefono': '+1234567890',
                'cargo': cargo,
            }
        )
        if created:
            print(f"  → Perfil Manufactura ({cargo}) creado")
        else:
            print(f"  → Perfil Manufactura ({cargo}) ya existe")

print(f"\n✓ Todos los usuarios han sido creados/actualizados")
print(f"\nCredenciales:")
print(f"  Admin:         admin / admin123")
print(f"  Colaborador:   colaborador / admin123")
print(f"  Instalador:    instalador / admin123")
print(f"  Manufacturador: manufacturador / admin123")
