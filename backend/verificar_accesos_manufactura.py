"""
Script para probar la creación automática de acceso con asignación de grupo
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from manufactura.models import Manufactura
from django.contrib.auth import get_user_model

User = get_user_model()

print("\n" + "="*70)
print("PERSONAL DE MANUFACTURA SIN ACCESO DE USUARIO")
print("="*70 + "\n")

# Buscar personal sin usuario vinculado
sin_acceso = Manufactura.objects.filter(usuario__isnull=True)

if not sin_acceso.exists():
    print("✅ Todo el personal de manufactura tiene acceso de usuario")
else:
    print(f"📋 {sin_acceso.count()} personal(es) sin acceso al sistema:\n")
    
    for personal in sin_acceso:
        print(f"👤 {personal.get_full_name()}")
        print(f"   Cargo: {personal.cargo}")
        print(f"   Email: {personal.email}")
        print(f"   Documento: {personal.documento}")
        print(f"   Estado: {personal.estado}")
        print()

print("\n" + "="*70)
print("PERSONAL CON ACCESO")
print("="*70 + "\n")

con_acceso = Manufactura.objects.filter(usuario__isnull=False).select_related('usuario')

for personal in con_acceso:
    print(f"👤 {personal.get_full_name()} → {personal.usuario.username}")
    print(f"   Cargo: {personal.cargo}")
    print(f"   Grupos: {', '.join([g.name for g in personal.usuario.groups.all()])}")
    print()

print("="*70 + "\n")
