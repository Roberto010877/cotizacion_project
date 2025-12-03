"""
Script para verificar y crear grupos necesarios para el sistema
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

print("\n" + "="*70)
print("VERIFICACIÓN Y CREACIÓN DE GRUPOS DEL SISTEMA")
print("="*70 + "\n")

# Grupos necesarios
grupos_requeridos = {
    'instalador': 'Personal que realiza instalaciones',
    'manufacturador': 'Personal que realiza fabricaciones',
    'Comercial': 'Personal comercial/ventas',
    'colaborador': 'Colaboradores generales',
}

print("📋 Verificando grupos existentes...\n")

for grupo_nombre, descripcion in grupos_requeridos.items():
    grupo, created = Group.objects.get_or_create(name=grupo_nombre)
    
    if created:
        print(f"✅ Grupo '{grupo_nombre}' CREADO")
        print(f"   Descripción: {descripcion}")
    else:
        print(f"✓  Grupo '{grupo_nombre}' ya existe")
        print(f"   Miembros: {grupo.user_set.count()} usuarios")
    print()

print("\n" + "="*70)
print("RESUMEN DE GRUPOS")
print("="*70 + "\n")

todos_grupos = Group.objects.all()
for grupo in todos_grupos:
    usuarios = grupo.user_set.all()
    permisos = grupo.permissions.count()
    
    print(f"👥 {grupo.name}")
    print(f"   Usuarios: {usuarios.count()}")
    if usuarios.exists():
        for usuario in usuarios:
            print(f"      - {usuario.username} ({usuario.email})")
    print(f"   Permisos: {permisos}")
    print()

print("="*70 + "\n")
