#!/usr/bin/env python
"""
Script para agregar teléfono de contacto a los clientes existentes.
Uso: python manage.py shell < agregar_telefono_contacto.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from clientes.models import Cliente

# Datos de ejemplo para los clientes
# Puedes modificar estos valores según tus necesidades
datos_clientes = {
    'Cortinas': {
        'telefono_contacto': '+591 700-54321'
    },
    'Test': {
        'telefono_contacto': '+591 700-11111'
    },
    'Roberto Carlos Melgar Dorado': {
        'telefono_contacto': '+591 700-22222'
    },
    'Empresa Regional Paraguay': {
        'telefono_contacto': '+595 61-999777'
    },
    'Distribuidora Nacional Ltda.': {
        'telefono_contacto': '+591 2-3333333'
    },
    'Importaciones Carlos': {
        'telefono_contacto': '+591 76543211'
    },
    'Tienda Local María': {
        'telefono_contacto': '+591 71234568'
    },
    'Empresa Brasil Ltda.': {
        'telefono_contacto': '+55 11-98765433'
    },
    'Distribuidora Paraguay Express': {
        'telefono_contacto': '+595 21-123457'
    },
    'Cliente Individual Juan': {
        'telefono_contacto': '+591 77654322'
    },
    'Comercial XYZ Ltda.': {
        'telefono_contacto': '+591 3-9876544'
    },
    'Empresa ABC S.A.': {
        'telefono_contacto': '+591 2-1234568'
    },
}

def agregar_telefono_contacto():
    """Agrega teléfono de contacto a clientes existentes"""
    
    contador = 0
    for nombre_cliente, datos in datos_clientes.items():
        try:
            # Usar filter para evitar problemas con duplicados
            clientes = Cliente.objects.filter(nombre=nombre_cliente)
            
            if not clientes.exists():
                print(f"❌ Cliente no encontrado: {nombre_cliente}")
                continue
            
            if clientes.count() > 1:
                # Si hay duplicados, actualizar todos
                print(f"⚠️  Múltiples clientes encontrados para: {nombre_cliente} ({clientes.count()})")
                for cliente in clientes:
                    datos_especificos = cliente.datos_especificos or {}
                    datos_especificos['telefono_contacto'] = datos['telefono_contacto']
                    cliente.datos_especificos = datos_especificos
                    cliente.save()
                    print(f"   ✅ ID {cliente.id} actualizado")
                contador += clientes.count()
            else:
                # Un solo cliente
                cliente = clientes.first()
                datos_especificos = cliente.datos_especificos or {}
                datos_especificos['telefono_contacto'] = datos['telefono_contacto']
                cliente.datos_especificos = datos_especificos
                cliente.save()
                print(f"✅ Actualizado: {nombre_cliente}")
                print(f"   Teléfono Contacto: {datos['telefono_contacto']}")
                contador += 1
            
        except Exception as e:
            print(f"❌ Error al actualizar {nombre_cliente}: {str(e)}")
    
    print(f"\n📊 Resumen: {contador} cliente(s) actualizado(s)")

if __name__ == '__main__':
    agregar_telefono_contacto()
