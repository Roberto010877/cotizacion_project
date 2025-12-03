"""
Script para verificar las URLs de manufactura
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.urls import get_resolver
from rest_framework.routers import DefaultRouter
from manufactura.views import ManufacturaViewSet

# Crear router y verificar URLs
router = DefaultRouter()
router.register(r'manufactura', ManufacturaViewSet, basename='manufactura')

print("\n" + "="*70)
print("URLs GENERADAS POR EL ROUTER DE MANUFACTURA")
print("="*70 + "\n")

for pattern in router.urls:
    print(f"Pattern: {pattern.pattern}")
    print(f"Name: {pattern.name}")
    print(f"Callback: {pattern.callback}")
    print("-"*70)

# Verificar acciones personalizadas
print("\n" + "="*70)
print("ACCIONES PERSONALIZADAS (@action)")
print("="*70 + "\n")

viewset = ManufacturaViewSet()
for name in dir(viewset):
    attr = getattr(viewset, name)
    if hasattr(attr, 'mapping'):
        print(f"✅ {name}")
        if hasattr(attr, 'url_path'):
            print(f"   URL: {attr.url_path}")
        if hasattr(attr, 'url_name'):
            print(f"   Name: {attr.url_name}")
        print()
