#!/usr/bin/env python
import os
import sys
import django
from random import choice, randint

# Agregar el directorio backend al path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")
django.setup()

from manufactura.models import Manufactura
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

# Nombres latinoamericanos
NOMBRES = [
    "Carlos", "Miguel", "Roberto", "Juan", "José", "Luis",
    "Diego", "Francisco", "Rafael", "Andrés", "Fernando", "Pablo",
]

APELLIDOS = [
    "García", "Rodríguez", "Martínez", "López", "González", "Pérez",
    "Silva", "Santos", "Oliveira", "Ferreira", "Costa", "Morales",
    "Reyes", "Fuentes", "Castillo", "Vargas", "Mendoza", "Rojas",
]

ESPECIALIDADES = [
    "Cortinas Motorizadas",
    "Persianas Verticales",
    "Cortinas Roller",
    "Instalación Rápida",
    "Reparación de Cortinas",
    "Servicios Generales",
    "Ventas y Marketing",
]

CIUDADES = [
    "Buenos Aires",
    "Córdoba",
    "Rosario",
    "Mendoza",
    "La Plata",
    "Tucumán",
]

EMAILS = [
    "manufacturador1@cotidomo.com",
    "manufacturador2@cotidomo.com",
    "manufacturador3@cotidomo.com",
    "instalador1@cotidomo.com",
    "instalador2@cotidomo.com",
    "instalador3@cotidomo.com",
    "comercial1@cotidomo.com",
    "comercial2@cotidomo.com",
    "comercial3@cotidomo.com",
]

def crear_usuario_con_manufactura(username, email, password, nombre, apellido, documento, 
                                  telefono, especialidad, ciudad, cargo, grupo_nombre, admin_user):
    """Crea un usuario, su registro en Manufactura y lo asigna al grupo correspondiente"""
    
    # Crear usuario
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=nombre,
        last_name=apellido
    )
    
    # Asignar al grupo
    grupo = Group.objects.get(name=grupo_nombre)
    user.groups.add(grupo)
    
    # Crear registro en Manufactura
    manufactura = Manufactura.objects.create(
        usuario=user,  # 👈 VINCULACIÓN CORRECTA: desde Manufactura hacia User
        nombre=nombre,
        apellido=apellido,
        documento=documento,
        email=email,
        telefono=telefono,
        especialidad=especialidad,
        ciudad=ciudad,
        cargo=cargo,
        estado='ACTIVO',
        calificacion=float(randint(35, 50)) / 10,  # Entre 3.5 y 5.0
        usuario_creacion=admin_user,
        usuario_modificacion=admin_user
    )
    
    return user, manufactura

