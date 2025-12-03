#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group

# Verificar permisos del grupo manufacturador
try:
    grupo = Group.objects.get(name='manufacturador')
    permisos = grupo.permissions.all()
    
    print(f"\n{'='*70}")
    print(f"PERMISOS DEL GRUPO 'manufacturador'")
    print(f"{'='*70}")
    print(f"Total de permisos: {permisos.count()}\n")
    
    for p in permisos:
        print(f"  ✓ {p.content_type.app_label}.{p.codename}")
        print(f"    {p.name}\n")
    
    print(f"{'='*70}\n")
    
    # Verificar permisos específicos de cambio de estado
    print("Permisos de cambio de estado:")
    estados_permisos = [
        'can_change_to_aceptado',
        'can_change_to_en_fabricacion',
        'can_change_to_listo_instalar',
        'can_change_to_rechazado',
    ]
    
    for perm in estados_permisos:
        tiene = permisos.filter(codename=perm).exists()
        status = "✅" if tiene else "❌"
        print(f"  {status} {perm}")
    
    print(f"\n{'='*70}\n")
    
except Group.DoesNotExist:
    print("❌ El grupo 'manufacturador' no existe")
