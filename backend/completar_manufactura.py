#!/usr/bin/env python
"""
Script para crear registros de Manufactura faltantes y vincularlos con usuarios existentes
"""
import os
import sys
import django

# Configurar Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from manufactura.models import Manufactura

User = get_user_model()

def completar_registros_manufactura():
    """Crea registros de Manufactura para usuarios que no los tienen"""
    
    print("\n" + "="*70)
    print("COMPLETAR REGISTROS DE MANUFACTURA FALTANTES")
    print("="*70 + "\n")
    
    # Obtener admin para auditoría
    admin_user = User.objects.filter(is_superuser=True).first()
    
    # Usuarios que necesitan registros de Manufactura
    usuarios_sin_manufactura = User.objects.filter(
        personal_manufactura__isnull=True
    ).exclude(is_superuser=True)
    
    print(f"Usuarios sin manufactura: {usuarios_sin_manufactura.count()}\n")
    
    creados = 0
    
    for user in usuarios_sin_manufactura:
        print(f"Usuario: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Nombre: {user.first_name} {user.last_name}")
        
        # Determinar cargo según el grupo
        cargo = None
        grupos = user.groups.values_list('name', flat=True)
        
        if 'manufacturador' in grupos:
            cargo = 'MANUFACTURADOR'
            especialidad = 'Cortinas Motorizadas'
        elif 'instalador' in grupos:
            cargo = 'INSTALADOR'
            especialidad = 'Instalación Rápida'
        elif 'Comercial' in grupos:
            cargo = 'COMERCIAL'
            especialidad = 'Ventas y Marketing'
        else:
            print(f"  ⚠️  Usuario sin grupo reconocido\n")
            continue
        
        # Crear registro de Manufactura
        try:
            manufactura = Manufactura.objects.create(
                nombre=user.first_name or user.username,
                apellido=user.last_name or '',
                documento=f"DOC{user.id:08d}",
                email=user.email,
                telefono="+591 70000000",
                especialidad=especialidad,
                ciudad="La Paz",
                cargo=cargo,
                estado='ACTIVO',
                calificacion=4.5,
                usuario_creacion=admin_user,
                usuario_modificacion=admin_user
            )
            
            # Vincular con el usuario
            user.personal_manufactura = manufactura
            user.save()
            
            print(f"  ✅ Creado registro Manufactura ID: {manufactura.id}")
            print(f"     Cargo: {cargo}\n")
            creados += 1
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}\n")
    
    print("="*70)
    print("RESUMEN")
    print("="*70)
    print(f"  ✅ Registros creados y vinculados: {creados}")
    print("="*70 + "\n")
    
    # Verificación final
    print("Verificación final - Todos los usuarios:")
    print("-"*70)
    
    for grupo_nombre in ['manufacturador', 'instalador', 'Comercial']:
        print(f"\n{grupo_nombre.upper()}:")
        usuarios = User.objects.filter(groups__name=grupo_nombre)
        for user in usuarios:
            if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
                print(f"  ✅ {user.username}: Manufactura ID {user.personal_manufactura.id}")
            else:
                print(f"  ❌ {user.username}: SIN VINCULAR")
    
    print("\n" + "-"*70 + "\n")
    
    print(f"Total registros Manufactura: {Manufactura.objects.count()}")
    print(f"Total usuarios con vinculación: {User.objects.filter(personal_manufactura__isnull=False).count()}")
    print()

if __name__ == '__main__':
    completar_registros_manufactura()
