"""
Script para crear usuario Rita con rol COMERCIAL
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

def crear_usuario_rita():
    """
    Crea el usuario Rita con rol COMERCIAL
    """
    print("=" * 70)
    print("CREANDO USUARIO RITA - ROL COMERCIAL")
    print("=" * 70)
    
    # Verificar si ya existe
    if User.objects.filter(username='rita').exists():
        print("\n⚠️  Usuario 'rita' ya existe")
        user = User.objects.get(username='rita')
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Rol: {user.role}")
        return user
    
    # Crear usuario
    try:
        user = User.objects.create_user(
            username='rita',
            email='rita@cortinas.com',
            password='rita123',  # Contraseña temporal
            first_name='Rita',
            last_name='Comercial',
            role='COMERCIAL',
            is_active=True
        )
        
        print(f"\n✅ Usuario creado exitosamente")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Password: rita123")
        print(f"   Nombre: {user.first_name} {user.last_name}")
        print(f"   Rol: {user.role}")
        
        # Asignar al grupo Comercial
        try:
            grupo_comercial = Group.objects.get(name='Comercial')
            user.groups.add(grupo_comercial)
            print(f"\n✅ Usuario asignado al grupo 'Comercial'")
            print(f"   Permisos del grupo: {grupo_comercial.permissions.count()}")
        except Group.DoesNotExist:
            print(f"\n⚠️  Grupo 'Comercial' no existe - creando...")
            grupo_comercial = Group.objects.create(name='Comercial')
            user.groups.add(grupo_comercial)
            print(f"   Usuario asignado al grupo 'Comercial' (sin permisos)")
        
        print("\n" + "=" * 70)
        print("✅ USUARIO RITA CREADO EXITOSAMENTE")
        print("=" * 70)
        print("\n📝 Credenciales de acceso:")
        print(f"   Usuario: rita")
        print(f"   Contraseña: rita123")
        print(f"   Email: rita@cortinas.com")
        print("\n" + "=" * 70)
        
        return user
        
    except Exception as e:
        print(f"\n❌ Error al crear usuario: {str(e)}")
        return None

if __name__ == '__main__':
    crear_usuario_rita()
