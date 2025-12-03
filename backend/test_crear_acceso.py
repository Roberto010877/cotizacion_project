"""
Script para probar la creación de acceso y ver el error exacto
"""
import os
import sys
import django
import traceback

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from manufactura.models import Manufactura
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils.crypto import get_random_string

User = get_user_model()

# Intentar crear acceso para el ID 5
try:
    print("\n" + "="*70)
    print("INTENTANDO CREAR ACCESO PARA ID=5")
    print("="*70 + "\n")
    
    personal = Manufactura.objects.get(id=5)
    print(f"✅ Personal encontrado: {personal.get_full_name()}")
    print(f"   Cargo: {personal.cargo}")
    print(f"   Email: {personal.email}")
    
    # Verificar si ya tiene usuario
    if personal.usuario:
        print(f"\n❌ ERROR: Ya tiene usuario asignado: {personal.usuario.username}")
        sys.exit(1)
    
    # Generar username
    username_base = personal.email.split('@')[0]
    username = username_base
    counter = 1
    
    print(f"\n📝 Generando username...")
    print(f"   Base: {username_base}")
    
    # Si el username ya existe, agregar número
    while User.objects.filter(username=username).exists():
        username = f"{username_base}{counter}"
        counter += 1
        print(f"   Username '{username_base}' ya existe, probando: {username}")
    
    print(f"   ✅ Username disponible: {username}")
    
    # Generar contraseña
    password = get_random_string(12)
    print(f"\n🔐 Contraseña generada: {password}")
    
    # Crear usuario
    print(f"\n👤 Creando usuario...")
    usuario = User.objects.create_user(
        username=username,
        email=personal.email,
        password=password,
        first_name=personal.nombre,
        last_name=personal.apellido
    )
    print(f"   ✅ Usuario creado: {usuario.username}")
    
    # Asignar grupo según cargo
    print(f"\n👥 Asignando grupo...")
    grupo_nombre = 'instalador' if personal.cargo == 'INSTALADOR' else 'manufacturador'
    print(f"   Cargo: {personal.cargo} → Grupo: {grupo_nombre}")
    
    try:
        grupo = Group.objects.get(name=grupo_nombre)
        print(f"   ✅ Grupo encontrado: {grupo.name}")
    except Group.DoesNotExist:
        print(f"   ⚠️  Grupo no existe, creándolo...")
        grupo = Group.objects.create(name=grupo_nombre)
        print(f"   ✅ Grupo creado: {grupo.name}")
    
    usuario.groups.add(grupo)
    print(f"   ✅ Usuario agregado al grupo: {grupo.name}")
    
    # Vincular usuario con personal
    print(f"\n🔗 Vinculando usuario con personal...")
    personal.usuario = usuario
    personal.save()
    print(f"   ✅ Vinculación completada")
    
    print("\n" + "="*70)
    print("✅ ACCESO CREADO EXITOSAMENTE")
    print("="*70)
    print(f"\n📧 Datos del nuevo usuario:")
    print(f"   Username: {username}")
    print(f"   Email: {usuario.email}")
    print(f"   Grupo: {grupo.name}")
    print(f"   Nombre: {usuario.first_name} {usuario.last_name}")
    print()
    
except Manufactura.DoesNotExist:
    print(f"\n❌ ERROR: No existe personal con ID=5")
    print("\nPersonal disponible:")
    for p in Manufactura.objects.all():
        usuario_info = f"Usuario: {p.usuario.username}" if p.usuario else "Sin usuario"
        print(f"   ID {p.id}: {p.get_full_name()} - {usuario_info}")
    
except Exception as e:
    print(f"\n❌ ERROR INESPERADO:")
    print(f"   Tipo: {type(e).__name__}")
    print(f"   Mensaje: {str(e)}")
    print(f"\n📋 Traceback completo:")
    traceback.print_exc()
