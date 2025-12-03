"""
Script para vincular usuarios del sistema con personal de manufactura.
Esto permite que los instaladores/fabricadores vean sus tareas asignadas.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from manufactura.models import Manufactura

User = get_user_model()

def vincular_usuario_manufactura(username, documento_manufactura):
    """
    Vincula un usuario del sistema con un registro de manufactura.
    
    Args:
        username: Nombre de usuario del sistema (ej: 'instalador')
        documento_manufactura: Documento del personal de manufactura (ej: 'DOC75156100')
    """
    try:
        # Buscar usuario
        usuario = User.objects.get(username=username)
        print(f"✅ Usuario encontrado: {usuario.username} ({usuario.email})")
        
        # Buscar personal de manufactura
        personal = Manufactura.objects.get(documento=documento_manufactura)
        print(f"✅ Personal encontrado: {personal.get_full_name()} - {personal.cargo}")
        
        # Verificar si ya está vinculado
        if personal.usuario:
            print(f"⚠️  Este personal ya está vinculado a: {personal.usuario.username}")
            respuesta = input("¿Desea sobrescribir la vinculación? (s/n): ")
            if respuesta.lower() != 's':
                print("❌ Operación cancelada")
                return
        
        # Vincular
        personal.usuario = usuario
        personal.save()
        
        print(f"\n🎉 ¡Vinculación exitosa!")
        print(f"   Usuario: {usuario.username}")
        print(f"   Personal: {personal.get_full_name()}")
        print(f"   Cargo: {personal.cargo}")
        print(f"\n✅ Ahora cuando '{usuario.username}' inicie sesión, verá las tareas asignadas a '{personal.get_full_name()}'")
        
    except User.DoesNotExist:
        print(f"❌ Error: Usuario '{username}' no encontrado")
        print("\nUsuarios disponibles:")
        for u in User.objects.all():
            print(f"  - {u.username} ({u.email})")
            
    except Manufactura.DoesNotExist:
        print(f"❌ Error: Personal con documento '{documento_manufactura}' no encontrado")
        print("\nPersonal de manufactura disponible:")
        for m in Manufactura.objects.all():
            print(f"  - {m.get_full_name()} | Doc: {m.documento} | {m.cargo}")

def listar_vinculaciones():
    """Muestra todas las vinculaciones existentes."""
    print("\n" + "="*70)
    print("VINCULACIONES ACTUALES: Usuario del Sistema ↔ Personal Manufactura")
    print("="*70 + "\n")
    
    vinculados = Manufactura.objects.filter(usuario__isnull=False).select_related('usuario')
    
    if not vinculados:
        print("⚠️  No hay vinculaciones registradas")
    else:
        for personal in vinculados:
            print(f"👤 {personal.usuario.username:20} ↔ {personal.get_full_name():30} ({personal.cargo})")
    
    print("\n" + "-"*70)
    sin_vincular = Manufactura.objects.filter(usuario__isnull=True)
    print(f"\n📋 Personal SIN vincular: {sin_vincular.count()}")
    for personal in sin_vincular:
        print(f"  - {personal.get_full_name()} | Doc: {personal.documento} | {personal.cargo}")
    
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    print("\n" + "="*70)
    print("VINCULACIÓN DE USUARIOS CON PERSONAL DE MANUFACTURA")
    print("="*70 + "\n")
    
    # Mostrar vinculaciones actuales
    listar_vinculaciones()
    
    # Ejemplo de uso:
    # vincular_usuario_manufactura('instalador', 'DOC75156100')
    
    print("\n📝 Para vincular un usuario, ejecuta en Python shell:")
    print("   from vincular_usuario_manufactura import vincular_usuario_manufactura")
    print("   vincular_usuario_manufactura('username', 'documento')")
    print("\nEjemplo:")
    print("   vincular_usuario_manufactura('instalador', 'DOC75156100')")
