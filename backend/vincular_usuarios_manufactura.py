#!/usr/bin/env python
"""
Script para vincular usuarios con sus registros de Manufactura
cuando la relación OneToOne no se estableció correctamente.
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

def vincular_usuarios():
    """Vincula usuarios con sus registros de Manufactura basándose en el email"""
    
    print("\n" + "="*70)
    print("VINCULACIÓN DE USUARIOS CON MANUFACTURA")
    print("="*70 + "\n")
    
    # Obtener todos los usuarios que tienen grupo pero no manufactura vinculada
    usuarios_sin_vincular = User.objects.filter(
        personal_manufactura__isnull=True
    ).exclude(is_superuser=True)
    
    print(f"Usuarios sin vincular: {usuarios_sin_vincular.count()}\n")
    
    vinculados = 0
    no_encontrados = 0
    
    for user in usuarios_sin_vincular:
        print(f"Procesando: {user.username} ({user.email})")
        
        # Buscar registro de Manufactura por email
        try:
            manufactura = Manufactura.objects.get(email=user.email)
            
            # Vincular
            user.personal_manufactura = manufactura
            user.save()
            
            print(f"  ✅ Vinculado con Manufactura ID: {manufactura.id}")
            print(f"     {manufactura.nombre} {manufactura.apellido} - {manufactura.cargo}\n")
            vinculados += 1
            
        except Manufactura.DoesNotExist:
            print(f"  ⚠️  No se encontró registro de Manufactura con email: {user.email}\n")
            no_encontrados += 1
        except Manufactura.MultipleObjectsReturned:
            print(f"  ❌ Múltiples registros con el mismo email: {user.email}\n")
            no_encontrados += 1
    
    print("="*70)
    print("RESUMEN")
    print("="*70)
    print(f"  ✅ Vinculados: {vinculados}")
    print(f"  ⚠️  No encontrados: {no_encontrados}")
    print("="*70 + "\n")
    
    # Verificar resultado
    print("Verificación final:")
    print("-"*70)
    
    manufacturadores = User.objects.filter(groups__name='manufacturador')
    for user in manufacturadores:
        if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
            print(f"  ✅ {user.username}: Manufactura ID {user.personal_manufactura.id}")
        else:
            print(f"  ❌ {user.username}: SIN VINCULAR")
    
    instaladores = User.objects.filter(groups__name='instalador')
    for user in instaladores:
        if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
            print(f"  ✅ {user.username}: Manufactura ID {user.personal_manufactura.id}")
        else:
            print(f"  ❌ {user.username}: SIN VINCULAR")
    
    comerciales = User.objects.filter(groups__name='Comercial')
    for user in comerciales:
        if hasattr(user, 'personal_manufactura') and user.personal_manufactura:
            print(f"  ✅ {user.username}: Manufactura ID {user.personal_manufactura.id}")
        else:
            print(f"  ❌ {user.username}: SIN VINCULAR")
    
    print("-"*70 + "\n")

if __name__ == '__main__':
    vincular_usuarios()
