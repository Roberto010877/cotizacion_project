import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")
django.setup()

from common.models import Pais

# Crear países básicos
paises = [
    {"codigo": "BO", "nombre": "Bolivia", "codigo_telefono": "+591"},
    {"codigo": "PY", "nombre": "Paraguay", "codigo_telefono": "+595"},
    {"codigo": "BR", "nombre": "Brasil", "codigo_telefono": "+55"},
]

for pais_data in paises:
    pais, created = Pais.objects.get_or_create(codigo=pais_data["codigo"], defaults={
        "nombre": pais_data["nombre"],
        "codigo_telefono": pais_data["codigo_telefono"]
    })
    if created:
        print(f"✓ País {pais_data['codigo']} creado")
    else:
        print(f"✓ País {pais_data['código']} ya existe")

print("\nAhora cargando clientes...")
