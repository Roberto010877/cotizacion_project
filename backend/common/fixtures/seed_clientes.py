"""
Fixture de datos de prueba para la app Clientes.
Este archivo contiene datos de prueba que se pueden cargar automáticamente.

Uso:
    python common/fixtures/seed_clientes.py
"""

import os
import sys
import django
from pathlib import Path

# Configuración de Django
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from clientes.models import Cliente
from common.models import Pais, TipoDocumentoConfig
from django.contrib.auth import get_user_model

User = get_user_model()

CLIENTES_DATA = [
    {
        "nombre": "Empresa ABC S.A.",
        "numero_documento": "123456789",
        "tipo_documento": "Número de Identificación Tributaria",
        "pais": "BO",
        "email": "contacto@empresaabc.com",
        "telefono": "+591-2-1234567",
        "num_contacto": "+591-71234567",
        "direccion": "Calle Principal 123, La Paz",
        "tipo": "RECURRENTE",
        "origen": "WEB",
    },
    {
        "nombre": "Comercial XYZ Ltda.",
        "numero_documento": "987654321",
        "tipo_documento": "Número de Identificación Tributaria",
        "pais": "BO",
        "email": "ventas@comercialxyz.com",
        "telefono": "+591-3-9876543",
        "num_contacto": "+591-79876543",
        "direccion": "Avenida Comercial 456, Santa Cruz",
        "tipo": "VIP",
        "origen": "RECOMENDACION",
    },
    {
        "nombre": "Cliente Individual Juan",
        "numero_documento": "1234567",
        "tipo_documento": "Cédula de Identidad",
        "pais": "BO",
        "email": "juan@gmail.com",
        "telefono": "+591-77654321",
        "num_contacto": "+591-78654321",
        "direccion": "Calle Secundaria 789, Cochabamba",
        "tipo": "NUEVO",
        "origen": "COLABORADOR",
    },
    {
        "nombre": "Distribuidora Paraguay Express",
        "numero_documento": "1234567-1",
        "tipo_documento": "Registro Único del Contribuyente",
        "pais": "PY",
        "email": "info@distribuitorapy.com",
        "telefono": "+595-21-123456",
        "num_contacto": "+595-971234567",
        "direccion": "Avenida Principal 111, Asunción",
        "tipo": "RECURRENTE",
        "origen": "WEB",
    },
    {
        "nombre": "Empresa Brasil Ltda.",
        "numero_documento": "12345678901",
        "tipo_documento": "Cadastro de Pessoas Físicas",
        "pais": "BR",
        "email": "contato@empresabr.com.br",
        "telefono": "+55-11-98765432",
        "num_contacto": "+55-11-99876543",
        "direccion": "Rua Principal 222, São Paulo",
        "tipo": "VIP",
        "origen": "REDES_SOCIALES",
    },
    {
        "nombre": "Tienda Local María",
        "numero_documento": "2345678",
        "tipo_documento": "Cédula de Identidad",
        "pais": "BO",
        "email": "maria@tiendalocal.com",
        "telefono": "+591-71234567",
        "num_contacto": "+591-72234567",
        "direccion": "Plaza Central 333, Sucre",
        "tipo": "NUEVO",
        "origen": "FERIA",
    },
    {
        "nombre": "Importaciones Carlos",
        "numero_documento": "3456789",
        "tipo_documento": "Cédula de Identidad",
        "pais": "BO",
        "email": "carlos.imp@hotmail.com",
        "telefono": "+591-76543210",
        "num_contacto": "+591-77543210",
        "direccion": "Zona Industrial 555, Santa Cruz",
        "tipo": "VIP",
        "origen": "COLABORADOR",
    },
    {
        "nombre": "Distribuidora Nacional Ltda.",
        "numero_documento": "111222333",
        "tipo_documento": "Número de Identificación Tributaria",
        "pais": "BO",
        "email": "distribucion@nacional.com",
        "telefono": "+591-2-2222222",
        "num_contacto": "+591-72222222",
        "direccion": "Polígono Industrial 666, La Paz",
        "tipo": "NUEVO",
        "origen": "WEB",
    },
    {
        "nombre": "Empresa Regional Paraguay",
        "numero_documento": "2345678-9",
        "tipo_documento": "Registro Único del Contribuyente",
        "pais": "PY",
        "email": "regional@empresapy.com",
        "telefono": "+595-61-999888",
        "num_contacto": "+595-961999888",
        "direccion": "Centro Comercial 777, Encarnación",
        "tipo": "RECURRENTE",
        "origen": "RECOMENDACION",
    },
]

def crear_clientes():
    """Crea clientes de prueba en la base de datos."""
    
    # Obtener usuario admin para auditoría
    admin_user = User.objects.filter(is_superuser=True).first()
    
    print(f"\nCreando {len(CLIENTES_DATA)} clientes de prueba...")
    print("⚠️  NOTA: Si ya existen registros, se crearán nuevos adicionales\n")
    
    creados = 0
    errores = 0
    
    for cliente_data in CLIENTES_DATA:
        try:
            # Obtener país
            pais_codigo = cliente_data.pop('pais')
            pais = Pais.objects.filter(codigo=pais_codigo).first()
            
            if not pais:
                print(f"  ✗ Error: País {pais_codigo} no encontrado para {cliente_data.get('nombre')}")
                errores += 1
                continue
            
            # Obtener tipo de documento
            tipo_doc_nombre = cliente_data.pop('tipo_documento')
            tipo_documento = TipoDocumentoConfig.objects.filter(
                nombre=tipo_doc_nombre,
                pais=pais
            ).first()
            
            if not tipo_documento:
                print(f"  ✗ Error: Tipo documento {tipo_doc_nombre} no encontrado para país {pais_codigo}")
                errores += 1
                continue
            
            # Crear cliente
            cliente = Cliente.objects.create(
                pais=pais,
                tipo_documento=tipo_documento,
                usuario_creacion=admin_user,
                usuario_modificacion=admin_user,
                **cliente_data
            )
            
            print(f"  ✓ Cliente: {cliente.nombre} ({pais_codigo} - {tipo_doc_nombre})")
            creados += 1
            
        except Exception as e:
            print(f"  ✗ Error creando {cliente_data.get('nombre', 'cliente')}: {str(e)}")
            errores += 1
    
    print(f"\n✓ {creados} clientes creados exitosamente")
    if errores > 0:
        print(f"✗ {errores} errores encontrados")
    
    print(f"\nResumen:")
    print(f"  - Total clientes en BD: {Cliente.objects.count()}")
    print(f"  - Clientes activos: {Cliente.objects.filter(is_active=True).count()}")

if __name__ == '__main__':
    crear_clientes()
