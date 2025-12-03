#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.urls import get_resolver
from django.urls.exceptions import Resolver404

def show_all_urls():
    resolver = get_resolver()
    
    # Función recursiva para mostrar todas las rutas
    def show_urls(patterns, prefix=""):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                # Es un include()
                show_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                # Es un path()
                full_pattern = prefix + str(pattern.pattern)
                if 'asignaciones' in str(full_pattern).lower() or 'mis' in str(full_pattern).lower():
                    print(f"  ✓ {full_pattern}")
    
    print("\n🔍 Buscando rutas de asignaciones-tareas y mis-tareas:\n")
    show_urls(resolver.url_patterns)

if __name__ == '__main__':
    show_all_urls()