def generar_personas():
    """Generar 9 usuarios: 3 manufacturadores, 3 instaladores, 3 comerciales"""
    
    # Obtener usuario admin para auditoría
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            print("⚠️  No hay usuario administrador. No se puede continuar.")
            return
    except Exception as e:
        print(f"❌ Error obteniendo admin: {e}")
        return
    
    print("\n" + "="*70)
    print("CREACIÓN DE USUARIOS CON MANUFACTURA")
    print("="*70)
    print("Se crearán 9 usuarios:")
    print("  - 3 Manufacturadores (grupo: manufacturador)")
    print("  - 3 Instaladores (grupo: instalador)")
    print("  - 3 Comerciales (grupo: Comercial)")
    print("="*70 + "\n")
    
    usuarios_creados = []
    
    # ==== CREAR 3 MANUFACTURADORES ====
    print("📦 Creando Manufacturadores...\n")
    for i in range(1, 4):
        nombre = choice(NOMBRES)
        apellido = choice(APELLIDOS)
        username = f"manufacturador{i}"
        documento = f"MAN{randint(10000000, 99999999)}"
        email = f"manufacturador{i}@cotidomo.com"
        telefono = f"+591 {randint(70000000, 79999999)}"
        especialidad = choice(ESPECIALIDADES[:5])  # Especialidades de manufactura
        ciudad = choice(CIUDADES)
        
        try:
            user, manufactura = crear_usuario_con_manufactura(
                username=username,
                email=email,
                password="cotidomo123",
                nombre=nombre,
                apellido=apellido,
                documento=documento,
                telefono=telefono,
                especialidad=especialidad,
                ciudad=ciudad,
                cargo='MANUFACTURADOR',
                grupo_nombre='manufacturador',
                admin_user=admin_user
            )
            usuarios_creados.append((user, manufactura))
            print(f"  ✅ {username}: {nombre} {apellido}")
            print(f"     Email: {email} | Password: cotidomo123")
            print(f"     Ciudad: {ciudad} | Especialidad: {especialidad}\n")
        except Exception as e:
            print(f"  ❌ Error creando {username}: {str(e)}\n")
    
    # ==== CREAR 3 INSTALADORES ====
    print("\n🔧 Creando Instaladores...\n")
    for i in range(1, 4):
        nombre = choice(NOMBRES)
        apellido = choice(APELLIDOS)
        username = f"instalador{i}"
        documento = f"INS{randint(10000000, 99999999)}"
        email = f"instalador{i}@cotidomo.com"
        telefono = f"+591 {randint(70000000, 79999999)}"
        especialidad = choice(["Instalación Rápida", "Reparación de Cortinas", "Servicios Generales"])
        ciudad = choice(CIUDADES)
        
        try:
            user, manufactura = crear_usuario_con_manufactura(
                username=username,
                email=email,
                password="cotidomo123",
                nombre=nombre,
                apellido=apellido,
                documento=documento,
                telefono=telefono,
                especialidad=especialidad,
                ciudad=ciudad,
                cargo='INSTALADOR',
                grupo_nombre='instalador',
                admin_user=admin_user
            )
            usuarios_creados.append((user, manufactura))
            print(f"  ✅ {username}: {nombre} {apellido}")
            print(f"     Email: {email} | Password: cotidomo123")
            print(f"     Ciudad: {ciudad} | Especialidad: {especialidad}\n")
        except Exception as e:
            print(f"  ❌ Error creando {username}: {str(e)}\n")
    
    # ==== CREAR 3 COMERCIALES ====
    print("\n💼 Creando Comerciales...\n")
    for i in range(1, 4):
        nombre = choice(NOMBRES)
        apellido = choice(APELLIDOS)
        username = f"comercial{i}"
        documento = f"COM{randint(10000000, 99999999)}"
        email = f"comercial{i}@cotidomo.com"
        telefono = f"+591 {randint(70000000, 79999999)}"
        especialidad = "Ventas y Marketing"
        ciudad = choice(CIUDADES)
        
        try:
            user, manufactura = crear_usuario_con_manufactura(
                username=username,
                email=email,
                password="cotidomo123",
                nombre=nombre,
                apellido=apellido,
                documento=documento,
                telefono=telefono,
                especialidad=especialidad,
                ciudad=ciudad,
                cargo='COMERCIAL',
                grupo_nombre='Comercial',
                admin_user=admin_user
            )
            usuarios_creados.append((user, manufactura))
            print(f"  ✅ {username}: {nombre} {apellido}")
            print(f"     Email: {email} | Password: cotidomo123")
            print(f"     Ciudad: {ciudad} | Especialidad: {especialidad}\n")
        except Exception as e:
            print(f"  ❌ Error creando {username}: {str(e)}\n")
    
    # ==== RESUMEN FINAL ====
    print("\n" + "="*70)
    print("RESUMEN FINAL")
    print("="*70)
    print(f"✅ Usuarios creados: {len(usuarios_creados)}")
    print(f"\nEstadísticas en base de datos:")
    print(f"  - Total usuarios: {User.objects.count()}")
    print(f"  - Total registros Manufactura: {Manufactura.objects.count()}")
    print(f"  - Manufacturadores: {Manufactura.objects.filter(cargo='MANUFACTURADOR').count()}")
    print(f"  - Instaladores: {Manufactura.objects.filter(cargo='INSTALADOR').count()}")
    print(f"  - Comerciales: {Manufactura.objects.filter(cargo='COMERCIAL').count()}")
    print("="*70 + "\n")
    
    print("📝 Credenciales de acceso:")
    print("  - Username: manufacturador1, manufacturador2, manufacturador3")
    print("  - Username: instalador1, instalador2, instalador3")
    print("  - Username: comercial1, comercial2, comercial3")
    print("  - Password (todos): cotidomo123")
    print("="*70 + "\n")

if __name__ == "__main__":
    generar_personas()
